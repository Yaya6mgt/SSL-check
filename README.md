# SSL Monitor Dashboard

Une solution complète de monitoring de certificats SSL pour surveiller l'état de santé de vos domaines, détecter les expirations et diagnostiquer les erreurs de configuration (Self-signed, Mismatch, DNS, etc.).

## Fonctionnalités

- **Dashboard Temps Réel** : Visualisation de l'état de tous vos certificats.
- **Diagnostics Précis** : Identification des erreurs (DNS, Timeout, Erreurs TLS spécifiques).
- **Gestion des Utilisateurs** : Système de rôles (Admin, Éditeur, Lecteur).
- **Destinataires des Alertes** : Gestion d'une liste de diffusion pour les notifications.
- **Import CSV** : Ajout massif de domaines en un clic.

---

## Installation & Configuration

### 1. Prérequis
- [Docker](https://docs.docker.com/get-docker/) et [Docker Compose](https://docs.docker.com/compose/install/) installés.
- Une instance PostgreSQL (si non utilisée via Docker).

### 2. Configuration (Variables d'environnement)
Le projet utilise un fichier `.env` pour sa configuration. Un modèle est fourni dans le dépôt.

```bash
cp .env.example .env
```

**Variables clés à configurer :**
- `DATABASE_URL` : URL de connexion à votre base de données PostgreSQL.
- `JWT_SECRET` : Clé secrète pour la signature des jetons de session.
- `VITE_API_BASE_URL` : URL de l'API pour le frontend.

### 3.1 Lancement avec Docker

Le moyen le plus simple de démarrer est d'utiliser Docker Compose.

```bash
docker-compose up -d --build

docker-compose logs -f
```

### 4. Lancement Local (sans Docker)

Si vous ne souhaitez pas utiliser Docker, vous devez lancer le Backend et le Frontend séparément. Assurez-vous d'avoir un serveur PostgreSQL actif.

**Configuration du Backend :**
```bash
cd backend
npm install
npm run dev
```

**Configuration du Frontend :**
```bash
cd frontend
npm install
npm run dev
```
*Note : Penser à avoir un .env dans le dossier frontend (.env.example disponible dans le dossier frontend).*

---

## Format d'Importation CSV

Le système permet d'importer une liste de domaines via un fichier CSV. Pour que l'importation réussisse, votre fichier doit respecter scrupuleusement la structure suivante :

**Colonnes obligatoires :**
1. `server_name` : Nom ou label de la machine/serveur.
2. `ip_address` : Adresse IP du serveur.
3. `hostname` : Le nom de domaine complet (FQDN) à tester.

**Exemple de contenu (`domaines.csv`) :**
```csv
server_name,ip_address,hostname
VM-Production-OFA,141.94.131.1,cloud-elearning.com
VM-Production-OFA,141.94.131.1,expired.badssl.com
VM-Demo-OFA,141.94.131.2,demo-onlineformapro.com
VM-Demo-OFA,141.94.131.2,wrong.host.badssl.com
VM-Live-OFA,141.94.131.3,live.olfp.net
VM-Live-OFA,141.94.131.3,self-signed.badssl.com
```

---

## Diagnostics SSL

L'application ne se contente pas de vérifier la date d'expiration. Elle interprète les codes d'erreur techniques pour vous aider à résoudre les problèmes :

| Erreur affichée | Cause technique |
| :--- | :--- |
| **Périmé** | La date de validité est dépassée (`CERT_HAS_EXPIRED`). |
| **Mismatch** | Le domaine ne correspond pas au certificat (`ERR_TLS_CERT_ALTNAME_INVALID`). |
| **Auto-signé** | L'autorité émettrice n'est pas reconnue (`DEPTH_ZERO_SELF_SIGNED_CERT`). |
| **Injoignable** | Problème de Firewall ou machine éteinte (`EHOSTUNREACH` / `ETIMEDOUT`). |
| **Port fermé** | Le port 443 ne répond pas (`ECONNREFUSED`). |

---

## Système d'Alertes et Destinataires

Le monitoring ne se contente pas d'afficher les données, il est proactif.

### Automatisation
Chaque jour à **08:00**, une vérification complète de tous les domaines est déclenchée automatiquement par le serveur.

### Logique de Notification
Si un problème est détecté ou qu'une expiration approche, un email est envoyé à tous les emails listés dans la section **"Destinataires"** (Recipients).

Les alertes sont envoyées selon 3 paliers critiques :
1.  **J-30** : Alerte préventive (Planification du renouvellement).
2.  **J-14** : Alerte importante (Action requise prochainement).
3.  **J-7** : Alerte critique (Action immédiate nécessaire).

*Note : Si un certificat est déjà expiré ou présente une erreur technique (DNS, Mismatch), une alerte est envoyée quotidiennement jusqu'à résolution.*

---

## Commandes Docker Utiles

| Action | Commande |
| :--- | :--- |
| Démarrer l'application | `docker-compose up -d` |
| Arrêter l'application | `docker-compose down` |
| Redémarrer un service | `docker-compose restart api` |
| Nettoyer les volumes | `docker-compose down -v` |
| Accéder au shell du container | `docker-compose exec api sh` |

---

## Sécurité

- **Gestion des rôles** : Seuls les administrateurs peuvent modifier les rôles ou supprimer des utilisateurs.
- **Protection Admin** : Un administrateur ne peut pas être supprimé ou rétrogradé par un autre administrateur via l'interface.
- **Validation Backend** : Toutes les requêtes sont protégées par JWT et vérifiées côté serveur.

---

## Test de l'API (Bruno)

Le projet inclut une collection complète de tests et de requêtes API pré-configurées.

- **Localisation** : Dossier `/SSLBruno` à la racine.
- **Utilisation** :
    1. Téléchargez et installez [Bruno](https://www.usebruno.com/).
    2. Ouvrez l'application et choisissez **"Open Collection"**.
    3. Sélectionnez le dossier `SSLBruno`.
- **Fonctionnalités incluses** : Authentification, CRUD domaines, gestion des utilisateurs, déclenchement manuel du check SSL et gestion des destinataires.

---
© 2026 SSL Monitor - Déployé pour la surveillance des infrastructures critiques.