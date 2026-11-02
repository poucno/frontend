import { authFetch } from './authApi'

export type GameOption = {
  id: string
  title: string
  url: string
  thumbnailUrl: string
  minAnswers: number
  maxAnswers: number
}

export async function fetchGames(): Promise<GameOption[]> {
  const response = await authFetch('/games')
  if (!response.ok) throw new Error('Iger ni mogoče naložiti.')
  return await response.json() as GameOption[]
}
