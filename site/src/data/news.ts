import type { Key } from '../i18n';

/** Noticias de ejemplo. El texto vive en `i18n/*.ts` (claves `news.<id>.title|body`). */
export type NewsItem = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  tag: Key;
  title: Key;
  body: Key;
};

export const NEWS: NewsItem[] = [
  { id: 'n1', date: '2026-10-16', tag: 'news.tag.announcement', title: 'news.n1.title', body: 'news.n1.body' },
  { id: 'n2', date: '2026-10-15', tag: 'news.tag.event', title: 'news.n2.title', body: 'news.n2.body' },
  { id: 'n3', date: '2026-10-14', tag: 'news.tag.update', title: 'news.n3.title', body: 'news.n3.body' },
];
