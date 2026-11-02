import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { Balloons, Birds } from '../components/Decorations'

const delay = (index: number) => ({ '--i': index }) as CSSProperties

export default function HomePage() {
  return (
    <div className="landing-page">
      <div className="landing-clouds" aria-hidden="true">
        <span className="cloud cloud--first" />
        <span className="cloud cloud--second" />
        <span className="cloud cloud--third" />
        <Birds />
      </div>
      <section className="hero" aria-labelledby="welcome-title">
        <div className="hero-copy">
          <h1 id="welcome-title">
            <span className="hero-word" style={delay(0)}>Znanje</span>{' '}
            <span className="hero-word" style={delay(1)}>poleti</span><br />
            <span className="hero-word" style={delay(2)}>visoko!</span>
          </h1>
          <p className="hero-tagline">Uči se skozi igro.</p>
          <Link className="button hero-button" to="/play">Razišči otok <span aria-hidden="true">→</span></Link>
        </div>
        <Balloons animated interactive />
      </section>
    </div>
  )
}
