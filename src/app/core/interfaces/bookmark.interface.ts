import { User } from "./user.interface";

export const BOOKMARK_CATEGORIES = ['Anime', 'Manga', 'Youtube', 'Manhwa', 'Series', 'Deportes ',
                                    'Peliculas', 'RRSS', 'Programacion', 'Otro'] as const;

export const BOOKMARK_STATUSES = ['En Emisión', 'Terminado', 'Visto', 'Leído', 'Pendiente'] as const;


export type BookmarkCategory = typeof BOOKMARK_CATEGORIES[number];
export type BookmarkStatus = typeof BOOKMARK_STATUSES[number];


export interface Bookmark {
  id: number;
  title: string;
  url: string;
  description?: string;
  image_preview?: string; // Para la vista previa (Thumbnail)
  category: BookmarkCategory;
  status: BookmarkStatus;
  progress_note?: string; // Opcional (Texto) - Usamos Type aquí
  progress_url?: string;  // Opcional (Link)  - Usamos Type aquí

  user_id: number;
  user?: User; // Relación opcional con el dueño
  created_at?: string;
}
