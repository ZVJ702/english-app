import { useState } from 'react'
import { GRAMMAR, type Topic } from './data/grammar'
import { useStore } from './store'
import { speak } from './util'
import { L, Page } from './ui'
import { BuddySays } from './Buddy'

/** Nội dung một bài ngữ pháp: công thức, giải thích, ví dụ. Dùng cả ở trang Ngữ pháp và trong phiên học. */
export function Lesson({ t }: { t: Topic }) {
  return (
    <>
      <h2 className="lesson-title">{t.vi}<small>{t.en}</small></h2>
      <p className="formula">{t.formula}</p>
      <ul className="notes">{t.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
      {t.examples.map(([en, vi], i) => (
        <p key={i} className="ex">
          <b>{en}</b> <button className="ghost" onClick={() => speak(en.split('→').pop()!)} aria-label="Nghe · Listen">🔊</button>
          <span className="muted small">{vi}</span>
        </p>
      ))}
    </>
  )
}

export function Grammar({ onBack }: { onBack: () => void }) {
  const s = useStore()
  const [open, setOpen] = useState<Topic | null>(null)
  if (open) {
    return (
      <Page title={<L vi="Bài ngữ pháp" en="Grammar lesson" />} onBack={() => setOpen(null)}>
        <section className="card lesson"><span className="tag write">📘 {open.level}</span><Lesson t={open} /></section>
        <p className="muted small center">Bài tập của chủ đề này tự xuất hiện trong các phiên học và được ôn lại theo lịch.</p>
      </Page>
    )
  }
  return (
    <Page title={<L vi="Ngữ pháp" en="Grammar" />} onBack={onBack}>
      <BuddySays mood="think" size={84} en="Grammar, step by step." vi="Mở một chủ đề để đọc bài; bài tập nằm trong phiên học." />
      {(['A2', 'B1', 'B2'] as const).map((lv) => (
        <div key={lv} className="group">
          <h2 className="sec">Cấp {lv}{lv === s.level && <span className="badge">Hiện tại</span>}</h2>
          {GRAMMAR.filter((t) => t.level === lv).map((t) => {
            const done = t.exercises.filter((e) => s.cards[e.id]).length
            return (
              <button key={t.id} className="card row feature" onClick={() => setOpen(t)}>
                <span className={`icon ${done === t.exercises.length ? 'full' : ''}`}>{done === t.exercises.length ? '✓' : '📘'}</span>
                <span><b>{t.vi}</b><span className="muted small">{t.en} · {done}/{t.exercises.length} bài tập</span></span>
                <span className="chev">›</span>
              </button>
            )
          })}
        </div>
      ))}
    </Page>
  )
}
