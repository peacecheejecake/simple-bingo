import { useState } from 'react';
import cx from 'classnames';
import styles from './BingoBoard.module.scss';

export type BingoCellItem = string | number;
export type BingoCell = {
  title: BingoCellItem;
  desc?: string;
  flipped: boolean;
};
type BingoBoardProps = {
  items?: BingoCellItem[];
};

const BOARD_SIZE = 5;

const createInitialCells = (items?: BingoCellItem[]) => {
  if (items && items.length >= 25) {
    return items.map((item) => {
      if (typeof item === 'string') {
        const [title, desc] = item.split('(');
        return {
          title: title,
          desc: desc ? desc.replace(')', '') : undefined,
          flipped: false,
        };
      }

      return {
        title: item,
        flipped: false,
      };
    });
  }

  return Array.from({ length: 25 }, (_, i) => ({
    title: i + 1,
    flipped: false,
  }));
};

// 모든 가로/세로/대각선 라인 인덱스 계산
const LINES: number[][] = (() => {
  const lines: number[][] = [];

  // 가로
  for (let r = 0; r < BOARD_SIZE; r++) {
    const row: number[] = [];
    for (let c = 0; c < BOARD_SIZE; c++) {
      row.push(r * BOARD_SIZE + c);
    }
    lines.push(row);
  }

  // 세로
  for (let c = 0; c < BOARD_SIZE; c++) {
    const col: number[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      col.push(r * BOARD_SIZE + c);
    }
    lines.push(col);
  }

  // 대각선 2개
  const diag1: number[] = [];
  const diag2: number[] = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    diag1.push(i * BOARD_SIZE + i);
    diag2.push(i * BOARD_SIZE + (BOARD_SIZE - 1 - i));
  }
  lines.push(diag1, diag2);

  return lines;
})();

// 어떤 칸들이 "빙고 라인"에 포함되는지 boolean 배열로 계산
const getBingoCells = (flipped: boolean[]): boolean[] => {
  const result = Array(flipped.length).fill(false);

  LINES.forEach((line) => {
    const isFull = line.every((idx) => flipped[idx]);
    if (isFull) {
      line.forEach((idx) => {
        result[idx] = true;
      });
    }
  });

  return result;
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
const cut = <T,>(arr: T[]) => {
  return arr.slice(0, 25);
};

export default function BingoBoard({ items }: BingoBoardProps) {
  const [cells, setCells] = useState<BingoCell[]>(() =>
    cut(shuffleArray(createInitialCells(items)))
  );
  // const [flips, setFlips] = useState<number>(0);
  const bingos = getBingoCells(cells.map((cell) => cell.flipped));

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
    // setBingos((prev) => {
    //   const newFlipped = [
    //     ...prev.slice(0, index),
    //     !prev[index],
    //     ...prev.slice(index + 1),
    //   ];
    //   console.log('prev', index);
    //   console.log('newFlipped', newFlipped);
    //   console.log('getBingoCells', getBingoCells(newFlipped));
    //   return getBingoCells(newFlipped);
    // });
    // setFlips((prev) => prev + 1);
    // console.log('bingos', cells, bingos);
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
            className={cx(styles.cell, {
              [styles.flipped]: value.flipped,
              [styles.bingoCell]: bingos[index],
            })}
            onClick={() => {
              flip(index);
            }}
          >
            <p className={styles.title}>{value.title}</p>
            {value.desc && <p className={styles.desc}>{value.desc}</p>}
          </button>
        ))}
      </div>
    </div>
  );
}
