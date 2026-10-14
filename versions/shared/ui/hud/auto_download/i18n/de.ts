/** German text of the `auto_download` HUD element. */

import type en from './en';

export default {
  'autoDownload.title': 'Spieldaten werden heruntergeladen',
  'autoDownload.done': 'Spieldaten heruntergeladen',
  'autoDownload.cancel': 'Abbrechen',
  'autoDownload.hide': 'Ausblenden (lädt weiter)',
  'autoDownload.phase.map': 'Lade Karte: {name}',
  'autoDownload.phase.icons': 'Lade Gegenstände',
  'autoDownload.phase.audio': 'Lade Musik und Sounds',
  'autoDownload.phase.monsters': 'Lade Figuren und Kreaturen',
  'autoDownload.phase.core': 'Lade Oberfläche und Effekte',
  'autoDownload.left': 'Noch {left} MB',
  'autoDownload.received': '{got} MB von {total} MB heruntergeladen',
  'autoDownload.screenTitle': 'Dein Abenteuer wird vorbereitet',
  'autoDownload.screenText': 'Wir speichern diese Dateien, damit dein nächstes Spiel schneller lädt. Nur beim ersten Mal.',
  'autoDownload.skip': 'Trotzdem betreten',
  'autoDownload.skipNote': 'Der Download läuft im Hintergrund weiter. Wenn du das Spiel schließt, geht er dort weiter, wo er aufgehört hat.',
} satisfies Partial<Record<keyof typeof en, string>>;
