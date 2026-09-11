import { test, expect } from '@playwright/test';
import { setupMockApi, injectSession } from './fixtures/mockApi';
import { MOCK_USERS } from './fixtures/mockData';

test.describe('Módulo Conductores: Formulario de Mantención Taller', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApi(page, { currentUser: MOCK_USERS.conductor });
    await injectSession(page, MOCK_USERS.conductor);
  });

  test('Validaciones: Requiere Bus válido (200-899) y al menos una avería declarada', async ({ page }) => {
    await page.goto('/mantencion');
    await expect(page.locator('h1')).toContainText('Ingreso de Bus a Taller Central');

    // Intentar enviar sin datos
    const submitBtn = page.locator('button:has-text("ENVIAR REPORTE A TALLER"), button:has-text("Enviar")').first();
    await submitBtn.click();

    // Debe mostrar advertencia en pantalla
    await expect(page.getByText('* Requerido')).toBeVisible();
    await expect(page.getByText('* Mínimo 1 falla')).toBeVisible();
  });

  test('Flujo completo de declaración de averías con selector de bus y envío exitoso', async ({ page }) => {
    await page.goto('/mantencion');
    await expect(page.locator('h1')).toContainText('Ingreso de Bus a Taller Central');

    // 1. Seleccionar bus
    const busInput = page.locator('input[placeholder*="420" i], input[placeholder*="bus" i]').first();
    await busInput.fill('201');
    const suggestion = page.locator('.bus-selector-dropdown button, button:has-text("Bus N° 201")').first();
    if (await suggestion.isVisible()) {
      await suggestion.click();
    }

    // 2. Agregar avería por categoría rápida
    const categoriaBtn = page.locator('button:has-text("Frenos")').first();
    await categoriaBtn.click();

    // 3. Agregar avería personalizada
    const customInput = page.locator('input[placeholder*="observación" i], input[placeholder*="falla" i]').first();
    if (await customInput.isVisible()) {
      await customInput.fill('Ruidos extraños al pasar cambios');
      const addBtn = page.locator('button:has-text("+ Agregar"), button:has-text("Agregar")').first();
      await addBtn.click();
    }

    // 4. Enviar reporte
    const submitBtn = page.locator('button:has-text("ENVIAR REPORTE A TALLER"), button:has-text("Enviar")').first();
    await submitBtn.click();

    // 5. Confirmar modal si aparece
    const modalConfirmBtn = page.locator('button:has-text("Confirmar"), button:has-text("Sí, Enviar")').first();
    if (await modalConfirmBtn.isVisible()) {
      await modalConfirmBtn.click();
    }

    // 6. Verificar feedback de éxito (Comprobante de Recepción)
    await expect(page.getByRole('heading', { name: /Comprobante de Recepción/i })).toBeVisible({ timeout: 10000 });
  });
});
