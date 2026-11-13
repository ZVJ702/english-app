import { useState } from 'react'
import { TOPICS } from './data/writing'
import { saveEssay, useStore } from './store'
import { copy } from './util'
import { L, Page } from './ui'

export function Essay({ onBack }: { onBack: () => void }) {
  const s = useStore()
  const [id, setId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const topic = TOPICS.find((t) => t.id === id)

  if (!topic) {
    return (
      <Page title={<L vi="Luyện viết bài" en="Writing practice" />} onBack={onBack}>
        <p className="muted">Chọn một đề. Bài viết được lưu tự động và đồng bộ giữa các thiết bị.</p>
        {TOPICS.map((t) => {
          const n = (s.essays[t.id]?.text.trim().match(/\S+/g) ?? []).length
          return (
            <button key={t.id} className="card row" onClick={() => { setId(t.id); setCopied(false) }}>
              <span className="tag">{t.kind}{n > 0 && ` · ${n} từ`}</span>
              <span>{t.en}</span>
              <span className="muted small">{t.vi}</span>
            </button>
          )
        })}
      </Page>
    )
  }

  const text = s.essays[topic.id]?.text ?? ''
  const words = (text.trim().match(/\S+/g) ?? []).length
  const ielts = topic.kind.startsWith('IELTS')
  const prompt = ielts
    ? `Bạn là giám khảo IELTS Writing. Hãy chấm bài Task 2 dưới đây của tôi (người Việt, trình độ khoảng ${s.level ?? 'B1'}).\n\nĐề bài: ${topic.en}\n\nBài viết (${words} từ):\n${text}\n\nHãy trả lời bằng tiếng Việt:\n1) Band ước lượng cho từng tiêu chí: Task Response, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy, và band tổng.\n2) Liệt kê từng lỗi ngữ pháp và dùng từ: câu gốc → câu sửa → giải thích ngắn.\n3) Viết lại 3 câu yếu nhất theo cách tự nhiên hơn.\n4) Ba việc tôi nên luyện tiếp theo để tăng band.`
    : `Tôi là người Việt đang học tiếng Anh (trình độ khoảng ${s.level ?? 'B1'}). Hãy sửa bài viết dưới đây.\n\nĐề bài: ${topic.en}\n\nBài viết (${words} từ):\n${text}\n\nHãy trả lời bằng tiếng Việt:\n1) Liệt kê từng lỗi: câu gốc → câu sửa → giải thích ngắn.\n2) Viết lại toàn bài cho tự nhiên, giữ nguyên ý của tôi.\n3) Ba điểm ngữ pháp hoặc từ vựng tôi nên ôn lại.`

  return (
    <Page title={topic.kind} onBack={() => setId(null)}>
      <section className="card">
        <p className="prompt">{topic.en}</p>
        <p className="muted small">{topic.vi}</p>
        <textarea rows={12} value={text} onChange={(e) => saveEssay(topic.id, e.target.value)}
          placeholder="Viết bài ở đây · Write here" />
        <p className="muted small">{words} từ · {words} words — đã lưu tự động · saved automatically</p>
        <button className="primary" disabled={words < 5} onClick={async () => setCopied(await copy(prompt))}>
          {copied ? '✓ Đã sao chép — mở Claude và dán vào' : <L vi="Sao chép để Claude chấm" en="Copy for Claude to grade" />}
        </button>
        <p className="muted small">Nút này sao chép đề, bài viết và yêu cầu chấm. Bạn dán vào Claude để nhận nhận xét, không tốn thêm phí.</p>
      </section>
    </Page>
  )
}
