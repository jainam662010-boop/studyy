'use client'

import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export function Loader({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16', className)} role="status" aria-label="Loading">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-[fadeIn_0.6s_ease-in-out_infinite_0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-[fadeIn_0.6s_ease-in-out_infinite_200ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-[fadeIn_0.6s_ease-in-out_infinite_400ms]" />
        </div>
        <p className="text-xs text-muted-foreground mt-3">Student OS</p>
        <p className="text-[10px] text-muted-foreground/50 mt-0.5">Built by Jainam</p>
      </motion.div>
    </div>
  )
}
