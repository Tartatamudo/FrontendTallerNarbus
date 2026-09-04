# Especificación Funcional de Módulos Frontend

## 1. Módulo de Autenticación y Perfil (`src/usuarios/`)

### 1.1 Pantalla de Login (`Login.tsx`)
- **Acceso:** Público (ruta inicial cuando no existe sesión activa persistida).
- **Entradas:** Campo de usuario (`username`) y campo de contraseña (`password`).
- **Comportamiento:**
  - Envía credenciales vía `POST /api/v1/auth/login` con payload JSON.
  - Guarda `access_token`, `user_data` y bandera `sesion_activa = 'true'` en `@capacitor/preferences` (con fallback a `localStorage`).
  - Redirige al Menú de Selección (`MenuSeleccion.tsx`).
  - Muestra mensajes de error claros provenientes de `getApiErrorMessage(err)`.

### 1.2 Vista de Perfil (`PerfilUsuario.tsx`)
- **Acceso:** Cualquier usuario autenticado.
- **Funcionalidad:**
  - Consulta `GET /api/v1/auth/me` con encabezado Bearer.
  - Muestra nombre completo, nombre de usuario, RUT, rol y estado de la cuenta.
  - Botón para cerrar sesión de forma segura (`logout()`).

---

## 2. Componentes Globales Compartidos (`src/components/`)

### 2.1 TopBar (`TopBar.tsx`)
- Barra superior con logotipo, botón de volver (si no se encuentra en el menú raíz) y botón de cierre de sesión.

### 2.2 Menú de Selección por Roles (`MenuSeleccion.tsx`)
- Evalúa el rol del usuario logueado:
  - Si es `CONDUCTOR` o `ADMIN`: Habilita opciones de "Mantención Taller" y "Reporte de Neumáticos".
  - Si es `MECANICO` o `ADMIN`: Habilita acceso a "Revisiones Taller" (Dashboard Mecánico).
  - Si es `SUPERVISOR` o `ADMIN`: Habilita acceso a "Supervisión & Telemetría" y "Gestión de Usuarios".
- Consulta en segundo plano `GET /api/v1/supervision/alertas` y muestra una insignia con el total de alertas activas en el botón de supervisión.

### 2.3 Selector Asistido de Buses (`BusSelector.tsx`)
- Input con autocompletado que consulta `GET /api/v1/buses/buscar?query=...&solo_flota_taller=true`.
- Filtra máquinas de flota taller (rango 200 a 899).
- Permite seleccionar el bus y emite tanto el número visible como el objeto con `bus_id`.

### 2.4 Selector de Mecánicos (`MecanicoSelector.tsx`)
- Campo de búsqueda interactivo que consulta `GET /api/v1/auth/mecanicos/buscar?q=...`.
- Permite seleccionar uno o varios colaboradores excluyendo al usuario actual si es requerido.

### 2.5 Selector de Fotografías (`PhotoSelector.tsx`)
- Maneja la captura dual: abre la cámara nativa mediante `@capacitor/camera` en Android o el selector de archivos local en navegadores web.
- Previsualización inmediata y modal de ampliación (zoom).

---

## 3. Módulo Conductores (`src/conductores/`)

### 3.1 Formulario de Mantención Taller (`FormularioMantencionTaller.tsx`)
- **Propósito:** Registro formal de una máquina averiada para ingreso al patio de mantención.
- **Campos:**
  - Selección de máquina (`BusSelector`).
  - Nombre del conductor (obtenido automáticamente de la sesión).
  - Selector de categorías activas (`GET /api/v1/mantencion/categorias`).
  - Catálogo de fallas (`GET /api/v1/mantencion/fallas?categoria_id=...`).
  - Entrada de descripción personalizada de averías.
  - Lista dinámica obligatoria de ítems de falla (mínimo 1 avería para enviar).
  - Fotografía adjunta de evidencia.
- **Envío:** `POST /api/v1/mantencion/solicitudes` con confirmación modal previa.

### 3.2 Formulario de Neumáticos (`FormularioNeumaticos.tsx`)
- **Propósito:** Declaración técnica de pinchazos, reventones o anomalías en ruta o taller.
- **Campos:**
  - Bus (`BusSelector`).
  - Croquis interactivo de ruedas: selector visual táctil de 2, 3 o 4 ejes.
  - Selección de motivo rápido (Pinchazo, Se desinfló, Reventó, Otro motivo).
  - Precio de reparación (con formato moneda chilena `$ XX.XXX`).
  - Marca de fuego del neumático.
  - Fotografía del daño.
