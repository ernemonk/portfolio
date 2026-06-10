const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3008', { waitUntil: 'networkidle' });
  
  // Scroll to footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  
  // Get all social links
  const links = await page.locator('footer a[target="_blank"]').all();
  
  for (const link of links) {
    const href = await link.getAttribute('href');
    const ariaLabel = await link.getAttribute('aria-label');
    console.log(`✅ ${ariaLabel}: ${href}`);
  }
  
  // Get email link
  const emailLink = await page.locator('footer a[href*="mailto"]');
  const emailHref = await emailLink.getAttribute('href');
  const emailLabel = await emailLink.getAttribute('aria-label');
  console.log(`✅ ${emailLabel}: ${emailHref}`);
  
  await browser.close();
})();
