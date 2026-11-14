import { useEffect, useMemo, useRef, useState } from 'react'
import { Rating, type Grade } from 'ts-fsrs'
import { GRAMMAR, type Exercise, type Kind } from './data/grammar'
import { EXERCISES } from './data/units'
import type { Level } from './data/vocab'
import { allNotes, mediaUrl, NOTE } from './decks'
import { Gap, Mcq, Order, type Answer } from './Exercise'
import { Lesson } from './Grammar'
import { Memo } from './Memo'
import { addNewWord, dueTime, getState, grade, LEECH, newWordsLeft } from './store'
import { sameText, speak, untilText } from './util'
import { baseId, hintText, isRecId, readyToPromote, recId, vocab, type Vocab } from './vocab'
import { Confetti, L, Page } from './ui'
import { Buddy, BuddySays, CHEERS, COMFORTS } from './Buddy'

const EX = new Map(EXERCISES.map((e) => [e.id, e]))
const TOPIC = new Map(GRAMMAR.map((t) => [t.id, t]))
/** Ngữ pháp luôn được học lần lượt từ dễ đến khó. */
const ORDER: Level[] = ['A1', 'A2', 'B1', 'B2']
/** Mỗi phiên chỉ học một loại nội dung: từ vựng hoặc ngữ pháp. */
export type Mode = 'vocab' | 'grammar'
export const MODE_NAME: Record<Mode, [string, string]> = { vocab: ['Từ vựng', 'Vocabulary'], grammar: ['Ngữ pháp', 'Grammar'] }
const modeOf = (id: string): Mode => (id.startsWith('g:') ? 'grammar' : 'vocab')
/** Số mục mới tối đa mỗi phiên theo thời lượng. Từ vựng còn bị giới hạn bởi số từ mới mỗi ngày người học chọn. */
const NEW_COUNT: Record<Mode, Record<number, number>> = {
  vocab: { 5: 5, 15: 12, 30: 30 }, grammar: { 5: 4, 15: 8, 30: 16 },
}
/** Số thẻ đến hạn tối đa được ôn trong một phiên, để phiên không bị quá dài sau nhiều ngày nghỉ. */
export const REVIEW_CAP: Record<number, number> = { 5: 25, 15: 70, 30: 150 }
/** Khi số thẻ từ vựng tồn vượt mức này, tạm dừng từ mới cho đến khi ôn bớt. */
export const backlogLimit = () => Math.max(40, getState().dailyNew * 4)
const KIND: Record<Kind, string> = { mcq: 'Trắc nghiệm', gap: 'Điền từ', order: 'Sắp xếp câu', pick: 'Chọn câu đúng' }

/**
 * intro = giới thiệu từ mới; test = kiểm tra; lesson = đọc bài (id là mã chủ đề);
 * choice = hỏi đọc bài hay kiểm tra nhanh (id là mã chủ đề); verdict = kết quả kiểm tra nhanh (id là mã chủ đề).
 * probe = câu hỏi thuộc phần kiểm tra nhanh.
 */
interface Item { id: string; phase: 'intro' | 'lesson' | 'test' | 'choice' | 'verdict'; probe?: boolean }
const PROBES = 3

export const known = (id: string) => EX.has(id) || NOTE.has(baseId(id))

function Pic({ v }: { v: Vocab }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let live = true
    setUrl(null)
    if (v.img) mediaUrl(v.deck, v.img).then((u) => { if (live) setUrl(u) })
    return () => { live = false }
  }, [v.img, v.deck])
  if (v.img) return <div className="photo">{url && <img src={url} alt="" />}</div>
  return <div className="picture" aria-hidden="true">📖</div>
}
export async function say(v: Vocab) {
  const url = v.audio ? await mediaUrl(v.deck, v.audio) : null
  if (url) new Audio(url).play().catch(() => speak(v.word))
  else speak(v.word)
}

export function countDue(mode?: Mode): number {
  const now = Date.now()
  return Object.entries(getState().cards).filter(([id, r]) => known(id) && (!mode || modeOf(id) === mode) && dueTime(r) <= now).length
}

