# LoopTV 0.7.0 : bêta et publication

## Construire les versions

Depuis le dossier du projet, sous Windows : `npm run build`.

Le script vérifie la présence du fichier local `klipy-config.js` et des ressources, puis construit :

| Archive | Destinations |
| --- | --- |
| `dist/LoopTV-0.7.0-chromium.zip` | Chrome Web Store, Edge Add-ons, utilisateurs Brave via Chrome Web Store |
| `dist/LoopTV-0.7.0-firefox.zip` | Source d'extension à signer sur addons.mozilla.org |

Les ZIP ont **une clé KLIPY d'application incluse**, donc seuls les distribuer à des testeurs de confiance ou sur les stores une fois la décision prise. Les ZIP et leur clé ne sont pas versionnés. La clé n'est pas un secret OAuth et elle est extractible d'une extension distribuée.

## Tester sans publier

**Chrome** : `chrome://extensions` → Mode développeur → Charger l'extension non empaquetée → `dist/chromium`.

**Brave** : `brave://extensions` → Mode développeur → Charger l'extension non empaquetée → `dist/chromium`.

**Edge** : `edge://extensions` → Mode développeur → Charger l'extension non empaquetée → `dist/chromium`.

**Firefox** : `about:debugging` → Ce Firefox → Charger un module complémentaire temporaire → sélectionner `dist/firefox/manifest.json`. Temporaire signifie **désinstallé au redémarrage** ; le paquet ZIP n'est pas un XPI signé.

Le test réel doit vérifier sur Twitch : bouton GIF à gauche de Chat, recherche KLIPY, sélection du marqueur dans Slate, envoi **manuel** et rendu chez un second spectateur doté de l'extension. Ne pas envoyer de messages publics juste pour tester sans le décider.

Vérifications automatiques sans message Twitch ni appel KLIPY : `npm test`, `python test/twitch-check.py`, `python test/browser-check.py`, `python test/firefox-check.py` et `python test/chromium-check.py`. Les deux derniers vérifient que Firefox, Brave et Edge chargent effectivement l'extension, sans simuler une installation signée. Chrome officiel 137+ interdit le chargement automatique par `--load-extension` ; ouvrir `chrome://extensions` pour charger manuellement le dossier construit.

## Distribution publique

1. **Chrome Web Store** : créer un compte développeur Chrome Web Store, soumettre le ZIP Chromium, captures d'écran, description, informations sur l'usage des données et le fonctionnement de KLIPY. Les mises à jour passent par le store.
2. **Brave** : les utilisateurs peuvent installer l'extension publiée sur le Chrome Web Store. Pas de paquet Brave séparé.
3. **Edge Add-ons** : soumettre le même ZIP Chromium dans Microsoft Partner Center (Edge Add-ons), avec ses informations de confidentialité. La revue Edge est distincte.
4. **Firefox / AMO** : soumettre le ZIP Firefox au portail Mozilla. Mozilla doit le signer pour installation permanente. Le manifeste Firefox contient un ID Gecko et déclare les recherches transmises à KLIPY. On peut utiliser la distribution non répertoriée et envoyer le XPI signé à des bêta-testeurs.

**Frais et accès vérifiés :** Chrome demande des frais d'inscription développeur uniques (voir [documentation officielle](https://developer.chrome.com/docs/webstore/register)). Edge Add-ons ne facture pas l'inscription ([Microsoft](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/create-dev-account)). Brave accepte la version du Chrome Web Store sans compte Brave supplémentaire ([Brave](https://brave.com/learn/using-chrome-extensions-in-brave/)). La signature des versions Firefox se fait via [Mozilla AMO](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/).

Une soumission ne garantit pas l'acceptation par les stores. Le nom de dépôt local `GIFRIFT` et les marqueurs historiques `[gifrift:k:ID]` restent inchangés pour la compatibilité technique.

## À préparer pour le formulaire de chaque store

- Nom public : **LoopTV (LTV)**, version 0.7.0.
- Description : « Affiche des GIFs animés KLIPY dans le chat Twitch ; les spectateurs équipés voient les animations, les autres voient un marqueur texte. »
- Icônes d'extension dans `icons/`, captures d'écran réelles de l'interface Twitch (non encore préparées).
- Notice [PRIVACY.md](PRIVACY.md), hébergée sur une URL publique stable au moment de la soumission. Le dépôt GitHub est actuellement privé.
- Déclarer exactement les permissions, la transmission des termes de recherche à KLIPY, le chargement des médias depuis son CDN et l'absence de suivi/compte LoopTV.
- La modération synchronisée par chaîne et le blocage partagé des GIFs ne sont **pas encore implémentés**. Ne pas les annoncer.

## Quota KLIPY et coût

Le mode test accepte **100 requêtes API par heure pour toute la clé**. Une recherche, une page suivante et une résolution d'ID consomment chacune des appels. Quand dix personnes reçoivent le même ID, cela peut produire plusieurs résolutions séparées : le cache actuel déduplique seulement les appels simultanés dans un même navigateur.

L'utilisateur accepte cette limite pour une petite bêta. Pas de proxy, pas de clé individuelle et pas de demande Production nécessaire pour faire tester la version actuelle. Si l'audience dépasse régulièrement le quota, consulter le [Partner Panel](https://klipy.com/developers) pour les conditions de Production. Ne pas présumer que les droits Production sont gratuits.

## Crédits

Concept et validation : Shinra Tensei. Assistance au développement et préparation multi-navigateurs : [Chat On Steroids](https://github.com/totec448-spec/chat-on-steroids). L'entrée automatique « Contributors » sur GitHub dépend des auteurs Git des commits, pas des liens de crédit.
