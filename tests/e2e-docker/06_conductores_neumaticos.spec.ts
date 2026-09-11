import { test, expect } from '@playwright/test';
import { setupMockApi, injectSession } from './fixtures/mockApi';
import { MOCK_USERS } from './fixtures/mockData';

test.describe('Módulo Conductores: Formulario de Neumáticos', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApi(page, { currentUser: MOCK_USERS.conductor });
    await injectSession(page, MOCK_USERS.conductor);
  });

  test('Validación de ruedas y motivo requerido antes del envío', async ({ page }) => {
    await page.goto('/neumaticos');
    await expect(page.locator('h1')).toContainText('Emergencia de Neumáticos en Ruta');

    // Intentar enviar sin seleccionar rueda ni motivo
    const submitBtn = page.locator('button:has-text("ENVIAR REPORTE DE NEUMÁTICO"), button:has-text("ENVIAR")').first();
    await submitBtn.click();

    // Comprobar que exige campos obligatorios
    await expect(page.locator('text=* Requerido').first()).toBeVisible();
  });

  test('Flujo interactivo de croquis de ruedas, motivo, precio formateado y confirmación', async ({ page }) => {
    await page.goto('/neumaticos');
    await expect(page.locator('h1')).toContainText('Emergencia de Neumáticos en Ruta');

    // 1. Seleccionar bus
    const busInput = page.locator('input[placeholder*="398" i], input[placeholder*="máquina" i]').first();
    await busInput.fill('201');
    const suggestion = page.locator('button:has-text("201"), div:has-text("201")').first();
    if (await suggestion.isVisible()) {
      await suggestion.click();
    }

    // 2. Seleccionar rueda en el croquis táctil (rueda 1 o 2)
    const ruedaBtn = page.locator('button:has-text("1"), button:has-text("2")').first();
    await ruedaBtn.click();

    // 3. Seleccionar motivo
    const motivoBtn = page.locator('button:has-text("Pinchazo")').first();
    await motivoBtn.click();

    // 4. Adjuntar foto de boleta (requerido por el formulario)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'boleta.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-bytes'),
    });

    // 5. Ingresar precio y marca de fuego
    const precioInput = page.locator('input[placeholder*="25.000" i], input[placeholder*="precio" i]').first();
    if (await precioInput.isVisible()) {
      await precioInput.fill('45000');
    }

    const fuegoInput = page.locator('input[placeholder*="123456" i], input[placeholder*="fuego" i]').first();
    if (await fuegoInput.isVisible()) {
      await fuegoInput.fill('99');
    }

    // 6. Botón de envío
    const submitBtn = page.locator('button:has-text("ENVIAR REPORTE DE NEUMÁTICO"), button:has-text("ENVIAR")').first();
    await submitBtn.click();

    // 7. Confirmar modal resumen
    const confirmBtn = page.locator('button:has-text("Confirmar"), button:has-text("Sí, Enviar")').first();
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }

    // 8. Feedback de éxito
    await expect(page.getByRole('heading', { name: /¡Reporte Transmitido con Éxito!/i })).toBeVisible({ timeout: 10000 });
  });
});
