/** Polish text of the `auto_download` HUD element. */

import type en from './en';

export default {
  'autoDownload.title': 'Pobieranie danych gry',
  'autoDownload.done': 'Dane gry pobrane',
  'autoDownload.cancel': 'Anuluj',
  'autoDownload.hide': 'Ukryj (pobieranie trwa)',
  'autoDownload.phase.map': 'Wczytywanie mapy: {name}',
  'autoDownload.phase.icons': 'Wczytywanie przedmiotów',
  'autoDownload.phase.audio': 'Wczytywanie muzyki i dźwięków',
  'autoDownload.phase.monsters': 'Wczytywanie postaci i stworzeń',
  'autoDownload.phase.core': 'Wczytywanie interfejsu i efektów',
  'autoDownload.left': 'Zostało {left} MB',
  'autoDownload.received': 'Pobrano {got} MB z {total} MB',
  'autoDownload.screenTitle': 'Przygotowanie twojej przygody',
  'autoDownload.screenText': 'Zapisujemy te pliki, żeby następna gra wczytała się szybciej. Tylko za pierwszym razem.',
  'autoDownload.skip': 'Wejdź mimo to',
  'autoDownload.skipNote': 'Pobieranie trwa w tle. Jeśli zamkniesz grę, wznowi się tam, gdzie się zatrzymało.',
} satisfies Partial<Record<keyof typeof en, string>>;
