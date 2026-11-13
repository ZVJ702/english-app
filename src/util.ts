const CONTRACTIONS: [RegExp, string][] = [
  [/\bcan't\b/g, 'can not'], [/\bcannot\b/g, 'can not'], [/\bwon't\b/g, 'will not'],
  [/n't\b/g, ' not'], [/\bi'm\b/g, 'i am'], [/'re\b/g, ' are'], [/'ve\b/g, ' have'],
  [/'ll\b/g, ' will'], [/\b(it|he|she|that|there)'s\b/g, '$1 is'], [/\bi'd\b/g, 'i would'],
]
export function normalize(s: string): string {
  let t = s.toLowerCase().replace(/[’‘]/g, "'")
  for (const [re, to] of CONTRACTIONS) t = t.replace(re, to)
  return t.replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim()
}
export const sameText = (a: string, b: string) => normalize(a) === normalize(b)

/** Đánh dấu các từ trong câu mẫu mà câu của người học còn thiếu. */
export function missingWords(reference: string, attempt: string): { w: string; miss: boolean }[] {
  const have = new Map<string, number>()
  for (const w of normalize(attempt).split(' ')) have.set(w, (have.get(w) ?? 0) + 1)
  return reference.split(' ').map((w) => {
    const keys = normalize(w).split(' ').filter(Boolean)
    const ok = keys.every((k) => (have.get(k) ?? 0) > 0)
    if (ok) keys.forEach((k) => have.set(k, have.get(k)! - 1))
    return { w, miss: !ok }
  })
}

export function speak(text: string) {
  try {
    const synth = window.speechSynthesis
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = 0.9
    const v = synth.getVoices().find((x) => x.lang.startsWith('en'))
    if (v) u.voice = v
    synth.speak(u)
  } catch { /* thiết bị không hỗ trợ đọc */ }
}

export async function copy(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true } catch { return false }
}

export function untilText(due: Date): string {
  const min = Math.round((due.getTime() - Date.now()) / 60000)
  if (min < 60) return `${Math.max(min, 1)} phút`
  if (min < 60 * 24) return `${Math.round(min / 60)} giờ`
  return `${Math.round(min / 1440)} ngày`
}
