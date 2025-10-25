import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Imposter - Social Deduction Game',
  description: 'A fun party game where you identify imposters through clever conversation!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          {children}
        </div>
      </body>
    </html>
  )
}
