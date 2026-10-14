/** Portuguese text of the `auto_download` HUD element. */

import type en from './en';

export default {
  'autoDownload.title': 'Baixando dados do jogo',
  'autoDownload.done': 'Dados do jogo baixados',
  'autoDownload.cancel': 'Cancelar',
  'autoDownload.hide': 'Ocultar (continua baixando)',
  'autoDownload.phase.map': 'Carregando mapa: {name}',
  'autoDownload.phase.icons': 'Carregando itens',
  'autoDownload.phase.audio': 'Carregando música e sons',
  'autoDownload.phase.monsters': 'Carregando personagens e criaturas',
  'autoDownload.phase.core': 'Carregando interface e efeitos',
  'autoDownload.left': 'Faltam {left} MB',
  'autoDownload.received': '{got} MB baixados de {total} MB',
  'autoDownload.screenTitle': 'Preparando sua aventura',
  'autoDownload.screenText': 'Guardamos estes arquivos para que a próxima partida carregue mais rápido. Só na primeira vez.',
  'autoDownload.skip': 'Entrar assim mesmo',
  'autoDownload.skipNote': 'O download continua em segundo plano. Se você fechar o jogo, ele continua de onde parou.',
} satisfies Partial<Record<keyof typeof en, string>>;
