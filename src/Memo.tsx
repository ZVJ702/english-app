import { useState } from 'react'
import { setMemo, useStore } from './store'

/** Ô mẹo nhớ của người học cho một từ. open = mở sẵn ô soạn khi chưa có mẹo. */
export function Memo({ id, open = false }: { id: string; open?: boolean }) {
  const s = useStore()
  const text = s.memo[id]?.text ?? ''
  const [editing, setEditing] = useState(open && !text)
  const [draft, setDraft] = useState(text)
  if (editing) {
    return (
      <div className="memo">
        <b>📝 Mẹo nhớ của bạn</b>
        <textarea rows={2} value={draft} autoFocus onChange={(e) => setDraft(e.target.value)}
          placeholder="Ví dụ: afraid ≈ “ở phố” một mình thì sợ" />
        <div className="grades">
          <button onClick={() => { setEditing(false); setDraft(text) }}>Hủy</button>
          <button className="primary" onClick={() => { setMemo(id, draft); setEditing(false) }}>Lưu</button>
        </div>
      </div>
    )
  }
  if (!text) return <button className="ghost memo-add" onClick={() => { setDraft(''); setEditing(true) }}>📝 Thêm mẹo nhớ</button>
  return (
    <div className="memo">
      <b>📝 Mẹo nhớ</b>
      <p>{text}</p>
      <button className="ghost" onClick={() => { setDraft(text); setEditing(true) }}>Sửa</button>
    </div>
  )
}
