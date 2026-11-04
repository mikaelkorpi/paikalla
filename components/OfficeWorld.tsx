import { AvatarPixels, AV_H, AV_W } from '@/lib/avatar'
import { lookFor } from '@/lib/looks'
import { outfitFor, unlockedFurniture } from '@/lib/wardrobe'
import { getLevel } from '@/lib/levels'

// Isometric office. Grid N x N, tiles TW x TH. Back walls run along gx = 0 (left) and gy = 0 (right).
const N = 8
const TW = 32
const TH = 16
const WALL = 64
const OX = 144
const OY = WALL + 12
const VB_W = 288
const VB_H = OY + N * TH + 24

type Pt = [number, number]
const iso = (gx: number, gy: number, z = 0): Pt => [OX + (gx - gy) * (TW / 2), OY + (gx + gy) * (TH / 2) - z]
const pts = (...p: Pt[]) => p.map(([x, y]) => `${x},${y}`).join(' ')

export type WorldUser = { id: string; display_name: string; total_xp: number }

type Item = { depth: number; node: React.ReactNode }

function box(key: string, gx: number, gy: number, w: number, d: number, h: number, top: string, left: string, right: string, z = 0) {
  const a = iso(gx, gy, z + h), b = iso(gx + w, gy, z + h), c = iso(gx + w, gy + d, z + h), e = iso(gx, gy + d, z + h)
  const b0 = iso(gx + w, gy, z), c0 = iso(gx + w, gy + d, z), e0 = iso(gx, gy + d, z)
  return (
    <g key={key}>
      <polygon points={pts(e, c, c0, e0)} fill={left} />
      <polygon points={pts(c, b, b0, c0)} fill={right} />
      <polygon points={pts(a, b, c, e)} fill={top} />
    </g>
  )
}

const depthOf = (gx: number, gy: number, w = 1, d = 1) => gx + w + gy + d

