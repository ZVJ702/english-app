// Tùy chỉnh riêng của từng thiết bị: giao diện sáng/tối, cỡ chữ, âm báo, mục tiêu tuần. Không đồng bộ.
import { useSyncExternalStore } from 'react'

export type Theme = 'auto' | 'light' | 'dark'
export interface Prefs { theme: Theme; font: number; sound: boolean; weekGoal: number }
const KEY = 'english-app-prefs'
const DEFAULTS: Prefs = { theme: 'auto', font: 16, sound: true, weekGoal: 4 }

function load(): Prefs {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') } } catch { return DEFAULTS }
}
let prefs = load()
const subs = new Set<() => void>()
export const getPrefs = () => prefs
export function usePrefs(): Prefs {
  return useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f) }, getPrefs)
}
export function setPrefs(p: Partial<Prefs>) {
  prefs = { ...prefs, ...p }
  try { localStorage.setItem(KEY, JSON.stringify(prefs)) } catch { /* bộ nhớ bị chặn: chỉ áp dụng cho lần mở này */ }
  applyPrefs()
  subs.forEach((f) => f())
}
/** Áp dụng giao diện và cỡ chữ lên trang. */
export function applyPrefs() {
  const root = document.documentElement
  if (prefs.theme === 'auto') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', prefs.theme)
  root.style.fontSize = `${prefs.font}px`
  const dark = prefs.theme === 'dark' || (prefs.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#1d1b2a' : '#fdf8f3')
}

// Âm báo đúng/sai, tạo bằng Web Audio nên không cần tệp âm thanh.
let ctx: AudioContext | null = null
export function chime(ok: boolean) {
  if (!prefs.sound) return
  try {
    ctx ??= new AudioContext()
    const notes = ok ? [659, 880] : [330, 247]
    notes.forEach((f, i) => {
      const o = ctx!.createOscillator(), g = ctx!.createGain()
      const t = ctx!.currentTime + i * 0.09
      o.type = 'sine'; o.frequency.value = f
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(ok ? 0.1 : 0.07, t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2)
      o.connect(g).connect(ctx!.destination)
      o.start(t); o.stop(t + 0.22)
    })
  } catch { /* thiết bị không hỗ trợ âm thanh */ }
}
