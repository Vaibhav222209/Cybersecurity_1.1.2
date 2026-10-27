import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

const systemChromium = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  retries: 0,
  timeout: 30_000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
    launchOptions: { executablePath: systemChromium, args: ['--no-sandbox'] },
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5173 --strictPort',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
