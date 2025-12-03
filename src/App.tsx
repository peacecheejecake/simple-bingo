import { BingoBoard } from './pages/BingoBoard';
import './App.css';
import { names } from './data/names';

function App() {
  return (
    <>
      <div></div>
      <div className="card">
        <BingoBoard items={names} />
      </div>
    </>
  );
}

export default App;
