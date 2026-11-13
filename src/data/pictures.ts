// Hình minh họa (emoji) cho từ vựng. Từ trừu tượng không có hình sẽ dùng hình mặc định theo loại từ.
export const PICTURES: Record<string, string> = {
  advice: '💡', agree: '🤝', arrive: '🚉', borrow: '🤲', busy: '🏃', choose: '👉', crowded: '👥', decide: '🤔',
  describe: '🗣️', forget: '🫥', healthy: '🥗', improve: '📈', invite: '💌', journey: '🧳', lend: '🫴', neighbour: '🏘️',
  order: '🛎️', prefer: '💖', quiet: '🤫', receive: '📬', repair: '🔧', save: '🐷', spend: '💸', tidy: '🧹',
  weather: '⛅', worry: '😟', explain: '👩‍🏫', cheap: '🏷️', dangerous: '⚠️', polite: '🙇', ticket: '🎫', skill: '🛠️',
  enough: '👌', almost: '🤏', instead: '🔁',
  achieve: '🏆', afford: '💳', apply: '📝', attitude: '😊', avoid: '🚫', benefit: '🎁', challenge: '🧗', compare: '⚖️',
  complain: '😤', confident: '😎', consider: '🧐', convenient: '🛒', damage: '💥', 'deal with': '🧩', 'depend on': '🔗',
  develop: '🌱', disappointed: '😞', discuss: '💬', effort: '💪', environment: '🌳', encourage: '📣', experience: '🎒',
  expect: '⏳', familiar: '👋', 'figure out': '🔍', 'give up': '🏳️', habit: '🔂', handle: '🤹', increase: '📈',
  influence: '🧲', manage: '🗂️', opportunity: '🚪', opinion: '💭', 'pay attention': '👀', prevent: '🛡️', provide: '🍽️',
  purpose: '🎯', realise: '😮', reduce: '📉', refuse: '🙅', 'rely on': '🫂', require: '📋', responsible: '🫡',
  result: '📊', solve: '🧠', suggest: '☝️', support: '🤗', affect: '🌊', advantage: '➕', disadvantage: '➖',
  available: '✅', common: '🌍', similar: '👯', necessary: '❗', especially: '⭐', 'look forward to': '🤩',
  significant: '🔆', contribute: '🧱', consequence: '🎳', approach: '🧭', factor: '🧮', issue: '🚧', impact: '☄️',
  evidence: '🔎', establish: '🏛️', maintain: '🧰', essential: '💧', demand: '🛍️', decline: '📉', emphasise: '🖍️',
  enable: '🔓', ensure: '🔒', estimate: '📐', generate: '⚡', indicate: '👉', involve: '🧑‍🤝‍🧑', 'lead to': '➡️',
  obtain: '🪪', occur: '📅', participate: '🙋', policy: '📜', potential: '🌟', priority: '🥇', relevant: '🎯',
  replace: '🔄', resource: '⛏️', solution: '🗝️', sufficient: '🔋', trend: '📈', widespread: '🗺️', rapid: '⚡',
  gradual: '🐢', beneficial: '🌿', drawback: '🕳️', outcome: '🏁', 'play a role': '🎭', 'raise awareness': '📢',
  'cope with': '🧘', 'carry out': '🔬',
}
const BY_POS: Record<string, string> = { adv: '🔗', conj: '🔗', prep: '🔗', phr: '🧩', 'phr v': '🧩' }
export const pictureFor = (word: string, pos: string) => PICTURES[word] ?? BY_POS[pos] ?? '📖'
