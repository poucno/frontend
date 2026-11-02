import type { Collection } from '../types/collection'

export const DEFAULT_COLLECTION: Collection = {
  id: 'default',
  name: 'Poštevanka',
  subject: 'matematika',
  grade: 5,
  description: '',
  gameId: 'falling_objects',
  questions: [
    {
      question: 'Koliko je 6 × 4?',
      possibleAnswers: ['24', '18', '30','15'],
      answer: '24',
    },
    {
      question: 'Koliko je 7 × 8?',
      possibleAnswers: ['48', '56', '64','12','71'],
      answer: '56',
    },
    {
      question: 'Koliko je 9 × 3?',
      possibleAnswers: ['21', '24', '27'],
      answer: '27',
    },
    {
      question: 'Koliko je 5 × 9?',
      possibleAnswers: ['40', '45', '54'],
      answer: '45',
    },
    {
      question: 'Koliko je 12 × 4?',
      possibleAnswers: ['44', '52', '48'],
      answer: '48',
    },
  ],
}
