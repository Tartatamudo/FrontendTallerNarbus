# Estado Actual del Proyecto: Frontend Taller Narbus

## Visión General
El frontend de **Narbus Taller** (`FrontendTallerNarbus` / `ProtoNeumaticos`) es una aplicación SPA y móvil híbrida desarrollada con **React 19**, **TypeScript**, **Vite** y empaquetada para dispositivos móviles Android mediante **Capacitor 8**.

Su objetivo operacional es digitalizar la gestión integral de mantenimiento de la flota de buses de Narbus, facilitando la interacción de cuatro roles principales:
1. **Conductores:** Reporte de fallas y averías en taller, y declaración de emergencias de neumáticos en ruta.
2. **Mecánicos:** Tablero de revisión y órdenes pendientes, autoasignación atómica de fallas, registro de bitácora técnica, reporte de falta de repuestos, inspección de pauta preventiva (19 ítems) y entrega de turno o finalización de trabajos.
3. **Supervisores:** Tablero ejecutivo de telemetría y KPIs en tiempo real, centro de alertas proactivas, auditoría cronológica inmutable de buses, asignación directa de mecánicos a fallas, control de acceso físico a patio y administración de cuentas de usuario.
4. **Administradores:** Control global de acceso, usuarios y auditoría.

---

## Módulos y Estado de Implementación

