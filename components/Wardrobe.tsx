import { Avatar } from '@/lib/avatar'
import { getLevel } from '@/lib/levels'
import { WEARABLES, outfitFor, isUnlocked, type Outfit } from '@/lib/wardrobe'
import type { Look } from '@/lib/looks'

// Plain mannequin to show each item on its own
const MANNEQUIN: Look = { skin: '#c9c2ad', hair: 'buzz', hairColor: '#9aa4c2', beard: 'none', top: '#3a4560', pants: '#2b2f3a' }

type User = { id: string; display_name: string; total_xp: number; outfit?: Outfit | null }

export function Wardrobe({ users }: { users: User[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {WEARABLES.map(w => {
        const owners = users.filter(u => isUnlocked(w, getLevel(u.total_xp).level, u.outfit?.earned)).map(u => u.display_name.split(' ')[0])
        const wearers = users.filter(u => outfitFor(getLevel(u.total_xp).level, u.outfit)[w.slot] === w.key).map(u => u.display_name.split(' ')[0])
        const outfit: Outfit = { [w.slot]: w.key }
        const locked = owners.length === 0
        return (
          <div key={w.key} className="px-box-inset p-2 flex items-center gap-2" style={locked ? { opacity: 0.55 } : undefined}>
            <Avatar look={MANNEQUIN} outfit={outfit} size={84} title={w.name} />
            <div className="min-w-0">
              <p className="leading-tight">{w.name}</p>
              <p className="text-[18px]" style={{ color: 'var(--gold)' }}>{w.event ? w.eventName : `Lv${w.level}`}</p>
              <p className="text-[18px]" style={{ color: 'var(--text-muted)' }}>{locked ? 'Nobody has unlocked it yet' : `Unlocked: ${owners.join(', ')}`}</p>
              {wearers.length > 0 && <p className="text-[18px]" style={{ color: 'var(--green)' }}>Wearing: {wearers.join(', ')}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
