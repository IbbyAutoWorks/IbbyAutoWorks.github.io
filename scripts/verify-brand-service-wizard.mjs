import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const debugPort = 9800 + Math.floor(Math.random() * 300);
const baseUrl = process.env.APP_URL ?? "http://localhost:4200";

function launchBrowser() {
  return spawn(edgePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${process.env.TEMP}/ibbys-auto-edge-cdp-brand-${Date.now()}`
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
    const page = await openPage("/service");
    cdp = createCdpClient(page.webSocketDebuggerUrl);
    await cdp.ready();
    await cdp.command("Page.enable");
    await cdp.command("Runtime.enable");
    await delay(1800);

    const serviceCheck = await evaluate(cdp, `
      (() => {
        const text = document.body.textContent || "";
        const crown = [...document.querySelectorAll(".brand-mark svg path")].map((path) => ({
          fill: path.getAttribute("fill"),
          stroke: path.getAttribute("stroke")
        }));
        return {
          title: document.title,
          hasNewBrand: text.includes("Ibby Auto Works\\u2122"),
          hasOldBrand: text.includes("Ibby's Auto"),
          hasWizard: text.includes("Step") && text.includes("Accept job") && text.includes("Billing"),
          crown,
          crownBaseSeparated: Boolean(document.querySelector('.brand-mark svg path[d^="M17 47"]'))
        };
      })()
    `);

    if (!serviceCheck.hasNewBrand || serviceCheck.hasOldBrand || !serviceCheck.hasWizard || serviceCheck.crown[0]?.fill !== "#fff" || !serviceCheck.crownBaseSeparated) {
      throw new Error(`Brand/service wizard verification failed: ${JSON.stringify(serviceCheck)}`);
    }

    await cdp.command("Page.navigate", { url: `${baseUrl}/request` });
    await delay(1400);
    const loaderCheck = await evaluate(cdp, `
      new Promise((resolve) => {
        const loader = document.querySelector('[data-testid="route-burnout-loader"]');
        window.dispatchEvent(new CustomEvent("ibbys-auto.route-burnout", { detail: { variant: "parts" } }));
        setTimeout(() => resolve({
          hasGear: Boolean(document.querySelector(".workflow-gear")),
          hasLeftRedBox: Boolean(document.querySelector(".workflow-parts .box-one rect")),
          hasWrench: Boolean(document.querySelector(".workflow-loader-wrench")),
          active: loader.classList.contains("active")
        }), 80);
      })
    `);

    if (loaderCheck.hasGear || loaderCheck.hasLeftRedBox || !loaderCheck.hasWrench || !loaderCheck.active) {
      throw new Error(`Parts loader verification failed: ${JSON.stringify(loaderCheck)}`);
    }

    console.log(JSON.stringify({ ok: true, serviceCheck, loaderCheck }, null, 2));
  } finally {
    cdp?.close();
    browser.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
