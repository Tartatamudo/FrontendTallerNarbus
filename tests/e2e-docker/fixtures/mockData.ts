/**
 * Fixtures y datos simulados basados fielmente en los contratos REST oficiales:
 * trazabilidad/05_CONTRATOS_API_FRONTEND.md y 06_CATALOGO_ENDPOINTS_PAYLOADS_RESPUESTAS.md
 */

export interface MockUser {
  id: number;
  username: string;
  nombre_completo: string;
  rut: string;
  email: string;
  rol: 'CONDUCTOR' | 'MECANICO' | 'SUPERVISOR' | 'ADMIN';
  is_active: boolean;
}

export const MOCK_USERS: Record<string, MockUser> = {
  conductor: {
    id: 1,
    username: 'conductor_juan',
    nombre_completo: 'Juan Conductor Test',
    rut: '11.111.111-1',
    email: 'conductor@narbus.cl',
    rol: 'CONDUCTOR',
    is_active: true,
  },
  mecanico: {
    id: 2,
    username: 'mecanico_pedro',
    nombre_completo: 'Pedro Mecánico Test',
    rut: '22.222.222-2',
    email: 'mecanico@narbus.cl',
    rol: 'MECANICO',
    is_active: true,
  },
  supervisor: {
    id: 3,
    username: 'supervisor_ana',
    nombre_completo: 'Ana Supervisora Test',
    rut: '33.333.333-3',
    email: 'supervisor@narbus.cl',
    rol: 'SUPERVISOR',
    is_active: true,
  },
  admin: {
    id: 4,
    username: 'admin_carlos',
    nombre_completo: 'Carlos Administrador Test',
    rut: '44.444.444-4',
    email: 'admin@narbus.cl',
    rol: 'ADMIN',
    is_active: true,
  },
};

/**
 * Genera un JWT mock no-expirado con el rol y RUT especificado
 */
export function createMockJwt(user: MockUser, isExpired = false): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.rut,
      rut: user.rut,
      rol: user.rol,
      username: user.rut,
      nombre_completo: user.nombre_completo,
      iat: now - 3600,
      exp: isExpired ? now - 100 : now + 86400, // Válido por 24h si no está expirado
    })
  ).toString('base64url');
  const signature = Buffer.from('mock-narbus-test-signature').toString('base64url');
  return `${header}.${payload}.${signature}`;
}

/**
 * Catálogo mock de buses de taller (rango 200-899)
 */
export const MOCK_BUSES = [
  { id: 1, n_bus: '201', numero_bus: 201, patente: 'KJHG12', marca: 'Scania', modelo: 'K400', en_taller: true, is_active: true, activo: true },
  { id: 2, n_bus: '205', numero_bus: 205, patente: 'PLKJ88', marca: 'Mercedes-Benz', modelo: 'O500', en_taller: false, is_active: true, activo: true },
  { id: 3, n_bus: '310', numero_bus: 310, patente: 'TYUI45', marca: 'Volvo', modelo: 'B450R', en_taller: true, is_active: true, activo: true },
  { id: 4, n_bus: '450', numero_bus: 450, patente: 'MNBV99', marca: 'Scania', modelo: 'K410', en_taller: false, is_active: true, activo: true },
  { id: 5, n_bus: '520', numero_bus: 520, patente: 'QWER23', marca: 'Mercedes-Benz', modelo: 'O500RSD', en_taller: true, is_active: true, activo: true },
];

/**
 * Órdenes de trabajo mock para Dashboard de Mecánicos y Supervisión
 */
