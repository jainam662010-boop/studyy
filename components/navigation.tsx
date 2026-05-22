'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import {
  LayoutDashboard,
  Timer,
  Calendar,
  CheckSquare,
  Target,
  BarChart3,
  Settings,
  Sparkles,
  Menu,
  ChevronLeft,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'focus', label: 'Focus', icon: Timer },
  { id: 'planner', label: 'Planner', icon: Calendar },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'habits', label: 'Habits', icon: Target },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const

type SidebarContentProps = {
  isMobile: boolean
}

function SidebarContent({ isMobile }: SidebarContentProps) {
  const activeView = useStore((s) => s.activeView)
  const setActiveView = useStore((s) => s.setActiveView)
  const sidebarOpen = useStore((s) => s.sidebarOpen)
  const setSidebarOpen = useStore((s) => s.setSidebarOpen)
  const progress = useStore((s) => s.progress)
  const userName = useStore((s) => s.userName)

  return (
    <div className="flex flex-col h-full">
      <div className="absolute inset-0 bg-sidebar lg:bg-black/30" />
      <div className="relative z-10 flex flex-col h-full">
        <div className={cn('flex items-center h-12 shrink-0', sidebarOpen ? 'px-4' : 'px-3')}>
          <div className={cn('flex items-center gap-2.5 overflow-hidden', !sidebarOpen && 'justify-center w-full')}>
            <div className="w-7 h-7 shrink-0 rounded-md bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            {sidebarOpen && (
              <span className="text-sm font-semibold text-sidebar-foreground whitespace-nowrap">
                Student OS
              </span>
            )}
          </div>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto no-scrollbar" aria-label="Main menu">
          <ul className={cn('space-y-0.5', sidebarOpen ? 'px-2' : 'px-1.5')} role="list">
            {navItems.map((item) => {
              const isActive = activeView === item.id
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveView(item.id as typeof activeView)
                      if (isMobile) setSidebarOpen(false)
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    title={!sidebarOpen ? item.label : undefined}
                    className={cn(
                      'w-full flex items-center gap-2.5 rounded-md text-sm transition-colors',
                      sidebarOpen ? 'px-2.5 py-2' : 'justify-center p-2',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                        : 'text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    {sidebarOpen && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-sidebar-border">
          <div className={cn('px-2 py-2', !sidebarOpen && 'flex justify-center')}>
            {sidebarOpen ? (
              <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md">
                <div className="relative w-7 h-7 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 28 28">
                    <circle cx="14" cy="14" r="11" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-sidebar-border" />
                    <circle cx="14" cy="14" r="11" fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeDasharray={69.1}
                      strokeDashoffset={69.1 - ((progress.xp % 1000) / 1000) * 69.1}
                      className="text-primary" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-primary">{progress.level}</span>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate leading-tight">{userName}</p>
                  <p className="text-[11px] text-sidebar-foreground/40">{progress.xp.toLocaleString()} XP</p>
                </div>
              </div>
            ) : (
              <div className="relative w-7 h-7">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 28 28">
                  <circle cx="14" cy="14" r="11" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-sidebar-border" />
                  <circle cx="14" cy="14" r="11" fill="none" stroke="currentColor" strokeWidth="2.5"
                    strokeDasharray={69.1}
                    strokeDashoffset={69.1 - ((progress.xp % 1000) / 1000) * 69.1}
                    className="text-primary" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-primary">{progress.level}</span>
                </div>
              </div>
            )}
          </div>

          <div className={cn('pb-2', sidebarOpen ? 'px-2' : 'flex justify-center')}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={cn(
                'flex items-center justify-center rounded-md text-sidebar-foreground/30 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors',
                sidebarOpen ? 'w-full gap-1.5 px-2 py-1.5 text-xs' : 'p-1.5'
              )}
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <ChevronLeft className={cn('w-3.5 h-3.5 transition-transform duration-200', !sidebarOpen && 'rotate-180')} aria-hidden="true" />
              {sidebarOpen && <span>Collapse</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  const sidebarOpen = useStore((s) => s.sidebarOpen)
  const setSidebarOpen = useStore((s) => s.setSidebarOpen)

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              aria-hidden="true"
            />
            
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 max-w-[80vw] border-r border-sidebar-border lg:hidden"
              aria-label="Main navigation"
            >
              <SidebarContent isMobile={true} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'hidden lg:flex lg:flex-col lg:relative lg:border-r lg:border-sidebar-border lg:backdrop-blur-xl',
          'transition-[width] duration-200 ease-out',
          sidebarOpen ? 'lg:w-60' : 'lg:w-14'
        )}
        aria-label="Main navigation"
      >
        <SidebarContent isMobile={false} />
      </aside>
    </>
  )
}

export function MobileNav() {
  const activeView = useStore((s) => s.activeView)
  const setActiveView = useStore((s) => s.setActiveView)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden safe-bottom" aria-label="Mobile navigation">
      <div className="bg-card/80 backdrop-blur-md border-t border-border">
        <div className="flex overflow-x-auto no-scrollbar gap-0.5" role="list" style={{ overscrollBehavior: 'contain' }}>
          {navItems.map((item) => {
            const isActive = activeView === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as typeof activeView)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-2 px-2 flex-1 min-w-0 transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span className="text-[9px] font-medium whitespace-nowrap">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export function MobileHeader() {
  const setSidebarOpen = useStore((s) => s.setSidebarOpen)
  const progress = useStore((s) => s.progress)
  const activeView = useStore((s) => s.activeView)
  const currentPage = navItems.find((item) => item.id === activeView)

  return (
    <header className="sticky top-0 z-30 lg:hidden safe-top bg-card/80 backdrop-blur-md border-b border-border" role="banner">
      <div className="flex items-center justify-between px-4 h-12">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 -ml-1.5 rounded-md hover:bg-secondary transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-4 h-4" aria-hidden="true" />
          </button>
          <h1 className="text-sm font-medium">{currentPage?.label || 'Dashboard'}</h1>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary text-xs text-muted-foreground">
          <Zap className="w-3 h-3 text-primary" aria-hidden="true" />
          <span>{progress.xp.toLocaleString()}</span>
        </div>
      </div>
    </header>
  )
}
