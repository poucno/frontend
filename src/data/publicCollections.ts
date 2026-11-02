import type { Collection } from '../types/collection'

export const PUBLIC_TOPICS = ['matematika', 'angleščina', 'slovenščina']

export const SUBJECT_IMAGES: Record<string, string> = {
  matematika: '/subjects/matematika.svg',
  angleščina: '/subjects/anglescina.svg',
  slovenščina: '/subjects/slovenscina.svg',
  naravoslovje: '/subjects/naravoslovje.svg',
  geografija: '/subjects/geografija.svg',
}

export const PUBLIC_COLLECTIONS: Collection[] = [
  {
    id: 'P1',
    name: 'Poštevanka',
    subject: 'matematika',
    grade: 5,
    description: '',
    gameId: 'falling_objects',
    questions: [
      { question: 'Koliko je 6 × 4?', possibleAnswers: ['24', '18', '30'], answer: '24' },
      { question: 'Koliko je 7 × 8?', possibleAnswers: ['48', '56', '64'], answer: '56' },
      { question: 'Koliko je 9 × 3?', possibleAnswers: ['21', '24', '27'], answer: '27' },
      { question: 'Koliko je 5 × 9?', possibleAnswers: ['40', '45', '54'], answer: '45' },
      { question: 'Koliko je 12 × 4?', possibleAnswers: ['44', '52', '48'], answer: '48' },
    ],
  },
  {
    id: 'P2',
    name: 'Seštevanje in odštevanje',
    subject: 'matematika',
    grade: 5,
    description: '',
    gameId: 'falling_objects',
    questions: [
      { question: 'Koliko je 15 + 27?', possibleAnswers: ['32', '42', '52'], answer: '42' },
      { question: 'Koliko je 84 − 37?', possibleAnswers: ['47', '53', '41'], answer: '47' },
      { question: 'Koliko je 56 + 19?', possibleAnswers: ['65', '75', '85'], answer: '75' },
      { question: 'Koliko je 100 − 48?', possibleAnswers: ['48', '52', '62'], answer: '52' },
      { question: 'Koliko je 38 + 46?', possibleAnswers: ['74', '84', '94'], answer: '84' },
    ],
  },
  {
    id: 'P3',
    name: 'Vesolje',
    subject: 'naravoslovje',
    grade: 5,
    description: '',
    gameId: 'falling_objects',
    questions: [
      { question: 'Kateri planet je najbližje Soncu?', possibleAnswers: ['Merkur', 'Venera', 'Zemlja'], answer: 'Merkur' },
      { question: 'Kateri planet je znan kot rdeči planet?', possibleAnswers: ['Mars', 'Jupiter', 'Neptun'], answer: 'Mars' },
      { question: 'Kako se imenuje naša galaksija?', possibleAnswers: ['Rimska cesta', 'Andromeda', 'Orion'], answer: 'Rimska cesta' },
      { question: 'Koliko planetov ima Osončje?', possibleAnswers: ['8', '7', '9'], answer: '8' },
      { question: 'Kateri planet je največji?', possibleAnswers: ['Jupiter', 'Saturn', 'Uran'], answer: 'Jupiter' },
    ],
  },
  {
    id: 'P4',
    name: 'Živali',
    subject: 'naravoslovje',
    grade: 5,
    description: '',
    gameId: 'falling_objects',
    questions: [
      { question: 'Katera žival je največja na svetu?', possibleAnswers: ['Modri kit', 'Slon', 'Žirafa'], answer: 'Modri kit' },
      { question: 'Katera ptica ne leti in živi na Antarktiki?', possibleAnswers: ['Pingvin', 'Noj', 'Orel'], answer: 'Pingvin' },
      { question: 'Koliko nog ima pajek?', possibleAnswers: ['8', '6', '10'], answer: '8' },
      { question: 'Katera žival je znana kot ladja puščave?', possibleAnswers: ['Kamela', 'Konj', 'Lama'], answer: 'Kamela' },
      { question: 'Katera je najhitrejša kopenska žival?', possibleAnswers: ['Gepard', 'Lev', 'Konj'], answer: 'Gepard' },
    ],
  },
  {
    id: 'P5',
    name: 'Geografija',
    subject: 'geografija',
    grade: 5,
    description: '',
    gameId: 'falling_objects',
    questions: [
      { question: 'Katero je glavno mesto Francije?', possibleAnswers: ['Pariz', 'Rim', 'Madrid'], answer: 'Pariz' },
      { question: 'Katera je najdaljša reka na svetu?', possibleAnswers: ['Nil', 'Amazonka', 'Donava'], answer: 'Nil' },
      { question: 'Na kateri celini je Mount Everest?', possibleAnswers: ['Azija', 'Evropa', 'Afrika'], answer: 'Azija' },
      { question: 'Kateri je največji ocean?', possibleAnswers: ['Tihi ocean', 'Atlantski ocean', 'Indijski ocean'], answer: 'Tihi ocean' },
      { question: 'Katero je glavno mesto Italije?', possibleAnswers: ['Rim', 'Milano', 'Benetke'], answer: 'Rim' },
    ],
  },
  {
    id: 'P6',
    name: 'Angleščina – besede',
    subject: 'angleščina',
    grade: 5,
    description: '',
    gameId: 'falling_objects',
    questions: [
      { question: 'Kako se v angleščini reče »hiša«?', possibleAnswers: ['house', 'horse', 'mouse'], answer: 'house' },
      { question: 'Kako se v angleščini reče »pes«?', possibleAnswers: ['dog', 'cat', 'bird'], answer: 'dog' },
      { question: 'Kako se v angleščini reče »knjiga«?', possibleAnswers: ['book', 'table', 'chair'], answer: 'book' },
      { question: 'Kako se v angleščini reče »voda«?', possibleAnswers: ['water', 'fire', 'air'], answer: 'water' },
      { question: 'Kako se v angleščini reče »šola«?', possibleAnswers: ['school', 'shop', 'street'], answer: 'school' },
    ],
  },
  {
    id: 'P7',
    name: 'Slovenščina – besedne vrste',
    subject: 'slovenščina',
    grade: 5,
    description: '',
    gameId: 'falling_objects',
    questions: [
      { question: 'Katera beseda je samostalnik?', possibleAnswers: ['miza', 'teči', 'lep'], answer: 'miza' },
      { question: 'Katera beseda je glagol?', possibleAnswers: ['peti', 'hiša', 'rdeč'], answer: 'peti' },
      { question: 'Katera beseda je pridevnik?', possibleAnswers: ['rdeč', 'miza', 'teči'], answer: 'rdeč' },
      { question: 'Katera beseda je samostalnik?', possibleAnswers: ['sonce', 'skakati', 'vesel'], answer: 'sonce' },
      { question: 'Katera beseda je glagol?', possibleAnswers: ['pisati', 'knjiga', 'moder'], answer: 'pisati' },
    ],
  },
]

export function findPublicCollection(id: string | undefined): Collection | undefined {
  if (!id || !id.startsWith('P')) return undefined
  return PUBLIC_COLLECTIONS.find(collection => collection.id === id)
}

function normalizeSubject(subject: string): string {
  return subject.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

const SUBJECT_IMAGE_LOOKUP: Record<string, string> = Object.fromEntries(
  Object.entries(SUBJECT_IMAGES).map(([subject, image]) => [normalizeSubject(subject), image]),
)

export function subjectImage(subject: string): string | undefined {
  return SUBJECT_IMAGE_LOOKUP[normalizeSubject(subject)]
}
