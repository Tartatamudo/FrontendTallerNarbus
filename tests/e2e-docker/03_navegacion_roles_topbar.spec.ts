import { test, expect } from '@playwright/test';
import { setupMockApi, injectSession } from './fixtures/mockApi';
import { MOCK_USERS } from './fixtures/mockData';

test.describe('Navegación Dinámica por Roles y TopBar', () => {
  test('TopBar: Conmutación de Modo Claro y Modo Oscuro persiste en el DOM', async ({ page }) => {
    await setupMockApi(page, { currentUser: MOCK_USERS.conductor });
    await injectSession(page, MOCK_USERS.conductor);

    await page.goto('/home');
    await expect(page.locator('.topbar-brand h2')).toHaveText('NARBUS');

    const toggleBtn = page.locator('button.topbar-theme-toggle');
    await expect(toggleBtn).toBeVisible();

    // Obtener tema inicial
    const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));

    // Cambiar tema
    await toggleBtn.click();
    const newTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(newTheme).not.toBe(initialTheme);

    // Cambiar de nuevo
    await toggleBtn.click();
    const revertedTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(revertedTheme).toBe(initialTheme);
  });

  test('Rol CONDUCTOR: Ve módulos de mantención y neumáticos, pero NO mecánico ni supervisión', async ({ page }) => {
    await setupMockApi(page, { currentUser: MOCK_USERS.conductor });
    await injectSession(page, MOCK_USERS.conductor);

    await page.goto('/home');

    // Módulos visibles
    await expect(page.locator('text=Ingreso de Bus a Taller').first()).toBeVisible();
    await expect(page.locator('text=Emergencia de Neumáticos').first()).toBeVisible();
    await expect(page.locator('text=Mi Perfil').first()).toBeVisible();

    // Módulos que NO deben aparecer
    await expect(page.locator('text=Dashboard Mecánico')).not.toBeVisible();
    await expect(page.locator('text=Telemetría y KPIs')).not.toBeVisible();

    // Intento de acceso directo por URL a /mecanico debe rebotar a /home
    await page.goto('/mecanico');
    await expect(page).toHaveURL(/.*\/home/);
  });

  test('Rol MECANICO: Puede acceder a su Dashboard de Revisiones', async ({ page }) => {
    await setupMockApi(page, { currentUser: MOCK_USERS.mecanico });
    await injectSession(page, MOCK_USERS.mecanico);

    await page.goto('/home');
    await expect(page.locator('text=Consola de Mecánicos').first()).toBeVisible();

    // Click en la tarjeta
    await page.click('text=Consola de Mecánicos');
    await expect(page).toHaveURL(/.*\/mecanico/);
    await expect(page.locator('h1')).toContainText('Consola Técnica Mecánico');
  });

  test('Rol SUPERVISOR: Ve módulos ejecutivos, patio, auditoría y alertas', async ({ page }) => {
    await setupMockApi(page, { currentUser: MOCK_USERS.supervisor });
    await injectSession(page, MOCK_USERS.supervisor);

    await page.goto('/home');
    await expect(page.locator('text=Supervisión y Telemetría').first()).toBeVisible();
    await expect(page.locator('text=Control de Acceso y Personal').first()).toBeVisible();

    // Click en Telemetría y KPIs
    await page.click('text=Supervisión y Telemetría');
    await expect(page).toHaveURL(/.*\/supervision/);
  });
});
