

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  created_at?: string;
}


