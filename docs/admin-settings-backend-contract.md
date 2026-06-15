# Contrat backend des paramètres administrateur

Toutes les routes utilisent `Authorization: Bearer <accessToken>` et exigent le
rôle `ADMIN`. Les secrets techniques, clés privées et mots de passe ne doivent
jamais être retournés au frontend.

## Lecture globale

### `GET /api/v1/admin/settings`

Retour :

```json
{
  "status": "success",
  "data": {
    "settings": {
      "general": {
        "platformName": "TTK Services",
        "supportEmail": "support@example.com",
        "supportPhone": "+243...",
        "defaultCurrency": "CDF",
        "timezone": "Africa/Kinshasa",
        "maintenanceMode": false
      },
      "catalog": {
        "autoPublishServices": false,
        "autoPublishProducts": false,
        "lowStockThreshold": 5,
        "allowOutOfStockOrders": false
      },
      "orders": {
        "referencePrefix": "TTK",
        "cancellationDelayMinutes": 30,
        "autoCancelUnpaid": true,
        "requireAdminConfirmation": true
      },
      "payments": {
        "enabledCurrencies": ["CDF", "USD"],
        "paymentTimeoutMinutes": 15,
        "manualVerification": true
      },
      "notifications": {
        "adminEmail": "admin@example.com",
        "notifyNewOrder": true,
        "notifyNewSubmission": true,
        "notifyPaymentFailure": true,
        "dailyDigest": false
      },
      "security": {
        "sessionIdleMinutes": 30,
        "maxLoginAttempts": 5,
        "requireTwoFactor": false,
        "allowedAdminIps": []
      },
      "storage": {
        "maxImageSizeMb": 10,
        "allowedImageTypes": ["image/jpeg", "image/png", "image/webp", "image/avif"],
        "imageQuality": 85,
        "generateWebp": true
      }
    }
  }
}
```

## Mise à jour par section

Routes déjà connectées par le frontend :

```http
PATCH /api/v1/admin/settings/general
PATCH /api/v1/admin/settings/catalog
PATCH /api/v1/admin/settings/orders
PATCH /api/v1/admin/settings/payments
PATCH /api/v1/admin/settings/notifications
PATCH /api/v1/admin/settings/security
PATCH /api/v1/admin/settings/storage
```

Chaque route reçoit uniquement l’objet de sa section et retourne l’objet global
`data.settings` dans le même format que la lecture.

Règles importantes :

- Valider les fuseaux avec une liste IANA.
- Refuser une liste vide dans `enabledCurrencies`.
- Borner les délais et tailles numériques.
- Valider chaque adresse IP ou CIDR.
- Ne pas permettre à l’admin courant de se bloquer avec une restriction IP.
- Journaliser chaque modification dans un audit log.
- Invalider le cache de configuration après une modification.

## Notifications

### `POST /api/v1/admin/settings/notifications/test-email`

```json
{ "email": "admin@example.com" }
```

Retour : `204 No Content`.

## Maintenance

### `POST /api/v1/admin/settings/maintenance/clear-cache`

Vide uniquement les caches applicatifs reconstruisibles. Retour : `204`.

## Graphique du dashboard

L’endpoint existe déjà :

```http
GET /api/v1/admin/dashboard/summary?dateFrom=<ISO>&dateTo=<ISO>&currency=CDF
```

Pour afficher une évolution temporelle, compléter `data.series` :

```json
[
  {
    "date": "2026-06-01",
    "users": 12,
    "services": 2,
    "products": 8,
    "orders": 24,
    "revenue": 380000
  }
]
```

Le frontend utilise déjà les compteurs réels lorsque `series` est vide. Une fois
les points ajoutés au backend, ils pourront alimenter une vue temporelle sans
changer le contrat.

### Analyse des commandes

Le graphique de démonstration est déjà connecté à :

```http
GET /api/v1/admin/dashboard/orders?period=7d|30d|90d|year
```

Réponse attendue :

```json
{
  "status": "success",
  "data": {
    "period": "30d",
    "total": 1068,
    "successful": 897,
    "rejected": 171,
    "points": [
      {
        "label": "01",
        "successful": 62,
        "rejected": 14
      }
    ]
  }
}
```

Tant que cette route retourne `404`, le frontend emploie automatiquement ses
données de démonstration.
