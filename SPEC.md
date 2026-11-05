# GIFRIFT | Cahier des charges et feuille de route

**Statut :** LoopTV v0.7.0 publiée sur GitHub. La branche locale `feat/free-name-paints` prépare **v0.8.0 expérimentale**, isolée de la version publique. Panneau GIF KLIPY, pagination et marqueur `[gifrift:k:ID]` conservés. Ajout de dégradés gratuits et déterministes, réglage et aperçu, avec tests simulés ; validation sur Twitch réel restant à effectuer.
**Date :** 2026-11-04
**Emplacement :** `F:\AI Projects\GIFRIFT`
**Cible :** extension de navigateur pour le chat Twitch, gratuite et open source.

## 1. Vision du produit

Afficher dans le chat Twitch de **vrais GIFs animés grand format**, comme dans Discord, et non de petites emotes. Chaque spectateur souhaitant les voir installe GIFRIFT, comme il installe 7TV. Pas de dépendance à un abonnement Twitch T2/T3. Le streamer garde le contrôle de ce qui peut s'afficher sur **sa chaîne**.

**Principes non négociables :** sécurité, respect de la vie privée, modération par chaîne, interface simple, faibles ressources, code ouvert et aucune télémétrie.

## 2. Fonctionnement cible

1. Sur Twitch, l'utilisateur clique sur un bouton **GIF** près de la zone de saisie.
2. Il recherche et prévisualise un GIF, puis le sélectionne.
3. L'extension insère un **marqueur textuel court** dans le message Twitch, en suivant les interfaces autorisées et les limites du chat.
4. Sur les navigateurs équipés de GIFRIFT, le marqueur est détecté et remplacé visuellement par un GIF animé grand format. Sans GIFRIFT, le spectateur voit le texte du marqueur.
5. Le GIF ne s'affiche que si les règles de modération et de sécurité de **la chaîne consultée** l'autorisent.

**Important :** on ne modifie pas les serveurs Twitch et on ne force pas l'affichage chez les visiteurs qui n'ont pas installé l'extension. Ne jamais contourner les restrictions de discussion, les bans ou les suppressions de messages.

## 3. Expérience utilisateur (MVP)

- Bouton GIF intégré au chat, clavier/recherche et favoris.
- Catalogue provenant d'un fournisseur compatible, après contrôle des conditions d'utilisation de son API.
- GIF jusqu'à **300 × 240 px** affichés avec proportions conservées ; taille réglable à l'avenir.
- Prévisualisation avant envoi et chargement différé dans le chat.
- Désactivation locale des animations et mode « cliquer pour lire ».
- Options d'accessibilité : `prefers-reduced-motion`, texte alternatif, focus clavier.
- Aucun panneau intrusif : interface moderne, minimaliste, responsive.
- Première cible : Chrome/Chromium sous Manifest V3 ; Firefox ensuite.

## 4. Sécurité et confidentialité

### Règles obligatoires

- **Zéro télémétrie, zéro publicité, zéro suivi comportemental.** Ne pas collecter les messages, les historiques de navigation ou les statistiques personnelles.
- **Pas de compte GIFRIFT** pour les spectateurs. Stocker les favoris et préférences localement.
- Autorisations d'extension minimales : domaine Twitch et domaines d'API/médias strictement nécessaires. Pas d'accès global à tous les sites.
- Interdire `eval`, le JavaScript distant, l'injection de HTML non fiable et l'interprétation des métadonnées GIF comme du code.
- Utiliser des éléments médias contrôlés, une politique CSP stricte, des contrôles MIME/tailles et une liste de sources autorisées.
- Limiter nombre de GIFs, décodage, fréquence de chargement, poids, dimensions et cache pour empêcher le spam et la consommation excessive de RAM/CPU.
- Ne jamais télécharger ou exécuter les fichiers proposés par les utilisateurs.
- Publier le code et les dépendances, tenir les versions et dépendances à jour ; ne jamais intégrer de véritables secrets (OAuth, jetons privés). La clé KLIPY est une **clé publique d'application embarquée**, techniquement récupérable dans le paquet. Le fichier de configuration local est ignoré par Git pour éviter une publication accidentelle, sans prétendre la cacher aux spectateurs.
- Pour les actions de modération, vérifier **côté serveur** l'identité et les droits Twitch du streamer/modérateur via OAuth à privilèges minimaux. Ne pas faire confiance à un simple indicateur local « modo ».
- Séparer les jetons des données médias ; ne jamais logger ni exposer les jetons.

