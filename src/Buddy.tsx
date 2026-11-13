// Bơ — nhân vật đồng hành (một quả bơ nhỏ), vẽ bằng SVG.
export type Mood = 'happy' | 'wave' | 'cheer' | 'sad' | 'sleep' | 'think'

const INK = '#4a3b2a'
export function Buddy({ mood = 'happy', size = 96 }: { mood?: Mood; size?: number }) {
  const up = mood === 'cheer'
  const closed = mood === 'cheer' || mood === 'sleep'
  return (
    <svg className={`buddy ${mood}`} width={size} height={size * 1.1} viewBox="0 0 120 132" role="img" aria-label="Bơ, bạn đồng hành">
      <ellipse cx="60" cy="127" rx="30" ry="4" fill="#000" opacity=".08" />
      {/* chân */}
      <ellipse cx="47" cy="121" rx="9" ry="6" fill="#7fb872" />
      <ellipse cx="73" cy="121" rx="9" ry="6" fill="#7fb872" />
      {/* tay */}
      <g stroke="#7fb872" strokeWidth="7" strokeLinecap="round" fill="none">
        {up ? <path d="M27 70 L10 46" /> : mood === 'sad' ? <path d="M27 74 L16 94" /> : <path d="M27 72 L12 82" />}
        {up ? <path d="M93 70 L110 46" />
          : mood === 'wave' ? <path className="arm-wave" d="M93 70 L110 48" />
          : mood === 'think' ? <path d="M93 76 L82 66" />
          : mood === 'sad' ? <path d="M93 74 L104 94" /> : <path d="M93 72 L108 82" />}
      </g>
      {/* thân */}
      <path d="M60 8 C38 8 30 34 24 58 C16 90 32 120 60 120 C88 120 104 90 96 58 C90 34 82 8 60 8Z" fill="#a9d99a" stroke="#7fb872" strokeWidth="3" />
      <path d="M60 19 C45 19 39 41 34 60 C28 87 41 110 60 110 C79 110 92 87 86 60 C81 41 75 19 60 19Z" fill="#f6f7cf" />
      {/* hạt */}
      <circle cx="60" cy="86" r="17" fill="#d3a379" />
      <circle cx="54" cy="80" r="5" fill="#e6c2a0" />
      {/* má */}
      <circle cx="42" cy="58" r="5.5" fill="#ffb7b7" opacity=".75" />
      <circle cx="78" cy="58" r="5.5" fill="#ffb7b7" opacity=".75" />
      {/* mắt */}
      {closed ? (
        <g stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none">
          {mood === 'sleep'
            ? <><path d="M45 50 Q50 54 55 50" /><path d="M65 50 Q70 54 75 50" /></>
            : <><path d="M45 52 Q50 45 55 52" /><path d="M65 52 Q70 45 75 52" /></>}
        </g>
      ) : (
        <g className="eyes">
          <circle cx="50" cy={mood === 'think' ? 48 : 50} r="4" fill={INK} />
          <circle cx="70" cy={mood === 'think' ? 48 : 50} r="4" fill={INK} />
          <circle cx="51.5" cy={mood === 'think' ? 46.5 : 48.5} r="1.4" fill="#fff" />
          <circle cx="71.5" cy={mood === 'think' ? 46.5 : 48.5} r="1.4" fill="#fff" />
          {mood === 'sad' && (
            <g stroke={INK} strokeWidth="2.2" strokeLinecap="round"><path d="M44 43 L54 41" /><path d="M76 43 L66 41" /></g>
          )}
        </g>
      )}
      {/* miệng */}
      {mood === 'cheer' ? <path d="M53 58 Q60 70 67 58 Z" fill="#e2726e" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        : mood === 'sad' ? <path d="M54 63 Q60 58 66 63" stroke={INK} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        : mood === 'sleep' ? <circle cx="60" cy="61" r="3" fill={INK} opacity=".7" />
        : mood === 'think' ? <path d="M55 61 L65 60" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
        : <path d="M53 58 Q60 66 67 58" stroke={INK} strokeWidth="2.4" strokeLinecap="round" fill="none" />}
      {mood === 'sleep' && (
        <g className="zzz" fill="#8b7fe8" fontWeight="900" fontFamily="inherit">
          <text x="88" y="30" fontSize="16">z</text><text x="100" y="18" fontSize="12">z</text>
        </g>
      )}
      {mood === 'cheer' && (
        <g className="sparkle" fill="#ffcf5c">
          <path d="M14 22 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" /><path d="M104 14 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" />
        </g>
      )}
      {mood === 'think' && <g fill="#8b7fe8" opacity=".8"><circle cx="96" cy="34" r="3" /><circle cx="104" cy="22" r="5" /></g>}
    </svg>
  )
}

/** Bơ kèm bong bóng lời nói: câu tiếng Anh ngắn, bên dưới là tiếng Việt. */
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
