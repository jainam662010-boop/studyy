'use client'

import { useMemo, memo } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { staggerContainer, staggerItem } from './motion'
import { Card } from './ui/glass-card'
import { Badge } from './ui/badge'
import { format, isToday, startOfWeek, addDays } from 'date-fns'
import {
  Flame,
  Clock,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Zap,
  Heart,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function Dashboard() {
  const userName = useStore((s) => s.userName)
  const progress = useStore((s) => s.progress)
  const tasks = useStore((s) => s.tasks)
  const habits = useStore((s) => s.habits)
  const focusSessions = useStore((s) => s.focusSessions)
  const setActiveView = useStore((s) => s.setActiveView)

  const todaysTasks = useMemo(
    () => tasks.filter((task) => task.status !== 'done' && task.dueDate && isToday(new Date(task.dueDate))),
    [tasks]
  )

  const completedToday = useMemo(
    () => tasks.filter((task) => task.completedAt && isToday(new Date(task.completedAt))).length,
    [tasks]
  )

  const todayFocusTime = useMemo(
    () => focusSessions
      .filter((s) => s.endTime && isToday(new Date(s.endTime)))
      .reduce((acc, s) => acc + s.duration, 0),
    [focusSessions]
  )

  const weeklyGoalProgress = useMemo(
    () => Math.min((progress.weeklyProgress / progress.weeklyGoal) * 100, 100),
    [progress.weeklyProgress, progress.weeklyGoal]
  )

  const heatmapData = useMemo(() => {
    const today = new Date()
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 })
    const days = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i))
    const dayMinutes = days.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      return focusSessions
        .filter((s) => s.endTime && format(new Date(s.startTime), 'yyyy-MM-dd') === dateStr)
        .reduce((acc, s) => acc + s.duration, 0)
    })
    const maxMinutes = Math.max(...dayMinutes, 1)
    return days.map((date, i) => ({
      date, day: format(date, 'EEE'),
      intensity: dayMinutes[i] / maxMinutes,
      hours: Math.floor(dayMinutes[i] / 60),
    }))
  }, [focusSessions])

  const focusPercentChange = useMemo(() => {
    const today = new Date()
    const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 })
    const lastWeekStart = addDays(thisWeekStart, -7)
    const thisWeekMinutes = focusSessions
      .filter((s) => s.endTime && new Date(s.endTime) >= thisWeekStart)
      .reduce((acc, s) => acc + s.duration, 0)
    const lastWeekMinutes = focusSessions
      .filter((s) => s.endTime && new Date(s.endTime) >= lastWeekStart && new Date(s.endTime) < thisWeekStart)
      .reduce((acc, s) => acc + s.duration, 0)
    if (lastWeekMinutes === 0) return thisWeekMinutes > 0 ? '+100%' : null
    const change = Math.round(((thisWeekMinutes - lastWeekMinutes) / lastWeekMinutes) * 100)
    return change >= 0 ? `+${change}%` : `${change}%`
  }, [focusSessions])

  const completedHabitsToday = habits.filter((h) => h.completedDates.includes(format(new Date(), 'yyyy-MM-dd'))).length

  const weekFocusTime = useMemo(() => {
    const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    return focusSessions
      .filter((s) => s.endTime && new Date(s.endTime) >= thisWeekStart)
      .reduce((acc, s) => acc + s.duration, 0)
  }, [focusSessions])

  const tasksCompletedThisWeek = useMemo(() => {
    const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    return tasks.filter((task) => {
      if (!task.completedAt) return false
      return new Date(task.completedAt) >= thisWeekStart
    }).length
  }, [tasks])

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h1 className="text-xl lg:text-2xl font-semibold tracking-tight text-foreground">
          {getGreeting()}, {userName}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">{format(new Date(), 'EEEE, MMMM d')}</p>
      </motion.div>

      {/* Quick Stats Row */}
      <motion.div variants={staggerItem} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat
          icon={<Clock className="w-4 h-4" />}
          label="Focus today"
          value={`${Math.floor(todayFocusTime / 60)}h ${todayFocusTime % 60}m`}
          trend={focusPercentChange}
        />
        <Stat
          icon={<CheckCircle2 className="w-4 h-4" />}
          label="Tasks done"
          value={`${completedToday}/${tasks.length}`}
        />
        <Stat
          icon={<Flame className="w-4 h-4" />}
          label="Streak"
          value={`${progress.currentStreak} days`}
        />
        <Stat
          icon={<Sparkles className="w-4 h-4" />}
          label="Weekly goal"
          value={`${Math.round(weeklyGoalProgress)}%`}
        />
      </motion.div>

      {/* Bento Grid */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Focus Flow Chart */}
        <div className="md:col-span-7 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Focus flow</h3>
              <p className="text-xl font-semibold text-foreground mt-0.5">
                {Math.floor(todayFocusTime / 60)}h{' '}
                <span className="text-sm font-normal text-muted-foreground">/ {Math.floor(progress.weeklyGoal / 60)}h today</span>
              </p>
            </div>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">Week</span>
          </div>
          <div className="h-32 w-full">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 80">
              <defs>
                <linearGradient id="lineGrad" x1="0" x2="0" y1="0" y2="0">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={heatmapData.map((d, i) => `${i === 0 ? 'M' : 'Q'}${i === 0 ? '' : `${(i - 0.5) * (400 / 7)} ${80 - (heatmapData[i - 1].intensity * 50 + 15)} `}${(i + 0.5) * (400 / 7)} ${80 - (d.intensity * 50 + 15)}`).join(' ')}
                fill="none" stroke="var(--primary)" strokeWidth="1.5" opacity="0.6"
              />
              <path
                d={`M${heatmapData.map((d, i) => `${(i + 0.5) * (400 / 7)} ${80 - (d.intensity * 50 + 15)}`).join(' L')} L400 80 L0 80 Z`}
                fill="url(#lineGrad)"
              />
            </svg>
            <div className="flex justify-between -mt-1">
              {heatmapData.map((d, i) => (
                <span key={i} className={cn('text-[10px]', d.intensity > 0 ? 'text-muted-foreground' : 'text-muted-foreground/40')}>
                  {d.day}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Streak + XP */}
        <div className="md:col-span-5 glass-card p-5 flex flex-col items-center justify-center text-center">
          <div className="relative w-16 h-16 mb-3">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-border" />
              <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeDasharray={176}
                strokeDashoffset={176 - (Math.min(progress.currentStreak / 30, 1) * 176)}
                className="text-primary" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Flame className="w-6 h-6 text-primary" fill="currentColor" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{progress.currentStreak}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Day streak</p>
          <div className="mt-3 w-full card-flat px-3 py-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">XP</span>
              <span className="font-medium text-foreground">{progress.xp.toLocaleString()}</span>
            </div>
            <div className="w-full bg-border h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-[width] duration-500 ease-out" style={{ width: `${(progress.xp % 1000) / 10}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {1000 - (progress.xp % 1000)} XP to level {progress.level + 1}
            </p>
          </div>
        </div>

        {/* Study Stats */}
        <div className="md:col-span-5 glass-card p-5 border-l-2 border-l-primary/30">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">This week</h3>
          </div>
          <div className="space-y-4">
            <div className="text-sm text-foreground/80">
              <p>{Math.floor(weekFocusTime / 60)}h {weekFocusTime % 60}m focused</p>
              <p className="text-xs text-muted-foreground mt-0.5">{todayFocusTime}m today</p>
            </div>
            <div className="text-sm text-foreground/80">
              <p>{tasksCompletedThisWeek} tasks completed</p>
              <p className="text-xs text-muted-foreground mt-0.5">{completedToday} done today</p>
            </div>
            <div className="text-sm text-foreground/80">
              <p>{habits.length > 0 ? `${completedHabitsToday}/${habits.length} habits done today` : 'No habits tracked yet'}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{progress.currentStreak} day streak</p>
            </div>
          </div>
        </div>

        {/* Focus Queue */}
        <div className="md:col-span-7 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground">Focus queue</h3>
            <button onClick={() => setActiveView('tasks')} className="text-xs text-primary hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-1">
            {todaysTasks.length > 0 ? (
              todaysTasks.slice(0, 4).map((task, i) => (
                <TaskRow key={task.id} task={task} index={i} />
              ))
            ) : (
              <div className="py-6 text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto text-muted-foreground/20 mb-2" />
                <p className="text-sm text-muted-foreground">No tasks due today</p>
                <button onClick={() => setActiveView('tasks')} className="mt-1 text-xs text-primary hover:underline">
                  Create a task
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Start Focus CTA */}
        <div className="md:col-span-12 glass-card p-5 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-base font-medium text-foreground">Ready to focus?</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Start a deep work session to build momentum.</p>
          </div>
          <button
            onClick={() => setActiveView('focus')}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Start focus session
          </button>
        </div>
      </motion.div>

      {/* Subtle creator credit - mobile only (footer handles desktop) */}
      <motion.div variants={staggerItem} className="lg:hidden text-center pt-2">
        <a
          href="https://instagram.com/thats.jainam"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors"
          aria-label="Built by Jainam Karnawat"
        >
          <Heart className="w-2.5 h-2.5" />
          <span>Built by Jainam</span>
        </a>
      </motion.div>
    </motion.div>
  )
}

function Stat({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string; trend?: string | null }) {
  return (
    <div className="glass-card-subtle p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-semibold text-foreground">{value}</span>
        {trend && (
          <span className="flex items-center text-xs text-success">
            <TrendingUp className="w-3 h-3 mr-0.5" />
            {trend}
          </span>
        )}
      </div>
    </div>
  )
}

const TaskRow = memo(function TaskRow({ task, index }: { task: { id: string; title: string; subject?: string | null; priority: 'high' | 'medium' | 'low' }; index: number }) {
  const completeTask = useStore((s) => s.completeTask)
  return (
    <div
      style={{ animationDelay: `${index * 30}ms` }}
      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary/50 transition-colors group animate-[slideUp_0.25s_ease-out_both]"
    >
      <button
        onClick={() => completeTask(task.id)}
        className="shrink-0 w-4 h-4 rounded-full border border-muted-foreground/30 hover:border-primary hover:bg-primary/10 transition-colors"
        aria-label={`Mark "${task.title}" as complete`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate">{task.title}</p>
        {task.subject && <p className="text-xs text-muted-foreground">{task.subject}</p>}
      </div>
      <Badge variant={task.priority === 'high' ? 'high' : task.priority === 'medium' ? 'medium' : 'low'}>
        {task.priority}
      </Badge>
    </div>
  )
})
