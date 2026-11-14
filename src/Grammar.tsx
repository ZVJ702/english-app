import { useState } from 'react'
import { GRAMMAR, PLANNED, type Topic } from './data/grammar'
import { useStore } from './store'
import { speak } from './util'
import { L, Page } from './ui'
import { BuddySays } from './Buddy'

/** Nội dung một bài: công thức, giải thích, so sánh với tiếng Việt, lỗi hay gặp, ví dụ. Dùng ở thư viện và trong phiên học. */
export function Lesson({ t }: { t: Topic }) {
  return (
    <>
      <h2 className="lesson-title">{t.vi}<small>{t.en}</small></h2>
      {t.formula && <p className="formula">{t.formula}</p>}
      {t.notes.length > 0 && <ul className="notes">{t.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>}
      {t.compare.map((c, i) => <p key={i} className="compare"><b>🇻🇳 So với tiếng Việt</b>{c}</p>)}
      {t.mistakes.length > 0 && (
        <div className="mistakes">
          <b>⚠️ Lỗi hay gặp · Common mistakes</b>
          {t.mistakes.map(([wrong, right, why], i) => (
            <p key={i}><s>{wrong}</s><span className="fix">{right}</span><span className="muted small">{why}</span></p>
          ))}
        </div>
      )}
      {t.sounds.map(([note, samples], i) => (
        <div key={i} className="sounds">
          <b>🗣️ Phát âm · Pronunciation</b>
          <p>{note}</p>
          <div className="bank">{samples.map((w) => <button key={w} className="chip-w" onClick={() => speak(w)}>🔊 {w}</button>)}</div>
        </div>
      ))}
      {t.examples.map(([en, vi], i) => (
        <p key={i} className="ex">
          <b>{en}</b> <button className="ghost" onClick={() => speak(en.split('→').pop()!)} aria-label="Nghe · Listen">🔊</button>
          <span className="muted small">{vi}</span>
        </p>
      ))}
    </>
  )
}

function Row({ t, onOpen }: { t: Topic; onOpen: () => void }) {
  const s = useStore()
  const done = t.exercises.filter((e) => s.cards[e.id]).length
  const full = done === t.exercises.length
  return (
    <button className="card row feature" onClick={onOpen}>
      <span className={`icon ${full ? 'full' : ''}`}>{full ? '✓' : '📘'}</span>
      <span><b>{t.vi}</b><span className="muted small">{t.en} · {done}/{t.exercises.length} bài tập</span></span>
      <span className="chev">›</span>
    </button>
  )
}

export function Library({ onBack }: { onBack: () => void }) {
  const [open, setOpen] = useState<Topic | null>(null)
  if (open) {
    return (
      <Page title={<L vi="Bài ngữ pháp" en="Grammar lesson" />} onBack={() => setOpen(null)}>
        <section className="card lesson"><span className="tag write">📘 {open.level}</span><Lesson t={open} /></section>
        <p className="muted small center">Bài tập của chủ đề này nằm trong phiên "Học ngữ pháp" và được ôn lại theo lịch.</p>
      </Page>
    )
  }
  return (
    <Page title={<L vi="Ngữ pháp" en="Grammar" />} onBack={onBack}>
      <BuddySays mood="think" size={84} en="Grammar, step by step." vi="Mở một chủ đề để đọc bài; bài tập nằm trong phiên Học ngữ pháp." />
      {(['A1', 'A2', 'B1', 'B2'] as const).map((lv) => (
        <div key={lv} className="group">
          <h2 className="sec">Phần {lv}</h2>
          {GRAMMAR.filter((t) => t.level === lv).map((t) => <Row key={t.id} t={t} onOpen={() => setOpen(t)} />)}
          {PLANNED[lv].length > 0 && (
            <details className="planned">
              <summary>Sắp có: {PLANNED[lv].length} chủ đề nữa</summary>
              <ul>{PLANNED[lv].map((p) => <li key={p}>{p}</li>)}</ul>
            </details>
          )}
        </div>
      ))}
    </Page>
  )
}
