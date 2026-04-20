# Axiom MVP

Application de gestion commerciale agricole (transactions, dépenses, tableau de bord) construite avec Next.js 16, Prisma 7 et MySQL.

---

## Pré-requis

Ce projet est configuré pour fonctionner avec **WAMP + phpMyAdmin** en local (MySQL).

Avant de commencer, assurez-vous d'avoir :

- [Node.js](https://nodejs.org) v18 ou supérieur
- [WAMP Server](https://www.wampserver.com) installé et démarré (icône verte dans la barre des tâches)
- Une base de données MySQL créée via phpMyAdmin :
  1. Ouvrir [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
  2. Cliquer sur **Nouvelle base de données**
  3. Nommer la base `axiom` et valider

---

## Installation et démarrage

Commandes à exécuter dans l'ordre après avoir cloné le repo :

**1. Installer les dépendances**
```bash
npm install
```

**2. Créer le fichier d'environnement**

Créer un fichier `.env` à la racine du projet avec le contenu suivant :
```env
DATABASE_URL="mysql://root:@localhost:3306/axiom"
```
> Si votre utilisateur MySQL a un mot de passe, remplacez `root:` par `root:votre_mot_de_passe`.

**3. Générer le client Prisma**
```bash
npx prisma generate
```

**4. Créer les tables en base de données**
```bash
npx prisma migrate deploy
```

**5. Peupler la base avec des données de test**
```bash
npx prisma db seed
```

**6. Lancer le serveur de développement**
```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

---

## Commandes utiles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Démarrer le build de production |
| `npx prisma db seed` | Recharger les données de test |
| `npx prisma studio` | Interface visuelle de la base de données |
| `npx prisma migrate dev` | Créer et appliquer une nouvelle migration |

---

## Migration vers PostgreSQL

Le projet utilise `@prisma/adapter-mariadb` pour MySQL. Pour migrer vers PostgreSQL :

**1. Désinstaller l'adapter MySQL, installer l'adapter PostgreSQL**
```bash
npm uninstall @prisma/adapter-mariadb
npm install @prisma/adapter-pg pg
npm install -D @types/pg
```

**2. Modifier `prisma/schema.prisma`**

Changer le provider :
```prisma
datasource db {
  provider = "postgresql"
}
```

**3. Modifier `lib/prisma.ts`**

Remplacer le contenu par :
```ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
```

**4. Mettre à jour le `.env`**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/axiom"
```

**5. Régénérer le client et recréer les migrations**
```bash
npx prisma migrate reset
npx prisma migrate dev --name init
```