function buildQueue(mode: Mode, minutes: number): Item[] {
  const s = getState()
  const now = Date.now()
  const dueAll: Item[] = Object.entries(s.cards)
    .filter(([id, r]) => known(id) && modeOf(id) === mode && dueTime(r) <= now)
    .sort((a, b) => dueTime(a[1]) - dueTime(b[1]))
    .map(([id]) => ({ id, phase: 'test' }))
  const due = dueAll.slice(0, REVIEW_CAP[minutes] ?? 70)
  const cap = NEW_COUNT[mode][minutes] ?? 8
  if (mode === 'vocab') {
    const notes = allNotes()
    // Bước 2: từ đã nhận diện vững thì mở thẻ tự viết (không tính là từ mới).
    const promote = notes.filter((n) => readyToPromote(n.id, s.cards)).slice(0, cap).map((n): Item => ({ id: n.id, phase: 'test' }))
    // Bước 1: từ mới theo đúng thứ tự trong bộ thẻ, không vượt quá số từ mới mỗi ngày; tạm dừng khi thẻ tồn quá nhiều.
    const paused = dueAll.length > backlogLimit()
    const fresh = paused ? [] : notes.filter((n) => !s.cards[n.id] && !s.cards[recId(n.id)]).slice(0, Math.min(cap, newWordsLeft()))
    return [...due, ...promote, ...fresh.map((n): Item => ({ id: n.id, phase: 'intro' }))]
  }
  return [...due, ...grammarNew(cap)]
}

/** Bài tập ngữ pháp mới theo thứ tự chủ đề; chủ đề chưa học lần nào thì hỏi đọc bài hay kiểm tra nhanh trước. */
function grammarNew(cap: number, skip: Set<string> = new Set()): Item[] {
  const s = getState()
  const topics = ORDER.flatMap((lv) => GRAMMAR.filter((t) => t.level === lv))
  const fresh = topics.flatMap((t) => t.exercises).filter((e) => !s.cards[e.id] && !skip.has(e.id)).slice(0, cap)
  const out: Item[] = []
  const taught = new Set<string>()
  for (const e of fresh) {
    const started = TOPIC.get(e.topic)!.exercises.some((x) => s.cards[x.id])
    if (!started && !taught.has(e.topic)) { taught.add(e.topic); out.push({ id: e.topic, phase: 'choice' }) }
    out.push({ id: e.id, phase: 'test' })
  }
  return out
}

const cloze = (ex: string) => ex.replace(/\{[^}]+\}/g, '_____')
const plain = (ex: string) => ex.replace(/[{}]/g, '')
/** Câu ví dụ nhiều phần (định nghĩa → câu mẫu) được tách thành từng dòng. */
const lines = (ex: string) => ex.split('→').map((t) => t.trim()).filter(Boolean)
/** Điền đáp án vào các chỗ trống của câu hỏi (đáp án kiểu "Have / eaten" điền lần lượt từng phần). */
function fill(q: string, answer: string): string {
  const parts = answer.split(' / ')
  let i = 0
  return q.replace(/___/g, () => parts[Math.min(i++, parts.length - 1)])
}
/** Câu đúng hoàn chỉnh của một bài tập, để hiện và đọc lên sau khi trả lời. */
export function solution(ex: Exercise): string {
  if (ex.kind === 'pick') return ex.opts[ex.a]
  if (ex.kind === 'mcq') return fill(ex.q, ex.opts[ex.a])
  if (ex.kind === 'gap') return ex.q.replace(/\s*\([^)]*\)/g, '').replace(/___/, ex.answers[0])
  return ex.q
}

/** Một dòng trong danh sách "cần xem lại" cuối phiên. */
function MissRow({ id }: { id: string }) {
  const w = vocab(id)
  if (w) {
    return (
      <button className="miss-row" onClick={() => say(w)}>
        <b>{w.word}</b><span>{w.vi}</span><i>🔊</i>
      </button>
    )
  }
  const ex = EX.get(id)
  if (!ex) return null
  return (
    <button className="miss-row" onClick={() => speak(solution(ex))}>
      <b>{solution(ex)}</b><span>{TOPIC.get(ex.topic)?.vi}</span><i>🔊</i>
    </button>
  )
}

