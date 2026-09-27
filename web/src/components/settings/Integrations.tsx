import React, { useState } from 'react'
import { Calendar, MessageSquare, FileText, GitBranch, Check, X, ArrowRight } from 'lucide-react'
import { useGoals } from '../../context/GoalContext'
import { Modal } from '../common/Modal'
import { Button } from '../Button'

export const Integrations: React.FC = () => {
  const { integrations, toggleIntegration } = useGoals()
  const [selectedIntegration, setSelectedIntegration] = useState<any | null>(null)

  const handleAction = (item: any) => {
    setSelectedIntegration(item)
  }

  const confirmToggle = () => {
    if (selectedIntegration) {
      toggleIntegration(selectedIntegration.id)
      setSelectedIntegration(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] transition-colors">
      <div className="pb-4 border-b-2 border-[#071E2D]/10 dark:border-white/10">
        <h3
          className="text-xl sm:text-2xl font-bold text-[#071E2D] dark:text-white"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Connected Workspaces & Integrations
        </h3>
        <p className="text-xs sm:text-sm text-[#071E2D]/70 dark:text-slate-300 mt-1">
          Bridge OnTrack with your everyday productivity platforms to automate progress tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl border-2 border-[#071E2D] dark:border-[#1E3A52] bg-[#F8FAFB] dark:bg-[#091824] shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000] flex flex-col justify-between gap-4 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] flex items-center justify-center font-bold text-sm shadow-sm">
                  {item.icon === 'calendar' ? (
                    <Calendar className="w-5 h-5 text-indigo-500" />
                  ) : item.icon === 'slack' ? (
                    <MessageSquare className="w-5 h-5 text-amber-500" />
                  ) : item.icon === 'notion' ? (
                    <FileText className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <GitBranch className="w-5 h-5 text-violet-500" />
                  )}
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#071E2D] dark:text-white">{item.name}</h4>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border mt-1 ${
                      item.connected
                        ? 'bg-[#F0FDF4] dark:bg-emerald-950/40 text-[#166534] dark:text-emerald-400 border-[#166534] dark:border-emerald-700'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-300 dark:border-slate-600'
                    }`}
                  >
                    {item.connected ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Connected</span>
                      </>
                    ) : (
                      'Not Connected'
                    )}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#071E2D]/75 dark:text-slate-300 leading-relaxed font-medium">
              {item.description}
            </p>

            <div className="pt-3 border-t border-[#071E2D]/10 dark:border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-[#071E2D]/55 dark:text-slate-400 font-mono truncate max-w-[180px]">
                {item.status_label}
              </span>

              <button
                type="button"
                onClick={() => handleAction(item)}
                className={`
                  btn-pill text-xs !py-1 !px-3 !shadow-[2px_2px_0px_#071E2D] dark:!shadow-[2px_2px_0px_#000000]
                  ${item.connected ? 'btn-pill-white text-red-600 dark:text-rose-400' : 'btn-pill-primary'}
                `}
              >
                <span>{item.connected ? 'Disconnect' : 'Connect'}</span>
                <span className="btn-bubble !w-5 !h-5 text-[10px]">
                  {item.connected ? <X className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!selectedIntegration}
        onClose={() => setSelectedIntegration(null)}
        title={selectedIntegration?.connected ? `Disconnect ${selectedIntegration?.name}?` : `Connect ${selectedIntegration?.name}`}
      >
        <div className="flex flex-col gap-4 text-[#071E2D] dark:text-white">
          <p className="text-sm text-[#071E2D]/80 dark:text-slate-300 leading-relaxed">
            {selectedIntegration?.connected
              ? `Are you sure you want to disconnect ${selectedIntegration?.name}? Automated progress logging and sync updates from this service will pause.`
              : `Authorize OnTrack to sync goals, check-ins, and deadlines with your ${selectedIntegration?.name} account.`}
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#071E2D]/10 dark:border-white/10">
            <button
              type="button"
              onClick={() => setSelectedIntegration(null)}
              className="px-4 py-2 text-xs font-semibold text-[#071E2D]/70 dark:text-slate-400 hover:text-[#071E2D] dark:hover:text-white"
            >
              Cancel
            </button>
            <Button
              variant={selectedIntegration?.connected ? 'secondary' : 'primary'}
              onClick={confirmToggle}
              noBubble
              className="text-xs !py-2 !px-4"
            >
              {selectedIntegration?.connected ? 'Confirm Disconnect' : 'Authorize & Connect'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
