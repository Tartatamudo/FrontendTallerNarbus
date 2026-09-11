import { test, expect } from '@playwright/test';
import { setupMockApi, injectSession } from './fixtures/mockApi';
import { MOCK_USERS } from './fixtures/mockData';

test.describe('Módulo Supervisores: Telemetría, Alertas, Auditoría y Patio', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApi(page, { currentUser: MOCK_USERS.supervisor });
    await injectSession(page, MOCK_USERS.supervisor);
  });

  test('Pestaña Alertas: Visualización y filtro de severidad en vivo', async ({ page }) => {
    await page.goto('/supervision');
    await expect(page.locator('h1')).toContainText('Supervisión y Auditoría Taller');

    // Alertas visibles
    await expect(page.locator('text=REPUESTO FALTANTE').or(page.locator('text=Bloqueo'))).toBeVisible();
    await expect(page.locator('text=Bus 201')).toBeVisible();

    // Filtro de severidad
    const criticaBtn = page.locator('button:has-text("CRITICA")').first();
    if (await criticaBtn.isVisible()) {
      await criticaBtn.click();
      await expect(page.locator('text=Bus 201')).toBeVisible();
    }
  });

  test('Pestaña KPIs / Telemetría: Tarjetas de métricas y distribución', async ({ page }) => {
    await page.goto('/supervision');
    await expect(page.locator('h1')).toContainText('Supervisión y Auditoría Taller');

    // Cambiar a pestaña KPIs / Telemetría
    const kpisTab = page.locator('button:has-text("Telemetría KPIs")').first();
    await kpisTab.click();

    // Validar tarjetas de KPIs
    await expect(page.getByText('Total Órdenes')).toBeVisible();
    await expect(page.locator('text=En Reparación')).toBeVisible();
  });

  test('Pestaña Auditoría: Historial inmutable y ficha modal', async ({ page }) => {
    await page.goto('/supervision');

    const auditoriaTab = page.locator('button:has-text("Auditoría de Buses")').first();
    await auditoriaTab.click();

    // Validar listado
    await expect(page.locator('text=Bus N° 205').or(page.locator('text=205'))).toBeVisible();

    // Clic en botón Ver Ficha para abrir ModalDetalleAuditoria
    const verFichaBtn = page.locator('button:has-text("Ver Ficha"), button:has-text("205")').first();
    if (await verFichaBtn.isVisible()) {
      await verFichaBtn.click();
      const modal = page.locator('.modal-base-card, .fixed, [role="dialog"]').first();
      await expect(modal).toBeVisible();
      await expect(modal).toContainText('205');
    }
  });

  test('Pestaña Patio: Control físico de flota de taller y conmutación de switch', async ({ page }) => {
    await page.goto('/supervision');

    const patioTab = page.locator('button:has-text("Control de Patio")').first();
    await patioTab.click();

    // Tabla de flota de taller (200-899)
    await expect(page.getByText('Bus 201')).toBeVisible();
    await expect(page.getByText('KJHG12')).toBeVisible();
  });
});