function furniture(have: Set<string>): Item[] {
  const items: Item[] = []
  const add = (gx: number, gy: number, w: number, d: number, node: React.ReactNode) => items.push({ depth: depthOf(gx, gy, w, d), node })

  if (have.has('machine')) {
    add(0, 0, 1, 1, (
      <g key="machine">
        {box('m1', 0.15, 0.15, 0.7, 0.7, 26, '#5d6675', '#3b4250', '#4a5260')}
        {box('m2', 0.3, 0.55, 0.4, 0.3, 4, '#f4efe0', '#c9c2ad', '#ddd6c2', 6)}
        <rect x={iso(0.6, 0.15)[0] - 2} y={iso(0.6, 0.15, 22)[1]} width={4} height={2} fill="#e74c3c"><title>The Machine</title></rect>
      </g>
    ))
  }

  if (have.has('desks')) {
    const spots: Pt[] = [[2, 0], [4, 0], [6, 0], [0, 2], [0, 4], [0, 6]]
    spots.forEach(([gx, gy], i) => {
      const alongRight = gy === 0
      add(gx, gy, 1, 1, (
        <g key={`desk-${i}`}>
          {box('t', gx + 0.05, gy + 0.1, 0.9, 0.8, 12, '#b98c5a', '#7d5a36', '#966c43')}
          {alongRight
            ? box('s', gx + 0.3, gy + 0.15, 0.4, 0.12, 9, '#20242e', '#151820', '#2d3442', 12)
            : box('s', gx + 0.15, gy + 0.3, 0.12, 0.4, 9, '#20242e', '#2d3442', '#151820', 12)}
        </g>
      ))
    })
  }

  if (have.has('plant')) {
    add(7, 0, 1, 1, (
      <g key="plant">
        {box('pot', 7.3, 0.3, 0.4, 0.4, 8, '#a0522d', '#7a3d20', '#8c4726')}
        {box('leaf1', 7.15, 0.15, 0.7, 0.7, 10, '#3fa34d', '#2b7a37', '#358f42', 8)}
        {box('leaf2', 7.3, 0.3, 0.4, 0.4, 8, '#5cc46a', '#3fa34d', '#4bb259', 18)}
      </g>
    ))
  }

  if (have.has('shelf')) {
    add(0, 3, 1, 1, (
      <g key="shelf">
        {box('sh', 0.05, 3.1, 0.35, 0.8, 34, '#7d5a36', '#5c4128', '#6b4b2f')}
        {[8, 17, 26].map((z, i) => (
          <g key={z}>{box(`b${i}`, 0.4, 3.2, 0.02, 0.6, 6, '#c0392b', ['#2e86c1', '#27ae60', '#f5c542'][i], '#8e44ad', z)}</g>
        ))}
      </g>
    ))
  }

  if (have.has('jukebox')) {
    add(3, 0, 1, 1, (
      <g key="jukebox">
        {box('j', 3.2, 0.1, 0.6, 0.45, 26, '#e67e22', '#a8541a', '#c4691e')}
        {box('j2', 3.3, 0.55, 0.4, 0.02, 10, '#f5c542', '#f5c542', '#f5c542', 10)}
      </g>
    ))
  }

  if (have.has('arcade')) {
    add(5, 0, 1, 1, (
      <g key="arcade">
        {box('a', 5.2, 0.1, 0.6, 0.5, 30, '#2c3e8f', '#1d2a66', '#24337a')}
        {box('a2', 5.28, 0.6, 0.44, 0.02, 9, '#5be37a', '#5be37a', '#5be37a', 16)}
        {box('a3', 5.25, 0.6, 0.5, 0.15, 3, '#e74c3c', '#a8321f', '#c43c2a', 11)}
      </g>
    ))
  }

  if (have.has('aquarium')) {
    add(0, 5, 1, 1, (
      <g key="aquarium">
        {box('aq0', 0.1, 5.1, 0.6, 0.8, 10, '#3b2a20', '#2a1d16', '#33241b')}
        {box('aq', 0.1, 5.1, 0.6, 0.8, 16, '#7fd3f0', '#4fb0d6', '#5fc0e3', 10)}
        <rect x={iso(0.6, 5.5)[0] - 1} y={iso(0.6, 5.5, 17)[1]} width={3} height={2} fill="#f39c12" />
        <rect x={iso(0.4, 5.3)[0]} y={iso(0.4, 5.3, 22)[1]} width={2} height={1} fill="#e74c3c" />
      </g>
    ))
  }

  if (have.has('sofa')) {
    add(4, 6, 2, 1, (
      <g key="sofa">
        {box('sfb', 4.05, 6.2, 1.9, 0.25, 16, '#d3463a', '#8f2a1f', '#a83224')}
        {box('sf', 4.05, 6.45, 1.9, 0.5, 7, '#c0392b', '#8f2a1f', '#a83224')}
        {box('sfl', 4.05, 6.45, 0.22, 0.5, 4, '#d3463a', '#8f2a1f', '#a83224', 7)}
        {box('sfr', 5.73, 6.45, 0.22, 0.5, 4, '#d3463a', '#8f2a1f', '#a83224', 7)}
      </g>
    ))
  }

  if (have.has('ballpit')) {
    add(6, 3, 1, 1, (
      <g key="ballpit">
        {box('bp', 6.05, 3.05, 0.9, 0.9, 7, '#3b8fd6', '#2a6aa3', '#3280bf')}
        {[[6.3, 3.3, '#e74c3c'], [6.6, 3.4, '#f5c542'], [6.4, 3.7, '#5be37a'], [6.7, 3.7, '#f4efe0'], [6.25, 3.6, '#8e44ad']].map(([x, y, c], i) => {
          const [px, py] = iso(x as number, y as number, 8)
          return <rect key={i} x={px - 1} y={py - 1} width={3} height={2} fill={c as string} />
        })}
      </g>
    ))
  }

  if (have.has('throne')) {
    add(7, 7, 1, 1, (
      <g key="throne">
        {box('th', 7.15, 7.15, 0.7, 0.7, 8, '#9b1c2e', '#6e1320', '#851826')}
        {box('thb', 7.15, 7.15, 0.7, 0.15, 22, '#f5c542', '#c99a1f', '#dcae2f', 8)}
      </g>
    ))
  }

  return items
}

function Walls({ neon }: { neon: boolean }) {
  const top = iso(0, 0), right = iso(N, 0), left = iso(0, N)
  const up = (p: Pt): Pt => [p[0], p[1] - WALL]
  // Wall decals are drawn flat and skewed onto the wall planes.
  const skewR = `matrix(1 0.5 0 1 0 0)`
  const skewL = `matrix(1 -0.5 0 1 0 0)`
  return (
    <g>
      <polygon points={pts(up(left), up(top), top, left)} fill="#d8c8a2" />
      <polygon points={pts(up(top), up(right), right, top)} fill="#c4b28a" />
      <polygon points={pts(up(left), up(top), up(right), [up(right)[0], up(right)[1] - 4], [up(top)[0], up(top)[1] - 4], [up(left)[0], up(left)[1] - 4])} fill="#8f7d5a" />
      <polyline points={pts(left, top, right)} fill="none" stroke="#6b5a3e" strokeWidth={2} />
      {/* Window on the left wall */}
      <g transform={`translate(${iso(0, 1.4)[0]} ${iso(0, 1.4)[1] - WALL + 10}) ${skewL}`}>
        <rect x={-36} y={0} width={36} height={26} fill="#3b2a20" />
        <rect x={-34} y={2} width={15} height={22} fill="#8fd0f0" />
        <rect x={-17} y={2} width={15} height={22} fill="#8fd0f0" />
        <rect x={-30} y={5} width={4} height={2} fill="#f4efe0" />
        <rect x={-12} y={9} width={6} height={2} fill="#f4efe0" />
      </g>
      {/* Ilmiö sign on the right wall */}
      <g transform={`translate(${iso(3.3, 0)[0]} ${iso(3.3, 0)[1] - WALL + 12}) ${skewR}`}>
        <rect x={0} y={0} width={44} height={14} fill={neon ? '#1d1a33' : '#3b2a20'} />
        <text x={22} y={10.5} textAnchor="middle" fontSize={9} fontFamily="var(--font-pixel), monospace" fill={neon ? '#ff5fd2' : '#f5c542'} style={neon ? { filter: 'drop-shadow(0 0 2px #ff5fd2)' } : undefined}>
          ILMIÖ
        </text>
      </g>
    </g>
  )
}

