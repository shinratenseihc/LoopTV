# Name Paints : aperçu technique (LoopTV 0.8.0)

Cette fonctionnalité est **expérimentale**, sur la branche `feat/free-name-paints`. La version publique GitHub `v0.7.0` n'est **pas** remplacée.

## Fonctionnement

- Les pseudos des messages Twitch reçoivent un dégradé coloré gratuit. La couleur native du chat Twitch, lorsqu'elle est accessible dans le style du pseudo, sélectionne une des **48 palettes originales**. Sinon, un hash du pseudo (casse et Unicode normalisés) fournit une palette stable. Le pseudo détermine également l'angle du dégradé.
- **48 palettes au choix + mode Auto.** Les six familles sont Classiques, Néons, Métalliques, Pastels, Duos et Fantaisie. Certains effets ont un halo lumineux ou un fini métallique. La galerie affiche directement un aperçu du pseudo, comporte une recherche insensible aux accents et défile indépendamment de la popup.
- Dans la popup, saisis ton pseudo Twitch et sélectionne un dégradé : le réglage s'applique uniquement aux messages de ce pseudo **dans ton navigateur**. Les autres pseudos restent en mode automatique.
- **Choix partagé sans serveur :** si le pseudo est peint à partir de sa couleur Twitch native, modifier cette couleur dans Twitch change la palette visible chez les autres spectateurs équipés de LoopTV, tant qu'ils reçoivent bien cette couleur dans le chat. Le choix direct parmi les 48 palettes **n'est pas synchronisé** entre spectateurs.
- Le réglage **Pseudos en dégradé** permet de désactiver entièrement l'effet et de restaurer la couleur native de Twitch.
- Le réglage **Dégradés animés** est **actif par défaut** : le fond du pseudo se déplace visiblement sur trois secondes, avec effet lumineux selon la palette. Ce réglage LoopTV prévaut sur la réduction des animations Windows, comme pour les GIFs. La case à cocher permet de tout arrêter immédiatement, sans toucher aux GIFs.
- La popup sépare les réglages en deux onglets **GIFs** et **Couleurs**, accessibles au clavier. Elle affiche un **aperçu** du pseudo entré et les **49 options** en boutons illustrés. Elle mémorise le pseudo ciblé, sa palette et l'onglet actif **uniquement localement**, sans les transmettre.
- En mode Auto, **l'aperçu est indicatif** : la couleur Twitch réelle peut sélectionner une autre palette dans le chat.
- Aucune permission supplémentaire, télémétrie, API tierce ou transmission de pseudos vers LoopTV. Les préférences et le pseudo ciblé sont sauvegardés dans le navigateur (`chrome.storage.local`).
- Les GIFs, les marqueurs `[gifrift:k:ID]`, les préférences d'animation GIF et le quota KLIPY fonctionnent indépendamment.

## Limites de cette première version

- Les palettes sont **originales** et générées localement. Elles ne copient pas les textures 7TV/BTTV ni ne débloquent leurs cosmétiques premium.
- Les 48 boutons ne publient **pas** le choix manuel pour les autres spectateurs. Le choix visible entre navigateurs passe uniquement par la couleur Twitch native, pas par un réglage LoopTV partagé. Une palette LoopTV choisie et synchronisée indépendamment de Twitch nécessiterait une association d'identité et un stockage/protocole de partage.
- Les sélecteurs ont été comparés au **DOM réel d'un chat Twitch actif** (lecture seule, aucun message envoyé). Twitch y imbrique le pseudo dans un conteneur distinct ; le rendu ne cible maintenant **qu'un seul élément par pseudo** et utilise la couleur CSS calculée si nécessaire. Les tests automatiques simulent un chat avec 100 messages supplémentaires, suppression et réutilisation de lignes. La version 0.8.0 n'a pas encore été intégralement testée dans les différentes variantes d'un chat Twitch réel. Les autres extensions qui stylisent les noms peuvent entrer en conflit avec la priorité CSS ; désactiver l'un des deux réglages de peinture dans ce cas.

## Vérifier

1. `npm test` pour les palettes déterministes, la validation des entrées et les régressions KLIPY.
2. `python test/twitch-check.py` pour les pseudos et GIFs dans le chat simulé, les préférences, la réduction du mouvement, l'éditeur Slate et la pagination.
3. `python test/browser-check.py` pour la popup, son aperçu et les GIFs simulés.
4. `npm run build`, puis `python test/chromium-check.py` et `python test/firefox-check.py` pour le chargement multi-navigateurs.

Le code source est indépendant de 7TV et BetterTTV. L'interopérabilité future avec les cosmétiques **déjà attribués par ces services** nécessitera une vérification dédiée de leurs API et conditions d'utilisation.
