💬 Web Socket Chat
Web Socket Chat est une application de messagerie instantanée en temps réel, développée en fullstack JavaScript (Node.js & React). Elle permet aux utilisateurs de discuter, gérer leurs contacts et personnaliser leur profil. Ce projet met l’accent sur la performance, la sécurité et l’expérience utilisateur, grâce à l’utilisation de WebSockets, d’une architecture modulaire et de bonnes pratiques de développement.

🚀 Fonctionnalités principales
🔐 Authentification sécurisée (JWT, middlewares d’authentification)

👤 Gestion des utilisateurs : inscription, connexion, profil, avatar

🤝 Liste d’amis : ajout, suppression, notifications

💬 Messagerie instantanée : envoi/réception de messages en temps réel via Socket.io

🔔 Notifications : nouveaux messages, demandes d’amis

📱 Interface responsive avec React et Tailwind CSS

❌ Gestion des erreurs & feedback utilisateur

🦴 Skeleton UI pour le chargement des messages et de la sidebar

🏗️ Architecture & Stack technique
🔧 Backend (Node.js + Express)
Express.js : API REST (auth, amis, messages)

Socket.io : communication temps réel via WebSocket

MongoDB : base de données (utilisateurs, messages, relations)

Cloudinary : gestion des avatars

Sécurité : JWT, middlewares, validation des entrées

Structure modulaire : contrôleurs, modèles, routes, middlewares bien séparés

💻 Frontend (React)
React.js (Hooks + Context + Custom Stores)

Vite : bundler rapide pour le dev

Axios : communication avec l’API

Socket.io-client : gestion des événements WebSocket

Tailwind CSS : design moderne et responsive

Pages dédiées : login, inscription, amis, notifications, paramètres, profil, chat

💡 Points forts techniques
⚡ Temps réel : intégration fluide de Socket.io pour une expérience de chat réactive

🛡️ Sécurité : authentification robuste, gestion fine des permissions

✨ UX soignée : skeletons, feedback visuel, navigation fluide

🧱 Scalabilité : code maintenable, architecture claire

☁️ Déploiement prêt : compatible avec Heroku, Vercel, Render, etc.

📬 Contact
Développé par Ludovic Duhamel
📧 ludovic.duhamel-62260@outlook.fr
