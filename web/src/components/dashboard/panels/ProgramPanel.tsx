import React from 'react'
import { EmptyState } from '../../common/EmptyState'

/**
 * Placeholder — Israel's full ProgramPanel restores on his push.
 * Same filename/props contract so the swap is a clean overwrite.
 */
export const ProgramPanel: React.FC = () => (
  <EmptyState
    title="Program"
    description="Structured multi-week programs built from your goals will live here — milestones, phases, and pacing in one view."
  />
)
