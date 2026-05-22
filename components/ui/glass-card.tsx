'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children?: React.ReactNode
  hover?: boolean
  elevated?: boolean
  glass?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, hover = false, elevated = false, glass = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          glass ? 'glass-card' : elevated ? 'card-elevated' : 'card-surface',
          hover && 'transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = 'Card'
