# Confidentialité de LoopTV (LTV)

*Version expérimentale 0.8.0, 5 novembre 2026.*

LoopTV est une extension indépendante qui ajoute des GIFs animés dans le chat Twitch et, en version expérimentale, dans l'interface Cyan Chat v2.

**Données traitées par LoopTV :** les réglages d'activation et d'animation sont enregistrés **localement dans le navigateur**. LoopTV n'a pas de compte utilisateur, de serveur propre, de publicité ou de télémétrie. L'extension n'envoie pas les messages Twitch, noms d'utilisateur ou historiques de discussion vers un serveur LoopTV.

**Name Paints :** les pseudos et couleurs Twitch déjà visibles dans le chat servent localement à calculer les dégradés. Aucun pseudo n'est envoyé à un nouveau serveur. Si vous choisissez un dégradé pour un pseudo via la popup, **ce pseudo et la palette sélectionnée sont enregistrés dans le stockage local du navigateur**, avec vos réglages d'activation et d'animation. Rien n'est synchronisé entre utilisateurs par LoopTV.

**Service tiers KLIPY :** lorsque vous ouvrez la recherche, les mots recherchés et la pagination sont envoyés à `api.klipy.com`. Lorsque LoopTV détecte un marqueur GIF dans le chat, son identifiant est envoyé à KLIPY pour récupérer l'animation. Les images sont chargées depuis `static.klipy.com`. KLIPY et ses infrastructures peuvent traiter les données techniques de connexion, notamment l'adresse IP, selon leur politique : [confidentialité KLIPY](https://klipy.com/support/privacy-policy).

**Cyan Chat / WebView2 :** le script expérimental inspecte localement les éléments de messages sur `chat.johnnycyan.com/v2/` afin de repérer les marqueurs LoopTV ; seuls les **identifiants numériques des GIFs** sont envoyés à KLIPY. Les autres contenus et les pseudos ne sont pas transmis par LoopTV. L'application TransparentTwitchChat et le site Cyan Chat conservent leurs propres politiques de traitement des données.

**Twitch :** les GIFs sont représentés par des marqueurs texte dans le chat Twitch. Twitch reçoit ces messages lorsqu'un utilisateur les envoie volontairement. LoopTV ne contourne pas les règles de modération du chat.

**Choix utilisateur :** vous pouvez désactiver l'affichage des animations depuis la popup de l'extension, ou la désinstaller. Aucune création de compte LoopTV n'est nécessaire.

**Indépendance :** LoopTV n'est pas affilié à Twitch ou KLIPY. « Powered by KLIPY » identifie le fournisseur des GIFs.
