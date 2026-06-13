import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const debugPort = 9400 + Math.floor(Math.random() * 500);
const baseUrl = process.env.APP_URL ?? "http://localhost:4200";
const customerName = `Admin Tool ${Date.now().toString().slice(-5)}`;

function launchBrowser() {
  return spawn(edgePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${process.env.TEMP}/ibbys-auto-edge-cdp-admin-${Date.now()}`
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
      if (response.ok) {
        return;
      }
    } catch {
      await delay(250);
    }
  }
  throw new Error("Timed out waiting for Edge CDP endpoint.");
}

async function openPage(pathname) {
  const response = await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent(`${baseUrl}${pathname}`)}`, {
    method: "PUT"
  });
  if (!response.ok) {
    throw new Error(`Unable to create CDP page: ${response.status}`);
  }
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
      if (payload.error) {
        reject(new Error(payload.error.message));
      } else {
        resolve(payload.result);
      }
    }
  });

  return {
    async ready() {
      if (ws.readyState === WebSocket.OPEN) {
        return;
      }
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
    const page = await openPage("/admin");
    cdp = createCdpClient(page.webSocketDebuggerUrl);
    await cdp.ready();
    await cdp.command("Page.enable");
    await cdp.command("Runtime.enable");
    await delay(2500);

    const adminCheck = await evaluate(cdp, `
      (async () => {
        localStorage.removeItem("ibbys-auto.work-orders");
        await new Promise((resolve) => setTimeout(resolve, 150));
        [...document.querySelectorAll("button")].find((button) => button.textContent.includes("New work order"))?.click();
        const values = {
          "Customer name": ${JSON.stringify(customerName)},
          "Best phone": "207-555-0199",
          "Year make model": "2021 Subaru Outback",
          "Service location": "35 Lisbon Street, Lewiston ME"
        };
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
        for (const [placeholder, value] of Object.entries(values)) {
          const input = document.querySelector('input[placeholder="' + placeholder + '"]');
          if (!input) throw new Error("Missing admin input " + placeholder);
          setter.call(input, value);
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
        [...document.querySelectorAll("button")].find((button) => button.textContent.includes("Add to board"))?.click();
        await new Promise((resolve) => setTimeout(resolve, 500));
        const partButton = [...document.querySelectorAll("button")].find((button) => button.textContent.includes("Ready to confirm"));
        if (!partButton) throw new Error("Missing part confirmation button.");
        partButton.click();
        await new Promise((resolve) => setTimeout(resolve, 500));
        const orders = JSON.parse(localStorage.getItem("ibbys-auto.work-orders") || "[]");
        const order = orders.find((item) => item.customer === ${JSON.stringify(customerName)});
        return {
          hasOrder: Boolean(order),
          status: order?.status,
          partConfirmed: order?.parts?.some((part) => part.status === "Confirmed"),
          body: document.body.textContent.slice(0, 2000)
        };
      })()
    `);

    if (!adminCheck.hasOrder || adminCheck.status !== "Scheduled" || !adminCheck.partConfirmed) {
      throw new Error(`Admin tool verification failed. ${JSON.stringify(adminCheck)}`);
    }

    await cdp.command("Page.navigate", { url: `${baseUrl}/account` });
    await delay(2000);

    const accountCheck = await evaluate(cdp, `
      (() => ({
        hasCustomer: document.body.textContent.includes(${JSON.stringify(customerName)}),
        hasVehicle: document.body.textContent.includes("2021 Subaru Outback"),
        hasStatus: document.body.textContent.includes("Scheduled"),
        body: document.body.textContent.slice(0, 2000)
      }))()
    `);

    if (!accountCheck.hasCustomer || !accountCheck.hasVehicle || !accountCheck.hasStatus) {
      throw new Error(`Admin-created order did not mirror to account. ${accountCheck.body}`);
    }

    console.log(JSON.stringify({
      ok: true,
      customerName,
      checked: ["admin work order creation", "part confirmation", "account mirror"]
    }, null, 2));
  } finally {
    cdp?.close();
    browser.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
