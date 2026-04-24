export const getToken = localStorage.getItem('token') || undefined;

export const getUser = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user') as string)
  : null;

export function setToken(newToken: string | null) {
  if (newToken) {
    localStorage.setItem('token', newToken);
  } else {
    localStorage.removeItem('token');
  }
}

export function setUser(newUser: any | null) {
  if (newUser) {
    localStorage.setItem('user', JSON.stringify(newUser));
  } else {
    localStorage.removeItem('user');
  }
}

export function clearAuthData() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}