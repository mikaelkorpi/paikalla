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
    <div className="space-y-3">
      {sorted.map((user, i) => (
        <UserCard key={user.id} user={user} rank={i + 1} weekXp={weekXpMap[user.id] ?? 0} />
      ))}
      {sorted.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-3">⚔️</p>
          <p className="text-sm">No heroes have emerged yet.</p>
        </div>
      )}
    </div>
  )
}
