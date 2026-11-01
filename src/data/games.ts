export type GameInfo = {
  name: string
  title: string
}

export const GAMES: GameInfo[] = [
  { name: 'falling_objects', title: 'Vesolsko lovljenje' },
  { name: 'balloon_popping', title: 'Počenje balonov' },
]

export function findGame(name: string): GameInfo | undefined {
  return GAMES.find(game => game.name === name)
}
