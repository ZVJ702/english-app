// Các dạng bài tập: trắc nghiệm, gõ điền chỗ trống, sắp xếp từ thành câu.
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Exercise } from './data/grammar'
import { sameText } from './util'
import { L } from './ui'

export interface Answer { ok: boolean; given: string }
type Props = { ex: Exercise; done: boolean; onAnswer: (a: Answer) => void }

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

export function Order({ ex, done, onAnswer }: Props) {
  const words = useMemo(() => {
    const list = ex.q.split(' ').map((w, i) => ({ w, i }))
    for (let k = list.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [list[k], list[j]] = [list[j], list[k]] }
    return list
  }, [ex.q])
  const [picked, setPicked] = useState<number[]>([])
  const text = picked.map((i) => ex.q.split(' ')[i]).join(' ')
  return (
    <>
      <p className="muted small">Sắp xếp các từ thành câu đúng · Put the words in order</p>
      <p className="prompt wide">{ex.vi}</p>
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
