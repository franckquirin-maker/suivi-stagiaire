# Suivi des absences et retards de stagiaires

Application de gestion des retards et absences de stagiaires.

- **Backend** : PHP 8.3 vanilla, architecture MVC maison (pas de framework), API REST, PDO/MySQL, authentification par session PHP.
- **Frontend** : React 18 + Vite, SPA consommant l'API REST.
- **Base de données** : MySQL 8.
- **Conteneurisation** : Docker / docker-compose.

## Structure du projet

```
suivi-stagiaires/
├── docker-compose.yml
├── docker/mysql/init.sql        # script de création des tables (exécuté au 1er démarrage)
├── backend/
│   ├── Dockerfile
│   ├── docker/000-default.conf  # vhost Apache
│   ├── config/config.php
│   ├── public/                  # document root (front controller)
│   │   ├── index.php
│   │   └── .htaccess
│   └── src/
│       ├── autoload.php         # autoload PSR-4 maison
│       ├── Core/                # Router, Controller, Model, Database, Request, Response
│       ├── Controllers/
│       ├── Models/
│       └── Routes/api.php       # déclaration des routes
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── main.jsx / App.jsx
        ├── api/client.js        # wrapper fetch (cookies de session inclus)
        ├── pages/
        └── components/
```

## Lancer le projet

```bash
cp .env.example .env
docker compose up --build
```

- Frontend : http://localhost:5173
- API backend : http://localhost:8080/api
- MySQL : localhost:3306 (accessible avec un client externe si besoin)

Le script `docker/mysql/init.sql` est exécuté automatiquement par MySQL **uniquement au premier démarrage** du volume `db_data`. Si tu modifies le schéma, il faut soit supprimer le volume (`docker compose down -v`), soit appliquer une migration manuellement.

## Créer un premier utilisateur (pour se connecter)

Il n'y a pas encore d'écran d'inscription. Pour te créer un compte de test, génère un hash de mot de passe puis insère-le directement en base :

```bash
php -r "echo password_hash('motdepasse', PASSWORD_DEFAULT);"
```

```sql
INSERT INTO users (nom, prenom, email, hashpassword)
VALUES ('Dupont', 'Jean', 'jean.dupont@example.com', '<hash généré ci-dessus>');
```

## Choix techniques 

- **MVC fait main** : pas de Composer ni de framework. Un autoloader PSR-4 minimal (`src/autoload.php`) charge les classes du namespace `App\`.
- **Sessions PHP** pour l'authentification (pas de JWT). Le cookie de session est configuré en `SameSite=Lax`, ce qui fonctionne en dev car front (`:5173`) et back (`:8080`) sont sur le même "site" (`localhost`), seul le port diffère. **En production**, si front et back sont sur des domaines réellement différents, il faudra passer en `SameSite=None; Secure` (HTTPS obligatoire).
- **Héritage de table** `evenements` → `retard` / `absence` : la création d'un événement se fait dans une transaction SQL (voir `EvenementController::store`) pour garantir que la table mère et la table fille restent cohérentes.
- **`type_ev`** est une table de référence libre, pensée pour des sous-catégories (ex. "Retard transport", "Absence maladie") indépendantes de la distinction technique retard/absence.

## Prochaines étapes 

- Écrans React : connexion, liste des promos/stagiaires, formulaire de déclaration d'un retard/absence, calcul et affichage du taux d'absence par stagiaire par rapport à `pourcentage_max_absence`.
- Validation des données côté backend (champs obligatoires, formats de date...).
- Gestion des erreurs et messages utilisateur côté frontend.
- Build de production du frontend (`npm run build`) servi par Apache ou Nginx, à intégrer dans le `docker-compose.yml` pour le déploiement final.
# suivi-stagiaire
