import { useEffect, useState } from 'react'
import { WORDS } from './data/vocab'
import { SENTENCES } from './data/writing'
import { Essay } from './Essay'
import { Placement } from './Placement'
import { countDue, countNew, Session } from './Session'
import { Settings } from './Settings'
import { syncNow, syncReady, today, useStore } from './store'
import { L, Page } from './ui'

type View = { name: 'home' } | { name: 'session'; minutes: number } | { name: 'essay' } | { name: 'settings' } | { name: 'placement' }

export default function App() {
  const s = useStore()
  const [view, setView] = useState<View>({ name: 'home' })
  const home = () => { setView({ name: 'home' }); if (syncReady()) syncNow().catch(() => {}) }
  useEffect(() => { if (syncReady()) syncNow().catch(() => {}) }, [])

  if (!s.level && view.name !== 'placement') {
    return (
      <Page title="English App">
        <section className="card">
          <h2><L vi="Chào bạn!" en="Welcome!" /></h2>
          <p>Trước tiên, làm một bài kiểm tra ngắn 20 câu (khoảng 5 phút) để app chọn nội dung vừa sức.</p>
          <p className="muted small">A short 20-question test picks the right starting level.</p>
          <button className="primary" onClick={() => setView({ name: 'placement' })}><L vi="Làm bài xếp lớp" en="Take the placement test" /></button>
        </section>
      </Page>
    )
  }
  if (view.name === 'placement') return <Placement onDone={home} onSkip={s.level ? home : undefined} />
  if (view.name === 'session') return <Session minutes={view.minutes} onExit={home} />
  if (view.name === 'essay') return <Essay onBack={home} />
  if (view.name === 'settings') return <Settings onBack={home} onRetest={() => setView({ name: 'placement' })} />

  const due = countDue()
  const fresh = countNew()
  const learned = Object.keys(s.cards).length
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    return { label: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()], n: s.days[today(d)] ?? 0 }
  })
  const max = Math.max(1, ...week.map((d) => d.n))

  return (
    <Page title="English App">
      <section className="card">
        <div className="stats">
          <div><b>{due}</b><L vi="đến hạn ôn" en="due" /></div>
          <div><b>{fresh}</b><L vi="chưa học" en="new" /></div>
          <div><b>{learned}</b><L vi="đã học" en="learned" /></div>
        </div>
        <p className="muted small">
          {due > 30 ? 'Thẻ dồn lại cũng không sao: mỗi phiên chỉ lấy vừa đủ thời gian bạn chọn, thẻ quá hạn lâu nhất được ôn trước.'
            : 'Chọn thời lượng hôm nay. Nghỉ vài ngày cũng không bị phạt. · Pick how long you have today.'}
        </p>
        <div className="grades">
          {[5, 15, 30].map((m) => (
            <button key={m} className={m === 15 ? 'primary' : ''} onClick={() => setView({ name: 'session', minutes: m })}>
              <L vi={`${m} phút`} en={`${m} min`} />
            </button>
          ))}
        </div>
      </section>

      <button className="card row" onClick={() => setView({ name: 'essay' })}>
        <b><L vi="Luyện viết bài" en="Writing practice" /></b>
        <span className="muted small">Đoạn văn, email và IELTS Task 2 — có nút nhờ Claude chấm.</span>
      </button>

      <section className="card">
        <h2><L vi="7 ngày qua" en="Last 7 days" /></h2>
        <div className="week">
          {week.map((d, i) => (
            <div key={i}><span className="n">{d.n || ''}</span><i style={{ height: `${(d.n / max) * 48 + 2}px` }} /><span>{d.label}</span></div>
          ))}
        </div>
        <p className="muted small">Trình độ {s.level} · Kho hiện có {WORDS.length} từ và {SENTENCES.length} câu viết.</p>
      </section>

      <button className="ghost line" onClick={() => setView({ name: 'settings' })}><L vi="Cài đặt, đồng bộ, sao lưu" en="Settings, sync, backup" /></button>
    </Page>
  )
}
