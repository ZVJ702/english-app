import { useSyncExternalStore } from 'react'
import { createEmptyCard, fsrs, type Card, type Grade } from 'ts-fsrs'
import type { Level } from './data/vocab'

export interface Rec { c: Card; u: number }
export interface Shared {
  level: Level | null
  levelU: number
  cards: Record<string, Rec>
  essays: Record<string, { text: string; u: number }>
  days: Record<string, number>
}
export interface State extends Shared {
  sync: { url: string; code: string; last: number }
}

const KEY = 'english-app-v1'
const DEFAULT_SYNC_URL: string = import.meta.env.VITE_SYNC_URL ?? ''
const empty = (): State => ({
  level: null, levelU: 0, cards: {}, essays: {}, days: {},
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
const scheduler = fsrs({ request_retention: 0.9, enable_fuzz: true })

/** Chấm một thẻ và lưu lịch ôn mới. Trả về thời điểm ôn kế tiếp. */
export function grade(id: string, g: Grade): Date {
  const now = new Date()
  const prev = state.cards[id]?.c ?? createEmptyCard(now)
  const { card } = scheduler.next(prev, now, g)
  const d = today(now)
  setState({
    ...state,
    cards: { ...state.cards, [id]: { c: card, u: now.getTime() } },
    days: { ...state.days, [d]: (state.days[d] ?? 0) + 1 },
  })
  return new Date(card.due)
}
export const dueTime = (r: Rec) => new Date(r.c.due).getTime()

export function setLevel(level: Level) { setState({ ...state, level, levelU: Date.now() }) }
export function saveEssay(id: string, text: string) {
  setState({ ...state, essays: { ...state.essays, [id]: { text, u: Date.now() } } })
}

// ---------- Đồng bộ & sao lưu ----------
function pickShared(s: Shared): Shared {
  return { level: s.level, levelU: s.levelU, cards: s.cards, essays: s.essays, days: s.days }
}
/** Gộp hai bản dữ liệu: mỗi mục lấy bản được sửa gần nhất. */
export function merge(a: Shared, b: Partial<Shared>): Shared {
  const newer = <T extends { u: number }>(x: Record<string, T>, y: Record<string, T> = {}) => {
    const out = { ...x }
    for (const [k, v] of Object.entries(y)) if (!out[k] || v.u > out[k].u) out[k] = v
    return out
  }
  const days = { ...a.days }
  for (const [k, v] of Object.entries(b.days ?? {})) days[k] = Math.max(days[k] ?? 0, v)
  const bNewer = (b.levelU ?? 0) > a.levelU
  return {
    level: bNewer ? b.level ?? a.level : a.level,
    levelU: bNewer ? b.levelU! : a.levelU,
    cards: newer(a.cards, b.cards),
    essays: newer(a.essays, b.essays),
    days,
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
