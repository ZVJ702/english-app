import { useState } from 'react'
import { GRAMMAR } from './data/grammar'
import { useDecks } from './decks'
import { known } from './Session'
import { dueTime, streaks, today, useStore } from './store'
import { wordStatus, type WordStatus } from './vocab'
import { L, Page } from './ui'

const DAY = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const fmt = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`

/** Trang thống kê: dự báo số thẻ cần ôn, mức độ thuộc từ, tỷ lệ nhớ và lịch học. */
export function Stats({ onBack }: { onBack: () => void }) {
  const s = useStore()
  const { notes } = useDecks()
  const [hover, setHover] = useState<number | null>(null)
  const [cell, setCell] = useState<string | null>(null)
  const now = new Date()
  const t0 = dayStart(now).getTime()

  // Dự báo 7 ngày: thẻ đã quá hạn được tính vào hôm nay.
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(t0); d.setDate(d.getDate() + i); return d })
  const fc = days.map(() => ({ vocab: 0, grammar: 0 }))
  for (const [id, r] of Object.entries(s.cards)) {
    if (!known(id)) continue
    const i = Math.max(0, Math.floor((dueTime(r) - t0) / 86_400_000))
    if (i < 7) fc[i][id.startsWith('g:') ? 'grammar' : 'vocab']++
  }
  const peak = Math.max(1, ...fc.map((x) => x.vocab + x.grammar))

  const st: Record<WordStatus, number> = { new: 0, learning: 0, known: 0, leech: 0 }
  for (const n of notes) st[wordStatus(n.id, s.cards)]++
  const gDone = GRAMMAR.filter((t) => t.exercises.every((e) => s.cards[e.id])).length
  const gStarted = GRAMMAR.filter((t) => t.exercises.some((e) => s.cards[e.id])).length

  // Tỷ lệ trả lời đúng 30 ngày qua (chỉ tính những ngày đã có số liệu đúng/sai).
  let tot = 0, ok = 0
  for (let i = 0; i < 30; i++) {
    const d = today(new Date(t0 - i * 86_400_000))
    if (s.daysOk[d] !== undefined || i === 0) { tot += s.days[d] ?? 0; ok += s.daysOk[d] ?? 0 }
  }
  const allReviews = Object.values(s.days).reduce((a, b) => a + b, 0)
  const activeDays = Object.values(s.days).filter((n) => n > 0).length
  const { best } = streaks(s.days)

  // Lịch 26 tuần, mỗi cột một tuần từ thứ Hai đến Chủ nhật.
  const WEEKS = 26
  const offset = (now.getDay() + 6) % 7
  const cells = Array.from({ length: WEEKS * 7 }, (_, k) => {
    const col = Math.floor(k / 7), row = k % 7
    const back = (WEEKS - 1 - col) * 7 + offset - row
    if (back < 0) return null
    const d = new Date(t0 - back * 86_400_000)
    return { key: today(d), label: `${DAY[d.getDay()]} ${fmt(d)}`, n: s.days[today(d)] ?? 0 }
  })
  const hmax = Math.max(1, ...cells.map((c) => c?.n ?? 0))
  const level = (n: number) => (n === 0 ? 0 : Math.min(4, Math.ceil((n / hmax) * 4)))
  const shown = cells.find((c) => c?.key === cell)

  return (
    <Page title={<L vi="Thống kê" en="Statistics" />} onBack={onBack}>
      <section className="card">
        <h2><L vi="Từ vựng" en="Vocabulary" /></h2>
        <div className="facts four">
          <div><b>{st.known}</b><span>đã thuộc</span></div>
          <div><b>{st.learning}</b><span>đang học</span></div>
          <div><b>{st.leech}</b><span>từ khó</span></div>
          <div><b>{st.new}</b><span>chưa học</span></div>
        </div>
        <div className="stack-bar" role="img" aria-label={`Đã thuộc ${st.known}, đang học ${st.learning}, từ khó ${st.leech}, chưa học ${st.new}`}>
          {(['known', 'learning', 'leech'] as WordStatus[]).map((k) => st[k] > 0 && <i key={k} className={`sb-${k}`} style={{ flex: st[k] }} />)}
          {st.new > 0 && <i className="sb-new" style={{ flex: st.new }} />}
        </div>
        <p className="muted small">"Đã thuộc" là từ bạn tự viết được và nhớ được từ 3 tuần trở lên.</p>
      </section>

      <section className="card">
        <h2><L vi="Ngữ pháp" en="Grammar" /></h2>
        <div className="facts">
          <div><b>{gDone}</b><span>chủ đề đã xong</span></div>
          <div><b>{gStarted - gDone}</b><span>đang học</span></div>
          <div><b>{GRAMMAR.length - gStarted}</b><span>chưa học</span></div>
        </div>
      </section>

      <section className="card">
        <h2><L vi="Dự báo ôn tập 7 ngày tới" en="Reviews due, next 7 days" /></h2>
        <div className="legend"><span><i className="sw sw-a" />Từ vựng</span><span><i className="sw sw-b" />Ngữ pháp</span></div>
        <div className="fc" onPointerLeave={() => setHover(null)}>
          {fc.map((x, i) => {
            const total = x.vocab + x.grammar
            return (
              <button key={i} className={`fc-col ${hover === i ? 'on' : ''}`} onPointerEnter={() => setHover(i)} onClick={() => setHover(i)}
                aria-label={`${i === 0 ? 'Hôm nay' : DAY[days[i].getDay()]} ${fmt(days[i])}: ${x.vocab} từ vựng, ${x.grammar} ngữ pháp`}>
                {hover === i && (
                  <span className="tip">
                    <b>{i === 0 ? 'Hôm nay' : `${DAY[days[i].getDay()]} ${fmt(days[i])}`}</b>
                    <span><i className="sw sw-a" />{x.vocab} từ vựng</span>
                    <span><i className="sw sw-b" />{x.grammar} ngữ pháp</span>
                  </span>
                )}
                <span className="fc-stack" style={{ height: `${(total / peak) * 100}%` }}>
                  {x.grammar > 0 && <i className="seg-b" style={{ flex: x.grammar }} />}
                  {x.vocab > 0 && <i className="seg-a" style={{ flex: x.vocab }} />}
                </span>
                <span className="fc-lbl">{i === 0 ? 'Nay' : DAY[days[i].getDay()]}</span>
              </button>
            )
          })}
        </div>
        <p className="muted small">Thẻ đã quá hạn được tính vào hôm nay. Bấm vào một cột để xem số liệu.</p>
        <details className="table-view">
          <summary>Xem dạng bảng</summary>
          <table>
            <thead><tr><th>Ngày</th><th>Từ vựng</th><th>Ngữ pháp</th></tr></thead>
            <tbody>{fc.map((x, i) => <tr key={i}><td>{i === 0 ? 'Hôm nay' : `${DAY[days[i].getDay()]} ${fmt(days[i])}`}</td><td>{x.vocab}</td><td>{x.grammar}</td></tr>)}</tbody>
          </table>
        </details>
      </section>

      <section className="card">
        <h2><L vi="Lịch học 26 tuần" en="Study calendar" /></h2>
        <div className="facts">
          <div><b>{tot ? `${Math.round((ok / tot) * 100)}%` : '–'}</b><span>trả lời đúng (30 ngày)</span></div>
          <div><b>{activeDays}</b><span>ngày đã học</span></div>
          <div><b>{best}</b><span>chuỗi dài nhất</span></div>
        </div>
        <div className="heat26" onPointerLeave={() => setCell(null)}>
          {cells.map((c, k) => c
            ? <i key={k} className={`h${level(c.n)} ${c.key === cell ? 'on' : ''}`} onPointerEnter={() => setCell(c.key)} onClick={() => setCell(c.key)} aria-label={`${c.label}: ${c.n} lượt ôn`} />
            : <i key={k} className="future" />)}
        </div>
        <div className="heat-foot">
          <span className="muted small">{shown ? `${shown.label}: ${shown.n} lượt ôn` : `Tổng cộng ${allReviews} lượt ôn`}</span>
          <span className="scale"><small>Ít</small><i className="h1" /><i className="h2" /><i className="h3" /><i className="h4" /><small>Nhiều</small></span>
        </div>
        {tot === 0 && <p className="muted small">Tỷ lệ trả lời đúng được ghi lại từ bản cập nhật này trở đi.</p>}
      </section>
    </Page>
  )
}
