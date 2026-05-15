import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import cx from 'classnames';
import { io } from 'socket.io-client';
import styles from './LotsDraw.module.scss';

type LotsDrawProps = {
  items: string[];
};

const ballColors = [
  '#e23d3d',
  '#f59f00',
  '#2f9e44',
  '#1971c2',
  '#7048e8',
  '#d6336c',
  '#0ca678',
  '#f08c00',
];

type DrawState = {
  isDrawing: boolean;
  selected: string;
  history: string[];
  candidates: string[];
};

const liveDrawUrl = import.meta.env.VITE_LIVE_DRAW_URL || '/';

export default function LotsDraw({ items }: LotsDrawProps) {
  const candidates = useMemo(
    () => items.map((item) => item.trim()).filter(Boolean),
    [items]
  );
  const displayBalls = candidates.length > 0 ? candidates : ['?'];
  const isHost = new URLSearchParams(window.location.search).get('host') === '1';
  const candidatesRef = useRef(candidates);
  const socket = useMemo(
    () =>
      io(liveDrawUrl, {
        path: '/live-draw/socket.io',
      }),
    []
  );

  const [selected, setSelected] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    candidatesRef.current = candidates;
    socket.emit('draw:setCandidates', candidates);
  }, [candidates, socket]);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      socket.emit('draw:setCandidates', candidatesRef.current);
    };
    const handleDisconnect = () => {
      setIsConnected(false);
    };
    const handleState = (state: DrawState) => {
      setIsDrawing(state.isDrawing);
      setSelected(state.selected);
      setHistory(state.history);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('draw:state', handleState);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('draw:state', handleState);
      socket.disconnect();
    };
  }, [socket]);

  const draw = () => {
    if (!isHost || isDrawing || candidates.length === 0) return;
    socket.emit('draw:start', candidates);
  };

  return (
    <main className={styles.page}>
      <section className={styles.stage} aria-live="polite">
        <div className={cx(styles.machine, { [styles.drawing]: isDrawing })}>
          <div className={styles.glass}>
            {displayBalls.map((name, index) => (
              <span
                className={styles.ball}
                key={`${name}-${index}`}
                style={
                  {
                    '--ball-color': ballColors[index % ballColors.length],
                    '--ball-delay': `${index * 90}ms`,
                    '--x': `${(index % 5) * 18 - 36}px`,
                    '--y': `${Math.floor(index / 5) * 18 - 18}px`,
                  } as CSSProperties
                }
              >
                {name.slice(0, 2)}
              </span>
            ))}
          </div>

          <div className={styles.chute}>
            <span className={cx(styles.winnerBall, { [styles.show]: selected })}>
              {selected || '...'}
            </span>
          </div>
        </div>

        <div className={styles.panel}>
          <p className={styles.label}>Drawing lots</p>
          <h1>{selected || (isDrawing ? 'Mixing...' : 'Ready to draw')}</h1>
          <p className={styles.meta}>
            {candidates.length} {candidates.length === 1 ? 'name' : 'names'} in
            the pool | {isConnected ? 'live' : 'offline'} |{' '}
            {isHost ? 'host' : 'watching'}
          </p>
          {isHost ? (
            <button
              className={styles.drawButton}
              type="button"
              onClick={draw}
              disabled={!isConnected || isDrawing || candidates.length === 0}
            >
              {isDrawing ? 'Picking...' : 'Pick a ball'}
            </button>
          ) : (
            <p className={styles.watchNote}>Waiting for the host to draw.</p>
          )}
        </div>
      </section>

      {history.length > 0 && (
        <section className={styles.history} aria-label="Recent picks">
          {history.map((name, index) => (
            <span key={`${name}-${index}`}>{name}</span>
          ))}
        </section>
      )}
    </main>
  );
}
