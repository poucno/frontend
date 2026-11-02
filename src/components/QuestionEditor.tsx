import type { Question } from '../types/collection'
import { BalloonIcon } from './Decorations'
import type { BalloonName } from './Decorations'
import { COLLECTION_LIMITS } from '../data/collectionValidation'
import type { QuestionErrors } from '../data/collectionValidation'

const TONES: BalloonName[] = ['coral', 'yellow', 'blue']

type QuestionEditorProps = {
  question: Question
  index: number
  errors?: QuestionErrors
  onChange: (question: Question) => void
  onRemove: () => void
}

export default function QuestionEditor({ question, index, errors, onChange, onRemove }: QuestionEditorProps) {
  const prefix = `question-${index}`

  function changeAnswer(answerIndex: number, text: string) {
    const previous = question.possibleAnswers[answerIndex] ?? ''
    const possibleAnswers = question.possibleAnswers.map((answer, i) => i === answerIndex ? text : answer)
    const answer = question.answer === previous ? text : question.answer
    onChange({ ...question, possibleAnswers, answer })
  }

  function addAnswer() {
    if (question.possibleAnswers.length >= COLLECTION_LIMITS.maxAnswers) return
    onChange({ ...question, possibleAnswers: [...question.possibleAnswers, ''] })
  }

  function removeAnswer(answerIndex: number) {
    if (question.possibleAnswers.length <= COLLECTION_LIMITS.minAnswers) return
    const removed = question.possibleAnswers[answerIndex]
    const possibleAnswers = question.possibleAnswers.filter((_, i) => i !== answerIndex)
    const answer = question.answer === removed ? '' : question.answer
    onChange({ ...question, possibleAnswers, answer })
  }

  return (
    <fieldset className="question-card">
      <legend>Vprašanje {index + 1}</legend>
      <button className="question-remove" type="button" onClick={onRemove} aria-label={`Odstrani vprašanje ${index + 1}`}>Odstrani</button>
      <div className="form-field question-text-field">
        <label htmlFor={`${prefix}-text`}>Vprašanje</label>
        <textarea id={`${prefix}-text`} rows={2} value={question.question} onChange={event => onChange({ ...question, question: event.target.value })} required maxLength={COLLECTION_LIMITS.question} placeholder="Koliko je 6 × 4?" aria-invalid={!!errors?.question} aria-describedby={errors?.question ? `${prefix}-text-error` : undefined} />
        {errors?.question && <p id={`${prefix}-text-error`} className="field-error">{errors.question}</p>}
      </div>
      <fieldset className="answer-fields" aria-describedby={`${prefix}-answer-help${errors?.answer ? ` ${prefix}-answer-error` : ''}`}>
        <legend>Možni odgovori</legend>
        <p id={`${prefix}-answer-help`} className="answer-help">Označi pravilen odgovor.</p>
        {errors?.answerCount && <p className="field-error">{errors.answerCount}</p>}
        {question.possibleAnswers.map((possibleAnswer, answerIndex) => {
          const isCorrect = question.answer === possibleAnswer && possibleAnswer !== ''
          const tone = TONES[answerIndex % TONES.length] ?? 'blue'
          return (
            <div className="answer-row" key={answerIndex} data-tone={tone}>
              <label className="correct-answer-label">
                <input type="radio" name={`${prefix}-correct`} value={possibleAnswer} checked={isCorrect} onChange={() => onChange({ ...question, answer: possibleAnswer })} aria-invalid={!!errors?.answer} />
                <BalloonIcon className="balloon-radio" tone={tone} mood={isCorrect ? 'happy' : 'calm'} />
                <span className="sr-only">Pravilen odgovor {answerIndex + 1} za vprašanje {index + 1}</span>
              </label>
              <div className="form-field">
                <label className="sr-only" htmlFor={`${prefix}-answer-${answerIndex}`}>Odgovor {answerIndex + 1} za vprašanje {index + 1}</label>
                <input id={`${prefix}-answer-${answerIndex}`} value={possibleAnswer} onChange={event => changeAnswer(answerIndex, event.target.value)} required maxLength={COLLECTION_LIMITS.answer} placeholder={`Odgovor ${answerIndex + 1}`} aria-invalid={!!errors?.possibleAnswers[answerIndex]} aria-describedby={errors?.possibleAnswers[answerIndex] ? `${prefix}-answer-${answerIndex}-error` : undefined} />
                {errors?.possibleAnswers[answerIndex] && <p id={`${prefix}-answer-${answerIndex}-error`} className="field-error">{errors.possibleAnswers[answerIndex]}</p>}
              </div>
              {question.possibleAnswers.length > COLLECTION_LIMITS.minAnswers && (
                <button className="answer-remove" type="button" onClick={() => removeAnswer(answerIndex)} aria-label={`Odstrani odgovor ${answerIndex + 1}`}>×</button>
              )}
            </div>
          )
        })}
        {question.possibleAnswers.length < COLLECTION_LIMITS.maxAnswers && (
          <button className="button secondary-button add-answer-button" type="button" onClick={addAnswer}><span aria-hidden="true">＋</span> Dodaj odgovor</button>
        )}
        {errors?.answer && <p id={`${prefix}-answer-error`} className="field-error">{errors.answer}</p>}
      </fieldset>
    </fieldset>
  )
}
