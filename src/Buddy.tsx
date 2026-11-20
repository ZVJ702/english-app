// Infi — nhân vật đồng hành: dải Möbius không – thời gian (vòng trái là Không gian, vòng phải là Thời gian).
// Không có mắt nên cảm xúc thể hiện bằng nhịp chuyển động: reo mừng chạy nhanh, buồn chạy chậm, ngủ thì đứng yên.
import { useEffect, useRef } from 'react'
import { createMobius } from './mobius-art.js'

export type Mood = 'happy' | 'wave' | 'cheer' | 'sad' | 'sleep' | 'think'
const SPEED: Record<Mood, number> = { cheer: 2.4, wave: 1.1, happy: 1, think: 0.6, sad: 0.35, sleep: 0 }

export function Buddy({ mood = 'happy', size = 96 }: { mood?: Mood; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const speed = useRef(SPEED[mood])
  useEffect(() => { speed.current = SPEED[mood] }, [mood])
  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    cv.width = Math.round(size * 1.45 * dpr); cv.height = Math.round(size * dpr)
    const render = createMobius(cv, size < 110)
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    let t = 3, last = performance.now(), raf = 0, visible = true
    const tick = (now: number) => {
      t += ((now - last) / 1000) * speed.current
      last = now
      render(t)
      if (!still && visible) raf = requestAnimationFrame(tick)
    }
    // chỉ chuyển động khi nhân vật đang nằm trên màn hình, để đỡ tốn pin
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      cancelAnimationFrame(raf)
      if (visible) { last = performance.now(); raf = requestAnimationFrame(tick) }
    })
    io.observe(cv)
    render(t)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [size])
  return <canvas ref={ref} className={`buddy ${mood}`} style={{ width: size * 1.45, height: size }} role="img" aria-label="Infi, dải băng không – thời gian" />
}

/** Infi kèm bong bóng lời nói: câu tiếng Anh ngắn, bên dưới là tiếng Việt. */
export function BuddySays({ mood, en, vi, size = 72 }: { mood: Mood; en: string; vi: string; size?: number }) {
  return (
    <div className="says">
      <Buddy mood={mood} size={size} />
      <div className="bubble"><b>{en}</b><span>{vi}</span></div>
    </div>
  )
}
