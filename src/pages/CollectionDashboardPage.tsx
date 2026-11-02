import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { QUESTION_FORMS, pluralSl } from '../data/plural'
import { subjectImage } from '../data/publicCollections'
import { UnauthorizedError, deleteCollectionById, fetchCollections } from '../data/collectionsApi'
import type { CollectionSummary } from '../data/collectionsApi'
import ShareQrDialog from '../components/ShareQrDialog'

function playUrl(collection: CollectionSummary): string {
  return `${window.location.origin}/play/${collection.gameId}/${collection.id}`
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const area = document.createElement('textarea')
      area.value = text
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      const copied = document.execCommand('copy')
      document.body.removeChild(area)
      return copied
    } catch {
      return false
    }
  }
}

export default function CollectionDashboardPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [collections, setCollections] = useState<CollectionSummary[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [qrCollection, setQrCollection] = useState<CollectionSummary | null>(null)
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

  async function handleCopy(collection: CollectionSummary) {
    const url = playUrl(collection)
    const copied = await copyText(url)
    if (!copied) {
      window.prompt('Kopiraj povezavo:', url)
      return
    }
    setCopiedId(collection.id)
    window.setTimeout(() => {
      setCopiedId(current => current === collection.id ? null : current)
    }, 2000)
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
          {collections.map(collection => {
            const image = subjectImage(collection.subject)
            return (
            <li key={collection.id} className="collection-card">
              <span className="collection-icon" aria-hidden="true">
                {image ? <img className="collection-icon-image" src={image} alt="" loading="lazy" /> : collection.grade}
              </span>
              <div className="collection-details">
                <h2>{collection.name}</h2>
                <p>{collection.subject} · {collection.grade}. razred · {collection.questionCount} {pluralSl(collection.questionCount, QUESTION_FORMS)}</p>
                {collection.questionCount === 0 && <span className="draft-label">Osnutek brez vprašanj</span>}
              </div>
              <div className="collection-actions">
                <button className={`button secondary-button icon-button copy-button${copiedId === collection.id ? ' is-copied' : ''}`} type="button" onClick={() => handleCopy(collection)} disabled={collection.questionCount === 0} aria-label={`Kopiraj povezavo do zbirke ${collection.name}`} title={collection.questionCount === 0 ? 'Zbirka še nima vprašanj' : copiedId === collection.id ? 'Kopirano' : 'Kopiraj povezavo'}>
                  {copiedId === collection.id
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M5 13l4 4L19 7" /></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11 4" /><path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L13 19" /></svg>}
                </button>
                <button className="button secondary-button icon-button" type="button" onClick={() => setQrCollection(collection)} disabled={collection.questionCount === 0} aria-label={`Prikaži kodo QR za zbirko ${collection.name}`} title={collection.questionCount === 0 ? 'Zbirka še nima vprašanj' : 'Koda QR'}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                    <rect x="4" y="4" width="6" height="6" rx="1" />
                    <rect x="14" y="4" width="6" height="6" rx="1" />
                    <rect x="4" y="14" width="6" height="6" rx="1" />
                    <path d="M14 14h2v2h-2zM18 14h2M18 18h2v2M14 20h2" />
                  </svg>
                </button>
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
              <span className="sr-only" role="status">{copiedId === collection.id ? 'Povezava kopirana' : ''}</span>
            </li>
            )
          })}
        </ul>
      )}
      {qrCollection && <ShareQrDialog name={qrCollection.name} url={playUrl(qrCollection)} onClose={() => setQrCollection(null)} />}
    </section>
  )
}
