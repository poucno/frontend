import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Collection } from '../types/collection'
import { hasValidationErrors, trimCollection, validateCollection } from './collectionValidation'
import { COLLECTIONS_STORAGE_KEY, readCollections, updateCollection } from './collectionsStorage'

function makeCollection(): Collection {
  return {
    id: 'collection-1',
    name: 'Poštevanka števila 6',
    subject: 'Matematika',
    description: '',
    questions: [{
      question: 'Koliko je 6 × 4?',
      possibleAnswers: ['18', '24', '30'],
      answer: '24',
    }],
  }
}

describe('collection validation', () => {
  it('accepts a valid collection', () => {
    expect(hasValidationErrors(validateCollection(makeCollection()))).toBe(false)
  })

  it('requires at least one question', () => {
    const collection = makeCollection()
    collection.questions = []
    expect(validateCollection(collection).questions).toBeTruthy()
  })

  it('reports empty mandatory fields at the appropriate fields', () => {
    const collection = makeCollection()
    collection.name = ' '
    collection.subject = ' '
    collection.questions[0]!.question = ' '
    collection.questions[0]!.possibleAnswers[0] = ' '
    const errors = validateCollection(collection)
    expect(errors.name).toBeTruthy()
    expect(errors.subject).toBeTruthy()
    expect(errors.questionErrors[0]?.question).toBeTruthy()
    expect(errors.questionErrors[0]?.possibleAnswers[0]).toBeTruthy()
  })

  it('rejects answers that match after trimming spaces', () => {
    const collection = makeCollection()
    collection.questions[0]!.possibleAnswers[0] = ' 24 '
    const errors = validateCollection(collection).questionErrors[0]
    expect(errors?.possibleAnswers[0]).toBeTruthy()
    expect(errors?.possibleAnswers[1]).toBeTruthy()
  })

  it('rejects a correct answer that is not among the options', () => {
    const collection = makeCollection()
    collection.questions[0]!.answer = 'missing'
    expect(validateCollection(collection).questionErrors[0]?.answer).toBeTruthy()
  })

  it('accepts between three and five answers', () => {
    const collection = makeCollection()
    collection.questions[0]!.possibleAnswers.push('36', '42')
    expect(hasValidationErrors(validateCollection(collection))).toBe(false)
  })

  it('rejects more than five answers', () => {
    const collection = makeCollection()
    collection.questions[0]!.possibleAnswers.push('36', '42', '48')
    expect(validateCollection(collection).questionErrors[0]?.answerCount).toBeTruthy()
  })

  it('rejects fewer than three answers', () => {
    const collection = makeCollection()
    collection.questions[0]!.possibleAnswers.pop()
    expect(validateCollection(collection).questionErrors[0]?.answerCount).toBeTruthy()
  })

  it('enforces the documented field length limits', () => {
    const collection = makeCollection()
    collection.name = 'x'.repeat(81)
    collection.questions[0]!.question = 'x'.repeat(201)
    collection.questions[0]!.possibleAnswers[0] = 'x'.repeat(41)
    const errors = validateCollection(collection)
    expect(errors.name).toBeTruthy()
    expect(errors.questionErrors[0]?.question).toBeTruthy()
    expect(errors.questionErrors[0]?.possibleAnswers[0]).toBeTruthy()
  })

  it('preserves the correct answer through changes in answer positions', () => {
    const collection = makeCollection()
    collection.questions[0]!.possibleAnswers.reverse()
    expect(hasValidationErrors(validateCollection(collection))).toBe(false)
    const saved = trimCollection(collection)
    expect(saved.questions[0]?.answer).toBe('24')
    expect(saved.questions[0]?.possibleAnswers).toContain('24')
  })

  it('trims text without mutating the draft or changing the answer', () => {
    const collection = makeCollection()
    collection.name = ' Poštevanka števila 6 '
    collection.questions[0]!.possibleAnswers[1] = ' 24 '
    const original = structuredClone(collection)
    const saved = trimCollection(collection)
    expect(saved.name).toBe('Poštevanka števila 6')
    expect(saved.questions[0]?.possibleAnswers[1]).toBe('24')
    expect(saved.questions[0]?.answer).toBe('24')
    expect(collection).toEqual(original)
  })
})

describe('collection updates', () => {
  let raw = ''
  const storage = {
    getItem: vi.fn((key: string) => key === COLLECTIONS_STORAGE_KEY ? raw : null),
    setItem: vi.fn((key: string, value: string) => { if (key === COLLECTIONS_STORAGE_KEY) raw = value }),
  }

  beforeEach(() => {
    raw = JSON.stringify([makeCollection()])
    storage.getItem.mockReset()
    storage.setItem.mockReset()
    vi.stubGlobal('window', { localStorage: storage })
  })
  afterEach(() => vi.unstubAllGlobals())

  it('updates the requested collection and preserves other collections', () => {
    const original = makeCollection()
    const other = { ...makeCollection(), id: 'collection-2', name: 'Druga zbirka' }
    raw = JSON.stringify([original, other])
    updateCollection({ ...original, name: ' Nov naslov ' }, original)
    expect(readCollections()[0]?.name).toBe('Nov naslov')
    expect(readCollections()[1]).toEqual(other)
    expect(original.name).toBe('Poštevanka števila 6')
  })

  it('rejects invalid edits before writing', () => {
    const original = makeCollection()
    const edited = structuredClone(original)
    edited.questions[0]!.answer = 'missing'
    expect(() => updateCollection(edited, original)).toThrow()
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it('reports write failure and retains the saved data', () => {
    const original = makeCollection()
    storage.setItem.mockImplementation(() => { throw new Error('Quota exceeded') })
    expect(() => updateCollection({ ...original, name: 'Nov naslov' }, original)).toThrow('niso shranjene')
    expect(readCollections()).toEqual([original])
  })

  it('does not overwrite changes from another tab', () => {
    const original = makeCollection()
    const newer = { ...original, name: 'Novejši naslov' }
    raw = JSON.stringify([newer])
    expect(() => updateCollection({ ...original, name: 'Moj naslov' }, original)).toThrow('drugem zavihku')
    expect(storage.setItem).not.toHaveBeenCalled()
    expect(readCollections()).toEqual([newer])
  })

  it('does not recreate a collection deleted during editing', () => {
    raw = '[]'
    expect(() => updateCollection(makeCollection(), makeCollection())).toThrow('ni več na voljo')
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it('does not overwrite damaged storage', () => {
    raw = '{broken json'
    expect(() => updateCollection(makeCollection(), makeCollection())).toThrow('poškodovane')
    expect(storage.setItem).not.toHaveBeenCalled()
    expect(raw).toBe('{broken json')
  })
})
