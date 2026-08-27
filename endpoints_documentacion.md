# 📑 Documentación de API REST - Backend Taller Narbus

Documentación completa de todos los endpoints de la API, detallando método HTTP, ruta, encabezados requeridos, **Payload de Entrada (Body / Params)** y **Estructura de Respuesta (JSON Output)**.

---

## 1. Módulo de Autenticación & Usuarios (`/api/v1/auth`)

### 1.1 `POST /api/v1/auth/login`
* **Descripción**: Autenticación de usuario mediante JSON.
* **Headers**: `Content-Type: application/json`
* **Payload de Entrada**:
  ```json
  {
    "username": "mecanico1",
    "password": "meca123"
  }
  ```
* **Respuesta Exitosa (`200 OK`)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": 4,
      "nombre": "Pedro",
      "apellido": "Rodríguez",
      "username": "mecanico1",
      "rol": "MECANICO",
      "is_active": true,
      "created_at": "2026-08-27T16:00:00Z",
      "updated_at": "2026-08-27T16:00:00Z"
    }
  }
  ```

---

### 1.2 `GET /api/v1/auth/me`
* **Descripción**: Retorna los datos del perfil del usuario actualmente autenticado.
* **Headers**: `Authorization: Bearer <token>`
* **Payload de Entrada**: *(Ninguno)*
* **Respuesta Exitosa (`200 OK`)**:
  ```json
  {
    "id": 4,
    "nombre": "Pedro",
    "apellido": "Rodríguez",
    "username": "mecanico1",
    "rol": "MECANICO",
    "is_active": true,
    "created_at": "2026-08-27T16:00:00Z",
    "updated_at": "2026-08-27T16:00:00Z"
  }
  ```

---

### 1.3 `GET /api/v1/auth/usuarios`
* **Descripción**: Lista todos los usuarios registrados. *(Solo SUPERVISOR o ADMIN)*.
* **Headers**: `Authorization: Bearer <token>`
* **Query Params**: `skip` (opcional, default 0), `limit` (opcional, default 100).
* **Respuesta Exitosa (`200 OK`)**:
  ```json
  [
    {
      "id": 1,
      "nombre": "Administrador",
      "apellido": "Sistema",
      "username": "admin",
      "rol": "ADMIN",
      "is_active": true
    },
    {
      "id": 4,
      "nombre": "Pedro",
      "apellido": "Rodríguez",
      "username": "mecanico1",
      "rol": "MECANICO",
      "is_active": true
    }
  ]
  ```

---

### 1.4 `POST /api/v1/auth/usuarios`
* **Descripción**: Crear usuario desde el panel de administración. *(Solo SUPERVISOR o ADMIN)*.
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Payload de Entrada**:
  ```json
  {
    "nombre": "Luis",
    "apellido": "Morales",
    "username": "mecanico2",
    "password": "meca123",
    "rol": "MECANICO"
  }
  ```
* **Respuesta Exitosa (`201 Created`)**:
  ```json
  {
    "id": 5,
    "nombre": "Luis",
    "apellido": "Morales",
    "username": "mecanico2",
    "rol": "MECANICO",
    "is_active": true,
    "created_at": "2026-08-27T16:30:00Z"
  }
  ```

---

### 1.5 `DELETE /api/v1/auth/usuarios/{usuario_id}`
* **Descripción**: Deshabilita un usuario (`is_active = false` / Soft Delete). *(Solo SUPERVISOR o ADMIN)*.
* **Headers**: `Authorization: Bearer <token>`
* **Respuesta Exitosa (`200 OK`)**:
  ```json
  {
    "id": 5,
    "username": "mecanico2",
    "is_active": false
  }
  ```

---

## 2. Módulo de Buses (`/api/v1/buses`)

### 2.1 `GET /api/v1/buses/buscar`
* **Descripción**: Búsqueda autocompletada de números de bus (filtrados en rango 300..900 y el N° 10, ordenados de forma ascendente).
* **Query Params**: `query` (opcional, ej: `query=30`)
* **Respuesta Exitosa (`200 OK`)**:
  ```json
  [
    "301",
    "302"
  ]
  ```

---

## 3. Módulo de Reporte de Neumáticos (`/api/v1/formularioNeumatico`)

### 3.1 `POST /api/v1/formularioNeumatico`
* **Descripción**: Registro de inspección de neumáticos de bus.
* **Headers**: `Content-Type: multipart/form-data`
* **Payload de Entrada (Form Data)**:
  * `usuario_id`: `3`
  * `maquina`: `"301"`
  * `tipo_bus`: `"Doble Piso"`
  * `ruedas`: `'[{"posicion":"1D","estado":"Bueno","presion":110}]'`
  * `motivo`: `"Revisión periódica preventivo"`
  * `precio`: `"45000"`
  * `marca_fuego`: `"MF-301-A"` *(Opcional)*
  * `evidencia`: `[Archivo de Imagen / Foto]` *(Opcional)*
* **Respuesta Exitosa (`200 OK`)**:
  ```json
  {
    "status": "success",
    "message": "Formulario de neumáticos registrado exitosamente.",
    "data": {
      "id": 1,
      "usuario_id": 3,
      "bus_n_bus": "301",
      "tipo_bus": "Doble Piso",
      "ruedas": [
        {
          "posicion": "1D",
          "estado": "Bueno",
          "presion": 110
        }
      ],
      "motivo": "Revisión periódica preventivo",
      "precio": 45000.0,
      "marca_fuego": "MF-301-A",
      "evidencia_url": "/uploads/evidencias/reporte_1_evidencia.jpg",
      "fecha_subida": "2026-08-27T16:15:00Z"
    }
  }
  ```

---

## 4. Módulo de Mantención y Taller (`/api/v1/mantencion`)

### 4.1 `GET /api/v1/mantencion/categorias`
* **Descripción**: Obtiene la lista de categorías activas de fallas.
* **Headers**: `Authorization: Bearer <token>`
* **Respuesta Exitosa (`200 OK`)**:
  ```json
  [
    {
      "id": 1,
      "nombre": "FRENOS",
      "is_active": true
    },
    {
      "id": 2,
      "nombre": "ELECTRICO",
      "is_active": true
    }
  ]
  ```

---

### 4.2 `GET /api/v1/mantencion/fallas`
* **Descripción**: Obtiene el catálogo maestro de fallas preconcebidas.
* **Headers**: `Authorization: Bearer <token>`
* **Query Params**: `categoria_id` (opcional, ej: `categoria_id=1`)
* **Respuesta Exitosa (`200 OK`)**:
  ```json
  [
    {
      "id": 1,
      "categoria_id": 1,
      "categoria_nombre": "FRENOS",
      "nombre": "Desgaste de balatas / pastillas",
      "is_active": true
    },
    {
      "id": 2,
      "categoria_id": 1,
      "categoria_nombre": "FRENOS",
      "nombre": "Fuga de aire en cañería de frenos",
      "is_active": true
    }
  ]
  ```

---

### 4.3 `POST /api/v1/mantencion/solicitudes`
* **Descripción**: Creación de un reporte/solicitud de mantención de taller.
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Payload de Entrada**:
  ```json
  {
    "n_bus": "301",
    "descripcion_general": "Frenos respondiendo con lentitud en viaje",
    "foto_url": null,
    "detalles": [
      {
        "falla_id": 1,
        "descripcion_personalizada": "Ruido en rueda delantera izquierda"
      }
    ]
  }
  ```
* **Respuesta Exitosa (`201 Created`)**: *(Devuelve Objeto `SolicitudDTO` completo)*.

---

### 4.4 `GET /api/v1/mantencion/pendientes` (Pestaña 1 Mecánico)
* **Descripción**: Lista de buses esperando atención en taller (`REPORTADO` o `PENDIENTE_REASIGNACION`).
* **Headers**: `Authorization: Bearer <token>`
* **Respuesta Exitosa (`200 OK`)**: Lista de Objetos `SolicitudDTO`.

---

### 4.5 `GET /api/v1/mantencion/mis-trabajos` (Pestaña 2 Mecánico)
* **Descripción**: Lista de buses asignados activamente al mecánico actual (`is_activo = true`).
* **Headers**: `Authorization: Bearer <token>`
* **Respuesta Exitosa (`200 OK`)**: Lista de Objetos `SolicitudDTO`.

---

### 4.6 `GET /api/v1/mantencion/{id}`
* **Descripción**: Obtiene la información completa de una solicitud por su ID.
* **Headers**: `Authorization: Bearer <token>`
* **Respuesta Exitosa (`200 OK`)**: Objeto `SolicitudDTO`.

---

### 4.7 `POST /api/v1/mantencion/{id}/tomar`
* **Descripción**: Auto-asignación de bus por el mecánico (como Líder Responsable) + opción de agregar mecánicos colaboradores.
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Payload de Entrada**:
  ```json
  {
    "colaboradores_ids": [5],
    "comentario_inicial": "Iniciando diagnóstico en fosa 2"
  }
  ```
* **Respuesta Exitosa (`200 OK`)**: Objeto `SolicitudDTO` (con `estado = "EN_REPARACION"`).

---

### 4.8 `POST /api/v1/mantencion/{id}/desasignarme`
* **Descripción**: **`[ 🚪 Salir del Equipo ]`** - Desasignación individual del mecánico logueado.
* **Headers**: `Authorization: Bearer <token>`
* **Query Params**: `comentario` (opcional, ej: `?comentario=Fin%20de%20mi%20jornada`)
* **Respuesta Exitosa (`200 OK`)**: Objeto `SolicitudDTO`.

---

### 4.9 `POST /api/v1/mantencion/{id}/liberar-turno`
* **Descripción**: **`[ 🔄 Entregar / Pasar Turno ]`** - Liberación de turno del equipo completo de mecánicos.
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Payload de Entrada**:
  ```json
  {
    "comentario": "Cambio de turno noche. Balatas delanteras cambiadas, faltan traseras."
  }
  ```
* **Respuesta Exitosa (`200 OK`)**: Objeto `SolicitudDTO` (con `estado = "PENDIENTE_REASIGNACION"`).

---

### 4.10 `PATCH /api/v1/mantencion/{id}/detalles/{detalle_id}/check`
* **Descripción**: Marcar o desmarcar una falla resuelta guardando timestamp y el ID del mecánico.
* **Headers**: `Authorization: Bearer <token>`
* **Query Params**: `resuelto` (`true` o `false`)
* **Respuesta Exitosa (`200 OK`)**: Objeto `SolicitudDTO`.

---

### 4.11 `POST /api/v1/mantencion/{id}/comentarios`
* **Descripción**: Agregar una entrada a la bitácora independiente de la solicitud.
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Payload de Entrada**:
  ```json
  {
    "comentario": "Se solicitaron repuestos de frenos al almacén central."
  }
  ```
* **Respuesta Exitosa (`200 OK`)**: Objeto `SolicitudDTO`.

---

### 4.12 `POST /api/v1/mantencion/{id}/finalizar`
* **Descripción**: Finaliza la orden de taller y marca el bus como **`DISPONIBLE`**.
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Payload de Entrada**:
  ```json
  {
    "comentario_final": "Pruebas de ruta realizadas exitosamente. Bus en óptimas condiciones."
  }
  ```
* **Respuesta Exitosa (`200 OK`)**: Objeto `SolicitudDTO` (con `estado = "FINALIZADO"` y `fecha_cierre`).

---

## 5. Módulo de Supervisión & Auditoría (`/api/v1/supervision`)

### 5.1 `GET /api/v1/supervision/auditoria/buses-taller`
* **Descripción**: Dashboard de auditoría en tiempo real para Supervisores y Admins. Retorna la trazabilidad inmutable de todos los buses que han pasado por taller.
* **Headers**: `Authorization: Bearer <token>`
* **Respuesta Exitosa (`200 OK`)**: Lista completa de Objetos `SolicitudDTO` con todo el historial de turnos y bitácora.

---

## 🧩 Estructura Completa del Objeto `SolicitudDTO`

La mayoría de los endpoints de mantención retornan la solicitud completa estructurada de la siguiente manera:

```json
{
  "id": 1,
  "n_bus": "301",
  "usuario_creador_id": 3,
  "creador_nombre": "Juan Pérez",
  "mecanico_cierre_id": 4,
  "mecanico_cierre_nombre": "Pedro Rodríguez",
  "estado": "EN_REPARACION",
  "descripcion_general": "Revisión urgente de sistema de frenos",
  "foto_url": null,
  "fecha_creacion": "2026-08-27T16:00:00Z",
  "fecha_cierre": null,
  "detalles": [
    {
      "id": 1,
      "solicitud_id": 1,
      "falla_id": 1,
      "categoria_nombre": "FRENOS",
      "falla_nombre": "Desgaste de balatas / pastillas",
      "descripcion_personalizada": "Ruido en rueda delantera izquierda",
      "resuelto": true,
      "mecanico_resolvio_id": 4,
      "mecanico_resolvio_nombre": "Pedro Rodríguez",
      "fecha_creacion": "2026-08-27T16:00:00Z",
      "fecha_resolucion": "2026-08-27T16:45:00Z"
    }
  ],
  "mecanicos": [
    {
      "id": 1,
      "solicitud_id": 1,
      "mecanico_id": 4,
      "mecanico_nombre": "Pedro Rodríguez",
      "es_lider_responsable": true,
      "is_activo": true,
      "fecha_asignacion": "2026-08-27T16:10:00Z",
      "fecha_desasignacion": null
    }
  ],
  "comentarios": [
    {
      "id": 1,
      "solicitud_id": 1,
      "usuario_id": 4,
      "usuario_nombre": "Pedro Rodríguez",
      "tipo": "ASIGNACION",
      "comentario": "Pedro Rodríguez tomó el bus como Líder Responsable.",
      "fecha_registro": "2026-08-27T16:10:00Z"
    }
  ]
}
```
