export type GameInfo = {
  name: string
  title: string
  thumbnail: string
  url: string
}

export const GAMES: GameInfo[] = [
  { name: 'falling_objects', title: 'Lovljenje v vesolju', thumbnail: '/thumbnails/falling_objects.png', url: 'https://game-falling-objects.poucno.study/index.html' },
  { name: 'balloon_popping', title: 'Pokanje balonov', thumbnail: '/thumbnails/balloon_popping.png', url: 'https://game-balloon-popping.poucno.study/index.html' },
]

export function findGame(name: string): GameInfo | undefined {
  return GAMES.find(game => game.name === name)
}