### Transparence sur les réseaux

« Pas de collecte de données par GIFRIFT » ne signifie pas « aucune requête réseau ». Twitch et le fournisseur des GIFs peuvent techniquement voir les requêtes qui leur sont envoyées (adresse IP, recherche, média demandé). Les expliquer dans une politique de confidentialité lisible. Étudier une architecture minimisant ces fuites sans promettre un anonymat irréaliste.

## 5. Modération par chaîne (fonction prioritaire)

### Comportements attendus

- Le streamer et ses modérateurs voient un menu **Bannir ce GIF** sur chaque GIF.
- Le bannissement s'applique à **cette chaîne uniquement** et se répercute sur les spectateurs GIFRIFT.
- Les viewers ne peuvent pas rétablir un GIF banni par une simple préférence de leur extension.
- Tableau de bord : liste des GIFs bannis, prévisualisation, date, débannissement.
- Interrupteur global **Désactiver les GIFs sur ma chaîne** (« panic button »).
- Les spectateurs peuvent toujours désactiver localement tous les GIFs.
- La suppression d'un message Twitch doit faire disparaître le GIF correspondant de l'affichage ; idem en cas de purge du chat.

### Mécanisme prévu

Une **liste de blocage synchronisée par chaîne** est nécessaire si l'on veut une vraie modération cohérente entre tous les navigateurs. Prévoir une petite API dédiée, qui conserve uniquement les paramètres de modération de la chaîne (ID chaîne, identifiants de GIF bloqués, dates, statut global). **Pas de base de données des conversations** ni d'analytique.

Évaluer en complément l'utilisation des « blocked terms » Twitch pour bloquer certains marqueurs à la source, **sans supposer que cela garantit tout** : limites d'API, permissions, variantes d'un même GIF et caractères génériques à vérifier. Le blocage dans l'extension et le blocage des messages sont deux couches différentes.

Pour V1 : interdire l'envoi/rendu des GIFs **par ID canonique**. Les mêmes images réencodées ou réimportées peuvent échapper à une interdiction par ID : proposer un hash perceptuel et des règles de similarité dans une version ultérieure, avec revue humaine pour limiter les faux positifs.

### Contrôle d'accès

- Lecture publique des règles de modération d'une chaîne.
- Modification réservée au propriétaire ou aux modérateurs Twitch **dont le rôle a été validé**.
- Authentification OAuth au moment de modifier une règle, avec expiration et révocation gérées proprement.
- Protection contre le flood, CSRF et abus d'API ; aucune confiance accordée aux requêtes du navigateur sans validation.

## 6. Architecture suggérée

```text
Extension Chromium (Manifest V3)
  ├── content script Twitch : interface, détection des marqueurs, rendu sécurisé
  ├── background/service worker : requêtes autorisées, cache, stockage local
  ├── composant Picker : recherche, preview, favoris
  └── composant Moderation : actions si rôle Twitch autorisé

Services externes minimaux
  ├── Fournisseur GIF : recherche + médias, selon conditions d'utilisation
  ├── Twitch : chat + identité/permissions de modération
  └── API GIFRIFT minimaliste : règles de modération par chaîne uniquement
```

**Stack indicative, à confirmer après audit :** TypeScript, Vite, React pour le picker si cela reste léger, Chrome Manifest V3, tests Vitest/Playwright ou équivalents. Pour le backend, privilégier une petite API simple, avec stockage minimal et aucune télémétrie.

## 7. Priorités de réalisation

### Phase A : prototype local (sans service déployé)

- [x] Extension Chromium Manifest V3 préparée pour chargement en mode développeur, popup locale `demo.html`.
- [x] Faux chat, GIF animé local 8 images de 2 821 octets via `[gifrift:demo]`.
- [x] Parseur strict, création DOM par `createElement` et `textContent`, suppression du média quand le message disparaît.
- [x] Test navigateur Chrome headless avec 100 messages supplémentaires, au plus six GIFs visibles et préférence de réduction du mouvement respectée.
- [x] Bouton de désactivation locale, valeur persistée via `chrome.storage.local` dans l'extension.

