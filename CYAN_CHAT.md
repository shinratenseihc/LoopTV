# LoopTV dans Cyan Chat / TransparentTwitchChat (prototype)

Ce prototype concerne **LoopTV 0.8.0 sur la branche `feat/free-name-paints`**. La release publique v0.7.0 ne comprend pas encore l'intégration.

## Protocole de messages

- Nouveau marqueur émis : **`[ltv:k:12345678]`**.
- Ancien marqueur accepté : `[gifrift:k:12345678]`.
- L'extension ne remplace que les messages Cyan Chat v2 dont le corps correspond **exactement** à un des deux marqueurs.
- Les messages ordinaires et les éléments de l'interface ne sont pas modifiés.
- Au plus **6 GIFs simultanés** sont affichés ; l'image est chargée depuis `static.klipy.com` après validation du résultat via le service worker LoopTV.
- Les noms de chaîne, messages et pseudos ne sont jamais transmis à l'API KLIPY par cette fonction : seuls des IDs numériques GIF.

## Fonctionnement avec TransparentTwitchChat (application Windows)

TransparentTwitchChat affiche `https://chat.johnnycyan.com/v2/` dans un **WebView2**. Les extensions chargées dans Chrome ou Brave ne se retrouvent **pas automatiquement** dans WebView2.

L'API WebView2 prend en charge les extensions Chromium via `AreBrowserExtensionsEnabled = true` et `Profile.AddBrowserExtensionAsync(...)`. Nous avons préparé un fork local du client TTC pour permettre ce chargement sur activation explicite. La version de TransparentTwitchChat actuellement installée n'est **pas** modifiée.

1. Compiler et lancer une version du fork `F:\AI Projects\TTC-LoopTV-Integration` avec .NET SDK 8 (pas encore installé dans l'environnement testé).
2. Configurer le fichier `%APPDATA%\TransparentTwitchChatWPF\looptv-extension-path.txt` avec **le chemin complet du dossier `dist\chromium`** contenant le manifeste et la configuration KLIPY distribuée localement.
3. Redémarrer le fork de TransparentTwitchChat. La prise en charge WebView2 est facultative et ne modifie pas les paramètres de chat. Le chargement est limité à l'extension LoopTV et son manifeste restreint l'injection à Twitch/Cyan Chat.
4. Conserver le mode URL personnalisée avec les mêmes paramètres Cyan Chat, dont `channel`, `size`, `fade` et `hide_paints`.

**Le prototype WPF n'a pas été compilé ni testé dans le WebView2 de l'application utilisateur.** Il ne faut pas prétendre que le simple rechargement de l'extension Chrome suffira.

## Tests

- `npm test` : contrôles du manifeste, des marqueurs, des URLs GIF et des permissions.
- `python test/cyan-check.py` : structure DOM de Cyan Chat, conversion des deux types de marqueurs, messages normaux intacts, maximum de 6 GIFs.
- `python test/twitch-check.py` : vérification Twitch classique et insertion du nouveau marqueur.
- `npm run build` et `python test/chromium-check.py` : archive Chromium et service worker.

Les scripts sont locaux à l'extension et exécutés en contexte isolé ; aucun JavaScript n'est téléchargé à la volée depuis un serveur LoopTV.
