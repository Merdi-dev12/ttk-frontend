# Contrat backend Storage

Le catalogue ne change pas : les services utilisent toujours `imageUrl` et les
produits utilisent toujours `images[].url`. Le module Storage fournit simplement
les URL publiques à placer dans ces champs.

Toutes les routes ci-dessous exigent un access token avec le rôle `ADMIN`.

## Buckets

### `GET /api/v1/storage/admin/buckets`

```json
{
  "status": "success",
  "data": {
    "buckets": [
      {
        "id": "uuid",
        "name": "catalogue",
        "slug": "catalogue",
        "is_public": true,
        "objects_count": 12,
        "created_at": "2026-06-15T10:00:00.000Z"
      }
    ]
  }
}
```

### `POST /api/v1/storage/admin/buckets`

Corps :

```json
{
  "name": "catalogue",
  "public": true
}
```

Réponse : `{ "status": "success", "data": { "bucket": {} } }`.

## Fichiers

### `GET /api/v1/storage/admin/buckets/:bucketId/objects`

Réponse :

```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": "uuid",
        "bucket_id": "uuid",
        "name": "netflix-premium.webp",
        "object_key": "products/netflix-premium.webp",
        "url": "https://cdn.example.com/catalogue/products/netflix-premium.webp",
        "mime_type": "image/webp",
        "size": 183420,
        "created_at": "2026-06-15T10:00:00.000Z"
      }
    ]
  }
}
```

### `POST /api/v1/storage/admin/buckets/:bucketId/objects`

Requête `multipart/form-data` avec le fichier dans la clé `file`.

Contraintes recommandées :

- Images uniquement : JPEG, PNG, WebP et AVIF.
- Taille maximale : 10 Mo.
- Nom de fichier généré côté serveur.
- Validation réelle du type MIME.
- URL publique retournée dans `data.object.url`.

### `DELETE /api/v1/storage/admin/buckets/:bucketId/objects/:objectId`

Supprime l’objet et retourne `204 No Content`.

## Stockage recommandé

Utiliser une API S3-compatible permet de garder la même implémentation avec
MinIO en développement et un stockage objet managé en production. Les clés et
secrets du stockage doivent rester exclusivement côté backend.
