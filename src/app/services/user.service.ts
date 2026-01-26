import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../core/interfaces/user.interface';
import { UserDTO } from '../core/dtos/user.dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api/users';

  constructor() { }

  // Obtiene la lista paginada del UserController@index
  // Retorna un array de Model User
  getUser(){
    return this.http.get<User[]>(`${this.apiUrl}`);
  }

  getUserById(id: number) {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // Registra un usuario usando StoreUserRequest en Laravel
  // Recibe un DTO y retorna el Modelo creado
  createUser(userData: UserDTO){
    return this.http.post<User>(`${this.apiUrl}`, userData);
  }

  // Actualiza usando UpdateUserRequest en Laravel
  updateUser(id: number, userData: UserDTO) {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData);
  }

  deleteUser(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }


}
