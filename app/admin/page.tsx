import { cookies } from 'next/headers'
import { supabaseAdmin as supabase } from '@/lib/supabase'
import { ADMIN_COOKIE, isAdminCookie } from '@/lib/admin'
import { formatWeekLabel } from '@/lib/week'
import { AdminLogin, AdminPanel } from '@/components/AdminPanel'

export const dynamic = 'force-dynamic'

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const cookieStore = await cookies()
  const authed = isAdminCookie(cookieStore.get(ADMIN_COOKIE)?.value)

  if (!authed) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
        <div className="max-w-sm mx-auto px-4 py-16">
          <h1 className="text-2xl font-black tracking-tight mb-6" style={{ color: 'var(--text)' }}>Paikalla admin</h1>
          <AdminLogin />
        </div>
      </main>
    )
  }

  const { week: weekParam } = await searchParams

  const [{ data: weeks }, { data: users }] = await Promise.all([
    supabase.from('weeks').select('id, week_start, is_closed').order('week_start', { ascending: false }),
    supabase.from('users').select('id, display_name, total_xp, level').order('display_name'),
  ])

  const weekOptions = (weeks ?? []).map(w => ({
    id: w.id,
    label: formatWeekLabel(new Date(w.week_start)),
    isClosed: w.is_closed,
  }))

  const selected = weekOptions.find(w => w.id === weekParam) ?? weekOptions[0]

  let attendance: { user_id: string; days: number[] }[] = []
  if (selected) {
    const { data } = await supabase.from('attendance').select('user_id, days').eq('week_id', selected.id)
    attendance = data ?? []
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-xs text-blue-500 hover:underline">← Dashboard</a>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>Admin</h1>
          </div>
        </div>
        <AdminPanel
          weeks={weekOptions}
          selectedWeekId={selected?.id ?? null}
          users={users ?? []}
          attendance={attendance}
        />
      </div>
    </main>
  )
}
