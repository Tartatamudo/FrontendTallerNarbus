/**
 * Validaciones desacopladas de la UI (DRY / Single Responsibility)
 */

export function validarTextoObligatorio(
  valor: string | undefined | null,
  nombreCampo: string
): { valido: boolean; error?: string } {
  if (!valor || !valor.trim()) {
    return {
      valido: false,
      error: `⚠️ OBLIGATORIO: Debes ingresar ${nombreCampo}.`,
    };
  }
  return { valido: true };
}

export function validarMaquinaBus(maquina: string | undefined | null): {
  valido: boolean;
  error?: string;
  maquinaLimpia?: string;
} {
  if (!maquina || !maquina.trim()) {
    return {
      valido: false,
      error: '⚠️ OBLIGATORIO: Debes ingresar el número de máquina.',
    };
  }
  const limpia = maquina.replace(/\D/g, '') || maquina.trim();
  return { valido: true, maquinaLimpia: limpia };
}

export function verificarBusEnLista(
  maquina: string | undefined | null,
  buses: Array<{ n_bus: string | number }>
): boolean {
  if (!maquina || !maquina.trim()) return false;
  const limpia = maquina.replace(/\D/g, '') || maquina.trim();
  return buses.some(
    (b) => String(b.n_bus).trim() === limpia || String(b.n_bus).trim() === maquina.trim()
  );
}
