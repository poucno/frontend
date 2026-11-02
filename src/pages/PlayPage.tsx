import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { findGame } from '../data/games'
import { DEFAULT_COLLECTION } from '../data/defaultCollection'
import { findPublicCollection } from '../data/publicCollections'
import { fetchCollection } from '../data/collectionsApi'
import type { GameQuestion, GameResult, GameToParent } from '../data/gameBridge'

type RemoteQuestions = { id: string; questions: GameQuestion[] }
type RemoteError = { id: string; message: string }

function toGameQuestions(detail: { questions: { question: string; possibleAnswers: string[]; answer: string }[] }): GameQuestion[] {
  return detail.questions.map(question => ({
    question: question.question,
    possibleAnswers: question.possibleAnswers,
    answer: question.answer,
  }))
}

export default function PlayPage() {
  const { gameName = '', collectionId } = useParams()
  const game = findGame(gameName)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [result, setResult] = useState<GameResult | null>(null)
  const [remote, setRemote] = useState<RemoteQuestions | null>(null)
  const [remoteError, setRemoteError] = useState<RemoteError | null>(null)

  const localCollection = collectionId ? findPublicCollection(collectionId) : DEFAULT_COLLECTION

  useEffect(() => {
    if (localCollection || !collectionId) return
    let cancelled = false
    fetchCollection(collectionId)
      .then(detail => {
        if (cancelled) return
        if (!detail) {
          setRemoteError({ id: collectionId, message: 'Zbirke ni mogoče najti.' })
          return
        }
        setRemote({ id: collectionId, questions: toGameQuestions(detail) })
        setRemoteError(null)
      })
      .catch(loadError => {
        if (cancelled) return
        setRemoteError({ id: collectionId, message: loadError instanceof Error ? loadError.message : 'Zbirke ni mogoče prebrati.' })
      })
    return () => { cancelled = true }
  }, [collectionId, localCollection])

  const questions = localCollection
    ? localCollection.questions
    : remote && remote.id === collectionId ? remote.questions : null
  const error = localCollection ? null : remoteError && remoteError.id === collectionId ? remoteError.message : null
  const loading = !localCollection && !questions && !error

  const startMessage = JSON.stringify({ type: 'start', questions: questions ?? [] })

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
        <Link className="back-link" to={`/play/${game.name}`}><span aria-hidden="true">←</span> Izberi sklop</Link>
        <span id="play-title" className="play-game-title">{game.title}</span>
      </div>
      {error && <p className="error-message">{error}</p>}
      {loading && <p className="form-note">Nalaganje …</p>}
      {!error && !loading && (
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
