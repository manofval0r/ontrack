import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  panelName?: string
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class PanelErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[PanelErrorBoundary: ${this.props.panelName || 'Panel'}] Caught error:`, error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  public render() {
    if (this.state.hasError) {
      const panel = this.props.panelName || 'section'
      return (
        <div
          role="alert"
          className="w-full p-6 sm:p-8 rounded-3xl border-2 border-[#071E2D] dark:border-[#1E3A52] bg-white dark:bg-[#0E202D] shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] flex flex-col items-center justify-center text-center gap-4 my-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border-2 border-[#071E2D] dark:border-amber-600 flex items-center justify-center text-amber-700 dark:text-amber-400 shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000]">
            <AlertCircle className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div className="max-w-md">
            <h3
              className="text-lg sm:text-xl font-extrabold text-[#071E2D] dark:text-white"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              This {panel} had a hiccup
            </h3>
            <p className="text-xs sm:text-sm text-[#071E2D]/70 dark:text-slate-300 mt-1 font-medium leading-relaxed">
              We encountered a temporary rendering issue in this specific panel. The rest of your workspace, AI coach, and data remain intact.
            </p>
            {this.state.error?.message && (
              <p className="mt-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#091824] p-2 rounded-lg border border-slate-200 dark:border-slate-800 break-all text-left">
                {this.state.error.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={this.handleRetry}
              className="btn-pill btn-pill-primary text-xs !py-2 !px-5 inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Refreshing</span>
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-pill btn-pill-white text-xs !py-2 !px-4 text-[#071E2D] dark:text-white cursor-pointer"
            >
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
