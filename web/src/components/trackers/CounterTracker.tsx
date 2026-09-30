import React, { useState, useRef, useEffect } from 'react'
import { Trophy, Check, Mic, MicOff, AlertCircle } from 'lucide-react'
import type { Goal } from '../../types'
import { Button } from '../Button'

interface CounterTrackerProps {
  goal: Goal
  onUpdate: (delta: number, note?: string) => Promise<void>
  onOpenEdit?: () => void
}

export const CounterTracker: React.FC<CounterTrackerProps> = ({ goal, onUpdate, onOpenEdit }) => {
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isListeningNote, setIsListeningNote] = useState(false)
  const [noteError, setNoteError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)
  const isListeningRef = useRef<boolean>(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const hasValidTarget = typeof goal.target === 'number' && goal.target > 0
  const validTarget = hasValidTarget ? goal.target : 1
  const percent = hasValidTarget
    ? Math.min(100, Math.round(((goal.current_value || 0) / validTarget) * 100))
    : 0
  const isCompleted = (hasValidTarget && (goal.current_value || 0) >= validTarget) || goal.status === 'completed'

  const stopNoteDictation = () => {
    isListeningRef.current = false
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null
        recognitionRef.current.onerror = null
        recognitionRef.current.onend = null
        recognitionRef.current.stop()
      } catch {
        /* already stopped */
      }
      recognitionRef.current = null
    }
    setIsListeningNote(false)
  }

  const toggleNoteDictation = async () => {
    setNoteError(null)
    if (isListeningNote) {
      stopNoteDictation()
      return
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setNoteError('Speech recognition is not supported in this browser. Please use Chrome or Edge, or type your note.')
      setTimeout(() => setNoteError(null), 5000)
      return
    }

    // Verify microphone permission and immediately release stream so hardware isn't locked
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((track) => track.stop())
      } catch (err: any) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setNoteError('Microphone permission blocked. Please allow microphone in browser address bar.')
        } else {
          setNoteError('Could not access microphone hardware. Please check your system audio settings.')
        }
        return
      }
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event: any) => {
        let transcript = ''
        for (let i = 0; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript + ' '
        }
        setNote(transcript.trim())
        setNoteError(null)
      }

      recognition.onerror = (event: any) => {
        const err = event?.error
        if (err === 'not-allowed' || err === 'service-not-allowed') {
          setNoteError('Microphone permission blocked. Please allow microphone in browser address bar.')
          stopNoteDictation()
        } else if (err === 'no-speech') {
          // Non-fatal — keep listening so user can speak when ready
          setNoteError('Listening... Speak into your microphone.')
        } else if (err === 'audio-capture') {
          setNoteError('No microphone detected. Please check your laptop audio input.')
          stopNoteDictation()
        } else if (err === 'network') {
          setNoteError('Speech service network issue.')
          stopNoteDictation()
        }
      }

      recognition.onend = () => {
        // Keep alive if user hasn't explicitly stopped dictating
        if (isListeningRef.current && recognitionRef.current) {
          try {
            recognition.start()
          } catch {
            setIsListeningNote(false)
            isListeningRef.current = false
          }
        } else {
          setIsListeningNote(false)
        }
      }

      recognition.start()
      recognitionRef.current = recognition
      isListeningRef.current = true
      setIsListeningNote(true)
    } catch (err: any) {
      setNoteError('Could not start microphone speech recognition.')
      stopNoteDictation()
    }
  }

  useEffect(() => {
    return () => {
      stopNoteDictation()
    }
  }, [])

  const handleIncrement = async (delta: number) => {
    setSubmitting(true)
    try {
      await onUpdate(delta, delta > 0 ? `+${delta} logged` : `${delta} logged`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCustomLog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!note.trim()) {
      inputRef.current?.focus()
      setNoteError('Please type or speak a note to save.')
      setTimeout(() => setNoteError(null), 3000)
      return
    }
    stopNoteDictation()
    setSubmitting(true)
    try {
      // Delta is 0 for note-only log so progress counter does not inflate
      await onUpdate(0, note.trim())
      setNote('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] transition-colors">
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-[#071E2D]/10 dark:border-white/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#006D6A] dark:text-[#00C4B3]">AI-Determined Format</span>
          <h3 className="text-xl sm:text-2xl font-bold text-[#071E2D] dark:text-white" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Counter Tracker
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#071E2D]/60 dark:text-slate-400">Target:</span>
          {onOpenEdit ? (
            <button
              type="button"
              onClick={onOpenEdit}
              className={`px-3 py-1 rounded-full border-2 text-xs font-bold transition-all flex items-center gap-1.5 shadow-[1px_1px_0px_#071E2D] cursor-pointer hover:-translate-y-0.5 ${
                hasValidTarget
                  ? 'bg-[#ECFEFF] dark:bg-[#00C4B3]/15 border-[#071E2D] dark:border-[#1E3A52] text-[#006D6A] dark:text-[#00C4B3]'
                  : 'bg-amber-100 dark:bg-amber-950/60 border-amber-500 text-amber-800 dark:text-amber-300'
              }`}
              title="Click to edit target & tracker plan"
            >
              <span>{hasValidTarget ? `${goal.target} ${goal.unit || 'units'}` : 'Target: 0 (Set Target)'}</span>
              <span className="text-[11px] opacity-75">✎</span>
            </button>
          ) : (
            <span
              className={`px-3 py-1 rounded-full border-2 text-xs font-bold ${
                hasValidTarget
                  ? 'bg-[#ECFEFF] dark:bg-[#00C4B3]/15 border-[#071E2D] dark:border-[#1E3A52] text-[#006D6A] dark:text-[#00C4B3]'
                  : 'bg-amber-100 dark:bg-amber-950/60 border-amber-500 text-amber-800 dark:text-amber-300'
              }`}
            >
              {hasValidTarget ? `${goal.target} ${goal.unit || 'units'}` : '0 units'}
            </span>
          )}
        </div>
      </div>

      {/* Main Counter Display */}
      <div className="flex flex-col items-center justify-center py-6 px-4 bg-[#F8FAFB] dark:bg-[#091824] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] text-center transition-colors">
        <span className="text-xs font-bold uppercase tracking-widest text-[#071E2D]/50 dark:text-slate-400 mb-1">Current Progress</span>
        <div className="flex items-baseline gap-2 mb-2">
          <span
            className="text-6xl sm:text-7xl font-extrabold text-[#071E2D] dark:text-white tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            {goal.current_value || 0}
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-[#071E2D]/40 dark:text-slate-500">
            / {hasValidTarget ? goal.target : '0'}
          </span>
        </div>

        {!hasValidTarget ? (
          <div className="flex flex-col items-center gap-1.5 mb-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 px-3 py-1 rounded-full">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Target not set yet ({goal.unit || '0 units'})</span>
            </span>
            {onOpenEdit && (
              <button
                type="button"
                onClick={onOpenEdit}
                className="text-xs font-bold text-[#006D6A] dark:text-[#00C4B3] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Edit goal plan & set target</span>
                <span>→</span>
              </button>
            )}
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#006D6A] dark:text-[#00C4B3] mb-6">
            <span>{percent}% of target accomplished</span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold ml-1">
                <Trophy className="w-4 h-4" />
                <span>Goal Reached!</span>
              </span>
            )}
          </span>
        )}

        {/* Tactile Increment Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={submitting || goal.current_value <= 0}
            onClick={() => handleIncrement(-1)}
            aria-label="Decrement counter by 1"
            className="w-12 h-12 rounded-2xl border-2 border-[#071E2D] dark:border-[#1E3A52] bg-white dark:bg-[#0E202D] font-bold text-xl text-[#071E2D] dark:text-white shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000] hover:bg-[#F3F6F8] dark:hover:bg-[#152E42] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#071E2D] dark:active:shadow-[1px_1px_0px_#000000] disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer"
          >
            -1
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleIncrement(1)}
            aria-label="Increment counter by 1"
            className="px-6 h-12 rounded-2xl border-2 border-[#071E2D] dark:border-[#00C4B3] bg-[#00C4B3] font-bold text-lg text-[#071E2D] shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] hover:bg-[#33D6C5] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#071E2D] dark:active:shadow-[1px_1px_0px_#000000] disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>+1 Log Completion</span>
            <span className="w-6 h-6 rounded-full bg-white dark:bg-[#071E2D] text-[#071E2D] dark:text-[#00C4B3] flex items-center justify-center text-xs">
              <Check className="w-3.5 h-3.5" />
            </span>
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleIncrement(5)}
            aria-label="Increment counter by 5"
            className="hidden sm:flex px-4 h-12 rounded-2xl border-2 border-[#071E2D] dark:border-[#1E3A52] bg-white dark:bg-[#0E202D] font-bold text-sm text-[#071E2D] dark:text-white shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000] hover:bg-[#F3F6F8] dark:hover:bg-[#152E42] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#071E2D] dark:active:shadow-[1px_1px_0px_#000000] disabled:opacity-40 transition-all items-center justify-center cursor-pointer"
          >
            +5
          </button>
        </div>
      </div>

      {/* Progress Bar with tactile border */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs font-bold text-[#071E2D] dark:text-white">
          <span>Velocity Meter</span>
          <span>{percent}% Completed</span>
        </div>
        <div className="w-full h-4 rounded-full bg-[#E5E7EB] dark:bg-[#091824] border-2 border-[#071E2D] dark:border-[#1E3A52] overflow-hidden p-0.5 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#00C4B3] to-[#006D6A] transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Note Logging with Voice Dictation */}
      <form onSubmit={handleCustomLog} className="flex flex-col gap-2 pt-3 border-t-2 border-[#071E2D]/10 dark:border-white/10">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch">
          <div className="relative flex-1 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isListeningNote ? 'Listening... Speak your note now' : "Attach a context note (e.g. 'Signed Apex agreement, $18k ARR')..."}
              className={`w-full px-4 py-2.5 pr-20 rounded-xl border-2 ${
                isListeningNote
                  ? 'border-red-500 ring-2 ring-red-400/30 bg-red-50/20 dark:bg-red-950/20'
                  : 'border-[#071E2D]/20 dark:border-[#1E3A52] bg-white dark:bg-[#091824]'
              } focus:border-[#00C4B3] dark:focus:border-[#00C4B3] text-sm text-[#071E2D] dark:text-white placeholder:text-[#071E2D]/40 dark:placeholder:text-slate-500 outline-none transition-colors`}
            />

            {/* Listening Indicator / Waveform inside input */}
            {isListeningNote && (
              <div className="absolute right-10 flex items-center gap-0.5 h-4 px-1" aria-hidden="true">
                <span className="w-1 bg-red-500 animate-[bounce_0.6s_infinite_100ms] h-full rounded" />
                <span className="w-1 bg-red-500 animate-[bounce_0.6s_infinite_250ms] h-3/4 rounded" />
                <span className="w-1 bg-red-500 animate-[bounce_0.6s_infinite_400ms] h-full rounded" />
              </div>
            )}

            {/* Voice Dictation Button */}
            <button
              type="button"
              onClick={toggleNoteDictation}
              title={isListeningNote ? 'Stop microphone dictation' : 'Dictate note with microphone'}
              aria-label={isListeningNote ? 'Stop microphone dictation' : 'Dictate note with microphone'}
              className={`absolute right-2 p-1.5 rounded-lg transition-all cursor-pointer ${
                isListeningNote
                  ? 'bg-red-500 text-white animate-pulse shadow-sm'
                  : 'text-[#071E2D]/60 dark:text-slate-400 hover:text-[#006D6A] dark:hover:text-[#00C4B3] hover:bg-[#F3F6F8] dark:hover:bg-[#152E42]'
              }`}
            >
              {isListeningNote ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <Button
            type="submit"
            variant="secondary"
            noBubble
            disabled={submitting}
            className="text-xs py-2 px-5 cursor-pointer whitespace-nowrap"
          >
            {submitting ? 'Saving...' : 'Save Note'}
          </Button>
        </div>

        {noteError && (
          <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1.5 animate-fadeIn">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {noteError}
          </p>
        )}
      </form>
    </div>
  )
}
