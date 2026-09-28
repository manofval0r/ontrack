import React, { useState, useEffect, useRef } from 'react'
import { Check, X, AlertCircle } from 'lucide-react'

interface VoiceInputProps {
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  /** Live interim transcript for the input preview (best-effort). */
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const timerRef = useRef<any>(null)
  const recognitionRef = useRef<any>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  // Accumulates the real speech-recognized text so the Done button can send it
  const liveTranscriptRef = useRef<string>('')
  // Parent passes a new closure every render — ref it so recognition isn't restarted.
  const completeRef = useRef(onTranscriptionComplete)
  completeRef.current = onTranscriptionComplete

  const stopAllAudio = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null
        recognitionRef.current.onerror = null
        recognitionRef.current.onend = null
        recognitionRef.current.stop()
      } catch { /* already stopped */ }
      recognitionRef.current = null
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop())
      mediaStreamRef.current = null
    }
  }

  const handleStart = async () => {
    setErrorMessage(null)
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setErrorMessage(
        'Speech recognition is not supported in this browser. Please use Chrome or Edge, or type your message.'
      )
      return
    }

    // Explicitly prompt / verify microphone permission
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaStreamRef.current = stream
      } catch (err: any) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setErrorMessage(
            'Microphone access was denied. Please allow microphone access in your browser address bar.'
          )
        } else {
          setErrorMessage('Could not access microphone. Please check your audio settings.')
        }
        return
      }
    }

    onStartRecording()
  }

  useEffect(() => {
    if (isRecording) {
      setSeconds(0)
      setErrorMessage(null)
      liveTranscriptRef.current = ''
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1)
      }, 1000)

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
              const text = event.results[i][0].transcript
              if (event.results[i].isFinal) {
                liveTranscriptRef.current += (liveTranscriptRef.current ? ' ' : '') + text.trim()
              } else {
                partial += text
              }
            }
            try {
              const combined = (liveTranscriptRef.current + ' ' + partial).trim()
              onTranscriptionLive?.(combined)
            } catch { /* preview is best-effort */ }
          }

          recognition.onerror = (event: any) => {
            const errType = event?.error
            if (errType === 'not-allowed') {
              setErrorMessage('Microphone blocked. Please grant microphone permission.')
              onStopRecording()
            } else if (errType === 'network') {
              setErrorMessage('Speech service network issue. Check your connection.')
              onStopRecording()
            } else if (errType === 'audio-capture') {
              setErrorMessage('No microphone detected. Please plug in an audio input.')
              onStopRecording()
            }
          }

          recognition.onend = () => {
            // Keep-alive if still recording and not manually aborted
            if (recognitionRef.current && isRecording) {
              try {
                recognition.start()
              } catch { /* already running */ }
            }
          }

          recognition.start()
          recognitionRef.current = recognition
        } catch (err: any) {
          setErrorMessage('Unable to start speech recognition in this browser.')
          onStopRecording()
        }
      }
    } else {
      stopAllAudio()
    }

    return () => {
      stopAllAudio()
    }
  }, [isRecording])

  const handleDone = () => {
    const heard = liveTranscriptRef.current.trim()
    onStopRecording()
    stopAllAudio()
    if (heard) {
      completeRef.current(heard)
    } else {
      setErrorMessage('No speech was detected. Please try speaking again or type your message.')
    }
  }

  const handleCancelClick = () => {
    stopAllAudio()
    onCancel()
    setErrorMessage(null)
  }

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60)
    const s = sec % 60
    return `${mins}:${s < 10 ? '0' : ''}${s}`
  }

  if (!isRecording) {
    return (
      <div className="relative flex items-center">
        <button
          type="button"
          onClick={handleStart}
          title="Speak using voice microphone"
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

        {errorMessage && (
          <div className="absolute left-0 bottom-full mb-2 z-50 w-72 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/90 border-2 border-amber-500 text-xs text-amber-900 dark:text-amber-200 shadow-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <span className="flex-1">{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-amber-700 dark:text-amber-300 font-bold hover:text-amber-900"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-[#F8FAFB] dark:bg-[#091824] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-full shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000]">
      {/* Pulsing recording indicator */}
      <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" aria-hidden="true" />
      <span className="text-xs font-mono font-bold text-[#071E2D] dark:text-white" role="timer">
        Listening {formatTime(seconds)}
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
        onClick={handleDone}
        className="px-3 py-1 bg-white dark:bg-[#0E202D] text-xs font-bold text-[#071E2D] dark:text-white border border-[#071E2D] dark:border-[#1E3A52] rounded-full shadow-sm hover:bg-[#F3F6F8] dark:hover:bg-[#152E42] inline-flex items-center gap-1 cursor-pointer"
      >
        <span>Done</span>
        <Check className="w-3.5 h-3.5 stroke-[2.5] text-emerald-600 dark:text-emerald-400" />
      </button>

      <button
        type="button"
        onClick={handleCancelClick}
        aria-label="Cancel voice recording"
        className="text-xs font-bold text-red-700 dark:text-red-400 hover:text-red-800 min-h-[44px] px-2 flex items-center justify-center cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
