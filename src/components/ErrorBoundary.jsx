import { Component } from 'react'
import { RefreshCw, ZapOff } from 'lucide-react'

export default class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) { console.error('PulseFit crashed:', error, info) }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="grid min-h-dvh place-items-center p-6">
        <div className="glass max-w-md p-8 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-flame/10 text-flame">
            <ZapOff className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold">Whoops, we pulled a muscle.</h2>
          <p className="mt-2 text-muted">Something went wrong on our side. Your progress is safe. Give it another rep.</p>
          <button className="btn-primary mt-6" onClick={() => location.reload()}>
            <RefreshCw className="h-4 w-4" /> Reload PulseFit
          </button>
        </div>
      </div>
    )
  }
}
