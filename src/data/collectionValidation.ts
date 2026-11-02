import type { Collection, CollectionMetadata, Question } from '../types/collection'

export const COLLECTION_LIMITS = { name: 80, question: 200, answer: 40, minAnswers: 3, maxAnswers: 5 }

export type MetadataErrors = { name?: string; subject?: string }
export type QuestionErrors = {
  question?: string
  possibleAnswers: string[]
  answerCount?: string
  answer?: string
}
export type CollectionErrors = MetadataErrors & {
  questions?: string
  questionErrors: QuestionErrors[]
}

export function validateMetadata(metadata: CollectionMetadata): MetadataErrors {
  const errors: MetadataErrors = {}
  if (!metadata.name.trim()) errors.name = 'Vnesi ime zbirke.'
  else if (metadata.name.trim().length > COLLECTION_LIMITS.name) errors.name = 'Ime je lahko dolgo največ 80 znakov.'
  if (!metadata.subject.trim()) errors.subject = 'Vnesi predmet.'
  return errors
}

export function validateCollection(collection: Collection): CollectionErrors {
  const errors: CollectionErrors = { ...validateMetadata(collection), questionErrors: [] }
  if (collection.questions.length === 0) errors.questions = 'Dodaj najmanj eno vprašanje.'

  errors.questionErrors = collection.questions.map(question => validateQuestion(question))
  return errors
}

function validateQuestion(question: Question): QuestionErrors {
  const errors: QuestionErrors = { possibleAnswers: [] }

  if (!question.question.trim()) errors.question = 'Vnesi vprašanje.'
  else if (question.question.trim().length > COLLECTION_LIMITS.question) errors.question = 'Vprašanje je lahko dolgo največ 200 znakov.'

  if (question.possibleAnswers.length < COLLECTION_LIMITS.minAnswers || question.possibleAnswers.length > COLLECTION_LIMITS.maxAnswers) {
    errors.answerCount = 'Vprašanje mora imeti od 3 do 5 odgovorov.'
  }

  const answers = question.possibleAnswers.map(answer => answer.trim())
  errors.possibleAnswers = answers.map(answer => {
    if (!answer) return 'Vnesi odgovor.'
    if (answer.length > COLLECTION_LIMITS.answer) return 'Odgovor je lahko dolg največ 40 znakov.'
    if (answers.filter(other => other === answer).length > 1) return 'Odgovori morajo biti različni.'
    return ''
  })

  if (!question.answer.trim() || !answers.includes(question.answer.trim())) {
    errors.answer = 'Izberi pravilen odgovor.'
  }

  return errors
}

export function hasValidationErrors(errors: CollectionErrors): boolean {
  return !!(errors.name || errors.subject || errors.questions
    || errors.questionErrors.some(question => question.question || question.answerCount || question.answer
      || question.possibleAnswers.some(error => error !== '')))
}

export function trimCollection(collection: Collection): Collection {
  return {
    ...collection,
    name: collection.name.trim(),
    subject: collection.subject.trim(),
    description: collection.description.trim(),
    questions: collection.questions.map(question => ({
      question: question.question.trim(),
      possibleAnswers: question.possibleAnswers.map(answer => answer.trim()),
      answer: question.answer.trim(),
      hint: question.hint?.trim() || undefined,
    })),
  }
}
