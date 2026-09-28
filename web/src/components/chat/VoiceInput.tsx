import React, { useState, useEffect, useRef } from 'react'
import { Check, X, AlertCircle } from 'lucide-react'

interface VoiceInputProps {
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  onTranscriptionLive?: (interim: string) => void
  onTranscriptionComplete: (text: string) => void
  onCancel: () => void
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  onTranscriptionLive,
  onTranscriptionComplete,
  onCancel,
}) => {
  const [seconds, setSeconds] = useState(0)
  const [micError, setMicError] = useState<string | null>(null)
  const timerRef = useRef<any>(null)
  const recognitionRef = useRef<any>(null)
  const isRecordingRef = useRef<boolean>(false)
  const liveTranscriptRef = useRef<string>('')

  isRecordingRef.current = isRecording

  useEffect(() => {
    if (isRecording) {
      setSeconds(0)
      setMicError(null)
      liveTranscriptRef.current = ''

      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1)
      }, 1000)

      // Try browser Web Speech Recognition
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition()
          recognition.continuous = true
          recognition.interimResults = true
          recognition.lang = 'en-US'

          recognition.onresult = (event: any) => {
            let finalAccumulator = ''
            let interimAccumulator = ''

            for (let i = 0; i < event.results.length; ++i) {
              const res = event.results[i]
              const transcriptPiece = res[0]?.transcript || ''
              if (res.isFinal) {
                finalAccumulator += (finalAccumulator ? ' ' : '') + transcriptPiece.trim()
              } else {
                interimAccumulator += (interimAccumulator ? ' ' : '') + transcriptPiece.trim()
              }
            }

            const fullText = (finalAccumulator + (interimAccumulator ? ' ' + interimAccumulator : '')).trim()
            liveTranscriptRef.current = fullText

            if (onTranscriptionLive && fullText) {
              onTranscriptionLive(fullText)
            }
          }

          recognition.onerror = (e: any) => {
            console.warn('SpeechRecognition error:', e.error)
            if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
              setMicError('Mic permission denied. Please allow microphone in browser.')
            } else if (e.error === 'network') {
              setMicError('Speech service network issue.')
            }
          }

          recognition.onend = () => {
            // Browsers automatically stop recognition on short silence.
            // If the user hasn't explicitly stopped recording, smoothly restart it.
            if (isRecordingRef.current) {
              try {
                recognition.start()
              } catch {
                // If restarting is blocked, ignore
              }
            }
          }

          recognition.start()
          recognitionRef.current = recognition
        } catch (e) {
          console.warn('SpeechRecognition initialization error', e)
          setMicError('Voice recognition unavailable on this browser.')
        }
      } else {
        setMicError('Voice recognition not supported in this browser. Please type your goal.')
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {}
        recognitionRef.current = null
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {}
        recognitionRef.current = null
      }
    }
  }, [isRecording, onTranscriptionLive])

  if (!isRecording) {
    return (
      <button
        type="button"
        onClick={onStartRecording}
        title="Speak your goal using voice microphone"
        aria-label="Activate voice recording"
        className="w-11 h-11 rounded-full border-2 border-[#071E2D] dark:border-[#1E3A52] bg-[#ECFEFF] dark:bg-[#00C4B3]/15 text-[#006D6A] dark:text-[#00C4B3] flex items-center justify-center shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#99F6E4] dark:hover:bg-[#00C4B3]/25 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all flex-shrink-0 cursor-pointer"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </button>
    )
  }

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60)
    const s = sec % 60
    return `${mins}:${s < 10 ? '0' : ''}${s}`
  }

  const handleFinish = () => {
    onStopRecording()
    const captured = liveTranscriptRef.current.trim()
    if (captured) {
      onTranscriptionComplete(captured)
    }
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3 px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 border-2 border-red-500 dark:border-rose-500 rounded-full shadow-[3px_3px_0px_#dc2626] dark:shadow-[3px_3px_0px_#000000] transition-colors">
      {/* Pulsing recording indicator */}
      <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
      <span className="text-xs font-mono font-bold text-red-700 dark:text-rose-300">
        {formatTime(seconds)}
      </span>

      {/* Animated waveform bars */}
      <div className="flex items-center gap-1 h-3.5 px-1">
        <span className="w-1 bg-red-500 dark:bg-rose-400 animate-[bounce_0.6s_infinite_100ms] h-full rounded" />
        <span className="w-1 bg-red-500 dark:bg-rose-400 animate-[bounce_0.6s_infinite_250ms] h-3/4 rounded" />
        <span className="w-1 bg-red-500 dark:bg-rose-400 animate-[bounce_0.6s_infinite_400ms] h-full rounded" />
        <span className="w-1 bg-red-500 dark:bg-rose-400 animate-[bounce_0.6s_infinite_200ms] h-1/2 rounded" />
      </div>

      {micError && (
        <span className="text-[11px] font-medium text-red-600 dark:text-rose-300 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          <span className="hidden md:inline">{micError}</span>
        </span>
      )}

      <button
        type="button"
        onClick={handleFinish}
        className="px-3 py-1 bg-white dark:bg-[#0E202D] text-xs font-bold text-[#071E2D] dark:text-white border border-[#071E2D] dark:border-[#1E3A52] rounded-full shadow-sm hover:bg-[#F3F6F8] dark:hover:bg-white/10 inline-flex items-center gap-1 cursor-pointer transition-colors"
      >
        <span>Done</span>
        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
      </button>

      <button
        type="button"
        onClick={onCancel}
        className="text-xs font-bold text-red-600 dark:text-rose-400 hover:text-red-800 dark:hover:text-rose-200 p-1 flex items-center justify-center cursor-pointer"
        aria-label="Cancel recording"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
