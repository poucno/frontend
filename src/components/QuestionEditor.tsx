import type { Question } from '../types/collection'
import { COLLECTION_LIMITS } from '../data/collectionValidation'
import type { QuestionErrors } from '../data/collectionValidation'

type QuestionEditorProps = {
  question: Question
  index: number
  errors?: QuestionErrors
  onChange: (question: Question) => void
  onRemove: () => void
}

export default function QuestionEditor({ question, index, errors, onChange, onRemove }: QuestionEditorProps) {
  const prefix = `question-${question.id}`

  function changeAnswer(answerIndex: number, text: string) {
    const answer = question.answers[answerIndex]
    if (!answer) return
    const answers: Question['answers'] = [...question.answers]
    answers[answerIndex] = { ...answer, text }
    onChange({ ...question, answers })
  }

  return (
    <fieldset className="question-card">
      <legend>Vprašanje {index + 1}</legend>
      <button className="question-remove" type="button" onClick={onRemove} aria-label={`Odstrani vprašanje ${index + 1}`}>Odstrani</button>
      {errors?.id && <p className="field-error">{errors.id}</p>}
      <div className="form-field question-text-field">
        <label htmlFor={`${prefix}-text`}>Vprašanje</label>
        <textarea id={`${prefix}-text`} rows={2} value={question.text} onChange={event => onChange({ ...question, text: event.target.value })} required maxLength={COLLECTION_LIMITS.question} placeholder="Koliko je 6 × 4?" aria-invalid={!!errors?.text} aria-describedby={errors?.text ? `${prefix}-text-error` : undefined} />
        {errors?.text && <p id={`${prefix}-text-error`} className="field-error">{errors.text}</p>}
      </div>
      <fieldset className="answer-fields" aria-describedby={`${prefix}-answer-help${errors?.correctAnswerId ? ` ${prefix}-correct-error` : ''}`}>
        <legend>Možni odgovori</legend>
        <p id={`${prefix}-answer-help`} className="answer-help">Označi pravilen odgovor.</p>
        {errors?.answerCount && <p className="field-error">{errors.answerCount}</p>}
        {question.answers.map((answer, answerIndex) => (
          <div className="answer-row" key={answer.id}>
            <label className="correct-answer-label">
              <input type="radio" name={`${prefix}-correct`} value={answer.id} checked={question.correctAnswerId === answer.id} onChange={() => onChange({ ...question, correctAnswerId: answer.id })} aria-invalid={!!errors?.correctAnswerId} />
              <span className="sr-only">Pravilen odgovor {answerIndex + 1} za vprašanje {index + 1}</span>
            </label>
            <div className="form-field">
              <label className="sr-only" htmlFor={`${prefix}-answer-${answer.id}`}>Odgovor {answerIndex + 1} za vprašanje {index + 1}</label>
              <input id={`${prefix}-answer-${answer.id}`} value={answer.text} onChange={event => changeAnswer(answerIndex, event.target.value)} required maxLength={COLLECTION_LIMITS.answer} placeholder={`Odgovor ${answerIndex + 1}`} aria-invalid={!!errors?.answers[answerIndex]} aria-describedby={errors?.answers[answerIndex] ? `${prefix}-answer-${answer.id}-error` : undefined} />
              {errors?.answers[answerIndex] && <p id={`${prefix}-answer-${answer.id}-error`} className="field-error">{errors.answers[answerIndex]}</p>}
            </div>
          </div>
        ))}
        {errors?.correctAnswerId && <p id={`${prefix}-correct-error`} className="field-error">{errors.correctAnswerId}</p>}
      </fieldset>
      <div className="form-field">
        <label htmlFor={`${prefix}-hint`}>Namig <span className="optional-label">(neobvezno)</span></label>
        <input id={`${prefix}-hint`} value={question.hint ?? ''} onChange={event => onChange({ ...question, hint: event.target.value || undefined })} maxLength={COLLECTION_LIMITS.hint} placeholder="Pomagaj si: 6 + 6 + 6 + 6." aria-invalid={!!errors?.hint} aria-describedby={errors?.hint ? `${prefix}-hint-error` : undefined} />
        {errors?.hint && <p id={`${prefix}-hint-error`} className="field-error">{errors.hint}</p>}
      </div>
    </fieldset>
  )
}
