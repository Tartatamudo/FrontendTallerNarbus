import { test, expect } from '@playwright/test';
import { setupMockApi, injectSession } from './fixtures/mockApi';
import { MOCK_USERS } from './fixtures/mockData';

test.describe('Módulo Administración / Supervisión: Gestión de Usuarios', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApi(page, { currentUser: MOCK_USERS.supervisor });
    await injectSession(page, MOCK_USERS.supervisor);
  });

  test('Lista de Usuarios: Despliegue de operadores y filtro por buscador', async ({ page }) => {
    await page.goto('/crear_usuario');
    await expect(page.locator('h1')).toContainText('Gestión de Usuarios');

    // Comprobar que aparecen los usuarios mock
    await expect(page.locator('text=Juan Conductor Test').or(page.locator('text=conductor_juan'))).toBeVisible();

    // Filtro por buscador
    const searchInput = page.locator('input[placeholder*="Buscar" i]').first();
    await searchInput.fill('Pedro');
    await expect(page.locator('text=Pedro Mecánico Test').or(page.locator('text=mecanico_pedro'))).toBeVisible();
  });

  test('Crear Usuario: Validación de campos obligatorios y registro exitoso', async ({ page }) => {
    await page.goto('/crear_usuario');
    await expect(page.locator('h1')).toContainText('Gestión de Usuarios');

    // Cambiar a pestaña Crear Usuario
    const nuevoBtn = page.locator('button:has-text("Crear Nuevo Usuario")').first();
    await nuevoBtn.click();

    await expect(page.locator('h2.crear-usuario-title')).toContainText('Registrar Nuevo Usuario');

    // Verificar campos requeridos
    const usernameInput = page.locator('input[placeholder*="chofer1" i], input[placeholder*="usuario" i]').first();
    await expect(usernameInput).toHaveAttribute('required', '');

    // Completar formulario
    await page.fill('input[placeholder*="chofer1" i], input[placeholder*="usuario" i]', 'nuevo_operador');
    await page.fill('input[type="password"]', 'Password123!');
    await page.fill('input[placeholder*="Pedro" i]', 'Nuevo Operador Narbus');
    await page.fill('input[placeholder*="12345678-9" i]', '12.345.678-5');

    // Seleccionar rol si existe dropdown
    const rolSelect = page.locator('select').first();
    if (await rolSelect.isVisible()) {
      await rolSelect.selectOption('MECANICO');
    }

    // Enviar
    const submitBtn = page.locator('button[type="submit"].cu-btn-submit, button[type="submit"]').first();
    await submitBtn.click();

    // Validar que tras crear el usuario, regresa automáticamente a la lista y se visualiza
    await expect(page.locator('button:has-text("Lista de Usuarios")').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=nuevo_operador').or(page.locator('text=Nuevo Operador Narbus'))).toBeVisible();
  });
});
