import type { Collection } from '../types/collection'

export const DEFAULT_COLLECTION: Collection = {
  id: 'default',
  version: 1,
  title: 'Poštevanka',
  subject: 'matematika',
  grade: 5,
  settings: { shuffleQuestions: true, movingBalloons: true },
  questions: [
    {
      id: 'q1',
      text: 'Koliko je 6 × 4?',
      answers: [
        { id: 'a', text: '24' },
        { id: 'b', text: '18' },
        { id: 'c', text: '30' },
      ],
      correctAnswerId: 'a',
    },
    {
      id: 'q2',
      text: 'Koliko je 7 × 8?',
      answers: [
        { id: 'a', text: '48' },
        { id: 'b', text: '56' },
        { id: 'c', text: '64' },
      ],
      correctAnswerId: 'b',
    },
    {
      id: 'q3',
      text: 'Koliko je 9 × 3?',
      answers: [
        { id: 'a', text: '21' },
        { id: 'b', text: '24' },
        { id: 'c', text: '27' },
      ],
      correctAnswerId: 'c',
    },
    {
      id: 'q4',
      text: 'Koliko je 5 × 9?',
      answers: [
        { id: 'a', text: '40' },
        { id: 'b', text: '45' },
        { id: 'c', text: '54' },
      ],
      correctAnswerId: 'b',
    },
    {
      id: 'q5',
      text: 'Koliko je 12 × 4?',
      answers: [
        { id: 'a', text: '44' },
        { id: 'b', text: '52' },
        { id: 'c', text: '48' },
      ],
      correctAnswerId: 'c',
    },
  ],
}