| Módulo / Pantalla | Componente / Archivo | Estado | Descripción Funcional |
| :--- | :--- | :---: | :--- |
| **Autenticación & Sesión** | `src/usuarios/auth/Login.tsx`<br>`src/usuarios/auth/authService.ts` | `COMPLETADO` | Inicio de sesión con validación JWT Bearer (`POST /api/v1/auth/login`). Persistencia automática en `@capacitor/preferences` e interceptor de Axios. Manejo de errores amigable. |
| **Perfil de Usuario** | `src/usuarios/perfil/PerfilUsuario.tsx` | `COMPLETADO` | Visualización del usuario autenticado consumiendo `GET /api/v1/auth/me`. Identificación de RUT, rol y estado activo. |
| **Menú Principal de Roles** | `src/components/MenuSeleccion/MenuSeleccion.tsx` | `COMPLETADO` | Navegación dinámica filtrada por rol (`CONDUCTOR`, `MECANICO`, `SUPERVISOR`, `ADMIN`). Indicador en vivo de alertas de supervisión en tiempo real. |
| **Módulo Conductores: Mantención Taller** | `src/conductores/mantencion/FormularioMantencionTaller.tsx` | `COMPLETADO` | Reporte de bus para ingreso a taller. Selector de máquina con autocompletado (`BusSelector`), catálogo dinámico de categorías y fallas preconcebidas, agregado de averías personalizadas y adjunto de fotografía. |
| **Módulo Conductores: Reporte de Neumáticos** | `src/conductores/neumaticos/FormularioNeumaticos.tsx` | `COMPLETADO` | Croquis interactivo táctil de ejes y ruedas (2, 3 o 4 ejes). Selección rápida de motivos (Pinchazo, Reventón, Desinflado), captura de foto evidencia, precio formateado y marca de fuego. Envío multipart/form-data. |
| **Módulo Mecánicos: Dashboard de Revisiones** | `src/mecanicos/revisiones/DashboardMecanico.tsx` | `COMPLETADO` | Pestañas de "Solicitudes Pendientes" y "Mis Trabajos Asignados". Detalle completo de orden, visualización de averías con estados resueltos/bloqueados (fallas resueltas inmutables sin opción a desmarcado accidental), cuadrilla con minutos cronometrados y bitácora cronológica con comentarios categorizados. |
| **Módulo Mecánicos: Averías en Caliente** | `src/mecanicos/revisiones/modales/ModalAgregarFalla.tsx` | `COMPLETADO` | Adición de averías detectadas en taller (`POST /api/v1/mantencion/{id}/detalles`) desacopladas de la bitácora, con selector de categoría (Frenos, Eléctrico, Motor, Carrocería, Climatización, Otro) y autoasignación en caliente. |
| **Módulo Mecánicos: Asignación y Cierres Cronometrados** | `src/mecanicos/revisiones/DashboardMecanico.tsx`<br>`src/mecanicos/revisiones/modales/ModalTerminarAvance.tsx` | `COMPLETADO` | Autoasignación atómica individual/colaborativa (`POST /autoasignar`). Unificación de cierre a 2 únicas formas cronometradas: `Terminar Avance` (pausa grupal de cuadrilla pasando a `PENDIENTE`) y `Finalizar y Liberar Bus` (cierre definitivo con liberación de patio). |
| **Módulo Mecánicos: Pauta Preventiva (19 Ítems)** | `src/mecanicos/revisiones/PautaPreventivaModal.tsx` | `COMPLETADO` | Modal de inspección de los 19 ítems maestros de taller (categorías Motor, Frenos, Dirección, Luces, Cabina, etc.) con estados `OK`, `DEFECTO` y `NO_APLICA`, observaciones obligatorias ante defecto y guardado en bloque (`POST /pauta`). |
| **Módulo Mecánicos: Reporte de Falta de Repuestos** | `src/mecanicos/revisiones/DashboardMecanico.tsx` | `COMPLETADO` | Notificación de bloqueo por falta de repuesto (`PATCH /detalles/{id}/repuesto`) con motivo obligatorio y visualización con insignias amarillas de alerta. |
| **Módulo Mecánicos: Validación y Cierre de Orden** | `src/mecanicos/revisiones/modales/ModalFinalizarOrden.tsx` | `COMPLETADO` | Modal de finalización con verificación de pauta completa (< 19 ítems) y averías pendientes. Exige justificación para checklist incompleto o cierre parcial. Conmuta `en_taller = false`. |
| **Módulo Supervisores: Telemetría y KPIs** | `src/supervisores/supervision/DashboardSupervision.tsx` | `COMPLETADO` | Dashboard ejecutivo con tarjetas de estado (reportadas, en reparación, finalizadas, buses físicos en taller, averías bloqueadas por repuestos) y distribución por categoría de falla. |
| **Módulo Supervisores: Centro de Alertas** | `src/supervisores/supervision/DashboardSupervision.tsx` | `COMPLETADO` | Monitor en vivo con filtros de severidad (`CRITICA`, `ALTA`, `MEDIA`, `BAJA`) para avisos de `REPUESTO_FALTANTE`, `DEFECTO_PAUTA` y `BUS_SIN_MECANICOS`. Acceso rápido para asignar mecánico. |
| **Módulo Supervisores: Auditoría Inmutable** | `src/supervisores/supervision/DashboardSupervision.tsx` | `COMPLETADO` | Tablero de trazabilidad histórica con filtros por N° de bus, estado y nombre de mecánico. Despliegue de historial de mecánicos, bitácora y tiempos de atención. |
| **Módulo Supervisores: Asignación Formal** | `src/supervisores/supervision/ModalAsignarFallas.tsx` | `COMPLETADO` | Modal para que la supervisora asigne a un mecánico específico una o más averías de un bus reportado (`POST /asignar`). |
| **Módulo Supervisores: Control Físico de Patio** | `src/supervisores/supervision/DashboardSupervision.tsx` | `COMPLETADO` | Pestaña de patio de taller que lista la flota operativa (rango 200-899) y permite conmutar el flag `en_taller` con registro de motivo de ingreso/egreso. |
| **Módulo Supervisores: Gestión de Usuarios** | `src/supervisores/gestion_usuarios/ListaUsuarios.tsx`<br>`src/supervisores/gestion_usuarios/CrearUsuario.tsx` | `COMPLETADO` | Listado general de usuarios, filtrado por nombre/rol, creación de nuevos operadores y soft-delete (`DELETE /usuarios/{id}`). |
| **Core & Utilidades Compartidas** | `src/api/apiClient.ts`<br>`src/utils/apiErrors.ts`<br>`src/utils/storage.ts`<br>`src/utils/capacitorCamera.ts` | `COMPLETADO` | Interceptor de tokens, parser uniforme de errores `NarbusException`, abstracción de almacenamiento híbrido y cámara dual nativa/web. |

---

## Arquitectura y Buenas Prácticas del Frontend

1. **Desacoplamiento Estricto de la Capa de Servicios:**
   - Cada dominio cuenta con su propio archivo de servicios (`authService.ts`, `busesService.ts`, `mantencionService.ts`, `supervisionService.ts`), evitando llamadas directas a Axios dentro de los componentes.
2. **Robustez ante Errores de API:**
   - La utilidad `getApiErrorMessage` extrae con precisión los mensajes estructurados de `NarbusException` evitando que el usuario reciba mensajes crípticos o que la aplicación quede bloqueada.
3. **Optimización para Dispositivos Táctiles:**
   - Interfaz con botones grandes, retroalimentación táctil, modales con confirmación clara y prevención de doble clic en peticiones asíncronas.
4. **Sincronización Contractual 100% con Backend:**
   - Cumplimiento total de la especificación de los 43 endpoints REST del Backend Taller Narbus.
