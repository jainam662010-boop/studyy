'use client'

import { useState, useMemo, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore, type Habit } from '@/lib/store'
import { staggerContainer, staggerItem } from './motion'
import { Card } from './ui/glass-card'
import { Modal } from './modal'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useToast } from './ui/toast'
import { format, subDays, isToday } from 'date-fns'
import {
  Plus, Flame, Trophy, Target, CheckCircle2, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const HABIT_ICONS = ['📚', '🏃', '📝', '💪', '🧘', '💤', '🍎', '💧', '🎯', '⏰', '🧠', '📖']

export function HabitTracking() {
  const habits = useStore((s) => s.habits)
  const addHabit = useStore((s) => s.addHabit)
  const toggleHabitDay = useStore((s) => s.toggleHabitDay)
  const deleteHabit = useStore((s) => s.deleteHabit)
  const progress = useStore((s) => s.progress)
  const { showToast } = useToast()
  const [showAddModal, setShowAddModal] = useState(false)
  const today = format(new Date(), 'yyyy-MM-dd')

  const completedToday = useMemo(() => habits.filter((h) => h.completedDates.includes(today)).length, [habits, today])
  const totalStreak = useMemo(() => habits.reduce((acc, h) => acc + h.streak, 0), [habits])
  const completionRate = useMemo(() => habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0, [habits, completedToday])

  const last7Days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    return { date, dateStr: format(date, 'yyyy-MM-dd'), day: format(date, 'EEE'), dayNum: format(date, 'd'), isToday: isToday(date) }
  }), [])

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5">
      <motion.div variants={staggerItem} className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold tracking-tight text-foreground">Habits</h1>
          <p className="text-sm text-muted-foreground">Build consistency</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" /> Add habit
        </Button>
      </motion.div>

      <motion.div variants={staggerItem} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <p className="text-xl font-semibold text-foreground">{completedToday}/{habits.length}</p>
          <p className="text-xs text-muted-foreground">Completed today</p>
        </Card>
        <Card className="p-4">
          <div className="w-8 h-8 rounded-lg bg-chart-5/10 flex items-center justify-center mb-2">
            <Flame className="w-4 h-4 text-chart-5" />
          </div>
          <p className="text-xl font-semibold text-foreground">{totalStreak}</p>
          <p className="text-xs text-muted-foreground">Total streaks</p>
        </Card>
        <Card className="p-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <p className="text-xl font-semibold text-foreground">{completionRate}%</p>
          <p className="text-xs text-muted-foreground">Today&apos;s rate</p>
        </Card>
        <Card className="p-4">
          <div className="w-8 h-8 rounded-lg bg-chart-4/10 flex items-center justify-center mb-2">
            <Trophy className="w-4 h-4 text-chart-4" />
          </div>
          <p className="text-xl font-semibold text-foreground">{progress.bestStreak}</p>
          <p className="text-xs text-muted-foreground">Best streak</p>
        </Card>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-3 text-foreground">This week</h3>
          <div className="grid grid-cols-7 gap-1.5">
            {last7Days.map((day) => (
              <div key={day.dateStr} className={cn('text-center p-2 rounded-lg transition-colors', day.isToday && 'bg-secondary')}>
                <p className="text-xs text-muted-foreground">{day.day}</p>
                <p className={cn('text-sm font-medium mt-0.5', day.isToday && 'text-primary')}>{day.dayNum}</p>
                <div className="flex justify-center gap-0.5 mt-1.5">
                  {habits.slice(0, 3).map((habit) => (
                    <div key={habit.id} className={cn('w-1.5 h-1.5 rounded-full', habit.completedDates.includes(day.dateStr) ? 'bg-success' : 'bg-border')} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={staggerItem} className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">Your habits</h3>
        <AnimatePresence mode="popLayout">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} days={last7Days}
              onToggle={(date) => {
                const wasCompleted = habit.completedDates.includes(date)
                toggleHabitDay(habit.id, date)
                if (!wasCompleted) {
                  showToast({ type: 'streak', title: `${habit.streak + 1} day streak!`, description: `"${habit.name}" completed` })
                }
              }}
              onDelete={() => deleteHabit(habit.id)} />
          ))}
        </AnimatePresence>
        {habits.length === 0 && (
          <div className="py-12 text-center">
            <Target className="w-10 h-10 mx-auto text-muted-foreground/20 mb-2" />
            <p className="text-sm text-muted-foreground">No habits yet</p>
            <button onClick={() => setShowAddModal(true)} className="mt-2 text-sm text-primary hover:underline">Create your first habit</button>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showAddModal && (
          <AddHabitModal onClose={() => setShowAddModal(false)}
            onAdd={(habit) => { addHabit(habit); setShowAddModal(false) }} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const HabitCard = memo(function HabitCard({ habit, days, onToggle, onDelete }: {
  habit: Habit; days: { dateStr: string; day: string; isToday: boolean }[]; onToggle: (d: string) => void; onDelete: () => void
}) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const isCompletedToday = habit.completedDates.includes(today)
  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }} className="group">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => onToggle(today)}
            className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-colors shrink-0', isCompletedToday ? 'bg-success/20' : 'bg-secondary hover:bg-secondary/80')}>
            {habit.icon}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{habit.name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <Flame className="w-3 h-3 text-chart-5" />
              <span>{habit.streak} day streak</span>
              {habit.bestStreak > 0 && (<><span>·</span><span>Best: {habit.bestStreak}</span></>)}
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-1">
            {days.map((day) => {
              const isCompleted = habit.completedDates.includes(day.dateStr)
              return (
                <button key={day.dateStr} onClick={() => onToggle(day.dateStr)}
                  className={cn('w-7 h-7 rounded-md flex items-center justify-center text-xs font-medium transition-colors', isCompleted ? 'bg-success text-success-foreground' : day.isToday ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground hover:bg-secondary/80')}>
                  {day.day.charAt(0)}
                </button>
              )
            })}
          </div>
          <button onClick={onDelete} className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-destructive transition-opacity" aria-label={`Delete "${habit.name}"`}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="lg:hidden mt-3 flex justify-between">
          {days.map((day) => {
            const isCompleted = habit.completedDates.includes(day.dateStr)
            return (
              <button key={day.dateStr} onClick={() => onToggle(day.dateStr)}
                className={cn('w-9 h-9 rounded-lg flex flex-col items-center justify-center text-xs transition-colors', isCompleted ? 'bg-success text-success-foreground' : day.isToday ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground')}>
                <span>{day.day.charAt(0)}</span>
                {isCompleted && <CheckCircle2 className="w-2 h-2 mt-0.5" />}
              </button>
            )
          })}
        </div>
      </Card>
    </motion.div>
  )
})

function AddHabitModal({ onClose, onAdd }: { onClose: () => void; onAdd: (h: Omit<Habit, 'id' | 'completedDates' | 'streak' | 'bestStreak' | 'createdAt'>) => void }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(HABIT_ICONS[0])
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ name: name.trim(), icon, color: 'blue', frequency })
  }

  return (
    <Modal open onClose={onClose} title="New habit">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="habit-name" label="Habit name" type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Morning meditation" autoFocus maxLength={100} />
        <div>
          <label className="text-sm font-medium mb-1.5 block">Icon</label>
          <div className="grid grid-cols-6 gap-1.5">
            {HABIT_ICONS.map((i) => (
              <button key={i} type="button" onClick={() => setIcon(i)}
                className={cn('w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-colors', icon === i ? 'bg-secondary ring-1 ring-ring' : 'bg-secondary/50 hover:bg-secondary')}>
                {i}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Frequency</label>
          <div className="flex gap-2">
            {(['daily', 'weekly'] as const).map((f) => (
              <button key={f} type="button" onClick={() => setFrequency(f)}
                className={cn('flex-1 py-2 rounded-lg text-sm font-medium transition-colors', frequency === f ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80')}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" disabled={!name.trim()} className="flex-1">Create habit</Button>
        </div>
      </form>
    </Modal>
  )
}
