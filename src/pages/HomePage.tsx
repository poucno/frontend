import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Balloons } from '../components/Decorations'

export default function HomePage() {
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const motionEnabled = !paused && !reducedMotion

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    function handleChange(event: MediaQueryListEvent) {
      setReducedMotion(event.matches)
    }
    preference.addEventListener('change', handleChange)
    return () => preference.removeEventListener('change', handleChange)
  }, [])

  return (
    <div className="landing-page" data-motion={motionEnabled ? 'running' : 'paused'}>
      <div className="landing-clouds" aria-hidden="true">
        <span className="cloud cloud--first" />
        <span className="cloud cloud--second" />
        <span className="cloud cloud--third" />
      </div>
      <section className="hero" aria-labelledby="welcome-title">
        <div className="hero-copy">
          <h1 id="welcome-title">Znanje poleti<br />visoko!</h1>
          <p>Uči se skozi igro.</p>
          <Link className="button hero-button" to="/preview">Razišči otok <span aria-hidden="true">→</span></Link>
        </div>
        <Balloons animated motionEnabled={motionEnabled} />
      </section>
      <section className="game-card" aria-labelledby="game-title">
        <span className="game-icon" aria-hidden="true">🚀</span>
        <div>
          <h2 id="game-title">Vesolsko lovljenje</h2>
        </div>
        <Link className="button" to="/play/falling_objects">Oglej si <span aria-hidden="true">→</span></Link>
      </section>
      {!reducedMotion && (
        <div className="motion-controls">
          <button className="motion-toggle" onClick={() => setPaused(!paused)}>
            <span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span>
            {paused ? 'Nadaljuj gibanje' : 'Ustavi gibanje'}
          </button>
        </div>
      )}
    </div>
  )
}
