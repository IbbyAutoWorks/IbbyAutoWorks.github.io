import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const debugPort = 9700 + Math.floor(Math.random() * 300);
const baseUrl = process.env.APP_URL ?? "http://localhost:4200";

function launchBrowser() {
  return spawn(edgePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${process.env.TEMP}/ibbys-auto-edge-cdp-theme-${Date.now()}`
  ], { stdio: "ignore", detached: false });
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

async function openPage(pathname) {
  const response = await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent(`${baseUrl}${pathname}`)}`, { method: "PUT" });
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
  const result = await cdp.command("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text ?? "Runtime evaluation failed.");
  }
  return result.result.value;
}

async function main() {
  const browser = launchBrowser();
  let cdp;

  try {
    await waitForCdp();
    const page = await openPage("/admin/settings");
    cdp = createCdpClient(page.webSocketDebuggerUrl);
    await cdp.ready();
    await cdp.command("Page.enable");
    await cdp.command("Runtime.enable");
    await delay(1600);

    const applied = await evaluate(cdp, `
      (() => {
        localStorage.removeItem("ibbys-auto.theme");
        const select = [...document.querySelectorAll("select")].find((item) => item.value === "Ibby Red");
        if (!select) throw new Error("Palette select missing.");
        const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set;
        setter.call(select, "Performance Blue");
        select.dispatchEvent(new Event("input", { bubbles: true }));
        select.dispatchEvent(new Event("change", { bubbles: true }));
        const styles = getComputedStyle(document.documentElement);
        return {
          primary: styles.getPropertyValue("--red").trim(),
          sidebar: styles.getPropertyValue("--sidebar-bg").trim(),
          saved: localStorage.getItem("ibbys-auto.theme")
        };
      })()
    `);

    if (applied.primary !== "#1d4ed8" || applied.sidebar !== "#0f172a" || !applied.saved?.includes("#1d4ed8")) {
      throw new Error(`Theme did not apply immediately: ${JSON.stringify(applied)}`);
    }

    await cdp.command("Page.navigate", { url: `${baseUrl}/service` });
    await delay(1400);
    const persisted = await evaluate(cdp, `
      (() => {
        const styles = getComputedStyle(document.documentElement);
        return {
          primary: styles.getPropertyValue("--red").trim(),
          sidebar: styles.getPropertyValue("--sidebar-bg").trim()
        };
      })()
    `);

    if (persisted.primary !== "#1d4ed8" || persisted.sidebar !== "#0f172a") {
      throw new Error(`Theme did not persist across routes: ${JSON.stringify(persisted)}`);
    }

    console.log(JSON.stringify({ ok: true, applied, persisted }, null, 2));
  } finally {
    cdp?.close();
    browser.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
