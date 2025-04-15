export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 700;
export const UNIT = 8;
export const COLUMNS = 10;
export const ROWS = 20;
export const BLOCK_SCALE = 4;

export const TETROMINOES = {
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [2, 2],
    [2, 2],
  ],
  L: [
    [0, 0, 3],
    [3, 3, 3],
    [0, 0, 0],
  ],
  J: [
    [4, 0, 0],
    [4, 4, 4],
    [0, 0, 0],
  ],
  I: [
    [0, 0, 0, 0],
    [5, 5, 5, 5],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  S: [
    [0, 6, 6],
    [6, 6, 0],
    [0, 0, 0],
  ],
  Z: [
    [7, 7, 0],
    [0, 7, 7],
    [0, 0, 0],
  ],
};

export const BlockTypes = Object.keys(TETROMINOES);

export type BlockTypesType = keyof typeof TETROMINOES;