**Validation Phase A (2026-11-04) :** `node --test` : 1 test réussi. `python test/browser-check.py` : réussi sous Chrome 156, en servant la même page sur localhost. Résultats observés : 3 messages / 1 GIF initialement, 103 messages / 6 GIFs après simulation, 0 après nettoyage, 0 GIF avec mouvement réduit. Taille de heap JavaScript rapportée par Chrome : environ 0,93 Mo au départ et 1,80 Mo après ajout de 100 messages (valeurs ponctuelles, non assimilables à une mesure complète RAM/CPU). La mesure instrumentée CPU et le chargement manuel de l'extension dans l'interface Chrome restent à confirmer. Aucun service GIF ni API Twitch connecté.

### Phase B : intégration Twitch

- [x] Script de contenu limité à Twitch et détection de marqueurs sur des lignes de chat simulées, avec suppression du GIF quand la ligne disparaît.
- [x] Bouton de test GIF injecté près de l'éditeur (insertion native du marqueur, envoi manuel).
- [ ] Vérifier les sélecteurs Twitch et le comportement de l'éditeur sur la page réelle.
- [x] **Historique v0.5** : sélection d'un GIF via lien GIPHY (fonction remplacée en v0.7).
- [x] **v0.7** : recherche intégrée de vrais GIFs KLIPY, prévisualisations, pagination et choix dans l'éditeur Slate, sans clé individuelle.
- [x] **v0.7** : résolution d'un ID dans un contexte sans historique, rendu des GIFs, limitation à six médias et restauration du marqueur au retrait.
- [ ] Validation commerciale/Production KLIPY et favoris ; aucune licence ou quota illimité annoncé.
- Éprouver les changements de page, le lazy loading et les messages supprimés.
- Vérifier les règles Twitch et la licence du fournisseur GIF avant diffusion.

**Validation partielle Phase B (2026-11-05) :** `python test/twitch-check.py` : réussi en Chrome headless sur une structure de chat simulée : 100 messages, maximum 6 GIFs, disparition après suppression, désactivation/réactivation locale et respect de `prefers-reduced-motion`. `node --test` et `python test/browser-check.py` réussis. Aucune intégration live, aucune insertion réelle ni conformité Twitch prétendue vérifiée.

**Correctif éditeur (2026-11-05) :** inspection du DOM sur la chaîne Twitch ouverte : le bouton était un enfant direct d'un conteneur de l'éditeur Slate, ce qui perturbait la saisie et l'envoi. Le code place désormais le bouton dans la barre de commandes `chat-input-buttons-container` et n'insère pas de marqueur lorsque le champ contient déjà du texte. Aucun message public n'a été envoyé durant cette vérification.

**Correctif v0.2.1 (2026-11-05) :** abandon de `document.execCommand("insertText")` qui pouvait modifier le DOM sans mettre à jour l'état interne de l'éditeur. L'extension déclenche `beforeinput` avec `inputType: "insertText"` sur le nœud Slate existant, sans remplacer ses enfants. Le test `python test/twitch-check.py` vérifie qu'un modèle d'éditeur contrôlé accepte le texte, qu'Entrée lit le modèle, qu'un second clic ne duplique pas le marqueur et que l'insertion recommence après l'envoi. La validation sur le vrai site reste ouverte, le navigateur connecté ne répondant plus à l'inspection lors de cette session.

**Correctif v0.2.2 (2026-11-05) :** inspection DOM du vrai message Twitch contenant `[gifrift:demo]`. Le fragment de texte correspond bien au parseur et `matchMedia('(prefers-reduced-motion: reduce)').matches` était `true`, d'où l'absence d'image. Ajout de la préférence locale `allowMotion` qui permet de forcer l'animation sans modifier Windows. Test automatisé réussi avec réduction du mouvement activée et `allowMotion=true`; inspection réelle d'un emplacement image 300 × 120 px dans le chat, sans conserver la modification de test.

**Correctif v0.2.3 (2026-11-05) :** le fragment textuel Twitch est caché avec `hidden` lorsque son GIF est rendu ; il est restauré si le GIF est retiré. Contrôles automatisés réussis sur activation, désactivation, réduction des animations et nouveau rendu. Le nœud textuel reste présent pour préserver la gestion des messages Twitch.

