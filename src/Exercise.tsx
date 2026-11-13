// Các dạng bài tập: trắc nghiệm, gõ điền chỗ trống, sắp xếp từ, nghe chép, nói thành tiếng.
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Exercise } from './data/grammar'
import { normalize, sameText, speak } from './util'
import { L } from './ui'

export interface Answer { ok: boolean; given: string }
type Props = { ex: Exercise; done: boolean; onAnswer: (a: Answer) => void; level?: string }

export function Mcq({ ex, done, onAnswer }: Props) {
  const [pick, setPick] = useState(-1)
  return (
    <>
      <p className="prompt wide">{ex.q}</p>
      <div className="opts">
        {ex.opts.map((o, i) => (
          <button key={i} disabled={done} className={done ? (i === ex.a ? 'right' : i === pick ? 'wrong' : '') : ''}
            onClick={() => { setPick(i); onAnswer({ ok: i === ex.a, given: o }) }}>{o}</button>
        ))}
      </div>
    </>
  )
}

function TypeBox({ done, placeholder, check }: { done: boolean; placeholder: string; check: (text: string) => void }) {
  const [text, setText] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { ref.current?.focus() }, [])
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!done && text.trim()) check(text) }}>
      <input ref={ref} value={text} onChange={(e) => setText(e.target.value)} disabled={done} placeholder={placeholder}
        autoCapitalize="none" autoComplete="off" spellCheck={false} />
      {!done && <button className="primary" disabled={!text.trim()}><L vi="Kiểm tra" en="Check" /></button>}
    </form>
  )
}

export function Gap({ ex, done, onAnswer }: Props) {
  return (
    <>
      <p className="muted small">Gõ từ còn thiếu · Type the missing word(s)</p>
      <p className="prompt wide">{ex.q}</p>
      <TypeBox done={done} placeholder="Đáp án · Your answer" check={(t) => onAnswer({ ok: ex.answers.some((a) => sameText(a, t)), given: t })} />
    </>
  )
}

/** Số từ tối đa của một câu nghe chép tự gõ ở mỗi cấp; câu dài hơn thì nghe rồi ghép từ có sẵn. */
const DICTATION_WORDS: Record<string, number> = { A1: 4, A2: 6, B1: 9, B2: 13 }

export function Listen({ ex, done, onAnswer, level = 'A2' }: Props) {
  useEffect(() => { speak(ex.q) }, [ex.q])
  if (ex.q.split(' ').length > (DICTATION_WORDS[level] ?? 6)) {
    return (
      <>
        <button className="play" onClick={() => speak(ex.q)} aria-label="Nghe lại · Play again">🔊 <L vi="Nghe lại" en="Play again" /></button>
        <Order ex={{ ...ex, vi: '' }} done={done} onAnswer={onAnswer} hint="Nghe rồi ghép lại câu bạn nghe được · Listen and rebuild the sentence" />
      </>
    )
  }
  return (
    <>
      <p className="muted small">Nghe và gõ lại câu bạn nghe được · Listen and type what you hear</p>
      <button className="play" onClick={() => speak(ex.q)} aria-label="Nghe lại · Play again">🔊 <L vi="Nghe lại" en="Play again" /></button>
      <TypeBox done={done} placeholder="Gõ câu tiếng Anh · Type the sentence" check={(t) => onAnswer({ ok: sameText(ex.q, t), given: t })} />
    </>
  )
}

