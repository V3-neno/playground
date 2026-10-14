/*
 * Offline placeholder images (SVG data URIs), so media components work without the network.
 *   placeholder({ seed: 3, width: 800, height: 500, label: 'Fjord' })
 *   PHOTOS: ready-made scenes [{ src, title, seed }]
 *   avatar('Ada Lovelace'): initials avatar data URI
 */
const PALETTES = [
  ['#ffb88c', '#de6262', '#3b1d3a', '#ffe29f'], // sunset
  ['#a1c4fd', '#c2e9fb', '#2c3e70', '#ffffff'], // sky
  ['#0f2027', '#2c5364', '#e0eafc', '#9be15d'], // night lake
  ['#f6d365', '#fda085', '#7a2e3a', '#fff3b0'], // desert
  ['#84fab0', '#8fd3f4', '#1d4e5f', '#ffffff'], // lagoon
  ['#c471f5', '#fa71cd', '#2a0a3b', '#fdfbfb'], // neon
  ['#e0c3fc', '#8ec5fc', '#3d3a6b', '#ffffff'], // lavender
  ['#43e97b', '#38f9d7', '#0b3d2e', '#f9f871'], // forest
]
const TITLES = ['Ember Ridge', 'High Clouds', 'Night Lake', 'Dune Sea', 'Lagoon', 'Neon Valley', 'Lavender Hills', 'Evergreen']

function rand(seed) {
  let t = seed * 9301 + 49297
  return () => {
    t = (t * 9301 + 49297) % 233280
    return t / 233280
  }
}

const enc = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

export function placeholder({ seed = 0, width = 800, height = 500, label } = {}) {
  const [a, b, dark, light] = PALETTES[seed % PALETTES.length]
  const r = rand(seed + 1)
  const ridge = (base, amp, n) => {
    let d = `M0 ${height}`
    for (let i = 0; i <= n; i++) d += ` L${(i / n) * width} ${base - r() * amp}`
    return d + ` L${width} ${height} Z`
  }
  const sunX = width * (0.2 + r() * 0.6)
  const sunY = height * (0.25 + r() * 0.15)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
<rect width="100%" height="100%" fill="url(#g)"/>
<circle cx="${sunX}" cy="${sunY}" r="${height * 0.11}" fill="${light}" opacity="0.85"/>
<path d="${ridge(height * 0.68, height * 0.22, 7)}" fill="${dark}" opacity="0.45"/>
<path d="${ridge(height * 0.82, height * 0.18, 11)}" fill="${dark}" opacity="0.8"/>
${label ? `<text x="24" y="${height - 24}" font-family="system-ui,sans-serif" font-size="${Math.round(height / 14)}" font-weight="700" fill="${light}">${label}</text>` : ''}
</svg>`
  return enc(svg)
}

export const PHOTOS = TITLES.map((title, seed) => ({ seed, title, src: placeholder({ seed, width: 1200, height: 750 }) }))

const AVATAR_BG = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#0ea5e9', '#22c55e']

export function avatar(name = '?', size = 96) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
  const h = [...name].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
<rect width="100" height="100" fill="${AVATAR_BG[h % AVATAR_BG.length]}"/>
<text x="50" y="50" dy="0.35em" text-anchor="middle" font-family="system-ui,sans-serif" font-size="40" font-weight="600" fill="#fff">${initials}</text>
</svg>`
  return enc(svg)
}

/** A few people for avatars, testimonials, tables. */
export const PEOPLE = [
  { name: 'Ada Lovelace', role: 'Founder', email: 'ada@example.com' },
  { name: 'Linus Berg', role: 'Engineer', email: 'linus@example.com' },
  { name: 'Maya Chen', role: 'Designer', email: 'maya@example.com' },
  { name: 'Omar Haddad', role: 'Product', email: 'omar@example.com' },
  { name: 'Sofia Rossi', role: 'Marketing', email: 'sofia@example.com' },
  { name: 'Kwame Mensah', role: 'Sales', email: 'kwame@example.com' },
].map((p) => ({ ...p, avatar: avatar(p.name) }))
