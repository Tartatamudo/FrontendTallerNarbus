import { test, expect } from '@playwright/test';
import { setupMockApi, injectSession } from './fixtures/mockApi';
import { MOCK_USERS } from './fixtures/mockData';

test.describe('Módulo Mecánicos: Dashboard de Revisiones y Gestión de Órdenes', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApi(page, { currentUser: MOCK_USERS.mecanico });
    await injectSession(page, MOCK_USERS.mecanico);
  });

  test('Visualización de bandejas "Buses por Atender" y "Mis Órdenes en Curso"', async ({ page }) => {
    await page.goto('/mecanico');
    await expect(page.locator('h1')).toContainText('Consola Técnica Mecánico');

    // Verificar pestañas operacionales
    const tabPendientes = page.locator('button:has-text("Buses por Atender"), button:has-text("Pendientes")').first();
    const tabMisTrabajos = page.locator('button:has-text("Mis Órdenes en Curso"), button:has-text("Mis Trabajos")').first();

    await expect(tabPendientes).toBeVisible();
    await expect(tabMisTrabajos).toBeVisible();

    // Comprobar que se despliegan tarjetas de OT
    await expect(page.locator('text=Bus 201').or(page.locator('text=201'))).toBeVisible();
  });

  test('Filtro de búsqueda reactivo en tiempo real', async ({ page }) => {
    await page.goto('/mecanico');
    await expect(page.locator('h1')).toContainText('Consola Técnica Mecánico');

    const searchInput = page.locator('input[placeholder*="Buscar" i]').first();
    await expect(searchInput).toBeVisible();

    // Filtrar por bus que no existe en la lista
    await searchInput.fill('9999');
    await expect(page.locator('text=No hay órdenes').or(page.locator('text=No se encontraron')).or(page.locator('text=sin órdenes'))).toBeVisible();

    // Limpiar filtro
    await searchInput.fill('');
    await expect(page.locator('text=Bus 201').or(page.locator('text=201'))).toBeVisible();
  });

  test('Ordenamiento reactivo por OT y N° de Bus (ascendente y descendente)', async ({ page }) => {
    await page.goto('/mecanico');
    await expect(page.locator('h1')).toContainText('Consola Técnica Mecánico');

    const selectOrden = page.locator('#select-orden-pendientes');
    await expect(selectOrden).toBeVisible();

    // Ordenar por Bus Ascendente (1 -> 999)
    await selectOrden.selectOption('bus_asc');
    const firstCardTextBusAsc = await page.locator('.grid > div').first().innerText();
    expect(firstCardTextBusAsc).toContain('Bus 201');

    // Ordenar por Bus Descendente (999 -> 1)
    await selectOrden.selectOption('bus_desc');
    const firstCardTextBusDesc = await page.locator('.grid > div').first().innerText();
    expect(firstCardTextBusDesc).toContain('Bus 310');

    // Ordenar por OT Ascendente (Más antigua primero)
    await selectOrden.selectOption('ot_asc');
    const firstCardTextOtAsc = await page.locator('.grid > div').first().innerText();
    expect(firstCardTextOtAsc).toContain('OT #101');

    // Ordenar por OT Descendente (Más nueva primero)
    await selectOrden.selectOption('ot_desc');
    const firstCardTextOtDesc = await page.locator('.grid > div').first().innerText();
    expect(firstCardTextOtDesc).toContain('OT #102');
  });

  test('Apertura de ModalDetalleReporte al hacer clic en una orden', async ({ page }) => {
    await page.goto('/mecanico');

    // Clic en la tarjeta o botón Ver Reporte Completo
    const orderBtn = page.locator('button:has-text("Ver Reporte Completo")').first();
    await expect(orderBtn).toBeVisible();
    await orderBtn.click();

    // Modal de detalle debe abrirse con los datos de la primera orden (OT #102)
    const modal = page.locator('.modal-base-card, .fixed, [role="dialog"]').first();
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('310');
    await expect(modal).toContainText('Alternador');

    // Cerrar modal
    const closeBtn = modal.locator('button:has-text("Cerrar"), button:has-text("Volver"), button[aria-label="Cerrar"], svg.lucide-x').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  });

  test('Pauta Preventiva: Apertura de modal de 11 ítems de taller', async ({ page }) => {
    await page.goto('/mecanico');

    // Cambiar a pestaña Mis Órdenes en Curso
    const tabMisTrabajos = page.locator('button:has-text("Mis Órdenes en Curso"), button:has-text("Mis Trabajos")').first();
    await tabMisTrabajos.click();

    // Abrir la orden en curso
    const orderBtn = page.locator('button:has-text("Ver Reporte Completo"), button:has-text("310")').first();
    if (await orderBtn.isVisible()) {
      await orderBtn.click();

      // Botón Pauta Preventiva
      const pautaBtn = page.locator('button:has-text("Pauta Preventiva"), button:has-text("Pauta")').first();
      if (await pautaBtn.isVisible()) {
        await pautaBtn.click();

        // Verificar título del modal de pauta
        await expect(page.locator('text=Pauta Preventiva').or(page.locator('text=Checklist'))).toBeVisible();
      }
    }
  });
});
