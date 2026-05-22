import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { format } from 'date-fns'
import { generateId } from './utils'

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}/

function isIsoDateString(value: unknown): value is string {
  return typeof value === 'string' && ISO_DATE_REGEX.test(value)
}

function reviveDates(key: string, value: unknown): unknown {
  if (isIsoDateString(value)) {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }
  if (Array.isArray(value)) {
    return value.map((item, index) => reviveDates(String(index), item))
  }
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>
    const result: Record<string, unknown> = {}
    for (const k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        result[k] = reviveDates(k, obj[k])
      }
    }
    return result
  }
  return value
}

const storage = createJSONStorage(() => localStorage, {
  reviver: reviveDates,
})

// Types
export interface Task {
  id: string
  title: string
  description?: string
  subject?: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in-progress' | 'done'
  dueDate?: Date
  subtasks?: { id: string; title: string; done: boolean }[]
  tags?: string[]
  createdAt: Date
  completedAt?: Date
}

export interface Habit {
  id: string
  name: string
  icon: string
  color: string
  frequency: 'daily' | 'weekly'
  targetDays?: number[]
  completedDates: string[]
  streak: number
  bestStreak: number
  createdAt: Date
}

export interface FocusSession {
  id: string
  startTime: Date
  endTime?: Date
  duration: number
  subject?: string
  type: 'pomodoro' | 'deep-work' | 'custom'
  completed: boolean
}

export interface StudyEvent {
  id: string
  title: string
  description?: string
  subject?: string
  startTime: Date
  endTime: Date
  type: 'study' | 'exam' | 'revision' | 'break'
  color?: string
}

export interface UserProgress {
  xp: number
  level: number
  totalFocusTime: number
  totalTasksCompleted: number
  currentStreak: number
  bestStreak: number
  weeklyGoal: number
  weeklyProgress: number
}

// Student OS Store
interface StudentOSState {
  // User
  userName: string
  setUserName: (name: string) => void
  
  // Theme
  theme: 'light' | 'dark' | 'amoled'
  setTheme: (theme: 'light' | 'dark' | 'amoled') => void
  
  // Progress
  progress: UserProgress
  addXP: (amount: number) => void
  updateProgress: (updates: Partial<UserProgress>) => void
  
  // Tasks
  tasks: Task[]
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  completeTask: (id: string) => void
  
  // Habits
  habits: Habit[]
  addHabit: (habit: Omit<Habit, 'id' | 'completedDates' | 'streak' | 'bestStreak' | 'createdAt'>) => void
  updateHabit: (id: string, updates: Partial<Habit>) => void
  deleteHabit: (id: string) => void
  toggleHabitDay: (id: string, date: string) => void
  
  // Focus Sessions
  focusSessions: FocusSession[]
  currentSession: FocusSession | null
  startFocusSession: (type: FocusSession['type'], subject?: string) => void
  endFocusSession: () => void
  addFocusSession: (session: Omit<FocusSession, 'id'>) => void
  
  // Calendar Events
  events: StudyEvent[]
  addEvent: (event: Omit<StudyEvent, 'id'>) => void
  updateEvent: (id: string, updates: Partial<StudyEvent>) => void
  deleteEvent: (id: string) => void
  
  // Sidebar state
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  
  // Active view
  activeView: 'dashboard' | 'focus' | 'planner' | 'tasks' | 'habits' | 'analytics' | 'settings'
  setActiveView: (view: StudentOSState['activeView']) => void

  // Command palette
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void
}

const calculateLevel = (xp: number) => Math.floor(xp / 1000) + 1

const calculateStreak = (completedDates: string[]): number => {
  if (completedDates.length === 0) return 0
  const sorted = [...completedDates].sort().reverse()
  let streak = 0
  const today = new Date()
  // Normalize today to start of day
  const todayStr = format(today, 'yyyy-MM-dd')

  let expected = todayStr
  for (const dateStr of sorted) {
    if (dateStr === expected) {
      streak++
      const d = new Date(expected)
      d.setDate(d.getDate() - 1)
      expected = format(d, 'yyyy-MM-dd')
    } else if (dateStr < expected) {
      // Gap found — streak broken
      break
    }
  }
  return streak
}

const calculateBestStreak = (completedDates: string[]): number => {
  if (completedDates.length === 0) return 0
  const sorted = [...completedDates].sort()
  let best = 1
  let current = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays === 1) {
      current++
      best = Math.max(best, current)
    } else {
      current = 1
    }
  }
  return best
}

