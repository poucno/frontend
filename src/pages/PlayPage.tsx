import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { findGame } from '../data/games'
import { DEFAULT_COLLECTION } from '../data/defaultCollection'
import type { GameQuestion, GameResult, GameToParent } from '../data/gameBridge'
import type { Collection } from '../types/collection'

export default function PlayPage() {
  const { gameName = '', collectionId } = useParams()
  const game = findGame(gameName)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [result, setResult] = useState<GameResult | null>(null)

  let questions: GameQuestion[] = []
  let error: string | null = null
  try {
    let collection: Collection | null = null
    if (collectionId) {
      collection = null
    } else {
      collection = DEFAULT_COLLECTION
    }

    if (collection) {
      questions = collection.questions
    } else {
      error = 'Zbirke ni mogoče najti.'
    }
  } catch {
    error = 'Zbirke ni mogoče prebrati.'
  }

  const startMessage = JSON.stringify({ type: 'start', questions })

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== iframeRef.current?.contentWindow) return

      let message: GameToParent | null
      try {
        message = JSON.parse(event.data)
      } catch {
        return
      }
      if (!message) return

      if (message.type === 'ready') {
        iframeRef.current?.contentWindow?.postMessage(startMessage, window.location.origin)
      } else if (message.type === 'result') {
        setResult(message.payload)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [startMessage])

  if (!game) {
    return (
      <section className="play-page">
        <Link className="back-link" to="/play"><span aria-hidden="true">←</span> Izberi igro</Link>
        <h1>Igra ni na voljo</h1>
        <p className="form-note">Igre »{gameName}« ni mogoče najti.</p>
      </section>
    )
  }

  return (
    <section className="play-page" aria-labelledby="play-title">
      <div className="play-heading">
        <Link className="back-link" to="/play"><span aria-hidden="true">←</span> Izberi igro</Link>
        <span id="play-title" className="play-game-title">{game.title}</span>
      </div>
      {error && <p className="error-message">{error}</p>}
      {!error && (
        <div className="game-stage">
          <iframe
            ref={iframeRef}
            className="game-frame"
            title={game.title}
            src={`/games/${game.name}/index.html`}
            allow="autoplay; fullscreen"
          />
        </div>
      )}
      {result && (
        <p className="form-note">
          Rezultat: {result.correct} pravilnih, {result.wrong} napačnih
        </p>
      )}
    </section>
  )
}
