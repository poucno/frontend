import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useUnsavedChanges } from '../hooks/useUnsavedChanges'
import { UnauthorizedError, fetchCollection, updateCollection } from '../data/collectionsApi'
import type { CollectionDetail } from '../data/collectionsApi'
import { hasValidationErrors, trimCollection, validateCollection } from '../data/collectionValidation'
import type { CollectionErrors } from '../data/collectionValidation'
import type { Collection, Question } from '../types/collection'
import CollectionMetadataFields from '../components/CollectionMetadataFields'
import QuestionEditor from '../components/QuestionEditor'
import UnsavedChangesDialog from '../components/UnsavedChangesDialog'

function toDraft(detail: CollectionDetail): Collection {
  return {
    id: detail.id,
    name: detail.name,
    subject: detail.subject,
    description: detail.description,
    questions: detail.questions.map(question => ({
      question: question.question,
      possibleAnswers: question.possibleAnswers,
      answer: question.answer,
    })),
  }
}

function EditorLoader({ collectionId }: { collectionId: string }) {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [detail, setDetail] = useState<CollectionDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!session) {
      navigate('/teachers/login', { replace: true })
      return
    }
    let cancelled = false
    fetchCollection(collectionId)
      .then(result => {
        if (cancelled) return
        if (result) setDetail(result)
        else setError('Ta zbirka ni več na voljo.')
      })
      .catch(loadError => {
        if (cancelled) return
        if (loadError instanceof UnauthorizedError) {
          navigate('/teachers/login', { replace: true })
          return
        }
        setError(loadError instanceof Error ? loadError.message : 'Zbirke ni mogoče naložiti.')
      })
    return () => { cancelled = true }
  }, [collectionId, session, navigate, reloadKey])

  if (detail) return <CollectionEditor key={detail.id} detail={detail} />

  return (
    <section className="editor-page">
      <Link className="back-link" to="/teachers"><span aria-hidden="true">←</span> Moje zbirke</Link>
      <h1>Uredi zbirko</h1>
      {error
        ? <div className="error-message" role="alert"><p>{error}</p><button className="button secondary-button" onClick={() => { setError(null); setReloadKey(value => value + 1) }}>Poskusi znova</button></div>
        : <p className="form-note">Nalaganje …</p>}
    </section>
  )
}

function CollectionEditor({ detail }: { detail: CollectionDetail }) {
  const navigate = useNavigate()
  const [draft, setDraft] = useState(() => structuredClone(toDraft(detail)))
  const [errors, setErrors] = useState<CollectionErrors | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(toDraft(detail))
  const { blocker, allowNavigation } = useUnsavedChanges(hasChanges)

  function changeDraft(next: Collection) {
    setDraft(next)
    if (errors) setErrors(validateCollection(next))
    setSaveError(null)
  }

  function addQuestion() {
    const question: Question = {
      question: '',
      possibleAnswers: ['', '', ''],
      answer: '',
    }
    const questions = [...draft.questions, question]
    changeDraft({ ...draft, questions })
    requestAnimationFrame(() => document.getElementById(`question-${questions.length - 1}-text`)?.focus())
  }

  function removeQuestion(index: number) {
    const questions = draft.questions.filter((_, i) => i !== index)
    changeDraft({ ...draft, questions })
    requestAnimationFrame(() => {
      const nextIndex = Math.min(index, questions.length - 1)
      const target = nextIndex >= 0
        ? document.getElementById(`question-${nextIndex}-text`)
        : formRef.current?.querySelector<HTMLElement>('.add-question-button')
      target?.focus()
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateCollection(draft)
    setErrors(nextErrors)
    setSaveError(null)
    if (hasValidationErrors(nextErrors)) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], .questions-error')?.focus())
      return
    }
    setSaving(true)
    try {
      const trimmed = trimCollection(draft)
      await updateCollection(detail.id, {
        name: trimmed.name,
        subject: trimmed.subject,
        grade: detail.grade,
        description: trimmed.description,
        gameId: detail.gameId,
        questions: trimmed.questions.map(question => ({
          question: question.question,
          hint: null,
          possibleAnswers: question.possibleAnswers,
          answer: question.answer,
        })),
      })
      allowNavigation()
      navigate('/teachers')
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        navigate('/teachers/login', { replace: true })
        return
      }
      setSaveError(error instanceof Error ? error.message : 'Zbirke ni mogoče shraniti.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="editor-page" aria-labelledby="editor-title">
      <Link className="back-link" to="/teachers"><span aria-hidden="true">←</span> Moje zbirke</Link>
      <h1 id="editor-title">Uredi zbirko</h1>
      <form ref={formRef} className="editor-form" onSubmit={handleSubmit} noValidate>
        <CollectionMetadataFields metadata={draft} errors={errors ?? {}} onChange={metadata => changeDraft({ ...draft, ...metadata })} />
        <div className="question-list">
          {draft.questions.map((question, index) => (
            <QuestionEditor key={index} question={question} index={index} errors={errors?.questionErrors[index]}
              onChange={updated => changeDraft({ ...draft, questions: draft.questions.map((item, i) => i === index ? updated : item) })}
              onRemove={() => removeQuestion(index)} />
          ))}
        </div>
        {draft.questions.length === 0 && <p className="form-note">Zbirka še nima vprašanj.</p>}
        {errors?.questions && <p className="field-error questions-error" tabIndex={-1}>{errors.questions}</p>}
        <button className="button secondary-button add-question-button" type="button" onClick={addQuestion}><span aria-hidden="true">＋</span> Dodaj vprašanje</button>
        {errors && hasValidationErrors(errors) && <p className="field-error validation-summary" role="alert">Preveri označena polja. Spremembe še niso shranjene.</p>}
        {saveError && <p className="error-message save-error" role="alert">{saveError}</p>}
        <div className="form-actions editor-actions">
          <button className="button" type="submit" disabled={saving}>{saving ? 'Shranjujem …' : 'Shrani'}</button>
          <Link className="button secondary-button" to="/teachers">Prekliči</Link>
        </div>
      </form>
      {blocker.state === 'blocked' && <UnsavedChangesDialog onStay={() => blocker.reset()} onLeave={() => blocker.proceed()} />}
    </section>
  )
}

export default function CollectionEditorPage() {
  const { collectionId } = useParams()
  return <EditorLoader key={collectionId} collectionId={collectionId ?? ''} />
}
