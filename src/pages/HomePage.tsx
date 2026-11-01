import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Balloons } from '../components/Decorations'

export default function HomePage() {
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    function handleChange(event: MediaQueryListEvent) {
      setReducedMotion(event.matches)
    }
    preference.addEventListener('change', handleChange)
    return () => preference.removeEventListener('change', handleChange)
  }, [])

  const motionEnabled = !reducedMotion

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
          <Link className="button hero-button" to="/play">Razišči otok <span aria-hidden="true">→</span></Link>
        </div>
        <Balloons animated motionEnabled={motionEnabled} />
      </section>
    </div>
  )
}
