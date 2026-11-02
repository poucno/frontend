import type { Collection, CollectionMetadata, Question } from '../types/collection'
import { COLLECTION_LIMITS, hasValidationErrors, trimCollection, validateCollection } from './collectionValidation'

export const COLLECTIONS_STORAGE_KEY = 'otok-znanja.collections.v2'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isQuestion(value: unknown): value is Question {
  if (!isObject(value)) return false
  if (typeof value.question !== 'string') return false
  if (!Array.isArray(value.possibleAnswers)) return false
  if (value.possibleAnswers.length < COLLECTION_LIMITS.minAnswers || value.possibleAnswers.length > COLLECTION_LIMITS.maxAnswers) return false
  if (!value.possibleAnswers.every(answer => typeof answer === 'string')) return false
  const possibleAnswers: string[] = value.possibleAnswers
  if (new Set(possibleAnswers.map(answer => answer.trim())).size !== possibleAnswers.length) return false
  if (typeof value.answer !== 'string') return false
  if (value.hint !== undefined && value.hint !== null && typeof value.hint !== 'string') return false
  const answer = value.answer
  return possibleAnswers.some(possibleAnswer => possibleAnswer.trim() === answer.trim())
}

function isCollection(value: unknown): value is Collection {
  if (!isObject(value)) return false
  if (typeof value.id !== 'string' || value.id.trim() === '') return false
  if (typeof value.name !== 'string' || value.name.trim() === '' || value.name.length > COLLECTION_LIMITS.name) return false
  if (typeof value.subject !== 'string' || value.subject.trim() === '') return false
  if (typeof value.grade !== 'number' || !Number.isInteger(value.grade) || value.grade < 1 || value.grade > 9) return false
  if (typeof value.gameId !== 'string' || value.gameId.trim() === '') return false
  if (typeof value.description !== 'string') return false
  return Array.isArray(value.questions) && value.questions.every(isQuestion)
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

export function createCollection(details: CollectionMetadata & { grade: number; gameId: string }): void {
  const collections = readCollections()
  const collection: Collection = {
    id: crypto.randomUUID(),
    name: details.name.trim(),
    subject: details.subject.trim(),
    grade: details.grade,
    description: '',
    gameId: details.gameId,
    questions: [],
  }
  if (!isCollection(collection)) throw new Error('Podatki zbirke niso veljavni. Preveri ime in predmet.')
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
  if (hasValidationErrors(validateCollection(collection))) throw new Error('Zbirka vsebuje napake. Preveri označena polja.')
  writeCollections(collections.map(item => item.id === collection.id ? trimCollection(collection) : item))
}