**Intégration GIPHY v0.3.0 (2026-11-05) :** GIPHY retenu pour l'étendue annoncée de son catalogue. L'API Tenor est arrêtée depuis le 30 juin 2026. Implémentés : service worker avec accès à `api.giphy.com`, recherche/tendances et résolution d'identifiants, sélection en popup dans Twitch, aperçu des 12 premiers résultats, contrôle des URL CDN, taille déclarée maximale de 2 Mio par média, aucune réponse ou média mis en cache par GIFRIFT, attribution GIPHY, clé API locale dans la popup. Les tests Node (5 réussis), les tests Chrome/Selenium de simulation et la vérification de chargement d'une image GIPHY depuis le vrai onglet Twitch ont réussi. Limite structurelle actuelle : chaque spectateur doit renseigner une clé GIPHY, la production nécessitera une clé d'application et un quota approprié. Le sélecteur réel n'est pas encore vérifié avec une clé valide.

**Décision v0.5.0 (2026-11-05) :** l'utilisateur refuse les catalogues d'emotes (7TV), les clés API individuelles et les licences payantes. Anciennes intégrations de recherche GIPHY et 7TV retirées. Le bouton GIF accepte désormais une URL publique GIPHY collée manuellement, extrait l'identifiant, envoie un marqueur court `[gifrift:g:ID]` et affiche la version GIF du CDN aux clients équipés. Aucun service worker, aucune permission d'accès à une API, aucune clé. Tests Selenium réussis sur lien accepté/refusé, insertion, Entrée, suppression, réglages d'animation et 100 messages. CDN GIF public vérifié par HEAD (200, `image/gif`, 243 967 octets). Recherche native toujours non résolue.

**v0.6.0 (2026-11-05) :** le bouton GIF ouvre une fenêtre Chrome de 640 × 730 px avec la recherche native GIPHY (`chrome.windows.create`). Un content script n'intercepte les clics sur les fiches `/gifs/...` que si la fenêtre est celle créée par GIFRIFT, puis envoie un identifiant validé au script Twitch du bon onglet via `chrome.tabs.sendMessage`. Le champ Slate est préparé sans envoi automatique ; la fenêtre se ferme après confirmation. Le repli manuel par lien est conservé. La recherche GIPHY ne peut être incorporée dans une iframe car le site renvoie `X-Frame-Options: DENY`. Vérification du HTML de recherche publique avec 66 occurrences de liens `/gifs/`, tests Node de la communication et Selenium des deux côtés réussis. Pas de clé API, abonnement, téléchargement systématique ou backend GIFRIFT.

**v0.7.0 (2026-11-05) :** intégration KLIPY v2 remplaçant le parcours GIPHY : petite grille intégrée sous Twitch `twitch.js`, recherche avec délai 450 ms, chargement des pages suivantes sur clic, choix puis insertion dans Slate, aucune publication automatique. `background.js` utilise le client borné `klipy-api.js` et `klipy-config.js` ignoré par Git. La clé unique d'application a été déchiffrée via DPAPI sur le poste sans l'afficher ni la versionner. Les URLs GIF KLIPY restent inchangées ; seules celles de `static.klipy.com` sont acceptées. Le format de marqueur `[gifrift:k:ID]` transporte un ID décimal en chaîne. Les anciens GIPHY ne sont pas convertis. Tests Node (8 réussis), Selenium sur chat fictif et régression de la démo ; appels KLIPY 200 pour recherche, tendances, pagination et résolution depuis deux instances du client. La configuration locale est prête à être incluse dans un paquet, mais une archive GitHub seule n'est pas installable sans configuration. Clé Beta : présumer 100 appels/heure pour l'application jusqu'à confirmation dans le Partner Panel. Validation Production, droits/quotas et modération synchrone encore non obtenus. La validation réelle dans Chrome sur Twitch et un second profil reste à faire.

### Phase C : modération synchronisée

- Petite API de listes bloquées, identité OAuth et vérification des rôles.
- Boutons bannir/débannir, coupe-circuit par chaîne.
- Tests de droits, rejets d'accès, propagation des règles et contournements.

