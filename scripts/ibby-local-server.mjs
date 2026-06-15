import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = fileURLToPath(new URL("..", import.meta.url));
const root = existsSync(join(appRoot, "out", "index.html")) ? join(appRoot, "out") : join(appRoot, "next-live");
const port = Number(process.env.PORT || 4200);
const host = process.env.HOST || "0.0.0.0";

const types = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"]
]);

function candidatePaths(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split("?")[0])).replace(/^([.][.][\\/])+/, "").replace(/^\\|^\//, "");
  const direct = join(root, clean || "index.html");
  const base = clean.endsWith("/") ? clean.slice(0, -1) : clean;
  return [direct, join(root, base, "index.html"), join(root, `${base}.html`), join(root, "404.html"), join(root, "index.html")];
}

const server = createServer((req, res) => {
  const target = candidatePaths(req.url || "/").find((file) => existsSync(file) && statSync(file).isFile());
  if (!target) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }
  res.writeHead(target.endsWith("404.html") ? 404 : 200, {
    "content-type": types.get(extname(target).toLowerCase()) || "application/octet-stream",
    "cache-control": target.includes("/_next/static/") ? "public, max-age=31536000, immutable" : "no-store"
  });
  createReadStream(target).pipe(res);
});

server.listen(port, host, () => {
  console.log(`Ibby Auto Works local static server listening on http://${host}:${port}`);
  console.log(`Serving ${root}`);
});
