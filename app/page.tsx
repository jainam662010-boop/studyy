'use client'

import { useEffect, lazy, Suspense, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { Sidebar, MobileNav, MobileHeader } from '@/components/navigation'
import { RootErrorBoundary, ViewErrorBoundary } from '@/components/error-boundary'
import { Loader } from '@/components/loader'
import { Footer } from '@/components/footer'
import { AppBackground } from '@/components/app-background'
import { CommandPalette } from '@/components/command-palette/command-palette'
import { ToastProvider } from '@/components/ui/toast'

const Dashboard = lazy(() => import('@/components/dashboard').then(m => ({ default: m.Dashboard })))
const FocusMode = lazy(() => import('@/components/focus-mode').then(m => ({ default: m.FocusMode })))
const TaskManagement = lazy(() => import('@/components/tasks').then(m => ({ default: m.TaskManagement })))
const HabitTracking = lazy(() => import('@/components/habits').then(m => ({ default: m.HabitTracking })))
const StudyPlanner = lazy(() => import('@/components/planner').then(m => ({ default: m.StudyPlanner })))
const Analytics = lazy(() => import('@/components/analytics').then(m => ({ default: m.Analytics })))
const Settings = lazy(() => import('@/components/settings').then(m => ({ default: m.Settings })))

type View = 'dashboard' | 'focus' | 'planner' | 'tasks' | 'habits' | 'analytics' | 'settings'

const VALID_VIEWS: readonly View[] = ['dashboard', 'focus', 'planner', 'tasks', 'habits', 'analytics', 'settings'] as const

const VIEW_TO_SECTION: Record<View, string> = {
  dashboard: 'Dashboard',
  focus: 'Focus Mode',
  planner: 'Planner',
  tasks: 'Tasks',
  habits: 'Habits',
  analytics: 'Analytics',
  settings: 'Settings',
}

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export function applyTheme(theme: string) {
  const root = document.documentElement
  root.classList.remove('light', 'dark', 'amoled')
  if (theme === 'light') return
  root.classList.add('dark')
  if (theme === 'amoled') root.classList.add('amoled')
}

function isValidView(view: unknown): view is View {
  return VALID_VIEWS.includes(view as View)
}

function getViewFromUrl(): View | null {
  const params = new URLSearchParams(window.location.search)
  const view = params.get('view')
  if (view && isValidView(view)) return view
  return null
}

export function getStoredTheme(): 'light' | 'dark' | 'amoled' | null {
  try {
    const raw = localStorage.getItem('student-os-storage-v2')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.state && (parsed.state.theme === 'light' || parsed.state.theme === 'dark' || parsed.state.theme === 'amoled')) {
        return parsed.state.theme
      }
    }
  } catch { /* noop */ }
  return null
}

export default function StudentOS() {
  const activeView = useStore((s) => s.activeView)
  const theme = useStore((s) => s.theme)
  const setActiveView = useStore((s) => s.setActiveView)
  
  const isInitialMount = useRef(true)
  const lastView = useRef<View>(activeView)
  const isNavigatingFromPopstate = useRef(false)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    function handlePopstate() {
      const view = getViewFromUrl()
      if (view) {
        isNavigatingFromPopstate.current = true
        setActiveView(view)
        lastView.current = view
      }
    }
    window.addEventListener('popstate', handlePopstate)
    return () => window.removeEventListener('popstate', handlePopstate)
  }, [setActiveView])

  useEffect(() => {
    if (isInitialMount.current) {
      const view = getViewFromUrl()
      if (view) {
        setActiveView(view)
        lastView.current = view
      }
      isInitialMount.current = false
      return
    }

    if (isNavigatingFromPopstate.current) {
      isNavigatingFromPopstate.current = false
      return
    }

    if (activeView !== lastView.current) {
      lastView.current = activeView
      const params = new URLSearchParams(window.location.search)
      params.set('view', activeView)
      const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`
      window.history.pushState(null, '', newUrl)
    }
  }, [activeView, setActiveView])

  const handleViewRender = useCallback((view: View) => {
    switch (view) {
      case 'dashboard': return <Dashboard />
      case 'focus': return <FocusMode />
      case 'tasks': return <TaskManagement />
      case 'habits': return <HabitTracking />
      case 'planner': return <StudyPlanner />
      case 'analytics': return <Analytics />
      case 'settings': return <Settings />
      default: return <Dashboard />
    }
  }, [])

  return (
     <RootErrorBoundary>
       <ToastProvider>
         <AppBackground />
         <CommandPalette />
         <div className="flex min-h-dynamic">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:px-3 focus:py-1.5 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm focus:font-medium"
          >
            Skip to main content
          </a>

          <Sidebar />

          <main id="main-content" className="flex-1 flex flex-col min-w-0" tabIndex={-1}>
            <MobileHeader />

            <div className="flex-1 overflow-auto">
               <div className="px-4 lg:px-8 py-4 lg:py-6 pb-24 lg:pb-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeView}
                      variants={pageTransition}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.15 }}
                      className="max-w-5xl mx-auto"
                    >
                      <ViewErrorBoundary sectionName={VIEW_TO_SECTION[activeView]}>
                        <Suspense fallback={<Loader />}>
                          {handleViewRender(activeView)}
                        </Suspense>
                      </ViewErrorBoundary>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              <Footer />
            </main>

          <MobileNav />
        </div>
      </ToastProvider>
    </RootErrorBoundary>
  )
}
