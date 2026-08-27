import { Preferences } from '@capacitor/preferences';

export const guardarDato = async (key: string, value: string) => {
  try {
    await Preferences.set({ key, value });
  } catch (e) {
    console.warn("Preferences storage error, using localStorage fallback", e);
  }
  localStorage.setItem(key, value);
};

export const obtenerDato = async (key: string): Promise<string | null> => {
  try {
    const { value } = await Preferences.get({ key });
    if (value !== null && value !== undefined) return value;
  } catch (e) {
    console.warn("Preferences storage get error, using localStorage fallback", e);
  }
  return localStorage.getItem(key);
};

export const eliminarDato = async (key: string) => {
  try {
    await Preferences.remove({ key });
  } catch (e) {
    console.warn("Preferences storage remove error", e);
  }
  localStorage.removeItem(key);
};
