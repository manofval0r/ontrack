import React from 'react'
import { EmptyState } from '../../common/EmptyState'
import type { Goal } from '../../../types'

interface ManagePanelProps {
  onSelectGoal: (goal: Goal) => void
  onOpenChat: () => void
}

/**
 * Placeholder — Israel's full ManagePanel restores on his push.
 * Same filename/props contract so the swap is a clean overwrite.
 */
export const ManagePanel: React.FC<ManagePanelProps> = ({ onOpenChat }) => (
  <EmptyState
    title="Manage goals"
    description="Search, filter, and bulk-manage every goal from one place. Meanwhile, the AI coach can set one up for you."
    actionLabel="Open AI Chat"
    onAction={onOpenChat}
  />
)
