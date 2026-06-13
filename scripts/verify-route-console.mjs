import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const debugPort = 9336;
const baseUrl = process.env.APP_URL ?? "http://localhost:4200";
const routes = ["/", "/request", "/account", "/account/settings", "/admin", "/admin/new", "/admin/settings", "/service"];

function launchBrowser() {
  return spawn(edgePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${process.env.TEMP}/ibbys-auto-console-cdp-${Date.now()}`
  ], {
    stdio: "ignore",
    detached: false
  });
}

async function waitForCdp() {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`);
      if (response.ok) return;
    } catch {
      await delay(250);
    }
  }
  throw new Error("Timed out waiting for Edge CDP endpoint.");
}

async function openPage(url) {
  const response = await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent(url)}`, {
    method: "PUT"
  });
  if (!response.ok) throw new Error(`Unable to create CDP page: ${response.status}`);
  return response.json();
}

function createCdpClient(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();
  const events = [];

  ws.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);
    if (payload.id && pending.has(payload.id)) {
      const { resolve, reject } = pending.get(payload.id);
      pending.delete(payload.id);
      payload.error ? reject(new Error(payload.error.message)) : resolve(payload.result);
      return;
    }
    if (payload.method) events.push(payload);
  });

  return {
    async ready() {
      if (ws.readyState === WebSocket.OPEN) return;
      await new Promise((resolve, reject) => {
        ws.addEventListener("open", resolve, { once: true });
        ws.addEventListener("error", reject, { once: true });
      });
    },
    command(method, params = {}) {
      const id = nextId++;
      ws.send(JSON.stringify({ id, method, params }));
      return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
    },
    events,
    close() {
      ws.close();
    }
  };
}

async function evaluate(cdp, expression) {
  const result = await cdp.command("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text ?? "Runtime evaluation failed.");
  return result.result.value;
}

async function main() {
  const browser = launchBrowser();
  const failures = [];
  const results = [];

  try {
    await waitForCdp();

    for (const route of routes) {
      const page = await openPage("about:blank");
      const cdp = createCdpClient(page.webSocketDebuggerUrl);

      await cdp.ready();
      await cdp.command("Page.enable");
      await cdp.command("Runtime.enable");
      await cdp.command("Log.enable");
      await cdp.command("Runtime.addBinding", { name: "__ibbysConsoleProbe" }).catch(() => {});
      await cdp.command("Runtime.evaluate", {
        expression: `
          (() => {
            window.__ibbysErrors = [];
            for (const method of ["error", "warn"]) {
              const original = console[method];
              console[method] = (...args) => {
                window.__ibbysErrors.push({ method, message: args.map((arg) => String(arg)).join(" ") });
                original.apply(console, args);
              };
            }
          })()
        `
      });

      await cdp.command("Page.navigate", { url: `${baseUrl}${route}` });
      await delay(1400);
      const snapshot = await evaluate(cdp, `
        (() => ({
          route: location.pathname,
          title: document.title,
          hasNextError: document.body.textContent.includes("Application error") || document.body.textContent.includes("Unhandled Runtime Error"),
          logs: window.__ibbysErrors || []
        }))()
      `);
      const cdpWarnings = cdp.events
        .filter((event) => event.method === "Runtime.consoleAPICalled")
        .map((event) => ({
          method: event.params.type,
          message: (event.params.args ?? []).map((arg) => arg.value ?? arg.description ?? "").join(" ")
        }))
        .filter((log) => log.method === "error" || log.method === "warning");
      snapshot.logs = [...snapshot.logs, ...cdpWarnings];

      results.push(snapshot);
      const routeFailures = snapshot.logs.filter((log) => log.method === "error");
      const duplicateKeyWarnings = snapshot.logs.filter((log) => /same key|encountered two children/i.test(log.message));
      if (snapshot.hasNextError || routeFailures.length > 0 || duplicateKeyWarnings.length > 0) {
        failures.push({ route, hasNextError: snapshot.hasNextError, errors: routeFailures, duplicateKeyWarnings });
      }
      cdp.close();
    }

    if (failures.length > 0) {
      throw new Error(`Route console verification failed: ${JSON.stringify(failures, null, 2)}`);
    }

    console.log(JSON.stringify({ ok: true, routes: results.map((result) => result.route) }, null, 2));
  } finally {
    browser.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
