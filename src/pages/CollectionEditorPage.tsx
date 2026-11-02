import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useUnsavedChanges } from '../hooks/useUnsavedChanges'
import { readCollections, updateCollection } from '../data/collectionsStorage'
import { hasValidationErrors, validateCollection } from '../data/collectionValidation'
import type { CollectionErrors } from '../data/collectionValidation'
import type { Collection, Question } from '../types/collection'
import CollectionMetadataFields from '../components/CollectionMetadataFields'
import QuestionEditor from '../components/QuestionEditor'
import UnsavedChangesDialog from '../components/UnsavedChangesDialog'

function loadCollection(id: string): { collection: Collection | null; error: string | null } {
  try {
    const collection = readCollections().find(item => item.id === id) ?? null
    return { collection, error: collection ? null : 'Ta zbirka ni več na voljo.' }
  } catch (error) {
    return { collection: null, error: error instanceof Error ? error.message : 'Zbirke ni mogoče prebrati.' }
  }
}

function EditorLoader({ collectionId }: { collectionId: string }) {
  const [loaded, setLoaded] = useState(() => loadCollection(collectionId))
  if (loaded.collection) return <CollectionEditor initialCollection={loaded.collection} />
  return (
    <section className="editor-page">
      <Link className="back-link" to="/teachers"><span aria-hidden="true">←</span> Moje zbirke</Link>
      <h1>Uredi zbirko</h1>
      <div className="error-message" role="alert"><p>{loaded.error}</p><button className="button secondary-button" onClick={() => setLoaded(loadCollection(collectionId))}>Poskusi znova</button></div>
    </section>
  )
}

function CollectionEditor({ initialCollection }: { initialCollection: Collection }) {
  const navigate = useNavigate()
  const [draft, setDraft] = useState(() => structuredClone(initialCollection))
  const [errors, setErrors] = useState<CollectionErrors | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(initialCollection)
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateCollection(draft)
    setErrors(nextErrors)
    setSaveError(null)
    if (hasValidationErrors(nextErrors)) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], .questions-error')?.focus())
      return
    }
    try {
      updateCollection(draft, initialCollection)
      allowNavigation()
      navigate('/teachers')
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Zbirke ni mogoče shraniti.')
    }
  }

  return (
    <section className="editor-page" aria-labelledby="editor-title">
      <Link className="back-link" to="/teachers"><span aria-hidden="true">←</span> Moje zbirke</Link>
      <h1 id="editor-title">Uredi zbirko</h1>
      <p className="local-mode">Lokalni način · Zbirke so shranjene samo v tem brskalniku.</p>
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
          <button className="button" type="submit">Shrani</button>
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
