import type { Answer, Collection, Question } from '../types/collection'
import { hasValidationErrors, trimCollection, validateQuestionSet } from './collectionValidation'

export const COLLECTIONS_STORAGE_KEY = 'otok-znanja.collections.v1'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isAnswer(value: unknown): value is Answer {
  return isObject(value) && typeof value.id === 'string' && value.id.trim() !== '' && typeof value.text === 'string'
}

function isQuestion(value: unknown): value is Question {
  return isObject(value)
    && typeof value.id === 'string' && value.id.trim() !== ''
    && typeof value.text === 'string'
    && Array.isArray(value.answers) && value.answers.length === 3 && value.answers.every(isAnswer)
    && new Set(value.answers.map(answer => answer.id)).size === 3
    && typeof value.correctAnswerId === 'string'
    && value.answers.some(answer => answer.id === value.correctAnswerId)
    && (value.hint === undefined || typeof value.hint === 'string')
}

// Check stored data before using it; empty question arrays are local drafts.
function isCollection(value: unknown): value is Collection {
  return isObject(value)
    && typeof value.id === 'string' && value.id.trim() !== ''
    && value.version === 1
    && typeof value.title === 'string' && value.title.trim() !== '' && value.title.length <= 80
    && typeof value.subject === 'string' && value.subject.trim() !== ''
    && typeof value.grade === 'number' && Number.isInteger(value.grade) && value.grade >= 1 && value.grade <= 9
    && isObject(value.settings)
    && typeof value.settings.shuffleQuestions === 'boolean'
    && typeof value.settings.movingBalloons === 'boolean'
    && Array.isArray(value.questions) && value.questions.every(isQuestion)
    && new Set(value.questions.map(question => question.id)).size === value.questions.length
}

export function readCollections(): Collection[] {
  let raw: string | null
  try {
    raw = window.localStorage.getItem(COLLECTIONS_STORAGE_KEY)
  } catch {
    throw new Error('Zbirk ni mogoče prebrati. Preveri, ali brskalnik dovoljuje lokalno shranjevanje, in poskusi znova.')
  }
  if (raw === null) return []

  const damagedDataMessage = 'Shranjene zbirke so poškodovane ali v nepodprti obliki. Obstoječi podatki so ohranjeni.'
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    throw new Error(damagedDataMessage)
  }
  if (!Array.isArray(data) || !data.every(isCollection)
    || new Set(data.map(collection => collection.id)).size !== data.length) {
    throw new Error(damagedDataMessage)
  }
  return data
}

function writeCollections(collections: Collection[]): void {
  try {
    window.localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(collections))
  } catch {
    throw new Error('Zbirk ni mogoče shraniti. Preveri prostor in dovoljenja brskalnika ter poskusi znova. Spremembe niso shranjene.')
  }
}

export function createCollection(details: { title: string; subject: string; grade: number }): void {
  // Re-read before each change so damaged or newer data is never overwritten.
  const collections = readCollections()
  const collection: Collection = {
    id: crypto.randomUUID(),
    version: 1,
    title: details.title.trim(),
    subject: details.subject.trim(),
    grade: details.grade,
    settings: { shuffleQuestions: true, movingBalloons: true },
    questions: [],
  }
  if (!isCollection(collection)) throw new Error('Podatki zbirke niso veljavni. Preveri naslov, predmet in razred.')
  writeCollections([...collections, collection])
}

export function deleteCollection(id: string): Collection[] {
  const collections = readCollections()
  const remaining = collections.filter(collection => collection.id !== id)
  if (remaining.length !== collections.length) writeCollections(remaining)
  return remaining
}

export function updateCollection(collection: Collection, original: Collection): void {
  const collections = readCollections()
  const current = collections.find(item => item.id === collection.id)
  if (!current) throw new Error('Zbirka ni več na voljo. Tvoji vnosi ostajajo v obrazcu.')
  if (JSON.stringify(current) !== JSON.stringify(original)) {
    throw new Error('Zbirka je bila med urejanjem spremenjena v drugem zavihku. Novejši podatki niso prepisani; tvoji vnosi ostajajo v obrazcu.')
  }
  if (hasValidationErrors(validateQuestionSet(collection))) throw new Error('Zbirka vsebuje napake. Preveri označena polja.')
  writeCollections(collections.map(item => item.id === collection.id ? trimCollection(collection) : item))
}
