import { levelColor } from './levels'

// 12x12 pixel creatures. Letters map to colours; '.' is transparent.
// O outline, K creature skin, B clothing (level colour), E eye, W white/bone, L legs, A gold, P parchment
type Species = { key: string; name: string; skin: string; rows: string[] }

export const SPECIES: Species[] = [
  {
    key: 'orc', name: 'Orc', skin: '#5ba55b',
    rows: [
      '....OOOO....',
      '...OKKKKO...',
      '..OKKKKKKO..',
      '..OKEKKEKO..',
      '..OKKKKKKO..',
      '..OKWKKWKO..',
      '...OBBBBO...',
      '..OBBBBBBO..',
      '..OBBBBBBO..',
      '...OBBBBO...',
      '...OL..LO...',
      '...OO..OO...',
    ],
  },
  {
    key: 'goblin', name: 'Goblin', skin: '#a8c84a',
    rows: [
      '............',
      '.O..OOOO..O.',
      '.OKOKKKKOKO.',
      '..OKKKKKKO..',
      '..OKEKKEKO..',
      '..OKKKKKKO..',
      '...OKKKKO...',
      '...OBBBBO...',
      '..OBBBBBBO..',
      '...OBBBBO...',
      '...OL..LO...',
      '...OO..OO...',
    ],
  },
  {
    key: 'skeleton', name: 'Skeleton', skin: '#ece6d0',
    rows: [
      '....OOOO....',
      '...OKKKKO...',
      '..OKKKKKKO..',
      '..OKEKKEKO..',
      '..OKKKKKKO..',
      '..OKOKKOKO..',
      '...OBBBBO...',
      '..OBKBBKBO..',
      '..OBBBBBBO..',
      '...OBBBBO...',
      '...OK..KO...',
      '...OO..OO...',
    ],
  },
  {
    key: 'slime', name: 'Slime', skin: '#4fc3e8',
    rows: [
      '............',
      '............',
      '....OOOO....',
      '..OOKKKKOO..',
      '.OKKKKKKKKO.',
      '.OKKEKKEKKO.',
      '.OKKKKKKKKO.',
      '.OKKKKKKKKO.',
      '.OKKBBBBKKO.',
      '.OKKKKKKKKO.',
      '..OKKKKKKO..',
      '...OOOOOO...',
    ],
  },
  {
    key: 'ghost', name: 'Ghost', skin: '#cfc4f2',
    rows: [
      '....OOOO....',
      '...OKKKKO...',
      '..OKKKKKKO..',
      '..OKEKKEKO..',
      '..OKKKKKKO..',
      '..OKKKKKKO..',
      '..OKBBBBKO..',
      '..OKKKKKKO..',
      '..OKKKKKKO..',
      '..OKKKKKKO..',
      '..OK.KK.KO..',
      '..O..OO..O..',
    ],
  },
  {
    key: 'mage', name: 'Mage', skin: '#f1c27d',
    rows: [
      '.....OO.....',
      '....OBBO....',
      '...OBBBBO...',
      '..OBBBBBBO..',
      '.OOOOOOOOOO.',
      '..OKKKKKKO..',
      '..OKEKKEKO..',
      '..OKWWWWKO..',
      '...OBBBBO...',
      '..OBBBBBBO..',
      '...OBBBBO...',
      '...OO..OO...',
    ],
  },
]

const CROWN = ['.A.AA.AA.A..', '.AAAAAAAAA..']

// Small item at the right hand, 3 columns x 4 rows, placed at column 9, row 6.
const ITEMS: Record<string, string[]> = {
  cup:    ['WW.', 'WWW', 'WW.', '...'],
  map:    ['PPP', 'P.P', 'PPP', '...'],
  bolt:   ['.A.', 'A..', '.A.', 'A..'],
  shield: ['BBB', 'BBB', 'BBB', '.B.'],
  trophy: ['AAA', '.A.', '.A.', 'AAA'],
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

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function speciesFor(seed: string): Species {
  return SPECIES[hash(seed) % SPECIES.length]
}

export function Sprite({
  seed,
  level,
  size = 96,
  title,
  species: forced,
}: {
  seed: string
  level: number
  size?: number
  title?: string
  species?: string
}) {
  const species = SPECIES.find(s => s.key === forced) ?? speciesFor(seed)
  const clothing = levelColor(level)
  const colours: Record<string, string> = {
    O: '#05080f',
    K: species.skin,
    B: clothing,
    E: '#05080f',
    L: '#6b4f3a',
    A: '#f5c542',
    W: '#f4efe0',
    P: '#d9c9a3',
  }

  const grid = species.rows.map(row => row.split(''))

  if (level >= 10) {
    grid[0] = CROWN[0].split('')
    grid[1] = CROWN[1].split('')
  }

  const item = itemFor(level)
  if (item) {
    const shape = ITEMS[item]
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        const ch = shape[r][c]
        if (ch !== '.') grid[6 + r][9 + c] = ch
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
      aria-label={title ?? `${species.name}, level ${level}`}
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
