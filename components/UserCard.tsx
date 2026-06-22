import { getLevel, getNextLevel, levelColor } from '@/lib/levels'

type User = {
  id: string
  display_name: string
  avatar_url: string | null
  total_xp: number
  level: number
}

const RANK_MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export function UserCard({ user, rank, weekXp }: { user: User; rank: number; weekXp: number }) {
  const levelInfo = getLevel(user.total_xp)
  const nextLevel = getNextLevel(user.total_xp)
  const color = levelColor(levelInfo.level)
  const xpProgress = nextLevel
    ? ((user.total_xp - levelInfo.minXp) / (nextLevel.minXp - levelInfo.minXp)) * 100
    : 100

  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-xl border transition-all"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl w-7 text-center">{RANK_MEDAL[rank] ?? <span style={{ color: 'var(--text-faint)', fontSize: 13 }}>#{rank}</span>}</span>

        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: color + '18', border: `1.5px solid ${color}40` }}
        >
          {levelInfo.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate" style={{ color: 'var(--text)' }}>{user.display_name}</p>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mt-0.5"
            style={{ backgroundColor: color + '15', color, border: `1px solid ${color}30` }}
          >
            Lv{levelInfo.level} · {levelInfo.title}
          </span>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="font-bold" style={{ color: 'var(--text)' }}>{user.total_xp} <span className="text-xs font-normal" style={{ color: 'var(--text-faint)' }}>XP</span></p>
          {weekXp > 0 && <p className="text-xs font-semibold text-green-500">+{weekXp}</p>}
        </div>
      </div>

      <p className="text-xs italic pl-10" style={{ color: 'var(--text-faint)' }}>{levelInfo.lore}</p>

      <div className="pl-10">
        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-faint)' }}>
          <span>{user.total_xp} XP</span>
          {nextLevel ? <span>{nextLevel.minXp} XP · {nextLevel.title}</span> : <span style={{ color }}>Max level</span>}
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-card2)' }}>
          <div className="h-full rounded-full" style={{ width: `${Math.min(xpProgress, 100)}%`, backgroundColor: color }} />
        </div>
      </div>
    </div>
  )
}
