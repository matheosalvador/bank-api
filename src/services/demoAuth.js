const DEMO_EMAIL = 'demo@noria.fr';
const DEMO_PASSWORD = 'Noria2026!';
const TOKEN_KEY = 'noria_demo_token';

export function login(email, password) {
  if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    throw new Error('Identifiants incorrects.');
  }

  const token = `demo-${Date.now()}`;
  window.sessionStorage.setItem(TOKEN_KEY, token);
  return token;
}

export function getAuthToken() {
  return window.sessionStorage.getItem(TOKEN_KEY);
}

export function logout() {
  window.sessionStorage.removeItem(TOKEN_KEY);
}
