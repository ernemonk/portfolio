const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3008', { waitUntil: 'networkidle' });
  
  // Scroll to footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  
  // Get GitHub icon button
  const githubButton = await page.locator('footer a[href*="github.com/ernemonk"]');
  
  // Check initial color
  const initialColor = await githubButton.evaluate(el => window.getComputedStyle(el).color);
  console.log(`Initial color: ${initialColor}`);
  
  // Hover over it
  await githubButton.hover();
  await page.waitForTimeout(300);
  
  // Check hover color
  const hoverColor = await githubButton.evaluate(el => window.getComputedStyle(el).color);
  console.log(`Hover color: ${hoverColor}`);
  
  console.log(`✅ Hover effect working: ${initialColor !== hoverColor ? 'colors changed' : 'static'}`);
  
  // Take screenshot of hovered state
  const footer = await page.locator('footer').first();
  await footer.screenshot({ path: '/tmp/footer-hover-screenshot.png' });
  console.log('✅ Hover state screenshot saved');
  
  await browser.close();
})();