function Floor({ rug }: { rug: boolean }) {
  const tiles: React.ReactNode[] = []
  for (let gy = 0; gy < N; gy++) {
    for (let gx = 0; gx < N; gx++) {
      tiles.push(
        <polygon
          key={`${gx}-${gy}`}
          points={pts(iso(gx, gy), iso(gx + 1, gy), iso(gx + 1, gy + 1), iso(gx, gy + 1))}
          fill={(gx + gy) % 2 ? '#8a6a4a' : '#957454'}
        />
      )
    }
  }
  const edgeL = iso(0, N), edgeB = iso(N, N), edgeR = iso(N, 0)
  return (
    <g>
      <polygon points={pts(edgeL, edgeB, [edgeB[0], edgeB[1] + 8], [edgeL[0], edgeL[1] + 8])} fill="#5c4128" />
      <polygon points={pts(edgeB, edgeR, [edgeR[0], edgeR[1] + 8], [edgeB[0], edgeB[1] + 8])} fill="#4a3420" />
      {tiles}
      {rug && (
        <g>
          <polygon points={pts(iso(2.5, 2.5), iso(5.5, 2.5), iso(5.5, 5.5), iso(2.5, 5.5))} fill="#1d2a4d" />
          <polygon points={pts(iso(2.8, 2.8), iso(5.2, 2.8), iso(5.2, 5.2), iso(2.8, 5.2))} fill="none" stroke="#f5c542" strokeWidth={1} />
        </g>
      )}
    </g>
  )
}

// Where people stand when they are in. The first six face their desks' fronts.
const STANDS: Pt[] = [[2, 1], [4, 1], [6, 1], [1, 2], [1, 4], [1, 6], [3, 4], [5, 4], [4, 3], [2, 5]]

function person(u: WorldUser, gx: number, gy: number, i: number): Item {
  const level = getLevel(u.total_xp)
  const look = lookFor(u.display_name, u.id)
  const outfit = outfitFor(level.level)
  const [cx, cy] = iso(gx + 0.5, gy + 0.5)
  const x = Math.round(cx - AV_W / 2)
  const y = Math.round(cy - AV_H + 3)
  const name = u.display_name.split(' ')[0]
  return {
    depth: gx + gy + 1.5,
    node: (
      <a key={u.id} href={`/player/${u.id}`} className="world-avatar" style={{ animationDelay: `${(i % 4) * 0.35}s` }}>
        <title>{`${u.display_name}, Lv${level.level} ${level.title}`}</title>
        <ellipse cx={cx} cy={cy + 1} rx={6} ry={2.5} fill="rgba(0,0,0,0.3)" />
        <g className="bob">
          <AvatarPixels look={look} outfit={outfit} x={x} y={y} />
        </g>
        <g className="nametag">
          <rect x={cx - name.length * 2.2 - 3} y={y - 9} width={name.length * 4.4 + 6} height={8} fill="#0e1424" stroke="#f4efe0" strokeWidth={0.6} />
          <text x={cx} y={y - 3} textAnchor="middle" fontSize={6} fontFamily="var(--font-body), monospace" fill="#f4efe0">{name}</text>
        </g>
      </a>
    ),
  }
}

export function OfficeWorld({
  inOffice,
  teamXp,
  sign,
}: {
  inOffice: WorldUser[]
  teamXp: number
  sign?: string | null
}) {
  const have = unlockedFurniture(teamXp)
  const items: Item[] = [...furniture(have)]
  inOffice.slice(0, STANDS.length).forEach((u, i) => {
    const [gx, gy] = STANDS[i]
    items.push(person(u, gx, gy, i))
  })
  items.sort((a, b) => a.depth - b.depth)

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="world" role="img" aria-label="The Ilmiö office">
      <Walls neon={have.has('neon')} />
      <Floor rug={have.has('rug')} />
      {items.map((it, i) => <g key={i}>{it.node}</g>)}
      {sign && (
        <g>
          <rect x={OX - 70} y={OY + N * TH / 2 - 12} width={140} height={20} fill="#0e1424" stroke="#f5c542" strokeWidth={1.5} />
          <text x={OX} y={OY + N * TH / 2 + 1} textAnchor="middle" fontSize={7} fontFamily="var(--font-pixel), monospace" fill="#f5c542">{sign}</text>
        </g>
      )}
    </svg>
  )
}
