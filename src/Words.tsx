import { useMemo, useState } from 'react'
import { useDecks } from './decks'
import { Memo } from './Memo'
import { say } from './Session'
import { useStore } from './store'
import { fromNote, recId, STATUS_NAME, wordStatus, type WordStatus } from './vocab'
import { L, Page } from './ui'
import { BuddySays } from './Buddy'

type Filter = 'leech' | 'learning' | 'known' | 'new' | 'all'
const FILTERS: [Filter, string][] = [['leech', '⚠️ Từ khó'], ['learning', 'Đang học'], ['known', 'Đã thuộc'], ['new', 'Chưa học'], ['all', 'Tất cả']]

/** Danh sách từ đã nhập: lọc theo trạng thái, tìm kiếm, xem và viết mẹo nhớ. */
export function Words({ onBack }: { onBack: () => void }) {
  const s = useStore()
  const { notes } = useDecks()
  const [filter, setFilter] = useState<Filter>('leech')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<string | null>(null)
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
                <button className="ghost" onClick={() => say(v)}>🔊 Nghe</button>
                <Memo id={n.id} open={st === 'leech'} />
              </div>
            )}
          </section>
        )
      })}
      {shown.length === 200 && <p className="muted small center">Đang hiện 200 từ đầu tiên; gõ vào ô tìm kiếm để lọc thêm.</p>}
    </Page>
  )
}
