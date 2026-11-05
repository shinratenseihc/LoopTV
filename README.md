# LoopTV (LTV) v0.8.0 expérimental · KLIPY + Name Paints

![Logo officiel de LoopTV](assets/looptv-logo.webp)

**Conçu par Shinra Tensei · Développé avec [Chat On Steroids](https://github.com/totec448-spec/chat-on-steroids)**

Extension Manifest V3 affichant de **vrais GIFs animés** dans le chat Twitch. Sans abonnement Twitch, compte LoopTV ni clé individuelle. Aucun framework ni dépendance npm. Le nom du projet était GIFRIFT ; les anciens marqueurs `[gifrift:k:ID]` restent **lisibles**, tandis que les nouveaux envois utilisent `[ltv:k:ID]`.

**Branche de développement `feat/free-name-paints` :** Name Paints gratuits, **48 dégradés au choix + Auto**, styles néon/metal/pastel avec animations activées par défaut, galerie recherchable et aperçu. Le choix manuel d'un pseudo reste local ; aucune synchronisation de compte n'est prétendue. **[Détails et limites](NAME_PAINTS.md)**. Le téléchargement public reste **v0.7.0** tant que cette version n'est pas publiée.

## 📦 Télécharger LoopTV

**[Télécharger la dernière version sur GitHub Releases](https://github.com/shinratenseihc/LoopTV/releases/latest)** · **[Guide d'installation (Chrome / Brave / Edge / Firefox)](INSTALL.md)**

La bêta s'installe manuellement sur Chrome, Brave et Edge. Sous Firefox, l'installation depuis GitHub est **temporaire** jusqu'à la signature Mozilla. **Chrome Web Store n'est pas utilisé pour cette bêta.**

## Utiliser

1. Installe LoopTV avec le [guide](INSTALL.md), puis recharge l'onglet Twitch.
2. Cliquer sur **GIF** sous la saisie Twitch. La recherche KLIPY apparaît juste au-dessus du champ, de la largeur du chat.
3. Rechercher un GIF ou parcourir les GIFs proposés ; faire défiler la grille avec la molette. **Voir plus** charge la page suivante à la demande.
4. Cliquer sur l'image. LoopTV prépare `[ltv:k:ID]` dans l'éditeur Twitch ; l'utilisateur appuie sur **Entrée** pour envoyer.

Un spectateur disposant de **LoopTV 0.8** résout les nouveaux et anciens IDs directement via KLIPY, sans recherche préalable. **Attention : LoopTV 0.7.0 ne reconnaît pas encore `[ltv:k:ID]`** et l'affichera comme du texte. Sans extension, le marqueur reste textuel. L'extension ne contourne pas les restrictions/bans Twitch et supprime l'image avec le message.


## Paquets bêta et publication

- Sur cette branche, `npm run build` génère `dist/LoopTV-0.8.0-chromium.zip` (Chrome, Brave et Edge) et `dist/LoopTV-0.8.0-firefox.zip` (Firefox). Il inclut la configuration d'application locale **uniquement dans les archives**, jamais dans Git.
- Pour une installation de développement Chromium, ouvrir `chrome://extensions` (ou `brave://extensions`, `edge://extensions`), activer le mode développeur et **Charger l'extension non empaquetée** depuis `dist/chromium`.
- **Important en v0.8 :** après `npm run build`, charger **`F:\AI Projects\LoopTV-NamePaints\dist\chromium`** (le dossier décompressé et construit), pas une archive ZIP ni un dossier source téléchargé de GitHub. Le paquet contient `klipy-config.js`, nécessaire aux recherches GIF. Le service worker peut maintenant démarrer sans ce fichier, mais la recherche affiche alors « Configuration KLIPY absente ».
- Si Chrome indique **« Service worker registration failed (Status code: 3) »**, vérifier le dossier de chargement dans `chrome://extensions`, puis recharger l'extension une fois le paquet correct sélectionné. Les fichiers `background.js`, `klipy-api.js` et `klipy-config.js` doivent être présents dans le paquet. Ne jamais publier le fichier de clé dans Git.
- Pour Firefox, passer par `about:debugging` → Ce Firefox → Charger un module complémentaire temporaire et choisir `dist/firefox/manifest.json` ; il sera retiré au redémarrage. L'installation permanente nécessite une extension signée par Mozilla.
- **Ne pas distribuer le ZIP Firefox comme une extension installable définitivement**. Faire signer l'extension via addons.mozilla.org pour un déploiement public ou non répertorié.
- Détails, vérifications, stores et précautions : [DISTRIBUTION.md](DISTRIBUTION.md). Notice pour les utilisateurs : [PRIVACY.md](PRIVACY.md).

## Configuration du développeur et distribution

- **Ce dossier local contient `klipy-config.js`**, créé depuis la clé DPAPI du développeur. Il est ignoré par Git et chargé par le service worker.
- Ce fichier n'est **pas** sur GitHub. Pour un autre environnement de développement, copier `klipy-config.example.js` vers `klipy-config.js` et y configurer **une seule clé d'application**.
- Les spectateurs doivent recevoir un paquet d'extension **incluant `klipy-config.js`**, pas une archive brute du dépôt. Aucune interface ne leur demande une clé. La clé embarquée est techniquement visible dans l'extension distribuée : ne jamais l'assimiler à un secret OAuth.
- **Clé de test/Beta : 100 appels/heure pour l'application**, acceptée pour la petite bêta. L'accès Production et les éventuels coûts se négocient séparément avec KLIPY.
- Pas de proxy, serveur ou backend LoopTV. La publication sur les stores reste une opération séparée.

## Sécurité et vie privée

- Permissions Chrome limitées à `storage`, aux scripts d'affichage sur Twitch et à `https://api.klipy.com/*` pour les appels API. Médias affichés uniquement depuis des URL **HTTPS `static.klipy.com` renvoyées telles quelles par KLIPY**.
- Recherches et résolutions utilisent l'API KLIPY v2, avec `media_filter=gif,tinygif` (la route `posts` rejette `nanogif`), filtre de contenu `medium`, limite de 12 résultats et pagination explicite.
- Ni pseudo, ni historique, ni texte de chat envoyé à KLIPY : uniquement recherche, pagination ou IDs des GIFs. **KLIPY reçoit néanmoins les requêtes et peut traiter les recherches, données techniques et adresses IP** selon sa politique.
- Aucune télémétrie, publicité, collecte ou cache persistant ajouté par LoopTV. Seules les requêtes en cours identiques sont dédupliquées.
- Six animations simultanées au maximum ; taille/dimensions contrôlées. Les **GIFs sont animés par défaut**, même si Windows active la réduction du mouvement ; l'utilisateur peut désactiver cette dérogation dans l'onglet GIFs. Les **Name Paints animés** ont leur propre réglage, actif par défaut.
- Le nouveau marqueur KLIPY `[ltv:k:ID]` accepte uniquement un ID décimal. L'ancien `[gifrift:k:ID]` reste reconnu. Les marqueurs GIPHY `[gifrift:g:ID]` **restent du texte** ; aucune conversion arbitraire.
- Attribution `Powered by KLIPY` visible dans le panneau et sous les GIFs, source/auteur lorsqu'ils sont fournis. La modération synchronisée par chaîne reste hors du périmètre de cette version ; ne pas annoncer une distribution publique définitive.

## Vérifications

- `node --test` : parseur KLIPY, validation des médias, API, pagination, erreurs (401/403/429, réseau), permissions et déduplication de requêtes.
- `python test/twitch-check.py` : Chrome headless, panneau intégré, scroll, page suivante, requêtes obsolètes, choix et insertion Slate, Entrée, brouillon, suppression, six GIFs, réglages et changement de chaîne (réponses/médias simulés).
- `python test/browser-check.py` : régression de l'ancien chat de démonstration et préférences, sans API.
- `python test/firefox-check.py` : installation temporaire de l'archive Firefox dans Firefox headless (sans requête KLIPY).
- `python test/chromium-check.py` : chargement du dossier Chromium dans Brave et Edge headless, l'un après l'autre (sans requête KLIPY). Chrome officiel 137+ bloque `--load-extension` en ligne de commande : tester via `chrome://extensions`.

Les appels **réels** KLIPY v2 ont répondu HTTP 200 pour la recherche, les tendances, la pagination et la résolution par ID ; les réponses contiennent des GIFs animés depuis `static.klipy.com`. Les tests Twitch automatisés utilisent des médias fictifs. Le chargement du paquet est vérifié dans Firefox, Brave et Edge. Chrome officiel requiert l'installation manuelle déjà utilisée pendant le développement ; le parcours Twitch réel chez un second spectateur n'est pas encore vérifié.

Documentation : [recherche KLIPY](https://docs.klipy.com/migrate-from-tenor/search), [résolution d'ID](https://docs.klipy.com/migrate-from-tenor/posts), [attribution](https://docs.klipy.com/attribution), [conditions API](https://klipy.com/support/api-terms).

## Crédits

Voir aussi [CONTRIBUTORS.md](CONTRIBUTORS.md).

- **Shinra Tensei** : concept, direction du projet et validation sur Twitch.
- **[Chat On Steroids](https://github.com/totec448-spec/chat-on-steroids)** : assistance au développement, tests et préparation multi-navigateurs.

Ce crédit reste visible dans le dépôt. Le panneau « Contributors » de GitHub est calculé à partir de l'identité Git des commits ; aucune identité GitHub non vérifiée n'est attribuée à Chat On Steroids.
