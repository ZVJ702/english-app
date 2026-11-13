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
