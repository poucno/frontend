import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UnauthorizedError, createCollection } from '../data/collectionsApi'
import { fetchGames } from '../data/gamesApi'
import type { GameOption } from '../data/gamesApi'
import { validateMetadata } from '../data/collectionValidation'
import type { MetadataErrors } from '../data/collectionValidation'
import { useAuth } from '../hooks/useAuth'
import { useUnsavedChanges } from '../hooks/useUnsavedChanges'
import CollectionMetadataFields from '../components/CollectionMetadataFields'
import UnsavedChangesDialog from '../components/UnsavedChangesDialog'

type CreateFields = { name: string; subject: string; grade: number; gameId: string }
type CreateErrors = MetadataErrors & { grade?: string; gameId?: string }

export default function CreateCollectionPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [fields, setFields] = useState<CreateFields>({ name: '', subject: '', grade: 5, gameId: '' })
  const [errors, setErrors] = useState<CreateErrors>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [games, setGames] = useState<GameOption[] | null>(null)
  const [gamesError, setGamesError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState(false)
  const { blocker, allowNavigation } = useUnsavedChanges(touched)

  useEffect(() => {
    if (!session) navigate('/teachers/login', { replace: true })
  }, [session, navigate])

  useEffect(() => {
    let cancelled = false
    fetchGames()
      .then(list => {
        if (cancelled) return
        setGames(list)
        if (list[0]) setFields(previous => previous.gameId ? previous : { ...previous, gameId: list[0]!.id })
      })
      .catch(error => {
        if (!cancelled) setGamesError(error instanceof Error ? error.message : 'Iger ni mogoče naložiti.')
      })
    return () => { cancelled = true }
  }, [])

  function update(next: Partial<CreateFields>) {
    setFields(previous => ({ ...previous, ...next }))
    setTouched(true)
    setSaveError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: CreateErrors = { ...validateMetadata({ name: fields.name, subject: fields.subject }) }
    if (!Number.isInteger(fields.grade) || fields.grade < 1 || fields.grade > 9) nextErrors.grade = 'Izberi razred od 1 do 9.'
    if (!fields.gameId) nextErrors.gameId = 'Izberi igro.'
    setErrors(nextErrors)
    setSaveError(null)
    if (Object.keys(nextErrors).length > 0) {
      const field = nextErrors.name ? '#collection-name' : nextErrors.subject ? '#collection-subject' : nextErrors.grade ? '#collection-grade' : '#collection-game'
      event.currentTarget.querySelector<HTMLElement>(field)?.focus()
      return
    }
    setLoading(true)
    try {
      await createCollection({
        name: fields.name.trim(),
        subject: fields.subject.trim(),
        grade: fields.grade,
        description: '',
        gameId: fields.gameId,
        questions: [],
      })
      allowNavigation()
      navigate('/teachers')
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        navigate('/teachers/login', { replace: true })
        return
      }
      setSaveError(error instanceof Error ? error.message : 'Zbirke ni mogoče ustvariti.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="create-collection-page" aria-labelledby="create-title">
      <Link className="back-link" to="/teachers"><span aria-hidden="true">←</span> Moje zbirke</Link>
      <h1 id="create-title">Nova zbirka</h1>
      <form className="collection-form" onSubmit={handleSubmit} noValidate>
        <CollectionMetadataFields metadata={{ name: fields.name, subject: fields.subject }} errors={errors} onChange={next => update(next)} />
        <div className="metadata-fields">
          <div className="form-field">
            <label htmlFor="collection-grade">Razred</label>
            <select id="collection-grade" value={fields.grade} onChange={event => update({ grade: Number(event.target.value) })} aria-invalid={!!errors.grade} aria-describedby={errors.grade ? 'grade-error' : undefined}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(value => <option key={value} value={value}>{value}. razred</option>)}
            </select>
            {errors.grade && <p id="grade-error" className="field-error">{errors.grade}</p>}
          </div>
          <div className="form-field">
            <label htmlFor="collection-game">Igra</label>
            <select id="collection-game" value={fields.gameId} onChange={event => update({ gameId: event.target.value })} disabled={!games} aria-invalid={!!errors.gameId} aria-describedby={errors.gameId ? 'game-error' : undefined}>
              {!games && <option value="">Nalaganje …</option>}
              {games?.map(game => <option key={game.id} value={game.id}>{game.title}</option>)}
            </select>
            {errors.gameId && <p id="game-error" className="field-error">{errors.gameId}</p>}
          </div>
        </div>
        {gamesError && <p className="error-message" role="alert">{gamesError}</p>}
        <p className="form-note">Shrani osnutek, nato z gumbom Uredi dodaj vprašanja.</p>
        {Object.keys(errors).length > 0 && <p className="field-error" role="alert">Preveri označena polja.</p>}
        {saveError && <p className="error-message" role="alert">{saveError}</p>}
        <div className="form-actions">
          <button className="button" type="submit" disabled={loading || !games}>{loading ? 'Shranjujem …' : 'Shrani zbirko'}</button>
          <Link className="button secondary-button" to="/teachers">Prekliči</Link>
        </div>
      </form>
      {blocker.state === 'blocked' && <UnsavedChangesDialog onStay={() => blocker.reset()} onLeave={() => blocker.proceed()} />}
    </section>
  )
}
