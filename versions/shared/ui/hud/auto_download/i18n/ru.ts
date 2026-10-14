/** Russian text of the `auto_download` HUD element. */

import type en from './en';

export default {
  'autoDownload.title': 'Загрузка данных игры',
  'autoDownload.done': 'Данные игры загружены',
  'autoDownload.cancel': 'Отмена',
  'autoDownload.hide': 'Скрыть (загрузка продолжится)',
  'autoDownload.phase.map': 'Загрузка карты: {name}',
  'autoDownload.phase.icons': 'Загрузка предметов',
  'autoDownload.phase.audio': 'Загрузка музыки и звуков',
  'autoDownload.phase.monsters': 'Загрузка персонажей и существ',
  'autoDownload.phase.core': 'Загрузка интерфейса и эффектов',
  'autoDownload.left': 'Осталось {left} МБ',
  'autoDownload.received': 'Загружено {got} МБ из {total} МБ',
  'autoDownload.screenTitle': 'Подготовка к приключению',
  'autoDownload.screenText': 'Мы сохраняем эти файлы, чтобы следующая игра загружалась быстрее. Только в первый раз.',
  'autoDownload.skip': 'Всё равно войти',
  'autoDownload.skipNote': 'Загрузка продолжается в фоне. Если закрыть игру, она продолжится с того же места.',
} satisfies Partial<Record<keyof typeof en, string>>;
