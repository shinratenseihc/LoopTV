# LoopTV 1.0.0 — instructions pour l'équipe Mozilla AMO

L'extension ne contient pas de bibliothèque tierce, de bundler, de code minifié ni de code exécuté depuis un serveur distant. Les scripts JS/CSS sont copiés tels quels ; seul `manifest.json` est adapté à Firefox dans `scripts/build.mjs`.

## Reproduire le paquet Firefox

1. Extraire les sources du dépôt ou du paquet source privé fourni au portail AMO.
2. Vérifier la présence de `klipy-config.js` à la racine. Ce fichier ne figure pas dans le dépôt Git public : il contient la clé d'application KLIPY **déjà extractible depuis l'archive Firefox soumise**. Pour reproduire exactement le build, copier `klipy-config.js` de cette archive vers la racine des sources (ne pas utiliser `klipy-config.example.js` tel quel).
3. Installer Node.js 24.x. Sous Windows, utiliser PowerShell ; sous Ubuntu/Linux, installer la commande système `zip` si elle manque.
4. Exécuter `npm run build` depuis la racine. Le résultat est `dist/LoopTV-1.0.0-firefox.zip`. Aucun `npm install` n'est nécessaire (aucune dépendance npm).
5. Exécuter `npm test` pour les tests unitaires et `npx web-ext lint --source-dir dist/firefox` pour le contrôle du manifeste. Les tests en navigateur Python et Playwright sont facultatifs pour la revue du code.

## Vérification fonctionnelle

Sur Firefox desktop 140 ou plus récent, ouvrir une chaîne Twitch avec chat, puis le bouton `GIF` près de la saisie. La recherche KLIPY fonctionne sans compte LoopTV. Sélectionner un GIF remplit l'éditeur Twitch avec `[ltv:k:ID]`. **L'envoi n'est jamais automatique.** Pour envoyer le message, l'utilisateur doit appuyer sur Entrée (avec un compte Twitch et les droits de discuter dans le canal). Un second spectateur équipé de LoopTV voit un GIF ; sans l'extension, le marqueur reste du texte. La popup contient 48 palettes originales et les interrupteurs séparés pour les GIFs et Name Paints animés.

La version 1.0 lit aussi les anciens marqueurs `[gifrift:k:ID]`. L'ancienne version 0.7.0 ne lit pas les nouveaux marqueurs.

## Données et limitations

- Permissions : stockage local, contenu du chat sur `https://www.twitch.tv/*`, appels à `https://api.klipy.com/*`.
- `searchTerms` : recherches saisies dans le sélecteur, transmises à KLIPY.
- `websiteContent` : uniquement les identifiants numériques de GIFs lus dans les messages Twitch publics, transmis à KLIPY pour résoudre les images. Aucun message complet, pseudo ou historique de discussion n'est transmis à KLIPY par LoopTV.
- Les GIFs sont chargés depuis `https://static.klipy.com/`, sans télémétrie propre à LoopTV.
- La clé KLIPY de test est partagée et limitée à 100 appels/h pour l'ensemble des utilisateurs. En cas de limite, le panneau affiche une erreur. La clé est nécessaire dans le paquet client et **ne doit pas être considérée comme secrète**.
- La modération synchronisée des GIFs n'est pas implémentée.
- L'extension est destinée à **Firefox desktop** ; aucune compatibilité Firefox Android n'est revendiquée. Le linter peut émettre un avertissement Android lié à `strict_min_version: 140.0`.

Voir aussi `PRIVACY.md`, `STORE_LISTINGS.md` et les [conditions KLIPY](https://klipy.com/support/api-terms).