export function Session({ mode, minutes, onExit }: { mode: Mode; minutes: number; onExit: () => void }) {
  const initial = useMemo(() => buildQueue(mode, minutes), [mode, minutes])
  const [queue, setQueue] = useState(initial)
  const [start] = useState(() => Date.now())
  const [done, setDone] = useState(0)
  const [input, setInput] = useState('')
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [hints, setHints] = useState(0)
  const [last, setLast] = useState('')
  const [finished, setFinished] = useState(initial.length === 0)
  const [combo, setCombo] = useState(0)
  const [right, setRight] = useState(0)
  const [fresh, setFresh] = useState(0)
  const [misses, setMisses] = useState<string[]>([])
  const [probe, setProbe] = useState<Record<string, boolean[]>>({})
  const [peek, setPeek] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const item = queue[0]
  const lesson = item?.phase === 'lesson' ? TOPIC.get(item.id) : undefined
  const topicCard = item && (item.phase === 'choice' || item.phase === 'verdict') ? TOPIC.get(item.id) : undefined
  const word = item && (item.phase === 'intro' || item.phase === 'test') ? vocab(item.id) : undefined
  const isRec = !!item && isRecId(item.id)
  const ex = item?.phase === 'test' ? EX.get(item.id) : undefined
  const rec = item ? getState().cards[item.id] : undefined
  const leech = !!rec && rec.c.lapses >= LEECH
  const checked = answer !== null
  const correct = !!answer?.ok
  useEffect(() => { if (!checked) inputRef.current?.focus() }, [item, checked])

  function advance(requeue?: Item) {
    const rest = queue.slice(1)
    if (requeue) rest.splice(Math.min(rest.length, 3), 0, requeue)
    setInput(''); setAnswer(null); setRevealed(false); setHints(0)
    const timeUp = Date.now() - start > minutes * 60_000
    // Hết giờ thì dừng, nhưng không dừng ngay sau khi vừa đọc bài hay vừa xem từ mới.
    if (rest.length === 0 || (timeUp && !requeue && item.phase === 'test')) setFinished(true)
    setQueue(rest)
  }
  /** Chọn cách bắt đầu một chủ đề mới: đọc bài, hoặc làm 3 câu kiểm tra nhanh. */
  function startTopic(read: boolean) {
    const t = TOPIC.get(item.id)!
    if (read) { setQueue([{ id: t.id, phase: 'lesson' }, ...queue.slice(1)]); return }
    const s = getState()
    const unseen = t.exercises.filter((e) => !s.cards[e.id])
    // Ưu tiên mỗi dạng một câu: trắc nghiệm, điền từ, chọn câu đúng / sắp xếp.
    const picks: Exercise[] = []
    for (const k of ['mcq', 'gap', 'pick', 'order'] as Kind[]) { const e = unseen.find((x) => x.kind === k && !picks.includes(x)); if (e && picks.length < PROBES) picks.push(e) }
    for (const e of unseen) if (picks.length < PROBES && !picks.includes(e)) picks.push(e)
    const rest = queue.slice(1).filter((x) => !picks.some((p) => p.id === x.id))
    setProbe((m) => ({ ...m, [t.id]: [] }))
    setQueue([...picks.map((e): Item => ({ id: e.id, phase: 'test', probe: true })), { id: t.id, phase: 'verdict' }, ...rest])
  }
  /** Sau kiểm tra nhanh: đúng hết thì đánh dấu đã nắm cả chủ đề (ôn thưa), sai thì vào bài học. */
  function finishProbe(mastered: boolean) {
    const t = TOPIC.get(item.id)!
    if (mastered) {
      const s = getState()
      for (const e of t.exercises) if (!s.cards[e.id]) grade(e.id, Rating.Easy, false)
      const before = queue.slice(1)
      const rest = before.filter((x) => !x.id.startsWith(`g:${t.id}:`) || x.phase !== 'test' || getState().cards[x.id]?.c.reps !== 1)
      // Bù số bài vừa bỏ qua bằng bài của chủ đề kế tiếp, để phiên không kết thúc quá sớm.
      const more = grammarNew(Math.max(1, before.length - rest.length), new Set(rest.map((x) => x.id)))
      const next = [...rest, ...more]
      if (next.length === 0) setFinished(true)
      setQueue(next)
    } else setQueue([{ id: t.id, phase: 'lesson' }, ...queue.slice(1)])
  }
  function rate(g: Grade) {
    if (item.probe) setProbe((m) => ({ ...m, [EX.get(item.id)!.topic]: [...(m[EX.get(item.id)!.topic] ?? []), correct] }))
    if (mode !== 'vocab' && !getState().cards[item.id]) setFresh((n) => n + 1)
    const ok = isRec ? g > Rating.Again : correct
    const due = grade(item.id, g)
    setDone((n) => n + 1)
    setCombo((c) => (ok ? c + 1 : 0))
    if (ok) setRight((n) => n + 1)
    else setMisses((m) => (m.includes(baseId(item.id)) ? m : [...m, baseId(item.id)]))
    setLast(`Thẻ vừa rồi sẽ quay lại sau ${untilText(due)}`)
    // Thẻ đang học (hẹn lại trong vòng 10 phút) được hỏi lại ngay trong phiên.
    const soon = due.getTime() - Date.now() < 10 * 60_000
    advance(soon ? { id: item.id, phase: 'test' } : undefined)
  }

  if (finished || !item || (!lesson && !topicCard && !word && !ex)) {
    const left = countDue(mode)
    return (
      <Page title={<L vi="Xong phiên học" en="Session complete" />}>
        {done > 0 && <Confetti />}
        <section className="card center finish">
          <div className="trophy"><Buddy mood={done > 0 ? 'cheer' : 'sleep'} size={132} /></div>
          <h2>{done > 0 ? <L vi="Làm tốt lắm!" en="Well done!" /> : <L vi="Hôm nay nhẹ nhàng" en="All caught up" />}</h2>
          <div className="stats">
            <div className="chip c1"><b>{done}</b><L vi="lượt ôn" en="reviews" /></div>
            <div className="chip c2"><b>{done ? Math.round((right / done) * 100) : 0}%</b><L vi="chính xác" en="accuracy" /></div>
            <div className="chip c3"><b>{fresh}</b>{mode === 'vocab' ? <L vi="từ mới" en="new words" /> : <L vi="bài mới" en="new items" />}</div>
          </div>
          <p className="muted">
            {done === 0
              ? mode === 'vocab' ? 'Không có từ nào đến hạn, và bạn đã học đủ số từ mới của hôm nay (hoặc chưa nhập bộ thẻ nào).' : 'Chưa có thẻ nào đến hạn và bạn đã học hết nội dung mới.'
              : left > 0 ? `Còn ${left} thẻ ${MODE_NAME[mode][0].toLowerCase()} đến hạn. Nghỉ cũng được — thẻ sẽ chờ bạn, không bị phạt.`
              : 'Bạn đã ôn hết các thẻ đến hạn.'}
          </p>
          <button className="primary" onClick={onExit}><L vi="Về trang chính" en="Home" /></button>
        </section>
        {misses.length > 0 && (
          <section className="card">
            <h2><L vi={`Cần xem lại (${misses.length})`} en="Review these" /></h2>
            <p className="muted small">Những mục bạn trả lời sai trong phiên này. Nhìn lại một lần trước khi nghỉ giúp nhớ lâu hơn.</p>
            <div className="miss-list">{misses.map((id) => <MissRow key={id} id={id} />)}</div>
          </section>
        )}
      </Page>
    )
  }

  const elapsed = Math.min(1, (Date.now() - start) / (minutes * 60_000))
  const key = `${item.id}-${item.phase}-${done}`
  const cheer = CHEERS[done % CHEERS.length], comfort = COMFORTS[done % COMFORTS.length]
  const unit = ex ? TOPIC.get(ex.topic)! : undefined
  const View = ex ? { mcq: Mcq, gap: Gap, order: Order, pick: Mcq }[ex.kind] : null
  const leechTag = leech ? ' · ⚠️ Từ khó' : ''

  return (
    <Page title={<L vi={`${MODE_NAME[mode][0]} · ${minutes} phút`} en={`${MODE_NAME[mode][1]} · ${minutes} min`} />} onBack={onExit}>
      <div className="bar"><i style={{ width: `${elapsed * 100}%` }} /></div>
      <p className="muted small status">
        <span>{last || `Còn ${queue.length} mục trong hàng đợi · ${queue.length} queued`}</span>
        {combo >= 2 && <span className="combo" key={combo}>🔥 {combo} đúng liên tiếp</span>}
      </p>

      {topicCard && item.phase === 'choice' && (
        <section className="card slide topic-card" key={key}>
          <span className="tag write">📘 Chủ đề mới · New topic · {topicCard.level}</span>
          <h2 className="lesson-title">{topicCard.vi}<small>{topicCard.en}</small></h2>
          {topicCard.formula && <p className="formula">{topicCard.formula}</p>}
          <BuddySays mood="think" size={70} en="Already know it?" vi="Nếu đã chắc chủ đề này, làm 3 câu kiểm tra nhanh để bỏ qua phần học." />
          <div className="choice">
            <button className="primary" onClick={() => startTopic(false)}>⚡ <L vi="Kiểm tra nhanh 3 câu" en="Quick check" /></button>
            <button onClick={() => startTopic(true)}>📖 <L vi="Đọc bài trước" en="Read the lesson first" /></button>
          </div>
        </section>
      )}

      {topicCard && item.phase === 'verdict' && (() => {
        const res = probe[topicCard.id] ?? []
        const ok = res.filter(Boolean).length
        const mastered = res.length > 0 && ok === res.length
        return (
          <section className="card slide topic-card center" key={key}>
            <Buddy mood={mastered ? 'cheer' : 'think'} size={110} />
            <h2>{mastered ? 'Bạn đã nắm chủ đề này!' : `Đúng ${ok}/${res.length} câu`}</h2>
            <p className="muted">
              {mastered
                ? `"${topicCard.vi}" được đánh dấu đã nắm. Các bài tập của chủ đề này sẽ chỉ quay lại thưa thớt để giữ trí nhớ.`
                : `Cùng đọc bài "${topicCard.vi}" rồi làm tiếp các bài tập nhé.`}
            </p>
            <button className="primary" onClick={() => finishProbe(mastered)}>
              {mastered ? <L vi="Tiếp tục" en="Continue" /> : <L vi="Đọc bài" en="Read the lesson" />}
            </button>
          </section>
        )
      })()}

      {lesson && (
        <section className="card slide lesson" key={key}>
          <span className="tag write">📘 Ngữ pháp mới · New grammar</span>
          <Lesson t={lesson} />
          <button className="primary" onClick={() => advance()}><L vi="Đã hiểu, làm bài tập" en="Got it, let me practise" /></button>
        </section>
      )}

      {word && item.phase === 'intro' && (
        <section className="card slide intro" key={key}>
          <span className="tag new">✨ Từ mới · New word</span>
          <Pic v={word} />
          <h2 className="word">{word.word} <button className="ghost" onClick={() => say(word)} aria-label="Nghe · Listen">🔊</button></h2>
          <p className="meaning">{word.vi}</p>
          {lines(plain(word.ex)).map((t, i) => (
            <p key={i} className="example">{t} <button className="ghost" onClick={() => speak(t)} aria-label="Nghe câu · Listen">🔊</button></p>
          ))}
          <Memo id={word.id} />
          <button className="primary" onClick={() => { setFresh((n) => n + 1); addNewWord(); advance({ id: recId(item.id), phase: 'test' }) }}>
            <L vi="Đã hiểu, lát nữa hỏi lại" en="Got it, test me soon" />
          </button>
        </section>
      )}

      {/* Thẻ nhận diện: thấy từ, nhớ ra nghĩa, tự chấm */}
      {word && isRec && (
        <section className="card slide vocab-test" key={key}>
          <span className="tag vocab">👀 Nhớ nghĩa · Recall the meaning{leechTag}</span>
          <Pic v={word} />
          <h2 className="word">{word.word} <button className="ghost" onClick={() => say(word)} aria-label="Nghe · Listen">🔊</button></h2>
          {lines(plain(word.ex)).map((t, i) => <p key={i} className="example">{t}</p>)}
          {!revealed ? (
            <button className="primary reveal-btn" onClick={() => setRevealed(true)}><L vi="Hiện nghĩa" en="Show meaning" /></button>
          ) : (
            <>
              <p className="meaning revealed">{word.vi}</p>
              <Memo id={word.id} open={leech} />
              <p className="muted small">Bạn có nhớ ra nghĩa trước khi bấm không?</p>
              <div className="grades four">
                <button onClick={() => rate(Rating.Again)}><L vi="Quên" en="Forgot" /></button>
                <button onClick={() => rate(Rating.Hard)}><L vi="Khó" en="Hard" /></button>
                <button className="primary" autoFocus onClick={() => rate(Rating.Good)}><L vi="Nhớ" en="Good" /></button>
                <button onClick={() => rate(Rating.Easy)}><L vi="Dễ" en="Easy" /></button>
              </div>
            </>
          )}
        </section>
      )}

      {/* Thẻ tự viết: thấy nghĩa, gõ từ tiếng Anh, có gợi ý từng bước */}
      {word && !isRec && item.phase === 'test' && (
        <section className="card slide vocab-test" key={key}>
          <span className="tag vocab">✍️ Tự viết từ · Write the word{leechTag}</span>
          <Pic v={word} />
          {checked && <h2 className="word">{word.word} <button className="ghost" onClick={() => say(word)} aria-label="Nghe · Listen">🔊</button></h2>}
          <p className="meaning">{word.vi}</p>
          {lines(checked ? plain(word.ex) : cloze(word.ex)).map((t, i) => <p key={i} className="example">{t}</p>)}
          {!checked && hints > 0 && <p className="hint" aria-label="Gợi ý">{hintText(word.word, hints)}</p>}
          <form onSubmit={(e) => {
            e.preventDefault()
            if (!checked && input.trim()) setAnswer({ ok: sameText(input, word.word) || word.forms.some((f) => sameText(input, f)), given: input })
          }}>
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} disabled={checked}
              placeholder="Gõ từ tiếng Anh · Type the English word" autoCapitalize="none" autoComplete="off" spellCheck={false} />
            {!checked && (
              <div className="grades">
                <button type="button" disabled={hints >= 3} onClick={() => { setHints((h) => h + 1); inputRef.current?.focus() }}>
                  💡 <L vi={hints ? `Gợi ý thêm (${hints}/3)` : 'Gợi ý'} en="Hint" />
                </button>
                <button className="primary" disabled={!input.trim()}><L vi="Kiểm tra" en="Check" /></button>
              </div>
            )}
          </form>
          {!checked && <button className="ghost line" onClick={() => setAnswer({ ok: false, given: '' })}>Tôi không nhớ · I don't know</button>}
        </section>
      )}

      {ex && unit && View && (
        <section className="card slide exercise" key={key} data-ex={ex.id} data-kind={ex.kind}>
          <span className="tag write">{item.probe ? '⚡ Kiểm tra nhanh · ' : '📘 '}{unit.vi} · {KIND[ex.kind]}</span>
          <View ex={ex} done={checked} onAnswer={setAnswer} />
        </section>
      )}

      {checked && (
        <section className={`card result ${correct ? 'ok bounce' : 'bad shake'}`}>
          {correct ? <BuddySays mood="cheer" en={cheer[0]} vi={cheer[1]} />
            : leech ? <BuddySays mood="think" en="This one is tricky!" vi="Từ này bạn hay quên. Thử viết một mẹo nhớ nhé." />
            : <BuddySays mood="sad" en={comfort[0]} vi={comfort[1]} />}
          <p className="verdict">{correct ? `✓ Chính xác · Correct${hints ? ` (dùng ${hints} gợi ý)` : ''}` : '✗ Chưa đúng · Not quite'}</p>
          {word && !correct && (
            <p className="answer big">{word.word} <button className="ghost" onClick={() => say(word)} aria-label="Nghe · Listen">🔊</button></p>
          )}
          {word && <Memo id={word.id} open={leech && !correct} />}
          {ex && (
            <>
              <p className="answer">{solution(ex)} <button className="ghost" onClick={() => speak(solution(ex))} aria-label="Nghe · Listen">🔊</button></p>
              {(ex.why || ex.vi) && <p className="why">{ex.why || ex.vi}</p>}
              {!correct && !item.probe && unit && (
                <button className="ghost line" onClick={() => setPeek(unit.id)}>📘 Xem lại bài: {unit.vi}</button>
              )}
            </>
          )}
          <div className="grades">
            {correct && hints > 0 ? (
              <>
                <button className="primary" autoFocus onClick={() => rate(Rating.Hard)}><L vi="Khó" en="Hard" /></button>
                <button onClick={() => rate(Rating.Good)}><L vi="Được" en="Good" /></button>
              </>
            ) : correct ? (
              <>
                <button onClick={() => rate(Rating.Hard)}><L vi="Khó" en="Hard" /></button>
                <button className="primary" autoFocus onClick={() => rate(Rating.Good)}><L vi="Được" en="Good" /></button>
                <button onClick={() => rate(Rating.Easy)}><L vi="Dễ" en="Easy" /></button>
              </>
            ) : (
              <>
                <button className="primary" autoFocus onClick={() => rate(Rating.Again)}><L vi="Học lại" en="Again" /></button>
                {((word && answer.given) || (ex && ex.kind !== 'mcq')) && <button onClick={() => rate(Rating.Hard)}><L vi={word ? 'Gõ nhầm' : 'Gần đúng'} en={word ? 'Typo' : 'Close'} /></button>}
              </>
            )}
          </div>
        </section>
      )}

      {peek && TOPIC.get(peek) && (
        <div className="sheet-wrap" onClick={() => setPeek(null)}>
          <section className="card sheet lesson" onClick={(e) => e.stopPropagation()}>
            <button className="ghost close" onClick={() => setPeek(null)} aria-label="Đóng · Close">✕</button>
            <Lesson t={TOPIC.get(peek)!} />
            <button className="primary" onClick={() => setPeek(null)}><L vi="Quay lại bài tập" en="Back to the exercise" /></button>
          </section>
        </div>
      )}
    </Page>
  )
}
