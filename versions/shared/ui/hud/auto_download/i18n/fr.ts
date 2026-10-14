/** French text of the `auto_download` HUD element. */

import type en from './en';

export default {
  'autoDownload.title': 'Téléchargement des données du jeu',
  'autoDownload.done': 'Données du jeu téléchargées',
  'autoDownload.cancel': 'Annuler',
  'autoDownload.hide': 'Masquer (le téléchargement continue)',
  'autoDownload.phase.map': 'Chargement de la carte : {name}',
  'autoDownload.phase.icons': 'Chargement des objets',
  'autoDownload.phase.audio': 'Chargement de la musique et des sons',
  'autoDownload.phase.monsters': 'Chargement des personnages et créatures',
  'autoDownload.phase.core': 'Chargement de l\'interface et des effets',
  'autoDownload.left': '{left} Mo restants',
  'autoDownload.received': '{got} Mo téléchargés sur {total} Mo',
  'autoDownload.screenTitle': 'Préparation de ton aventure',
  'autoDownload.screenText': 'Nous gardons ces fichiers pour que ta prochaine partie charge plus vite. Seulement la première fois.',
  'autoDownload.skip': 'Entrer quand même',
  'autoDownload.skipNote': 'Le téléchargement continue en arrière-plan. Si tu fermes le jeu, il reprend là où il s\'est arrêté.',
} satisfies Partial<Record<keyof typeof en, string>>;
