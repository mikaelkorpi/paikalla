import { levelColor } from './levels'

// 12x12 pixel traveller. Letters map to colours; '.' is transparent.
const BASE = [
  '....OOOO....',
  '...OHHHHO...',
  '..OHHHHHHO..',
  '..OSSSSSSO..',
  '..OSESSESO..',
  '..OSSSSSSO..',
  '...OBBBBO...',
  '..OBBBBBBO..',
  '..OBBBBBBO..',
  '...OBBBBO...',
  '...OL..LO...',
  '...OO..OO...',
]

const CROWN = [
  '.A.AA.AA.A..',
  '.AAAAAAAAA..',
]

// Small item held at the right hand, 4 columns x 4 rows, placed at column 8, row 6.
const ITEMS: Record<string, string[]> = {
  cup:    ['.WW.', '.WWW', '.WW.', '....'],
  map:    ['.PPP', '.P.P', '.PPP', '....'],
  bolt:   ['..A.', '.A..', '..A.', '.A..'],
  shield: ['.HHH', '.HHH', '.HHH', '..H.'],
  trophy: ['AAAA', '.AA.', '..A.', '.AAA'],
}

function itemFor(level: number): string | null {
  if (level <= 1) return null
  if (level === 2) return 'cup'
  if (level <= 4) return 'map'
  if (level <= 6) return 'bolt'
  if (level <= 8) return 'shield'
  if (level === 9) return 'trophy'
  return null
}

export function Sprite({ level, size = 96, title }: { level: number; size?: number; title?: string }) {
  const hat = levelColor(level)
  const colours: Record<string, string> = {
    O: '#05080f',
    H: hat,
    B: hat,
    S: '#f1c27d',
    E: '#05080f',
    L: '#6b4f3a',
    A: '#f5c542',
    W: '#f4efe0',
    P: '#d9c9a3',
  }

  const grid = BASE.map(row => row.split(''))

  if (level >= 10) {
    grid[0] = CROWN[0].split('')
    grid[1] = CROWN[1].split('')
  }

  const item = itemFor(level)
  if (item) {
    const shape = ITEMS[item]
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const ch = shape[r][c]
        if (ch !== '.') grid[6 + r][8 + c] = ch
      }
    }
  }

  return (
    <svg
      className="sprite"
      width={size}
      height={size}
      viewBox="0 0 12 12"
      role="img"
      aria-label={title ?? `Level ${level} traveller`}
    >
      {grid.map((row, y) =>
        row.map((ch, x) =>
          ch === '.' ? null : (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={colours[ch] ?? '#ff00ff'} />
          )
        )
      )}
    </svg>
  )
}
