// Visual / UX audit crawler for the portfolio site.
// Usage: node scripts/visual-audit.mjs [baseURL]
//
// - Crawls every internal route reachable from "/"
// - Progressively scrolls each page (lazy-load + animation settle)
// - Captures full-page screenshots
// - Captures targeted interaction screenshots (mobile menu, hovers, filters)
// - Logs console errors, page errors, failed network requests, and CLS

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.argv[2] || "http://localhost:3000";
const OUT_DIR = path.join(__dirname, "..", "audit-output");
const SHOTS_DIR = path.join(OUT_DIR, "screenshots");

// Routes that are auth-gated and just bounce to /portal/login — skip them
// to avoid capturing duplicate redirect screenshots.
const SKIP_PREFIXES = ["/portal/dashboard", "/portal/bio", "/portal/messages", "/portal/work", "/portal/signup"];

fs.mkdirSync(SHOTS_DIR, { recursive: true });

function slugify(pathname) {
  if (pathname === "/") return "home";
  return pathname.replace(/^\/|\/$/g, "").replace(/\//g, "-");
}

async function injectClsObserver(page) {
  await page.addInitScript(() => {
    window.__clsValue = 0;
    window.__clsEntries = [];
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            window.__clsValue += entry.value;
            window.__clsEntries.push({
              value: entry.value,
              time: entry.startTime,
              sources: (entry.sources || []).map((s) => s.node?.nodeName || "unknown"),
            });
          }
        }
      });
      observer.observe({ type: "layout-shift", buffered: true });
    } catch (e) {
      // layout-shift not supported
    }
  });
}

async function progressiveScroll(page, stepPx = 400, pauseMs = 250) {
  await page.evaluate(
    async ({ stepPx, pauseMs }) => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const total = document.body.scrollHeight;
      let scrolled = 0;
      while (scrolled < total) {
        window.scrollBy(0, stepPx);
        scrolled += stepPx;
        await sleep(pauseMs);
      }
      window.scrollTo(0, 0);
      await sleep(pauseMs);
    },
    { stepPx, pauseMs }
  );
}

