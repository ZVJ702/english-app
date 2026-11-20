// Nhân vật Infi: dải Möbius không – thời gian (bản 3, màu của app), vẽ 3D bằng canvas.
// Vòng trái là Không gian, vòng phải là Thời gian; các hình vẽ chạy dọc theo dải.
/* eslint-disable */

const TAU = Math.PI * 2
const INK = '#3d3560'
// ----- hình vẽ nét chì, toạ độ trong ô vuông đơn vị (-0.5..0.5) -----
const lw = (ctx, k) => { ctx.lineWidth = k; ctx.lineCap = 'round'; ctx.lineJoin = 'round' }
function sparkle(ctx, x, y, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill() }
const DRAW = {
  galaxy(ctx, it, time) {
    ctx.rotate(time * 0.25); ctx.strokeStyle = '#f1ede4'
    for (let k = 0; k < 4; k++) { lw(ctx, 0.035 - k * 0.006); ctx.globalAlpha *= 0.95; ctx.beginPath(); ctx.ellipse(0, 0, 0.46 - k * 0.1, 0.2 - k * 0.045, -0.25, 0.3 + k, 0.3 + k + 4.6); ctx.stroke() }
    ctx.fillStyle = '#fffbe9'; ctx.beginPath(); ctx.ellipse(0, 0, 0.07, 0.04, -0.25, 0, TAU); ctx.fill()
  },
  saturn(ctx) {
    ctx.strokeStyle = '#f1ede4'; ctx.fillStyle = '#4a4b58'; lw(ctx, 0.05)
    ctx.beginPath(); ctx.arc(0, 0, 0.24, 0, TAU); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.ellipse(0, 0.02, 0.5, 0.11, -0.18, 0, TAU); ctx.stroke()
    lw(ctx, 0.025); ctx.beginPath(); ctx.moveTo(-0.17, -0.08); ctx.lineTo(0.18, -0.12); ctx.stroke()
  },
  starW(ctx) { sparkle(ctx, 0, 0, 0.5, '#f6f2e8') },
  dotW(ctx) { ctx.fillStyle = '#f6f2e8'; ctx.beginPath(); ctx.arc(0, 0, 0.5, 0, TAU); ctx.fill() },
  rocket(ctx) {
    ctx.strokeStyle = INK; ctx.fillStyle = '#f7f3ea'; lw(ctx, 0.045)
    // vệt khói phía sau
    ctx.beginPath(); for (const y of [-0.08, 0.02, 0.12]) { ctx.moveTo(-0.5, y); ctx.lineTo(-0.2, y * 0.6) } ctx.stroke()
    ctx.beginPath(); ctx.moveTo(-0.2, -0.13); ctx.quadraticCurveTo(0.25, -0.17, 0.45, 0); ctx.quadraticCurveTo(0.25, 0.17, -0.2, 0.13); ctx.closePath(); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(-0.12, -0.13); ctx.lineTo(-0.24, -0.3); ctx.lineTo(0.02, -0.15); ctx.moveTo(-0.12, 0.13); ctx.lineTo(-0.24, 0.3); ctx.lineTo(0.02, 0.15); ctx.stroke()
    ctx.beginPath(); ctx.arc(0.17, 0, 0.055, 0, TAU); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0.04, -0.16); ctx.lineTo(0.04, 0.16); ctx.stroke()
  },
  satellite(ctx) {
    ctx.strokeStyle = INK; ctx.fillStyle = '#f7f3ea'; lw(ctx, 0.05)
    ctx.beginPath(); ctx.rect(-0.12, -0.12, 0.24, 0.24); ctx.fill(); ctx.stroke()
    for (const sgn of [-1, 1]) { ctx.beginPath(); ctx.rect(sgn > 0 ? 0.16 : -0.5, -0.1, 0.34, 0.2); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(sgn * 0.33, -0.1); ctx.lineTo(sgn * 0.33, 0.1); ctx.stroke() }
  },
  starI(ctx) { sparkle(ctx, 0, 0, 0.5, INK) },
  comet(ctx) { ctx.strokeStyle = INK; lw(ctx, 0.06); ctx.beginPath(); ctx.moveTo(-0.5, -0.2); ctx.lineTo(0.2, 0); ctx.moveTo(-0.45, 0.05); ctx.lineTo(0.2, 0.02); ctx.stroke(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(0.28, 0.01, 0.1, 0, TAU); ctx.fill() },
  sundial(ctx) {
    ctx.strokeStyle = INK; ctx.fillStyle = '#ece6d8'; lw(ctx, 0.04)
    ctx.beginPath(); ctx.ellipse(0, 0.12, 0.46, 0.2, 0, 0, TAU); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.ellipse(0, 0.2, 0.46, 0.2, 0, 0, Math.PI); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(-0.46, 0.12); ctx.lineTo(-0.46, 0.2); ctx.moveTo(0.46, 0.12); ctx.lineTo(0.46, 0.2); ctx.stroke()
    lw(ctx, 0.018); for (let k = 0; k < 9; k++) { const a = Math.PI + (k / 8) * Math.PI; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 0.3, 0.12 + Math.sin(a) * 0.13); ctx.lineTo(Math.cos(a) * 0.4, 0.12 + Math.sin(a) * 0.17); ctx.stroke() }
    ctx.fillStyle = '#56545e'; lw(ctx, 0.035); ctx.beginPath(); ctx.moveTo(-0.05, 0.12); ctx.lineTo(0.08, -0.45); ctx.lineTo(0.12, 0.1); ctx.closePath(); ctx.fill(); ctx.stroke()
  },
  clock(ctx, it, time) {
    ctx.strokeStyle = INK; ctx.fillStyle = '#fbf8f1'; lw(ctx, 0.045)
    ctx.beginPath(); ctx.arc(0, 0, 0.44, 0, TAU); ctx.fill(); ctx.stroke(); lw(ctx, 0.02); ctx.beginPath(); ctx.arc(0, 0, 0.37, 0, TAU); ctx.stroke()
    for (let k = 0; k < 12; k++) { const a = (k / 12) * TAU; lw(ctx, k % 3 ? 0.018 : 0.035); ctx.beginPath(); ctx.moveTo(Math.sin(a) * 0.29, -Math.cos(a) * 0.29); ctx.lineTo(Math.sin(a) * 0.35, -Math.cos(a) * 0.35); ctx.stroke() }
    const m = time * 0.6, hh = m / 12
    lw(ctx, 0.045); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(hh) * 0.18, -Math.cos(hh) * 0.18); ctx.stroke()
    lw(ctx, 0.03); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(m) * 0.27, -Math.cos(m) * 0.27); ctx.stroke()
  },
  alarm(ctx, it, time) {
    ctx.strokeStyle = INK; ctx.fillStyle = '#ece6d8'; lw(ctx, 0.045)
    ctx.beginPath(); ctx.moveTo(-0.25, 0.3); ctx.lineTo(-0.33, 0.45); ctx.moveTo(0.25, 0.3); ctx.lineTo(0.33, 0.45); ctx.stroke()
    for (const sgn of [-1, 1]) { ctx.beginPath(); ctx.arc(sgn * 0.24, -0.33, 0.12, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke() }
    ctx.beginPath(); ctx.moveTo(-0.06, -0.47); ctx.lineTo(0.06, -0.47); ctx.moveTo(0, -0.47); ctx.lineTo(0, -0.4); ctx.stroke()
    ctx.fillStyle = '#fbf8f1'; ctx.beginPath(); ctx.arc(0, 0, 0.36, 0, TAU); ctx.fill(); ctx.stroke()
    lw(ctx, 0.02); ctx.beginPath(); ctx.arc(0, 0, 0.29, 0, TAU); ctx.stroke()
    const m = time * 2.4
    lw(ctx, 0.04); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0.12, -0.1); ctx.stroke()
    lw(ctx, 0.022); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(m) * 0.24, -Math.cos(m) * 0.24); ctx.stroke()
    ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(0, 0.04); ctx.lineTo(-0.05, -0.03); ctx.lineTo(0.05, -0.03); ctx.closePath(); ctx.fill()
  },
  tick(ctx, it) { ctx.strokeStyle = INK; lw(ctx, it.major ? 0.26 : 0.16); ctx.beginPath(); ctx.moveTo(0, -0.5); ctx.lineTo(0, it.major ? 0.5 : 0.1); ctx.stroke() },
  rule(ctx) { ctx.strokeStyle = INK; lw(ctx, 0.12); ctx.beginPath(); ctx.moveTo(-0.5, 0); ctx.lineTo(0.5, 0); ctx.stroke() },
  year(ctx, it) { ctx.fillStyle = '#5b5960'; ctx.font = '800 0.4px Nunito Variable, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(it.text, 0, 0.15) },
  arrow(ctx) { ctx.strokeStyle = INK; lw(ctx, 0.07); ctx.beginPath(); ctx.moveTo(-0.45, 0); ctx.lineTo(0.42, 0); ctx.moveTo(0.22, -0.18); ctx.lineTo(0.44, 0); ctx.lineTo(0.22, 0.18); ctx.stroke() },
  dash(ctx) { ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(0, 0, 0.5, 0.22, 0, 0, TAU); ctx.fill() },
}
// vùng hiển thị: s = mức "vòng Không gian", b = mức "tường sau"
const Z = {
  spaceBack: (s, b) => s * b, spaceFront: (s, b) => s * (1 - b) * (s > 0.85 ? 1 : 0),
  timeBack: (s, b) => (1 - s) * b * (s < 0.15 ? 1 : 0), timeFront: (s, b) => (1 - s) * (1 - b) * (s < 0.15 ? 1 : 0),
  cross: (s, b) => Math.max(0, 1 - Math.abs(s - 0.5) * 2.4) * (1 - b),
}
const loop = (left, s) => ((left ? Math.PI / 2 : -Math.PI / 2) + 0.45 + (((s % 1) + 1) % 1) * (Math.PI - 0.9)) / TAU
function items(time) {
  const v = time * 0.022, out = []
  const add = (o) => out.push(o)
  // Không gian: tường sau tối (thiên hà, sao Thổ, sao) và tường trước sáng (tên lửa, vệ tinh, sao chổi)
  for (let k = 0; k < 2; k++) {
    add({ kind: 'galaxy', u: loop(true, k / 2 + v), v: 0.08, size: 0.72, zone: Z.spaceBack })
    add({ kind: 'saturn', u: loop(true, k / 2 + 0.22 + v), v: 0.12, size: 0.48, zone: Z.spaceBack })
    add({ kind: 'rocket', u: loop(true, k / 2 + 0.05 + v), v: -0.12, size: 0.66, zone: Z.spaceFront })
    add({ kind: 'satellite', u: loop(true, k / 2 + 0.3 + v), v: 0.3, size: 0.46, zone: Z.spaceFront })
    add({ kind: 'comet', u: loop(true, k / 2 + 0.17 + v), v: 0.5, size: 0.3, zone: Z.spaceFront })
  }
  for (let k = 0; k < 22; k++) {
    add({ kind: k % 3 ? 'dotW' : 'starW', u: loop(true, k / 22 + v * 0.8), v: ((k * 53) % 19) / 9.5 - 1, size: k % 3 ? 0.035 : 0.1, zone: Z.spaceBack })
    if (k % 2) add({ kind: 'starI', u: loop(true, k / 22 + 0.03 + v), v: ((k * 29) % 17) / 8.5 - 1, size: 0.085, zone: Z.spaceFront })
  }
  // Thời gian: tường sau (đồng hồ mặt trời, đồng hồ treo) và tường trước (thước dòng thời gian, đồng hồ nguyên tử)
  for (let k = 0; k < 2; k++) {
    add({ kind: 'sundial', u: loop(false, k / 2 + 0.55 + v), v: 0.1, size: 0.62, zone: Z.timeBack })
    add({ kind: 'clock', u: loop(false, k / 2 + 0.78 + v), v: 0.18, size: 0.5, zone: Z.timeBack })
  }
  for (let k = 0; k < 6; k++) add({ kind: 'dash', u: loop(false, k / 6 + v), v: -0.05, size: 0.05, zone: Z.timeBack })
  add({ kind: 'alarm', u: (-0.62 + TAU) / TAU, v: 0.12, size: 0.55, zone: Z.timeFront })
  for (let k = 0; k < 40; k++) add({ kind: 'tick', major: k % 5 === 0, u: loop(false, k / 40 + v), v: -0.66, size: 0.12, zone: Z.timeFront })
  for (let k = 0; k < 24; k++) add({ kind: 'rule', u: loop(false, k / 24), v: -0.66, size: 0.07, zone: Z.timeFront })
  for (let k = 0; k < 4; k++) add({ kind: 'year', text: ['1900', '2000', '2100', '3000'][k], u: loop(false, k / 4 + 0.03 + v), v: -0.3, size: 0.26, zone: Z.timeFront })
  // dải vắt chéo: mũi tên chỉ hướng đi
  add({ kind: 'arrow', u: 0.755, v: 0.25, size: 0.42, zone: Z.cross })
  for (let k = 0; k < 3; k++) add({ kind: 'dash', u: 0.73 - k * 0.012, v: -0.2, size: 0.03, zone: Z.cross })
  return out
}


  
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
  const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k]
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
  const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l] }
  const sm = (a, b, x) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k) }
  const lerp = (a, b, k) => a.map((x, i) => x + (b[i] - x) * k)

  function Mobius(opts) {
    const cv = opts.canvas, ctx = cv.getContext('2d')
    const N = opts.segments || 260
    const A = opts.A ?? 1.5, Wd = opts.W ?? 0.3, DEPTH = opts.depth ?? 0.2
    const CROSS = 1.5 * Math.PI // dải vắt chéo phía trước (gần người xem)
    const curve = (t) => {
      const s = Math.sin(t), c = Math.cos(t), d = 1 + s * s
      return [A * c / d, A * 1.15 * s * c / d + DEPTH * s, 0]
    }
    const twist = opts.twist || ((t) => { const u = t >= 0 && t <= TAU ? t : ((t % TAU) + TAU) % TAU; return Math.PI / 2 + Math.PI * sm(CROSS - 0.95, CROSS + 0.95, u) })
    function frame(t) {
      const p = curve(t), T = norm(sub(curve(t + 1e-4), curve(t - 1e-4)))
      const S = norm(cross(T, [0, 0, 1])), U = cross(S, T)
      const f = twist(t)
      const W = add(mul(S, Math.cos(f)), mul(U, Math.sin(f)))
      return { t, p, T, W, n: norm(cross(W, T)) }
    }
    const frames = Array.from({ length: N + 1 }, (_, i) => frame((i / N) * TAU))
    // vùng: 0 = Thời gian (phải), 1 = Không gian (trái); tường sau (y > 0) hay tường trước
    const spaceAmt = (p) => sm(0.12, -0.25, p[0])
    const backAmt = (p) => sm(-0.02, 0.12, p[1])

    function render(time) {
      const w = cv.width, h = cv.height
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const yaw = (opts.sway ?? 0.1) * Math.sin(time * 0.45), tilt = opts.tilt ?? -0.5
      const cyw = Math.cos(yaw), syw = Math.sin(yaw), ct = Math.cos(tilt), st = Math.sin(tilt)
      const bob = 0.025 * Math.sin(time * 1.3)
      const rot = (v) => { const x = v[0] * cyw - v[1] * syw, y = v[0] * syw + v[1] * cyw, z = v[2]; return [x, y * ct - z * st + bob, y * st + z * ct] }
      const Dc = 6, F = w * (opts.zoom ?? 1.55)
      const proj = (v) => { const k = F / (Dc - v[2]); return [w / 2 + v[0] * k, h * (opts.cy ?? 0.5) - v[1] * k] }
      const toCam = (v) => norm(sub([0, 0, Dc], v))
      const L = norm([-0.45, 0.5, 0.75])
      const P = opts.palette
      const list = []
      for (let i = 0; i < N; i++) {
        const f0 = frames[i], f1 = frames[i + 1]
        const a0 = rot(add(f0.p, mul(f0.W, Wd))), a1 = rot(add(f1.p, mul(f1.W, Wd)))
        const b0 = rot(sub(f0.p, mul(f0.W, Wd))), b1 = rot(sub(f1.p, mul(f1.W, Wd)))
        const mid = mul(add(add(a0, a1), add(b0, b1)), 0.25)
        let n = rot(norm(add(f0.n, f1.n)))
        const facing = dot(n, toCam(mid)) >= 0 ? 1 : -1
        n = mul(n, facing)
        const shade = 0.72 + 0.28 * Math.max(0, dot(n, L))
        const pw = mul(add(f0.p, f1.p), 0.5)
        const dark = spaceAmt(pw) * backAmt(pw) // bầu trời đêm: tường sau của vòng Không gian
        const base = lerp(P.paper, P.night, dark)
        const quad = [a0, a1, b1, b0].map(proj)
        list.push({ z: mid[2], draw: () => {
          ctx.fillStyle = `rgb(${base.map((c) => Math.round(c * shade)).join(',')})`
          ctx.beginPath(); quad.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill()
          ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1; ctx.stroke()
          // nét chì đánh bóng ở mặt tối
          if (shade < 0.86 && i % 3 === 0) { ctx.strokeStyle = P.hatch; ctx.lineWidth = w * 0.0012; ctx.beginPath(); ctx.moveTo(quad[0][0], quad[0][1]); ctx.lineTo(quad[3][0], quad[3][1]); ctx.stroke() }
          // viền mực hai mép dải
          ctx.strokeStyle = P.ink; ctx.lineWidth = w * 0.0042; ctx.lineCap = 'round'
          ctx.beginPath(); ctx.moveTo(quad[0][0], quad[0][1]); ctx.lineTo(quad[1][0], quad[1][1]); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(quad[3][0], quad[3][1]); ctx.lineTo(quad[2][0], quad[2][1]); ctx.stroke()
        } })
      }
      // hình vẽ in trên mặt dải: dán theo phối cảnh của dải, chỉ hiện trong vùng của nó
      for (const it of opts.items(time)) {
        const t = ((it.u % 1) + 1) % 1 * TAU
        const f = frame(t)
        const weight = it.zone(spaceAmt(f.p), backAmt(f.p)) * (it.a ?? 1)
        if (weight < 0.03) continue
        const up = f.W[2] >= 0 ? f.W : mul(f.W, -1)
        const Pw = add(f.p, mul(up, (it.v || 0) * Wd))
        const c = rot(Pw), zc = rot(f.p)[2] // xếp lớp theo tâm dải, không theo điểm đặt hình
        const o = proj(c)
        const px = proj(rot(add(Pw, mul(f.T, it.size)))), py = proj(rot(sub(Pw, mul(up, it.size))))
        let ex = [px[0] - o[0], px[1] - o[1]]
        const ey = [py[0] - o[0], py[1] - o[1]]
        if (ex[0] * ey[1] - ex[1] * ey[0] < 0) ex = [-ex[0], -ex[1]] // tránh hình bị lật gương
        list.push({ z: zc + (opts.itemLift ?? 0.07), draw: () => {
          ctx.save(); ctx.globalAlpha = Math.min(1, weight)
          ctx.setTransform(ex[0], ex[1], ey[0], ey[1], o[0], o[1])
          // giữ hình nằm gọn trong bề cao của dải
          const top = -(1 - (it.v || 0)) * Wd / it.size, bottom = (1 + (it.v || 0)) * Wd / it.size
          ctx.beginPath(); ctx.rect(-50, top, 100, bottom - top); ctx.clip()
          opts.drawItem(ctx, it, time)
          ctx.restore()
        } })
      }
      list.sort((a, b) => a.z - b.z)
      for (const d of list) d.draw()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      if (opts.overlay) opts.overlay(ctx, w, h, (t, v = 0) => { const f = frame(t); const up = f.W[2] >= 0 ? f.W : mul(f.W, -1); return proj(rot(add(f.p, mul(up, v * Wd)))) })
    }
    return { render }
  }

const TWIST = (t) => Math.PI / 2 + Math.min(Math.max(t, 0), Math.PI * 2) / 2
/** Tạo một bản vẽ trên canvas. Trả về hàm render(time). */
export function createMobius(canvas, small) {
  return Mobius({
    canvas, items, drawItem: (ctx, it, time) => DRAW[it.kind](ctx, it, time),
    palette: { paper: [250, 246, 255], night: [43, 36, 112], ink: INK, hatch: 'rgba(61,53,96,0.2)' },
    A: 1.6, W: 0.38, depth: 0.26, tilt: -0.55, zoom: 1.4, cy: 0.5, sway: 0.07, twist: TWIST, segments: small ? 140 : 220,
  }).render
}