### Phase D : qualité et distribution

- Tests multi-navigateurs, audit sécurité et publication open source.
- Documentation d'installation, politique de confidentialité et Chrome Web Store.
- Ajout ultérieur : GIFs personnels, Firefox et détection de doublons.

### Phase E : Name Paints gratuits (branche expérimentale v0.8.0)

- [x] Dégradés de pseudo calculés localement et identiquement sur tous les navigateurs, sans compte ni API supplémentaire.
- [x] Préférences d'activation et d'animation indépendantes des GIFs, et prévisualisation dans la popup.
- [x] Huit palettes originales sélectionnables (plus Auto) pour un pseudo ciblé localement ; sauvegarde locale du pseudo et de son choix.
- [x] Association automatique d'une palette à la couleur native du pseudo Twitch lorsqu'elle est présente : une couleur Twitch différente peut entraîner un dégradé différent chez tous les utilisateurs équipés, sans backend.
- [x] Restauration de la couleur Twitch native à la désactivation, respect des animations réduites.
- [x] Tests unitaires et tests Selenium de simulation Twitch/popup, avec régressions GIF, et chargement des paquets sur Brave, Edge et Firefox.
- [x] Inspection en lecture seule du chat Twitch réel : un unique pseudo à peindre par message, sans doubler le conteneur parent et la feuille ; couleur calculée en fallback.
- [x] Interface popup compacte par onglets **GIFs / Couleurs**, navigation clavier, restauration du dernier onglet et du dégradé sélectionné.
- [ ] Validation d'affichage dans différents chats Twitch réels et coexistence avec les styles 7TV/BTTV.
- [ ] Choix personnel LoopTV synchronisé entre utilisateurs indépendamment de la couleur Twitch : nécessite un mécanisme de synchronisation et une identité fiable.

Les 8 palettes sont **originales** : ni textures premium 7TV/BTTV, ni déblocage de cosmétiques payants, ni API de suivi des utilisateurs. Détails dans [NAME_PAINTS.md](NAME_PAINTS.md).

## 8. Critères d'acceptation

- Deux navigateurs avec l'extension voient le même GIF grand format à partir d'un même message Twitch.
- Un navigateur sans extension ne casse pas le chat et voit un message textuel.
- Un GIF banni sur une chaîne ne s'affiche plus sur cette chaîne pour les clients conformes, et peut rester autorisé ailleurs.
- Un spectateur non modérateur ne peut pas changer les règles d'une chaîne.
- Le coupe-circuit de la chaîne désactive les GIFs pour tous les utilisateurs GIFRIFT conformes.
- Aucun stockage ni envoi de contenu de chat vers un service GIFRIFT.
- Les GIFs ne chargent jamais de scripts ni de ressources provenant de domaines arbitraires.
- L'extension n'engendre pas de consommation CPU/RAM excessive dans un chat actif.

## 9. Instructions au développeur (CoS / Ponytail)

1. **Ne pas installer de skill ni de dépendances lourdes sans nécessité.** Privilégier les outils déjà présents.
2. Vérifier ce qui existe avant de coder. Ne pas confondre spécification et fonctionnalité déjà réalisée.
3. Commencer par la Phase A, puis avancer par étapes testées et documentées.
4. Ne jamais ajouter de tracking, comptes spectateurs ou collecte de chat.
5. Priorité au modèle de modération robuste, puis à l'ergonomie.
6. Utiliser des tests locaux et des mocks plutôt que d'envoyer des messages réels sur une chaîne sans demande explicite.
7. Tenir ce document à jour avec le statut réel des tâches et les preuves de validation.

## 10. Points encore à valider

- Conformité de l'envoi des marqueurs et de l'affichage avec les conditions et limites actuelles de Twitch.
- Fournisseur GIF retenu, termes API, coûts éventuels et contraintes de cache/attribution.
- Format exact du marqueur (courte longueur, collisions faibles, rejets robustes).
- Méthode de récupération fiable de l'identifiant Twitch et du rôle modérateur.
- Budget de l'API de modération et mode d'hébergement respectueux de la vie privée.

**Règle de production :** aucune affirmation de sécurité ou de compatibilité n'est considérée comme vérifiée sans test ou source documentaire identifiée.
