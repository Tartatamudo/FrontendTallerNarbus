# Reglas e Instrucciones para Agentes AI (.agents/AGENTS.md)

## 0. Enfoque Exclusivo Frontend
- **Repositorio Frontend Autónomo:** Este repositorio es exclusivamente de **Frontend Web y Móvil Híbrido** (`FrontendTallerNarbus` / `ProtoNeumaticos`). El Backend se maneja en un repositorio completamente separado (`BackendTallerNarbus`).
- **Sin Interferencia de Backend:** No se deben generar archivos de backend (FastAPI, migraciones Alembic, SQLAlchemy o scripts de base de datos) dentro de este repositorio. Todo el código corresponde a componentes React, servicios de API (Axios), hooks, estilos y configuración de empaquetado móvil con Capacitor.

## 1. Consumo de API y Contratos REST
- **Contratos Obligatorios:** Toda interacción con el servidor debe ceñirse estrictamente a las especificaciones y contratos de:
  - `trazabilidad/05_CONTRATOS_API_FRONTEND.md`
  - `trazabilidad/06_CATALOGO_ENDPOINTS_PAYLOADS_RESPUESTAS.md`
- **Cliente HTTP Centralizado:** Todas las peticiones HTTP DEBEN realizarse a través de `src/api/apiClient.ts`, el cual inyecta automáticamente el token JWT Bearer (`access_token`) mediante interceptores de Axios y maneja timeouts.
- **Tipado Estricto de DTOs:** Cada endpoint debe contar con interfaces TypeScript para su payload de entrada (`RequestDTO`) y su estructura de respuesta (`ResponseDTO`). Queda prohibido el uso indiscriminado de `any` para modelos de datos de negocio.

## 2. Manejo Centralizado de Errores
- **Formato Estándar NarbusException:** El backend responde errores bajo la estructura uniforme:
  ```json
  {
    "error": {
      "code": "BUSINESS_RULE_VIOLATION",
      "message": "Descripción comprensible del error",
      "detail": null
    }
  }
  ```
- **Uso Obligatorio de `getApiErrorMessage`:** En cualquier captura de excepción (`catch (err)`), se DEBE invocar a `getApiErrorMessage(err, fallback)` ubicado en `src/utils/apiErrors.ts`. Esto garantiza extraer el mensaje amigable de `error.message`, los errores de validación 422 de Pydantic (`detail`) o los errores de conectividad de red sin romper la interfaz de usuario.

## 3. Compatibilidad Híbrida y Móvil (Capacitor 8)
- **Entornos Web y Nativo (Android):** La aplicación funciona tanto en navegadores de escritorio (supervisores/administradores) como en dispositivos móviles y tablets Android utilizadas en el taller por conductores y mecánicos.
- **Almacenamiento Desacoplado:** La persistencia de datos (tokens, usuario logueado, banderas de sesión) DEBE usar `src/utils/storage.ts` (`guardarDato`, `obtenerDato`, `eliminarDato`), el cual utiliza `@capacitor/preferences` de forma primaria y `localStorage` como fallback transparente.
- **Captura Fotográfica Dual:** Para subir evidencias en formularios (mantención y neumáticos), se debe usar el componente `PhotoSelector` y la utilidad `src/utils/capacitorCamera.ts` (`@capacitor/camera`), con fallback a `<input type="file">` cuando se ejecute en navegador web.

## 4. Trazabilidad del Proyecto (Full Frontend)
- **Estructura de la Carpeta `trazabilidad/`:**
  - `trazabilidad/avances/`: Contiene archivos JSON numerados registrando cada avance (`0001_...json`) e hitos históricos desfasados (`HIST_00X_...json`).
  - `01_ESTADO_ACTUAL_PROYECTO.md`: Documento vivo con el estado de las pantallas, servicios y módulos.
  - `02_CONTENIDO_Y_ALCANZABLE_FRONTEND.md`: Especificación técnica del alcance, stack y dependencias.
  - `03_ESPECIFICACION_MODULOS_FRONTEND.md`: Detalle funcional por pantalla, permisos por rol y flujos.
  - `04_PLAN_IMPLEMENTACION_FRONTEND.md`: Plan global de fases del Frontend.
  - `05_CONTRATOS_API_FRONTEND.md`: Especificación de integración con la API REST del backend.
  - `06_CATALOGO_ENDPOINTS_PAYLOADS_RESPUESTAS.md`: Diccionario de los 43 endpoints del backend.
- **Registro JSON de Avances Obligatorio (Incluyendo Decisiones Técnicas):** Cada iteración completada en `trazabilidad/avances/` debe incluir de manera **obligatoria** el bloque `decisions` justificando decisiones de UI/UX, arquitectura de estado o consumo de endpoints.

  Estructura JSON estándar:
  ```json
  {
    "schemaVersion": "1.0",
    "sequence": 1,
    "id": "AV-0001",
    "timestamp": "2026-09-03T13:45:00Z",
    "phase": "nombre_fase",
    "milestone": { "id": "FRONT-1", "name": "Nombre Hito", "statusBefore": "in_progress", "statusAfter": "completed" },
    "type": "completed",
    "summary": "Resumen detallado de la tarea de frontend completada.",
    "scope": {
      "planned": ["Items planeados..."],
      "completed": ["Items completados..."],
      "pending": ["Items pendientes..."],
      "outOfScope": ["Fuera de alcance..."]
    },
    "changes": [{ "path": "ruta/al/archivo", "action": "created|modified|deleted", "summary": "Descripción del cambio" }],
    "decisions": [
      {
        "id": "DEC-001",
        "title": "Título de la decisión técnica",
        "rationale": "Justificación de diseño o integración",
        "consequences": "Efecto o beneficio en el frontend"
      }
    ],
    "verification": [{ "command": "Comando de prueba", "result": "passed|failed|not_run", "evidence": "Salida de la prueba" }],
    "blockers": [],
    "nextStep": "Siguiente paso en el frontend.",
    "git": { "repository": "FrontendTallerNarbus", "branch": "develop", "commit": "hash", "dirty": false },
    "notes": ["Notas adicionales..."]
  }
  ```

## 5. Estándares UI/UX y Accesibilidad en Taller
- **Diseño para Entorno Operacional:** Las pantallas de conductores y mecánicos deben tener botones táctiles de gran tamaño (mínimo 44x44px), alto contraste y fuentes legibles bajo luz solar directa o grasa en pantalla.
- **Feedback Visual Inmediato:** Toda operación asíncrona debe mostrar estados de carga (`loading`, `disabled` en botones de envío para evitar doble submit) y alertas claras de éxito o error.
- **Validación Preventiva:** Formularios críticos (cierre de orden, reporte de neumático con precio/fuego, autoasignación) deben contar con modales de confirmación previa para evitar errores involuntarios en terreno.

## 6. Metodología GitFlow
- **Flujo de Ramas:** El desarrollo se realiza en ramas `feature/*` que se integran a `develop` respetando GitFlow.
- **Prohibido Merge Directo a Main:** NUNCA se realiza merge directo de ramas `feature/*` a la rama `main`.
