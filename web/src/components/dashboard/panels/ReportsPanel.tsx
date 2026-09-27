import React from 'react'
import { EmptyState } from '../../common/EmptyState'

/**
 * Placeholder — Israel's full ReportsPanel restores on his push.
 * Same filename/props contract so the swap is a clean overwrite.
 */
export const ReportsPanel: React.FC = () => (
  <EmptyState
    title="Reports"
    description="Weekly accountability reports — completion rate, streaks, and verdict history, exportable in one tap."
  />
)
