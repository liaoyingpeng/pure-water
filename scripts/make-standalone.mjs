import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const builtHtml = await readFile(resolve(root, "dist/dev.html"), "utf8");
const cssPath = builtHtml.match(/href="([^"]+\.css)"/)?.[1];
const jsPath = builtHtml.match(/src="([^"]+\.js)"/)?.[1];
if (!cssPath || !jsPath) throw new Error("找不到建置後的資源檔案");

const [css, js] = await Promise.all([
  readFile(resolve(root, "dist", cssPath.replace(/^\//, "")), "utf8"),
  readFile(resolve(root, "dist", jsPath.replace(/^\//, "")), "utf8"),
]);
const standalone = `<!doctype html><html lang="zh-Hant"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#122d28"><title>水利淨節能管理系統</title><style>${css}</style></head><body><div id="root"></div><script type="module">${js.replaceAll("</script>", "<\\/script>")}</script></body></html>`;
await Promise.all([
  writeFile(resolve(root, "index.html"), standalone),
  writeFile(resolve(root, "customer.html"), standalone),
  writeFile(resolve(root, "maintenance.html"), standalone),
]);
console.log("已產生 index.html、customer.html、maintenance.html 三個單檔入口");
