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

  await saveImage(id, blob, type, name, url);
};

// Load PDF from public folder
export const loadPdfAsBlob = async (
  fileName: string,
  id: string,
  name: string,
): Promise<void> => {
  const url = `/${fileName}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load PDF: ${response.statusText}`);
  }
  const blob = await response.blob();
  await saveImage(id, blob, "pdf", name, url);
};
