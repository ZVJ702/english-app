import { useMemo, useState } from 'react'
import { updateNote, useDecks, type Note } from './decks'
import { Memo } from './Memo'
import { say } from './plan'
import { useStore } from './store'
import { fromNote, recId, STATUS_NAME, wordStatus, type WordStatus } from './vocab'
import { L, Page } from './ui'
import { BuddySays } from './Buddy'

type Filter = 'leech' | 'learning' | 'known' | 'new' | 'all'
const FILTERS: [Filter, string][] = [['leech', '⚠️ Từ khó'], ['learning', 'Đang học'], ['known', 'Đã thuộc'], ['new', 'Chưa học'], ['all', 'Tất cả']]

/** Ô sửa từ, nghĩa và câu ví dụ. Chỉ thay đổi trên thiết bị này. */
function EditNote({ n, onDone }: { n: Note; onDone: () => void }) {
  const [f, setF] = useState({ word: n.word, meaning: n.meaning, example: n.example })
  const [busy, setBusy] = useState(false)
  return (
    <div className="edit-note">
      <label>Từ tiếng Anh · Word<input value={f.word} onChange={(e) => setF({ ...f, word: e.target.value })} autoCapitalize="none" /></label>
      <label>Nghĩa · Meaning<input value={f.meaning} onChange={(e) => setF({ ...f, meaning: e.target.value })} /></label>
      <label>Câu ví dụ · Example<textarea rows={2} value={f.example} onChange={(e) => setF({ ...f, example: e.target.value })} /></label>
      <p className="muted small">Thay đổi chỉ lưu trên thiết bị này; tiến độ học của từ được giữ nguyên.</p>
      <div className="grades">
        <button onClick={onDone}>Hủy</button>
        <button className="primary" disabled={busy || !f.word.trim() || !f.meaning.trim()}
          onClick={async () => { setBusy(true); await updateNote({ ...n, word: f.word.trim(), meaning: f.meaning.trim(), example: f.example.trim() }); onDone() }}>
          Lưu
        </button>
      </div>
    </div>
  )
}

/** Danh sách từ đã nhập: lọc theo trạng thái, tìm kiếm, nghe, sửa và viết mẹo nhớ. */
export function Words({ onBack }: { onBack: () => void }) {
  const s = useStore()
  const { notes } = useDecks()
  const [filter, setFilter] = useState<Filter>('leech')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const rows = useMemo(() => notes.map((n) => ({ n, v: fromNote(n), st: wordStatus(n.id, s.cards) })), [notes, s.cards])
  const count = (f: Filter) => (f === 'all' ? rows.length : rows.filter((r) => r.st === f).length)
  const needle = q.trim().toLowerCase()
  const shown = rows
    .filter((r) => filter === 'all' || r.st === filter)
    .filter((r) => !needle || r.v.word.toLowerCase().includes(needle) || r.v.vi.toLowerCase().includes(needle))
    .slice(0, 200)

  return (
    <Page title={<L vi="Từ của tôi" en="My words" />} onBack={onBack}>
      {filter === 'leech' && count('leech') > 0 && (
        <BuddySays mood="think" size={80} en="Let's tame these!" vi={`Bạn đã quên mỗi từ dưới đây từ 5 lần trở lên. Viết một mẹo nhớ riêng sẽ giúp nhiều nhất.`} />
      )}
      <input className="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Tìm từ hoặc nghĩa · Search" />
      <div className="chips-row">
        {FILTERS.map(([f, name]) => (
          <button key={f} className={`pill ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>{name} <small>{count(f)}</small></button>
        ))}
      </div>
      {shown.length === 0 && (
        <p className="muted center">{filter === 'leech' ? 'Chưa có từ khó nào. Tốt lắm!' : notes.length ? 'Không có từ nào khớp.' : 'Chưa nhập bộ thẻ nào.'}</p>
      )}
      {shown.map(({ n, v, st }) => {
        const p = s.cards[n.id], r = s.cards[recId(n.id)]
        const lapses = Math.max(p?.c.lapses ?? 0, r?.c.lapses ?? 0)
        const isOpen = open === n.id
        return (
          <section key={n.id} className={`card word-row ${isOpen ? 'open' : ''}`}>
            <button className="word-head" onClick={() => setOpen(isOpen ? null : n.id)}>
              <span><b>{v.word}</b><span className="muted">{v.vi}</span></span>
              <span className={`st st-${st}`}>{STATUS_NAME[st as WordStatus]}</span>
            </button>
            {isOpen && (
              <div className="word-body">
                <p className="muted small">
                  {p ? `Thẻ tự viết: nhớ được khoảng ${Math.round(p.c.stability)} ngày` : r ? 'Đang ở bước nhận diện, chưa mở thẻ tự viết' : 'Chưa học'}
                  {lapses > 0 && ` · đã quên ${lapses} lần`}
                </p>
                {editing === n.id ? <EditNote n={n} onDone={() => setEditing(null)} /> : (
                  <>
                    {v.ex && <p className="example">{v.ex.replace(/[{}]/g, '')}</p>}
                    <div className="row-actions">
                      <button className="ghost" onClick={() => say(v)}>🔊 Nghe</button>
                      <button className="ghost" onClick={() => setEditing(n.id)}>✏️ Sửa</button>
                    </div>
                    <Memo id={n.id} open={st === 'leech'} />
                  </>
                )}
              </div>
            )}
          </section>
        )
      })}
      {shown.length === 200 && <p className="muted small center">Đang hiện 200 từ đầu tiên; gõ vào ô tìm kiếm để lọc thêm.</p>}
    </Page>
  )
}
