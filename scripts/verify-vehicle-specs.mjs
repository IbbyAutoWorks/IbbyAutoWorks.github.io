import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const debugPort = 9500 + Math.floor(Math.random() * 400);
const baseUrl = process.env.APP_URL ?? "http://localhost:4200";
const customerName = `Vehicle Spec ${Date.now().toString().slice(-5)}`;

function launchBrowser() {
  return spawn(edgePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${process.env.TEMP}/ibbys-auto-edge-cdp-vehicle-${Date.now()}`
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
    const page = await openPage("/request");
    cdp = createCdpClient(page.webSocketDebuggerUrl);
    await cdp.ready();
    await cdp.command("Page.enable");
    await cdp.command("Runtime.enable");
    await delay(2500);

    await evaluate(cdp, `
      (() => {
        localStorage.removeItem("ibbys-auto.work-orders");
        const values = {
          "Customer name": ${JSON.stringify(customerName)},
          "Best phone number": "207-555-0166",
          "Street, town, state": "8 Court Street, Auburn ME",
          "Email for updates and PDFs": "vehicle-spec@example.com",
          "17-character VIN": "TESTVINPICKER0001",
          "Plate number": "SPEC",
          "Current mileage": "44120"
        };
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
        const selectSetter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set;
        function chooseSelect(label, value) {
          const field = [...document.querySelectorAll("label")].find((item) => item.textContent.includes(label));
          const select = field?.querySelector("select");
          if (!select) throw new Error("Missing select " + label);
          selectSetter.call(select, value);
          select.dispatchEvent(new Event("input", { bubbles: true }));
          select.dispatchEvent(new Event("change", { bubbles: true }));
        }
        for (const [placeholder, value] of Object.entries(values)) {
          const input = document.querySelector('input[placeholder="' + placeholder + '"]');
          if (!input) throw new Error("Missing input " + placeholder);
          setter.call(input, value);
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
        chooseSelect("Vehicle year", "2021");
        chooseSelect("Vehicle make", "Subaru");
        chooseSelect("Vehicle model", "Outback");
        document.querySelectorAll('input[data-agreement="required"]').forEach((input) => {
          input.checked = true;
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        });
        [...document.querySelectorAll("button")].find((button) => button.textContent.includes("Submit request to admin"))?.click();
        return JSON.parse(localStorage.getItem("ibbys-auto.work-orders") || "[]")[0]?.vehicleSpec?.wheelTorque;
      })()
    `);

    await delay(800);
    await cdp.command("Page.navigate", { url: `${baseUrl}/admin` });
    await delay(2500);

    const adminSpec = await evaluate(cdp, `
      (() => {
        const body = document.body.textContent;
        const specImage = document.querySelector(".spec-sheet img");
        return {
          hasCustomer: body.includes(${JSON.stringify(customerName)}),
          hasVehicle: body.includes("2021 Subaru Outback"),
          hasTorque: body.includes("89 ft-lb"),
          hasOil: body.includes("4.4-4.8 qt"),
          hasImage: Boolean(specImage?.getAttribute("src")),
          body: body.slice(0, 2400)
        };
      })()
    `);

    if (!adminSpec.hasCustomer || !adminSpec.hasVehicle || !adminSpec.hasTorque || !adminSpec.hasOil || !adminSpec.hasImage) {
      throw new Error(`Vehicle spec verification failed. ${JSON.stringify(adminSpec)}`);
    }

    console.log(JSON.stringify({
      ok: true,
      customerName,
      checked: ["vehicle catalog image card", "work-order vehicle spec attachment", "admin torque/fluid spec sheet"]
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
