# Confidentialité de LoopTV (LTV)

*Version expérimentale 0.8.0, 5 novembre 2026.*

LoopTV est une extension indépendante qui ajoute des GIFs animés dans le chat Twitch.

**Données traitées par LoopTV :** les réglages d'activation et d'animation sont enregistrés **localement dans le navigateur**. LoopTV n'a pas de compte utilisateur, de serveur propre, de publicité ou de télémétrie. L'extension n'envoie pas les messages Twitch, noms d'utilisateur ou historiques de discussion vers un serveur LoopTV.

**Name Paints :** les pseudos Twitch déjà visibles dans le chat sont utilisés localement pour calculer un dégradé déterministe. Ils ne sont envoyés à aucun serveur supplémentaire et ne sont pas enregistrés. Le champ d'aperçu de la popup ne sauvegarde pas le texte saisi. Seuls les réglages d'activation et d'animation des Name Paints sont conservés localement.

**Service tiers KLIPY :** lorsque vous ouvrez la recherche, les mots recherchés et la pagination sont envoyés à `api.klipy.com`. Lorsque LoopTV détecte un marqueur GIF dans le chat, son identifiant est envoyé à KLIPY pour récupérer l'animation. Les images sont chargées depuis `static.klipy.com`. KLIPY et ses infrastructures peuvent traiter les données techniques de connexion, notamment l'adresse IP, selon leur politique : [confidentialité KLIPY](https://klipy.com/support/privacy-policy).

**Twitch :** les GIFs sont représentés par des marqueurs texte dans le chat Twitch. Twitch reçoit ces messages lorsqu'un utilisateur les envoie volontairement. LoopTV ne contourne pas les règles de modération du chat.

**Choix utilisateur :** vous pouvez désactiver l'affichage des animations depuis la popup de l'extension, ou la désinstaller. Aucune création de compte LoopTV n'est nécessaire.

**Indépendance :** LoopTV n'est pas affilié à Twitch ou KLIPY. « Powered by KLIPY » identifie le fournisseur des GIFs.
