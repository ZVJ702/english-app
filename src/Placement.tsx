import { useState } from 'react'
import { QUESTIONS } from './data/placement'
import type { Level } from './data/vocab'
import { setLevel } from './store'
import { L, Page } from './ui'

function levelFrom(answers: number[]): Level {
  const pass = (lv: Level) => {
    const qs = QUESTIONS.map((q, i) => ({ q, i })).filter((x) => x.q.level === lv)
    return qs.filter((x) => answers[x.i] === x.q.a).length / qs.length >= 0.6
  }
  if (!pass('A2')) return 'A2'
  if (!pass('B1')) return 'A2'
  return pass('B2') ? 'B2' : 'B1'
}
const NOTE: Record<Level, string> = {
  A2: 'Bạn nắm được nền tảng cơ bản. App sẽ bắt đầu từ các từ và mẫu câu thông dụng.',
  B1: 'Bạn ở mức trung cấp. App sẽ tập trung vào từ vựng B1 và các cấu trúc câu phức.',
  B2: 'Bạn ở mức trung cấp trên. App sẽ ưu tiên từ học thuật và mẫu câu cho IELTS Writing.',
}

export function Placement({ onDone, onSkip }: { onDone: () => void; onSkip?: () => void }) {
  const [answers, setAnswers] = useState<number[]>([])
  const i = answers.length
  if (i >= QUESTIONS.length) {
    const lv = levelFrom(answers)
    const right = answers.filter((a, k) => a === QUESTIONS[k].a).length
    return (
      <Page title={<L vi="Kết quả xếp lớp" en="Placement result" />}>
        <section className="card center">
          <p className="big">{lv}</p>
          <p>Đúng {right}/{QUESTIONS.length} câu · {right}/{QUESTIONS.length} correct</p>
          <p className="muted">{NOTE[lv]} Đây chỉ là ước lượng từ 20 câu ngữ pháp; bạn đổi được trong Cài đặt.</p>
          <button className="primary" onClick={() => { setLevel(lv); onDone() }}><L vi="Bắt đầu học" en="Start learning" /></button>
        </section>
      </Page>
    )
  }
  const q = QUESTIONS[i]
  return (
    <Page title={<L vi="Kiểm tra xếp lớp" en="Placement test" />} onBack={onSkip}>
      <div className="bar"><i style={{ width: `${(i / QUESTIONS.length) * 100}%` }} /></div>
      <p className="muted small">Câu {i + 1}/{QUESTIONS.length} · Chọn đáp án đúng · Choose the correct answer</p>
      <section className="card">
        <p className="prompt">{q.q}</p>
        <div className="opts">
          {q.opts.map((o, k) => <button key={k} onClick={() => setAnswers([...answers, k])}>{o}</button>)}
          <button className="ghost" onClick={() => setAnswers([...answers, -1])}><L vi="Không biết" en="I don't know" /></button>
        </div>
      </section>
    </Page>
  )
}
