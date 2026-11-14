import { useRef, useState } from 'react'
import { exportData, importData, newSyncCode, setDailyNew, setRetention, setSync, syncNow, syncReady, useStore } from './store'
import { L, Page } from './ui'
import { setPrefs, usePrefs, type Theme } from './prefs'

export function Settings({ onBack }: { onBack: () => void }) {
  const s = useStore()
  const pr = usePrefs()
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const file = useRef<HTMLInputElement>(null)

  async function doSync() {
    setBusy(true); setMsg('')
    try { await syncNow(); setMsg('✓ Đã đồng bộ · Synced') }
    catch (e) { setMsg('✗ ' + (e instanceof Error ? e.message : 'Lỗi đồng bộ')) }
    setBusy(false)
  }
  function download() {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([exportData()], { type: 'application/json' }))
    a.download = `english-app-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <Page title={<L vi="Cài đặt" en="Settings" />} onBack={onBack}>
      <section className="card">
        <h2><L vi="Giao diện" en="Appearance" /></h2>
        <label>Màu nền · Theme</label>
        <div className="seg">
          {([['auto', 'Theo máy'], ['light', '☀️ Sáng'], ['dark', '🌙 Tối']] as [Theme, string][]).map(([t, name]) => (
            <button key={t} className={pr.theme === t ? 'on' : ''} onClick={() => setPrefs({ theme: t })}>{name}</button>
          ))}
        </div>
        <label>Cỡ chữ · Text size</label>
        <div className="seg">
          {([[15, 'Nhỏ'], [16, 'Vừa'], [18, 'Lớn'], [20, 'Rất lớn']] as [number, string][]).map(([f, name]) => (
            <button key={f} className={pr.font === f ? 'on' : ''} onClick={() => setPrefs({ font: f })}>{name}</button>
          ))}
        </div>
        <label className="switch">
          <input type="checkbox" checked={pr.sound} onChange={(e) => setPrefs({ sound: e.target.checked })} />
          <span>🔔 Âm báo khi trả lời đúng hoặc sai</span>
        </label>
        <p className="muted small">Các tùy chọn giao diện chỉ áp dụng cho thiết bị này.</p>
      </section>

      <section className="card">
        <h2><L vi="Mục tiêu mỗi tuần" en="Weekly goal" /></h2>
        <div className="grades">
          {[3, 4, 5, 6, 7].map((n) => (
            <button key={n} className={pr.weekGoal === n ? 'primary' : ''} onClick={() => setPrefs({ weekGoal: n })}>{n}</button>
          ))}
        </div>
        <p className="muted small">Số ngày bạn muốn học trong một tuần (tính từ thứ Hai). Trang chính sẽ hiện tiến độ của tuần này.</p>
      </section>

      <section className="card">
        <h2><L vi="Số từ mới mỗi ngày" en="New words per day" /></h2>
        <div className="grades">
          {[5, 10, 15, 20, 30].map((n) => (
            <button key={n} className={s.dailyNew === n ? 'primary' : ''} onClick={() => setDailyNew(n)}>{n}</button>
          ))}
        </div>
        <p className="muted small">
          Với {s.dailyNew} từ mỗi ngày, một cuốn 600 từ mất khoảng {Math.ceil(600 / s.dailyNew)} ngày học.
          Càng nhiều từ mới thì số thẻ phải ôn mỗi ngày càng tăng, thường gấp 5 đến 8 lần số từ mới.
        </p>
      </section>

      <section className="card">
        <h2><L vi="Mức ghi nhớ mục tiêu" en="Desired retention" /></h2>
        <div className="grades">
          {[0.85, 0.9, 0.95].map((r) => (
            <button key={r} className={Math.abs(s.retention - r) < 0.001 ? 'primary' : ''} onClick={() => setRetention(r)}>{Math.round(r * 100)}%</button>
          ))}
        </div>
        <p className="muted small">
          {s.retention < 0.875 ? '85%: ít thẻ phải ôn mỗi ngày nhất, đổi lại quên nhiều hơn. Hợp khi bận hoặc đang có nhiều thẻ tồn.'
            : s.retention < 0.925 ? '90% (khuyên dùng): cân bằng giữa số thẻ phải ôn và mức nhớ. Đây là mức mặc định của thuật toán FSRS.'
            : '95%: nhớ chắc nhất nhưng số thẻ phải ôn mỗi ngày tăng mạnh. Hợp khi sắp thi.'}
          {' '}Thay đổi chỉ áp dụng cho các lần ôn từ nay trở đi.
        </p>
      </section>

      <section className="card">
        <h2><L vi="Đồng bộ giữa các thiết bị" en="Sync across devices" /></h2>
        <p className="muted small">Nhập cùng một mã đồng bộ trên máy tính, điện thoại và tablet. Ai có mã này sẽ đọc được dữ liệu học của bạn, nên đừng chia sẻ; bạn bè hãy tạo mã riêng.</p>
        <label>Địa chỉ máy chủ đồng bộ · Sync server URL
          <input value={s.sync.url} onChange={(e) => setSync(e.target.value, s.sync.code)} placeholder="https://…workers.dev" inputMode="url" />
        </label>
        <label>Mã đồng bộ · Sync code
          <input value={s.sync.code} onChange={(e) => setSync(s.sync.url, e.target.value)} placeholder="xxxxx-xxxxx-xxxxx-xxxxx" autoCapitalize="none" />
        </label>
        <div className="grades">
          <button onClick={() => setSync(s.sync.url, newSyncCode())}><L vi="Tạo mã mới" en="New code" /></button>
          <button className="primary" disabled={!syncReady() || busy} onClick={doSync}><L vi={busy ? 'Đang đồng bộ…' : 'Đồng bộ ngay'} en="Sync now" /></button>
        </div>
        <p className="muted small">{msg || (s.sync.last ? `Lần đồng bộ gần nhất: ${new Date(s.sync.last).toLocaleString('vi-VN')}` : 'Chưa đồng bộ lần nào · Never synced')}</p>
      </section>

      <section className="card">
        <h2><L vi="Sao lưu" en="Backup" /></h2>
        <p className="muted small">Tải dữ liệu về thành một tệp, hoặc nhập tệp đã lưu. Nhập tệp sẽ gộp với dữ liệu hiện có, không xóa.</p>
        <div className="grades">
          <button onClick={download}><L vi="Tải tệp sao lưu" en="Download backup" /></button>
          <button onClick={() => file.current?.click()}><L vi="Nhập tệp" en="Import file" /></button>
        </div>
        <input ref={file} type="file" accept="application/json" hidden onChange={async (e) => {
          const f = e.target.files?.[0]
          if (!f) return
          try { importData(await f.text()); setMsg('✓ Đã nhập dữ liệu · Imported') }
          catch (err) { setMsg('✗ ' + (err instanceof Error ? err.message : 'Tệp không hợp lệ')) }
          e.target.value = ''
        }} />
      </section>

    </Page>
  )
}
