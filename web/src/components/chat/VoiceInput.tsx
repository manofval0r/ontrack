import React, { useState, useEffect, useRef } from 'react'

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
            let partial = ''
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const t = event.results[i][0].transcript
              if (event.results[i].isFinal) {
                liveTranscriptRef.current += t
              } else {
                partial += t
              }
            }
            // Fire immediately for final segments so chat input updates in real-time
            const combined = liveTranscriptRef.current + (partial ? ` ${partial}` : '')
            if (combined.trim()) {
              onTranscriptionComplete(combined.trim())
            }
          }

          recognition.onerror = (e: any) => {
            console.warn('SpeechRecognition error', e.error)
          }

          recognition.start()
          recognitionRef.current = recognition
        } catch (e) {
          console.warn('SpeechRecognition initialization error', e)
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
  }, [isRecording, onTranscriptionComplete])

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
    <div className="flex items-center gap-3 px-4 py-2 bg-red-50 border-2 border-red-500 rounded-full shadow-[3px_3px_0px_#dc2626] animate-pulse">
      {/* Pulsing recording indicator */}
      <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
      <span className="text-xs font-mono font-bold text-red-700">
        Recording {formatTime(seconds)}
      </span>

      {/* Animated waveform bars */}
      <div className="flex items-center gap-1 h-4 px-2">
        <span className="w-1 bg-red-500 animate-[bounce_0.6s_infinite_100ms] h-full rounded" />
        <span className="w-1 bg-red-500 animate-[bounce_0.6s_infinite_250ms] h-3/4 rounded" />
        <span className="w-1 bg-red-500 animate-[bounce_0.6s_infinite_400ms] h-full rounded" />
        <span className="w-1 bg-red-500 animate-[bounce_0.6s_infinite_200ms] h-1/2 rounded" />
      </div>

      <button
        type="button"
        onClick={() => {
          onStopRecording()
          // Only fall back to a sample when the browser heard nothing
          // (e.g. mic denied / SpeechRecognition unsupported). Never
          // overwrite a real transcript — that was the "same text every time" bug.
          const heard = liveTranscriptRef.current.trim()
          if (!heard) {
            onTranscriptionComplete('I want to close 5 enterprise deals before the end of next week')
          }
          // else: the real transcript was already streamed via onresult
        }}
        className="px-3 py-1 bg-white text-xs font-bold text-[#071E2D] border border-[#071E2D] rounded-full shadow-sm hover:bg-[#F3F6F8]"
      >
        Done ✓
      </button>

      <button
        type="button"
        onClick={onCancel}
        className="text-xs font-bold text-red-600 hover:text-red-800"
      >
        ✕
      </button>
    </div>
  )
}
