import { DatabaseZap, RefreshCw, WifiOff } from 'lucide-react'
import EmptyState from './EmptyState'

export default function ErrorState({ error, onRetry }) {
  const dbDown = error?.code === 'DB_UNAVAILABLE' || error?.code === 'DB_NOT_CONFIGURED'
  const offline = error?.code === 'NETWORK'
  return (
    <EmptyState
      icon={offline ? WifiOff : DatabaseZap}
      title={dbDown ? "Can't reach the database" : offline ? "Can't reach PulseFit" : 'Something went wrong'}
      message={error?.message || 'Please try again in a moment.'}
      action={onRetry && (
        <button className="btn-primary" onClick={() => onRetry()}>
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      )}
    />
  )
}
