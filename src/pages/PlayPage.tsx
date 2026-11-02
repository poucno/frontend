import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { findGame } from '../data/games'
import { DEFAULT_COLLECTION } from '../data/defaultCollection'
import { findPublicCollection } from '../data/publicCollections'
import type { GameQuestion, GameResult, GameToParent } from '../data/gameBridge'

export default function PlayPage() {
  const { gameName = '', collectionId } = useParams()
  const game = findGame(gameName)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [result, setResult] = useState<GameResult | null>(null)

  let questions: GameQuestion[] = []
  let error: string | null = null
  try {
    const collection = collectionId ? findPublicCollection(collectionId) : DEFAULT_COLLECTION
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
      const iframe = iframeRef.current
      if (!iframe || !iframe.src || event.source !== iframe.contentWindow) return

      const gameOrigin = new URL(iframe.src).origin
      if (event.origin !== gameOrigin) return

      let message: GameToParent | null
      try {
        message = JSON.parse(event.data)
      } catch {
        return
      }
      if (!message) return

      if (message.type === 'ready') {
        iframe.contentWindow?.postMessage(startMessage, gameOrigin)
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
        <Link className="back-link" to={`/play/${game.name}`}><span aria-hidden="true">←</span> Izberi sklop</Link>
        <span id="play-title" className="play-game-title">{game.title}</span>
      </div>
      {error && <p className="error-message">{error}</p>}
      {!error && (
        <div className="game-stage">
          <iframe
            ref={iframeRef}
            className="game-frame"
            title={game.title}
            src={game.url}
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
