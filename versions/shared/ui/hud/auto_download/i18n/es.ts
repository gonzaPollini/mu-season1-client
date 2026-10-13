/** Spanish text of the `auto_download` HUD element. */

import type en from './en';

export default {
  'autoDownload.title': 'Descargando datos del juego',
  'autoDownload.done': 'Datos del juego descargados',
  'autoDownload.cancel': 'Cancelar',
  'autoDownload.hide': 'Ocultar (sigue descargando)',
  'autoDownload.phase.map': 'Cargando mapa: {name}',
  'autoDownload.phase.icons': 'Cargando ítems',
  'autoDownload.phase.audio': 'Cargando música y sonidos',
  'autoDownload.phase.monsters': 'Cargando personajes y criaturas',
  'autoDownload.phase.core': 'Cargando interfaz y efectos',
  'autoDownload.left': 'Faltan {left} MB',
  'autoDownload.received': '{got} MB descargados de {total} MB',
  'autoDownload.screenTitle': 'Preparando tu aventura',
  'autoDownload.screenText': 'Guardamos estos recursos para que la próxima partida cargue más rápido. Solo la primera vez.',
  'autoDownload.skip': 'Entrar igual',
  'autoDownload.skipNote': 'La descarga sigue en segundo plano. Si cerrás el juego, continúa desde donde quedó.',
} satisfies Partial<Record<keyof typeof en, string>>;
