import React from 'react'
import { EmptyState } from '../../common/EmptyState'

/**
 * Placeholder — Israel's full IntegrationsPanel restores on his push.
 * Same filename/props contract so the swap is a clean overwrite.
 * (Live integration toggles live under Settings → Integrations today.)
 */
export const IntegrationsPanel: React.FC = () => (
  <EmptyState
    title="Integrations"
    description="GitHub, Notion, calendar, and fitness syncs plug in here. Manage live connections under Settings → Integrations."
  />
)
