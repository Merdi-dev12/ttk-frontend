# TTK Services - Frontend

Application web Angular 21 moderne, scalable et performante pour la gestion des services.

## 📋 Table des Matières

- [Démarrage Rapide](#démarrage-rapide)
- [Architecture](#architecture)
- [Structure du Projet](#structure-du-projet)
- [Développement](#développement)
- [Build et Déploiement](#build-et-déploiement)
- [Testing](#testing)
- [Contribution](#contribution)

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+ 
- npm 9+
- Angular CLI 21+

### Installation

```bash
# Cloner le projet
git clone <repository>

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start
```

Naviguez vers `http://localhost:4200/` - l'app se rechargera automatiquement en cas de modification.

## 🏗️ Architecture

Le projet suit une architecture moderne basée sur:
- **Standalone Components** - Aucun NgModule
- **Signals** - Gestion d'état réactive
- **OnPush Change Detection** - Performances optimales
- **Lazy Loading** - Features chargées à la demande

📖 **Documentation complète:** Voir [ARCHITECTURE.md](./ARCHITECTURE.md)

## 📁 Structure du Projet

```
src/
├── app/
│   ├── core/                 # Singleton services, models, guards
│   ├── shared/               # Composants réutilisables
│   ├── features/             # Modules métier (lazy-loaded)
│   ├── layouts/              # Layouts
│   ├── app.routes.ts         # Routing
│   ├── app.ts               # Root component
│   ├── app.config.ts        # Configuration
│   └── constants.ts         # Constantes
├── environments/             # Config par environnement
├── styles.css               # Styles globaux
└── main.ts                  # Point d'entrée
```

## 🛠️ Développement

### Démarrer le serveur

```bash
npm start
```

### Générer un composant

```bash
ng generate component features/my-feature/my-component
```

### Générer un service

```bash
ng generate service core/services/my-service
```

### Générer une directive

```bash
ng generate directive shared/directives/my-directive
```

### Format du code

```bash
ng lint
```

## 📦 Build et Déploiement

### Build développement

```bash
npm run build:dev
```

### Build production

```bash
npm run build
```

Les fichiers optimisés seront dans `dist/`

## 🧪 Testing

### Lancer les tests

```bash
npm test
```

### Tests avec couverture

```bash
npm run test:coverage
```

### Tests end-to-end

```bash
npm run e2e
```

## 📚 Ressources

- [Documentation Angular](https://angular.dev)
- [Angular Best Practices](https://angular.dev/best-practices)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [RxJS Documentation](https://rxjs.dev)

## 🤝 Contribution

1. Créer une branche pour la feature: `git checkout -b feature/ma-feature`
2. Commit les changements: `git commit -m 'Add ma-feature'`
3. Push la branche: `git push origin feature/ma-feature`
4. Ouvrir une Pull Request

Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour plus de détails.

## 📝 Commandes Utiles

| Commande | Description |
|----------|-------------|
| `npm start` | Démarrer dev server |
| `npm run build` | Build production |
| `npm test` | Lancer les tests |
| `npm run lint` | Analyser le code |
| `npm run format` | Formater le code |

## 📄 Licence

Propriétaire - TTK Services

## 👥 Contact

Pour des questions: contact@ttk-services.com

---

**Angular:** 21  
**Node:** 18+  
**Last Updated:** June 2026
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
