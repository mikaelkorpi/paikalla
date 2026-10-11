import { getLevel, getNextLevel, levelColor } from '@/lib/levels'

export function XpBar({ xp, blocks = 20 }: { xp: number; blocks?: number }) {
  const level = getLevel(xp)
  const next = getNextLevel(xp)
  const progress = next ? (xp - level.minXp) / (next.minXp - level.minXp) : 1
  const filled = Math.round(Math.min(1, Math.max(0, progress)) * blocks)
  const color = levelColor(level.level)

  return (
    <div>
      <div className="flex gap-[3px]" aria-label={`${xp} XP`}>
        {Array.from({ length: blocks }).map((_, i) => (
          <div
            key={i}
            className="h-3 flex-1"
            style={{ backgroundColor: i < filled ? color : 'var(--bg)', border: '2px solid var(--bg-card2)' }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1" style={{ color: 'var(--text-muted)' }}>
        <span>{xp} XP</span>
        {next ? <span>{next.minXp - xp} to {next.title}</span> : <span style={{ color }}>Max level</span>}
      </div>
    </div>
  )
}
