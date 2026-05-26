import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ILYASS TV - Premium IPTV Streaming",
  description:
    "Experience premium IPTV streaming with ILYASS TV. Live TV, events, and on-demand content across all your devices.",
  keywords: ["IPTV", "streaming", "live TV", "Android TV", "ILYASS TV"],
  openGraph: {
    title: "ILYASS TV - Premium IPTV Streaming",
    description: "Experience premium IPTV streaming with ILYASS TV.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
