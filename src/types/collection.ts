export type Answer = {
  id: string
  text: string
}

export type Question = {
  id: string
  text: string
  answers: [Answer, Answer, Answer]
  correctAnswerId: string
  hint?: string
}

export type CollectionMetadata = {
  title: string
  subject: string
  grade: number
}

export type QuestionSet = CollectionMetadata & {
  version: 1
  settings: {
    shuffleQuestions: boolean
    movingBalloons: boolean
  }
  questions: Question[]
}

export type Collection = QuestionSet & { id: string }
