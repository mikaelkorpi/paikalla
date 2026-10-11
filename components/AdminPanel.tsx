'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

type WeekOption = { id: string; label: string; isClosed: boolean }
type User = { id: string; display_name: string; total_xp: number; level: number }
type Attendance = { user_id: string; days: number[] }

const card = { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }
const input = { backgroundColor: 'var(--bg-card2)', borderColor: 'var(--border)', color: 'var(--text)' }

export function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit() {
    setBusy(true)
    setError(null)
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', password }),
    })
    setBusy(false)
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Login failed')
    }
  }

  return (
    <div className="rounded-2xl border p-4 space-y-3" style={card}>
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder="Password"
        className="w-full rounded-lg border px-3 py-2 text-sm"
        style={input}
      />
      <button
        onClick={submit}
        disabled={busy || !password}
        className="w-full rounded-lg bg-blue-600 text-white text-sm font-semibold py-2 disabled:opacity-50"
      >
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function AdminPanel({
  weeks,
  selectedWeekId,
  users,
  attendance,
}: {
  weeks: WeekOption[]
  selectedWeekId: string | null
  users: User[]
  attendance: Attendance[]
}) {
  const router = useRouter()
  const week = weeks.find(w => w.id === selectedWeekId) ?? null

  const initial: Record<string, number[]> = {}
  for (const u of users) initial[u.id] = []
  for (const a of attendance) initial[a.user_id] = [...a.days]

  const [days, setDays] = useState<Record<string, number[]>>(initial)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  function toggle(userId: string, day: number) {
    setDays(prev => {
      const current = prev[userId] ?? []
      const next = current.includes(day) ? current.filter(d => d !== day) : [...current, day].sort()
      return { ...prev, [userId]: next }
    })
  }

  async function call(action: string, extra: object = {}) {
    if (!week) return
    setBusy(true)
    setMsg(null)
    const res = await fetch('/api/admin/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, weekId: week.id, ...extra }),
    })
    const data = await res.json().catch(() => ({}))
    setBusy(false)
    if (res.ok) {
      setMsg('Saved')
      router.refresh()
    } else {
      setMsg(data.error ?? 'Failed')
    }
  }

  function save() {
    const entries = Object.entries(days).map(([userId, d]) => ({ userId, days: d }))
    call('save_attendance', { entries })
  }

  async function logout() {
    await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={selectedWeekId ?? ''}
          onChange={e => router.push(`/admin?week=${e.target.value}`)}
          className="rounded-lg border px-3 py-2 text-sm"
          style={input}
        >
          {weeks.map(w => (
            <option key={w.id} value={w.id}>
              {w.label}{w.isClosed ? ' (closed)' : ' (open)'}
            </option>
          ))}
        </select>
        {week && (
          <button
            onClick={() => call(week.isClosed ? 'reopen_week' : 'close_week')}
            disabled={busy}
            className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
            style={input}
          >
            {week.isClosed ? 'Reopen week' : 'Close week'}
          </button>
        )}
        <button onClick={logout} className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>Sign out</button>
      </div>

      {week && (
        <div className="rounded-2xl border p-4" style={card}>
          <div className="grid gap-2" style={{ gridTemplateColumns: '1fr repeat(5, 2.5rem)' }}>
            <div />
            {DAYS.map(d => (
              <div key={d} className="text-xs font-bold uppercase text-center" style={{ color: 'var(--text-muted)' }}>{d}</div>
            ))}
            {users.map(u => (
              <div key={u.id} className="contents">
                <div className="text-sm py-1" style={{ color: 'var(--text)' }}>
                  {u.display_name}
                  <span className="text-xs ml-2" style={{ color: 'var(--text-faint)' }}>Lv{u.level} · {u.total_xp} XP</span>
                </div>
                {[1, 2, 3, 4, 5].map(d => (
                  <label key={d} className="flex items-center justify-center py-1">
                    <input
                      type="checkbox"
                      checked={(days[u.id] ?? []).includes(d)}
                      onChange={() => toggle(u.id, d)}
                      className="h-4 w-4"
                    />
                  </label>
                ))}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={save}
              disabled={busy}
              className="rounded-lg bg-blue-600 text-white text-sm font-semibold px-4 py-2 disabled:opacity-50"
            >
              {busy ? 'Saving…' : 'Save'}
            </button>
            {msg && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{msg}</span>}
          </div>

          <p className="text-xs mt-4" style={{ color: 'var(--text-faint)' }}>
            {week.isClosed
              ? 'This week is closed. Saving recalculates its XP for everyone; other weeks are not touched.'
              : 'This week is open. XP is awarded when the week is closed.'}
            {' '}The Slack message is updated to match. No DMs are sent.
          </p>
        </div>
      )}

      {!week && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No weeks yet.</p>}
    </div>
  )
}
