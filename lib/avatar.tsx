import type { Look } from './looks'
import type { Outfit } from './wardrobe'

// Pixel person, 16 x 24. Painted in "local" coordinates (12 wide, head at cols 3-8, rows 4-9)
// and shifted by DX/DY so hats can rise above the head. An outline is added around everything.
export const AV_W = 16
export const AV_H = 24
const DX = 2
const DY = 4

type Grid = (string | null)[][]

const OUTLINE = '#120d0a'
const EYE = '#120d0a'

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16)
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt)))
  const r = ch(n >> 16), g = ch((n >> 8) & 255), b = ch(n & 255)
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
}

export function paintAvatar(look: Look, outfit: Outfit): Grid {
  const g: Grid = Array.from({ length: AV_H }, () => Array(AV_W).fill(null))
  const set = (x: number, y: number, c: string) => {
    const gx = x + DX, gy = y + DY
    if (gx >= 0 && gx < AV_W && gy >= 0 && gy < AV_H) g[gy][gx] = c
  }
  const rect = (x0: number, y0: number, x1: number, y1: number, c: string) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, c)
  }

  const skin = look.skin
  const skinDark = shade(skin, -28)
  const hair = look.hairColor
  const hairHi = shade(hair, 22)
  const top = look.top
  const topDark = shade(top, -22)

  // Cape sits behind the body
  if (outfit.back === 'cape') {
    rect(1, 11, 10, 18, '#9b1c2e')
    rect(1, 18, 10, 18, '#7a1222')
  }

  // Backpack peeks out behind the shoulders
  if (outfit.back === 'backpack') {
    rect(1, 10, 10, 16, '#2e7d6b')
    rect(1, 10, 10, 10, '#3fa08a')
  }

  // Long hair falls behind the shoulders
  if (look.hair === 'long') {
    rect(2, 4, 9, 14, hair)
  }

  // Head
  rect(3, 4, 8, 9, skin)
  rect(4, 10, 7, 10, skin)
  set(3, 9, skinDark); set(8, 9, skinDark)
  set(4, 6, EYE); set(7, 6, EYE)
  set(5, 8, shade(skin, -45)); set(6, 8, shade(skin, -45))

  // Body
  rect(2, 11, 9, 15, top)
  rect(1, 12, 1, 14, top); rect(10, 12, 10, 14, top)
  set(1, 15, skin); set(10, 15, skin)
  rect(2, 15, 9, 15, topDark)
  rect(3, 16, 8, 16, look.pants)
  rect(3, 17, 4, 18, look.pants); rect(7, 17, 8, 18, look.pants)
  rect(3, 19, 4, 19, '#2a1d16'); rect(7, 19, 8, 19, '#2a1d16')

  // Beard
  if (look.beard !== 'none') {
    const b = look.beard === 'full' ? hair : shade(skin, -38)
    set(3, 7, b); set(8, 7, b)
    set(3, 8, b); set(4, 8, b); set(7, 8, b); set(8, 8, b)
    rect(4, 9, 7, 9, b)
    if (look.beard === 'full') rect(5, 10, 6, 10, b)
  }

  // Hair
  switch (look.hair) {
    case 'short':
      rect(4, 2, 8, 2, hair); rect(3, 3, 8, 3, hair)
      set(3, 4, hair); set(8, 4, hair); set(3, 5, hair); set(8, 5, hair)
      set(5, 2, hairHi); set(6, 3, hairHi)
      break
    case 'curly':
      rect(4, 1, 7, 1, hair); rect(3, 2, 8, 2, hair); rect(2, 3, 9, 3, hair)
      set(2, 4, hair); set(3, 4, hair); set(8, 4, hair); set(9, 4, hair)
      set(2, 5, hair); set(9, 5, hair)
      set(4, 2, hairHi); set(7, 2, hairHi); set(3, 3, hairHi); set(6, 3, hairHi); set(9, 3, hairHi)
      break
    case 'buzz':
      rect(4, 3, 7, 3, hair); set(3, 4, hair); set(8, 4, hair)
      set(5, 3, hairHi)
      break
    case 'long':
      rect(4, 2, 7, 2, hair); rect(3, 3, 8, 3, hair)
      rect(3, 4, 3, 9, hair); rect(8, 4, 8, 9, hair)
      rect(2, 4, 2, 14, hair); rect(9, 4, 9, 14, hair)
      set(4, 4, hair); set(5, 4, hair)
      set(5, 2, hairHi); set(4, 3, hairHi); set(2, 8, hairHi); set(9, 10, hairHi)
      break
    case 'bob':
      rect(4, 2, 7, 2, hair); rect(3, 3, 8, 3, hair)
      rect(2, 4, 3, 9, hair); rect(8, 4, 9, 9, hair)
      set(4, 3, hairHi)
      break
    case 'ponytail':
      rect(4, 2, 7, 2, hair); rect(3, 3, 8, 3, hair)
      set(3, 4, hair); set(8, 4, hair)
      rect(9, 3, 10, 3, hair); rect(10, 4, 10, 8, hair)
      set(5, 2, hairHi)
      break
  }

  // Backpack straps
  if (outfit.back === 'backpack') {
    rect(3, 11, 3, 14, '#1f5a4c'); rect(8, 11, 8, 14, '#1f5a4c')
  }

  // Face item
  if (outfit.face === 'shades') {
    rect(3, 6, 8, 6, '#0b0b12'); set(4, 6, '#3d5a8a'); set(7, 6, '#3d5a8a')
  }
  if (outfit.face === 'glasses') {
    set(3, 6, '#2b2b33'); set(5, 6, '#2b2b33'); set(6, 6, '#2b2b33'); set(8, 6, '#2b2b33')
    set(4, 5, '#2b2b33'); set(7, 5, '#2b2b33')
  }
  if (outfit.face === 'monocle') {
    set(6, 6, '#f5c542'); set(8, 6, '#f5c542'); set(7, 5, '#f5c542'); set(7, 7, '#f5c542')
    set(8, 8, '#c99a1f'); set(8, 9, '#c99a1f'); set(9, 10, '#c99a1f')
  }

  // Head item
  switch (outfit.head) {
    case 'partyhat':
      set(6, -2, '#f5c542')
      rect(5, -1, 6, -1, '#e84393'); rect(5, 0, 7, 0, '#4fc3e8'); rect(4, 1, 7, 1, '#e84393'); rect(4, 2, 8, 2, '#4fc3e8')
      break
    case 'beanie':
      rect(3, 1, 8, 3, '#c0392b'); rect(3, 3, 8, 3, '#e8e2d0'); rect(5, 0, 6, 0, '#e8e2d0')
      break
    case 'headphones':
      rect(4, 1, 7, 1, '#2b2b33'); set(3, 2, '#2b2b33'); set(8, 2, '#2b2b33')
      rect(2, 3, 2, 3, '#2b2b33'); rect(9, 3, 9, 3, '#2b2b33')
      rect(2, 5, 2, 7, '#e74c3c'); rect(9, 5, 9, 7, '#e74c3c')
      break
    case 'cap':
      rect(4, 1, 7, 1, '#f5c542'); rect(3, 2, 8, 3, '#f5c542')
      rect(2, 3, 9, 3, '#c99a1f'); set(5, 2, '#1d2a4d'); set(6, 2, '#1d2a4d')
      break
    case 'wizard':
      set(6, -3, '#5b3aa8'); rect(5, -2, 6, -2, '#5b3aa8'); rect(5, -1, 7, -1, '#5b3aa8')
      rect(4, 0, 7, 0, '#5b3aa8'); rect(4, 1, 8, 1, '#5b3aa8'); set(6, 0, '#f5c542')
      rect(2, 2, 9, 3, '#4a2e8c'); set(5, 1, '#f5c542')
      break
    case 'viking':
      rect(4, 1, 7, 1, '#9aa4b0'); rect(3, 2, 8, 3, '#9aa4b0'); rect(3, 3, 8, 3, '#6b4f3a')
      set(5, 1, '#d6dde6'); set(4, 2, '#d6dde6')
      set(2, 1, '#f4efe0'); set(1, 0, '#f4efe0'); set(1, -1, '#f4efe0')
      set(9, 1, '#f4efe0'); set(10, 0, '#f4efe0'); set(10, -1, '#f4efe0')
      break
    case 'tophat':
      rect(4, -2, 7, 2, '#15151c'); rect(4, 1, 7, 1, '#9b1c2e'); rect(2, 3, 9, 3, '#15151c')
      break
    case 'elfhat':
      rect(3, 1, 8, 2, '#2e8b3e'); rect(4, 0, 8, 0, '#2e8b3e'); rect(6, -1, 9, -1, '#2e8b3e'); rect(9, 0, 10, 0, '#2e8b3e')
      set(5, 1, '#c0392b'); set(7, 0, '#c0392b')
      rect(3, 3, 8, 3, '#f4efe0'); set(10, 1, '#f4efe0'); set(11, 1, '#f4efe0')
      break
    case 'antlers':
      set(3, 3, '#8a5a32'); set(8, 3, '#8a5a32')
      rect(2, 0, 2, 2, '#8a5a32'); set(1, -1, '#8a5a32'); set(1, -2, '#8a5a32'); set(3, -1, '#a8743f'); set(0, 0, '#a8743f')
      rect(9, 0, 9, 2, '#8a5a32'); set(10, -1, '#8a5a32'); set(10, -2, '#8a5a32'); set(8, -1, '#a8743f'); set(11, 0, '#a8743f')
      break
    case 'crown':
      set(3, 0, '#f5c542'); set(5, 0, '#f5c542'); set(6, 0, '#f5c542'); set(8, 0, '#f5c542')
      rect(3, 1, 8, 3, '#f5c542'); set(5, 2, '#e74c3c'); set(6, 2, '#4fc3e8')
      break
  }

  // Hand item (viewer's right)
  switch (outfit.hand) {
    case 'mug':
      rect(11, 13, 12, 15, '#f4efe0'); set(13, 14, '#f4efe0'); set(11, 13, '#6b4a2f')
      break
    case 'laptop':
      rect(10, 12, 13, 15, '#9aa4b0'); rect(11, 12, 12, 14, '#4fc3e8'); rect(10, 15, 13, 15, '#5d6675')
      break
    case 'gingerbread':
      set(11, 11, '#b8743a'); rect(10, 12, 12, 13, '#b8743a'); set(11, 14, '#b8743a'); set(10, 15, '#b8743a'); set(12, 15, '#b8743a')
      set(11, 12, '#f4efe0'); set(11, 13, '#e74c3c')
      break
    case 'trophy':
      rect(10, 11, 13, 12, '#f5c542'); rect(11, 13, 12, 14, '#f5c542'); rect(10, 15, 13, 15, '#c99a1f')
      break
  }

  // Outline
  const out: Grid = g.map(r => [...r])
  for (let y = 0; y < AV_H; y++) {
    for (let x = 0; x < AV_W; x++) {
      if (g[y][x]) continue
      const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([ox, oy]) => g[y + oy]?.[x + ox])
      if (n) out[y][x] = OUTLINE
    }
  }
  return out
}

// Pixel rects for use inside any SVG. (x, y) is the top-left corner.
export function AvatarPixels({ look, outfit, x = 0, y = 0 }: { look: Look; outfit: Outfit; x?: number; y?: number }) {
  const grid = paintAvatar(look, outfit)
  const rects: React.ReactElement[] = []
  for (let gy = 0; gy < AV_H; gy++) {
    let gx = 0
    while (gx < AV_W) {
      const c = grid[gy][gx]
      if (!c) { gx++; continue }
      let run = 1
      while (gx + run < AV_W && grid[gy][gx + run] === c) run++
      rects.push(<rect key={`${gx}-${gy}`} x={x + gx} y={y + gy} width={run} height={1} fill={c} />)
      gx += run
    }
  }
  return <>{rects}</>
}

export function Avatar({ look, outfit, size = 72, title }: { look: Look; outfit: Outfit; size?: number; title?: string }) {
  return (
    <svg
      className="sprite"
      width={size * (AV_W / AV_H)}
      height={size}
      viewBox={`0 0 ${AV_W} ${AV_H}`}
      role="img"
      aria-label={title}
    >
      {title && <title>{title}</title>}
      <AvatarPixels look={look} outfit={outfit} />
    </svg>
  )
}
