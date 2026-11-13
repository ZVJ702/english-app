// Bộ thẻ người dùng tự nhập (từ Anki). Dữ liệu và hình/âm thanh nằm trong IndexedDB của thiết bị.
import { useSyncExternalStore } from 'react'

export interface Deck { id: string; name: string; count: number; added: number }
export interface Note { id: string; deck: string; word: string; meaning: string; example: string; img?: string; audio?: string }

let db: Promise<IDBDatabase> | null = null
function open(): Promise<IDBDatabase> {
  db ??= new Promise((resolve, reject) => {
    const r = indexedDB.open('english-app-decks', 1)
    r.onupgradeneeded = () => {
      r.result.createObjectStore('decks', { keyPath: 'id' })
      r.result.createObjectStore('notes', { keyPath: 'id' }).createIndex('deck', 'deck')
      r.result.createObjectStore('media') // khóa: "<deck>/<tên tệp>"
    }
    r.onsuccess = () => resolve(r.result)
    r.onerror = () => reject(r.error)
  })
  return db
}
const done = <T,>(r: IDBRequest<T>) => new Promise<T>((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error) })
const finished = (t: IDBTransaction) => new Promise<void>((res, rej) => { t.oncomplete = () => res(); t.onerror = t.onabort = () => rej(t.error) })

let snapshot: { decks: Deck[]; notes: Note[] } = { decks: [], notes: [] }
export const NOTE = new Map<string, Note>()
const subs = new Set<() => void>()

export async function loadDecks() {
  try {
    const d = await open()
    const t = d.transaction(['decks', 'notes'])
    const [decks, notes] = await Promise.all([done(t.objectStore('decks').getAll() as IDBRequest<Deck[]>), done(t.objectStore('notes').getAll() as IDBRequest<Note[]>)])
    snapshot = { decks: decks.sort((a, b) => a.added - b.added), notes }
  } catch { snapshot = { decks: [], notes: [] } } // trình duyệt chặn IndexedDB: app vẫn chạy với kho từ có sẵn
  NOTE.clear()
  snapshot.notes.forEach((n) => NOTE.set(n.id, n))
  subs.forEach((f) => f())
}
export function useDecks() {
  return useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f) }, () => snapshot)
}
export const allNotes = () => snapshot.notes

export async function saveDeck(deck: Deck, notes: Note[], media: Map<string, Blob>) {
  const d = await open()
  const t = d.transaction(['decks', 'notes', 'media'], 'readwrite')
  t.objectStore('decks').put(deck)
  notes.forEach((n) => t.objectStore('notes').put(n))
  media.forEach((blob, name) => t.objectStore('media').put(blob, `${deck.id}/${name}`))
  await finished(t)
  await loadDecks()
}
export async function deleteDeck(id: string) {
  const d = await open()
  const t = d.transaction(['decks', 'notes', 'media'], 'readwrite')
  t.objectStore('decks').delete(id)
  const range = IDBKeyRange.bound(`${id}/`, `${id}/￿`)
  t.objectStore('media').delete(range)
  const keys = await done(t.objectStore('notes').index('deck').getAllKeys(id))
  keys.forEach((k) => t.objectStore('notes').delete(k))
  await finished(t)
  urls.clear()
  await loadDecks()
}

const urls = new Map<string, Promise<string | null>>()
/** Địa chỉ tạm để hiển thị hình hoặc phát âm thanh của một thẻ. */
export function mediaUrl(deck: string, name: string): Promise<string | null> {
  const key = `${deck}/${name}`
  if (!urls.has(key)) {
    urls.set(key, open().then((d) => done(d.transaction('media').objectStore('media').get(key) as IDBRequest<Blob | undefined>))
      .then((b) => (b ? URL.createObjectURL(b) : null)).catch(() => null))
  }
  return urls.get(key)!
}
