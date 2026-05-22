'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import { staggerContainer, staggerItem } from './motion'
import { Card } from './ui/glass-card'
import { formatTime } from '@/lib/utils'
import {
  Play, Pause, RotateCcw, Settings, Volume2, VolumeX,
  Maximize2, Minimize2, Flame, Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const TIMER_PRESETS = [
  { name: 'Pomodoro', work: 25, break: 5 },
  { name: 'Deep Work', work: 50, break: 10 },
  { name: 'Quick Sprint', work: 15, break: 3 },
  { name: 'Marathon', work: 90, break: 20 },
]

export function FocusMode() {
  const startFocusSession = useStore((s) => s.startFocusSession)
  const endFocusSession = useStore((s) => s.endFocusSession)
  const currentSession = useStore((s) => s.currentSession)
  const progress = useStore((s) => s.progress)
  const focusSessions = useStore((s) => s.focusSessions)
  const [selectedPreset, setSelectedPreset] = useState(TIMER_PRESETS[0])
  const [timeLeft, setTimeLeft] = useState(selectedPreset.work * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const totalTime = isBreak ? selectedPreset.break * 60 : selectedPreset.work * 60
  const progressPercent = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0

  const todayFocusTime = focusSessions
    .filter((s) => s.endTime && new Date(s.endTime).toDateString() === new Date().toDateString())
    .reduce((acc, s) => acc + s.duration, 0)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const notificationRef = useRef<AudioContext | null>(null)
  const completedRef = useRef(false)
  const isMutedRef = useRef(isMuted)
  const selectedPresetRef = useRef(selectedPreset)
  const isBreakRef = useRef(isBreak)

  useEffect(() => { isMutedRef.current = isMuted }, [isMuted])
  useEffect(() => { selectedPresetRef.current = selectedPreset }, [selectedPreset])
  useEffect(() => { isBreakRef.current = isBreak }, [isBreak])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const playNotification = useCallback(() => {
    try {
      if (isMutedRef.current) return
      if (!notificationRef.current) {
        notificationRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = notificationRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)
    } catch { /* noop */ }
  }, [])

  const handleTimerComplete = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setIsRunning(false)
    playNotification()

    if (!isBreakRef.current) {
      setCompletedPomodoros((prev) => prev + 1)
      setIsBreak(true)
      setTimeLeft(selectedPresetRef.current.break * 60)
    } else {
      setIsBreak(false)
      setTimeLeft(selectedPresetRef.current.work * 60)
    }
  }, [playNotification])

  useEffect(() => {
    if (isRunning) {
      completedRef.current = false
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimeout(() => handleTimerComplete(), 0)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, handleTimerComplete])

  const handleStart = () => {
    if (!isRunning && !currentSession) startFocusSession('pomodoro')
    setIsRunning(true)
  }

  const handlePause = () => setIsRunning(false)

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(selectedPreset.work * 60)
    setIsBreak(false)
    if (currentSession) endFocusSession()
  }

  const handlePresetChange = (preset: typeof TIMER_PRESETS[0]) => {
    setSelectedPreset(preset)
    setTimeLeft(preset.work * 60)
    setIsRunning(false)
    setIsBreak(false)
  }

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {})
      } else {
        document.exitFullscreen().catch(() => {})
      }
    } catch { /* noop */ }
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={cn(
        'min-h-[calc(100vh-10rem)] lg:min-h-[calc(100vh-2rem)] flex flex-col',
        isFullscreen && 'fixed inset-0 z-50 bg-background p-6'
      )}
    >
      <motion.div variants={staggerItem} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold tracking-tight text-foreground">Focus</h1>
          <p className="text-sm text-muted-foreground">Stay in the zone</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              'p-2 rounded-md transition-colors',
              showSettings ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'
            )}
            aria-label={showSettings ? 'Close settings' : 'Open settings'}
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hidden lg:flex"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8">
        <motion.div variants={staggerItem} className="flex-1 flex flex-col items-center justify-center">
          <div className="relative mb-10">
            <svg width="240" height="240" className="-rotate-90">
              <circle cx="120" cy="120" r="105" fill="none" stroke="currentColor" strokeWidth="4" className="text-border" />
              <circle cx="120" cy="120" r="105" fill="none" stroke="currentColor" strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={659.7}
                strokeDashoffset={659.7 - (progressPercent / 100) * 659.7}
                className={cn('transition-all duration-500', isBreak ? 'text-success' : 'text-primary')}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-mono font-semibold tracking-tight text-foreground">
                  {formatTime(timeLeft)}
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {isBreak ? 'Break' : selectedPreset.name}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleReset}
              className="p-3 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
              aria-label="Reset timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={isRunning ? handlePause : handleStart}
              className={cn(
                'w-16 h-16 rounded-xl flex items-center justify-center transition-colors',
                isRunning
                  ? 'bg-secondary hover:bg-secondary/80 text-foreground'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
              aria-label={isRunning ? 'Pause timer' : 'Start timer'}
            >
              {isRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-3 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={cn('w-2 h-2 rounded-full transition-colors', i < completedPomodoros ? 'bg-primary' : 'bg-border')}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-2">{completedPomodoros}/4 sessions</span>
          </div>
        </motion.div>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="lg:w-72 space-y-4"
            >
              <Card className="p-4">
                <h3 className="text-sm font-medium mb-3 text-foreground">Timer presets</h3>
                <div className="space-y-1.5">
                  {TIMER_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handlePresetChange(preset)}
                      className={cn(
                        'w-full flex items-center justify-between p-2.5 rounded-md transition-colors text-left',
                        selectedPreset.name === preset.name
                          ? 'bg-secondary text-foreground'
                          : 'hover:bg-secondary/50 text-muted-foreground'
                      )}
                    >
                      <div>
                        <p className="text-sm font-medium">{preset.name}</p>
                        <p className="text-xs text-muted-foreground">{preset.work}m / {preset.break}m</p>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="text-sm font-medium mb-3 text-foreground">Today&apos;s focus</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-md bg-secondary">
                    <Clock className="w-4 h-4 text-primary mb-1" />
                    <p className="text-lg font-semibold text-foreground">
                      {Math.floor(todayFocusTime / 60)}h {todayFocusTime % 60}m
                    </p>
                    <p className="text-xs text-muted-foreground">Total focus</p>
                  </div>
                  <div className="p-3 rounded-md bg-secondary">
                    <Flame className="w-4 h-4 text-chart-5 mb-1" />
                    <p className="text-lg font-semibold text-foreground">{progress.currentStreak}</p>
                    <p className="text-xs text-muted-foreground">Day streak</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
