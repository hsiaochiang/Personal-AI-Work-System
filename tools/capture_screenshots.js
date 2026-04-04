const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const screenshotDir = path.join(__dirname, '../docs/manual-workspace/screenshots');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

(async () => {
    console.log('Starting screenshot capture...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();

    const baseUrl = 'http://localhost:3000';

    const tasks = [
        { name: 'overview_dashboard', url: '/' },
        { name: 'extract_page_initial', url: '/extract' },
        { name: 'memory_health_overview', url: '/memory' },
        { name: 'decisions_rules_tab', url: '/decisions' },
        { name: 'handoff_builder', url: '/handoff' },
        { name: 'projects_manager', url: '/projects' }
    ];

    for (const task of tasks) {
        console.log(`Capturing ${task.name}...`);
        try {
            await page.goto(`${baseUrl}${task.url}`, { waitUntil: 'networkidle' });
            
            // 特殊處理：如果是 decisions，切換到 rules tab
            if (task.name === 'decisions_rules_tab') {
                await page.click('button:has-text("Rules")');
                await page.waitForTimeout(500);
            }

            await page.screenshot({ path: path.join(screenshotDir, `${task.name}.png`) });
            console.log(`✓ ${task.name} saved.`);
        } catch (err) {
            console.error(`✗ Failed to capture ${task.name}: ${err.message}`);
        }
    }

    await browser.close();
    console.log('All screenshots captured successfully.');
})();
