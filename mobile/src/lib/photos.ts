import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

export const MAX_PHOTOS = 8;
const MAX_WIDTH = 1280;
// Vercel rejects request bodies over ~4.5 MB; keep the photo payload well under that.
export const MAX_PAYLOAD_BYTES = 3.8 * 1024 * 1024;

export type Photo = { uri: string; dataUrl: string; bytes: number };

async function toPhoto(asset: ImagePicker.ImagePickerAsset): Promise<Photo> {
  const ctx = ImageManipulator.manipulate(asset.uri);
  if (asset.width > MAX_WIDTH) ctx.resize({ width: MAX_WIDTH });
  const image = await ctx.renderAsync();
  const result = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.6, base64: true });
  const dataUrl = `data:image/jpeg;base64,${result.base64}`;
  return { uri: result.uri, dataUrl, bytes: dataUrl.length };
}

export async function pickPhotos(source: "library" | "camera", remaining: number): Promise<Photo[]> {
  if (remaining <= 0) return [];
  const perm =
    source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error("Autorisez l'accès dans les réglages pour ajouter des photos.");

  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 1 };
  const result =
    source === "camera"
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync({ ...options, allowsMultipleSelection: true, selectionLimit: remaining });

  if (result.canceled) return [];
  return Promise.all(result.assets.slice(0, remaining).map(toPhoto));
}
