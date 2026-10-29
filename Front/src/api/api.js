/**
 * Helper unique pour tous les appels à l'API Backend.
 * URL de base : http://localhost:8000 (configurée une seule fois).
 * 
 * Utilisation :
 *   api("GET", "/accounts")
 *   api("POST", "/auth/login", { email: "test@test.com", password: "1234" })
 *   api("POST", "/accounts/1/deposits", { amount: 100 }, { token: "xyz" })
 */

const API_BASE_URL = "http://localhost:8000";

/**
 * Effectue une requête HTTP vers l'API Backend.
 * 
 * @param {string} method - Méthode HTTP (GET, POST, PUT, DELETE, PATCH)
 * @param {string} endpoint - Chemin de l'endpoint (ex: "/accounts", "/auth/login")
 * @param {Object|null} data - Données à envoyer dans le body (pour POST/PUT/PATCH)
 * @param {Object} options - Options supplémentaires :
 *   @param {string} [options.token] - Token JWT pour l'authentification (Bearer)
 *   @param {Object} [options.headers] - Headers HTTP supplémentaires
 *   @param {Object} [options.params] - Paramètres de query string (ex: { page: 1 })
 * @returns {Promise<Object>} - Réponse de l'API (déjà parsée en JSON)
 * @throws {Error} - En cas d'erreur réseau ou de réponse HTTP non-OK
 */
async function api(method, endpoint, data = null, options = {}) {
  const { token, headers: customHeaders = {}, params = {} } = options;

  // Construction de l'URL complète avec query params
  const url = new URL(endpoint, API_BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  // Préparation des headers
  const headers = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  // Ajout du token d'authentification si fourni
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Configuration de la requête fetch
  const fetchOptions = {
    method: method.toUpperCase(),
    headers,
  };

  // Ajout du body pour les méthodes qui en nécessitent
  if (data && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
    fetchOptions.body = JSON.stringify(data);
  }

  // Exécution de la requête
  const response = await fetch(url.toString(), fetchOptions);

  // Gestion des erreurs HTTP
  if (!response.ok) {
    let errorMessage = `Erreur HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // Si la réponse n'est pas du JSON, on garde le message par défaut
    }
    throw new Error(errorMessage);
  }

  // Parsage et retour de la réponse
  try {
    return await response.json();
  } catch (e) {
    // Si la réponse est vide (ex: 204 No Content), on retourne un objet vide
    return {};
  }
}

// Export par défaut du helper
export default api;

// Export de l'URL de base au cas où elle serait utile ailleurs
export { API_BASE_URL };
