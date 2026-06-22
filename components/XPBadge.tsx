import { levelColor } from '@/lib/levels'

export function XPBadge({ level, title }: { level: number; title: string }) {
  const color = levelColor(level)
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      Lv{level} {title}
    </span>
  )
}
