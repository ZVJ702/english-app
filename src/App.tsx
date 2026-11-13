import { useEffect, useState } from 'react'
import { WORDS } from './data/vocab'
import { SENTENCES } from './data/writing'
import { Essay } from './Essay'
import { Placement } from './Placement'
import { countDue, countNew, Session } from './Session'
import { Settings } from './Settings'
import { syncNow, syncReady, today, useStore } from './store'
import { L, Page } from './ui'
import { Buddy, BuddySays } from './Buddy'

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
          <BuddySays mood="wave" size={110} en="Hi, I'm Infi!" vi="Mình là Infi, bạn học cùng bạn." />
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

  const total = WORDS.length + SENTENCES.length
  const activeDays = week.filter((d) => d.n > 0).length
  const hour = new Date().getHours()
  const hello = hour < 11 ? ['Chào buổi sáng', 'Good morning'] : hour < 18 ? ['Chào buổi chiều', 'Good afternoon'] : ['Chào buổi tối', 'Good evening']
  const TILES = [
    { m: 5, icon: '☕', vi: 'Nhanh', en: 'Quick', cls: 't1' },
    { m: 15, icon: '🎯', vi: 'Vừa đủ', en: 'Focused', cls: 't2' },
    { m: 30, icon: '🚀', vi: 'Học sâu', en: 'Deep', cls: 't3' },
  ]

  return (
    <main className="page">
      <section className="hero">
        <div className="hero-text">
          <p className="hello">{hello[0]}!</p>
          <p className="hello-en">{hello[1]}</p>
          <span className="badge">Trình độ {s.level}</span>
        </div>
        <Buddy mood={due > 0 || learned === 0 ? 'wave' : 'happy'} size={118} />
        <div className="bubble wide">
          <b>{due > 0 ? "Let's review!" : learned > 0 ? 'Ready for new words?' : "Let's get started!"}</b>
          <span>{due > 0 ? `${due} thẻ đang chờ bạn ôn.` : learned > 0 ? 'Không có thẻ đến hạn — học từ mới nhé.' : 'Bắt đầu phiên học đầu tiên nào!'}</span>
        </div>
        <div className="hero-progress">
          <div className="bar"><i style={{ width: `${(learned / total) * 100}%` }} /></div>
          <span>Đã học {learned}/{total} · {Math.round((learned / total) * 100)}%</span>
        </div>
      </section>

      <div className="stats">
        <div className="chip c1"><b>{due}</b><L vi="đến hạn ôn" en="due" /></div>
        <div className="chip c2"><b>{fresh}</b><L vi="chưa học" en="new" /></div>
        <div className="chip c3"><b>{learned}</b><L vi="đã học" en="learned" /></div>
      </div>

      <h2 className="sec"><L vi="Hôm nay bạn có bao lâu?" en="How long do you have today?" /></h2>
      <div className="tiles">
        {TILES.map((t) => (
          <button key={t.m} className={`tile ${t.cls}`} onClick={() => setView({ name: 'session', minutes: t.m })}>
            <span className="icon">{t.icon}</span>
            <b>{t.m} phút</b>
            <L vi={t.vi} en={t.en} />
          </button>
        ))}
      </div>
      <p className="muted small center">
        {due > 30 ? 'Thẻ dồn lại cũng không sao: mỗi phiên chỉ lấy vừa đủ thời gian bạn chọn.' : 'Nghỉ vài ngày cũng không bị phạt — thẻ sẽ chờ bạn.'}
      </p>

      <button className="card row feature" onClick={() => setView({ name: 'essay' })}>
        <span className="icon">✍️</span>
        <span>
          <b><L vi="Luyện viết bài" en="Writing practice" /></b>
          <span className="muted small">Đoạn văn, email và IELTS Task 2 — có nút nhờ Claude chấm.</span>
        </span>
        <span className="chev">›</span>
      </button>

      <section className="card">
        <h2><L vi="7 ngày qua" en="Last 7 days" /></h2>
        <div className="week">
          {week.map((d, i) => (
            <div key={i} className={d.n ? 'on' : ''}><span className="n">{d.n || ''}</span><i style={{ height: `${(d.n / max) * 56 + 6}px` }} /><span>{d.label}</span></div>
          ))}
        </div>
        <p className="muted small">
          {activeDays > 0 ? `Bạn đã học ${activeDays}/7 ngày gần đây. ` : ''}Kho hiện có {WORDS.length} từ và {SENTENCES.length} câu viết.
        </p>
      </section>

      <button className="ghost line" onClick={() => setView({ name: 'settings' })}>⚙️ <L vi="Cài đặt, đồng bộ, sao lưu" en="Settings, sync, backup" /></button>
    </main>
  )
}
