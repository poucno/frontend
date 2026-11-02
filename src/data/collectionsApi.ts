import { API_BASE, authFetch } from './authApi'

export type CollectionSummary = {
  id: string
  name: string
  subject: string
  grade: number
  gameId: string
  questionCount: number
  updatedAt: string
}

export type QuestionDto = {
  question: string
  hint: string | null
  possibleAnswers: string[]
  answer: string
}

export type CollectionDetail = {
  id: string
  name: string
  subject: string
  grade: number
  description: string
  gameId: string
  createdAt: string
  updatedAt: string
  questions: QuestionDto[]
}

export type CollectionInput = {
  name: string
  subject: string
  grade: number
  description: string
  gameId: string
  questions: QuestionDto[]
}

export class UnauthorizedError extends Error {
  constructor() {
    super('Prijava je potekla. Prijavite se znova.')
  }
}

async function readProblem(response: Response, fallback: string): Promise<string> {
  try {
    const data: unknown = await response.json()
    if (data && typeof data === 'object') {
      const errors = (data as { errors?: Record<string, string[]> }).errors
      const first = errors ? Object.values(errors).flat().find(Boolean) : undefined
      if (first) return first
      const title = (data as { title?: unknown }).title
      if (typeof title === 'string' && title) return title
    }
  } catch {
    // Ignore non-JSON error bodies.
  }
  return fallback
}

export async function createCollection(input: CollectionInput): Promise<string> {
  const response = await authFetch('/collections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (response.status === 401) throw new UnauthorizedError()
  if (response.status === 400) throw new Error(await readProblem(response, 'Zbirke ni mogoče ustvariti.'))
  if (!response.ok) throw new Error('Zbirke ni mogoče ustvariti.')
  const data = await response.json() as { id: string }
  return data.id
}

export async function updateCollection(id: string, input: CollectionInput): Promise<void> {
  const response = await authFetch(`/collections/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (response.status === 401) throw new UnauthorizedError()
  if (response.status === 400) throw new Error(await readProblem(response, 'Zbirke ni mogoče shraniti.'))
  if (!response.ok) throw new Error('Zbirke ni mogoče shraniti.')
}

export async function fetchCollections(): Promise<CollectionSummary[]> {
  const response = await authFetch('/collections')
  if (response.status === 401) throw new UnauthorizedError()
  if (!response.ok) throw new Error('Zbirk ni mogoče naložiti.')
  return await response.json() as CollectionSummary[]
}

export async function fetchCollection(id: string): Promise<CollectionDetail | null> {
  const response = await fetch(`${API_BASE}/collections/${encodeURIComponent(id)}`)
  if (response.status === 404) return null
  if (!response.ok) throw new Error('Zbirke ni mogoče naložiti.')
  return await response.json() as CollectionDetail
}

export async function deleteCollectionById(id: string): Promise<void> {
  const response = await authFetch(`/collections/${encodeURIComponent(id)}`, { method: 'DELETE' })
  if (response.status === 401) throw new UnauthorizedError()
  if (!response.ok) throw new Error('Zbirke ni mogoče izbrisati.')
}
