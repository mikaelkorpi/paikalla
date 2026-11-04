import { Avatar } from '@/lib/avatar'
import { getLevel } from '@/lib/levels'
import { WEARABLES, type Outfit } from '@/lib/wardrobe'
import type { Look } from '@/lib/looks'

// Plain mannequin to show each item on its own
const MANNEQUIN: Look = { skin: '#c9c2ad', hair: 'buzz', hairColor: '#9aa4c2', beard: 'none', top: '#3a4560', pants: '#2b2f3a' }

type User = { id: string; display_name: string; total_xp: number }

export function Wardrobe({ users }: { users: User[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {WEARABLES.map(w => {
        const owners = users.filter(u => getLevel(u.total_xp).level >= w.level).map(u => u.display_name.split(' ')[0])
        const outfit: Outfit = { [w.slot]: w.key }
        const locked = owners.length === 0
        return (
          <div key={w.key} className="px-box-inset p-2 flex items-center gap-2" style={locked ? { opacity: 0.55 } : undefined}>
            <Avatar look={MANNEQUIN} outfit={outfit} size={48} title={w.name} />
            <div className="min-w-0">
              <p className="truncate leading-tight">{w.name}</p>
              <p className="text-[15px]" style={{ color: 'var(--gold)' }}>Lv{w.level}</p>
              <p className="text-[15px] truncate" style={{ color: 'var(--text-muted)' }}>{locked ? 'Nobody yet' : owners.join(', ')}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
