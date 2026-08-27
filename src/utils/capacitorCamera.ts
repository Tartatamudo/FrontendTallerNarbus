import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

/**
 * Abre la cámara nativa del celular para tomar una foto.
 * Retorna la imagen comprimida en Base64 DataUrl o null si cancela.
 */
export const capturarFotoCamara = async (): Promise<string | null> => {
  try {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      width: 1200
    });
    return image.dataUrl || null;
  } catch (error) {
    console.warn("Usuario canceló o falló cámara nativa:", error);
    return null;
  }
};

/**
 * Abre la galería de fotos del celular/dispositivo para seleccionar una foto.
 * Retorna la imagen comprimida en Base64 DataUrl o null si cancela.
 */
export const seleccionarFotoGaleria = async (): Promise<string | null> => {
  try {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
      width: 1200
    });
    return image.dataUrl || null;
  } catch (error) {
    console.warn("Usuario canceló o falló selección de galería:", error);
    return null;
  }
};
