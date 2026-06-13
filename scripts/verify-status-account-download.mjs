import { spawn } from "node:child_process";
import { mkdir, readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const debugPort = 9334;
const baseUrl = process.env.APP_URL ?? "http://localhost:4200";
const downloadDir = join(process.env.TEMP ?? ".", `ibbys-auto-download-${Date.now()}`);
const customerName = `Status Test ${Date.now().toString().slice(-5)}`;

function launchBrowser() {
  return spawn(edgePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${process.env.TEMP}/ibbys-auto-edge-cdp-status-${Date.now()}`
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
  await mkdir(downloadDir, { recursive: true });
  const browser = launchBrowser();
  let cdp;

  try {
    await waitForCdp();
    const page = await openPage("/request");
    cdp = createCdpClient(page.webSocketDebuggerUrl);
    await cdp.ready();
    await cdp.command("Page.enable");
    await cdp.command("Runtime.enable");
    await cdp.command("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: downloadDir });
    await delay(2500);

    await evaluate(cdp, `
      (() => {
        localStorage.removeItem("ibbys-auto.work-orders");
        const values = {
          "Customer name": ${JSON.stringify(customerName)},
          "Best phone number": "207-555-0188",
          "Street, town, state": "22 Main Street, Lewiston ME",
          "Email for updates and PDFs": "status-test@example.com",
          "17-character VIN": "1FTRF18W1XNA00001",
          "Plate number": "STAT5",
          "Current mileage": "88442"
        };
        const inputSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
        const textareaSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set;
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
          inputSetter.call(input, value);
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
        chooseSelect("Vehicle year", "2021");
        chooseSelect("Vehicle make", "Ford");
        chooseSelect("Vehicle model", "F-150");
        const notes = document.querySelector("textarea");
        textareaSetter.call(notes, "Customer wants brakes checked and appointment confirmation.");
        notes.dispatchEvent(new Event("input", { bubbles: true }));
        notes.dispatchEvent(new Event("change", { bubbles: true }));
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
    await delay(2500);

    const adminStatus = await evaluate(cdp, `
      (() => {
        const scheduled = [...document.querySelectorAll("button")].find((button) => button.textContent.trim() === "Scheduled");
        if (!scheduled) throw new Error("Missing Scheduled status button.");
        scheduled.click();
        return document.body.textContent.includes(${JSON.stringify(customerName)});
      })()
    `);

    if (!adminStatus) {
      throw new Error("Submitted request was not visible in admin before status change.");
    }

    await delay(800);
    await cdp.command("Page.navigate", { url: `${baseUrl}/account` });
    await delay(2500);

    const accountCheck = await evaluate(cdp, `
      (() => {
        const body = document.body.textContent;
        const download = [...document.querySelectorAll("button")].find((button) => button.getAttribute("aria-label")?.includes("Download report"));
        if (!download) throw new Error("Missing customer report download button.");
        download.click();
        return {
          hasCustomer: body.includes(${JSON.stringify(customerName)}),
          hasVehicle: body.includes("2016 Ford F-150"),
          hasStatus: body.includes("Scheduled"),
          body: body.slice(0, 2000)
        };
      })()
    `);

    if (!accountCheck.hasCustomer || !accountCheck.hasVehicle || !accountCheck.hasStatus) {
      throw new Error(`Account mirror failed. Account text sample: ${accountCheck.body}`);
    }

    await delay(1200);
    const downloads = await readdir(downloadDir);
    const reportFile = downloads.find((file) => file.startsWith("ibbys-auto-work-order-") && file.endsWith(".html"));
    if (!reportFile) {
      throw new Error(`Report download failed. Files: ${downloads.join(", ")}`);
    }

    console.log(JSON.stringify({
      ok: true,
      customerName,
      status: "Scheduled",
      downloaded: reportFile,
      checkedRoutes: [`${baseUrl}/request`, `${baseUrl}/admin`, `${baseUrl}/account`]
    }, null, 2));
  } finally {
    cdp?.close();
    browser.kill();
    await rm(downloadDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
