import { formatWeekLabel, getWeekNumber } from './week'

const DAYS = ['Maanantai', 'Tiistai', 'Keskiviikko', 'Torstai', 'Perjantai']

export function buildPollBlocks(
  weekStart: Date,
  attendanceByDay: Record<number, string[]>,
  isClosed: boolean
) {
  const weekLabel = formatWeekLabel(weekStart)

  const dayLines = DAYS.map((name, i) => {
    const people = attendanceByDay[i + 1] ?? []
    return `*${name}:* ${people.length > 0 ? people.join(', ') : '-'}`
  }).join('\n')

  const title = isClosed
    ? `📅 *Toimistolla tällä viikolla* (${weekLabel}) _(suljettu)_`
    : `📅 *Toimistolla tällä viikolla* (${weekLabel})`

  const blocks: object[] = [
    { type: 'section', text: { type: 'mrkdwn', text: title } },
    { type: 'section', text: { type: 'mrkdwn', text: dayLines } },
  ]

  if (!isClosed) {
    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Ilmoita / muuta päiväsi' },
          action_id: 'open_attendance_modal',
          style: 'primary',
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: '🏆 Office Quest' },
          action_id: 'open_dashboard',
          url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        },
      ],
    })
  } else {
    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: '🏆 Office Quest' },
          action_id: 'open_dashboard',
          url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        },
      ],
    })
  }

  return blocks
}

export function buildModalView(weekStart: Date, currentDays: number[]) {
  const weekLabel = formatWeekLabel(weekStart)
  const dayOptions = [
    { text: { type: 'plain_text', text: 'Maanantai' }, value: '1' },
    { text: { type: 'plain_text', text: 'Tiistai' }, value: '2' },
    { text: { type: 'plain_text', text: 'Keskiviikko' }, value: '3' },
    { text: { type: 'plain_text', text: 'Torstai' }, value: '4' },
    { text: { type: 'plain_text', text: 'Perjantai' }, value: '5' },
  ]

  const initialOptions = dayOptions.filter(o => currentDays.includes(Number(o.value)))

  return {
    type: 'modal',
    callback_id: 'attendance_modal',
    title: { type: 'plain_text', text: 'Office days this week' },
    submit: { type: 'plain_text', text: 'Tallenna' },
    close: { type: 'plain_text', text: 'Peruuta' },
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*${weekLabel}*` },
      },
      {
        type: 'input',
        block_id: 'days_block',
        optional: true,
        label: { type: 'plain_text', text: 'Valitse päivät' },
        element: {
          type: 'checkboxes',
          action_id: 'days_action',
          options: dayOptions,
          ...(initialOptions.length > 0 ? { initial_options: initialOptions } : {}),
        },
      },
    ],
  }
}
