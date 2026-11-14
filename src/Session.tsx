import { useEffect, useMemo, useRef, useState } from 'react'
import { Rating, type Grade } from 'ts-fsrs'
import { GRAMMAR, type Exercise, type Kind } from './data/grammar'
import { PHRASES } from './data/phrases'
import { EXERCISES, UNITS } from './data/units'
import type { Level } from './data/vocab'
import { allNotes, mediaUrl, NOTE } from './decks'
import { Gap, Listen, Mcq, Order, Speak, type Answer } from './Exercise'
import { Lesson } from './Grammar'
import { addNewWord, dueTime, getState, grade, newWordsLeft } from './store'
import { sameText, speak, untilText } from './util'
import { Confetti, L, Page } from './ui'
import { Buddy, BuddySays, CHEERS, COMFORTS } from './Buddy'

const EX = new Map(EXERCISES.map((e) => [e.id, e]))
const TOPIC = new Map(UNITS.map((t) => [t.id, t]))
/** Ngữ pháp luôn được học lần lượt từ dễ đến khó. */
const ORDER: Level[] = ['A1', 'A2', 'B1', 'B2']
/** Số mục mới tối đa mỗi phiên: [từ vựng, bài tập ngữ pháp, mẫu câu giao tiếp]. Từ vựng còn bị giới hạn bởi số từ mới mỗi ngày người học chọn. */
const NEW_COUNT: Record<number, [number, number, number]> = { 5: [5, 2, 1], 15: [12, 4, 2], 30: [30, 8, 4] }
const KIND: Record<Kind, string> = { mcq: 'Trắc nghiệm', gap: 'Điền từ', order: 'Sắp xếp câu', listen: 'Nghe chép', speak: 'Nói' }

/** intro = giới thiệu từ mới; lesson = đọc bài (id là mã chủ đề); test = kiểm tra. */
interface Item { id: string; phase: 'intro' | 'lesson' | 'test' }
interface Vocab { id: string; word: string; vi: string; ex: string; deck: string; img?: string; audio?: string }

/** Thẻ từ vựng người dùng nhập từ Anki; nếu câu ví dụ có chứa từ thì đánh dấu để đục lỗ. */
function vocab(id: string): Vocab | undefined {
  const n = NOTE.get(id)
  if (!n) return undefined
  const i = n.example.toLowerCase().indexOf(n.word.toLowerCase())
  const ex = i >= 0 ? `${n.example.slice(0, i)}{${n.example.slice(i, i + n.word.length)}}${n.example.slice(i + n.word.length)}` : n.example
  return { id, word: n.word, vi: n.meaning, ex, deck: n.deck, img: n.img, audio: n.audio }
}
export const known = (id: string) => EX.has(id) || NOTE.has(id)

function Pic({ v, sm }: { v: Vocab; sm?: boolean }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let live = true
    setUrl(null)
    if (v.img) mediaUrl(v.deck, v.img).then((u) => { if (live) setUrl(u) })
    return () => { live = false }
  }, [v.img, v.deck])
  if (v.img && url) return <img className={`photo${sm ? ' sm' : ''}`} src={url} alt="" />
  return sm || v.img ? null : <div className="picture" aria-hidden="true">📖</div>
}
async function say(v: Vocab) {
  const url = v.audio ? await mediaUrl(v.deck, v.audio) : null
  if (url) new Audio(url).play().catch(() => speak(v.word))
  else speak(v.word)
}

export function countDue(): number {
  const now = Date.now()
  return Object.entries(getState().cards).filter(([id, r]) => known(id) && dueTime(r) <= now).length
}
export function countNew(): number {
  const c = getState().cards
  return EXERCISES.filter((e) => !c[e.id]).length + allNotes().filter((n) => !c[n.id]).length
}

