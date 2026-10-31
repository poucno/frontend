import type { Collection, CollectionMetadata, QuestionSet } from '../types/collection'

export const COLLECTION_LIMITS = { title: 80, question: 200, answer: 40, hint: 200 }

export type MetadataErrors = { title?: string; subject?: string; grade?: string }
export type QuestionErrors = {
  id?: string
  text?: string
  answers: string[]
  answerCount?: string
  correctAnswerId?: string
  hint?: string
}
export type QuestionSetErrors = MetadataErrors & {
  settings?: string
  questions?: string
  questionErrors: QuestionErrors[]
}

export function validateMetadata(metadata: CollectionMetadata): MetadataErrors {
  const errors: MetadataErrors = {}
  if (!metadata.title.trim()) errors.title = 'Vnesi naslov zbirke.'
  else if (metadata.title.trim().length > COLLECTION_LIMITS.title) errors.title = 'Naslov je lahko dolg največ 80 znakov.'
  if (!metadata.subject.trim()) errors.subject = 'Vnesi predmet.'
  if (!Number.isInteger(metadata.grade) || metadata.grade < 1 || metadata.grade > 9) errors.grade = 'Izberi razred od 1 do 9.'
  return errors
}

export function validateQuestionSet(collection: QuestionSet): QuestionSetErrors {
  const errors: QuestionSetErrors = { ...validateMetadata(collection), questionErrors: [] }
  if (typeof collection.settings.shuffleQuestions !== 'boolean' || typeof collection.settings.movingBalloons !== 'boolean') {
    errors.settings = 'Nastavitvi morata biti vključeni ali izključeni.'
  }
  if (collection.questions.length === 0) errors.questions = 'Dodaj najmanj eno vprašanje.'

  errors.questionErrors = collection.questions.map(question => {
    const questionErrors: QuestionErrors = { answers: [] }
    if (!question.id.trim() || collection.questions.filter(item => item.id === question.id).length > 1) {
      questionErrors.id = 'Vprašanje mora imeti svoj neprazen identifikator.'
    }
    if (!question.text.trim()) questionErrors.text = 'Vnesi vprašanje.'
    else if (question.text.trim().length > COLLECTION_LIMITS.question) questionErrors.text = 'Vprašanje je lahko dolgo največ 200 znakov.'
    if (question.answers.length !== 3) questionErrors.answerCount = 'Vprašanje mora imeti natanko tri odgovore.'
    const answerTexts = question.answers.map(answer => answer.text.trim())
    questionErrors.answers = question.answers.map(answer => {
      if (!answer.id.trim() || question.answers.filter(item => item.id === answer.id).length > 1) return 'Odgovor mora imeti svoj neprazen identifikator.'
      if (!answer.text.trim()) return 'Vnesi odgovor.'
      if (answer.text.trim().length > COLLECTION_LIMITS.answer) return 'Odgovor je lahko dolg največ 40 znakov.'
      if (answerTexts.filter(text => text === answer.text.trim()).length > 1) return 'Odgovori morajo biti različni.'
      return ''
    })
    if (!question.answers.some(answer => answer.id === question.correctAnswerId)) {
      questionErrors.correctAnswerId = 'Izberi en pravilen odgovor.'
    }
    if ((question.hint?.trim().length ?? 0) > COLLECTION_LIMITS.hint) questionErrors.hint = 'Namig je lahko dolg največ 200 znakov.'
    return questionErrors
  })
  return errors
}

export function hasValidationErrors(errors: QuestionSetErrors): boolean {
  return !!(errors.title || errors.subject || errors.grade || errors.settings || errors.questions
    || errors.questionErrors.some(question => question.id || question.text || question.answerCount
      || question.correctAnswerId || question.hint || question.answers.some(error => error !== '')))
}

export function trimCollection(collection: Collection): Collection {
  return {
    ...collection,
    title: collection.title.trim(),
    subject: collection.subject.trim(),
    questions: collection.questions.map(question => ({
      ...question,
      text: question.text.trim(),
      // Mapping preserves the existing three positions and stable answer IDs.
      answers: question.answers.map(answer => ({ ...answer, text: answer.text.trim() })) as typeof question.answers,
      hint: question.hint?.trim() || undefined,
    })),
  }
}
