import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const debugPort = 9600 + Math.floor(Math.random() * 300);
const baseUrl = process.env.APP_URL ?? "http://localhost:4200";
const customerName = `Service Portal ${Date.now().toString().slice(-5)}`;

function launchBrowser() {
  return spawn(edgePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${process.env.TEMP}/ibbys-auto-edge-cdp-service-${Date.now()}`
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
          "Best phone number": "207-555-0100",
          "Street, town, state": "55 Center Street, Auburn ME",
          "Email for updates and PDFs": "service-portal@example.com",
          "17-character VIN": "SERVICEPORTALVIN1",
          "Plate number": "TECH",
          "Current mileage": "77510"
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
          const inputs = [...document.querySelectorAll('input[placeholder="' + placeholder + '"]')];
          for (const input of inputs) {
            setter.call(input, value);
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }
        chooseSelect("Vehicle year", "2021");
        chooseSelect("Vehicle make", "Subaru");
        chooseSelect("Vehicle model", "Outback");
        chooseSelect("Inspection month", "July");
        chooseSelect("Inspection year", "2026");
        document.querySelectorAll('input[data-agreement="required"]').forEach((input) => {
          input.checked = true;
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        });
        [...document.querySelectorAll("button")].find((button) => button.textContent.includes("Submit request to admin"))?.click();
      })()
    `);

    await delay(800);
    await cdp.command("Page.navigate", { url: `${baseUrl}/admin` });
    await delay(2000);
    await evaluate(cdp, `
      (() => {
        const accepted = [...document.querySelectorAll("button")].find((button) => button.textContent.trim() === "Accepted");
        if (!accepted) throw new Error("Missing Accepted button.");
        accepted.click();
      })()
    `);

    await delay(800);
    await cdp.command("Page.navigate", { url: `${baseUrl}/service` });
    await delay(2000);
    await evaluate(cdp, `
      (() => {
        const acceptedJob = [...document.querySelectorAll("button")].find((button) => button.textContent.includes(${JSON.stringify(customerName)}));
        if (!acceptedJob) throw new Error("Accepted job was not listed on the service accept step.");
        acceptedJob.click();
      })()
    `);

    await delay(800);
    await evaluate(cdp, `
      (() => {
        const text = document.body.textContent;
        if (!text.includes("Open route") || !text.includes("Call customer") || !text.includes("Notify customer on my way")) {
          throw new Error("Drive step missing route, call, or notify controls.");
        }
        if (!document.querySelector(".service-map-frame")) throw new Error("Drive step missing map frame.");
        [...document.querySelectorAll("button")].find((button) => button.textContent.includes("Notify customer on my way"))?.click();
      })()
    `);

    await delay(800);
    await evaluate(cdp, `
      (() => {
        if (!document.body.textContent.includes("Exterior, controls, lighting, tires, and jack points") || !document.body.textContent.includes("Under-hood checks before work starts")) {
          throw new Error("Walkaround step missing exterior or under-hood checklist groups.");
        }
        if (!document.body.textContent.includes("Windshield cracks") || !document.body.textContent.includes("Engine air filter condition")) {
          throw new Error("Walkaround step missing requested checklist items.");
        }
        const red = document.querySelector('button[aria-label="service Engine air filter condition red"]');
        if (!red) throw new Error("Missing service condition matrix red control.");
        red.click();
        const measurement = [...document.querySelectorAll('input[placeholder="6/32"]')][0];
        const psi = [...document.querySelectorAll('input[placeholder="35"]')][0];
        const frontRotor = [...document.querySelectorAll('input[placeholder="28 mm"]')][0];
        const inputSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
        inputSetter.call(measurement, "5/32");
        measurement.dispatchEvent(new Event("input", { bubbles: true }));
        measurement.dispatchEvent(new Event("change", { bubbles: true }));
        inputSetter.call(psi, "34");
        psi.dispatchEvent(new Event("input", { bubbles: true }));
        psi.dispatchEvent(new Event("change", { bubbles: true }));
        inputSetter.call(frontRotor, "27.5 mm");
        frontRotor.dispatchEvent(new Event("input", { bubbles: true }));
        frontRotor.dispatchEvent(new Event("change", { bubbles: true }));
        [...document.querySelectorAll("button")].find((button) => button.textContent.trim() === "Next step")?.click();
      })()
    `);

    await delay(800);
    await evaluate(cdp, `
      (() => {
        if (!document.body.textContent.includes("Lifted under-vehicle inspection") || !document.body.textContent.includes("Control arms and bushings")) {
          throw new Error("Pre-inspect step missing lifted under-vehicle checks.");
        }
        [...document.querySelectorAll("button")].find((button) => button.textContent.trim() === "Next step")?.click();
      })()
    `);

    await delay(800);
    const techRequest = await evaluate(cdp, `
      (() => {
        const partInput = document.querySelector('input[placeholder="Part needed after inspection"]');
        const reason = document.querySelector('textarea[placeholder="Why it is needed, what changed, or what failed visual inspection"]');
        if (!partInput || !reason) throw new Error("Parts step missing added part request fields.");
        const inputSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
        const textSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set;
        inputSetter.call(partInput, "Lower control arm");
        partInput.dispatchEvent(new Event("input", { bubbles: true }));
        textSetter.call(reason, "Ball joint boot torn during walkaround.");
        reason.dispatchEvent(new Event("input", { bubbles: true }));
        [...document.querySelectorAll("button")].find((button) => button.textContent.includes("Send request to admin"))?.click();
        const order = JSON.parse(localStorage.getItem("ibbys-auto.work-orders") || "[]")[0];
        return document.body.textContent.includes("Lower control arm") &&
          order.inspection.some((item) => item.label === "Engine air filter condition" && item.state === "red") &&
          order.measurements.lfTread === "5/32" &&
          order.measurements.lfPsi === "34" &&
          order.measurements.frontRotorThickness === "27.5 mm";
      })()
    `);
    if (!techRequest) throw new Error("Tech part request did not appear in service portal.");

    await delay(800);
    await cdp.command("Page.navigate", { url: `${baseUrl}/admin` });
    await delay(2000);
    const adminOrdered = await evaluate(cdp, `
      (() => {
        const ordered = [...document.querySelectorAll("button")].find((button) => button.textContent.trim() === "Ordered");
        if (!ordered) throw new Error("Missing Ordered button.");
        ordered.click();
        return document.body.textContent.includes("Lower control arm");
      })()
    `);
    if (!adminOrdered) throw new Error("Admin could not see tech part request.");

    await delay(800);
    await cdp.command("Page.navigate", { url: `${baseUrl}/service` });
    await delay(2000);
    const techSeesUpdate = await evaluate(cdp, `
      (() => ({
        hasPart: document.body.textContent.includes("Lower control arm"),
        hasWait: document.body.textContent.includes("30-60 min"),
        hasOrdered: document.body.textContent.includes("Ordered"),
        body: document.body.textContent.slice(0, 2400)
      }))()
    `);

    if (!techSeesUpdate.hasPart || !techSeesUpdate.hasWait || !techSeesUpdate.hasOrdered) {
      throw new Error(`Service portal did not see admin part update. ${JSON.stringify(techSeesUpdate)}`);
    }

    console.log(JSON.stringify({ ok: true, customerName, checked: ["admin accept", "tech part request", "admin ordered", "tech sees wait time"] }, null, 2));
  } finally {
    cdp?.close();
    browser.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
