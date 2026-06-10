const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3008', { waitUntil: 'networkidle' });
  
  // Scroll to footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  
  // Take screenshot of footer area
  const footer = await page.locator('footer').first();
  await footer.screenshot({ path: '/tmp/footer-screenshot.png' });
  
  console.log('✅ Footer screenshot saved');
  
  // Check if SVG icons are present
  const svgCount = await page.locator('footer svg').count();
  console.log(`✅ Found ${svgCount} SVG icons in footer`);
  
  // Check social links
  const githubLink = await page.locator('footer a[href*="github.com/ernemonk"]').count();
  const linkedinLink = await page.locator('footer a[href*="linkedin.com"]').count();
  const emailLink = await page.locator('footer a[href*="erne.monge.s@gmail.com"]').count();
  
  console.log(`✅ GitHub link found: ${githubLink > 0 ? 'yes' : 'no'}`);
  console.log(`✅ LinkedIn link found: ${linkedinLink > 0 ? 'yes' : 'no'}`);
  console.log(`✅ Email link (erne.monge.s@gmail.com) found: ${emailLink > 0 ? 'yes' : 'no'}`);
  
  await browser.close();
})();
