import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { findGame } from '../data/games'
import { PUBLIC_COLLECTIONS, PUBLIC_TOPICS, subjectImage } from '../data/publicCollections'

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default function QuestionSetsPage() {
  const { gameName = '' } = useParams()
  const game = findGame(gameName)
  const [topic, setTopic] = useState<string | null>(null)

  if (!game) {
    return (
      <section className="games-page">
        <Link className="back-link" to="/play"><span aria-hidden="true">←</span> Izberi igro</Link>
        <h1>Igra ni na voljo</h1>
        <p className="form-note">Igre »{gameName}« ni mogoče najti.</p>
      </section>
    )
  }

  const collections = topic
    ? PUBLIC_COLLECTIONS.filter(collection => collection.subject === topic)
    : PUBLIC_COLLECTIONS

  return (
    <section className="games-page" aria-labelledby="sets-title">
      <Link className="back-link" to="/play"><span aria-hidden="true">←</span> Izberi igro</Link>
      <h1 id="sets-title">{game.title}</h1>
      <div className="topic-filter" role="group" aria-label="Predmet">
        <button type="button" className={`topic-chip${topic === null ? ' is-active' : ''}`} onClick={() => setTopic(null)} aria-pressed={topic === null}>Vse</button>
        {PUBLIC_TOPICS.map(item => (
          <button key={item} type="button" className={`topic-chip${topic === item ? ' is-active' : ''}`} onClick={() => setTopic(item)} aria-pressed={topic === item}>{capitalize(item)}</button>
        ))}
      </div>
      {collections.length === 0 && <p className="form-note">Ni sklopov za ta predmet.</p>}
      <ul className="sets-list">
        {collections.map(collection => {
          const image = subjectImage(collection.subject)
          return (
            <li key={collection.id}>
              <Link className="set-card" to={`/play/${game.name}/${collection.id}`}>
                <span className="set-icon" aria-hidden="true">
                  {image && <img className="set-subject-image" src={image} alt="" loading="lazy" />}
                </span>
                <span className="set-details">
                  <span className="set-name">{collection.name}</span>
                  <span className="set-meta">{capitalize(collection.subject)} · {collection.questions.length} vprašanj</span>
                </span>
                <span className="set-arrow" aria-hidden="true">→</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
