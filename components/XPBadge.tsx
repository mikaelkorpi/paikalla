import { levelColor } from '@/lib/levels'

export function XPBadge({ level, title }: { level: number; title: string }) {
  const color = levelColor(level)
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold tracking-wide"
      style={{ backgroundColor: color + '22', color, border: `1px solid ${color}55` }}
    >
      ⚔️ Lv{level} · {title}
    </span>
  )
}
