// Infi — nhân vật đồng hành hình ký hiệu vô cực (∞), tượng trưng cho không–thời gian.
// Hai vòng là hai con mắt: mắt trái là bầu trời sao (không gian), mắt phải là mặt đồng hồ (thời gian).
export type Mood = 'happy' | 'wave' | 'cheer' | 'sad' | 'sleep' | 'think'

const INK = '#2e2a55'
const BODY = 'M80,54 C68,34 56,26 42,26 C24,26 12,39 12,54 C12,69 24,82 42,82 C56,82 68,74 80,54 C92,34 104,26 118,26 C136,26 148,39 148,54 C148,69 136,82 118,82 C104,82 92,74 80,54 Z'
const spark = (x: number, y: number, r: number) => {
  const k = r * 0.3
  return `M${x} ${y - r} L${x + k} ${y - k} L${x + r} ${y} L${x + k} ${y + k} L${x} ${y + r} L${x - k} ${y + k} L${x - r} ${y} L${x - k} ${y - k}Z`
}
export function Buddy({ mood = 'happy', size = 96 }: { mood?: Mood; size?: number }) {
  const up = mood === 'cheer'
  // Mí mắt: che một phần hai vòng để tạo biểu cảm (cười híp, buồn, ngủ).
  const lids = mood === 'cheer' ? ['M14 66 Q43 50 76 66 L76 90 L14 90Z', 'M84 66 Q117 50 146 66 L146 90 L84 90Z']
    : mood === 'sad' ? ['M10 20 L78 20 L78 38 L10 52Z', 'M82 20 L150 20 L150 52 L82 38Z']
    : mood === 'sleep' ? ['M10 20 H78 V90 H10Z', 'M82 20 H150 V90 H82Z']
    : mood === 'think' ? ['M10 20 H78 V44 H10Z', 'M82 20 H150 V44 H82Z'] : []
  const lash = mood === 'cheer' ? ['M24 62 Q43 51 62 62', 'M98 62 Q117 51 136 62']
    : mood === 'sad' ? ['M22 48 L64 40', 'M138 48 L96 40']
    : mood === 'sleep' ? ['M26 56 Q43 66 60 56', 'M100 56 Q117 66 134 56']
    : mood === 'think' ? ['M22 44 H64', 'M96 44 H138'] : []
  return (
    <svg className={`buddy ${mood}`} width={size * 1.36} height={size} viewBox="0 0 160 118" role="img" aria-label="Infi, bạn đồng hành">
      <defs>
        <linearGradient id="infi-rb" gradientUnits="userSpaceOnUse" x1="12" y1="0" x2="148" y2="0">
          <stop offset="0" stopColor="#7fe0b8" /><stop offset=".5" stopColor="#a99df5" /><stop offset="1" stopColor="#f7a3c8" />
        </linearGradient>
        <radialGradient id="infi-sky" cx=".45" cy=".4" r=".8">
          <stop offset="0" stopColor="#5046b8" /><stop offset="1" stopColor="#1c1843" />
        </radialGradient>
        <radialGradient id="infi-neb" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#f7a3c8" stopOpacity=".55" /><stop offset="1" stopColor="#f7a3c8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="infi-clock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#e9e2ff" />
        </linearGradient>
        <clipPath id="infi-body"><path d={BODY} /></clipPath>
        <clipPath id="infi-l"><rect x="0" y="0" width="80" height="118" /></clipPath>
        <clipPath id="infi-r"><rect x="80" y="0" width="80" height="118" /></clipPath>
      </defs>
      <ellipse className="shade" cx="80" cy="113" rx="30" ry="2.8" fill="#000" opacity=".12" />
      <g className="float">
        {/* tay và chân mọc ra từ mép ngoài của hai vòng */}
        <g strokeWidth="7" strokeLinecap="round" fill="none">
          <path d="M40 82 L38 100" stroke="#6fd3a8" /><path d="M120 82 L122 100" stroke="#f191bd" />
          {up ? <path d="M14 48 L3 31" stroke="#6fd3a8" /> : mood === 'sad' ? <path d="M14 60 L8 76" stroke="#6fd3a8" /> : <path d="M13 56 L2 68" stroke="#6fd3a8" />}
          {up ? <path d="M146 48 L157 31" stroke="#f191bd" />
            : mood === 'wave' || mood === 'think' ? <path className={mood === 'wave' ? 'arm-wave' : ''} d="M147 50 L158 34" stroke="#f191bd" />
            : mood === 'sad' ? <path d="M146 60 L152 76" stroke="#f191bd" /> : <path d="M147 56 L158 68" stroke="#f191bd" />}
        </g>
        <ellipse cx="35" cy="103" rx="10" ry="5.2" fill="#6fd3a8" /><ellipse cx="125" cy="103" rx="10" ry="5.2" fill="#f191bd" />

        <g clipPath="url(#infi-body)">
          {/* mắt trái: không gian — một thiên hà xoắn ốc đang xoay */}
          <g clipPath="url(#infi-l)">
            <rect x="0" y="20" width="80" height="70" fill="url(#infi-sky)" />
            <circle cx="43" cy="54" r="21" fill="url(#infi-neb)" />
            <g transform="rotate(-25 43 54)" fill="none" strokeLinecap="round">
              <ellipse className="swirl s1" cx="43" cy="54" rx="19.5" ry="7.6" pathLength={100} stroke="#fff" strokeWidth=".9" strokeDasharray="2 3" opacity=".5" />
              <ellipse className="swirl s1" cx="43" cy="54" rx="17" ry="6.5" pathLength={100} stroke="#c3baf8" strokeWidth="2.4" strokeDasharray="36 14" opacity=".8" />
              <ellipse className="swirl s2" cx="43" cy="54" rx="13" ry="5" pathLength={100} stroke="#f7a3c8" strokeWidth="2.2" strokeDasharray="34 16" opacity=".85" />
              <ellipse className="swirl s3" cx="43" cy="54" rx="9" ry="3.4" pathLength={100} stroke="#ffe9a8" strokeWidth="2" strokeDasharray="32 18" opacity=".95" />
              <ellipse cx="43" cy="54" rx="5" ry="3.2" fill="#fff8d6" />
            </g>
            <circle cx="43" cy="54" r="1.9" fill="#fff" />
            <g className="twinkle" fill="#fff">
              <circle cx="26" cy="44" r=".9" /><circle cx="58" cy="40" r=".8" /><circle cx="30" cy="68" r=".8" /><circle cx="60" cy="64" r="1" />
              <circle cx="50" cy="72" r=".7" /><circle cx="34" cy="38" r=".7" /><circle cx="22" cy="56" r=".6" />
            </g>
            <path d={spark(57, 47, 2.3)} fill="#ffcf5c" /><path d={spark(28, 57, 1.6)} fill="#c3baf8" />
          </g>
          {/* mắt phải: thời gian — một chiếc đồng hồ cát đang chảy */}
          <g clipPath="url(#infi-r)">
            <rect x="80" y="20" width="80" height="70" fill="url(#infi-clock)" />
            <g stroke="#8b7fe8" strokeWidth="2.4" strokeLinecap="round"><path d="M106 38 H128" /><path d="M106 70 H128" /></g>
            <path d="M108.5 39.5 H125.5 C125.5 47 119 50 118.2 54 C119 58 125.5 61 125.5 68.5 H108.5 C108.5 61 115 58 115.8 54 C115 50 108.5 47 108.5 39.5Z"
              fill="#fff" stroke="#b9b0f3" strokeWidth="1.3" />
            <path d="M111.3 45 H122.7 C121.5 48.5 118.6 50.5 117.6 53 H116.4 C115.4 50.5 112.5 48.5 111.3 45Z" fill="#ffcf5c" />
            <path className="sand" d="M117 53 V63" stroke="#ffcf5c" strokeWidth="1.2" strokeDasharray="1.2 1.4" />
            <path d="M110 68 C110.5 64.5 114 62 117 61 C120 62 123.5 64.5 124 68Z" fill="#ffcf5c" />
            <path d="M111.5 43 Q113 41.5 115 41.5" stroke="#fff" strokeWidth="1" strokeLinecap="round" fill="none" />
            <g fill="#b9b0f3"><circle cx="102" cy="48" r=".9" /><circle cx="132" cy="58" r=".9" /><circle cx="101" cy="62" r=".7" /><circle cx="133" cy="46" r=".7" /></g>
          </g>
          {/* mí mắt theo biểu cảm */}
          {lids.map((d, i) => <path key={i} d={d} fill="url(#infi-rb)" />)}
          {lids.map((d, i) => <path key={`w${i}`} d={d} fill="#fff" opacity=".28" />)}
          {lash.map((d, i) => <path key={`l${i}`} d={d} stroke={INK} strokeWidth="2.2" strokeLinecap="round" fill="none" />)}
        </g>

        {/* dải vô cực, cùng dải bụi sao và vệt sáng chạy dọc theo nó */}
        <path d={BODY} fill="none" stroke="url(#infi-rb)" strokeWidth="16" strokeLinejoin="round" />
        <path d="M22 34 Q36 24 52 29" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".5" />
        <path d="M98 28 Q114 24 132 36" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".5" />
        <path className="dust" d={BODY} pathLength={100} fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.01 2.5" opacity=".55" />
        <path className="comet" d={BODY} pathLength={100} fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeDasharray="7 93" opacity=".3" />
        <path className="comet" d={BODY} pathLength={100} fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="4 96" opacity=".95" />

        {/* má và miệng ở chỗ hai vòng giao nhau */}
        <circle cx="67" cy="67" r="3.6" fill="#ff9db5" opacity=".9" /><circle cx="93" cy="67" r="3.6" fill="#ff9db5" opacity=".9" />
        {mood === 'cheer' ? <path d="M75 51 Q80 61 85 51 Z" fill="#e2726e" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
          : mood === 'sad' ? <path d="M76 57 Q80 53 84 57" stroke={INK} strokeWidth="2.3" strokeLinecap="round" fill="none" />
          : mood === 'sleep' ? <circle cx="80" cy="55" r="2.4" fill={INK} opacity=".8" />
          : mood === 'think' ? <path d="M76 55.5 L84 53.5" stroke={INK} strokeWidth="2.3" strokeLinecap="round" />
          : <path d="M75 52 Q80 58 85 52" stroke={INK} strokeWidth="2.3" strokeLinecap="round" fill="none" />}
      </g>
      {/* sao lấp lánh xung quanh */}
      <g className="twinkle"><path d={spark(80, 10, 4)} fill="#ffcf5c" /><path d={spark(10, 18, 2.6)} fill="#c3baf8" /><path d={spark(150, 16, 2.4)} fill="#c3baf8" /></g>
      {mood === 'sleep' && (
        <g className="zzz" fill="#b3a8f7" fontWeight="900" fontFamily="inherit">
          <text x="92" y="24" fontSize="15">z</text><text x="104" y="13" fontSize="11">z</text>
        </g>
      )}
      {mood === 'cheer' && (
        <g className="sparkle" fill="#ffcf5c"><path d={spark(36, 12, 4.5)} /><path d={spark(124, 10, 3.5)} /><path d={spark(58, 4, 2.4)} /></g>
      )}
      {mood === 'think' && <g fill="#b3a8f7" opacity=".9"><circle cx="150" cy="24" r="2.6" /><circle cx="156" cy="13" r="4.2" /></g>}
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
