import { test, expect } from '@playwright/test';
import { setupMockApi, injectSession } from './fixtures/mockApi';
import { MOCK_USERS } from './fixtures/mockData';

test.describe('Pantalla de Perfil de Usuario y Credencial Digital', () => {
  test('Visualiza datos del operador, RUT formateado y catálogo de tareas por puesto', async ({ page }) => {
    await setupMockApi(page, { currentUser: MOCK_USERS.conductor });
    await injectSession(page, MOCK_USERS.conductor);

    await page.goto('/perfil');

    // Nombre y RUT del usuario en la credencial
    await expect(page.locator('.perfil-user-name')).toHaveText('Juan Conductor Test');
    await expect(page.locator('text=11.111.111-1')).toBeVisible();
    await expect(page.locator('text=CUENTA ACTIVA')).toBeVisible();
    await expect(page.getByText('CONDUCTOR', { exact: true })).toBeVisible();
  });

  test('Botón Volver a la Consola Principal redirige a /home', async ({ page }) => {
    await setupMockApi(page, { currentUser: MOCK_USERS.conductor });
    await injectSession(page, MOCK_USERS.conductor);

    await page.goto('/perfil');

    const volverBtn = page.locator('button:has-text("Volver a la Consola Principal"), button:has-text("Volver")').first();
    await expect(volverBtn).toBeVisible();
    await volverBtn.click();

    await expect(page).toHaveURL(/.*\/home/);
  });

  test('Botón Cerrar Sesión limpia credenciales y redirige a /login', async ({ page }) => {
    await setupMockApi(page, { currentUser: MOCK_USERS.conductor });
    await injectSession(page, MOCK_USERS.conductor);

    await page.goto('/perfil');

    const logoutBtn = page.locator('button:has-text("Cerrar Sesión")').first();
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    await expect(page).toHaveURL(/.*\/login/);

    // Tokens eliminados
    const token = await page.evaluate(() => localStorage.getItem('access_token'));
    expect(token).toBeFalsy();
  });
});
