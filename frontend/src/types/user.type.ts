export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
}