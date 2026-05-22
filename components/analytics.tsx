'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { staggerContainer, staggerItem } from './motion'
import { Card } from './ui/glass-card'
import { format, subDays, isSameDay } from 'date-fns'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts'
import {
  Clock, Target, TrendingUp, TrendingDown, Flame, CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const CHART_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']
const SUBJECT_KEYWORDS: Record<string, string> = {
  physics: 'Physics', mathematics: 'Mathematics', math: 'Mathematics',
  chemistry: 'Chemistry', biology: 'Biology', english: 'English',
  history: 'History', 'computer': 'Computer Science',
}

function inferSubject(title: string, subject?: string | null): string {
  if (subject) return subject
  const lower = title.toLowerCase()
  for (const [key, value] of Object.entries(SUBJECT_KEYWORDS)) { if (lower.includes(key)) return value }
  return 'Other'
}

export function Analytics() {
  const progress = useStore((s) => s.progress)
  const tasks = useStore((s) => s.tasks)
  const habits = useStore((s) => s.habits)
  const focusSessions = useStore((s) => s.focusSessions)

  const weeklyData = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    const dayFocus = focusSessions.filter((s) => s.endTime && isSameDay(new Date(s.endTime), date)).reduce((a, s) => a + s.duration, 0)
    const dayTasks = tasks.filter((t) => t.completedAt && isSameDay(new Date(t.completedAt), date)).length
    const dayHabits = habits.filter((h) => h.completedDates.includes(format(date, 'yyyy-MM-dd'))).length
    return { day: format(date, 'EEE'), date: format(date, 'MMM d'), focus: dayFocus, tasks: dayTasks, habits: dayHabits }
  }), [focusSessions, tasks, habits])

  const subjectData = useMemo(() => {
    const subjectHours: Record<string, number> = {}
    focusSessions.filter((s) => s.endTime).forEach((s) => {
      const subject = inferSubject(s.subject || '')
      subjectHours[subject] = (subjectHours[subject] || 0) + s.duration
    })
    const entries = Object.entries(subjectHours).sort(([, a], [, b]) => b - a).slice(0, 5)
      .map(([name, hours], i) => ({ name, hours: Math.round((hours / 60) * 10) / 10, color: CHART_COLORS[i % CHART_COLORS.length] }))
    return entries.length > 0 ? entries : [{ name: 'No data yet', hours: 1, color: 'var(--muted-foreground)' }]
  }, [focusSessions])

  const productivityData = useMemo(() => {
    const hourly: Record<number, number[]> = {}
    focusSessions.filter((s) => s.endTime).forEach((s) => {
      const hour = new Date(s.startTime).getHours()
      if (!hourly[hour]) hourly[hour] = []
      hourly[hour].push(s.duration)
    })
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      productivity: hourly[i] ? Math.round((hourly[i].reduce((a, b) => a + b, 0) / hourly[i].length) * 2) : 0,
    }))
  }, [focusSessions])

  const stats = useMemo(() => {
    const totalFocusThisWeek = weeklyData.reduce((acc, d) => acc + d.focus, 0)
    const avgFocusPerDay = weeklyData.length > 0 ? Math.round(totalFocusThisWeek / weeklyData.length) : 0
    const totalTasksDone = tasks.filter((t) => t.status === 'done').length
    const taskCompletionRate = tasks.length > 0 ? Math.round((totalTasksDone / tasks.length) * 100) : 0
    const lastWeekFocus = focusSessions.filter((s) => s.endTime && isSameDay(new Date(s.endTime), subDays(new Date(), 7))).reduce((a, s) => a + s.duration, 0)
    const focusTrend = lastWeekFocus > 0 ? Math.round(((totalFocusThisWeek - lastWeekFocus) / lastWeekFocus) * 100) : totalFocusThisWeek > 0 ? 100 : 0
    const lastWeekTasks = tasks.filter((t) => t.completedAt && new Date(t.completedAt) >= subDays(new Date(), 13)).length
    const taskTrend = lastWeekTasks > 0 ? Math.round(((totalTasksDone - lastWeekTasks) / lastWeekTasks) * 100) : totalTasksDone > 0 ? 100 : 0
    return { totalFocusThisWeek, avgFocusPerDay, totalTasksDone, taskCompletionRate, focusTrend, taskTrend }
  }, [weeklyData, tasks, focusSessions])

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5">
      <motion.div variants={staggerItem}>
        <h1 className="text-xl lg:text-2xl font-semibold tracking-tight text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Track your progress</p>
      </motion.div>

      <motion.div variants={staggerItem} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat icon={<Clock className="w-4 h-4" />} label="Weekly focus" value={`${Math.floor(stats.totalFocusThisWeek / 60)}h ${stats.totalFocusThisWeek % 60}m`} trend={stats.focusTrend} />
        <Stat icon={<CheckCircle2 className="w-4 h-4" />} label="Tasks completed" value={stats.totalTasksDone.toString()} trend={stats.taskTrend} />
        <Stat icon={<Target className="w-4 h-4" />} label="Completion rate" value={`${stats.taskCompletionRate}%`} />
        <Stat icon={<Flame className="w-4 h-4" />} label="Best streak" value={`${progress.bestStreak} days`} />
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div variants={staggerItem}>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">Weekly focus time</h3>
              <span className="text-xs text-muted-foreground">Last 7 days</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" strokeWidth={0.5} />
                  <XAxis dataKey="day" className="text-xs fill-muted-foreground" tick={{ fill: 'currentColor' }} />
                  <YAxis className="text-xs fill-muted-foreground" tick={{ fill: 'currentColor' }} tickFormatter={(v: number) => `${Math.floor(v / 60)}h`} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '0.5rem', fontSize: '0.75rem' }}
                    formatter={(value: number) => [`${Math.floor(value / 60)}h ${value % 60}m`, 'Focus']} />
                  <Bar dataKey="focus" fill="var(--primary)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">Subject distribution</h3>
              <span className="text-xs text-muted-foreground">All time</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="h-44 w-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={subjectData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="hours">
                      {subjectData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '0.5rem', fontSize: '0.75rem' }}
                      formatter={(value: number) => [`${value}h`, 'Time']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5">
                {subjectData.map((subject) => (
                  <div key={subject.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: subject.color }} />
                      <span className="text-sm text-foreground">{subject.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{subject.hours}h</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">Productivity patterns</h3>
              <span className="text-xs text-muted-foreground">Avg by hour</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productivityData}>
                  <defs><linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} /><stop offset="95%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" strokeWidth={0.5} />
                  <XAxis dataKey="hour" className="text-xs fill-muted-foreground" tick={{ fill: 'currentColor' }} interval={3} />
                  <YAxis className="text-xs fill-muted-foreground" tick={{ fill: 'currentColor' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '0.5rem', fontSize: '0.75rem' }}
                    formatter={(value: number) => [`${Math.round(value)}%`, 'Productivity']} />
                  <Area type="monotone" dataKey="productivity" stroke="var(--primary)" strokeWidth={1.5} fill="url(#prodGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">Activity trends</h3>
              <span className="text-xs text-muted-foreground">Last 7 days</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" strokeWidth={0.5} />
                  <XAxis dataKey="day" className="text-xs fill-muted-foreground" tick={{ fill: 'currentColor' }} />
                  <YAxis className="text-xs fill-muted-foreground" tick={{ fill: 'currentColor' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '0.5rem', fontSize: '0.75rem' }} />
                  <Line type="monotone" dataKey="tasks" stroke="var(--chart-2)" strokeWidth={1.5} dot={{ fill: 'var(--chart-2)', r: 3 }} name="Tasks" />
                  <Line type="monotone" dataKey="habits" stroke="var(--chart-4)" strokeWidth={1.5} dot={{ fill: 'var(--chart-4)', r: 3 }} name="Habits" />
                </LineChart>
              </ResponsiveContainer>
            </div>
           </Card>
         </motion.div>
       </div>

       {stats.focusTrend !== null && stats.focusTrend !== 0 && (
         <motion.div variants={staggerItem}>
           <div className={cn(
             'p-4 rounded-lg border',
             stats.focusTrend > 0 ? 'bg-success/5 border-success/20' : 'bg-warning/5 border-warning/20'
           )}>
             <div className="flex items-center gap-2">
               {stats.focusTrend > 0 ? (
                 <TrendingUp className="w-4 h-4 text-success" />
               ) : (
                 <TrendingDown className="w-4 h-4 text-warning" />
               )}
               <h4 className="text-sm font-medium text-foreground">
                 {stats.focusTrend > 0 ? 'Focus time trending up' : 'Focus time trending down'}
               </h4>
             </div>
             <p className="text-xs text-muted-foreground mt-1 ml-6">
               {stats.focusTrend > 0
                 ? `Focus time is ${stats.focusTrend}% higher than last week.`
                 : `Focus time is ${Math.abs(stats.focusTrend)}% lower than last week.`
               }
             </p>
           </div>
         </motion.div>
       )}
     </motion.div>
  )
}

function Stat({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string; trend?: number }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-semibold text-foreground">{value}</span>
        {trend !== undefined && (
          <span className={cn('flex items-center text-xs', trend >= 0 ? 'text-success' : 'text-destructive')}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </Card>
   )
 }

