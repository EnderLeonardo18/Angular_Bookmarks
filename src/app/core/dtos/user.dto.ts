// DTO para Crear/Actualizar Usuario
export interface UserDTO {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  role: string;
  current_password?: string;  // Para el UpdateUserRequet de Laravel
}
