import Image from 'next/image'
import { XPBadge } from './XPBadge'
import { getLevel } from '@/lib/levels'

type User = {
  id: string
  display_name: string
  avatar_url: string | null
  total_xp: number
  level: number
}

export function UserCard({ user, rank, weekXp }: { user: User; rank: number; weekXp: number }) {
  const levelInfo = getLevel(user.total_xp)
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-100">
      <span className="text-sm font-bold text-gray-400 w-6 text-center">{rank}</span>
      {user.avatar_url ? (
        <Image src={user.avatar_url} alt={user.display_name} width={36} height={36} className="rounded-full" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold">
          {user.display_name[0]}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{user.display_name}</p>
        <XPBadge level={levelInfo.level} title={levelInfo.title} />
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-gray-900">{user.total_xp} XP</p>
        {weekXp > 0 && <p className="text-xs text-green-600 font-medium">+{weekXp}</p>}
      </div>
    </div>
  )
}
