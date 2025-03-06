import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'JSON to CSV Converter | Modern Data Transformation Tool',
  description: 'Convert JSON data to CSV format easily. Support for nested JSON structures, drag and drop functionality, and instant conversion.',
  keywords: 'JSON to CSV, data conversion, JSON parser, CSV export, data transformation',
  openGraph: {
    title: 'JSON to CSV Converter',
    description: 'Convert JSON data to CSV format easily',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