function buildQueue(minutes: number): Item[] {
  const s = getState()
  const now = Date.now()
  const due: Item[] = Object.entries(s.cards)
    .filter(([id, r]) => known(id) && dueTime(r) <= now)
    .sort((a, b) => dueTime(a[1]) - dueTime(b[1]))
    .map(([id]) => ({ id, phase: 'test' }))
  const [cap, ng, np] = NEW_COUNT[minutes] ?? [12, 4, 2]
  const nw = Math.min(cap, newWordsLeft())
  // Từ mới lấy từ các bộ thẻ đã nhập, theo đúng thứ tự trong bộ thẻ.
  const words = allNotes().filter((n) => !s.cards[n.id]).slice(0, nw).map((n): Item => ({ id: n.id, phase: 'intro' }))
  // Bài tập mới: ngữ pháp và mẫu câu theo thứ tự. Chủ đề chưa học lần nào thì cho đọc bài trước.
  const fresh = [
    ...ORDER.flatMap((lv) => GRAMMAR.filter((t) => t.level === lv)).flatMap((t) => t.exercises).filter((e) => !s.cards[e.id]).slice(0, ng),
    ...PHRASES.flatMap((t) => t.exercises).filter((e) => !s.cards[e.id]).slice(0, np),
  ]
  const units: Item[] = []
  const taught = new Set<string>()
  for (const e of fresh) {
    const started = TOPIC.get(e.topic)!.exercises.some((x) => s.cards[x.id])
    if (!started && !taught.has(e.topic)) { taught.add(e.topic); units.push({ id: e.topic, phase: 'lesson' }) }
    units.push({ id: e.id, phase: 'test' })
  }
  // Học xen kẽ: cứ hai từ mới thì chen một bài tập (bài đọc luôn đi liền trước bài tập đầu tiên của nó).
  const mixed: Item[] = []
  while (words.length || units.length) {
    mixed.push(...words.splice(0, 2))
    if (units.length) {
      const g = units.shift()!
      mixed.push(g)
      if (g.phase === 'lesson' && units.length) mixed.push(units.shift()!)
    }
  }
  return [...due, ...mixed]
}

const cloze = (ex: string) => ex.replace(/\{[^}]+\}/, '_____')
const plain = (ex: string) => ex.replace(/[{}]/g, '')
const formIn = (ex: string) => ex.match(/\{([^}]+)\}/)?.[1] ?? ''
/** Điền đáp án vào các chỗ trống của câu hỏi (đáp án kiểu "Have / eaten" điền lần lượt từng phần). */
function fill(q: string, answer: string): string {
  const parts = answer.split(' / ')
  let i = 0
  return q.replace(/___/g, () => parts[Math.min(i++, parts.length - 1)])
}
/** Câu đúng hoàn chỉnh của một bài tập, để hiện và đọc lên sau khi trả lời. */
function solution(ex: Exercise): string {
  if (ex.kind === 'mcq') return fill(ex.q, ex.opts[ex.a])
  if (ex.kind === 'gap') return ex.q.replace(/\s*\([^)]*\)/g, '').replace(/___/, ex.answers[0])
  return ex.q
}

