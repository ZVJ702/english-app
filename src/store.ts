import { useSyncExternalStore } from 'react'
import { createEmptyCard, fsrs, Rating, type Card, type Grade } from 'ts-fsrs'
import type { Level } from './data/vocab'

export interface Rec { c: Card; u: number }
export interface Shared {
  level: Level | null
  levelU: number
  cards: Record<string, Rec>
  essays: Record<string, { text: string; u: number }>
  days: Record<string, number>
  /** Số từ mới đã học theo từng ngày. */
  newWords: Record<string, number>
  /** Số từ mới tối đa mỗi ngày do người học chọn. */
  dailyNew: number
  dailyNewU: number
  /** Mẹo nhớ người học tự viết, theo mã thẻ từ vựng. */
  memo: Record<string, { text: string; u: number }>
  /** Mức ghi nhớ mục tiêu của FSRS (0.85 – 0.95). */
  retention: number
  retentionU: number
  /** Số lượt trả lời đúng theo từng ngày (để tính tỷ lệ nhớ). */
  daysOk: Record<string, number>
}
export interface State extends Shared {
  sync: { url: string; code: string; last: number }
}

const KEY = 'english-app-v1'
const DEFAULT_SYNC_URL: string = import.meta.env.VITE_SYNC_URL ?? ''
const empty = (): State => ({
  level: null, levelU: 0, cards: {}, essays: {}, days: {}, newWords: {}, dailyNew: 10, dailyNewU: 0,
  memo: {}, retention: 0.9, retentionU: 0, daysOk: {},
  sync: { url: DEFAULT_SYNC_URL, code: '', last: 0 },
})

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...empty(), ...JSON.parse(raw) }
  } catch { /* dữ liệu hỏng hoặc không đọc được: bắt đầu mới */ }
  return empty()
}

let state = load()
const subs = new Set<() => void>()
export function getState() { return state }
export function setState(next: State) {
  state = next
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* hết dung lượng */ }
  subs.forEach((f) => f())
}
export function useStore(): State {
  return useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f) }, getState)
}

export const today = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// ---------- Lặp lại ngắt quãng (FSRS) ----------
const schedulers = new Map<number, ReturnType<typeof fsrs>>()
function scheduler() {
  const r = state.retention || 0.9
  let f = schedulers.get(r)
  if (!f) { f = fsrs({ request_retention: r, enable_fuzz: true }); schedulers.set(r, f) }
  return f
}
/** Số lần quên (sau khi đã thuộc) để một thẻ bị coi là "từ khó". */
export const LEECH = 5

/** Chấm một thẻ và lưu lịch ôn mới. Trả về thời điểm ôn kế tiếp. count = false: không tính vào số lượt ôn trong ngày. */
export function grade(id: string, g: Grade, count = true): Date {
  const now = new Date()
  const prev = state.cards[id]?.c ?? createEmptyCard(now)
  const { card } = scheduler().next(prev, now, g)
  const d = today(now)
  setState({
    ...state,
    cards: { ...state.cards, [id]: { c: card, u: now.getTime() } },
    days: count ? { ...state.days, [d]: (state.days[d] ?? 0) + 1 } : state.days,
    daysOk: count && g > Rating.Again ? { ...state.daysOk, [d]: (state.daysOk[d] ?? 0) + 1 } : state.daysOk,
  })
  return new Date(card.due)
}
export function setMemo(id: string, text: string) {
  setState({ ...state, memo: { ...state.memo, [id]: { text: text.trim(), u: Date.now() } } })
}
export function setRetention(r: number) { setState({ ...state, retention: r, retentionU: Date.now() }) }
export const dueTime = (r: Rec) => new Date(r.c.due).getTime()

export function setDailyNew(n: number) { setState({ ...state, dailyNew: n, dailyNewU: Date.now() }) }
/** Ghi nhận một từ mới vừa được học hôm nay. */
export function addNewWord() {
  const d = today()
  setState({ ...state, newWords: { ...state.newWords, [d]: (state.newWords[d] ?? 0) + 1 } })
}
export const newWordsLeft = () => Math.max(0, state.dailyNew - (state.newWords[today()] ?? 0))

/**
 * Chuỗi ngày học. Nghỉ một ngày không làm đứt chuỗi; nghỉ hai ngày liền thì chuỗi bắt đầu lại.
 * Trả về số ngày có học trong chuỗi hiện tại và chuỗi dài nhất từ trước đến nay.
 */
