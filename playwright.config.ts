import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/e2e', timeout:90000, fullyParallel:false,
  use:{baseURL:'http://127.0.0.1:4173',trace:'retain-on-failure'},
  projects:[
    {name:'desktop',use:{...devices['Desktop Chrome'],channel:'msedge'}},
    {name:'mobile',use:{...devices['iPhone 13'],defaultBrowserType:'chromium',channel:'msedge'}}
  ],
  webServer:{command:'npm run dev -- --port 4173 --strictPort',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI},
  reporter:'list'
});
