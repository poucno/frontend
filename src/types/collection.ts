export type Question = {
  question: string
  possibleAnswers: string[]
  answer: string
}

export type Collection = {
  id: string
  name: string
  subject: string
  description: string
  questions: Question[]
}

export type CollectionMetadata = {
  name: string
  subject: string
}
