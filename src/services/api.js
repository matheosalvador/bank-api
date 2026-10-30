export async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, options);
  
  // On tente de lire la réponse JSON
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  // Gestion des erreurs
  if (!response.ok) {
    throw new Error(data?.message || "Une erreur est survenue lors de la requête.");
  }

  return data;
}
