const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const variants = {
  // A — refined EM. monogram
  emDot: `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.5" y="0.5" width="63" height="63" rx="14" fill="#070B14"/>
    <rect x="0.5" y="0.5" width="63" height="63" rx="14" stroke="#FFFFFF" stroke-opacity="0.08"/>
    <text x="28" y="43" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="27" font-weight="700" letter-spacing="-1" fill="#F8FAFC">EM</text>
    <circle cx="51" cy="41.5" r="3.6" fill="#6366F1"/>
  </svg>`,
  // B — single E. mark
  eDot: `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.5" y="0.5" width="63" height="63" rx="14" fill="#070B14"/>
    <rect x="0.5" y="0.5" width="63" height="63" rx="14" stroke="#FFFFFF" stroke-opacity="0.08"/>
    <text x="22" y="45" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="36" font-weight="700" fill="#F8FAFC">E</text>
    <circle cx="44" cy="42" r="5" fill="#6366F1"/>
  </svg>`,
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  const sizes = [16, 32, 64];

  for (const [name, svg] of Object.entries(variants)) {
    for (const size of sizes) {
      await page.setViewportSize({ width: size, height: size });
      await page.setContent(
        `<html><body style="margin:0">${svg.replace(
          /width="64" height="64"/,
          `width="${size}" height="${size}"`
        )}</body></html>`
      );
      const el = await page.$("svg");
      const out = path.join(__dirname, "..", "audit-output", `var-${name}-${size}.png`);
      await el.screenshot({ path: out, omitBackground: true });
    }
  }
  await browser.close();
  console.log("done");
})();
