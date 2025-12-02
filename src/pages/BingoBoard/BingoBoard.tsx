// BingoBoard.tsx
import { useState } from 'react';
import cx from 'classnames';
import styles from './BingoBoard.module.scss';

export type BingoCellItem = string | number;
export type BingoCell = {
  title: BingoCellItem;
  flipped: boolean;
};
type BingoBoardProps = {
  items?: BingoCellItem[];
};

const createInitialCells = (items?: BingoCellItem[]) => {
  if (items && items.length >= 25) {
    return items.slice(0, 25).map((item) => ({ title: item, flipped: false }));
  }

  return Array.from({ length: 25 }, (_, i) => ({
    title: i + 1,
    flipped: false,
  }));
};

// Fisher-Yates shuffle
const shuffleArray = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export default function BingoBoard({ items }: BingoBoardProps) {
  const [cells, setCells] = useState<BingoCell[]>(() =>
    shuffleArray(createInitialCells(items))
  );

  // const shuffle = () => {
  //   setCells((prev) => shuffleArray(prev));
  // };
  const flip = (index: number) => {
    setCells((prev) => {
      // const newCells = [...prev];
      // newCells[index].flipped = !newCells[index].flipped;
      // return newCells;
      console.log('flip index', index);
      return [
        ...prev.slice(0, index),
        { ...prev[index], flipped: !prev[index].flipped },
        ...prev.slice(index + 1),
      ];
    });
  };

  return (
    <div className={styles.wrapper}>
      {/* <h1 className={styles.title}>5x5 Bingo</h1> */}

      {/* <button className={styles.button} onClick={handleShuffle}>
        섞기
      </button> */}

      <div className={styles.grid}>
        {cells.map((value, index) => (
          <button
            type="button"
            key={index}
            className={cx(styles.cell, { [styles.flipped]: value.flipped })}
            onClick={() => {
              flip(index);
            }}
          >
            {value.title}
          </button>
        ))}
      </div>
    </div>
  );
}
