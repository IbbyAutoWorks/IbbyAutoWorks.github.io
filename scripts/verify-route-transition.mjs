import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const debugPort = 9334;
const baseUrl = process.env.APP_URL ?? "http://localhost:4200";

function launchBrowser() {
  return spawn(edgePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${process.env.TEMP}/ibbys-auto-transition-cdp-${Date.now()}`
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

async function openPage() {
  const response = await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent(baseUrl)}`, {
    method: "PUT"
  });
  if (!response.ok) throw new Error(`Unable to create CDP page: ${response.status}`);
  return response.json();
}

function createCdpClient(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();

  ws.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);
    if (payload.id && pending.has(payload.id)) {
      const { resolve, reject } = pending.get(payload.id);
      pending.delete(payload.id);
      payload.error ? reject(new Error(payload.error.message)) : resolve(payload.result);
    }
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
  let cdp;
  try {
    await waitForCdp();
    const page = await openPage();
    cdp = createCdpClient(page.webSocketDebuggerUrl);
    await cdp.ready();
    await cdp.command("Page.enable");
    await cdp.command("Runtime.enable");
    await delay(2000);

    const sawLoader = await evaluate(cdp, `
      new Promise((resolve) => {
        const link = Array.from(document.querySelectorAll("a")).find((item) => item.textContent.trim() === "Admin");
        if (!link) throw new Error("Admin nav link missing.");
        let seen = false;
        const loader = document.querySelector('[data-testid="route-burnout-loader"]');
        const observer = new MutationObserver(() => {
          if (loader.classList.contains("active")) seen = true;
        });
        observer.observe(loader, { attributes: true, attributeFilter: ["class"] });
        link.click();
        setTimeout(() => {
          observer.disconnect();
          resolve({
            seen,
            url: location.href,
            loaderClass: loader.className,
            hasAdminText: document.body.textContent.includes("Operations command center")
          });
        }, 900);
      })
    `);

    if (!sawLoader.seen || !sawLoader.hasAdminText) {
      throw new Error(`Route transition verification failed: ${JSON.stringify(sawLoader)}`);
    }

    const routeChecks = [];
    for (const pathname of ["/", "/request", "/account", "/account/settings", "/admin", "/admin/settings", "/service"]) {
      await cdp.command("Page.navigate", { url: `${baseUrl}${pathname}` });
      await delay(1400);
      const check = await evaluate(cdp, `
        new Promise((resolve) => {
          const loader = document.querySelector('[data-testid="route-burnout-loader"]');
          if (!loader) throw new Error("Route loader missing on ${pathname}.");
          window.dispatchEvent(new CustomEvent("ibbys-auto.route-burnout"));
          setTimeout(() => {
            const activeAfterThreeSeconds = loader.classList.contains("active");
            setTimeout(() => resolve({
              pathname: ${JSON.stringify(pathname)},
              activeAfterThreeSeconds,
              inactiveAfterCompletion: !loader.classList.contains("active")
            }), 520);
          }, 3050);
        })
      `);
      routeChecks.push(check);
      if (!check.activeAfterThreeSeconds || !check.inactiveAfterCompletion) {
        throw new Error(`Loader duration verification failed: ${JSON.stringify(check)}`);
      }
    }

    console.log(JSON.stringify({ ok: true, routeTransition: sawLoader, routeChecks }, null, 2));
  } finally {
    cdp?.close();
    browser.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
