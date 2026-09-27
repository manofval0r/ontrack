import React from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { ChatWindow } from '../components/chat/ChatWindow'

export const Chat: React.FC = () => {
  return (
    <AppLayout
      title="Nemotron AI Accountability Partner"
      subtitle="Speak or type any goal. Nemotron compiles your target, selects the optimal tracker, and conducts check-ins."
    >
      <div className="flex flex-col gap-4">
        {/* Info header pill banner */}
        <div className="flex items-center justify-between p-3.5 px-5 bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000] text-xs font-semibold text-[#071E2D] dark:text-white transition-colors">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00C4B3] animate-pulse" />
            <span>NVIDIA Nemotron 70B Conversational Engine</span>
          </div>
          <span className="text-[#006D6A] dark:text-[#00C4B3] font-bold hidden sm:inline">
            Speech Recognition (ASR) + Voice Synthesis (TTS) Active
          </span>
        </div>

        {/* Chat Interface */}
        <ChatWindow />
      </div>
    </AppLayout>
  )
}
