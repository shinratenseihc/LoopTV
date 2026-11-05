# LoopTV : fiches pour Firefox Add-ons et Microsoft Edge Add-ons

Ces textes sont prêts à copier dans les portails développeurs après connexion. **Aucune soumission en store n'est encore effectuée.** La version Google Chrome Web Store est volontairement reportée.

## Identité

- Nom : **LoopTV**
- Version : **0.7.0** (bêta)
- Site : https://github.com/shinratenseihc/LoopTV
- Support : https://github.com/shinratenseihc/LoopTV/issues
- Confidentialité : https://github.com/shinratenseihc/LoopTV/blob/main/PRIVACY.md
- Icône : `icons/icon-128.png`
- Paquet Edge : `dist/LoopTV-0.7.0-chromium.zip`
- Paquet Mozilla : `dist/LoopTV-0.7.0-firefox.zip` (**à faire signer par Mozilla**)

## English listing

**Tagline:** Because basic features shouldn't be locked behind a paywall.

**Summary:** Share real animated GIFs in Twitch chat using KLIPY, without a subscription or individual API key.

**Description:**

LoopTV brings real animated GIFs to Twitch chat. Search KLIPY GIFs in a compact picker above the chat input, choose an animation and press Enter to send it. Other viewers with LoopTV see the animation directly in chat. Viewers without the extension see a text marker instead.

The beta is free, requires no LoopTV account and has no ads or telemetry added by LoopTV. The extension stores only local display preferences. Searches and GIF IDs are sent directly to KLIPY, and images load from the KLIPY CDN. The shared test API key has a 100-requests-per-hour limit across users; availability may be limited when that quota is reached.

Animations can be disabled and up to six GIFs appear at once. LoopTV is independent of Twitch and KLIPY. Channel-wide GIF moderation is not available in this version.

**Permissions explanation:** `storage` stores display preferences locally. A Twitch content script inserts the GIF picker and renders GIFs in chat. Host access to `api.klipy.com` is needed for GIF search and ID resolution. GIF media is loaded directly from `static.klipy.com`.

**Reviewer notes:** No account or special login is needed for the extension. Navigate to a Twitch channel with chat, click GIF next to Chat, search and choose a GIF. Press Enter to send the marker yourself. GIF animations appear only to viewers with LoopTV installed. No messages are sent automatically. The KLIPY shared beta key is bundled inside the extension package, not the public source repository. The public source is at https://github.com/shinratenseihc/LoopTV ; build documentation is in `DISTRIBUTION.md`.

## Fiche française

**Accroche :** Parce que les fonctionnalités de base ne devraient pas être bloquées derrière un abonnement.

**Résumé :** Affiche de vrais GIFs animés dans le chat Twitch avec KLIPY, sans abonnement ni clé API personnelle.

**Description :** LoopTV ajoute un panneau compact de recherche de GIFs animés au-dessus du chat Twitch. Sélectionne une animation, puis appuie sur Entrée pour l'envoyer. Les autres spectateurs qui ont LoopTV voient le GIF ; ceux sans extension voient un marqueur texte. Aucune publicité ni télémétrie propre à LoopTV, aucun compte nécessaire. Les recherches et identifiants GIF sont traités par KLIPY. La bêta utilise un quota partagé de 100 requêtes par heure. Jusqu'à six GIFs simultanément, avec réglage de désactivation des animations.

## Avant de soumettre

- Se connecter à un compte développeur Mozilla (AMO) et/ou Microsoft Partner Center (Edge Add-ons).
- Fournir **de vraies captures d'écran de LoopTV sur Twitch**, non encore ajoutées.
- Déclarer les recherches transmises à KLIPY et fournir l'URL de confidentialité ci-dessus.
- Choisir une licence sur le formulaire Mozilla. **Aucune licence open source n'est implicitement accordée par la publication du dépôt GitHub.**
- Firefox : cocher bêta / expérimental si disponible, choisir la distribution sur AMO pour une installation permanente et les mises à jour automatiques ; le ZIP doit être signé par Mozilla.
- Ne pas prétendre que des GIFs s'affichent chez des personnes **sans** l'extension, ni que la modération globale est déjà disponible.
