import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const debugPort = 9335;
const baseUrl = process.env.APP_URL ?? "http://localhost:4200";
const loaderRoutes = ["/request", "/admin/new"];
const expectedSteps = [
  { button: "Next: Vehicle", className: "loader-burnout", text: "Loading the next bay" },
  { button: "Next: Services", className: "loader-lift", text: "Raising the vehicle" },
  { button: "Next: Parts grade", className: "loader-parts", text: "Checking parts grades" },
  { button: "Next: Appointment", className: "loader-calendar", text: "Finding the appointment window" },
  { button: "Next: Preferences", className: "loader-preferences", text: "Setting service preferences" },
  { button: "Next: Agreements", className: "loader-signature", text: "Preparing agreements" },
  { button: "Next: Review", className: "loader-review", text: "Reviewing the work order" }
];

function launchBrowser() {
  return spawn(edgePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${process.env.TEMP}/ibbys-auto-request-loaders-cdp-${Date.now()}`
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
  try {
    await waitForCdp();
    const routeResults = [];

    for (const route of loaderRoutes) {
      const page = await openPage(`${baseUrl}${route}`);
      const cdp = createCdpClient(page.webSocketDebuggerUrl);
      await cdp.ready();
      await cdp.command("Page.enable");
      await cdp.command("Runtime.enable");
      await delay(350);

      const initialLoader = await evaluate(cdp, `
        (() => {
          const loader = document.querySelector('[data-testid="route-burnout-loader"]');
          const stage = loader?.querySelector('.burnout-stage, .workflow-loader-stage');
          const loaderBox = loader?.getBoundingClientRect();
          const stageBox = stage?.getBoundingClientRect();
          return {
            className: loader?.className ?? "",
            text: loader?.textContent ?? "",
            centered: Boolean(loaderBox && stageBox && Math.abs((stageBox.left + stageBox.width / 2) - (loaderBox.left + loaderBox.width / 2)) < 8 && Math.abs((stageBox.top + stageBox.height / 2) - (loaderBox.top + loaderBox.height / 2)) < 8)
          };
        })()
      `);

      if (!initialLoader.className.includes("loader-clipboard") || !initialLoader.text.includes("Writing up the request") || !initialLoader.centered) {
        throw new Error(`Initial loader mismatch on ${route}: ${JSON.stringify(initialLoader)}`);
      }

      await delay(3200);
      const stepResults = [];
      for (const step of expectedSteps) {
        const result = await evaluate(cdp, `
          new Promise((resolve) => {
            const button = Array.from(document.querySelectorAll("button")).find((item) => item.textContent.trim() === ${JSON.stringify(step.button)});
            if (!button) throw new Error(${JSON.stringify(`${step.button} button missing.`)});
            const loader = document.querySelector('[data-testid="route-burnout-loader"]');
            button.click();
            setTimeout(() => {
              const stage = loader?.querySelector('.burnout-stage, .workflow-loader-stage');
              const loaderBox = loader?.getBoundingClientRect();
              const stageBox = stage?.getBoundingClientRect();
              resolve({
                route: ${JSON.stringify(route)},
                button: ${JSON.stringify(step.button)},
                className: loader?.className ?? "",
                text: loader?.textContent ?? "",
                centered: Boolean(loaderBox && stageBox && Math.abs((stageBox.left + stageBox.width / 2) - (loaderBox.left + loaderBox.width / 2)) < 8 && Math.abs((stageBox.top + stageBox.height / 2) - (loaderBox.top + loaderBox.height / 2)) < 8)
              });
            }, 180);
          })
        `);

        if (!result.className.includes(step.className) || !result.text.includes(step.text) || !result.centered) {
          throw new Error(`Loader mismatch for ${step.button} on ${route}: ${JSON.stringify(result)}`);
        }
        stepResults.push(result);
        await delay(850);
      }
      routeResults.push({ route, initialLoader, stepResults });
      cdp.close();
    }

    console.log(JSON.stringify({ ok: true, routeResults }, null, 2));
  } finally {
    browser.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
