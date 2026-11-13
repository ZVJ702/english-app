import { useEffect, useMemo, useRef, useState } from 'react'
import { Rating, type Grade } from 'ts-fsrs'
import { WORDS, type Level } from './data/vocab'
import { SENTENCES } from './data/writing'
import { dueTime, getState, grade } from './store'
import { copy, missingWords, sameText, speak, untilText } from './util'
import { Confetti, L, Page } from './ui'
import { Buddy, BuddySays, CHEERS, COMFORTS } from './Buddy'
import { photoUrl, pictureFor } from './data/pictures'

const WORD = new Map(WORDS.map((w) => [w.id, w]))
const SENT = new Map(SENTENCES.map((s) => [s.id, s]))
const ORDER: Record<Level, Level[]> = { A2: ['A2', 'B1', 'B2'], B1: ['B1', 'B2', 'A2'], B2: ['B2', 'B1', 'A2'] }
const NEW_COUNT: Record<number, [number, number]> = { 5: [3, 2], 15: [8, 4], 30: [15, 8] }

interface Item { id: string; phase: 'intro' | 'test' }

export function countDue(): number {
  const now = Date.now()
  return Object.entries(getState().cards).filter(([id, r]) => (WORD.has(id) || SENT.has(id)) && dueTime(r) <= now).length
}
export function countNew(): number {
  const c = getState().cards
  return WORDS.filter((w) => !c[w.id]).length + SENTENCES.filter((s) => !c[s.id]).length
}

function buildQueue(minutes: number): Item[] {
  const s = getState()
  const now = Date.now()
  const due: Item[] = Object.entries(s.cards)
    .filter(([id, r]) => (WORD.has(id) || SENT.has(id)) && dueTime(r) <= now)
    .sort((a, b) => dueTime(a[1]) - dueTime(b[1]))
    .map(([id]) => ({ id, phase: 'test' }))
  const order = ORDER[s.level ?? 'B1']
  const byLevel = <T extends { id: string; level: Level }>(list: T[]) =>
    order.flatMap((lv) => list.filter((x) => x.level === lv && !s.cards[x.id]))
  const [nw, ns] = NEW_COUNT[minutes] ?? [8, 4]
  const words = byLevel(WORDS).slice(0, nw).map((w): Item => ({ id: w.id, phase: 'intro' }))
  const sents = byLevel(SENTENCES).slice(0, ns).map((x): Item => ({ id: x.id, phase: 'test' }))
  // Học xen kẽ: cứ hai từ mới thì chen một câu viết.
  const fresh: Item[] = []
  while (words.length || sents.length) {
    fresh.push(...words.splice(0, 2))
    if (sents.length) fresh.push(sents.shift()!)
  }
  return [...due, ...fresh]
}

const cloze = (ex: string) => ex.replace(/\{[^}]+\}/, '_____')
const plain = (ex: string) => ex.replace(/[{}]/g, '')
const formIn = (ex: string) => ex.match(/\{([^}]+)\}/)?.[1] ?? ''

