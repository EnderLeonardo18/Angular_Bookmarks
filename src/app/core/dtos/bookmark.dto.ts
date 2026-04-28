

export interface BookmarkDTO {
  title: string;
  url: string;
  description?: string;
  category: string;

  image_preview?: string;
  status: string;         // Nuevo
  progress_note?: string; // Nuevo
  progress_url?: string;  // Nuevo
}
