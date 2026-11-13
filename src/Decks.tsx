import { useRef, useState } from 'react'
import type { Mapping, Model, Parsed } from './anki'
import { deleteDeck, saveDeck, useDecks, type Note } from './decks'
import { useStore } from './store'
import { L, Page } from './ui'
import { BuddySays } from './Buddy'

const ROLES: [keyof Mapping, string, boolean][] = [
  ['word', 'Từ tiếng Anh · Word', true], ['meaning', 'Nghĩa · Meaning', true], ['example', 'Câu ví dụ · Example', false],
  ['image', 'Hình ảnh · Image', false], ['audio', 'Âm thanh · Audio', false],
]

export function Decks({ onBack }: { onBack: () => void }) {
  const { decks, notes } = useDecks()
  const s = useStore()
  const file = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState('')
  const [err, setErr] = useState('')
  const [parsed, setParsed] = useState<{ name: string; data: Parsed; lib: typeof import('./anki') } | null>(null)
  const [mi, setMi] = useState(0)
  const [map, setMap] = useState<Mapping | null>(null)

  async function pick(f: File) {
    setErr(''); setBusy('Đang đọc tệp… · Reading file…')
    try {
      const lib = await import('./anki')
      const data = await lib.parseApkg(f)
      if (!data.models.length) throw new Error('Không tìm thấy thẻ nào trong tệp này.')
      setParsed({ name: f.name.replace(/\.(apkg|colpkg)$/i, ''), data, lib }); setMi(0); setMap(lib.guessMapping(data.models[0]))
    } catch (e) { setErr(e instanceof Error ? e.message : 'Không đọc được tệp.') }
    setBusy('')
  }
  function convert(m: Model, mp: Mapping, deck: string, lib: typeof import('./anki')): Note[] {
    const f = (n: { flds: string[] }, i: number) => (i >= 0 ? n.flds[i] ?? '' : '')
    return m.notes.map((n) => ({
      id: `a:${deck}:${n.id}`, deck,
      word: lib.plainText(f(n, mp.word)), meaning: lib.plainText(f(n, mp.meaning)), example: lib.plainText(f(n, mp.example)),
      img: lib.firstImage(f(n, mp.image)), audio: lib.firstSound(f(n, mp.audio)),
    })).filter((n) => n.word && n.meaning && n.word.length <= 60)
  }
  async function doImport() {
    if (!parsed || !map) return
    setErr('')
    try {
      const deck = parsed.data.models[mi].id // mã cố định của bộ thẻ: giống nhau trên mọi thiết bị để đồng bộ tiến độ
      const list = convert(parsed.data.models[mi], map, deck, parsed.lib)
      const names = list.flatMap((n) => [n.img, n.audio]).filter((x): x is string => !!x)
      setBusy(`Đang nhập ${list.length} thẻ…`)
      const media = await parsed.data.readMedia(names, (n) => setBusy(`Đang chép hình và âm thanh: ${n}/${new Set(names).size}`))
      await saveDeck({ id: deck, name: parsed.name, count: list.length, added: Date.now() }, list, media)
      setParsed(null); setMap(null)
    } catch (e) {
      setErr(e instanceof DOMException && e.name === 'QuotaExceededError'
        ? 'Thiết bị không đủ dung lượng trống để lưu bộ thẻ này.' : e instanceof Error ? e.message : 'Nhập thất bại.')
    }
    setBusy('')
  }

  if (parsed && map) {
    const model = parsed.data.models[mi]
    const preview = convert({ ...model, notes: model.notes.slice(0, 3) }, map, 'x', parsed.lib)
    const usable = convert(model, map, 'x', parsed.lib).length
    return (
      <Page title={<L vi="Kiểm tra trước khi nhập" en="Check before importing" />} onBack={() => { setParsed(null); setMap(null) }}>
        <section className="card">
          <h2>{parsed.name}</h2>
          {parsed.data.models.length > 1 && (
            <label>Loại thẻ · Note type
              <select value={mi} onChange={(e) => { const i = Number(e.target.value); setMi(i); setMap(parsed.lib.guessMapping(parsed.data.models[i])) }}>
                {parsed.data.models.map((m, i) => <option key={m.id} value={i}>{m.name} ({m.notes.length} thẻ)</option>)}
              </select>
            </label>
          )}
          <p className="muted small">App đã đoán sẵn mỗi phần nằm ở trường nào của bộ thẻ. Nếu phần xem trước bên dưới chưa đúng, hãy chọn lại.</p>
          {ROLES.map(([key, label, required]) => (
            <label key={key}>{label}
              <select value={map[key]} onChange={(e) => setMap({ ...map, [key]: Number(e.target.value) })}>
                {!required && <option value={-1}>— Không có · None —</option>}
                {model.fields.map((name, i) => <option key={i} value={i}>{name}</option>)}
              </select>
            </label>
          ))}
        </section>
        <section className="card">
          <h2><L vi="Xem trước" en="Preview" /></h2>
          {preview.length === 0 && <p className="muted">Chưa đọc được thẻ nào với cách chọn này.</p>}
          {preview.map((n) => (
            <p key={n.id} className="preview">
              <b>{n.word}</b> — {n.meaning}
              {n.example && <span className="muted small"><br />{n.example}</span>}
              <span className="muted small"><br />{n.img ? '🖼️ có hình' : 'không hình'} · {n.audio ? '🔊 có âm thanh' : 'không âm thanh'}</span>
            </p>
          ))}
          {err && <p className="error">{err}</p>}
          <button className="primary" disabled={!!busy || usable === 0} onClick={doImport}>
            {busy || <L vi={`Nhập ${usable} thẻ`} en={`Import ${usable} cards`} />}
          </button>
        </section>
      </Page>
    )
  }

  return (
    <Page title={<L vi="Bộ từ của tôi" en="My decks" />} onBack={onBack}>
      <BuddySays mood="happy" size={84} en="Bring your own words!" vi="Nhập bộ thẻ Anki (.apkg) để học thêm từ của riêng bạn." />
      {decks.map((d) => {
        const learned = notes.filter((n) => n.deck === d.id && s.cards[n.id]).length
        return (
          <section key={d.id} className="card deck">
            <div><b>{d.name}</b><span className="muted small">{d.count} thẻ · đã học {learned}</span></div>
            <button className="ghost" onClick={() => { if (confirm(`Xóa bộ "${d.name}" khỏi thiết bị này?`)) deleteDeck(d.id) }}>Xóa</button>
          </section>
        )
      })}
      <section className="card">
        <h2><L vi="Nhập bộ thẻ Anki" en="Import an Anki deck" /></h2>
        <p className="muted small">Tải tệp .apkg từ ankiweb.net/shared/decks rồi chọn tệp ở đây. Tệp được đọc ngay trên thiết bị, không gửi đi đâu. Bộ thẻ lớn có thể mất vài phút.</p>
        {err && <p className="error">{err}</p>}
        <button className="primary" disabled={!!busy} onClick={() => file.current?.click()}>
          {busy || <L vi="Chọn tệp .apkg" en="Choose .apkg file" />}
        </button>
        <input ref={file} type="file" accept=".apkg,.colpkg,application/zip,application/octet-stream" hidden
          onChange={(e) => { const f = e.target.files?.[0]; if (f) pick(f); e.target.value = '' }} />
        <p className="muted small">Hình và âm thanh của bộ thẻ chỉ nằm trên thiết bị này. Tiến độ học thì đồng bộ được; muốn học bộ này trên máy khác, hãy nhập cùng tệp đó ở máy kia.</p>
      </section>
    </Page>
  )
}
