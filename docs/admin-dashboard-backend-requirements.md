# Contrat backend requis pour le dashboard administrateur TTK

Base URL : `/api/v1`

Toutes les routes admin doivent exiger :

```http
Authorization: Bearer <accessToken>
```

Réponse de liste recommandée :

```json
{
  "status": "success",
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "totalPages": 0
    }
  }
}
```

## Contrat DataTable commun

Toutes les listes doivent accepter les paramètres suivants :

| Paramètre | Type | Description |
|---|---:|---|
| `page` | integer | Page à partir de 1 |
| `limit` | integer | 5, 10, 20, 50 ou 100 |
| `search` | string | Recherche textuelle normalisée |
| `sortBy` | string | Colonne autorisée par la route |
| `sortOrder` | `asc` ou `desc` | Direction du tri |
| `dateFrom` | ISO date | Début de période |
| `dateTo` | ISO date | Fin de période |

La recherche, le filtrage, le tri et la pagination doivent être appliqués côté serveur avant le calcul de `total`.

## Authentification

Déjà disponible :

- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/refresh`
- `POST /auth/logout`

À prévoir :

- `PATCH /auth/me` : modifier le nom, postnom et éventuellement l’avatar admin.
- `GET /auth/sessions` : appareils et sessions actives.
- `DELETE /auth/sessions/:sessionId` : révoquer une session.

## Statistiques du dashboard

### `GET /admin/dashboard/summary`

Filtres : `dateFrom`, `dateTo`, `currency`.

Réponse attendue :

```json
{
  "services": { "total": 0, "active": 0, "suspended": 0 },
  "products": { "total": 0, "active": 0, "suspended": 0, "deleted": 0 },
  "users": { "total": 0, "active": 0, "revoked": 0, "new": 0 },
  "orders": { "total": 0, "pending": 0, "paid": 0, "failed": 0 },
  "payments": { "amount": 0, "currency": "CDF", "successful": 0, "failed": 0 },
  "submissions": { "total": 0, "pending": 0 },
  "series": [{ "date": "2026-06-01", "orders": 0, "revenue": 0 }]
}
```

### `GET /admin/dashboard/activity`

Dernières commandes, demandes, paiements et actions administrateur, triés par date.

## Services

Déjà disponible :

- `GET /catalog/admin/services`
- `POST /catalog/admin/services`
- `PATCH /catalog/admin/services/:id`
- `PATCH /catalog/admin/services/:id/status`
- Routes de création, modification et suppression des champs.

Améliorations nécessaires pour la DataTable :

### `GET /catalog/admin/services`

Ajouter :

- `search` sur `name`, `slug`, `description`.
- `sortBy=name|type|status|created_at|updated_at`.
- `sortOrder`.
- `dateFrom`, `dateTo`.
- `includeCounts=true` pour retourner `productsCount` et `fieldsCount`.

### `GET /catalog/admin/services/:id`

Retourner le service complet avec :

- `fields` pour un service `FORM`.
- `productsCount`.
- Les informations d’image.

### `DELETE /catalog/admin/services/:id`

Suppression logique en statut `DELETED`, avec contrôle des dépendances.

## Produits

Déjà disponible :

- Création complète d’un produit sous un service.
- Lecture, modification et changement de statut.
- Images, modalités et réductions.

Endpoint de liste global requis :

### `GET /catalog/admin/products`

Paramètres :

- Contrat DataTable commun.
- `serviceId`.
- `status=ACTIVE|SUSPENDED|DELETED`.
- `currency=USD|CDF`.
- `availability=AVAILABLE|UNAVAILABLE|ON_REQUEST`.
- `hasDiscount=true|false`.

Recherche sur `name`, `slug`, `description`, `admin_note` et nom du service.

Chaque élément doit contenir :

- Le produit complet.
- `service: { id, name, slug }`.
- `primaryImage`.
- `minPrice`.
- `maxPrice`.
- `modalitiesCount`.

## Utilisateurs

Déjà disponible :

- `GET /users/admin`
- `PATCH /users/admin/:id/status`

Améliorations nécessaires :

- `sortBy=nom|email|status|created_at`.
- `sortOrder`.
- `dateFrom`, `dateTo`.
- `role`.
- `ordersCount` et `totalSpent` dans chaque élément.

### `GET /users/admin/:id`

Profil complet, historique des commandes, paiements, factures, demandes et avis.

## Commandes

### `GET /orders/admin`

Filtres :

- Contrat DataTable commun.
- `status=PENDING|PAID|PROCESSING|COMPLETED|CANCELLED|FAILED`.
- `serviceId`, `productId`, `userId`.
- `articleType=MODALITY|FORM_SUBMISSION`.
- `currency`.

### `GET /orders/admin/:id`

Détail complet avec utilisateur, service, produit/modalité ou soumission, paiement et facture.

### `PATCH /orders/admin/:id/status`

Body :

```json
{ "status": "PROCESSING", "adminNote": "Traitement démarré." }
```

### `GET /orders/admin/export`

Export CSV/XLSX selon les mêmes filtres.

## Paiements

### `GET /payments/admin`

Filtres :

- Contrat DataTable commun.
- `status=PENDING|SUCCESSFUL|FAILED|REFUNDED`.
- `provider`, `paymentMethod`, `currency`.
- `serviceId`, `userId`, `orderId`.

### `GET /payments/admin/:id`

Détail de la transaction et charge utile utile du prestataire, sans données sensibles.

### `POST /payments/admin/:id/verify`

Relancer la vérification auprès du prestataire.

### `POST /payments/admin/:id/refund`

Demande de remboursement avec montant et motif.

### `GET /payments/admin/export`

## Factures

### `GET /invoices/admin`

Filtres DataTable, `status`, `serviceId`, `userId`, `orderId`.

### `GET /invoices/admin/:id`

### `GET /invoices/admin/:id/pdf`

Téléchargement du PDF.

### `POST /invoices/admin/:id/resend`

Renvoyer la facture par email.

### `POST /invoices/admin/:id/regenerate`

Régénération contrôlée et auditée.

## Soumissions de formulaires

### `GET /form-submissions/admin`

Filtres :

- Contrat DataTable commun.
- `serviceId`, `userId`.
- `status=PENDING|IN_PROGRESS|ACCEPTED|REJECTED`.

### `GET /form-submissions/admin/:id`

Retourner :

- Utilisateur.
- Service.
- Valeurs structurées selon les champs du service.
- URLs sécurisées des fichiers envoyés.
- Historique des changements de statut.

### `PATCH /form-submissions/admin/:id/status`

```json
{
  "status": "IN_PROGRESS",
  "adminNote": "Dossier en cours de vérification."
}
```

### `POST /form-submissions/admin/:id/message`

Contacter l’utilisateur et conserver l’historique.

## Publicités

### `GET /advertisements/admin`

Filtres DataTable : `search`, `status`, `mediaType`, période de diffusion.

### `POST /advertisements/admin`

```json
{
  "title": "Immobilier à Cocody",
  "mediaType": "VIDEO",
  "mediaUrl": "https://cdn.example.com/ad.mp4",
  "targetUrl": "/services/immobilier",
  "serviceId": "uuid",
  "startsAt": "2026-06-15T00:00:00.000Z",
  "endsAt": "2026-07-15T23:59:59.000Z",
  "status": "ACTIVE"
}
```

Routes complémentaires :

- `GET /advertisements/admin/:id`
- `PATCH /advertisements/admin/:id`
- `PATCH /advertisements/admin/:id/status`
- `DELETE /advertisements/admin/:id`

## Notifications administrateur

### `GET /notifications`

Pagination, `read=true|false`, `type`.

### `GET /notifications/unread-count`

### `PATCH /notifications/:id/read`

### `PATCH /notifications/read-all`

Option recommandée : WebSocket ou Server-Sent Events pour les nouvelles commandes, demandes et erreurs de paiement.

## Uploads

Les formulaires utilisent encore des URLs. Pour un fonctionnement complet :

### `POST /uploads/images`

`multipart/form-data`, validation MIME/taille, optimisation et URL CDN.

### `POST /uploads/documents`

Documents de formulaires, accès privé avec URL signée.

### `POST /uploads/videos`

Vidéos publicitaires avec taille maximale et traitement asynchrone.

### `DELETE /uploads/:id`

## Paramètres

### `GET /admin/settings`

### `PATCH /admin/settings`

Inclure :

- Devises actives.
- Prestataire de paiement actif.
- Emails de notification.
- Limites d’upload.
- Informations légales et facturation.

## Journal d’audit

### `GET /admin/audit-logs`

Filtres DataTable :

- `adminId`, `action`, `resourceType`, `resourceId`, dates.

Chaque mutation importante doit enregistrer l’admin, l’action, la ressource, la date et les valeurs modifiées.

## Erreurs et sécurité

- Réponses d’erreur uniformes : `status`, `code`, `message`, `details?`.
- `401` uniquement pour une session absente ou expirée.
- `403` pour un rôle insuffisant.
- `409` pour les conflits métier.
- Rate limit sur login, refresh, exports et uploads.
- Validation stricte des tris et filtres autorisés.
- Ne jamais retourner mots de passe, jetons, secrets prestataires ou documents privés sans URL signée.

### Exigences obligatoires de protection admin

- Toutes les routes `/catalog/admin`, `/users/admin`, `/orders/admin`, `/payments/admin`, `/invoices/admin`, `/form-submissions/admin`, `/advertisements/admin` et `/admin/*` doivent vérifier le JWT côté serveur.
- Le middleware backend doit relire l’utilisateur en base et exiger simultanément `role === "ADMIN"` et `status === "ACTIVE"`.
- Ne jamais faire confiance à un rôle envoyé par le frontend ou seulement présent dans le corps d’un JWT ancien.
- Le refresh token devrait être déplacé dans un cookie `HttpOnly`, `Secure`, `SameSite=Strict`, limité au chemin `/api/v1/auth`.
- L’access token doit rester court, idéalement 5 à 15 minutes.
- Rotation obligatoire du refresh token à chaque renouvellement, avec détection de réutilisation.
- Révocation de toutes les sessions après changement de mot de passe, révocation du compte ou suspicion de compromission.
- CORS limité aux domaines exacts du frontend TTK, jamais `*` avec des credentials.
- Ajouter `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` et HSTS en production.
- Protéger les mutations utilisant des cookies contre le CSRF.
- Journaliser les connexions admin, échecs, refresh, déconnexions et mutations sensibles.
- Appliquer un rate limit renforcé sur `/auth/login`, `/auth/refresh` et les opérations administrateur critiques.
