# GIFRIFT v0.6.0

Extension Chrome/Chromium pour choisir de vrais GIFs et les partager dans le chat Twitch. Pas de compte GIFRIFT, pas d'API de recherche, pas de clé utilisateur, aucune dépendance npm.

## Utilisation

1. Actualiser GIFRIFT dans `chrome://extensions`, accepter si Chrome demande l'accès au site GIPHY, puis recharger l'onglet Twitch.
2. Cliquer sur **GIF** dans le chat Twitch. Une **petite fenêtre GIPHY** s'ouvre, déjà sur une page de recherche.
3. Faire sa recherche dans GIPHY et **cliquer sur un GIF**. GIFRIFT transfère son identifiant dans le champ du chat Twitch et ferme la fenêtre de recherche.
4. Appuyer sur **Entrée** dans Twitch pour envoyer le marqueur. Il est remplacé par l'animation chez les spectateurs équipés.

Le marqueur ressemble à `[gifrift:g:cZ7rmKfFYOvYI]`. Un spectateur sans GIFRIFT voit simplement ce texte. Les GIFs restent hébergés chez GIPHY.

### Pourquoi une fenêtre séparée ?

GIPHY refuse l'affichage de son site dans une iframe (en-tête HTTP `X-Frame-Options: DENY`). GIFRIFT ouvre donc une vraie fenêtre Chrome compacte, sans recopier ni aspirer leur catalogue. L'extension détecte un clic sur un résultat `giphy.com/gifs/...` uniquement dans la fenêtre qu'elle a ouverte et prépare le message dans **l'onglet Twitch d'origine**. Les visites ordinaires sur GIPHY ne sont pas modifiées.

Si l'ouverture de la fenêtre échoue, l'ancien mini-formulaire permet encore de **coller manuellement un lien GIPHY**. Aucun message n'est envoyé automatiquement.

## Sécurité, confidentialité et limites

- Permissions limitées à `storage` et aux scripts des pages Twitch/GIPHY. Pas de permissions générales sur tous les sites, pas de requêtes API GIPHY et pas de code distant exécuté.
- Fenêtre de recherche identifiée par son ID Chrome dans le stockage temporaire de l'extension. Seule cette fenêtre peut transmettre un identifiant GIF à l'onglet Twitch qui l'a ouverte.
- Identifiant GIF vérifié avant transfert ; l'extension construit une URL de média à partir de caractères autorisés, jamais depuis une URL arbitraire.
- Affichage de six animations au maximum, chargement différé, contrôle local et respect de la réduction des animations Windows.
- GIPHY héberge les médias et peut observer les requêtes envoyées à ses serveurs. GIFRIFT ne collecte pas les conversations, n'ajoute pas de publicité et n'envoie aucune télémétrie.
- GIFRIFT dépend encore de la disponibilité de la recherche publique GIPHY et de ses liens. La modération synchronisée et le blocage de GIFs par chaîne ne sont pas encore implémentés : ne pas distribuer publiquement comme version finie.

## Tests locaux

- `node --test` : transmission au bon onglet, validation des identifiants, rejet d'une autre fenêtre GIPHY.
- `python test/twitch-check.py` : insertion dans Slate, Entrée, suppression, 100 messages, six GIFs maximum, animation réduite, repli par lien.
- `python test/giphy-check.py` : clic sur une carte de recherche simulée, interception de navigation et transfert de l'identifiant.
- `python test/browser-check.py` : tests de régression du prototype local et des préférences.

Le 5 novembre 2026, les liens `/gifs/...` ont été vérifiés sur la vraie page de recherche GIPHY (HTML public) et son refus d'iframe a été confirmé en HTTP. Les tests de la logique d'extension et de Chrome passent ; le clic sur le site GIPHY réel avec la nouvelle extension chargée reste à confirmer manuellement.