export const useStore = create<StudentOSState>()(
  persist(
    (set, get) => ({
      // User
      userName: 'Student',
      setUserName: (name) => set({ userName: name }),
      
      // Theme
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme })
      },
      
      // Progress
      progress: {
        xp: 0,
        level: 1,
        totalFocusTime: 0,
        totalTasksCompleted: 0,
        currentStreak: 0,
        bestStreak: 0,
        weeklyGoal: 25 * 60, // 25 hours in minutes
        weeklyProgress: 0,
      },
      addXP: (amount) => set((state) => {
        const newXP = state.progress.xp + amount
        return {
          progress: {
            ...state.progress,
            xp: newXP,
            level: calculateLevel(newXP),
          },
        }
      }),
      updateProgress: (updates) => set((state) => ({
        progress: { ...state.progress, ...updates },
      })),
      
      // Tasks
      tasks: [
        {
          id: '1',
          title: 'Complete Physics Chapter 5',
          description: 'Review electromagnetic waves and solve practice problems',
          subject: 'Physics',
          priority: 'high',
          status: 'in-progress',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          tags: ['exam-prep', 'important'],
          createdAt: new Date(),
        },
        {
          id: '2',
          title: 'Math Assignment - Integration',
          subject: 'Mathematics',
          priority: 'medium',
          status: 'todo',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          tags: ['homework'],
          createdAt: new Date(),
        },
        {
          id: '3',
          title: 'Chemistry Lab Report',
          subject: 'Chemistry',
          priority: 'high',
          status: 'todo',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        },
      ],
      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, { ...task, id: generateId(), createdAt: new Date() }],
      })),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      })),
      completeTask: (id) => {
        set((state) => {
          const task = state.tasks.find((t) => t.id === id)
          if (!task || task.status === 'done') return state
          return {
            tasks: state.tasks.map((t) =>
              t.id === id ? { ...t, status: 'done', completedAt: new Date() } : t
            ),
            progress: {
              ...state.progress,
              totalTasksCompleted: state.progress.totalTasksCompleted + 1,
              xp: state.progress.xp + (task.priority === 'high' ? 50 : task.priority === 'medium' ? 30 : 15),
            },
          }
        })
      },
      
      // Habits
      habits: [
        {
          id: '1',
          name: 'Morning Study',
          icon: '📚',
          color: 'blue',
          frequency: 'daily',
          completedDates: [],
          streak: 0,
          bestStreak: 7,
          createdAt: new Date(),
        },
        {
          id: '2',
          name: 'Exercise',
          icon: '🏃',
          color: 'green',
          frequency: 'daily',
          completedDates: [],
          streak: 0,
          bestStreak: 14,
          createdAt: new Date(),
        },
        {
          id: '3',
          name: 'Review Notes',
          icon: '📝',
          color: 'purple',
          frequency: 'daily',
          completedDates: [],
          streak: 0,
          bestStreak: 21,
          createdAt: new Date(),
        },
      ],
      addHabit: (habit) => set((state) => ({
        habits: [...state.habits, {
          ...habit,
          id: generateId(),
          completedDates: [],
          streak: 0,
          bestStreak: 0,
          createdAt: new Date(),
        }],
      })),
      updateHabit: (id, updates) => set((state) => ({
        habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
      })),
      deleteHabit: (id) => set((state) => ({
        habits: state.habits.filter((h) => h.id !== id),
      })),
      toggleHabitDay: (id, date) => set((state) => ({
        habits: state.habits.map((h) => {
          if (h.id !== id) return h
          const dates = h.completedDates.includes(date)
            ? h.completedDates.filter((d) => d !== date)
            : [...h.completedDates, date]
          const streak = calculateStreak(dates)
          const bestStreak = Math.max(calculateBestStreak(dates), streak)
          return {
            ...h,
            completedDates: dates,
            streak,
            bestStreak,
          }
        }),
      })),
      
      // Focus Sessions
      focusSessions: [],
      currentSession: null,
      startFocusSession: (type, subject) => set({
        currentSession: {
          id: generateId(),
          startTime: new Date(),
          duration: 0,
          type,
          subject,
          completed: false,
        },
      }),
      endFocusSession: () => {
        const now = Date.now()
        set((state) => {
          if (!state.currentSession) return state
          const duration = Math.floor(
            (now - new Date(state.currentSession.startTime).getTime()) / 1000 / 60
          )
          return {
            focusSessions: [
              ...state.focusSessions,
              {
                ...state.currentSession,
                endTime: new Date(now),
                duration,
                completed: true,
              },
            ],
            currentSession: null,
            progress: {
              ...state.progress,
              totalFocusTime: state.progress.totalFocusTime + duration,
              weeklyProgress: state.progress.weeklyProgress + duration,
              xp: state.progress.xp + Math.floor(duration * 2),
            },
          }
        })
      },
      addFocusSession: (session) => set((state) => ({
        focusSessions: [...state.focusSessions, { ...session, id: generateId() }],
      })),
      
      // Calendar Events
      events: [
        {
          id: '1',
          title: 'Physics Revision',
          subject: 'Physics',
          startTime: new Date(new Date().setHours(9, 0, 0, 0)),
          endTime: new Date(new Date().setHours(11, 0, 0, 0)),
          type: 'study',
          color: 'blue',
        },
        {
          id: '2',
          title: 'Math Practice',
          subject: 'Mathematics',
          startTime: new Date(new Date().setHours(14, 0, 0, 0)),
          endTime: new Date(new Date().setHours(16, 0, 0, 0)),
          type: 'study',
          color: 'green',
        },
      ],
      addEvent: (event) => set((state) => ({
        events: [...state.events, { ...event, id: generateId() }],
      })),
      updateEvent: (id, updates) => set((state) => ({
        events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      })),
      deleteEvent: (id) => set((state) => ({
        events: state.events.filter((e) => e.id !== id),
      })),
      
      // Sidebar
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      // Active View
      activeView: 'dashboard',
      setActiveView: (view) => set({ activeView: view }),

      // Command Palette (ephemeral, not persisted)
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
    }),
     {
       name: 'student-os-storage-v2',
       version: 1,
       storage,
       partialize: (state) => ({
         userName: state.userName,
         theme: state.theme,
         progress: state.progress,
         tasks: state.tasks,
         habits: state.habits,
         focusSessions: state.focusSessions,
         events: state.events,
       }),
       migrate: (persistedState: unknown, version: number) => {
         const state = persistedState as Record<string, unknown>
         if (version === 0) {
           return reviveDates('', state)
         }
         return state
       },
     }
   )
 )
