import { saveImage } from "@/services/class-media";
import type { MediaType } from "./constant";

// From a URL
export const fetchImageAsBlob = async (
  url: string,
  id: string,
  type: MediaType,
  name: string,
): Promise<void> => {
  const response = await fetch(url);
  const blob = await response.blob();

  await saveImage(id, blob, type, name);
};
