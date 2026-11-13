// Infi — nhân vật đồng hành: một hành tinh nhỏ lơ lửng giữa quỹ đạo hình vô cực (∞).
// Vòng trái là bầu trời sao (không gian), vòng phải là mặt đồng hồ (thời gian).
export type Mood = 'happy' | 'wave' | 'cheer' | 'sad' | 'sleep' | 'think'

const INK = '#2e2a55'
const LIMB = '#8176e6'
const ORBIT = 'M80,54 C68,34 56,26 42,26 C24,26 12,39 12,54 C12,69 24,82 42,82 C56,82 68,74 80,54 C92,34 104,26 118,26 C136,26 148,39 148,54 C148,69 136,82 118,82 C104,82 92,74 80,54 Z'
const spark = (x: number, y: number, r: number) => {
  const k = r * 0.3
  return `M${x} ${y - r} L${x + k} ${y - k} L${x + r} ${y} L${x + k} ${y + k} L${x} ${y + r} L${x - k} ${y + k} L${x - r} ${y} L${x - k} ${y - k}Z`
}

export function Buddy({ mood = 'happy', size = 96 }: { mood?: Mood; size?: number }) {
  const up = mood === 'cheer'
  const closed = mood === 'cheer' || mood === 'sleep'
  const ey = mood === 'think' ? 48 : mood === 'sad' ? 53 : 51
  const eye = (cx: number) =>
    closed ? (
      <path key={cx} d={mood === 'sleep' ? `M${cx - 4} 50 Q${cx} 54 ${cx + 4} 50` : `M${cx - 4} 53 Q${cx} 47 ${cx + 4} 53`}
        stroke={INK} strokeWidth="2.4" strokeLinecap="round" fill="none" />
    ) : (
      <g key={cx}>
        <circle cx={cx + (mood === 'think' ? 1.5 : 0)} cy={ey} r="3.5" fill={INK} />
        <circle cx={cx + (mood === 'think' ? 2.7 : 1.2)} cy={ey - 1.3} r="1.2" fill="#fff" />
      </g>
    )
  return (
    <svg className={`buddy ${mood}`} width={size * 1.45} height={size} viewBox="0 0 160 110" role="img" aria-label="Infi, bạn đồng hành">
      <defs>
        <linearGradient id="infi-orbit" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7fe0b8" /><stop offset=".5" stopColor="#b3a8f7" /><stop offset="1" stopColor="#f7a3c8" />
        </linearGradient>
        <radialGradient id="infi-planet" cx=".34" cy=".28" r=".95">
          <stop offset="0" stopColor="#ddd6ff" /><stop offset=".55" stopColor="#a497f3" /><stop offset="1" stopColor="#7468d8" />
        </radialGradient>
        <radialGradient id="infi-sky" cx=".4" cy=".35" r=".9">
          <stop offset="0" stopColor="#4b41ad" /><stop offset="1" stopColor="#221e4d" />
        </radialGradient>
        <linearGradient id="infi-clock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#e9e2ff" />
        </linearGradient>
      </defs>
      <ellipse className="shade" cx="80" cy="104" rx="20" ry="2.6" fill="#000" opacity=".12" />
      <g className="float">
        {/* quỹ đạo vô cực: một lớp sáng mờ và một nét mảnh */}
        <path d={ORBIT} fill="none" stroke="url(#infi-orbit)" strokeWidth="9" opacity=".18" />
        {/* không gian (trái) và thời gian (phải) */}
        <circle cx="42" cy="54" r="19" fill="url(#infi-sky)" opacity=".94" />
        <path d="M37 49 a7 7 0 1 0 8 9 a5.6 5.6 0 1 1 -8 -9z" fill="#ffe08a" />
        <g className="twinkle" fill="#fff"><circle cx="33" cy="45" r="1" /><circle cx="51" cy="44" r=".8" /><circle cx="34" cy="64" r=".8" /><circle cx="52" cy="62" r="1" /></g>
        <path d={spark(49, 51, 2.4)} fill="#ffcf5c" />
        <circle cx="118" cy="54" r="19" fill="url(#infi-clock)" stroke="#d3c9fb" strokeWidth="1.6" />
        <g stroke="#a497f3" strokeWidth="1.6" strokeLinecap="round">
          <path d="M118 38.5 V41.5" /><path d="M118 66.5 V69.5" /><path d="M102.5 54 H105.5" /><path d="M130.5 54 H133.5" />
        </g>
        <g stroke={INK} strokeWidth="2.2" strokeLinecap="round"><path d="M118 54 V45" /><path d="M118 54 L125 58" /></g>
        <circle cx="118" cy="54" r="1.8" fill="#f7a3c8" />
        <path d={ORBIT} fill="none" stroke="url(#infi-orbit)" strokeWidth="2.6" />
        {/* hai vệ tinh trôi theo quỹ đạo */}
        <circle r="4" fill="#7fe0b8"><animateMotion dur="11s" repeatCount="indefinite" path={ORBIT} /></circle>
        <circle r="3.2" fill="#f7a3c8"><animateMotion dur="11s" begin="-5.5s" repeatCount="indefinite" path={ORBIT} /></circle>
        {/* chân lơ lửng và tay */}
        <g stroke={LIMB} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M73 72 L70 88" /><path d="M87 72 L90 88" />
          {up ? <path d="M63 46 L51 31" /> : mood === 'sad' ? <path d="M61 60 L55 74" /> : <path d="M61 58 L51 67" />}
          {up ? <path d="M97 46 L109 31" />
            : mood === 'wave' ? <path className="arm-wave" d="M98 48 L110 33" />
            : mood === 'think' ? <path d="M98 60 L100 68 L90 66" />
            : mood === 'sad' ? <path d="M99 60 L105 74" /> : <path d="M99 58 L109 67" />}
        </g>
        <ellipse cx="68.5" cy="90" rx="6" ry="3.8" fill={LIMB} /><ellipse cx="91.5" cy="90" rx="6" ry="3.8" fill={LIMB} />
        {/* hành tinh */}
        <circle cx="80" cy="54" r="21" fill="url(#infi-planet)" />
        <path d="M64 46 Q70 38 80 37" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity=".55" />
        <ellipse cx="91" cy="68" rx="5" ry="2.2" fill="#5b4fcf" opacity=".22" />
        {eye(73)}{eye(87)}
        {mood === 'sad' && (
          <g stroke={INK} strokeWidth="2" strokeLinecap="round"><path d="M68 47 L76 45.5" /><path d="M92 47 L84 45.5" /></g>
        )}
        <circle cx="66.5" cy="58.5" r="3.2" fill="#ff9db5" opacity=".8" /><circle cx="93.5" cy="58.5" r="3.2" fill="#ff9db5" opacity=".8" />
        {mood === 'cheer' ? <path d="M75 57 Q80 66 85 57 Z" fill="#e2726e" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
          : mood === 'sad' ? <path d="M76 61 Q80 57 84 61" stroke={INK} strokeWidth="2.2" strokeLinecap="round" fill="none" />
          : mood === 'sleep' ? <circle cx="80" cy="60" r="2.4" fill={INK} opacity=".75" />
          : mood === 'think' ? <path d="M77 60 L84 59" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
          : <path d="M75 57 Q80 63 85 57" stroke={INK} strokeWidth="2.2" strokeLinecap="round" fill="none" />}
      </g>
      {/* sao lấp lánh xung quanh */}
      <g className="twinkle"><path d={spark(80, 12, 4)} fill="#ffcf5c" /><path d={spark(14, 20, 2.6)} fill="#c3baf8" /><path d={spark(146, 22, 2.4)} fill="#c3baf8" /></g>
      {mood === 'sleep' && (
        <g className="zzz" fill="#b3a8f7" fontWeight="900" fontFamily="inherit">
          <text x="100" y="30" fontSize="15">z</text><text x="112" y="19" fontSize="11">z</text>
        </g>
      )}
      {mood === 'cheer' && (
        <g className="sparkle" fill="#ffcf5c"><path d={spark(40, 14, 4.5)} /><path d={spark(122, 12, 3.5)} /><path d={spark(60, 6, 2.4)} /></g>
      )}
      {mood === 'think' && <g fill="#b3a8f7" opacity=".85"><circle cx="104" cy="30" r="2.6" /><circle cx="111" cy="20" r="4.2" /></g>}
    </svg>
  )
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

export const CHEERS: [string, string][] = [
  ['Great job!', 'Tuyệt lắm!'], ['Nice one!', 'Hay quá!'], ['You got it!', 'Bạn làm được rồi!'],
  ['Perfect!', 'Hoàn hảo!'], ['Keep going!', 'Tiếp tục nào!'], ['Well done!', 'Làm tốt lắm!'],
]
export const COMFORTS: [string, string][] = [
  ['Almost there!', 'Gần đúng rồi!'], ["Don't worry!", 'Đừng lo nhé!'], ["You'll get it next time.", 'Lần sau sẽ nhớ thôi.'],
  ['Mistakes help you learn.', 'Sai là để nhớ lâu hơn.'],
]
