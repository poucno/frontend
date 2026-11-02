import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { QUESTION_FORMS, pluralSl } from '../data/plural'
import { UnauthorizedError, deleteCollectionById, fetchCollections } from '../data/collectionsApi'
import type { CollectionSummary } from '../data/collectionsApi'

export default function CollectionDashboardPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [collections, setCollections] = useState<CollectionSummary[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const newCollectionLink = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!session) {
      navigate('/teachers/login', { replace: true })
      return
    }
    let cancelled = false
    fetchCollections()
      .then(data => {
        if (cancelled) return
        setCollections(data)
        setLoadError(null)
      })
      .catch(error => {
        if (cancelled) return
        if (error instanceof UnauthorizedError) {
          navigate('/teachers/login', { replace: true })
          return
        }
        setLoadError(error instanceof Error ? error.message : 'Zbirk ni mogoče naložiti.')
      })
    return () => { cancelled = true }
  }, [session, reloadKey, navigate])

  async function handleDelete(collection: CollectionSummary) {
    if (!window.confirm(`Izbrišem zbirko »${collection.name}«? Izbrisane zbirke ni mogoče obnoviti.`)) return
    setDeletingId(collection.id)
    setSaveError(null)
    try {
      await deleteCollectionById(collection.id)
      setCollections(previous => previous ? previous.filter(item => item.id !== collection.id) : previous)
      newCollectionLink.current?.focus()
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        navigate('/teachers/login', { replace: true })
        return
      }
      setSaveError(error instanceof Error ? error.message : 'Zbirke ni mogoče izbrisati.')
    } finally {
      setDeletingId(null)
    }
  }

  const loading = !collections && !loadError

  return (
    <section className="dashboard-page" aria-labelledby="dashboard-title">
      <div className="page-heading">
        <h1 id="dashboard-title">Moje zbirke</h1>
        {!loadError && <Link ref={newCollectionLink} className="button" to="/teachers/collections/new"><span aria-hidden="true">＋</span> Nova zbirka</Link>}
      </div>
      {loadError && <div className="error-message" role="alert"><p>{loadError}</p><button className="button secondary-button" onClick={() => { setLoadError(null); setReloadKey(value => value + 1) }}>Poskusi znova</button></div>}
      {saveError && <p className="error-message" role="alert">{saveError}</p>}
      {loading && <p className="form-note">Nalaganje …</p>}
      {!loadError && collections && collections.length === 0 && (
        <div className="empty-state">
          <span className="collection-icon" aria-hidden="true">＋</span>
          <h2>Pripravi prvo zbirko</h2>
          <p>Dodaj zbirko in ji nato dodaj vprašanja.</p>
          <Link className="button" to="/teachers/collections/new">Ustvari zbirko <span aria-hidden="true">→</span></Link>
        </div>
      )}
      {collections && collections.length > 0 && (
        <ul className="collection-list">
          {collections.map(collection => (
            <li key={collection.id} className="collection-card">
              <span className="collection-icon" aria-hidden="true">{collection.grade}</span>
              <div className="collection-details">
                <h2>{collection.name}</h2>
                <p>{collection.subject} · {collection.grade}. razred · {collection.questionCount} {pluralSl(collection.questionCount, QUESTION_FORMS)}</p>
                {collection.questionCount === 0 && <span className="draft-label">Osnutek brez vprašanj</span>}
              </div>
              <div className="collection-actions">
                {!loadError && (
                  <Link className="button secondary-button icon-button" to={`/teachers/collections/${encodeURIComponent(collection.id)}/edit`} aria-label={`Uredi zbirko ${collection.name}`} title="Uredi">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                      <path d="M4 20h4L19 9l-4-4L4 16v4z" />
                      <path d="M13.5 6.5l4 4" />
                    </svg>
                  </Link>
                )}
                <button className="button secondary-button icon-button delete-button" disabled={deletingId === collection.id} onClick={() => handleDelete(collection)} aria-label={`Izbriši zbirko ${collection.name}`} title="Izbriši">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                    <path d="M4 7h16" />
                    <path d="M10 4h4" />
                    <path d="M6 7l1 13h10l1-13" />
                    <path d="M10 11v5M14 11v5" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
