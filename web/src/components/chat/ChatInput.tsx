import React, { useState } from 'react'
import { VoiceInput } from './VoiceInput'

interface ChatInputProps {
  onSendMessage: (content: string) => void
  disabled?: boolean
  placeholder?: string
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Describe your goal or update your progress (text or voice)...',
}) => {
  const [text, setText] = useState('')
  const [isRecording, setIsRecording] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || disabled) return
    onSendMessage(text.trim())
    setText('')
  }

  const handleTranscription = (transcript: string) => {
    setText((prev) => (prev ? `${prev} ${transcript}` : transcript))
    setIsRecording(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 sm:p-4 bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] flex items-center gap-2 sm:gap-3 transition-colors"
    >
      {/* Voice Recorder button / wave container */}
      <VoiceInput
        isRecording={isRecording}
        onStartRecording={() => setIsRecording(true)}
        onStopRecording={() => setIsRecording(false)}
        onTranscriptionComplete={handleTranscription}
        onCancel={() => setIsRecording(false)}
      />

      {/* Text input */}
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled || isRecording}
        placeholder={isRecording ? 'Listening to your voice...' : placeholder}
        aria-label="Message the accountability coach"
        className="flex-1 font-sans text-sm text-[#071E2D] dark:text-white placeholder:text-[#071E2D]/40 dark:placeholder:text-slate-500 outline-none bg-transparent py-2"
      />

      {/* Send Button */}
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        aria-label="Send message"
        className="btn-pill btn-pill-primary text-xs !py-2 !px-4 !shadow-[2px_2px_0px_#071E2D] dark:!shadow-[2px_2px_0px_#000000] disabled:opacity-40"
      >
        <span className="hidden sm:inline">Send</span>
        <span className="btn-bubble !w-6 !h-6">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </span>
      </button>
    </form>
  )
}