- **Envío:** `POST /api/v1/neumaticos/formularioNeumatico` en formato `multipart/form-data`.

---

## 4. Módulo Mecánicos (`src/mecanicos/`)

### 4.1 Dashboard de Revisiones Taller (`DashboardMecanico.tsx`)
- **Pestaña 1: Solicitudes Pendientes:**
  - Lista de buses reportados sin atención (`GET /api/v1/mantencion/pendientes`).
  - Selección por checklist de averías para **Autoasignación Atómica** (`POST /api/v1/mantencion/{id}/autoasignar`).
- **Pestaña 2: Mis Trabajos:**
  - Lista de solicitudes donde el mecánico participa (`GET /api/v1/mantencion/mis-trabajos`).
  - Despliegue de orden activa con indicadores de fallas resueltas vs pendientes.
  - **Check de Averías:** Marcar o desmarcar fallas individuales como resueltas (`PATCH /detalles/{id}/check`).
  - **Reporte de Falta de Repuestos:** Notificar si una avería está paralizada por stock (`PATCH /detalles/{id}/repuesto`).
  - **Bitácora Cronológica:** Agregar comentarios técnicos o notas de turno (`POST /comentarios`).
  - **Entrega de Turno / Término de Avance:** Salir del trabajo registrando avance (`POST /terminar-avance`) o liberar turno colectivo (`POST /liberar-turno`).
  - **Finalización de Orden y Liberación:** Validación obligatoria antes del cierre (`POST /finalizar`), exigiendo motivos si la pauta preventiva no está 100% evaluada o si quedan fallas pendientes.

### 4.2 Modal Pauta Preventiva 19 Ítems (`PautaPreventivaModal.tsx`)
- Modal especializado que consulta el catálogo maestro (`GET /pauta/items`) y las respuestas actuales (`GET /{id}/pauta`).
- Interfaz agrupada por categorías (Motor, Frenos, Dirección, Suspensión, Eléctrico, Luces, Cabina, etc.).
- Opciones por ítem: `OK` (verde), `DEFECTO` (rojo, con campo de observación obligatorio), `NO_APLICA` (gris).
- Guardado en lote optimizado (`POST /{id}/pauta`).

---

## 5. Módulo Supervisores (`src/supervisores/`)

### 5.1 Dashboard de Supervisión (`DashboardSupervision.tsx`)
- **Pestaña Alertas:**
  - Monitoreo en vivo de incidentes (`REPUESTO_FALTANTE`, `DEFECTO_PAUTA`, `BUS_SIN_MECANICOS`).
  - Filtro por criticidad (`CRITICA`, `ALTA`, `MEDIA`, `BAJA`).
  - Botón directo para abrir el modal de asignación de mecánicos a la falla alertada.
- **Pestaña Resumen & KPIs:**
  - Métricas agregadas: total solicitudes, en reparación, finalizadas, buses físicos en taller y fallas bloqueadas.
  - Distribución de fallas por categoría técnica.
- **Pestaña Auditoría Inmutable:**
  - Trazabilidad completa e inalterable de cada orden de taller (`GET /supervision/auditoria/buses-taller`).
  - Búsqueda por número de bus, estado o mecánico interviniente.
  - Despliegue de historial de mecánicos, bitácora y tiempos de inicio/cierre.
- **Pestaña Control de Patio:**
  - Lista de flota operativa (200 a 899).
  - Conmutador para marcar si un bus se encuentra físicamente en el taller (`PATCH /api/v1/buses/{id}/en-taller`) con motivo registrado.

### 5.2 Modal de Asignación Supervisora (`ModalAsignarFallas.tsx`)
- Permite a la supervisora seleccionar un mecánico colaborador y una o más fallas específicas de un bus para asignarlo formalmente (`POST /supervision/solicitudes/{id}/asignar` o `/mantencion/{id}/asignar`).

### 5.3 Gestión de Usuarios (`ListaUsuarios.tsx` / `CrearUsuario.tsx`)
- Lista de usuarios activos e inactivos (`GET /api/v1/auth/usuarios`).
- Formulario de alta administrativa con asignación de roles (`MECANICO`, `CONDUCTOR`, `SUPERVISOR`, `ADMIN`).
- Desactivación controlada mediante soft-delete (`DELETE /api/v1/auth/usuarios/{id}`).