export const MOCK_ORDENES_MECANICO = [
  {
    id: 101,
    bus_id: 1,
    n_bus: '201',
    numero_bus: 201,
    estado: 'PENDIENTE',
    fecha_creacion: new Date(Date.now() - 3600000).toISOString(),
    fecha_ingreso: new Date(Date.now() - 3600000).toISOString(),
    fecha_finalizacion: null,
    creado_por_id: 1,
    usuario_creador_id: 1,
    usuario_creador_nombre: 'Juan Conductor Test',
    conductor_nombre: 'Juan Conductor Test',
    descripcion_general: 'Frenos largos y pérdida de refrigerante',
    en_taller: true,
    detalles: [
      {
        id: 1001,
        solicitud_id: 101,
        reporte_id: 101,
        categoria_id: 1,
        categoria_nombre: 'Frenos',
        categoria: 'FRENOS',
        descripcion_personalizada: 'Frenos largos al frenar a más de 80 km/h',
        descripcion: 'Frenos largos al frenar a más de 80 km/h',
        estado: 'PENDIENTE',
        resuelto: false,
        resuelta: false,
        falta_repuesto: false,
        repuesto_faltante: false,
        motivo_repuesto_faltante: null,
        fecha_repuesto_solicitado: null,
        mecanicos_asignados: [],
        co_responsables: [],
        fotos: [],
      },
      {
        id: 1002,
        solicitud_id: 101,
        reporte_id: 101,
        categoria_id: 3,
        categoria_nombre: 'Motor',
        categoria: 'MOTOR',
        descripcion_personalizada: 'Pérdida de refrigerante en manguera superior',
        descripcion: 'Pérdida de refrigerante en manguera superior',
        estado: 'PENDIENTE',
        resuelto: false,
        resuelta: false,
        falta_repuesto: false,
        repuesto_faltante: false,
        motivo_repuesto_faltante: null,
        fecha_repuesto_solicitado: null,
        mecanicos_asignados: [],
        co_responsables: [],
        fotos: [],
      },
    ],
    pauta: [],
    comentarios: [],
    mecanicos: [],
  },
  {
    id: 102,
    bus_id: 3,
    n_bus: '310',
    numero_bus: 310,
    estado: 'EN_PROCESO',
    fecha_creacion: new Date(Date.now() - 7200000).toISOString(),
    fecha_ingreso: new Date(Date.now() - 7200000).toISOString(),
    fecha_finalizacion: null,
    creado_por_id: 1,
    usuario_creador_id: 1,
    usuario_creador_nombre: 'Juan Conductor Test',
    conductor_nombre: 'Juan Conductor Test',
    descripcion_general: 'Alternador no carga batería auxiliar',
    en_taller: true,
    mecano_lider_id: 2,
    colaboradores_ids: [2],
    detalles: [
      {
        id: 1003,
        solicitud_id: 102,
        reporte_id: 102,
        categoria_id: 2,
        categoria_nombre: 'Eléctrico',
        categoria: 'ELECTRICO',
        descripcion_personalizada: 'Alternador no carga batería auxiliar',
        descripcion: 'Alternador no carga batería auxiliar',
        estado: 'EN_PROCESO',
        resuelto: false,
        resuelta: false,
        falta_repuesto: false,
        repuesto_faltante: false,
        motivo_repuesto_faltante: null,
        fecha_repuesto_solicitado: null,
        mecanicos_asignados: [{ mecanico_id: 2, mecanico_nombre: 'Pedro Mecánico Test' }],
        co_responsables: [{ id: 2, nombre_completo: 'Pedro Mecánico Test' }],
        fotos: [],
      },
    ],
    mecanicos: [
      {
        id: 1,
        solicitud_id: 102,
        mecanico_id: 2,
        mecanico_nombre: 'Pedro Mecánico Test',
        es_lider_responsable: true,
        is_activo: true,
        fecha_asignacion: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
    pauta: [
      { id: 1, item_id: 1, nombre_item: 'Frenos de servicio', estado: 'OK', observacion: null },
      { id: 2, item_id: 2, nombre_item: 'Freno de estacionamiento', estado: 'OK', observacion: null },
    ],
    comentarios: [
      {
        id: 501,
        solicitud_id: 102,
        reporte_id: 102,
        usuario_id: 2,
        usuario_nombre: 'Pedro Mecánico Test',
        autor_id: 2,
        autor_nombre: 'Pedro Mecánico Test',
        comentario: 'Se procedió al desmontaje del alternador para revisión de carbones.',
        mensaje: 'Se procedió al desmontaje del alternador para revisión de carbones.',
        fecha_registro: new Date(Date.now() - 3600000).toISOString(),
        fecha: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
  },
];

/**
 * Pauta preventiva: 11 ítems maestros según contrato de taller
 */
export const MOCK_PAUTA_ITEMS = [
  'Frenos de servicio',
  'Freno de estacionamiento',
  'Dirección y terminales',
  'Suspensión y amortiguadores',
  'Neumáticos y llantas',
  'Luces exteriores y señalizadores',
  'Sistema eléctrico y baterías',
  'Motor y fugas de fluidos',
  'Transmisión y embrague',
  'Carrocería e interiores',
  'Equipamiento de seguridad',
];

/**
 * Resumen del Taller (KPIs)
 */
export const MOCK_RESUMEN_TALLER = {
  fecha_generacion: new Date().toISOString(),
  metricas_estado: {
    total_solicitudes: 14,
    reportadas: 5,
    en_reparacion: 4,
    pendiente_reasignacion: 1,
    finalizadas: 4,
    buses_fisicamente_en_taller: 3,
    fallas_bloqueadas_por_repuesto: 2,
  },
  porcentaje_resolucion_fallas: 75,
  total_fallas_registradas: 20,
  total_fallas_resueltas: 15,
  fallas_por_categoria: [
    { categoria_id: 1, categoria_nombre: 'Frenos', total_fallas: 6 },
    { categoria_id: 2, categoria_nombre: 'Motor', total_fallas: 4 },
  ],
  buses_activos_taller: ['201', '310'],
};

/**
 * Alertas de Supervisión
 */
export const MOCK_ALERTAS = [
  {
    solicitud_id: 101,
    n_bus: '201',
    tipo: 'REPUESTO_FALTANTE',
    severidad: 'CRITICA',
    mensaje: 'Bus 201 tiene avería de frenos esperando pastillas delanteras.',
    detalle_id: 1001,
    fecha_deteccion: new Date().toISOString(),
  },
  {
    solicitud_id: 103,
    n_bus: '520',
    tipo: 'BUS_SIN_MECANICOS',
    severidad: 'ALTA',
    mensaje: 'Bus 520 ingresó hace 4 horas y no cuenta con técnicos activos.',
    detalle_id: null,
    fecha_deteccion: new Date().toISOString(),
  },
];

/**
 * Auditoría de Taller
 */
export const MOCK_AUDITORIA = [
  {
    id: 99,
    solicitud_id: 99,
    n_bus: '205',
    estado: 'FINALIZADA',
    conductor_nombre: 'Mario Chofer',
    descripcion_general: 'Mantención preventiva y cambio de balatas',
    fecha_creacion: '2026-09-08T08:00:00Z',
    fecha_cierre: '2026-09-08T17:30:00Z',
    detalles: [
      {
        id: 901,
        solicitud_id: 99,
        descripcion_personalizada: 'Cambio de balatas traseras',
        resuelto: true,
        falla: { nombre: 'Balatas' },
      },
    ],
    mecanicos: [
      {
        mecanico_id: 2,
        mecanico_nombre: 'Pedro Mecánico Test',
        minutos_trabajados: 120,
        activo: false,
      },
    ],
    comentarios: [],
  },
];
