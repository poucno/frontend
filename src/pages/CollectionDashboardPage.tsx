import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { COLLECTIONS_STORAGE_KEY, deleteCollection, readCollections } from '../data/collectionsStorage'
import type { Collection } from '../types/collection'

function loadDashboard(): { collections: Collection[]; loadError: string | null } {
  try {
    return { collections: readCollections(), loadError: null }
  } catch (error) {
    return { collections: [], loadError: error instanceof Error ? error.message : 'Zbirk ni mogoče prebrati.' }
  }
}

export default function CollectionDashboardPage() {
  const [dashboard, setDashboard] = useState(loadDashboard)
  const [saveError, setSaveError] = useState<string | null>(null)
  const newCollectionLink = useRef<HTMLAnchorElement>(null)
  const { collections, loadError } = dashboard

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === COLLECTIONS_STORAGE_KEY || event.key === null) {
        const loaded = loadDashboard()
        setDashboard(previous => loaded.loadError ? { ...previous, loadError: loaded.loadError } : loaded)
        setSaveError(null)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  function retryLoad() {
    const loaded = loadDashboard()
    setDashboard(previous => loaded.loadError ? { ...previous, loadError: loaded.loadError } : loaded)
    setSaveError(null)
  }

  function handleDelete(collection: Collection) {
    if (!window.confirm(`Izbrišem zbirko »${collection.title}«? Izbrisane zbirke ni mogoče obnoviti.`)) return
    try {
      const remaining = deleteCollection(collection.id)
      setDashboard({ collections: remaining, loadError: null })
      setSaveError(null)
      newCollectionLink.current?.focus()
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Zbirke ni mogoče izbrisati.')
    }
  }

  return (
    <section className="dashboard-page" aria-labelledby="dashboard-title">
      <div className="page-heading">
        <h1 id="dashboard-title">Moje zbirke</h1>
        {!loadError && <Link ref={newCollectionLink} className="button" to="/teachers/collections/new"><span aria-hidden="true">＋</span> Nova zbirka</Link>}
      </div>
      <p className="local-mode">Lokalni način · Zbirke so shranjene samo v tem brskalniku.</p>
      {loadError && <div className="error-message" role="alert"><p>{loadError}</p><button className="button secondary-button" onClick={retryLoad}>Poskusi znova</button></div>}
      {saveError && <p className="error-message" role="alert">{saveError}</p>}
      {!loadError && collections.length === 0 && (
        <div className="empty-state">
          <span className="collection-icon" aria-hidden="true">＋</span>
          <h2>Pripravi prvo zbirko</h2>
          <p>Izberi naslov, predmet in razred.</p>
          <Link className="button" to="/teachers/collections/new">Ustvari zbirko <span aria-hidden="true">→</span></Link>
        </div>
      )}
      {collections.length > 0 && (
        <ul className="collection-list">
          {collections.map(collection => (
            <li key={collection.id} className="collection-card">
              <span className="collection-icon" aria-hidden="true">{collection.grade}</span>
              <div className="collection-details">
                <h2>{collection.title}</h2>
                <p>{collection.subject} · {collection.grade}. razred · Število vprašanj: {collection.questions.length}</p>
                {collection.questions.length === 0 && <span className="draft-label">Osnutek brez vprašanj</span>}
              </div>
              <div className="collection-actions">
                {!loadError && <Link className="button secondary-button" to={`/teachers/collections/${encodeURIComponent(collection.id)}/edit`} aria-label={`Uredi zbirko ${collection.title}`}>Uredi <span aria-hidden="true">↗</span></Link>}
                <button className="button secondary-button delete-button" disabled={!!loadError} onClick={() => handleDelete(collection)} aria-label={`Izbriši zbirko ${collection.title}`}>Izbriši</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
