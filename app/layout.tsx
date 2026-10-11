import type { Metadata } from 'next'
import { Press_Start_2P, VT323 } from 'next/font/google'
import './globals.css'

const pixel = Press_Start_2P({ weight: '400', subsets: ['latin'], variable: '--font-pixel' })
const body = VT323({ weight: '400', subsets: ['latin'], variable: '--font-body' })

export const metadata: Metadata = {
  title: 'Office Quest',
  description: 'Paikalla: who shows up at the Ilmiö office, and how far they have travelled.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${pixel.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  )
}
