import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotsDir = path.resolve(__dirname, '../../screenshots');
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
}

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });

    // 1. Landing Page
    console.log('Capturing Landing Page...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(screenshotsDir, 'landing_page.png') });

    // 2. Login Page
    console.log('Capturing Login Page...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(screenshotsDir, 'login_page.png') });

    // 3. Signup Page
    console.log('Capturing Signup Page...');
    await page.goto('http://localhost:5173/signup', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(screenshotsDir, 'signup_page.png') });

    await browser.close();
    console.log('Screenshots captured successfully!');
})();
