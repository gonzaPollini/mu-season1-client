/** Japanese text of the `auto_download` HUD element. */

import type en from './en';

export default {
  'autoDownload.title': 'ゲームデータをダウンロード中',
  'autoDownload.done': 'ゲームデータのダウンロード完了',
  'autoDownload.cancel': 'キャンセル',
  'autoDownload.hide': '隠す（ダウンロードは継続）',
  'autoDownload.phase.map': 'マップを読み込み中: {name}',
  'autoDownload.phase.icons': 'アイテムを読み込み中',
  'autoDownload.phase.audio': '音楽とサウンドを読み込み中',
  'autoDownload.phase.monsters': 'キャラクターとモンスターを読み込み中',
  'autoDownload.phase.core': 'インターフェースとエフェクトを読み込み中',
  'autoDownload.left': '残り {left} MB',
  'autoDownload.received': '{total} MB 中 {got} MB をダウンロード',
  'autoDownload.screenTitle': '冒険の準備中',
  'autoDownload.screenText': '次回からの読み込みを速くするためにファイルを保存します。初回のみです。',
  'autoDownload.skip': 'そのまま入る',
  'autoDownload.skipNote': 'ダウンロードはバックグラウンドで続きます。ゲームを閉じても、途中から再開します。',
} satisfies Partial<Record<keyof typeof en, string>>;
