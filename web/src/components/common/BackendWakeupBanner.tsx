import React, { useEffect, useState, useRef } from 'react'
import { Sparkles, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { api } from '../../services/api'

export const BackendWakeupBanner: React.FC = () => {
  const [isWarmingUp, setIsWarmingUp] = useState(false)
  const [isAwake, setIsAwake] = useState(false)
  const [hasFailed, setHasFailed] = useState(false)
  const [justConnected, setJustConnected] = useState(false)
  const intervalRef = useRef<any>(null)

  const pingBackend = async (isInitial = false) => {
    let timer: any = null
    if (isInitial) {
      // If it takes more than 2s on first load, it's a Render cold start
      timer = setTimeout(() => {
        setIsWarmingUp(true)
      }, 2000)
    }

    try {
      await api.health()
      clearTimeout(timer)
      setIsWarmingUp(false)
      setIsAwake(true)
      setHasFailed(false)
      if (isInitial) {
        setJustConnected(true)
        setTimeout(() => setJustConnected(false), 4000)
      }
    } catch (err) {
      clearTimeout(timer)
      console.warn('[BackendWakeup] Health ping failed:', err)
      setHasFailed(true)
    }
  }

  useEffect(() => {
    // 1. Immediate ping on mount
    pingBackend(true)

    // 2. Repeat ping every 5 minutes to prevent Render free-tier idle spin-down
    intervalRef.current = setInterval(() => {
      pingBackend(false)
    }, 5 * 60 * 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  if (justConnected) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="w-full bg-[#E6FFFA] dark:bg-[#042828] border-b-2 border-[#00C4B3] px-4 py-2 flex items-center justify-center gap-2 text-xs font-bold text-[#006D6A] dark:text-[#00C4B3] transition-all animate-in fade-in"
      >
        <CheckCircle2 className="w-4 h-4 text-[#00C4B3]" />
        <span>OnTrack AI Engine is active and connected</span>
      </div>
    )
  }

  if (isWarmingUp) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="w-full bg-[#FEF3C7] dark:bg-[#281E05] border-b-2 border-[#F59E0B] px-4 py-2.5 flex items-center justify-between gap-3 text-xs font-semibold text-[#92400E] dark:text-[#FCD34D] transition-all animate-in slide-in-from-top-2"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <RefreshCw className="w-4 h-4 animate-spin text-[#F59E0B] shrink-0" />
          <span className="truncate">
            <strong>Waking things up…</strong> The AI backend on Render is warming up from cold-start. Trackers and chat will be ready in a few moments.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
            <Sparkles className="w-3 h-3" />
            <span>Render Free Tier</span>
          </span>
        </div>
      </div>
    )
  }

  if (hasFailed && !isAwake) {
    return (
      <div
        role="alert"
        className="w-full bg-rose-50 dark:bg-rose-950/60 border-b-2 border-rose-500 px-4 py-2 flex items-center justify-between gap-2 text-xs font-semibold text-rose-800 dark:text-rose-200 transition-all"
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>Backend is currently slow to respond. Working in offline/local cache mode.</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setHasFailed(false)
            setIsWarmingUp(true)
            pingBackend(true)
          }}
          className="px-2.5 py-1 rounded-md bg-rose-600 text-white font-bold hover:bg-rose-700 text-[11px] cursor-pointer"
        >
          Retry Ping
        </button>
      </div>
    )
  }

  return null
}
