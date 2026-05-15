import { BingoBoard } from './pages/BingoBoard';
import { LotsDraw } from './pages/LotsDraw';
import './App.css';
import { names } from './data/names';

const routes = {
  bingo: '/',
  lots: '/lots',
};

function App() {
  const path = window.location.pathname;
  const isLotsPage = path === routes.lots;

  return (
    <div className="app">
      <nav className="nav" aria-label="Main navigation">
        <a className={!isLotsPage ? 'active' : ''} href={routes.bingo}>
          Bingo
        </a>
        <a className={isLotsPage ? 'active' : ''} href={routes.lots}>
          Lots
        </a>
      </nav>
      <div className="card">
        {isLotsPage ? <LotsDraw items={names} /> : <BingoBoard items={names} />}
      </div>
    </div>
  );
}

export default App;
