// Đọc tệp bộ thẻ Anki (.apkg) ngay trong trình duyệt. Hỗ trợ cả định dạng cũ và mới (nén zstd).
import { BlobReader, BlobWriter, Uint8ArrayWriter, ZipReader, type Entry, type FileEntry } from '@zip.js/zip.js'
import { decompress } from 'fzstd'
import initSqlJs from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'

export interface Model { id: string; name: string; fields: string[]; notes: { id: string; flds: string[] }[] }
export interface Parsed { models: Model[]; readMedia(names: string[], onProgress?: (n: number) => void): Promise<Map<string, Blob>> }

const MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
  mp3: 'audio/mpeg', ogg: 'audio/ogg', oga: 'audio/ogg', wav: 'audio/wav', m4a: 'audio/mp4', opus: 'audio/ogg',
}

/** Đọc danh sách tên tệp trong bảng media kiểu mới (protobuf): mỗi mục có trường 1 là tên. */
function mediaNamesFromProto(buf: Uint8Array): string[] {
  const names: string[] = []
  const dec = new TextDecoder()
  let p = 0
  const varint = () => { let v = 0, s = 0; for (;;) { const b = buf[p++]; v += (b & 127) * 2 ** s; s += 7; if (b < 128) return v } }
  while (p < buf.length) {
    const tag = varint()
    if ((tag & 7) !== 2) throw new Error('media')
    const len = varint()
    const end = p + len
    if (tag >> 3 === 1) {
      let name = ''
      while (p < end) {
        const t = varint()
        if ((t & 7) === 2) { const l = varint(); const e = p + l; if (t >> 3 === 1) name = dec.decode(buf.subarray(p, e)); p = e }
        else if ((t & 7) === 0) varint()
        else throw new Error('media')
      }
      names.push(name)
    }
    p = end
  }
  return names
}

export async function parseApkg(file: Blob): Promise<Parsed> {
  const zip = new ZipReader(new BlobReader(file))
  let list: Entry[]
  try { list = await zip.getEntries() } catch { throw new Error('Tệp này không phải bộ thẻ Anki (.apkg). Hãy chọn đúng tệp .apkg đã tải từ AnkiWeb.') }
  // Tệp .zip chứa bên trong một tệp .apkg (một số trình duyệt điện thoại nén lại khi tải): mở tệp bên trong.
  const inner = list.find((e) => /\.(apkg|colpkg)$/i.test(e.filename) && !e.directory)
  if (inner && !list.some((e) => e.filename.startsWith('collection.anki'))) {
    return parseApkg(await (inner as FileEntry).getData(new BlobWriter()))
  }
  const entries = new Map<string, Entry>(list.map((e) => [e.filename, e]))
  const bytes = (name: string) => (entries.get(name) as FileEntry).getData(new Uint8ArrayWriter())

  const colName = ['collection.anki21b', 'collection.anki21', 'collection.anki2'].find((n) => entries.has(n))
  if (!colName) throw new Error('Tệp này không phải bộ thẻ Anki (.apkg) hợp lệ.')
  let col = await bytes(colName)
  if (colName.endsWith('b')) col = new Uint8Array(decompress(col))

  const SQL = await initSqlJs({ locateFile: () => wasmUrl })
  let sql = new SQL.Database(col)
  const rows = (q: string) => sql.exec(q)[0]?.values ?? []
  const models = new Map<string, Model>()
  if (rows("SELECT 1 FROM sqlite_master WHERE type='table' AND name='notetypes'").length) {
    // Định dạng mới dùng phép so sánh chữ "unicase" riêng của Anki mà trình duyệt không có,
    // nên gỡ nó khỏi lược đồ (chỉ trên bản sao trong bộ nhớ) rồi mở lại trước khi đọc.
    sql.run("PRAGMA writable_schema=ON; UPDATE sqlite_master SET sql = replace(replace(sql, 'COLLATE unicase', ''), 'collate unicase', ''); PRAGMA writable_schema=OFF")
    const patched = sql.export()
    sql.close()
    sql = new SQL.Database(patched)
    for (const [id, name] of rows('SELECT CAST(id AS TEXT), name FROM notetypes NOT INDEXED'))
      models.set(String(id), { id: String(id), name: String(name), fields: [], notes: [] })
    for (const [ntid, name] of rows('SELECT CAST(ntid AS TEXT), name FROM fields ORDER BY ntid, ord'))
      models.get(String(ntid))?.fields.push(String(name))
  } else {
    const json = JSON.parse(String(rows('SELECT models FROM col')[0][0])) as Record<string, { name: string; flds: { name: string; ord: number }[] }>
    for (const [id, m] of Object.entries(json))
      models.set(id, { id, name: m.name, fields: [...m.flds].sort((a, b) => a.ord - b.ord).map((f) => f.name), notes: [] })
  }
  for (const [id, mid, flds] of rows('SELECT CAST(id AS TEXT), CAST(mid AS TEXT), flds FROM notes ORDER BY id'))
    models.get(String(mid))?.notes.push({ id: String(id), flds: String(flds).split('\x1f') })
  sql.close()

  // Bảng media: tên tệp thật → tên tệp trong zip (là số thứ tự)
  const index = new Map<string, string>()
  let zstdMedia = false
  if (entries.has('media')) {
    const raw = await bytes('media')
    try {
      for (const [k, v] of Object.entries(JSON.parse(new TextDecoder().decode(raw)) as Record<string, string>)) index.set(v, k)
    } catch {
      zstdMedia = true
      mediaNamesFromProto(decompress(raw)).forEach((name, i) => index.set(name, String(i)))
    }
  }
  return {
    models: [...models.values()].filter((m) => m.notes.length).sort((a, b) => b.notes.length - a.notes.length),
    async readMedia(names, onProgress) {
      const out = new Map<string, Blob>()
      let n = 0
      for (const name of new Set(names)) {
        const entry = entries.get(index.get(name) ?? '') as FileEntry | undefined
        const type = MIME[name.split('.').pop()!.toLowerCase()] ?? 'application/octet-stream'
        if (entry) {
          out.set(name, zstdMedia
            ? new Blob([decompress(await entry.getData(new Uint8ArrayWriter())) as BlobPart], { type })
            : await entry.getData(new BlobWriter(type)))
        }
        if (++n % 20 === 0) onProgress?.(n)
      }
      await zip.close()
      return out
    },
  }
}

