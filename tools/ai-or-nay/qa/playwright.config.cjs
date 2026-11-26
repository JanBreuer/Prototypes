const { defineConfig } = require('@playwright/test');
const path = require('node:path');
module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: true,
  workers: 2,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:8765', viewport: { width: 1440, height: 900 }, trace: 'retain-on-failure', screenshot: 'only-on-failure', acceptDownloads: true },
  webServer: { command: 'python3 -m http.server 8765 --bind 127.0.0.1', cwd: path.resolve(__dirname, '../../..'), url: 'http://127.0.0.1:8765/tools/ai-or-nay/', reuseExistingServer: false },
});
