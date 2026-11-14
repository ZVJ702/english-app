import { useEffect, useRef, useState } from 'react'
import { GRAMMAR } from './data/grammar'
import { EXERCISES as GRAMMAR_EXERCISES } from './data/units'
import { Library } from './Grammar'
import { backlogLimit, countDue, known, REVIEW_CAP, Session, type Mode } from './Session'
import { Words } from './Words'
import { leechCount } from './vocab'
import { Decks } from './Decks'
import { useDecks } from './decks'
import { Settings } from './Settings'
import { streaks, syncNow, syncReady, today, useStore } from './store'
import { L, Ring } from './ui'
import { Buddy } from './Buddy'

type View = { name: 'home' } | { name: 'session'; mode: Mode; minutes: number } | { name: 'grammar' } | { name: 'decks' } | { name: 'words' } | { name: 'settings' }

export default function App() {
  const s = useStore()
  const { notes } = useDecks()
  const [view, setView] = useState<View>({ name: 'home' })
  const [minutes, setMinutes] = useState(15)
  // Khi có bản cập nhật mới tải xong: nạp lại ngay nếu đang ở trang chính, còn đang học thì đợi quay về trang chính.
  const updateReady = useRef(false)
  const atHome = useRef(true)
  atHome.current = view.name === 'home'
  const home = () => {
    if (updateReady.current) { location.reload(); return }
    setView({ name: 'home' })
    if (syncReady()) syncNow().catch(() => {})
  }
  useEffect(() => {
    if (syncReady()) syncNow().catch(() => {})
    const sw = navigator.serviceWorker
    if (!sw) return
    const hadController = !!sw.controller
    const onChange = () => {
      if (!hadController) return // lần cài đầu tiên, không phải cập nhật
      if (atHome.current) location.reload()
      else updateReady.current = true
    }
    sw.addEventListener('controllerchange', onChange)
    return () => sw.removeEventListener('controllerchange', onChange)
  }, [])

  if (view.name === 'session') return <Session mode={view.mode} minutes={view.minutes} onExit={home} />
  if (view.name === 'grammar') return <Library onBack={home} />
  if (view.name === 'decks') return <Decks onBack={home} />
  if (view.name === 'words') return <Words onBack={home} />
  if (view.name === 'settings') return <Settings onBack={home} />

  const due = countDue()
  const dueWords = countDue('vocab'), dueGrammar = countDue('grammar')
  const learned = Object.keys(s.cards).filter(known).length
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
  const leeches = leechCount()
  const backlog = dueWords > backlogLimit()
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
            <b>{wordsToday}<small>/{s.dailyNew}</small></b><span>từ mới<br />hôm nay</span>
          </Ring>
          <Ring value={dueWords === 0 && learned > 0 ? 1 : 0} tone="b">
            <b>{dueWords}</b><span>từ<br />cần ôn</span>
          </Ring>
          <Ring value={dueGrammar === 0 && gEx > 0 ? 1 : 0} tone="c">
            <b>{dueGrammar}</b><span>ngữ pháp<br />cần ôn</span>
          </Ring>
        </div>
        <div className="seg" role="group" aria-label="Thời lượng phiên học">
          {[5, 15, 30].map((m) => (
            <button key={m} className={m === minutes ? 'on' : ''} onClick={() => setMinutes(m)}>{m} phút</button>
          ))}
        </div>
        <div className="modes">
          <button className="go vocab" onClick={() => setView({ name: 'session', mode: 'vocab', minutes })}>
            <span>📚</span><b>Học từ vựng</b><small>Vocabulary</small>
          </button>
          <button className="go grammar" onClick={() => setView({ name: 'session', mode: 'grammar', minutes })}>
            <span>📘</span><b>Học ngữ pháp</b><small>Grammar</small>
          </button>
        </div>
        {backlog ? (
          <p className="notice">
            🧭 Bạn có {dueWords} từ đến hạn. Mỗi phiên {minutes} phút sẽ ôn tối đa {REVIEW_CAP[minutes]} từ, thẻ quá hạn lâu nhất trước.
            Từ mới tạm dừng cho đến khi còn dưới {backlogLimit()} từ cần ôn.
          </p>
        ) : (
          <p className="muted small center">Mỗi phiên chỉ học một phần: từ vựng hoặc ngữ pháp, không trộn lẫn.</p>
        )}
      </section>

      <div className="tiles">
        <button className="tile t2" onClick={() => setView({ name: 'grammar' })}><span className="icon">📖</span><b>Bài ngữ pháp</b><small>{GRAMMAR.length} chủ đề</small></button>
        <button className="tile t3" onClick={() => setView({ name: 'words' })}><span className="icon">{leeches ? '⚠️' : '🔤'}</span><b>Từ của tôi</b><small>{leeches ? `${leeches} từ khó` : `${notes.length} từ`}</small></button>
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