export function streaks(days: Record<string, number>): { current: number; best: number } {
  const active = Object.keys(days).filter((d) => days[d] > 0).sort()
  const num = (d: string) => Math.round(new Date(d + 'T12:00:00').getTime() / 86_400_000)
  let best = 0, run = 0, prev = -10
  for (const d of active) {
    run = num(d) - prev <= 2 ? run + 1 : 1
    prev = num(d)
    best = Math.max(best, run)
  }
  const current = num(today()) - prev <= 2 ? run : 0
  return { current, best }
}

export function setLevel(level: Level) { setState({ ...state, level, levelU: Date.now() }) }
export function saveEssay(id: string, text: string) {
  setState({ ...state, essays: { ...state.essays, [id]: { text, u: Date.now() } } })
}

// ---------- Đồng bộ & sao lưu ----------
function pickShared(s: Shared): Shared {
  return {
    level: s.level, levelU: s.levelU, cards: s.cards, essays: s.essays, days: s.days, newWords: s.newWords, dailyNew: s.dailyNew, dailyNewU: s.dailyNewU,
    memo: s.memo, retention: s.retention, retentionU: s.retentionU, daysOk: s.daysOk,
  }
}
/** Gộp hai bản dữ liệu: mỗi mục lấy bản được sửa gần nhất. */
export function merge(a: Shared, b: Partial<Shared>): Shared {
  const newer = <T extends { u: number }>(x: Record<string, T>, y: Record<string, T> = {}) => {
    const out = { ...x }
    for (const [k, v] of Object.entries(y)) if (!out[k] || v.u > out[k].u) out[k] = v
    return out
  }
  const maxOf = (x: Record<string, number>, y: Record<string, number> = {}) => {
    const out = { ...x }
    for (const [k, v] of Object.entries(y)) out[k] = Math.max(out[k] ?? 0, v)
    return out
  }
  const days = maxOf(a.days, b.days)
  const goalNewer = (b.dailyNewU ?? 0) > a.dailyNewU
  const bNewer = (b.levelU ?? 0) > a.levelU
  const retNewer = (b.retentionU ?? 0) > a.retentionU
  return {
    level: bNewer ? b.level ?? a.level : a.level,
    levelU: bNewer ? b.levelU! : a.levelU,
    cards: newer(a.cards, b.cards),
    essays: newer(a.essays, b.essays),
    days,
    newWords: maxOf(a.newWords, b.newWords),
    dailyNew: goalNewer ? b.dailyNew ?? a.dailyNew : a.dailyNew,
    dailyNewU: goalNewer ? b.dailyNewU! : a.dailyNewU,
    memo: newer(a.memo, b.memo),
    retention: retNewer ? b.retention ?? a.retention : a.retention,
    retentionU: retNewer ? b.retentionU! : a.retentionU,
    daysOk: maxOf(a.daysOk, b.daysOk),
  }
}

export function newSyncCode(): string {
  const abc = 'abcdefghjkmnpqrstuvwxyz23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(20))
  const s = Array.from(bytes, (b) => abc[b % abc.length]).join('')
  return s.match(/.{5}/g)!.join('-')
}
export function setSync(url: string, code: string) {
  setState({ ...state, sync: { ...state.sync, url: url.trim().replace(/\/+$/, ''), code: code.trim().toLowerCase() } })
}
export const syncReady = () => !!state.sync.url && /^[a-z0-9-]{16,64}$/.test(state.sync.code)

export async function syncNow(): Promise<void> {
  if (!syncReady()) throw new Error('Chưa cài đặt đồng bộ · Sync is not set up')
  const endpoint = `${state.sync.url}/${state.sync.code}`
  const res = await fetch(endpoint)
  if (!res.ok && res.status !== 404) throw new Error(`Máy chủ trả về lỗi ${res.status}`)
  const remote: Partial<Shared> = res.ok ? await res.json() : {}
  const merged = merge(pickShared(state), remote)
  const put = await fetch(endpoint, {
    method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(merged),
  })
  if (!put.ok) throw new Error(`Không lưu được lên máy chủ (lỗi ${put.status})`)
  setState({ ...state, ...merged, sync: { ...state.sync, last: Date.now() } })
}

export function exportData(): string { return JSON.stringify(pickShared(state)) }
export function importData(json: string) {
  const data = JSON.parse(json) as Partial<Shared>
  if (typeof data !== 'object' || !data || typeof data.cards !== 'object') throw new Error('Tệp không hợp lệ · Invalid file')
  setState({ ...state, ...merge(pickShared(state), data) })
}
