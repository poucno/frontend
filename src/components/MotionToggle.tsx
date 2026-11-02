import { useMotion } from '../hooks/useMotion'

export default function MotionToggle() {
  const { paused, togglePaused } = useMotion()
  const label = paused ? 'Nadaljuj gibanje' : 'Ustavi gibanje'

  return (
    <button className="motion-toggle" type="button" onClick={togglePaused} aria-label={label}>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        {paused ? <path d="M8 5.5v13l11-6.5z" /> : <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />}
      </svg>
      <span className="motion-toggle-label">{label}</span>
    </button>
  )
}
