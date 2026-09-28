import React, { useState, useEffect, useRef } from 'react'
import { Check, X } from 'lucide-react'

interface VoiceInputProps {
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  onTranscriptionComplete: (text: string) => void
  onCancel: () => void
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  onTranscriptionComplete,
  onCancel,
}) => {
  const [seconds, setSeconds] = useState(0)
  const timerRef = useRef<any>(null)
  const recognitionRef = useRef<any>(null)
  // Accumulates the real speech-recognized text so the Done button can send it
  const liveTranscriptRef = useRef<string>('')
  // Parent passes a new closure every render — ref it so recognition isn't restarted.
  const completeRef = useRef(onTranscriptionComplete)
  completeRef.current = onTranscriptionComplete

  useEffect(() => {
    if (isRecording) {
      setSeconds(0)
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
            // Accumulate finals silently; emit ONCE on Done. Streaming every
            // interim/final here duplicates text because the parent appends.
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                liveTranscriptRef.current += event.results[i][0].transcript
              }
            }
          }

          recognition.onerror = () => {
            // Speech errors are silent; Done simply completes with what's heard.
          }

          recognition.start()
          recognitionRef.current = recognition
        } catch {
          // Recognition unavailable — Done completes with what's heard (maybe nothing).
        }
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch {}
        recognitionRef.current = null
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch {}
        recognitionRef.current = null
      }
    }
  }, [isRecording])

  if (!isRecording) {
    return (
      <button
        type="button"
        onClick={onStartRecording}
        title="Speak your goal using voice microphone"
        aria-label="Activate voice recording"
        className="w-11 h-11 rounded-full border-2 border-[#071E2D] dark:border-[#1E3A52] bg-[#ECFEFF] dark:bg-[#00C4B3]/15 text-[#006D6A] dark:text-[#00C4B3] flex items-center justify-center shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#99F6E4] dark:hover:bg-[#00C4B3]/25 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all flex-shrink-0 cursor-pointer"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-[#F8FAFB] dark:bg-[#091824] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-full shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000] animate-pulse">
      {/* Pulsing recording indicator */}
      <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" aria-hidden="true" />
      <span className="text-xs font-mono font-bold text-[#071E2D] dark:text-white" role="timer">
        Recording {formatTime(seconds)}
      </span>

      {/* Animated waveform bars */}
      <div className="flex items-center gap-1 h-4 px-2" aria-hidden="true">
        <span className="w-1 bg-[#00C4B3] animate-[bounce_0.6s_infinite_100ms] h-full rounded" />
        <span className="w-1 bg-[#00C4B3] animate-[bounce_0.6s_infinite_250ms] h-3/4 rounded" />
        <span className="w-1 bg-[#00C4B3] animate-[bounce_0.6s_infinite_400ms] h-full rounded" />
        <span className="w-1 bg-[#00C4B3] animate-[bounce_0.6s_infinite_200ms] h-1/2 rounded" />
      </div>

      <button
        type="button"
        onClick={() => {
          onStopRecording()
          // Only complete when the browser actually heard something.
          // Emitting a fake sample transcript was the "same text every time" bug;
          // silence now simply ends recording with no fake input.
          const heard = liveTranscriptRef.current.trim()
          if (heard) {
            completeRef.current(heard)
          }
        }}
        className="px-3 py-1 bg-white text-xs font-bold text-[#071E2D] border border-[#071E2D] rounded-full shadow-sm hover:bg-[#F3F6F8] inline-flex items-center gap-1"
      >
        <span>Done</span>
        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
      </button>

      <button
        type="button"
        onClick={onCancel}
        aria-label="Cancel voice recording"
        className="text-xs font-bold text-red-700 dark:text-red-400 hover:text-red-800 min-h-[44px] px-2 flex items-center justify-center"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
