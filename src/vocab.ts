// Từ vựng từ bộ thẻ Anki: mỗi từ có hai thẻ ôn tập.
//   Thẻ nhận diện (mã "r" + mã từ): thấy hình và từ tiếng Anh, nhớ ra nghĩa, tự chấm.
//   Thẻ tự viết (mã từ): thấy nghĩa, gõ lại từ tiếng Anh. Chỉ mở khi thẻ nhận diện đã nhớ được vài ngày.
import { State } from 'ts-fsrs'
import { NOTE, allNotes, type Note } from './decks'
import { LEECH, getState, type Rec } from './store'

export interface Vocab { id: string; word: string; vi: string; ex: string; forms: string[]; deck: string; img?: string; audio?: string }

export const recId = (id: string) => 'r' + id
export const baseId = (id: string) => (id.startsWith('ra:') ? id.slice(1) : id)
export const isRecId = (id: string) => id.startsWith('ra:')
/** Thẻ nhận diện cần đạt độ bền (ngày) này thì mới mở thẻ tự viết. */
export const PROMOTE_STABILITY = 2

/** Cú pháp đục lỗ của Anki: {{c1::từ}} hoặc {{c1::từ::gợi ý}}. */
const CLOZE = /\{\{c\d+::(.*?)(?:::.*?)?\}\}/g
const escapeRe = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Mọi chỗ từ cần học xuất hiện trong câu ví dụ (kể cả dạng thêm -s, -ed, -ing và phần đục lỗ sẵn của Anki)
 * được đánh dấu {…} để che đi khi kiểm tra.
 */
export function vocab(id: string): Vocab | undefined {
  const n = NOTE.get(baseId(id))
  if (!n) return undefined
  return fromNote(n)
}
export function fromNote(n: Note): Vocab {
  const word = n.word.replace(CLOZE, '$1').trim()
  const forms = new Set([word.toLowerCase()])
  const text = n.example.replace(CLOZE, (_, inner: string) => { forms.add(inner.trim().toLowerCase()); return inner })
  const alt = [...forms].filter(Boolean).sort((x, y) => y.length - x.length).map(escapeRe).join('|')
  const ex = alt ? text.replace(new RegExp(`\\b((?:${alt})(?:s|es|ed|d|ing)?)\\b`, 'gi'), '{$1}') : text
  return { id: n.id, word, vi: n.meaning.replace(CLOZE, '$1'), ex, forms: [...forms], deck: n.deck, img: n.img, audio: n.audio }
}

export type WordStatus = 'new' | 'learning' | 'known' | 'leech'
export const STATUS_NAME: Record<WordStatus, string> = { new: 'Chưa học', learning: 'Đang học', known: 'Đã thuộc', leech: 'Từ khó' }
/** Đã thuộc: thẻ tự viết nhớ được từ 21 ngày trở lên. Từ khó: quên từ LEECH lần trở lên ở một trong hai thẻ. */
export function wordStatus(id: string, cards = getState().cards): WordStatus {
  const p: Rec | undefined = cards[id], r: Rec | undefined = cards[recId(id)]
  if (!p && !r) return 'new'
  if (Math.max(p?.c.lapses ?? 0, r?.c.lapses ?? 0) >= LEECH) return 'leech'
  if (p && p.c.state === State.Review && p.c.stability >= 21) return 'known'
  return 'learning'
}
export const isLeech = (id: string) => wordStatus(baseId(id)) === 'leech'
export const leechCount = () => allNotes().filter((n) => wordStatus(n.id) === 'leech').length

/** Thẻ nhận diện đã đủ vững để mở thẻ tự viết. */
export function readyToPromote(id: string, cards = getState().cards): boolean {
  const r = cards[recId(id)]
  return !cards[id] && !!r && r.c.state === State.Review && r.c.stability >= PROMOTE_STABILITY
}

/** Gợi ý từng bước: 1 = chữ đầu, 2 = thêm chữ cuối, 3 = thêm một nửa số chữ. */
export function hintText(w: string, n: number): string {
  const last = w.length - 1
  return [...w].map((ch, i) => (!/[a-z]/i.test(ch) || i === 0 || (n >= 2 && i === last) || (n >= 3 && i % 2 === 0) ? ch : '_')).join(' ')
}