export function Session({ minutes, onExit }: { minutes: number; onExit: () => void }) {
  const initial = useMemo(() => buildQueue(minutes), [minutes])
  const [queue, setQueue] = useState(initial)
  const [start] = useState(() => Date.now())
  const [done, setDone] = useState(0)
  const [input, setInput] = useState('')
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [last, setLast] = useState('')
  const [finished, setFinished] = useState(initial.length === 0)
  const [combo, setCombo] = useState(0)
  const [right, setRight] = useState(0)
  const [fresh, setFresh] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const item = queue[0]
  const lesson = item?.phase === 'lesson' ? TOPIC.get(item.id) : undefined
  const word = item && item.phase !== 'lesson' ? vocab(item.id) : undefined
  const ex = item?.phase === 'test' ? EX.get(item.id) : undefined
  const checked = answer !== null
  const correct = !!answer?.ok
  useEffect(() => { if (!checked) inputRef.current?.focus() }, [item, checked])

  function advance(requeue?: Item) {
    const rest = queue.slice(1)
    if (requeue) rest.splice(Math.min(rest.length, 3), 0, requeue)
    setInput(''); setAnswer(null)
    const timeUp = Date.now() - start > minutes * 60_000
    // Hết giờ thì dừng, nhưng không dừng ngay sau khi vừa đọc bài hay vừa xem từ mới.
    if (rest.length === 0 || (timeUp && !requeue && item.phase === 'test')) setFinished(true)
    setQueue(rest)
  }
  function rate(g: Grade) {
    const due = grade(item.id, g)
    setDone((n) => n + 1)
    const good = correct || g >= Rating.Good
    setCombo((c) => (good ? c + 1 : 0))
    if (good) setRight((n) => n + 1)
    setLast(`Thẻ vừa rồi sẽ quay lại sau ${untilText(due)}`)
    // Thẻ đang học (hẹn lại trong vòng 10 phút) được hỏi lại ngay trong phiên.
    const soon = due.getTime() - Date.now() < 10 * 60_000
    advance(soon ? { id: item.id, phase: 'test' } : undefined)
  }

  if (finished || !item || (!lesson && !word && !ex)) {
    return (
      <Page title={<L vi="Xong phiên học" en="Session complete" />}>
        {done > 0 && <Confetti />}
        <section className="card center finish">
          <div className="trophy"><Buddy mood={done > 0 ? 'cheer' : 'sleep'} size={132} /></div>
          <h2>{done > 0 ? <L vi="Làm tốt lắm!" en="Well done!" /> : <L vi="Hôm nay nhẹ nhàng" en="All caught up" />}</h2>
          <div className="stats">
            <div className="chip c1"><b>{done}</b><L vi="lượt ôn" en="reviews" /></div>
            <div className="chip c2"><b>{done ? Math.round((right / done) * 100) : 0}%</b><L vi="chính xác" en="accuracy" /></div>
            <div className="chip c3"><b>{fresh}</b><L vi="từ mới" en="new words" /></div>
          </div>
          <p className="muted">
            {done === 0
              ? 'Chưa có thẻ nào đến hạn và bạn đã học hết nội dung mới. · Nothing is due right now.'
              : `Còn ${countDue()} thẻ đến hạn. Nghỉ cũng được — thẻ sẽ chờ bạn, không bị phạt.`}
          </p>
          <button className="primary" onClick={onExit}><L vi="Về trang chính" en="Home" /></button>
        </section>
      </Page>
    )
  }

  const elapsed = Math.min(1, (Date.now() - start) / (minutes * 60_000))
  const key = `${item.id}-${item.phase}-${done}`
  const cheer = CHEERS[done % CHEERS.length], comfort = COMFORTS[done % COMFORTS.length]
  const unit = ex ? TOPIC.get(ex.topic)! : undefined
  const View = ex ? { mcq: Mcq, gap: Gap, order: Order, listen: Listen, speak: Speak }[ex.kind] : null

  return (
    <Page title={<L vi={`Phiên ${minutes} phút`} en={`${minutes}-minute session`} />} onBack={onExit}>
      <div className="bar"><i style={{ width: `${elapsed * 100}%` }} /></div>
      <p className="muted small status">
        <span>{last || `Còn ${queue.length} mục trong hàng đợi · ${queue.length} queued`}</span>
        {combo >= 2 && <span className="combo" key={combo}>🔥 {combo} đúng liên tiếp</span>}
      </p>

      {lesson && (
        <section className="card slide lesson" key={key}>
          <span className="tag write">{lesson.domain ? '💬 Mẫu câu mới · New phrases' : '📘 Ngữ pháp mới · New grammar'} · {lesson.level}</span>
          <Lesson t={lesson} />
          <button className="primary" onClick={() => advance()}><L vi="Đã hiểu, làm bài tập" en="Got it, let me practise" /></button>
        </section>
      )}

      {word && item.phase === 'intro' && (
        <section className="card slide intro" key={key}>
          <span className="tag new">✨ Từ mới · New word</span>
          <Pic v={word} />
          <h2 className="word">{word.word} <button className="ghost" onClick={() => say(word)} aria-label="Nghe · Listen">🔊</button></h2>
          <p>{word.vi}</p>
          {word.ex && <p className="example">{plain(word.ex)} <button className="ghost" onClick={() => speak(plain(word.ex))} aria-label="Nghe câu · Listen">🔊</button></p>}
          <button className="primary" onClick={() => { setFresh((n) => n + 1); addNewWord(); advance({ id: item.id, phase: 'test' }) }}>
            <L vi="Đã hiểu, lát nữa hỏi lại" en="Got it, test me soon" />
          </button>
        </section>
      )}

      {word && item.phase === 'test' && (
        <section className="card slide" key={key}>
          <span className="tag vocab">📚 Từ vựng · Vocabulary</span>
          <Pic v={word} sm />
          <p className="prompt">{word.vi}</p>
          {word.ex && <p className="example">{checked ? plain(word.ex) : cloze(word.ex)}</p>}
          <form onSubmit={(e) => {
            e.preventDefault()
            if (!checked) setAnswer({ ok: sameText(input, word.word) || (!!formIn(word.ex) && sameText(input, formIn(word.ex))), given: input })
          }}>
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} disabled={checked}
              placeholder="Gõ từ tiếng Anh · Type the English word" autoCapitalize="none" autoComplete="off" spellCheck={false} />
            {!checked && <button className="primary"><L vi="Kiểm tra" en="Check" /></button>}
          </form>
        </section>
      )}

      {ex && unit && View && (
        <section className="card slide exercise" key={key} data-ex={ex.id} data-kind={ex.kind}>
          <span className="tag write">{unit.domain ? '💬' : '📘'} {unit.vi} · {KIND[ex.kind]}</span>
          <View ex={ex} done={checked} onAnswer={setAnswer} level={unit.level} />
        </section>
      )}

      {checked && (
        <section className={`card result ${correct ? 'ok bounce' : 'bad shake'}`}>
          {correct ? <BuddySays mood="cheer" en={cheer[0]} vi={cheer[1]} /> : <BuddySays mood="sad" en={comfort[0]} vi={comfort[1]} />}
          <p className="verdict">{correct ? '✓ Chính xác · Correct' : '✗ Chưa đúng · Not quite'}</p>
          {word && !correct && (
            <p className="answer">{word.word} <button className="ghost" onClick={() => say(word)} aria-label="Nghe · Listen">🔊</button></p>
          )}
          {ex && (
            <>
              {ex.kind === 'speak' && answer.given && <p className="muted small">App nghe được: “{answer.given}”</p>}
              <p className="answer">{solution(ex)} <button className="ghost" onClick={() => speak(solution(ex))} aria-label="Nghe · Listen">🔊</button></p>
              {(ex.why || ex.vi) && <p className="why">{ex.why || ex.vi}</p>}
            </>
          )}
          <div className="grades">
            {correct ? (
              <>
                <button onClick={() => rate(Rating.Hard)}><L vi="Khó" en="Hard" /></button>
                <button className="primary" autoFocus onClick={() => rate(Rating.Good)}><L vi="Được" en="Good" /></button>
                <button onClick={() => rate(Rating.Easy)}><L vi="Dễ" en="Easy" /></button>
              </>
            ) : (
              <>
                <button className="primary" autoFocus onClick={() => rate(Rating.Again)}><L vi="Học lại" en="Again" /></button>
                {(word || (ex && ex.kind !== 'mcq')) && <button onClick={() => rate(Rating.Hard)}><L vi={word ? 'Gõ nhầm' : 'Gần đúng'} en={word ? 'Typo' : 'Close'} /></button>}
              </>
            )}
          </div>
        </section>
      )}
    </Page>
  )
}
