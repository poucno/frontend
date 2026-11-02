import type { Question } from '../types/collection'

export type GameQuestion = Question

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
