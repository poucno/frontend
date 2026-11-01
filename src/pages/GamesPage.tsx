import { Link } from 'react-router-dom'
import { GAMES } from '../data/games'

export default function GamesPage() {
  return (
    <section className="games-page" aria-labelledby="games-title">
      <h1 id="games-title">Izberi igro</h1>
      <ul className="games-list">
        {GAMES.map(game => (
          <li key={game.name}>
            <Link className="game-pick" to={`/play/${game.name}`}>
              <img className="game-thumb" src={game.thumbnail} alt="" loading="lazy" />
              <span className="game-pick-title">{game.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
