# LoopTV 1.0.0 : construction et publication Firefox

## Construire les versions

Depuis le dossier du projet, sous Windows : `npm run build`.

Le script vérifie la présence du fichier local `klipy-config.js` et des ressources, puis construit :

| Archive | Destinations |
| --- | --- |
| `dist/LoopTV-1.0.0-chromium.zip` | Paquet Chromium non signé, installation manuelle pour l'instant |
| `dist/LoopTV-1.0.0-firefox.zip` | À soumettre sur addons.mozilla.org pour signature et référencement |

Les ZIP ont **une clé KLIPY de test incluse**. Les ZIP et leur clé ne sont pas versionnés dans Git, mais la clé est **extractible par tout destinataire de l'archive**. Elle ne doit jamais être traitée comme un secret OAuth ou un secret serveur. Le quota est commun aux utilisateurs.

## Tester sans publier

**Chrome** : `chrome://extensions` → Mode développeur → Charger l'extension non empaquetée → `dist/chromium`.

**Brave** : `brave://extensions` → Mode développeur → Charger l'extension non empaquetée → `dist/chromium`.

**Edge** : `edge://extensions` → Mode développeur → Charger l'extension non empaquetée → `dist/chromium`.

**Firefox** : `about:debugging` → Ce Firefox → Charger un module complémentaire temporaire → sélectionner `dist/firefox/manifest.json`. Temporaire signifie **désinstallé au redémarrage** ; le paquet ZIP n'est pas un XPI signé.

Le test réel doit vérifier sur Twitch : bouton GIF à gauche de Chat, recherche KLIPY, sélection du marqueur dans Slate, envoi **manuel** et rendu chez un second spectateur doté de l'extension. Ne pas envoyer de messages publics juste pour tester sans le décider.

Vérifications automatiques sans message Twitch ni appel KLIPY : `npm test`, `python test/twitch-check.py`, `python test/browser-check.py`, `python test/firefox-check.py` et `python test/chromium-check.py`. Les deux derniers vérifient que Firefox, Brave et Edge chargent effectivement l'extension, sans simuler une installation signée. Chrome officiel 137+ interdit le chargement automatique par `--load-extension` ; ouvrir `chrome://extensions` pour charger manuellement le dossier construit.

## Distribution publique

**Tant que la fiche AMO n'est pas validée :** les ZIP configurés sont fournis via [GitHub Releases](https://github.com/shinratenseihc/LoopTV/releases/latest) et un [tutoriel d'installation](INSTALL.md). Le dépôt GitHub contient le code source **sans la clé KLIPY**. Une archive automatique « Source code (zip) » de GitHub n'est donc **pas** l'archive prête à installer.

1. **Firefox / AMO (priorité)** : se connecter sur https://addons.mozilla.org/developers/ ; choisir **On this site** (répertoriée), soumettre le ZIP Firefox, fournir la fiche, les informations de confidentialité, les notes de test et sélectionner Firefox desktop. Mozilla doit signer l'extension pour une installation permanente avec mises à jour automatiques.
2. **Chrome, Brave et Edge (plus tard)** : les utilisateurs peuvent utiliser le paquet Chromium en mode développeur. La publication sur leurs stores n'est pas l'objet de cette sortie.

**Règles Mozilla :** [soumission officielle](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/), [signature](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/), [déclaration de données](https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/). Le manifeste conserve `looptv@shinratenseihc` et Firefox 140 minimum ; il déclare les recherches et les IDs GIF extraits du chat (`searchTerms` et `websiteContent`).

Une soumission ne garantit pas l'acceptation par les stores. Le nom de dépôt local `GIFRIFT` et les marqueurs historiques `[gifrift:k:ID]` restent inchangés pour la compatibilité technique.

## À préparer pour le formulaire de chaque store

Textes pour les formulaires : [STORE_LISTINGS.md](STORE_LISTINGS.md) (anglais et français, descriptions, permissions et notes aux reviewers).

- Nom public : **LoopTV (LTV)**, version 1.0.0.
- Description : « Affiche des GIFs animés KLIPY dans le chat Twitch ; les spectateurs équipés voient les animations, les autres voient un marqueur texte. »
- Icônes d'extension dans `icons/`, captures d'écran réelles de l'interface Twitch si disponibles.
- Notice [PRIVACY.md](PRIVACY.md), accessible publiquement depuis le dépôt GitHub et à communiquer aux stores.
- Déclarer exactement les permissions, les recherches et **les identifiants numériques extraits du chat Twitch** transmis à KLIPY, les médias du CDN et l'absence de suivi/compte LoopTV.
- La modération synchronisée par chaîne et le blocage partagé des GIFs ne sont **pas encore implémentés**. Ne pas les annoncer.

## Quota KLIPY et coût

La clé de test accepte **100 requêtes API par heure pour toute la clé**. Une recherche, une page suivante et une résolution d'ID consomment chacune des appels. Quand dix personnes reçoivent le même ID, cela peut produire plusieurs résolutions séparées : la déduplication actuelle concerne seulement les appels simultanés dans un même navigateur.

**Risque de lancement public 1.0 :** ce quota n'est pas adapté à une audience importante. Demander une clé Production dans le [Partner Panel](https://klipy.com/developers) avant une large promotion. Les [conditions KLIPY](https://klipy.com/support/api-terms) imposent une attribution et limitent la mise en cache des médias. Ne pas présumer du coût de l'accès Production. La clé intégrée au navigateur reste récupérable même si elle n'apparaît pas dans Git.

## Crédits

Concept et validation : Shinra Tensei. Assistance au développement et préparation multi-navigateurs : [Chat On Steroids](https://github.com/totec448-spec/chat-on-steroids). L'entrée automatique « Contributors » sur GitHub dépend des auteurs Git des commits, pas des liens de crédit.
