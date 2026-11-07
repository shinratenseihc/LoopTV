# LoopTV 1.0 : fiche pour Firefox Add-ons (AMO)

Textes préparés pour le portail Mozilla. **Un ZIP construit localement n'est pas signé ni publié sur AMO.** Chrome Web Store et Edge Add-ons sont reportés.

## Identité

- Nom : **LoopTV**
- Version : **1.0.0**
- Site : https://github.com/shinratenseihc/LoopTV
- Support : https://github.com/shinratenseihc/LoopTV/issues
- Confidentialité : https://github.com/shinratenseihc/LoopTV/blob/main/PRIVACY.md
- Icône : `icons/icon-128.png`
- Paquet Mozilla : `dist/LoopTV-1.0.0-firefox.zip` (**à faire signer et répertorier par Mozilla**)
- Identifiant Gecko stable : `looptv@shinratenseihc` ; Firefox 140 minimum

## English listing

**Tagline:** Because basic features shouldn't be locked behind a paywall.

**Summary:** Share real animated GIFs in Twitch chat using KLIPY, without a subscription or individual API key.

**Description:**

LoopTV brings real animated GIFs to Twitch chat. Search KLIPY GIFs in a compact picker above the chat input, choose an animation and press Enter to send it. Other viewers with LoopTV see the animation directly in chat. Viewers without the extension see a text marker instead.

LoopTV is free, requires no LoopTV account and has no ads or telemetry added by LoopTV. It also adds 48 original animated name paints, plus Auto mode, with locally stored appearance choices. Searches and public Twitch-chat GIF IDs are sent directly to KLIPY, and images load from the KLIPY CDN. The shared test API key has a 100-requests-per-hour limit across users; availability may be limited when that quota is reached.

GIF and name-paint animations have separate switches and are enabled by default. Up to six GIFs appear at once. Custom name-paint choices are visible only in your own browser, not automatically synchronized to other viewers. LoopTV is independent of Twitch and KLIPY. Channel-wide GIF moderation is not available in this version.

**Permissions explanation:** `storage` stores display preferences locally. A Twitch content script inserts the GIF picker and renders GIFs in chat. Host access to `api.klipy.com` is needed for GIF search and ID resolution. GIF media is loaded directly from `static.klipy.com`.

**Reviewer notes:** No separate account or special login is needed for the extension beyond Twitch's own requirements to send chat messages. Navigate to a Twitch channel with chat, click GIF next to Chat, search and choose a GIF. Press Enter to send the marker yourself. GIF animations appear only to viewers with LoopTV installed. No messages are sent automatically. Open the extension popup to see the 48 animated name-paint palettes and both animation switches. The shared KLIPY test key is bundled inside the extension package, not the public source repository. `searchTerms` covers searches entered in the LoopTV picker; `websiteContent` covers numeric GIF IDs read from Twitch chat and sent to KLIPY for resolving; no other chat content is transmitted. Source: https://github.com/shinratenseihc/LoopTV ; build steps: `DISTRIBUTION.md`.

## Fiche française

**Accroche :** Parce que les fonctionnalités de base ne devraient pas être bloquées derrière un abonnement.

**Résumé :** Affiche de vrais GIFs animés dans le chat Twitch avec KLIPY, sans abonnement ni clé API personnelle.

**Description :** LoopTV ajoute un panneau de GIFs KLIPY au chat Twitch, 48 Name Paints originaux animés et un mode Auto. Choisis ton GIF puis appuie sur Entrée pour l'envoyer. Les spectateurs équipés de LoopTV voient l'animation ; les autres voient le marqueur texte. Les palettes personnalisées restent locales. Gratuit, sans compte LoopTV, publicité ou télémétrie propre. Les recherches et les seuls identifiants numériques de GIFs présents dans le chat sont envoyés à KLIPY. La clé de test actuelle impose un quota partagé de 100 requêtes par heure. Six GIFs simultanés au maximum ; deux interrupteurs indépendants pour les animations.

## Avant de soumettre

- Se connecter à un compte développeur Mozilla (AMO) et/ou Microsoft Partner Center (Edge Add-ons).
- Fournir **de vraies captures d'écran de LoopTV sur Twitch**, non encore ajoutées.
- Déclarer les recherches transmises à KLIPY et fournir l'URL de confidentialité ci-dessus.
- Choisir une licence sur le formulaire Mozilla. **Sans fichier LICENSE, ne pas déclarer le code open source ; conserver « tous droits réservés » jusqu'à une décision explicite du propriétaire.**
- Firefox : choisir la **distribution répertoriée sur AMO** pour une installation permanente et des mises à jour automatiques ; le ZIP doit être accepté et signé par Mozilla.
- Ne pas prétendre que des GIFs s'affichent chez des personnes **sans** l'extension, ni que la modération globale est déjà disponible.
