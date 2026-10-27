# API Banque en ligne

Le back-end du projet « Sprint Front » : une API REST en Python (FastAPI + SQLite).
Elle couvre toutes les stories du projet, de S1 à S15.

## Lancer l'API

Il faut **Python 3.10 ou plus récent**. Les commandes se lancent dans le dossier `bank-api/`.

```bash
python3 -m venv .venv
source .venv/bin/activate            # Windows : .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- Documentation interactive : **http://localhost:8000/docs**. Le bouton **Authorize** permet de coller un token et de tester chaque route.
- Au premier lancement, la base `bank.db` est créée avec des données de démonstration.
- Pour la remettre à zéro : `python -m app.db reset`.

## Brancher le front (proxy Vite, chapitre 6.6)

```js
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
```

Le front appelle `/api/accounts` et Vite relaie la requête vers `http://localhost:8000/accounts`.

L'API accepte aussi les appels directs depuis `http://localhost:5173` (CORS). Pour ajouter d'autres origines, utilisez la variable `CORS_ORIGINS`, avec des origines séparées par des virgules.

## Comptes de test

| Email | Mot de passe | Contenu |
|---|---|---|
| `alice@banque.fr` | `alice1234` | un compte principal (2 052,50 €), un compte secondaire (500 €), 5 opérations, Bob en bénéficiaire |
| `bob@banque.fr` | `bob12345` | un compte principal (1 227,50 €) |

Pour tester les états « vide » (aucune transaction, aucun bénéficiaire), il suffit de créer un nouvel utilisateur avec `POST /auth/register`.

## Conventions

- **Authentification** : `POST /auth/login` renvoie `{ accessToken, user }`.
  - Toutes les autres routes, sauf `/auth/register`, attendent le header `Authorization: Bearer <accessToken>`.
  - Le token expire au bout de 24 h. On peut changer cette durée avec la variable `TOKEN_TTL_MINUTES`, par exemple `TOKEN_TTL_MINUTES=2` pour tester la déconnexion sur un `401`.
- **Erreurs** : le corps est toujours `{ "message": "…" }`, en français et prêt à être affiché. Le helper `api()` du cours le lit déjà.

  | Statut | Signification |
  |---|---|
  | `400` | données invalides ou opération refusée (solde insuffisant…) |
  | `401` | token absent, invalide ou expiré |
  | `403` | ressource d'un autre utilisateur |
  | `404` | ressource introuvable |
  | `409` | doublon |

- **Montants** : nombres en euros (`12.5` = 12,50 €), avec 2 décimales au maximum. Ils sont stockés en centimes, donc sans erreur d'arrondi.
- **Dates** : strings ISO 8601 en UTC, par exemple `"2026-10-25T14:30:00Z"`.
- **IBAN** : français et valides (clé modulo 97). En entrée, les espaces et les minuscules sont acceptés.
- **Listes** : du plus récent au plus ancien.

## Routes

| Méthode | Route | Story | Corps | Réponse |
|---|---|---|---|---|
| POST | `/auth/register` | S1 | `{ email, password }` | `201` `{ accessToken, user }` |
| POST | `/auth/login` | S2 | `{ email, password }` | `{ accessToken, user }` |
| GET | `/auth/me` | S3 | — | `{ id, email, createdAt }` |
| POST | `/auth/logout` | — | — | `204` |
| GET | `/accounts` | S3, S9 | — | `[Account]` |
| POST | `/accounts` | S8 | — | `201` `Account` |
| GET | `/accounts/:id` | S7 | — | `Account` |
| DELETE | `/accounts/:id` | S10 | — | `204` |
| POST | `/accounts/:id/deposits` | S4 | `{ amount }` | `201` `Transaction` |
| GET | `/accounts/:id/transactions` | S6 | — | `[Transaction]` |
| GET | `/accounts/:id/transactions/:txId` | S11 | — | `Transaction` |
| GET | `/accounts/:id/statement` | S14 | — | fichier PDF |
| POST | `/transfers` | S5 | `{ fromAccountId, toIban, amount, label? }` | `201` `Transaction` |
| GET | `/beneficiaries` | S12 | — | `[Beneficiary]` |
| POST | `/beneficiaries` | S13, S15 | `{ name, iban }` | `201` `Beneficiary` |
| DELETE | `/beneficiaries/:id` | — | — | `204` |

```text
Account      { id, iban, type: "principal" | "secondaire", balance, createdAt }
Transaction  { id, accountId, kind: "deposit" | "transfer", direction: "credit" | "debit",
               amount, label, fromIban (null pour un dépôt), toIban, createdAt }
Beneficiary  { id, name, iban, createdAt }
```

`direction` est calculé du point de vue de `accountId`. Un même virement est un `debit` pour le compte qui envoie et un `credit` pour celui qui reçoit.

## Règles métier et erreurs

**Inscription (S1)**
- L'email doit avoir un format valide (`400`), et le mot de passe au moins 8 caractères (`400`).
- Un email déjà utilisé est refusé (`409`).
- L'inscription crée automatiquement le **compte principal**, avec un solde de 0 €.

**Comptes (S7, S8, S10)**
- `POST /accounts` crée un compte **secondaire**. On peut avoir au plus 5 comptes ouverts (`400`).
- Un compte qui n'existe pas ou qui est clôturé renvoie `404`. Le compte d'un autre utilisateur renvoie `403`.
- La clôture est refusée pour le compte principal (`400`) et pour un compte dont le solde n'est pas à 0 € (`400`).
- Un compte clôturé disparaît des listes.

**Dépôts (S4)**
- Le montant doit être supérieur à 0, avec 2 décimales au maximum (`400`).
- Un dépôt est limité à 10 000 € par opération (`400`).

**Virements (S5)**
- Le destinataire peut être n'importe quel compte ouvert de la banque, y compris un autre de ses propres comptes.
- Erreurs possibles :
  - IBAN invalide (`400`) ;
  - aucun compte ouvert avec cet IBAN (`404`) ;
  - destinataire identique à la source (`400`) ;
  - solde insuffisant (`400`).
- Le libellé est facultatif : « Virement » par défaut, 100 caractères au maximum.

**Bénéficiaires (S13, S15)**
- Le nom est obligatoire (`400`) et l'IBAN doit être valide (`400`).
- Le compte doit exister dans la banque (`404`).
- On ne peut pas s'ajouter soi-même (`400`), ni ajouter deux fois le même bénéficiaire (`409`).

**Détail d'une transaction (S11)**
- Le compte d'un autre utilisateur renvoie `403`.
- Une transaction qui ne concerne pas ce compte renvoie `404`.

**Relevé PDF (S14)**
- La réponse porte le header `Content-Disposition: attachment; filename="releve-<iban>.pdf"`.
- Le token est obligatoire. Côté front, il faut donc passer par `fetch`, puis `res.blob()` et `URL.createObjectURL`.

## Tests

```bash
python -m pytest
```

Il y a un scénario par story, dans `tests/test_api.py`. Chaque test utilise une base temporaire, et `bank.db` n'est pas modifiée.

## Organisation du code

```text
app/
 ├── main.py          ← application, CORS, format des erreurs
 ├── db.py            ← schéma SQLite, écritures communes, données de démo
 ├── deps.py          ← utilisateur connecté, contrôle d'accès aux comptes, montants
 ├── schemas.py       ← formats JSON (affichés dans /docs)
 ├── iban.py          ← génération et validation des IBAN
 ├── pdf.py           ← relevé PDF, sans dépendance
 ├── security.py      ← hachage des mots de passe, tokens
 └── routers/         ← auth, accounts, transfers, beneficiaries
```
