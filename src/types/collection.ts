export type Question = {
  question: string
  possibleAnswers: string[]
  answer: string
  hint?: string | null
}

export type Collection = {
  id: string
  name: string
  subject: string
  grade: number
  description: string
  gameId: string
  questions: Question[]
}

export type CollectionMetadata = {
  name: string
  subject: string
}
