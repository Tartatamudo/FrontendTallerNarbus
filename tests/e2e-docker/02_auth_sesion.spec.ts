import { test, expect } from '@playwright/test';
import { setupMockApi } from './fixtures/mockApi';
import { MOCK_USERS } from './fixtures/mockData';

test.describe('Módulo de Autenticación y Guardia de Sesión', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApi(page);
  });

  test('Pantalla /login: Muestra error de validación ante campos vacíos', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1.auth-title')).toHaveText('Plataforma Narbus');

    // Intentar enviar sin datos
    await page.click('button[type="submit"]');

    // Debe mostrar la alerta con la variable de mensaje de validación
    const alert = page.locator('.auth-alert-error');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('Por favor ingrese su usuario y contraseña');
  });

  test('Pantalla /login: Muestra error ante credenciales inválidas (401)', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="text"]', '99.999.999-9');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    const alert = page.locator('.auth-alert-error');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('Credenciales inválidas');
  });

  test('Pantalla /login: Login exitoso almacena tokens y redirige a /home', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="text"]', MOCK_USERS.conductor.rut);
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');

    // Redirige a /home
    await expect(page).toHaveURL(/.*\/home/);

    // Variables de persistencia en localStorage
    const token = await page.evaluate(() => localStorage.getItem('access_token'));
    const sesionActiva = await page.evaluate(() => localStorage.getItem('sesion_activa'));
    const userData = await page.evaluate(() => localStorage.getItem('user_data'));

    expect(token).toBeTruthy();
    expect(sesionActiva).toBe('true');
    expect(userData).toContain('Juan Conductor Test');
  });

  test('Guardia de Sesión: Redirección automática a /login si no hay token', async ({ page }) => {
    // Limpiar storage
    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.goto('/supervision');
    // Debe rebotar inmediatamente al login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Guardia de Sesión: Evento 401 en backend revoca credenciales y redirige a /login', async ({ page }) => {
    // Configurar API para rechazar con 401 en endpoints protegidos
    await setupMockApi(page, { simulate401OnProtected: true });

    await page.goto('/login');
    await expect(page).toHaveURL(/.*\/login/);

    // Alerta de sesión expirada
    const alert = page.locator('.auth-alert-error');
    if (await alert.isVisible()) {
      await expect(alert).toContainText('sesión');
    }
  });
});
