import type { Collection, Question } from '../types/collection'

export type GameQuestion = {
  question: string
  possibleAnswers: string[]
  answer: string
}

export type GameResult = {
  score: number
  correct: number
  wrong: number
  missed: number
  totalQuestions: number
  durationMs: number
}

export type ParentToGame = {
  type: 'start'
  questions: GameQuestion[]
}

export type GameToParent =
  | { type: 'ready' }
  | { type: 'result'; payload: GameResult }

function toGameQuestion(question: Question): GameQuestion {
  const correct = question.answers.find(answer => answer.id === question.correctAnswerId)
  if (!correct) throw new Error(`Question ${question.id} has no valid correct answer`)
  return {
    question: question.text,
    possibleAnswers: question.answers.map(answer => answer.text),
    answer: correct.text,
  }
}

export function toGameQuestions(collection: Collection): GameQuestion[] {
  return collection.questions.map(toGameQuestion)
}