// ---------- Chuyển trường của Anki thành dữ liệu thẻ ----------
export const firstImage = (html: string) => html.match(/<img[^>]+src=["']?([^"'>\s]+)/i)?.[1]
export const firstSound = (html: string) => html.match(/\[sound:([^\]]+)\]/)?.[1]
export function plainText(html: string): string {
  const doc = new DOMParser().parseFromString(html.replace(/\[sound:[^\]]+\]/g, ' ').replace(/<(br|div|p|li)\b/gi, ' <$1'), 'text/html')
  doc.querySelectorAll('style,script').forEach((e) => e.remove())
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim()
}

export interface Mapping { word: number; meaning: number; example: number; image: number; audio: number }
/** Đoán trường nào là từ, nghĩa, ví dụ, hình, âm thanh dựa trên tên trường và nội dung mẫu. */
export function guessMapping(m: Model): Mapping {
  const sample = m.notes.slice(0, 40)
  const stat = m.fields.map((name, i) => {
    const vals = sample.map((n) => n.flds[i] ?? '')
    const texts = vals.map(plainText)
    return {
      i, name: name.toLowerCase(),
      img: vals.filter((v) => firstImage(v)).length / sample.length,
      snd: vals.filter((v) => firstSound(v)).length / sample.length,
      len: texts.reduce((a, t) => a + t.length, 0) / sample.length,
      filled: texts.filter(Boolean).length / sample.length,
    }
  })
  const by = (re: RegExp, ok: (s: (typeof stat)[0]) => boolean = () => true) => stat.find((s) => re.test(s.name) && ok(s))?.i
  const text = stat.filter((s) => s.filled > 0.5 && s.len > 0)
  const word = by(/^(word|từ|front|english|expression|vocab|term|keyword)/, (s) => s.len > 0 && s.len < 40) ?? text.find((s) => s.len < 40)?.i ?? 0
  const meaning = by(/(mean|nghĩa|viet|translat|defin|back|dịch)/, (s) => s.i !== word && s.len > 0)
    ?? text.find((s) => s.i !== word)?.i ?? -1
  const example = by(/(example|sentence|ví dụ|vi du|câu)/, (s) => s.i !== word && s.i !== meaning && s.len > 0)
    ?? text.find((s) => s.i !== word && s.i !== meaning && s.len > 25)?.i ?? -1
  const image = by(/(image|picture|photo|hình|ảnh|img)/, (s) => s.img > 0.2) ?? [...stat].sort((a, b) => b.img - a.img).find((s) => s.img > 0.2)?.i ?? -1
  const audio = by(/(sound|audio|âm|pronun)/, (s) => s.snd > 0.2) ?? [...stat].sort((a, b) => b.snd - a.snd).find((s) => s.snd > 0.2)?.i ?? -1
  return { word, meaning, example, image, audio }
}
