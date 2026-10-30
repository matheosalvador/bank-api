const DEMO_EMAIL = 'demo@noria.fr';
const DEMO_PASSWORD = 'Noria2026!';
const TOKEN_KEY = 'noria_demo_token';
const EMAIL_KEY = 'noria_demo_email';

// Simule l'inscription (toujours réussite en démo)
export function register(email, password) {
  // Dans une vraie appli, on appellerait l'API ici
  // Pour la démo, on accepte n'importe quel email/mot de passe
  return { success: true, email };
}

export function login(email, password) {
  if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    throw new Error('Identifiants incorrects.');
  }

  const token = `demo-${Date.now()}`;
  window.sessionStorage.setItem(TOKEN_KEY, token);
  window.sessionStorage.setItem(EMAIL_KEY, email);
  return token;
}

export function getAuthToken() {
  return window.sessionStorage.getItem(TOKEN_KEY);
}

export function getAuthEmail() {
  return window.sessionStorage.getItem(EMAIL_KEY);
}

export function logout() {
  window.sessionStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(EMAIL_KEY);
}