export function Session({ minutes, onExit }: { minutes: number; onExit: () => void }) {
  const initial = useMemo(() => buildQueue(minutes), [minutes])
  const [queue, setQueue] = useState(initial)
  const [start] = useState(() => Date.now())
  const [done, setDone] = useState(0)
  const [input, setInput] = useState('')
  const [checked, setChecked] = useState(false)
  const [last, setLast] = useState('')
  const [finished, setFinished] = useState(initial.length === 0)
  const [copied, setCopied] = useState(false)
  const [combo, setCombo] = useState(0)
  const [right, setRight] = useState(0)
  const [fresh, setFresh] = useState(0)
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null)

  const item = queue[0]
  const word = item && WORD.get(item.id)
  const sent = item && SENT.get(item.id)
  useEffect(() => { if (!checked) inputRef.current?.focus() }, [item, checked])

  function advance(requeue?: Item) {
    const rest = queue.slice(1)
    if (requeue) rest.splice(Math.min(rest.length, 3), 0, requeue)
    setInput(''); setChecked(false); setCopied(false)
    const timeUp = Date.now() - start > minutes * 60_000
    if (rest.length === 0 || (timeUp && !requeue)) setFinished(true)
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

  if (finished || !item) {
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
              ? 'Chưa có thẻ nào đến hạn và bạn đã học hết thẻ mới. · Nothing is due right now.'
              : `Còn ${countDue()} thẻ đến hạn. Nghỉ cũng được — thẻ sẽ chờ bạn, không bị phạt.`}
          </p>
          <button className="primary" onClick={onExit}><L vi="Về trang chính" en="Home" /></button>
        </section>
      </Page>
    )
  }

  const answer = word ? word.word : sent!.answers[0]
  const correct = word
    ? sameText(input, word.word) || sameText(input, formIn(word.ex))
    : sent!.answers.some((a) => sameText(input, a))
  const elapsed = Math.min(1, (Date.now() - start) / (minutes * 60_000))
  const claudePrompt = sent
    ? `Tôi là người Việt đang học tiếng Anh (trình độ ${getState().level ?? 'B1'}). Tôi vừa dịch một câu.\n\nCâu tiếng Việt: ${sent.vi}\nCâu của tôi: ${input}\nĐáp án mẫu: ${sent.answers[0]}\nĐiểm ngữ pháp: ${sent.point}\n\nHãy: 1) cho biết câu của tôi đúng và tự nhiên chưa, 2) liệt kê từng lỗi kèm giải thích ngắn bằng tiếng Việt, 3) viết lại câu đúng, 4) cho thêm 2 câu tương tự để tôi luyện.`
    : ''

  return (
    <Page title={<L vi={`Phiên ${minutes} phút`} en={`${minutes}-minute session`} />} onBack={onExit}>
      <div className="bar"><i style={{ width: `${elapsed * 100}%` }} /></div>
      <p className="muted small status">
        <span>{last || `Còn ${queue.length} thẻ trong hàng đợi · ${queue.length} cards queued`}</span>
        {combo >= 2 && <span className="combo" key={combo}>🔥 {combo} đúng liên tiếp</span>}
      </p>

      {word && item.phase === 'intro' && (
        <section className="card slide intro" key={`${item.id}-${item.phase}-${done}`}>
          <span className="tag new">✨ Từ mới · New word · {word.level}</span>
          {photoUrl(word.word)
            ? <img className="photo" src={photoUrl(word.word)!} alt="" />
            : <div className="picture" aria-hidden="true">{pictureFor(word.word, word.pos)}</div>}
          <h2 className="word">{word.word} <button className="ghost" onClick={() => speak(word.word)} aria-label="Nghe · Listen">🔊</button></h2>
          <p><em>{word.pos}</em> — {word.vi}</p>
          <p className="example">{plain(word.ex)} <button className="ghost" onClick={() => speak(plain(word.ex))} aria-label="Nghe câu · Listen">🔊</button></p>
          <button className="primary" onClick={() => { setFresh((n) => n + 1); advance({ id: item.id, phase: 'test' }) }}>
            <L vi="Đã hiểu, lát nữa hỏi lại" en="Got it, test me soon" />
          </button>
        </section>
      )}

      {word && item.phase === 'test' && (
        <section className="card slide" key={`${item.id}-${item.phase}-${done}`}>
          <span className="tag vocab">📚 Từ vựng · Vocabulary · {word.level}</span>
          {photoUrl(word.word)
            ? <img className="photo sm" src={photoUrl(word.word)!} alt="" />
            : <span className="picture sm" aria-hidden="true">{pictureFor(word.word, word.pos)}</span>}
          <p className="prompt">{word.vi} <em>({word.pos})</em></p>
          <p className="example">{checked ? plain(word.ex) : cloze(word.ex)}</p>
          <form onSubmit={(e) => { e.preventDefault(); if (!checked) setChecked(true) }}>
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} disabled={checked}
              placeholder="Gõ từ tiếng Anh · Type the English word" autoCapitalize="none" autoComplete="off" spellCheck={false} />
            {!checked && <button className="primary"><L vi="Kiểm tra" en="Check" /></button>}
          </form>
        </section>
      )}

      {sent && (
        <section className="card slide" key={`${item.id}-${item.phase}-${done}`}>
          <span className="tag write">✍️ Viết câu · Sentence writing · {sent.level}</span>
          <p className="muted small">{sent.point}</p>
          <p className="prompt">{sent.vi}</p>
          <form onSubmit={(e) => { e.preventDefault(); if (!checked) setChecked(true) }}>
            <textarea ref={inputRef} rows={3} value={input} onChange={(e) => setInput(e.target.value)} disabled={checked}
              placeholder="Viết câu tiếng Anh · Write the sentence in English" spellCheck={false}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!checked) setChecked(true) } }} />
            {!checked && <button className="primary"><L vi="Kiểm tra" en="Check" /></button>}
          </form>
        </section>
      )}

      {checked && (
        <section className={`card result ${correct ? 'ok bounce' : word ? 'bad shake' : 'neutral slide'}`}>
          {correct
            ? <BuddySays mood="cheer" en={CHEERS[done % CHEERS.length][0]} vi={CHEERS[done % CHEERS.length][1]} />
            : word
              ? <BuddySays mood="sad" en={COMFORTS[done % COMFORTS.length][0]} vi={COMFORTS[done % COMFORTS.length][1]} />
              : <BuddySays mood="think" en="Let's compare!" vi="Cùng so với đáp án mẫu nhé." />}
          <p className="verdict">{correct ? '✓ Chính xác · Correct' : word ? '✗ Chưa đúng · Not quite' : 'Đáp án mẫu · Model answer'}</p>
          {!correct && (
            <p className="answer">
              {sent ? missingWords(answer, input).map((t, i) => <span key={i} className={t.miss ? 'miss' : ''}>{t.w} </span>) : answer}
              <button className="ghost" onClick={() => speak(answer)} aria-label="Nghe · Listen">🔊</button>
            </p>
          )}
          {sent && !correct && (
            <>
              <p className="muted small">Từ tô đậm là phần câu của bạn chưa có. Một câu có thể có nhiều cách viết đúng — tự chấm theo mức độ gần đúng, hoặc nhờ Claude xem.</p>
              <button className="ghost line" onClick={async () => setCopied(await copy(claudePrompt))}>
                {copied ? '✓ Đã sao chép — dán vào Claude' : 'Sao chép để hỏi Claude · Copy for Claude'}
              </button>
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
                <button onClick={() => rate(Rating.Hard)}><L vi={word ? 'Gõ nhầm' : 'Gần đúng'} en={word ? 'Typo' : 'Close'} /></button>
                {sent && <button onClick={() => rate(Rating.Good)}><L vi="Cũng đúng" en="Also right" /></button>}
              </>
            )}
          </div>
        </section>
      )}
    </Page>
  )
}
