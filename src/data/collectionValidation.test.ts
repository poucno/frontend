import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Collection } from '../types/collection'
import { hasValidationErrors, trimCollection, validateQuestionSet } from './collectionValidation'
import { COLLECTIONS_STORAGE_KEY, readCollections, updateCollection } from './collectionsStorage'

function makeCollection(): Collection {
  return {
    id: 'collection-1', version: 1, title: 'Poštevanka števila 6', subject: 'Matematika', grade: 3,
    settings: { shuffleQuestions: true, movingBalloons: true },
    questions: [{
      id: 'q1', text: 'Koliko je 6 × 4?',
      answers: [{ id: 'a', text: '18' }, { id: 'b', text: '24' }, { id: 'c', text: '30' }],
      correctAnswerId: 'b', hint: 'Pomagaj si s seštevanjem.',
    }],
  }
}

describe('question set validation', () => {
  it('accepts a valid question set', () => {
    expect(hasValidationErrors(validateQuestionSet(makeCollection()))).toBe(false)
  })

  it('requires at least one question', () => {
    const collection = makeCollection()
    collection.questions = []
    expect(validateQuestionSet(collection).questions).toBeTruthy()
  })

  it('reports empty mandatory fields at the appropriate fields', () => {
    const collection = makeCollection()
    collection.title = ' '
    collection.subject = ' '
    collection.questions[0]!.text = ' '
    collection.questions[0]!.answers[0].text = ' '
    const errors = validateQuestionSet(collection)
    expect(errors.title).toBeTruthy()
    expect(errors.subject).toBeTruthy()
    expect(errors.questionErrors[0]?.text).toBeTruthy()
    expect(errors.questionErrors[0]?.answers[0]).toBeTruthy()
  })

  it('rejects answers that match after trimming spaces', () => {
    const collection = makeCollection()
    collection.questions[0]!.answers[0].text = ' 24 '
    const errors = validateQuestionSet(collection).questionErrors[0]
    expect(errors?.answers[0]).toBeTruthy()
    expect(errors?.answers[1]).toBeTruthy()
  })

  it('rejects an unknown correct-answer ID', () => {
    const collection = makeCollection()
    collection.questions[0]!.correctAnswerId = 'missing'
    expect(validateQuestionSet(collection).questionErrors[0]?.correctAnswerId).toBeTruthy()
  })

  it('rejects duplicate question and answer IDs', () => {
    const collection = makeCollection()
    collection.questions.push(structuredClone(collection.questions[0]!))
    collection.questions[0]!.answers[0].id = 'b'
    const errors = validateQuestionSet(collection)
    expect(errors.questionErrors[0]?.id).toBeTruthy()
    expect(errors.questionErrors[1]?.id).toBeTruthy()
    expect(errors.questionErrors[0]?.answers[0]).toBeTruthy()
    expect(errors.questionErrors[0]?.answers[1]).toBeTruthy()
  })

  it('requires exactly three answers', () => {
    const collection = makeCollection()
    collection.questions[0]!.answers.push({ id: 'd', text: '36' })
    expect(validateQuestionSet(collection).questionErrors[0]?.answerCount).toBeTruthy()
  })

  it('enforces the documented field length limits', () => {
    const collection = makeCollection()
    collection.title = 'x'.repeat(81)
    collection.questions[0]!.text = 'x'.repeat(201)
    collection.questions[0]!.answers[0].text = 'x'.repeat(41)
    collection.questions[0]!.hint = 'x'.repeat(201)
    const errors = validateQuestionSet(collection)
    expect(errors.title).toBeTruthy()
    expect(errors.questionErrors[0]?.text).toBeTruthy()
    expect(errors.questionErrors[0]?.answers[0]).toBeTruthy()
    expect(errors.questionErrors[0]?.hint).toBeTruthy()
  })

  it.each([0, 10, -1, 2.5, NaN])('rejects invalid grade %s', grade => {
    const collection = makeCollection()
    collection.grade = grade
    expect(validateQuestionSet(collection).grade).toBeTruthy()
  })

  it('preserves the correct answer through changes in answer positions', () => {
    const collection = makeCollection()
    collection.questions[0]!.answers.reverse()
    expect(hasValidationErrors(validateQuestionSet(collection))).toBe(false)
    const saved = trimCollection(collection)
    expect(saved.questions[0]?.answers.find(answer => answer.id === saved.questions[0]?.correctAnswerId)?.text).toBe('24')
  })

  it('trims text without mutating the draft or changing IDs and settings', () => {
    const collection = makeCollection()
    collection.title = ' Poštevanka števila 6 '
    collection.questions[0]!.answers[1].text = ' 24 '
    collection.questions[0]!.hint = ' '
    const original = structuredClone(collection)
    const saved = trimCollection(collection)
    expect(saved.title).toBe('Poštevanka števila 6')
    expect(saved.questions[0]?.answers[1]).toEqual({ id: 'b', text: '24' })
    expect(saved.questions[0]?.correctAnswerId).toBe('b')
    expect(saved.questions[0]?.hint).toBeUndefined()
    expect(saved.settings).toEqual(collection.settings)
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
    const other = { ...makeCollection(), id: 'collection-2', title: 'Druga zbirka' }
    raw = JSON.stringify([original, other])
    updateCollection({ ...original, title: ' Nov naslov ' }, original)
    expect(readCollections()[0]?.title).toBe('Nov naslov')
    expect(readCollections()[1]).toEqual(other)
    expect(original.title).toBe('Poštevanka števila 6')
  })

  it('rejects invalid edits before writing', () => {
    const original = makeCollection()
    const edited = structuredClone(original)
    edited.questions[0]!.correctAnswerId = 'missing'
    expect(() => updateCollection(edited, original)).toThrow()
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it('reports write failure and retains the saved data', () => {
    const original = makeCollection()
    storage.setItem.mockImplementation(() => { throw new Error('Quota exceeded') })
    expect(() => updateCollection({ ...original, title: 'Nov naslov' }, original)).toThrow('niso shranjene')
    expect(readCollections()).toEqual([original])
  })

  it('does not overwrite changes from another tab', () => {
    const original = makeCollection()
    const newer = { ...original, title: 'Novejši naslov' }
    raw = JSON.stringify([newer])
    expect(() => updateCollection({ ...original, title: 'Moj naslov' }, original)).toThrow('drugem zavihku')
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
