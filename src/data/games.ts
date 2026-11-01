export type GameInfo = {
  name: string
  title: string
  thumbnail: string
}

export const GAMES: GameInfo[] = [
  { name: 'falling_objects', title: 'Lovljenje v vesolju', thumbnail: '/thumbnails/falling_objects.png' },
  { name: 'balloon_popping', title: 'Pokanje balonov', thumbnail: '/thumbnails/balloon_popping.png' },
]

export function findGame(name: string): GameInfo | undefined {
  return GAMES.find(game => game.name === name)
}
