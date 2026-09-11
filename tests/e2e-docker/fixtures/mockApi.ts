import type { Page } from '@playwright/test';
import {
  MOCK_USERS,
  MOCK_BUSES,
  MOCK_ORDENES_MECANICO,
  MOCK_RESUMEN_TALLER,
  MOCK_ALERTAS,
  MOCK_AUDITORIA,
  createMockJwt,
  type MockUser,
} from './mockData';

/**
 * Configura la intercepción completa de contratos REST en el navegador
 */
export async function setupMockApi(
  page: Page,
  options?: {
    currentUser?: MockUser;
    simulate401OnProtected?: boolean;
  }
) {
  const activeUser = options?.currentUser || MOCK_USERS.conductor;

  let dynamicUsers = [...Object.values(MOCK_USERS)];

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    // 1. Manejo de Auth Me
    if (path.endsWith('/auth/me')) {
      if (options?.simulate401OnProtected) {
        return route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            error: {
              code: 'HTTP_ERROR',
              message: 'Tu sesión ha expirado en el servidor.',
              detail: null,
            },
          }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(activeUser),
      });
    }

    // 2. Login
    if (path.includes('/auth/login')) {
      let username = '';
      if (request.headers()['content-type']?.includes('application/x-www-form-urlencoded')) {
        const postData = request.postData() || '';
        const params = new URLSearchParams(postData);
        username = params.get('username') || '';
      } else {
        const json = request.postDataJSON() || {};
        username = json.username || '';
      }

      // Buscar usuario correspondiente al RUT ingresado o usar el activo
      const user = Object.values(MOCK_USERS).find((u) => u.rut === username || u.username === username) || activeUser;

      if (username === '99.999.999-9') {
        // Simular credenciales inválidas
        return route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            error: {
              code: 'HTTP_ERROR',
              message: 'Credenciales inválidas. Verifica tu RUT y contraseña.',
              detail: null,
            },
          }),
        });
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: createMockJwt(user),
          token_type: 'bearer',
          user,
        }),
      });
    }

    // 3. Usuarios (Gestión de Usuarios)
    if (path.endsWith('/auth/usuarios')) {
      if (method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(dynamicUsers),
        });
      }
      if (method === 'POST') {
        const payload = request.postDataJSON() || {};
        const newUser = {
          id: Date.now(),
          username: payload.username || 'nuevo_operador',
          nombre_completo: payload.nombre_completo || 'Nuevo Operador Narbus',
          rut: payload.rut || '12.345.678-5',
          email: `${payload.username || 'operador'}@narbus.cl`,
          rol: payload.rol || 'MECANICO',
          is_active: true,
        };
        dynamicUsers.push(newUser);
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(newUser),
        });
      }
    }

    if (path.includes('/auth/usuarios/')) {
      if (method === 'DELETE') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...activeUser, activo: false }),
        });
      }
    }

    // 4. Catálogo de Buses
    if ((path.includes('/buses') && !path.includes('/supervision')) || path === '/api/v1/buses') {
      if (method === 'PATCH' && path.includes('/taller')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Estado en taller actualizado correctamente' }),
        });
      }
      const matchBus = path.match(/\/buses\/(\d+)/);
      if (matchBus) {
        const num = matchBus[1];
        const found = MOCK_BUSES.find(b => String(b.numero_bus) === num || String(b.n_bus) === num) || MOCK_BUSES[0];
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(found),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_BUSES),
      });
    }

    // 5. Módulo Conductor: Formulario Mantención Taller
    if (path.includes('/formularioMantencionTaller')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 777,
          message: 'Reporte de mantención registrado exitosamente en taller',
        }),
      });
    }

    // 6. Módulo Conductor: Formulario Neumáticos
    if (path.includes('/formularioNeumatico')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 888,
          message: 'Reporte de neumático registrado exitosamente',
        }),
      });
    }

    // 7. Módulo Mecánicos & Mantención: Solicitudes, Órdenes de Trabajo y Acciones
    if (path.includes('/mantencion')) {
      if (method === 'POST' && path.includes('/solicitudes')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 777,
            n_bus: '201',
            bus_id: 1,
            descripcion_general: 'Reporte de mantención para bus 201',
            estado: 'REPORTADO',
            fecha_ingreso: new Date().toISOString(),
            detalles: [],
          }),
        });
      }
      if (path.includes('/categorias')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 1, nombre: 'Frenos', is_active: true },
            { id: 2, nombre: 'Luces / Eléctrico', is_active: true },
            { id: 3, nombre: 'Motor', is_active: true },
            { id: 4, nombre: 'Carrocería', is_active: true },
            { id: 5, nombre: 'Climatización', is_active: true },
          ]),
        });
      }
      if (path.includes('/fallas')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 101, categoria_id: 1, nombre: 'Frenos largos', is_active: true },
            { id: 102, categoria_id: 3, nombre: 'Fuga de aceite', is_active: true },
          ]),
        });
      }
      if (path.includes('/autoasignar')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Autoasignación exitosa' }),
        });
      }
      if (path.includes('/asignar')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Asignación exitosa' }),
        });
      }
      if (path.includes('/repuesto')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Repuesto solicitado exitosamente' }),
        });
      }
      if (path.includes('/pauta/items')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(
            MOCK_PAUTA_ITEMS.map((item, idx) => ({
              id: idx + 1,
              categoria: 'GENERAL',
              item: item,
              nombre_item: item,
              orden: idx + 1,
              is_active: true,
            }))
          ),
        });
      }
      if (path.includes('/pauta')) {
        if (method === 'POST') {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Pauta preventiva guardada' }),
          });
        }
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 102,
            solicitud_id: 102,
            porcentaje_completado: 50,
            items_evaluados: 2,
            total_items: 11,
            respuestas: [
              { id: 1, item_id: 1, estado: 'OK', observacion: null },
              { id: 2, item_id: 2, estado: 'OK', observacion: null },
            ],
          }),
        });
      }
      if (path.includes('/mis-trabajos')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_ORDENES_MECANICO.filter((o) => o.estado === 'EN_PROCESO')),
        });
      }
      if (path.includes('/pendientes')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_ORDENES_MECANICO),
        });
      }
      const matchSolicitud = path.match(/\/mantencion\/(\d+)$/);
      if (matchSolicitud) {
        const id = Number(matchSolicitud[1]);
        const found = MOCK_ORDENES_MECANICO.find((o) => o.id === id) || MOCK_ORDENES_MECANICO[0];
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(found),
        });
      }
      if (path.includes('/terminar-avance')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Avance registrado y turno pausado' }),
        });
      }
      if (path.includes('/finalizar')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Orden finalizada y bus liberado de taller' }),
        });
      }
      if (path.includes('/detalles') && method === 'POST') {
        const body = request.postDataJSON() || {};
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 2001,
            reporte_id: 102,
            categoria: body.categoria || 'OTRO',
            descripcion: body.descripcion || 'Falla agregada en caliente',
            resuelta: false,
            repuesto_faltante: false,
            mecanicos_asignados: [2],
            co_responsables: [{ id: 2, nombre_completo: 'Pedro Mecánico Test' }],
          }),
        });
      }
      if (path.includes('/detalles') && method === 'PATCH') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Detalle actualizado' }),
        });
      }

      // Por defecto listado de mantención
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_ORDENES_MECANICO),
      });
    }

    // 8. Módulo Supervisión: KPIs (Resumen), Alertas, Auditoría
    if (path.includes('/supervision/resumen-taller')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_RESUMEN_TALLER),
      });
    }
    if (path.includes('/supervision/alertas')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_ALERTAS),
      });
    }
    if (path.includes('/supervision/auditoria/buses-taller')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_AUDITORIA),
      });
    }

    // Fallback genérico 200 para cualquier otro endpoint de api/v1
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });
}

/**
 * Inyecta directamente la sesión en el almacenamiento local antes de cargar la página
 */
export async function injectSession(page: Page, user: MockUser) {
  const token = createMockJwt(user);
  await page.addInitScript(
    ({ token, userStr }) => {
      window.localStorage.setItem('access_token', token);
      window.localStorage.setItem('user_data', userStr);
      window.localStorage.setItem('sesion_activa', 'true');
    },
    { token, userStr: JSON.stringify(user) }
  );
}
