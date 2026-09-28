import React from 'react'
import { ChatWindow } from '../components/chat/ChatWindow'

export const Chat: React.FC = () => {
  return (
    <div className="flex flex-col gap-5">
      {/* Title & Subtitle */}
      <div>
        <h2
          className="text-2xl sm:text-3xl font-extrabold text-[#071E2D] dark:text-white tracking-tight"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Nemotron AI Accountability Partner
        </h2>
        <p className="text-xs sm:text-sm text-[#071E2D]/60 dark:text-slate-400 mt-0.5 font-medium">
          Speak or type any goal. Nemotron compiles your target, selects the optimal tracker, and conducts check-ins.
        </p>
      </div>

      {/* Info header pill banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 px-5 bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000] text-xs font-semibold text-[#071E2D] dark:text-white transition-colors gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00C4B3] animate-pulse" />
          <span>NVIDIA Nemotron 70B Engine + pgvector RAG Memory</span>
        </div>
        <span className="text-[#006D6A] dark:text-[#00C4B3] font-bold">
          Retrieval-Augmented Context & Voice Active
        </span>
      </div>

      {/* Chat Interface */}
      <ChatWindow />
    </div>
  )
}
