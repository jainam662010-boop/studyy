'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'

export function AppBackground() {
  const theme = useStore((s) => s.theme)
  const [imageLoaded, setImageLoaded] = useState<boolean | null>(null)
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const img = new Image()
    img.onload = () => setImageLoaded(true)
    img.onerror = () => setImageLoaded(false)
    img.src = '/backgrounds/main-background.jpg'
    
    const timeout = setTimeout(() => {
      setImageLoaded(false)
    }, 5000)
    
    return () => clearTimeout(timeout)
  }, [])

  if (theme === 'amoled') {
    return (
      <div 
        className="fixed inset-0 -z-10 bg-black" 
        suppressHydrationWarning
      />
    )
  }

  const isLight = theme === 'light'
  const useFallback = imageLoaded === false

  return (
    <div 
      className="fixed inset-0 -z-10 overflow-hidden" 
      suppressHydrationWarning
    >
      {useFallback ? (
        <div 
          className="absolute inset-0"
          style={{
            background: isLight
              ? 'oklch(0.97 0.003 260)'
              : 'radial-gradient(ellipse 80% 50% at 20% 80%, oklch(0.35 0.14 280 / 0.35) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 30%, oklch(0.30 0.12 170 / 0.25) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 50% 50%, oklch(0.20 0.05 260 / 0.5) 0%, oklch(0.10 0.02 260 / 1) 100%)'
          }}
        />
      ) : (
        <div 
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat ${isLight ? 'opacity-20' : 'opacity-100'}`}
          style={{ 
            backgroundImage: 'url(/backgrounds/main-background.jpg)',
            backgroundAttachment: 'fixed'
          }}
        />
      )}
      
      <div 
        className="absolute inset-0"
        style={{
          background: isLight 
            ? 'rgba(252, 252, 252, 0.94)' 
            : useFallback
              ? 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.35) 100%)'
              : 'linear-gradient(135deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.45) 100%)',
        }}
        suppressHydrationWarning
      />

      {!isLight && !useFallback && (
        <div 
          className="absolute inset-0 hidden lg:block"
          style={{
            background: 'radial-gradient(ellipse at 20% 80%, oklch(0.45 0.18 265 / 0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, oklch(0.45 0.15 185 / 0.04) 0%, transparent 50%)',
          }}
          suppressHydrationWarning
        />
      )}
    </div>
  )
}
