const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

(async () => {
  const svg = fs.readFileSync(path.join(__dirname, "..", "app", "icon.svg"), "utf8");
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });

  // Render at a few sizes for visual QA + the apple-icon asset.
  const sizes = [
    { size: 180, out: path.join(__dirname, "..", "app", "apple-icon.png") },
    { size: 32, out: path.join(__dirname, "..", "audit-output", "favicon-32.png") },
    { size: 16, out: path.join(__dirname, "..", "audit-output", "favicon-16.png") },
  ];

  for (const { size, out } of sizes) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(
      `<html><body style="margin:0">${svg.replace(
        /width="64" height="64"/,
        `width="${size}" height="${size}"`
      )}</body></html>`
    );
    const el = await page.$("svg");
    await el.screenshot({ path: out, omitBackground: true });
    console.log("wrote", out);
  }

  await browser.close();
})();
