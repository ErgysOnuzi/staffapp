const { chromium } = require('playwright');
const path = require('path');

async function captureScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 }
  });
  const page = await context.newPage();
  
  const outputDir = path.join(__dirname, '..', 'playstore-assets');
  
  try {
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const emailInput = page.locator('input[type="email"], [data-testid="input-email"]').first();
    await emailInput.fill('staff@demo.com');
    
    const passwordInput = page.locator('input[type="password"], [data-testid="input-password"]').first();
    await passwordInput.fill('password123');
    
    const codeInputs = page.locator('input').all();
    const inputs = await codeInputs;
    if (inputs.length >= 3) {
      await inputs[2].fill('DEMO');
    }
    
    await page.locator('button, [role="button"]').filter({ hasText: /log\s*in|sign\s*in/i }).first().click();
    await page.waitForTimeout(3000);
    
    const checkbox = page.locator('input[type="checkbox"], [role="checkbox"]').first();
    if (await checkbox.isVisible().catch(() => false)) {
      const checkboxes = await page.locator('input[type="checkbox"], [role="checkbox"]').all();
      for (const cb of checkboxes) {
        await cb.click().catch(() => {});
      }
      await page.locator('button, [role="button"]').filter({ hasText: /accept|agree|continue/i }).first().click().catch(() => {});
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({ path: path.join(outputDir, 'phone-1-home.png') });
    console.log('Captured: phone-1-home.png');
    
    const scheduleTab = page.locator('[data-testid*="schedule"], [data-testid*="shift"]').first();
    if (await scheduleTab.isVisible().catch(() => false)) {
      await scheduleTab.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(outputDir, 'phone-2-schedule.png') });
      console.log('Captured: phone-2-schedule.png');
    }
    
    const requestsTab = page.locator('[data-testid*="request"]').first();
    if (await requestsTab.isVisible().catch(() => false)) {
      await requestsTab.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(outputDir, 'phone-3-requests.png') });
      console.log('Captured: phone-3-requests.png');
    }
    
    const profileTab = page.locator('[data-testid*="profile"]').first();
    if (await profileTab.isVisible().catch(() => false)) {
      await profileTab.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(outputDir, 'phone-4-profile.png') });
      console.log('Captured: phone-4-profile.png');
    }
    
    console.log('Screenshots captured successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

captureScreenshots();
