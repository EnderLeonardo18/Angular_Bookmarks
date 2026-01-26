import { User } from "./user.interface";


export interface Bookmark {
  id: number;
  title: string;
  url: string;
  description?: string;
  image_preview?: string; // Para la vista previa (Thumbnail)
  category: 'Anime' | 'Manga' | 'Youtube' | 'Otro';
  user_id: number;
  user?: User; // Relación opcional con el dueño
  created_at?: string;
}
