# LoopTV 1.0.0 — sortie GitHub

**Because basic features shouldn't be locked behind a paywall.**

La première version majeure de LoopTV apporte des GIFs animés KLIPY dans le chat de **toutes les chaînes Twitch**, plus **48 Name Paints originaux gratuits et animés** avec choix local et mode Auto. Aucun compte LoopTV, abonnement, publicité ou télémétrie propriétaire.

## Nouveautés

- Nouveaux marqueurs GIF `[ltv:k:ID]`, avec lecture conservée des anciens `[gifrift:k:ID]`.
- Recherche GIF intégrée, sélection dans le champ Twitch et **envoi manuel uniquement**.
- 48 styles pour les pseudos, recherche dans la galerie, couleurs Twitch automatiques, interrupteurs séparés pour les animations.
- Renforcement des validations des URL et du routage des messages, clarification de la confidentialité et des données envoyées à KLIPY.
- Paquets Windows/Chromium et Firefox construits séparément, identifiant Firefox stable `looptv@shinratenseihc`.

## Limites importantes

- **Firefox : le ZIP GitHub n'est pas une extension signée par Mozilla.** Pour l'installer définitivement et recevoir les mises à jour automatiques, attendre la publication de LoopTV sur le site officiel Mozilla Add-ons.
- La clé KLIPY actuelle est une **clé de test de 100 requêtes par heure partagées entre tous les utilisateurs**. Les fonctionnalités GIF peuvent être temporairement limitées. Une clé Production doit être demandée à KLIPY avant une large promotion.
- Les utilisateurs LoopTV 0.7.0 voient les nouveaux marqueurs `[ltv:k:ID]` comme du texte. Passer à la 1.0 pour lire les deux formats.
- Le choix manuel d'un Name Paint n'est visible que sur son navigateur ; pas de synchronisation entre spectateurs. La modération globale des GIFs n'est pas encore disponible.

Consulter [INSTALL.md](INSTALL.md) et [PRIVACY.md](PRIVACY.md).
