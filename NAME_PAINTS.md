# Name Paints : aperçu technique (LoopTV 0.8.0)

Cette fonctionnalité est **expérimentale**, sur la branche `feat/free-name-paints`. La version publique GitHub `v0.7.0` n'est **pas** remplacée.

## Fonctionnement

- Les pseudos des messages Twitch reçoivent un dégradé coloré gratuit. Le nom (casse et Unicode normalisés) détermine la palette et l'angle du dégradé ; tous les navigateurs LoopTV 0.8.0 obtiennent le **même résultat pour le même pseudo**, sans serveur.
- Le réglage **Pseudos en dégradé** permet de désactiver entièrement l'effet et de restaurer la couleur native de Twitch.
- Le réglage **Dégradés animés** anime lentement le fond ; désactivé par défaut, il respecte `prefers-reduced-motion`.
- La popup affiche un **aperçu** d'un pseudo de démonstration modifiable, sans enregistrer ni transmettre sa valeur.
- Aucune permission supplémentaire, télémétrie, API tierce ou transmission de pseudos. Les préférences sont sauvegardées dans le navigateur (`chrome.storage.local`).
- Les GIFs, les marqueurs `[gifrift:k:ID]`, les préférences d'animation GIF et le quota KLIPY fonctionnent indépendamment.

## Limites de cette première version

- Les palettes sont **originales** et générées localement. Elles ne copient pas les textures 7TV/BTTV ni ne débloquent leurs cosmétiques premium.
- L'effet est automatique pour chaque pseudo affiché. Chaque utilisateur **ne choisit pas encore un effet personnel synchronisé** avec les autres utilisateurs. Pour cela il faudrait un mécanisme d'association de compte et de synchronisation, ou un protocole de partage convenu.
- La version 0.8.0 a été testée contre un DOM Twitch simulé, et non encore contre tous les thèmes et variantes de l'interface Twitch réelle. Les autres extensions qui stylisent les noms peuvent entrer en conflit avec la priorité CSS ; désactiver l'un des deux réglages de peinture dans ce cas.

## Vérifier

1. `npm test` pour les palettes déterministes, la validation des entrées et les régressions KLIPY.
2. `python test/twitch-check.py` pour les pseudos et GIFs dans le chat simulé, les préférences, la réduction du mouvement, l'éditeur Slate et la pagination.
3. `python test/browser-check.py` pour la popup, son aperçu et les GIFs simulés.
4. `npm run build`, puis `python test/chromium-check.py` et `python test/firefox-check.py` pour le chargement multi-navigateurs.

Le code source est indépendant de 7TV et BetterTTV. L'interopérabilité future avec les cosmétiques **déjà attribués par ces services** nécessitera une vérification dédiée de leurs API et conditions d'utilisation.
