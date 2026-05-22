import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geist = Geist({
  subsets: ["latin"],
  variable: '--font-geist',
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Student OS - Your Ultimate Study Companion',
  description: 'An all-in-one study tracker, deep work timer, planner, and productivity dashboard designed for ambitious students. Built thoughtfully by Jainam Karnawat.',
  generator: 'Student OS',
  manifest: '/manifest.json',
  keywords: ['study', 'productivity', 'focus', 'timer', 'planner', 'student', 'education', 'pomodoro', 'habits', 'analytics'],
  authors: [{ name: 'Jainam Karnawat', url: 'https://instagram.com/thats.jainam' }],
  creator: 'Jainam Karnawat',
  publisher: 'Student OS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Student OS',
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Student OS - Your Ultimate Study Companion',
    description: 'An all-in-one study tracker, deep work timer, planner, and productivity dashboard. Built thoughtfully by Jainam Karnawat.',
    siteName: 'Student OS',
    url: 'https://student-os.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Student OS - Your Ultimate Study Companion',
    description: 'An all-in-one study tracker, deep work timer, planner, and productivity dashboard. Built thoughtfully by Jainam Karnawat.',
    creator: '@thats.jainam',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'productivity',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a14' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <Script id="theme-hydration" strategy="beforeInteractive">
{`(function() {
  try {
    var raw = localStorage.getItem('student-os-storage-v2');
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed.state) {
        var theme = parsed.state.theme;
        var root = document.documentElement;
        root.classList.remove('light', 'dark', 'amoled');
        if (theme === 'dark' || theme === 'amoled') {
          root.classList.add('dark');
          if (theme === 'amoled') root.classList.add('amoled');
        }
      }
    }
  } catch(e) {}
})();`}
        </Script>
      </head>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
