import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para pruebas contra el contenedor Docker
 */
export default defineConfig({
  testDir: './tests/e2e-docker',
  fullyParallel: false,
  workers: 1, // Ejecución secuencial y determinista para evitar colisiones de estado
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 30000,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'chromium-docker',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
