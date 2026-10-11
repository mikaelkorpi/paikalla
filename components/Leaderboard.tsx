import { getLevel, levelColor } from '@/lib/levels'
import { Sprite, speciesFor } from '@/lib/sprite'
import { XpBar } from './XpBar'

type User = {
  id: string
  display_name: string
  avatar_url: string | null
  total_xp: number
  level: number
}

const PODIUM_HEIGHT: Record<number, string> = { 1: '3.5rem', 2: '2.5rem', 3: '1.5rem' }

function Pedestal({ user, rank, weekXp }: { user: User; rank: number; weekXp: number }) {
  const level = getLevel(user.total_xp)
  const species = speciesFor(user.id)
  return (
    <a href={`/player/${user.id}`} className="flex flex-col items-center flex-1 min-w-0 no-underline" style={{ color: 'var(--text)' }}>
      <Sprite seed={user.id} level={level.level} size={rank === 1 ? 88 : 72} title={`${user.display_name}, ${species.name}, ${level.title}`} />
      <p className="mt-2 truncate max-w-full">{user.display_name}</p>
      <p className="text-[15px]" style={{ color: levelColor(level.level) }}>Lv{level.level} {species.name}</p>
      <p className="text-[15px]" style={{ color: 'var(--text-muted)' }}>
        {user.total_xp} XP{weekXp > 0 && <span style={{ color: 'var(--green)' }}> +{weekXp}</span>}
      </p>
      <div
        className="w-full mt-2 flex items-start justify-center pt-2"
        style={{
          height: PODIUM_HEIGHT[rank],
          background: 'var(--bg-card2)',
          borderTop: '4px solid var(--border)',
          borderLeft: '4px solid var(--border)',
          borderRight: '4px solid var(--border)',
        }}
      >
        <span className="font-pixel text-[12px]">{rank}</span>
      </div>
    </a>
  )
}

export function Leaderboard({ users, weekXpMap }: { users: User[]; weekXpMap: Record<string, number> }) {
  const sorted = [...users].sort((a, b) => b.total_xp - a.total_xp)
  const top = sorted.slice(0, 3)
  const rest = sorted.slice(3)

  if (sorted.length === 0) {
    return (
      <div className="px-box p-6 text-center" style={{ color: 'var(--text-muted)' }}>
        No one has entered the realm yet. Log your days in Slack to appear here.
      </div>
    )
  }

  // Podium order: 2, 1, 3
  const podium = [top[1], top[0], top[2]].filter(Boolean) as User[]
  const rankOf = (u: User) => sorted.indexOf(u) + 1

  return (
    <div className="space-y-6">
      <div className="px-box p-4 pb-0 overflow-hidden">
        <div className="flex items-end gap-2">
          {podium.map(u => (
            <Pedestal key={u.id} user={u} rank={rankOf(u)} weekXp={weekXpMap[u.id] ?? 0} />
          ))}
        </div>
      </div>

      {rest.length > 0 && (
        <div className="space-y-3">
          {rest.map(u => {
            const level = getLevel(u.total_xp)
            const species = speciesFor(u.id)
            return (
              <a
                key={u.id}
                href={`/player/${u.id}`}
                className="px-box p-3 flex items-center gap-3 no-underline"
                style={{ color: 'var(--text)' }}
              >
                <span className="font-pixel text-[12px] w-8" style={{ color: 'var(--text-muted)' }}>{rankOf(u)}</span>
                <Sprite seed={u.id} level={level.level} size={48} title={`${u.display_name}, ${species.name}, ${level.title}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <p className="truncate">{u.display_name}</p>
                    <p className="text-[15px]" style={{ color: levelColor(level.level) }}>Lv{level.level} {species.name}</p>
                    {weekXpMap[u.id] > 0 && <p className="text-[15px] ml-auto" style={{ color: 'var(--green)' }}>+{weekXpMap[u.id]}</p>}
                  </div>
                  <XpBar xp={u.total_xp} blocks={16} />
                </div>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
