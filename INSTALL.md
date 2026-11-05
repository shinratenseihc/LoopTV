# Installer LoopTV (bêta 0.7.0)

**Gratuit, sans compte LoopTV et sans clé API à configurer.** Télécharge uniquement les fichiers de la page officielle : **[GitHub Releases](https://github.com/shinratenseihc/LoopTV/releases/latest)**.

## Chrome, Brave et Microsoft Edge (installation manuelle)

1. Télécharge **`LoopTV-0.7.0-chromium.zip`** dans la dernière release GitHub.
2. **Décompresse** le ZIP dans un dossier que tu vas garder (par exemple `Documents/LoopTV`). Ne sélectionne pas directement le ZIP.
3. Ouvre la page des extensions : `chrome://extensions` pour Chrome, `brave://extensions` pour Brave, ou `edge://extensions` pour Edge.
4. Active le **Mode développeur**.
5. Clique sur **Charger l'extension non empaquetée** (*Load unpacked*) et sélectionne le dossier décompressé **contenant `manifest.json`**.
6. Ouvre ou recharge Twitch. Le bouton **GIF** apparaît à gauche du bouton Chat. Choisis ton GIF, puis appuie toi-même sur **Entrée**.

**Important :** garde ce dossier en place, sinon l'extension ne pourra plus être chargée. Les installations manuelles **ne se mettent pas automatiquement à jour** : télécharge la nouvelle version sur GitHub lors d'une mise à jour.

## Firefox (temporaire jusqu'à la signature Mozilla)

1. Télécharge et décompresse **`LoopTV-0.7.0-firefox.zip`** depuis GitHub Releases.
2. Ouvre `about:debugging`, puis **Ce Firefox** (*This Firefox*).
3. Clique sur **Charger un module complémentaire temporaire** et sélectionne `manifest.json` dans le dossier décompressé.
4. Recharge Twitch. **Cette installation disparaît au prochain redémarrage de Firefox.** Pour une installation permanente, il faut attendre la version signée par Mozilla Add-ons.

## À savoir

- Les spectateurs doivent eux aussi avoir **LoopTV** pour voir les GIFs animés. Sinon, ils voient un marqueur texte `[gifrift:k:ID]`.
- Les GIFs proviennent de **KLIPY**. La bêta partage un quota de **100 appels API par heure** ; si la limite est atteinte, réessaie plus tard.
- Pas de publicité, compte, serveur de collecte ou télémétrie ajoutée par LoopTV. Les recherches, identifiants GIF et requêtes de médias vont directement à KLIPY : [confidentialité](PRIVACY.md).
- N'installe pas de ZIP LoopTV provenant de dépôts inconnus. L'archive GitHub est le paquet officiel du projet.

Pour les développeurs : [README](README.md) · [Distribution et stores](DISTRIBUTION.md).
