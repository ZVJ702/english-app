// Infi — nhân vật đồng hành hình ký hiệu vô cực (∞), có tay, chân và hai mắt nằm trong hai vòng.
export type Mood = 'happy' | 'wave' | 'cheer' | 'sad' | 'sleep' | 'think'

const INK = '#3d3560'
const LIMB = '#9a8ee8'
const LOOP = 'M70,48 C60,33 52,27 42,27 C28,27 14,36 14,48 C14,60 28,69 42,69 C52,69 60,63 70,48 C80,33 88,27 98,27 C112,27 126,36 126,48 C126,60 112,69 98,69 C88,69 80,63 70,48 Z'

export function Buddy({ mood = 'happy', size = 96 }: { mood?: Mood; size?: number }) {
  const up = mood === 'cheer'
  const closed = mood === 'cheer' || mood === 'sleep'
  const py = mood === 'think' ? 44 : mood === 'sad' ? 51 : 48
  const eye = (cx: number) =>
    closed ? (
      <path key={cx} d={mood === 'sleep' ? `M${cx - 6} 47 Q${cx} 53 ${cx + 6} 47` : `M${cx - 6} 50 Q${cx} 42 ${cx + 6} 50`}
        stroke={INK} strokeWidth="2.8" strokeLinecap="round" fill="none" />
    ) : (
      <g key={cx}>
        <circle cx={cx + (mood === 'think' ? 2 : 0)} cy={py} r="5.2" fill={INK} />
        <circle cx={cx + (mood === 'think' ? 3.8 : 1.8)} cy={py - 1.8} r="1.7" fill="#fff" />
      </g>
    )
  return (
    <svg className={`buddy ${mood}`} width={size * 1.22} height={size} viewBox="0 0 140 115" role="img" aria-label="Infi, bạn đồng hành hình vô cực">
      <defs>
        <linearGradient id="infi-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b9aef7" /><stop offset="1" stopColor="#f7b3cb" />
        </linearGradient>
      </defs>
      <ellipse cx="70" cy="108" rx="40" ry="4" fill="#000" opacity=".08" />
      {/* chân */}
      <g stroke={LIMB} strokeWidth="7" strokeLinecap="round" fill="none">
        <path d="M42 70 L40 96" /><path d="M98 70 L100 96" />
      </g>
      <ellipse cx="37" cy="99" rx="10" ry="6" fill={LIMB} />
      <ellipse cx="103" cy="99" rx="10" ry="6" fill={LIMB} />
      {/* tay */}
      <g stroke={LIMB} strokeWidth="7" strokeLinecap="round" fill="none">
        {up ? <path d="M16 42 L3 20" /> : mood === 'sad' ? <path d="M15 52 L5 72" /> : <path d="M15 50 L2 62" />}
        {up ? <path d="M124 42 L137 20" />
          : mood === 'wave' ? <path className="arm-wave" d="M124 42 L138 20" />
          : mood === 'think' ? <path d="M125 52 L132 66" />
          : mood === 'sad' ? <path d="M125 52 L135 72" /> : <path d="M125 50 L138 62" />}
      </g>
      {/* thân hình vô cực */}
      <path d={LOOP} fill="none" stroke="#8b7fe8" strokeWidth="20" strokeLinejoin="round" />
      <path d={LOOP} fill="none" stroke="url(#infi-body)" strokeWidth="15" strokeLinejoin="round" />
      <path d="M26 32 Q40 24 54 30" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".6" />
      <path d="M86 30 Q98 24 114 32" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".6" />
      {/* hai mắt nằm trong hai vòng */}
      <ellipse cx="42" cy="48" rx="17" ry="12" fill="#fff" /><ellipse cx="98" cy="48" rx="17" ry="12" fill="#fff" />
      {eye(42)}{eye(98)}
      {mood === 'sad' && (
        <g stroke={INK} strokeWidth="2.4" strokeLinecap="round"><path d="M33 41 L46 38" /><path d="M107 41 L94 38" /></g>
      )}
      {/* má và miệng */}
      <circle cx="56" cy="62" r="4" fill="#ff9db5" opacity=".8" /><circle cx="84" cy="62" r="4" fill="#ff9db5" opacity=".8" />
      {mood === 'cheer' ? <path d="M64 47 Q70 58 76 47 Z" fill="#e2726e" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        : mood === 'sad' ? <path d="M65 52 Q70 47 75 52" stroke={INK} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        : mood === 'sleep' ? <circle cx="70" cy="50" r="2.8" fill={INK} opacity=".75" />
        : mood === 'think' ? <path d="M66 50 L74 49" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
        : <path d="M64 47 Q70 55 76 47" stroke={INK} strokeWidth="2.4" strokeLinecap="round" fill="none" />}
      {mood === 'sleep' && (
        <g className="zzz" fill="#8b7fe8" fontWeight="900" fontFamily="inherit">
          <text x="116" y="22" fontSize="16">z</text><text x="128" y="11" fontSize="12">z</text>
        </g>
      )}
      {mood === 'cheer' && (
        <g className="sparkle" fill="#ffcf5c">
          <path d="M66 6 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" /><path d="M22 4 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" />
        </g>
      )}
      {mood === 'think' && <g fill="#8b7fe8" opacity=".8"><circle cx="124" cy="22" r="3" /><circle cx="132" cy="11" r="5" /></g>}
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
