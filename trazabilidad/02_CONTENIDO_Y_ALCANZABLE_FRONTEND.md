# Contenido, Tecnologías y Alcance Técnico del Frontend Narbus

## Tecnologías Utilizadas (Tech Stack)

### Core & Framework Web
- **React 19 (19.2.8)**: Biblioteca declarativa para la construcción de interfaces de usuario interactivas.
- **TypeScript (~6.0.2)**: Tipado estático riguroso para interfaces de DTOs, componentes y contratos de API.
- **Vite (8.2.1)**: Entorno de construcción (bundler) ultrarrápido con Hot Module Replacement (HMR) y compilación optimizada.
- **Node.js 20+**: Entorno de ejecución para herramientas de compilación y empaquetado.

### Empaquetado Móvil Híbrido (Capacitor)
- **@capacitor/core (^8.5.0)**: Capa de abstracción para la ejecución multiplataforma web/nativa.
- **@capacitor/cli (^8.5.0)**: Herramienta de línea de comandos para sincronización y compilación de proyectos móviles.
- **@capacitor/android (^8.5.0)**: Runtime nativo de Android para generar la APK distribuible en el taller.
- **@capacitor/camera (^8.2.3)**: Acceso nativo a la cámara del dispositivo móvil para captura fotográfica de evidencias en formularios.
- **@capacitor/preferences (^8.0.1)**: Almacenamiento seguro persistente de credenciales (JWT token) y datos de sesión en disco nativo.

### Comunicación HTTP & Red
- **Axios (^1.19.0)**: Cliente HTTP basado en promesas con interceptores de autenticación Bearer, configuración de base URL dinámica y manejo de timeouts.

### UI, Íconos y Estilos
- **Lucide React (^1.34.0)**: Paquete de iconografía vectorial coherente, moderna y ligera.
- **Tailwind CSS / Vanilla CSS**: Sistema híbrido de utilidades de diseño responsivo y hojas de estilo modulares (`*.css`) por componente para control granular de interfaces industriales.

### Calidad de Código y Linters
- **Oxlint (^1.78.0)**: Linter de JavaScript/TypeScript de alto rendimiento para asegurar buenas prácticas y detección temprana de errores de sintaxis.

---

## Alcance Incluido

1. **Aplicación Web SPA Multi-Rol:**
   - Control de acceso basado en roles (`CONDUCTOR`, `MECANICO`, `SUPERVISOR`, `ADMIN`).
   - Gestión de sesión con token JWT persistente y refresco automático de estado.
2. **Operación de Taller en Terreno (Móvil / Tablet):**
   - Formulario de solicitud de mantención con selección asistida de máquina y fotos de evidencia.
   - Formulario de reemplazo de neumáticos con croquis interactivo de ruedas y datos de vulcanización.
   - Pauta preventiva de 19 ítems estructurada por categorías con estados `OK`, `DEFECTO` y `NO_APLICA`.
   - Autoasignación atómica de averías y reporte en tiempo real de fallas bloqueadas por falta de repuestos.
3. **Control y Supervisión en Tiempo Real (Escritorio / Web):**
   - Monitor de telemetría con KPIs consolidados del taller.
   - Centro de alertas proactivas con filtrado por criticidad.
   - Tablero de auditoría inmutable con trazabilidad total de buses y mecánicos.
   - Control de presencia física en patio para flota operativa (rango 200 a 899).
4. **Empaquetado Android:**
   - Proyecto Android preconfigurado en directorio `android/` con soporte de cámara y permisos necesarios.

---

## Alcance No Incluido (Out of Scope)
- **Desarrollo de Endpoints Backend:** El frontend consume la API existente; no se crean controladores ni esquemas de base de datos en este repositorio.
- **Notificaciones Push Nativo en Segundo Plano:** El frontend consulta las alertas vía endpoints REST en tiempo real; no incluye servicio Firebase Cloud Messaging (FCM) nativo por el momento.
- **Modo Offline Total con Sincronización Bidireccional:** Se cuenta con persistencia local de sesión y credenciales, pero las operaciones del taller requieren conexión activa (LAN o WiFi de taller) con el servidor de Backend.
