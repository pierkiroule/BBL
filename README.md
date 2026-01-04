# BBL

## Déploiement sur Vercel

Ce projet est une application Vite + React et peut être déployé facilement sur Vercel.

- Commande de build : `npm run build`
- Dossier de sortie : `dist`

Pour les Single Page Apps, la configuration `vercel.json` fournie inclut une réécriture vers `index.html` afin d'assurer un fallback pour toutes les routes.

---

## Effets audio‑reactifs (nouveau)

Les outils de dessin (sauf la gomme) disposent désormais d'effets **harmonieux** qui réagissent à l'audio en entrée (WebAudio analyser).

- Outils concernés : `pencil`, `brush`, `watercolor`, `ink`, `particle-fill`, `emoji-stamp`, `text`, `image-stamp`.
- Contrôles UI : panneau **Ambiance** → charger un fichier audio, activer la démo audio, bouton Lecture/Pause et réglage **Sensibilité**.
- Comportements : variations subtiles de taille, jitter, ombre, rotation, opacité selon les bandes **bass / mid / treble** (sensibilité ajustable).

Comment tester :
1. Lancer l'app en dev (`npm run dev -- --host`).
2. Ouvrir le panneau *Ambiance*, charger un audio ou activer la démo.
3. Cliquer sur *Lecture* et tester différents outils.

---