export function Order({ ex, done, onAnswer, hint }: Props & { hint?: string }) {
  const words = useMemo(() => {
    const list = ex.q.split(' ').map((w, i) => ({ w, i }))
    for (let k = list.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [list[k], list[j]] = [list[j], list[k]] }
    return list
  }, [ex.q])
  const [picked, setPicked] = useState<number[]>([])
  const text = picked.map((i) => ex.q.split(' ')[i]).join(' ')
  return (
    <>
      <p className="muted small">{hint ?? 'Sắp xếp các từ thành câu đúng · Put the words in order'}</p>
      {ex.vi && <p className="prompt wide">{ex.vi}</p>}
      <div className="line">
        {picked.map((i) => <button key={i} className="chip-w" disabled={done} onClick={() => setPicked(picked.filter((x) => x !== i))}>{ex.q.split(' ')[i]}</button>)}
      </div>
      <div className="bank">
        {words.map(({ w, i }) => <button key={i} className="chip-w" disabled={done || picked.includes(i)} onClick={() => setPicked([...picked, i])}>{w}</button>)}
      </div>
      {!done && <button className="primary" disabled={picked.length !== words.length} onClick={() => onAnswer({ ok: sameText(ex.q, text), given: text })}><L vi="Kiểm tra" en="Check" /></button>}
    </>
  )
}

type Rec = { lang: string; interimResults: boolean; maxAlternatives: number; start(): void; stop(): void
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null }
const Recognition = (globalThis as unknown as Record<string, (new () => Rec) | undefined>).SpeechRecognition
  ?? (globalThis as unknown as Record<string, (new () => Rec) | undefined>).webkitSpeechRecognition

/** Tỷ lệ số từ của câu mẫu xuất hiện trong lời người học nói. */
function overlap(target: string, said: string): number {
  const have = normalize(said).split(' ')
  const want = normalize(target).split(' ')
  return want.filter((w) => { const k = have.indexOf(w); if (k < 0) return false; have.splice(k, 1); return true }).length / want.length
}

export function Speak({ ex, done, onAnswer }: Props) {
  const [state, setState] = useState<'idle' | 'listening' | 'failed'>('idle')
  function listen() {
    if (!Recognition) return
    const r = new Recognition()
    r.lang = 'en-US'; r.interimResults = false; r.maxAlternatives = 3
    let heard = false
    r.onresult = (e) => {
      heard = true
      const alts = Array.from(e.results[0]).map((a) => a.transcript)
      const best = alts.reduce((a, b) => (overlap(ex.q, b) > overlap(ex.q, a) ? b : a))
      onAnswer({ ok: overlap(ex.q, best) >= 0.8, given: best })
    }
    r.onerror = () => setState('failed')
    r.onend = () => { if (!heard) setState((s) => (s === 'listening' ? 'failed' : s)) }
    setState('listening')
    try { r.start() } catch { setState('failed') }
    // Nếu micro không phản hồi sau 8 giây thì dừng và cho người học tự chấm, tránh bị kẹt.
    setTimeout(() => { if (!heard) { try { r.stop() } catch { /* đã dừng */ } setState((s) => (s === 'listening' ? 'failed' : s)) } }, 8000)
  }
  return (
    <>
      <p className="muted small">Nghe rồi nói to câu này · Listen, then say it out loud</p>
      <p className="prompt wide">{ex.q}</p>
      <p className="muted">{ex.vi}</p>
      <button className="play" onClick={() => speak(ex.q)}>🔊 <L vi="Nghe mẫu" en="Listen" /></button>
      {!done && Recognition && (
        <button className="primary" disabled={state === 'listening'} onClick={listen}>
          🎤 {state === 'listening' ? <L vi="Đang nghe bạn nói…" en="Listening…" /> : <L vi="Bấm rồi nói" en="Tap and speak" />}
        </button>
      )}
      {!done && (!Recognition || state === 'failed') && (
        <>
          <p className="muted small">{Recognition ? 'Không nghe được giọng nói. Hãy thử lại, hoặc tự chấm:' : 'Thiết bị này không hỗ trợ nhận dạng giọng nói. Hãy nói to rồi tự chấm:'}</p>
          <div className="grades">
            <button onClick={() => onAnswer({ ok: false, given: '' })}><L vi="Chưa nói được" en="Not yet" /></button>
            <button onClick={() => onAnswer({ ok: true, given: '' })}><L vi="Tôi nói được" en="I said it" /></button>
          </div>
        </>
      )}
    </>
  )
}
