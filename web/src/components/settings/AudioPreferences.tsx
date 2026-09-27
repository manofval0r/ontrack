import React from 'react'
import { useGoals } from '../../context/GoalContext'
import { Button } from '../Button'

export const AudioPreferences: React.FC = () => {
  const { audioSettings, updateAudioSettings, playTTS, isAudioPlaying } = useGoals()

  const handleTestVoice = () => {
    playTTS("Hello Israel! This is your Nemotron AI accountability partner. I will keep you on track every single day.")
  }

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 bg-white border-2 border-[#071E2D] rounded-2xl shadow-[4px_4px_0px_#071E2D]">
      <div className="pb-4 border-b-2 border-[#071E2D]/10">
        <h3
          className="text-xl sm:text-2xl font-bold text-[#071E2D]"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Audio & Voice Preferences
        </h3>
        <p className="text-xs sm:text-sm text-[#071E2D]/70 mt-1">
          Configure how Nemotron synthesizes conversational speech (TTS) and parses microphone input (ASR).
        </p>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* TTS Toggle */}
        <div className="p-4 rounded-xl border-2 border-[#071E2D] bg-[#F8FAFB] flex items-center justify-between shadow-[2px_2px_0px_#071E2D]">
          <div>
            <span className="text-sm font-bold text-[#071E2D] block">Text-to-Speech (TTS)</span>
            <span className="text-xs text-[#071E2D]/60">Audible AI check-ins & responses</span>
          </div>
          <button
            type="button"
            onClick={() => updateAudioSettings({ tts_enabled: !audioSettings.tts_enabled })}
            className={`
              w-12 h-6 flex items-center rounded-full p-1 border-2 border-[#071E2D] transition-colors
              ${audioSettings.tts_enabled ? 'bg-[#00C4B3] justify-end' : 'bg-gray-200 justify-start'}
            `}
          >
            <span className="bg-[#071E2D] w-4 h-4 rounded-full shadow-md" />
          </button>
        </div>

        {/* ASR Toggle */}
        <div className="p-4 rounded-xl border-2 border-[#071E2D] bg-[#F8FAFB] flex items-center justify-between shadow-[2px_2px_0px_#071E2D]">
          <div>
            <span className="text-sm font-bold text-[#071E2D] block">Speech-to-Text (ASR)</span>
            <span className="text-xs text-[#071E2D]/60">Allow voice input in chat & goal creator</span>
          </div>
          <button
            type="button"
            onClick={() => updateAudioSettings({ asr_enabled: !audioSettings.asr_enabled })}
            className={`
              w-12 h-6 flex items-center rounded-full p-1 border-2 border-[#071E2D] transition-colors
              ${audioSettings.asr_enabled ? 'bg-[#00C4B3] justify-end' : 'bg-gray-200 justify-start'}
            `}
          >
            <span className="bg-[#071E2D] w-4 h-4 rounded-full shadow-md" />
          </button>
        </div>
      </div>

      {/* Voice Type Selector */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/70">
          Accountability Voice Persona
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'nemotron-direct',
              title: 'Nemotron Direct',
              desc: 'High clarity, laser-focused tone',
              badge: 'Default',
            },
            {
              id: 'accountability-coach',
              title: 'Accountability Coach',
              desc: 'High energy, motivating & urgent',
              badge: 'Energetic',
            },
            {
              id: 'calm-mentor',
              title: 'Calm Mentor',
              desc: 'Warm, grounded, thoughtful pace',
              badge: 'Reflective',
            },
          ].map((voice) => {
            const isSelected = audioSettings.voice_type === voice.id
            return (
              <button
                key={voice.id}
                type="button"
                onClick={() => updateAudioSettings({ voice_type: voice.id as any })}
                className={`
                  p-4 rounded-xl border-2 text-left flex flex-col justify-between gap-2 transition-all
                  ${isSelected
                    ? 'border-[#071E2D] bg-[#ECFEFF] shadow-[3px_3px_0px_#071E2D]'
                    : 'border-[#071E2D]/20 bg-white hover:border-[#071E2D]'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#071E2D]">{voice.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#071E2D]/30 text-[#071E2D]">
                    {voice.badge}
                  </span>
                </div>
                <span className="text-xs text-[#071E2D]/70">{voice.desc}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Voice Speed Slider */}
      <div className="flex flex-col gap-2 p-4 bg-[#F8FAFB] border-2 border-[#071E2D] rounded-xl shadow-[2px_2px_0px_#071E2D]">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/70">
            Playback Speed
          </span>
          <span className="text-sm font-extrabold text-[#006D6A]">
            {audioSettings.voice_speed.toFixed(2)}x
          </span>
        </div>
        <input
          type="range"
          min="0.75"
          max="1.5"
          step="0.05"
          value={audioSettings.voice_speed}
          onChange={(e) => updateAudioSettings({ voice_speed: parseFloat(e.target.value) })}
          className="w-full accent-[#00C4B3] cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-[#071E2D]/50 font-semibold">
          <span>0.75x (Deliberate)</span>
          <span>1.0x (Standard)</span>
          <span>1.5x (Fast)</span>
        </div>
      </div>

      {/* Test Voice Button */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-[#071E2D]/60 font-semibold">
          Test speech synthesis with current settings:
        </span>
        <Button
          variant="secondary"
          noBubble
          onClick={handleTestVoice}
          disabled={!audioSettings.tts_enabled || isAudioPlaying}
          className="text-xs !py-2 !px-5"
        >
          {isAudioPlaying ? 'Playing Sample...' : '🔊 Test Voice Audio'}
        </Button>
      </div>
    </div>
  )
}
