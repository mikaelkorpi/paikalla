import type { Badge } from '@/lib/badges'
import { nextStarBadge } from '@/lib/badges'

// Badges earned from event weeks and from watering plants in Kastelija.
export function BadgeShelf({ badges, stars }: { badges: Badge[]; stars: number }) {
  const next = nextStarBadge(stars)
  return (
    <div className="px-box p-4">
      {badges.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>
          No badges yet. Win an event week with the team, or water the office plants in Kastelija.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map(b => (
            <div key={b.key} className="px-box-inset p-2 flex items-center gap-2" title={b.detail}>
              <span className="text-[30px] leading-none" aria-hidden="true">{b.icon}</span>
              <span className="min-w-0">
                <span className="block leading-tight">{b.name}</span>
                <span className="block text-[18px]" style={{ color: b.source === 'event' ? 'var(--gold)' : 'var(--green)' }}>{b.detail}</span>
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 text-[18px]" style={{ color: 'var(--text-faint)' }}>
        {stars > 0 ? `${stars} Kastelija stars. ` : ''}
        {next ? `Next plant badge, ${next.name}, at ${next.stars} stars.` : 'Every plant badge collected.'}{' '}
        <a href="https://kastelija.ilmiotalent.fi" className="underline">Kastelija</a>
      </p>
    </div>
  )
}
