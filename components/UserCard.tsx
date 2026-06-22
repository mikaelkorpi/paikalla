import { getLevel, getNextLevel, levelColor } from '@/lib/levels'

type User = {
  id: string
  display_name: string
  avatar_url: string | null
  total_xp: number
  level: number
}

const RANK_STYLES: Record<number, { border: string; glow: string; crown: string }> = {
  1: { border: '#EAB308', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]', crown: '👑' },
  2: { border: '#94A3B8', glow: 'shadow-[0_0_12px_rgba(148,163,184,0.2)]', crown: '🥈' },
  3: { border: '#CD7F32', glow: 'shadow-[0_0_12px_rgba(205,127,50,0.2)]', crown: '🥉' },
}

export function UserCard({ user, rank, weekXp }: { user: User; rank: number; weekXp: number }) {
  const levelInfo = getLevel(user.total_xp)
  const nextLevel = getNextLevel(user.total_xp)
  const color = levelColor(levelInfo.level)
  const rankStyle = RANK_STYLES[rank]
  const xpProgress = nextLevel
    ? ((user.total_xp - levelInfo.minXp) / (nextLevel.minXp - levelInfo.minXp)) * 100
    : 100

  return (
    <div
      className={`relative flex flex-col gap-3 p-4 rounded-xl bg-gray-900 border ${rankStyle ? rankStyle.glow : ''}`}
      style={{ borderColor: rankStyle ? rankStyle.border : '#1F2937' }}
    >
      {/* Rank + avatar row */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center gap-1 w-8">
          <span className="text-lg">{rankStyle?.crown ?? rank}</span>
          {!rankStyle && <span className="text-xs text-gray-500 font-bold">#{rank}</span>}
        </div>

        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ backgroundColor: color + '22', border: `2px solid ${color}55` }}
        >
          {levelInfo.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-white truncate">{user.display_name}</p>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold tracking-wide mt-0.5"
            style={{ backgroundColor: color + '22', color, border: `1px solid ${color}55` }}
          >
            {levelInfo.emoji} Lv{levelInfo.level} · {levelInfo.title}
          </span>
        </div>

        <div className="text-right">
          <p className="font-bold text-white">{user.total_xp} <span className="text-xs text-gray-400">XP</span></p>
          {weekXp > 0 && (
            <p className="text-xs font-semibold" style={{ color: '#4ADE80' }}>+{weekXp} this week</p>
          )}
        </div>
      </div>

      {/* Lore text */}
      <p className="text-xs text-gray-400 italic pl-11">{levelInfo.lore}</p>

      {/* XP progress bar */}
      <div className="pl-11">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{user.total_xp} XP</span>
          {nextLevel ? (
            <span>{nextLevel.minXp} XP → {nextLevel.title}</span>
          ) : (
            <span className="text-yellow-400">MAX LEVEL</span>
          )}
        </div>
        <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${xpProgress}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  )
}
