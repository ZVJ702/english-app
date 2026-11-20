// Những phép tính nhỏ trang chủ cần ngay khi mở app: đếm thẻ đến hạn, lỗi sai gần đây, chủ đề ngữ pháp yếu.
// Dữ liệu ngữ pháp (lớn) được tải riêng ngay sau khi trang chủ hiện ra, nên app mở nhanh hơn.
import { useSyncExternalStore } from 'react'
import { State } from 'ts-fsrs'
import type { Exercise, Topic } from './data/grammar'
import { mediaUrl, NOTE } from './decks'
import { dueTime, getState } from './store'
import { speak } from './util'
import { baseId, type Vocab } from './vocab'

// ---------- Dữ liệu ngữ pháp tải sau ----------
export interface GrammarData { topics: Topic[]; ex: Map<string, Exercise>; topic: Map<string, Topic>; total: number }
let G: GrammarData | null = null
const subs = new Set<() => void>()
export const grammarReady: Promise<GrammarData> = import('./data/grammar').then(({ GRAMMAR }) => {
  const all = GRAMMAR.flatMap((t) => t.exercises)
  G = { topics: GRAMMAR, ex: new Map(all.map((e) => [e.id, e])), topic: new Map(GRAMMAR.map((t) => [t.id, t])), total: all.length }
  subs.forEach((f) => f())
  return G
})
export const grammar = () => G
/** Dữ liệu ngữ pháp, hoặc null trong tích tắc khi đang tải. */
export function useGrammar(): GrammarData | null {
  return useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f) }, grammar)
}

// ---------- Đếm thẻ ----------
/** Mỗi phiên chỉ học một loại nội dung: từ vựng hoặc ngữ pháp. */
export type Mode = 'vocab' | 'grammar'
export const MODE_NAME: Record<Mode, [string, string]> = { vocab: ['Từ vựng', 'Vocabulary'], grammar: ['Ngữ pháp', 'Grammar'] }
export const modeOf = (id: string): Mode => (id.startsWith('g:') ? 'grammar' : 'vocab')
/** Số thẻ đến hạn tối đa được ôn trong một phiên, để phiên không bị quá dài sau nhiều ngày nghỉ. */
export const REVIEW_CAP: Record<number, number> = { 5: 25, 15: 70, 30: 150 }
/** Khi số thẻ từ vựng tồn vượt mức này, tạm dừng từ mới cho đến khi ôn bớt. */
export const backlogLimit = () => Math.max(40, getState().dailyNew * 4)
/** Thẻ còn nội dung tương ứng (bộ từ chưa bị xóa, bài tập vẫn còn). */
export const known = (id: string) => (id.startsWith('g:') ? !G || G.ex.has(id) : NOTE.has(baseId(id)))

export function countDue(mode?: Mode): number {
  const now = Date.now()
  return Object.entries(getState().cards).filter(([id, r]) => known(id) && (!mode || modeOf(id) === mode) && dueTime(r) <= now).length
}

export async function say(v: Vocab) {
  const url = v.audio ? await mediaUrl(v.deck, v.audio) : null
  if (url) new Audio(url).play().catch(() => speak(v.word))
  else speak(v.word)
}

// ---------- Lỗi sai gần đây ----------
export const MISS_DAYS = 7
/** Các thẻ trả lời sai trong 7 ngày qua mà chưa luyện lại đúng (kể cả thẻ đang học lại vì quên). */
export function recentMisses(): string[] {
  const s = getState()
  const since = Date.now() - MISS_DAYS * 86_400_000
  const out = new Map<string, number>()
  for (const [id, m] of Object.entries(s.miss)) if (!m.fixed && m.t >= since && known(id)) out.set(id, m.t)
  // Thẻ đang "học lại" vì vừa quên cũng tính là lỗi sai (kể cả những lần sai trước khi có tính năng này).
  for (const [id, r] of Object.entries(s.cards)) {
    const t = r.c.last_review ? new Date(r.c.last_review).getTime() : 0
    if (r.c.state === State.Relearning && t >= since && !s.miss[id] && known(id)) out.set(id, t)
  }
  return [...out].sort((a, b) => b[1] - a[1]).map(([id]) => id)
}

// ---------- Chủ đề ngữ pháp yếu ----------
export interface Weak { topic: Topic; seen: number; rate: number; ids: string[] }
/** Số lần sai ước tính của một thẻ: lấy từ nhật ký lỗi, số lần quên, hoặc độ khó FSRS cao (sai ngay lần đầu). */
function wrongCount(id: string): number {
  const s = getState(), c = s.cards[id]?.c
  if (!c) return 0
  return Math.max(s.miss[id]?.n ?? 0, c.lapses, c.difficulty >= 6.8 ? 1 : 0)
}
/** 1–2 chủ đề đã học có tỷ lệ sai cao nhất (từ 20% trở lên, ít nhất 4 bài đã làm). */
export function weakTopics(g: GrammarData, max = 2): Weak[] {
  const s = getState()
  const out: Weak[] = []
  for (const t of g.topics) {
    const seen = t.exercises.filter((e) => s.cards[e.id])
    if (seen.length < 4) continue
    const wrong = seen.reduce((a, e) => a + wrongCount(e.id), 0)
    const reps = seen.reduce((a, e) => a + Math.max(1, s.cards[e.id].c.reps), 0)
    const rate = wrong / reps
    if (wrong >= 2 && rate >= 0.2) {
      const ids = seen.map((e) => e.id).sort((a, b) => wrongCount(b) - wrongCount(a)).slice(0, 10)
      out.push({ topic: t, seen: seen.length, rate, ids })
    }
  }
  return out.sort((a, b) => b.rate - a.rate).slice(0, max)
}
