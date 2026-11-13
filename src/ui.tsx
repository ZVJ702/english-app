import type { ReactNode } from 'react'
/** Nhãn song ngữ: tiếng Việt chính, tiếng Anh phụ. */
export function L({ vi, en }: { vi: string; en: string }) {
  return <span className="bi">{vi}<small>{en}</small></span>
}
export function Page({ title, onBack, children }: { title: ReactNode; onBack?: () => void; children: ReactNode }) {
  return (
    <main className="page">
      <header className="top">
        {onBack && <button className="ghost back" onClick={onBack} aria-label="Quay lại · Back">←</button>}
        <h1>{title}</h1>
      </header>
      {children}
    </main>
  )
}

const COLORS = ['#7c5cff', '#ff7a59', '#ffc93c', '#22c58b', '#3ba7ff', '#ff5fa2']
/** Pháo giấy ăn mừng khi xong phiên học. */
export function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 36 }, (_, i) => (
        <i key={i} style={{
          left: `${(i * 37) % 100}%`, background: COLORS[i % COLORS.length],
          animationDelay: `${(i % 9) * 0.12}s`, animationDuration: `${2.2 + (i % 5) * 0.35}s`,
          transform: `rotate(${i * 40}deg)`,
        }} />
      ))}
    </div>
  )
}
/** Vòng tròn tiến độ. */
export function Ring({ value, children }: { value: number; children: ReactNode }) {
  const r = 42, c = 2 * Math.PI * r
  return (
    <div className="ring">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={r} className="track" />
        <circle cx="50" cy="50" r={r} className="fill" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, value))} />
      </svg>
      <div className="ring-in">{children}</div>
    </div>
  )
}
