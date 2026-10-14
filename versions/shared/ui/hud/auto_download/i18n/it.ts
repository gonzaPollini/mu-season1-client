/** Italian text of the `auto_download` HUD element. */

import type en from './en';

export default {
  'autoDownload.title': 'Download dei dati di gioco',
  'autoDownload.done': 'Dati di gioco scaricati',
  'autoDownload.cancel': 'Annulla',
  'autoDownload.hide': 'Nascondi (il download continua)',
  'autoDownload.phase.map': 'Caricamento mappa: {name}',
  'autoDownload.phase.icons': 'Caricamento oggetti',
  'autoDownload.phase.audio': 'Caricamento musica e suoni',
  'autoDownload.phase.monsters': 'Caricamento personaggi e creature',
  'autoDownload.phase.core': 'Caricamento interfaccia ed effetti',
  'autoDownload.left': '{left} MB rimanenti',
  'autoDownload.received': '{got} MB scaricati su {total} MB',
  'autoDownload.screenTitle': 'Preparazione della tua avventura',
  'autoDownload.screenText': 'Conserviamo questi file perché la prossima partita carichi più in fretta. Solo la prima volta.',
  'autoDownload.skip': 'Entra comunque',
  'autoDownload.skipNote': 'Il download continua in background. Se chiudi il gioco, riprende da dove si era fermato.',
} satisfies Partial<Record<keyof typeof en, string>>;
