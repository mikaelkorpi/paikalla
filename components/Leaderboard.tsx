import { UserCard } from './UserCard'

type User = {
  id: string
  display_name: string
  avatar_url: string | null
  total_xp: number
  level: number
}

export function Leaderboard({ users, weekXpMap }: { users: User[]; weekXpMap: Record<string, number> }) {
  const sorted = [...users].sort((a, b) => b.total_xp - a.total_xp)
  return (
    <div className="space-y-2">
      {sorted.map((user, i) => (
        <UserCard key={user.id} user={user} rank={i + 1} weekXp={weekXpMap[user.id] ?? 0} />
      ))}
      {sorted.length === 0 && (
        <div className="text-center py-12" style={{ color: 'var(--text-faint)' }}>
          <p className="text-sm">No one here yet. Be the first to show up.</p>
        </div>
      )}
    </div>
  )
}
