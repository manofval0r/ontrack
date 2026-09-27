import React from 'react'
import { EmptyState } from '../../common/EmptyState'

/**
 * Placeholder — Israel's full ActivityPanel restores on his push.
 * Same filename/props contract so the swap is a clean overwrite.
 */
export const ActivityPanel: React.FC = () => (
  <EmptyState
    title="Activity"
    description="Your full activity stream is landing here — every goal update, check-in, and verdict in one tactile timeline."
  />
)
