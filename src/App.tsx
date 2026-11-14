import { useEffect, useState } from 'react'
import { GRAMMAR } from './data/grammar'
import { PHRASES } from './data/phrases'
import { EXERCISES, GRAMMAR_EXERCISES } from './data/units'
import { Library } from './Grammar'
import { countDue, known, Session } from './Session'
import { Decks } from './Decks'
import { useDecks } from './decks'
import { Settings } from './Settings'
import { streaks, syncNow, syncReady, today, useStore } from './store'
import { L, Ring } from './ui'
import { Buddy } from './Buddy'

type View = { name: 'home' } | { name: 'session'; minutes: number } | { name: 'grammar' } | { name: 'phrases' } | { name: 'decks' } | { name: 'settings' }

export default function App() {
  const s = useStore()
  const { notes } = useDecks()
  const [view, setView] = useState<View>({ name: 'home' })
  const home = () => { setView({ name: 'home' }); if (syncReady()) syncNow().catch(() => {}) }
  useEffect(() => { if (syncReady()) syncNow().catch(() => {}) }, [])

  if (view.name === 'session') return <Session minutes={view.minutes} onExit={home} />
  if (view.name === 'grammar') return <Library mode="grammar" onBack={home} />
  if (view.name === 'phrases') return <Library mode="phrases" onBack={home} />
  if (view.name === 'decks') return <Decks onBack={home} />
  if (view.name === 'settings') return <Settings onBack={home} />

  const due = countDue()
  const learned = Object.keys(s.cards).filter(known).length
  const total = EXERCISES.length + notes.length
  const now = new Date()
  const DAY = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  const back = (n: number) => { const d = new Date(now); d.setDate(d.getDate() - n); return d }
  const week = Array.from({ length: 7 }, (_, i) => { const d = back(6 - i); return { label: DAY[d.getDay()], n: s.days[today(d)] ?? 0, isToday: i === 6 } })
  // Lưới 5 tuần gần nhất, mỗi hàng một tuần bắt đầu từ thứ Hai.
  const offset = (now.getDay() + 6) % 7
  const grid = Array.from({ length: 35 }, (_, i) => { const n = 28 + offset - i; return n < 0 ? null : s.days[today(back(n))] ?? 0 })
  const peak = Math.max(1, ...grid.map((n) => n ?? 0))
  const weekReviews = week.reduce((a, d) => a + d.n, 0)
  const weekWords = Array.from({ length: 7 }, (_, i) => s.newWords[today(back(i))] ?? 0).reduce((a, b) => a + b, 0)
  const activeDays = week.filter((d) => d.n > 0).length
  const { current: streak, best } = streaks(s.days)
  const doneToday = (s.days[today()] ?? 0) > 0
  const wordsToday = s.newWords[today()] ?? 0
  const hour = now.getHours()
  const hello = hour < 11 ? ['Chào buổi sáng', 'Good morning'] : hour < 18 ? ['Chào buổi chiều', 'Good afternoon'] : ['Chào buổi tối', 'Good evening']
  const gDone = GRAMMAR.filter((t) => t.exercises.every((e) => s.cards[e.id])).length
  const gStarted = GRAMMAR.filter((t) => t.exercises.some((e) => s.cards[e.id])).length
  const gEx = GRAMMAR_EXERCISES.filter((e) => s.cards[e.id]).length
  const say = notes.length === 0 ? ['Add your words!', 'Chưa có từ vựng: vào "Bộ từ" để nhập bộ thẻ Anki.']
    : due > 0 ? ["Let's review!", `${due} thẻ đang chờ bạn ôn.`]
    : doneToday ? ['Great work today!', 'Hôm nay bạn đã học rồi. Học thêm cũng được, nghỉ cũng được.']
    : ['Ready when you are!', 'Bắt đầu phiên học hôm nay nào.']

  return (
    <main className="page home">
      <section className="hero">
        <div className="hero-text">
          <p className="hello">{hello[0]}!</p>
          <p className="hello-en">{hello[1]}</p>
          <div className="chips">
            <span className={`badge flame ${streak > 0 ? 'lit' : ''}`}>🔥 {streak} ngày</span>
          </div>
        </div>
        <Buddy mood={doneToday && due === 0 ? 'cheer' : due > 0 || learned === 0 ? 'wave' : 'happy'} size={112} />
        <div className="bubble wide"><b>{say[0]}</b><span>{say[1]}</span></div>
      </section>

      <section className="card today">
        <h2><L vi="Hôm nay" en="Today" /></h2>
        <div className="rings">
          <Ring value={s.dailyNew ? wordsToday / s.dailyNew : 0} tone="a">
            <b>{wordsToday}<small>/{s.dailyNew}</small></b><span>từ mới</span>
          </Ring>
          <Ring value={due === 0 ? (doneToday ? 1 : 0) : (s.days[today()] ?? 0) / ((s.days[today()] ?? 0) + due)} tone="b">
            <b>{due}</b><span>cần ôn</span>
          </Ring>
          <Ring value={total ? learned / total : 0} tone="c">
            <b>{total ? Math.round((learned / total) * 100) : 0}<small>%</small></b><span>đã học</span>
          </Ring>
        </div>
        <button className="primary go" onClick={() => setView({ name: 'session', minutes: 15 })}>
          <span>▶</span> <L vi={doneToday ? 'Học tiếp 15 phút' : 'Bắt đầu học 15 phút'} en="Start a 15-minute session" />
        </button>
        <div className="grades alt">
          <button onClick={() => setView({ name: 'session', minutes: 5 })}>☕ <L vi="5 phút" en="Quick" /></button>
          <button onClick={() => setView({ name: 'session', minutes: 30 })}>🚀 <L vi="30 phút" en="Deep" /></button>
        </div>
      </section>

      <div className="tiles">
        <button className="tile t2" onClick={() => setView({ name: 'grammar' })}><span className="icon">📘</span><b>Ngữ pháp</b><small>{GRAMMAR.length} chủ đề</small></button>
        <button className="tile t3" onClick={() => setView({ name: 'phrases' })}><span className="icon">💬</span><b>Giao tiếp</b><small>{PHRASES.length} tình huống</small></button>
        <button className="tile t1" onClick={() => setView({ name: 'decks' })}><span className="icon">🗂️</span><b>Bộ từ</b><small>{notes.length} thẻ</small></button>
      </div>

      <section className="card activity">
        <div className="act-head">
          <h2><L vi="Hoạt động" en="Activity" /></h2>
          <span className="muted small">Chuỗi dài nhất: {best} ngày</span>
        </div>
        <div className="weekrow">
          {week.map((d, i) => (
            <div key={i} className={`day ${d.n ? 'on' : ''} ${d.isToday ? 'now' : ''}`}>
              <span className="dot">{d.n ? '✓' : ''}</span>
              <span className="lbl">{d.label}</span>
              <span className="cnt">{d.n || '–'}</span>
            </div>
          ))}
        </div>
        <div className="facts">
          <div><b>{activeDays}/7</b><span>ngày học</span></div>
          <div><b>{weekReviews}</b><span>lượt ôn</span></div>
          <div><b>{weekWords}</b><span>từ mới</span></div>
        </div>
        <p className="muted small heat-title">5 tuần gần đây · Last 5 weeks</p>
        <div className="heat" aria-hidden="true">
          {grid.map((n, i) => <i key={i} className={n === null ? 'future' : ''} style={n ? { opacity: 0.3 + 0.7 * (n / peak) } : undefined} data-on={n ? 1 : 0} />)}
        </div>
        <p className="muted small">Nghỉ một ngày không làm mất chuỗi; nghỉ hai ngày liền thì chuỗi bắt đầu lại.</p>
      </section>

      <section className="card">
        <h2><L vi="Tiến độ ngữ pháp" en="Grammar progress" /></h2>
        <div className="lv-progress">
          <div className="bar"><i style={{ width: `${(gEx / GRAMMAR_EXERCISES.length) * 100}%` }} /></div>
          <span>{gEx}/{GRAMMAR_EXERCISES.length} bài tập</span>
        </div>
        <div className="facts">
          <div><b>{gDone}</b><span>chủ đề đã xong</span></div>
          <div><b>{gStarted - gDone}</b><span>đang học</span></div>
          <div><b>{GRAMMAR.length - gStarted}</b><span>chưa học</span></div>
        </div>
        <p className="muted small">Ngữ pháp được học lần lượt từ bài đầu tiên đến bài cuối, mỗi phiên vài bài tập mới.</p>
      </section>

      <button className="ghost line" onClick={() => setView({ name: 'settings' })}>⚙️ <L vi="Cài đặt, đồng bộ, sao lưu" en="Settings, sync, backup" /></button>
    </main>
  )
}
