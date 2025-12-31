# Nolia SaaS

Une plateforme SaaS moderne pour la gestion de facturation et de clients, construite avec une architecture monorepo robuste.

## 🛠 Stack Technique

Ce projet utilise une stack moderne et performante :

- **Monorepo** : [Turborepo](https://turbo.build/) pour la gestion du workspace.
- **Frontend** : [Next.js 16](https://nextjs.org/) (avec Turbopack) pour une interface utilisateur réactive et rapide.
- **Backend** : [NestJS](https://nestjs.com/) pour une API robuste et scalable.
- **Base de données** : [PostgreSQL](https://www.postgresql.org/) (hébergé sur [Supabase](https://supabase.com/)).
- **ORM** : [Prisma](https://www.prisma.io/) pour la gestion de la base de données.
- **Styling** : [Tailwind CSS v4](https://tailwindcss.com/) pour le design.

## 🚀 Fonctionnalités

- **Tableau de bord** : Vue d'ensemble de l'activité.
- **Gestion des Clients** :
  - Liste des clients.
  - Ajout de nouveaux clients.
  - **Modification des informations clients**.
- **Gestion des Factures** :
  - Liste des factures.
  - Création de factures avec gestion des articles (quantité, prix, TVA).

## 📦 Installation et Démarrage

Suivez ces étapes pour lancer le projet en local :

### 1. Prérequis

- Node.js (v18 ou supérieur)
- npm

### 2. Installation des dépendances

```bash
npm install
```

### 3. Configuration de l'environnement

Créez un fichier `.env` à la racine du projet en copiant l'exemple :

```bash
cp .env.example .env
```

Ensuite, remplissez les variables suivantes dans le fichier `.env` avec vos identifiants **Supabase** :

```env
# URL de connexion à la base de données (Transaction Mode)
DATABASE_URL="postgresql://postgres:[VOTRE_MOT_DE_PASSE]@db.[PROJECT_REF].supabase.co:5432/postgres"

# URL directe (Session Mode)
DIRECT_URL="postgresql://postgres:[VOTRE_MOT_DE_PASSE]@db.[PROJECT_REF].supabase.co:5432/postgres"

# Clés API Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[VOTRE_CLE_PUBLIQUE_ANON]"
```

### 4. Initialisation de la base de données

Synchronisez votre schéma Prisma avec votre base de données Supabase :

```bash
npx prisma db push --schema=packages/database/prisma/schema.prisma
```

### 5. Lancement du serveur de développement

Lancez le frontend et le backend simultanément :

```bash
npm run dev
```

- **Frontend** : Accessible sur [http://localhost:3000](http://localhost:3000)
- **API** : Accessible sur [http://localhost:3001](http://localhost:3001)

## 📂 Structure du Projet

- `apps/web` : Application Next.js (Frontend).
- `apps/api` : Application NestJS (Backend API).
- `packages/database` : Configuration Prisma et schéma de base de données partagé.
- `packages/ui` : Composants React partagés (Design System).
