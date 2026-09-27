import type { TrackerType, GoalStatus, GoalDomain } from '../../types'

interface StatusBadgeProps {
  type?: 'tracker' | 'status' | 'domain' | 'custom'
  trackerType?: TrackerType
  status?: GoalStatus
  domain?: GoalDomain
  label?: string
  className?: string
  pulse?: boolean
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  trackerType,
  status,
  domain,
  label,
  className = '',
  pulse = false,
}) => {
  let text = label || ''
  let badgeStyle = 'bg-white text-[#071E2D] border-[#071E2D]'

  if (trackerType) {
    if (trackerType === 'counter') {
      text = text || 'Counter Tracker'
      badgeStyle = 'bg-[#ECFEFF] text-[#006D6A] border-[#006D6A]'
    } else if (trackerType === 'checklist') {
      text = text || 'Milestone Checklist'
      badgeStyle = 'bg-[#F0FDF4] text-[#166534] border-[#166534]'
    } else {
      text = text || 'Daily Reflection'
      badgeStyle = 'bg-[#FAF5FF] text-[#6B21A8] border-[#6B21A8]'
    }
  } else if (status) {
    if (status === 'active') {
      text = text || 'In Progress'
      badgeStyle = 'bg-[#00C4B3]/15 text-[#006D6A] border-[#00C4B3]'
    } else if (status === 'completed') {
      text = text || 'Target Met ✓'
      badgeStyle = 'bg-[#10B981]/20 text-[#065F46] border-[#10B981]'
    } else if (status === 'paused') {
      text = text || 'Paused'
      badgeStyle = 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]'
    } else {
      text = text || 'Below Target'
      badgeStyle = 'bg-[#FEE2E2] text-[#991B1B] border-[#EF4444]'
    }
  } else if (domain) {
    const domainNames: Record<GoalDomain, string> = {
      sales: 'Sales & Revenue',
      engineering: 'Engineering',
      fitness: 'Health & Fitness',
      learning: 'Skills & Study',
      mindset: 'Founder Mindset',
      general: 'Focus Goal',
    }
    text = text || domainNames[domain] || domain
    badgeStyle = 'bg-[#F8FAFB] text-[#071E2D] border-[#071E2D]/40'
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full
        text-xs font-semibold tracking-wide
        border border-current
        shadow-[1.5px_1.5px_0px_currentColor]
        transition-all duration-150
        ${badgeStyle}
        ${className}
      `.trim()}
    >
      {pulse && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" aria-hidden="true" />
      )}
      <span>{text}</span>
    </span>
  )
}
