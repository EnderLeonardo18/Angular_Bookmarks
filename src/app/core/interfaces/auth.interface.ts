import { User } from "./user.interface";

// DTO para Login
export interface Login {
  email: string;
  password: string;
}

// DTO para Respuesta de Auth
export interface AuthResponse {
  token: string;
  user: User;
}
