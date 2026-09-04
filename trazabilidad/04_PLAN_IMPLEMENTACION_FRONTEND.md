# Plan de Implementación Frontend

## Fase 1: Arquitectura Base, Setup y Autenticación
- [x] Configuración inicial del proyecto con Vite 8, React 19 y TypeScript 6.
- [x] Integración de Capacitor 8 para soporte Android móvil nativo.
- [x] Módulo de autenticación JWT Bearer (`POST /api/v1/auth/login`).
- [x] Cliente HTTP centralizado en `src/api/apiClient.ts` con interceptor de tokens.
- [x] Almacenamiento seguro persistente con `@capacitor/preferences` en `src/utils/storage.ts`.
- [x] Vista de perfil de usuario (`GET /api/v1/auth/me`).

## Fase 2: Componentes Globales y Flujos de Conductores
- [x] Barra superior (`TopBar.tsx`) con cierre de sesión y navegación.
- [x] Menú principal por roles (`MenuSeleccion.tsx`).
- [x] Selector asistido de buses con autocompletado (`BusSelector.tsx`).
- [x] Selector de fotografías con integración dual cámara/galería (`PhotoSelector.tsx`).
- [x] Formulario de ingreso a taller para mantención de buses (`FormularioMantencionTaller.tsx`).
- [x] Formulario interactivo táctil de reporte de neumáticos (`FormularioNeumaticos.tsx`) con croquis multieje.

## Fase 3: Módulo Mecánicos y Gestión de Taller
- [x] Dashboard de revisiones de taller con pestañas "Pendientes" y "Mis Trabajos".
- [x] Flujo de autoasignación atómica de fallas específicas.
- [x] Check de averías resueltas en tiempo real (`PATCH /detalles/{id}/check`).
- [x] Bitácora cronológica con comentarios categorizados (`POST /comentarios`).
- [x] Modal de entrega de turno individual (`/terminar-avance`) y grupal (`/liberar-turno`).
- [x] Notificación de bloqueo por falta de repuestos (`PATCH /detalles/{id}/repuesto`).

## Fase 4: Módulo Supervisores, Telemetría y Gestión de Usuarios
- [x] Lista y creación de usuarios administrativos con asignación de roles.
- [x] Desactivación segura (soft-delete) de cuentas de usuario.
- [x] Dashboard ejecutivo de telemetría y KPIs en tiempo real (`GET /resumen-taller`).
- [x] Centro proactivo de alertas en vivo (`REPUESTO_FALTANTE`, `DEFECTO_PAUTA`, `BUS_SIN_MECANICOS`).
- [x] Tablero de auditoría inmutable con filtros por N° de bus, estado y mecánico.
- [x] Modal para asignación supervisora de mecánicos a fallas (`ModalAsignarFallas.tsx`).

## Fase 5: Integración Nueva Filosofía Backend (Pauta Preventiva y Patio)
- [x] Desacoplamiento del servicio de buses (`busesService.ts`) con soporte de rango 200-899.
- [x] Control de patio de taller (`PATCH /api/v1/buses/{id}/en-taller`) desde la pestaña de supervisión.
- [x] Modal dedicado de Pauta Preventiva (19 ítems maestros) con evaluación `OK`, `DEFECTO` y `NO_APLICA`.
- [x] Validación estricta en cierre de orden: obligatoriedad de justificación ante pauta incompleta o averías sin resolver.
- [x] Manejador centralizado de errores (`src/utils/apiErrors.ts`) adaptado a `NarbusException`.
- [x] Actualización de la documentación contractual en `trazabilidad/`.

## Fase 6: Pruebas, Calidad y Empaquetado Móvil
- [x] Verificación de calidad con Oxlint (0 errores, 0 warnings).
- [x] Compilación exitosa del bundle web (`tsc -b && vite build`).
- [ ] Pruebas funcionales E2E con el backend local (`dev_local`) activo.
- [ ] Compilación de APK de producción con Android Studio y Capacitor CLI (`npx cap sync android`).
- [ ] Despliegue y distribución de la versión móvil en los dispositivos del taller.
