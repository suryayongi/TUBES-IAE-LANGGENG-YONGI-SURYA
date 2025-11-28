import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SCM Dashboard',
  description: 'Supply Chain Management Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
