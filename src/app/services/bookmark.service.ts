import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Bookmark } from '../core/interfaces/bookmark.interface';
import { BookmarkDTO } from '../core/dtos/bookmark.dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api/bookmarks';

  constructor() { }


  // Obtener todos los marcadores del usuario logeado
  getBookmarks() {
    return this.http.get<Bookmark[]>(`${this.apiUrl}`);
  }

  getBookmarkById(id: number) {
    return this.http.get<Bookmark>(`${this.apiUrl}/${id}`);
  }


  // Crear un nuevo marcador (Enviamos DTO, recibimos Bookmark completo)
  createBookmark(data: BookmarkDTO) {
    return this.http.post<Bookmark>(`${this.apiUrl}`, data);
  }

    // Actualiza
  updateBookmark(id: number, data: BookmarkDTO) {
     return this.http.put<Bookmark>(`${this.apiUrl}/${id}`, data);
  }

  updateOrder(orderedIds: number[]): Observable<any>{
    return this.http.post(`${this.apiUrl}/reorder`, { ordered_ids: orderedIds })
  }



  deleteBookmark(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }


  // Ver todos los marcadores si soy Admin
  getAllBookmarksAdmin() {
    return this.http.get<Bookmark[]>(`http://localhost:8000/api/admin/bookmarks`);
  }


}