async function discoverLinks(page, baseURL) {
  return page.evaluate((origin) => {
    return Array.from(document.querySelectorAll("a[href]"))
      .map((a) => a.getAttribute("href"))
      .filter(Boolean)
      .filter((href) => href.startsWith("/") || href.startsWith(origin))
      .map((href) => {
        try {
          const u = new URL(href, origin);
          return u.pathname;
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  }, baseURL);
}

async function auditPage(browser, baseURL, routePath, report) {
  const slug = slugify(routePath);
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const pageReport = {
    route: routePath,
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
    cls: 0,
    clsEntries: [],
    discoveredLinks: [],
  };

  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      pageReport.consoleErrors.push({ type: msg.type(), text: msg.text() });
    }
  });
  page.on("pageerror", (err) => {
    pageReport.pageErrors.push(String(err));
  });
  page.on("requestfailed", (req) => {
    pageReport.failedRequests.push({ url: req.url(), failure: req.failure()?.errorText });
  });
  page.on("response", (res) => {
    if (res.status() >= 400) {
      pageReport.failedRequests.push({ url: res.url(), status: res.status() });
    }
  });

  await injectClsObserver(page);

  const url = new URL(routePath, baseURL).toString();
  await page.goto(url, { waitUntil: "networkidle" });

  // Discover internal links for the crawl frontier
  pageReport.discoveredLinks = await discoverLinks(page, baseURL);

  // Let entrance animations settle
  await page.waitForTimeout(500);

  // Progressive scroll to trigger lazy content / animations
  await progressiveScroll(page);

  // Full-page screenshot of resting state
  await page.screenshot({
    path: path.join(SHOTS_DIR, `current-state-${slug}.png`),
    fullPage: true,
  });

  // Capture CLS accumulated so far
  const cls = await page.evaluate(() => ({
    value: window.__clsValue || 0,
    entries: window.__clsEntries || [],
  }));
  pageReport.cls = cls.value;
  pageReport.clsEntries = cls.entries;

  // --- Interactive states ---

  // Hover state on first "group" / interactive card
  try {
    const hoverTarget = page.locator(".group, [class*='hover:']").first();
    if (await hoverTarget.count()) {
      await hoverTarget.scrollIntoViewIfNeeded();
      await hoverTarget.hover();
      await page.waitForTimeout(400); // allow transition to complete
      await page.screenshot({
        path: path.join(SHOTS_DIR, `hover-state-${slug}.png`),
      });
    }
  } catch {
    /* no hoverable element on this page */
  }

  // Work page: cycle through filter buttons
  if (routePath.replace(/\/$/, "") === "/work") {
    try {
      const filterButtons = page.locator("main button");
      const count = await filterButtons.count();
      for (let i = 0; i < count; i++) {
        const btn = filterButtons.nth(i);
        await btn.click();
        await page.waitForTimeout(300);
        await page.screenshot({
          path: path.join(SHOTS_DIR, `work-filter-${i}-${slug}.png`),
          fullPage: true,
        });
      }
    } catch {
      /* filters not present */
    }
  }

  // Resume page: focus the download button to capture its state
  if (routePath.replace(/\/$/, "") === "/resume") {
    try {
      const dlBtn = page.getByRole("button", { name: /download/i }).first();
      if (await dlBtn.count()) {
        await dlBtn.scrollIntoViewIfNeeded();
        await dlBtn.hover();
        await page.waitForTimeout(300);
        await page.screenshot({
          path: path.join(SHOTS_DIR, `hover-button-${slug}.png`),
        });
      }
    } catch {
      /* no download button */
    }
  }

  // Contact page: focus form fields to capture focus styles
  if (routePath.replace(/\/$/, "") === "/contact") {
    try {
      const firstInput = page.locator("form input").first();
      if (await firstInput.count()) {
        await firstInput.scrollIntoViewIfNeeded();
        await firstInput.click();
        await page.waitForTimeout(200);
        await page.screenshot({
          path: path.join(SHOTS_DIR, `focus-state-${slug}.png`),
        });
      }
    } catch {
      /* no form */
    }
  }

  // Mobile viewport pass: hamburger menu
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(SHOTS_DIR, `mobile-${slug}.png`),
    fullPage: true,
  });

  try {
    const menuBtn = page.getByRole("button", { name: /toggle menu/i });
    if (await menuBtn.count()) {
      await menuBtn.click();
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(SHOTS_DIR, `mobile-menu-open-${slug}.png`),
      });
    }
  } catch {
    /* no mobile menu */
  }

  await context.close();
  report.pages.push(pageReport);
}

async function main() {
  const browser = await chromium.launch();
  const report = { baseURL: BASE_URL, generatedAt: new Date().toISOString(), pages: [] };

  const visited = new Set();
  // Seed with known routes (in addition to whatever the crawl discovers)
  // so pages only linked from the footer/secondary nav aren't missed.
  const queue = ["/", "/about", "/work", "/resume", "/contact", "/privacy", "/portal/login"];

  while (queue.length) {
    const routePath = queue.shift();
    const normalized = routePath.replace(/\/$/, "") || "/";
    if (visited.has(normalized)) continue;
    if (SKIP_PREFIXES.some((p) => normalized.startsWith(p))) continue;
    if (normalized.startsWith("/api")) continue;
    visited.add(normalized);

    console.log(`Auditing ${normalized} ...`);
    try {
      await auditPage(browser, BASE_URL, normalized, report);
      const last = report.pages[report.pages.length - 1];
      for (const link of last.discoveredLinks) {
        const n = link.replace(/\/$/, "") || "/";
        if (!visited.has(n) && !queue.includes(n)) queue.push(n);
      }
    } catch (err) {
      console.error(`  Failed: ${err.message}`);
      report.pages.push({ route: normalized, error: String(err) });
    }
  }

  await browser.close();

  fs.writeFileSync(path.join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2));
  console.log(`\nDone. Screenshots in ${SHOTS_DIR}`);
  console.log(`Report written to ${path.join(OUT_DIR, "report.json")}`);
}

main();
