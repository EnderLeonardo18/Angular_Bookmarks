import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { AuthResponse, Login } from '../core/interfaces/auth.interface';
import { User } from '../core/interfaces/user.interface';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api'

  // Creamos un Subject para manejar el estado del usuario de forma reactiva
  private currentUserSubject = new BehaviorSubject<User | null>(
    JSON.parse(localStorage.getItem('user_data') || 'null')
  );


  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() { }


  // Getter para obtener los datos del usuario actual de forma síncrona (usado en admin.guard)
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Método para verificar si hay un token activo (usado en auth.guard)
  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }


  // Usamos el DTO LoginRequest y esperamos AuthResponse
  login(credentials: Login){
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        // Guardamos el token que Laravel AuthController nos envía
        localStorage.setItem('auth_token', res.token);
        // Guardamos los datos del usuario (nombre, rol, etc.)
        localStorage.setItem('user_data', JSON.stringify(res.user))

        this.currentUserSubject.next(res.user);
      })
    );
  }

  getToken(){
    return localStorage.getItem('auth_token');
  }

  logout() {
    // Al cerrar sesión, eliminamos el token
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data'); // Limpiar datos del usuario
    this.currentUserSubject.next(null);
  }


}
