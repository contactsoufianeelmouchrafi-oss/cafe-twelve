# ☕ Cafe Twelve — POS System

Système de caisse complet pour Cafe Twelve.

---

## 🚀 Déploiement en 5 étapes

### Étape 1 — MongoDB Atlas (base de données gratuite)

1. Va sur **https://www.mongodb.com/cloud/atlas** et crée un compte gratuit
2. Crée un **cluster gratuit (M0)**
3. Dans **Database Access** → Ajoute un utilisateur avec mot de passe
4. Dans **Network Access** → Clique "Allow Access from Anywhere" (0.0.0.0/0)
5. Dans **Connect** → "Connect your application" → Copie l'URI qui ressemble à:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/cafe-twelve
   ```

---

### Étape 2 — GitHub (héberger le code)

1. Va sur **https://github.com** → Crée un compte
2. Crée un nouveau repository appelé `cafe-twelve`
3. Upload tous les fichiers de ce projet

---

### Étape 3 — Vercel (hébergement gratuit)

1. Va sur **https://vercel.com** → Connecte avec ton compte GitHub
2. Clique **"New Project"** → Sélectionne `cafe-twelve`
3. Dans **Environment Variables**, ajoute:
   - Nom: `MONGODB_URI`
   - Valeur: ton URI MongoDB de l'étape 1
4. Clique **Deploy**
5. Vercel te donnera une URL comme `cafe-twelve.vercel.app`

---

### Étape 4 — Utiliser sur Windows

1. Ouvre **Chrome** sur ton PC Windows
2. Va sur l'URL Vercel de ton POS
3. Pour une expérience application: Chrome → ⋮ → **"Installer Cafe Twelve"**
4. Le POS s'ouvrira comme une vraie application Windows!

---

### Étape 5 — Imprimante Gainscha GA-E200

L'imprimante utilise le protocole **ESC/POS** via USB/Ethernet.
Quand tu cliques "Valider & Imprimer", une fenêtre s'ouvre automatiquement pour imprimer.

Pour impression directe (sans popup):
- Installe **QZ Tray** (https://qz.io) sur le PC de la caisse
- Configure l'imprimante comme imprimante par défaut Windows

---

## 👥 Équipe

| Nom | Rôle |
|-----|------|
| Salma | Serveuse |
| Ghizlan | Serveuse |
| Younes | Gérant |
| Marouan | Barista |

## 📋 Fonctionnalités

- ✅ Menu complet Cafe Twelve
- ✅ 2 shifts (Matin / Soir)
- ✅ Calcul de monnaie automatique
- ✅ Impression ticket (nom café, articles, total, serveur, date)
- ✅ Rapport par shift (ventes, commandes, par serveur)
- ✅ Interface Français + Arabe
- ✅ Base de données MongoDB (historique complet)

---

## 📞 Support

Contacte le développeur si tu as des problèmes.
