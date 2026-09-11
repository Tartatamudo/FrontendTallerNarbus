import { test, expect } from '@playwright/test';

test.describe('Infraestructura del Contenedor Docker y Nginx', () => {
  test('Endpoint /health devuelve HTTP 200 OK para Healthcheck de Docker', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/health`);
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body.trim()).toBe('OK');
  });

  test('Cabeceras de Seguridad Nginx están configuradas correctamente', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/`);
    expect(response.status()).toBe(200);
    const headers = response.headers();

    expect(headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['permissions-policy']).toContain('camera=self');
  });

  test('SPA Routing Fallback: Rutas directas devuelven index.html sin error 404', async ({ request, baseURL }) => {
    const directRoutes = ['/login', '/home', '/perfil', '/mantencion', '/neumaticos', '/mecanico', '/supervision', '/crear_usuario'];

    for (const route of directRoutes) {
      const response = await request.get(`${baseURL}${route}`);
      expect(response.status()).toBe(200);
      const text = await response.text();
      expect(text).toContain('<div id="root"></div>');
      expect(text).toContain('Narbus Flota');
    }
  });

  test('Cache-Control para index.html previene cacheo (no-store, no-cache)', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/index.html`);
    expect(response.status()).toBe(200);
    const cacheControl = response.headers()['cache-control'];
    expect(cacheControl).toContain('no-store');
    expect(cacheControl).toContain('no-cache');
  });
});
