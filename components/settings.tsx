'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { staggerContainer, staggerItem } from './motion'
import { Card } from './ui/glass-card'
import { Button } from './ui/button'
import {
  Moon, Sun, Monitor, Sparkles, Download, Trash2, Clock, Bell, Target, ChevronRight, HelpCircle,
  Instagram, Heart, Zap, User,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Settings() {
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const userName = useStore((s) => s.userName)
  const setUserName = useStore((s) => s.setUserName)
  const progress = useStore((s) => s.progress)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const handleExport = () => {
    const data = localStorage.getItem('student-os-storage-v2')
    if (!data) return
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `student-os-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClearData = () => {
    localStorage.removeItem('student-os-storage-v2')
    window.location.reload()
  }

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5 max-w-xl">
      <motion.div variants={staggerItem}>
        <h1 className="text-xl lg:text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Customize your experience</p>
      </motion.div>

      <motion.div variants={staggerItem}>
        <h3 className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Profile</h3>
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-4 p-5">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">{userName.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)}
                className="text-base font-semibold bg-transparent border-0 focus:outline-none focus:ring-0 w-full text-foreground"
                placeholder="Your name" aria-label="Your name" maxLength={50} />
              <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                <span>Level {progress.level}</span>
                <span>{progress.xp.toLocaleString()} XP</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 border-t border-border">
            <div className="p-3.5 text-center border-r border-border">
              <p className="text-lg font-semibold text-foreground">{Math.floor(progress.totalFocusTime / 60)}</p>
              <p className="text-xs text-muted-foreground">Hours focused</p>
            </div>
            <div className="p-3.5 text-center border-r border-border">
              <p className="text-lg font-semibold text-foreground">{progress.totalTasksCompleted}</p>
              <p className="text-xs text-muted-foreground">Tasks done</p>
            </div>
            <div className="p-3.5 text-center">
              <p className="text-lg font-semibold text-foreground">{progress.bestStreak}</p>
              <p className="text-xs text-muted-foreground">Best streak</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={staggerItem}>
        <h3 className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Appearance</h3>
        <Card className="p-1.5">
          <div className="grid grid-cols-3 gap-1.5">
            <ThemeButton icon={<Sun className="w-4 h-4" />} label="Light" active={theme === 'light'} onClick={() => setTheme('light')} />
            <ThemeButton icon={<Moon className="w-4 h-4" />} label="Dark" active={theme === 'dark'} onClick={() => setTheme('dark')} />
            <ThemeButton icon={<Monitor className="w-4 h-4" />} label="AMOLED" active={theme === 'amoled'} onClick={() => setTheme('amoled')} />
          </div>
        </Card>
      </motion.div>

      <motion.div variants={staggerItem}>
        <h3 className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Focus</h3>
        <Card className="p-0 overflow-hidden">
          <SettingRow icon={<Clock className="w-4 h-4" />} title="Default timer" description="Adjust presets in the Focus tab" />
          <SettingRow icon={<Bell className="w-4 h-4" />} title="Sound & notifications" description="Timer alert on completion" />
          <SettingRow icon={<Target className="w-4 h-4" />} title="Weekly goal" description={`${Math.floor(progress.weeklyGoal / 60)} hours`} isLast />
        </Card>
      </motion.div>

      <motion.div variants={staggerItem}>
        <h3 className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Data</h3>
        <Card className="p-0 overflow-hidden">
          <SettingRow icon={<Download className="w-4 h-4" />} title="Export data" description="Download JSON backup" onClick={handleExport} />
          <SettingRow icon={<Trash2 className="w-4 h-4" />} title="Clear all data" description="Permanently delete local data" onClick={() => setShowClearConfirm(true)} isLast />
        </Card>
      </motion.div>

      <motion.div variants={staggerItem}>
        <h3 className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Creator</h3>
        <Card className="p-5 overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-primary">JK</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-semibold text-foreground">Jainam Karnawat</h4>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Designer & Developer</p>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Building tools that help students work with intention and clarity.
              </p>
              <a
                href="https://instagram.com/thats.jainam"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-xs text-muted-foreground hover:text-foreground"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>@thats.jainam</span>
              </a>
            </div>
          </div>
        </Card>
       </motion.div>

       <motion.div variants={staggerItem}>
         <h3 className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">About</h3>
        <Card className="p-0 overflow-hidden">
          <SettingRow icon={<HelpCircle className="w-4 h-4" />} title="Help & support" description="Questions or feedback? Reach out on Instagram" onClick={() => window.open('https://instagram.com/thats.jainam', '_blank')} />
          <SettingRow icon={<User className="w-4 h-4" />} title="Creator" description="Jainam Karnawat" onClick={() => window.open('https://instagram.com/thats.jainam', '_blank')} isLast />
        </Card>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card className="text-center py-6 bg-gradient-to-b from-card to-transparent border-border/50">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">Student OS</h4>
          <p className="text-xs text-muted-foreground">Version 1.0.0</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1.5">
            Made with ♥ by Jainam
          </p>
        </Card>
      </motion.div>

      {showClearConfirm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
          onClick={() => setShowClearConfirm(false)} role="alertdialog" aria-modal="true" aria-label="Confirm clear data">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-card rounded-xl border shadow-lg p-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5 text-destructive" />
            </div>
            <h3 className="text-base font-semibold mb-1 text-foreground">Clear all data?</h3>
            <p className="text-sm text-muted-foreground mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowClearConfirm(false)} className="flex-1">Cancel</Button>
              <Button variant="destructive" onClick={handleClearData} className="flex-1">Delete everything</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}

function ThemeButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={cn('flex flex-col items-center gap-1.5 p-3 rounded-lg transition-colors text-sm', active ? 'bg-secondary text-foreground' : 'hover:bg-secondary/50 text-muted-foreground')}>
      {icon}<span>{label}</span>
    </button>
  )
}

function SettingRow({ icon, title, description, isLast, onClick }: {
  icon: React.ReactNode; title: string; description?: string; isLast?: boolean; onClick?: () => void
}) {
  return (
    <div onClick={onClick}
      className={cn('flex items-center gap-3 p-4 text-left', onClick ? 'cursor-pointer hover:bg-secondary/50 transition-colors' : '', !isLast && 'border-b border-border')}
      role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } } : undefined}>
      <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {onClick && <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
    </div>
  )
}
