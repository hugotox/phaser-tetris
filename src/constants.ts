export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 700;
export const UNIT = 8;
export const COLUMNS = 10;
export const ROWS = 20;
export const BLOCK_SCALE = 4;

export const TETROMINOES = {
  T: [
    [0, 2, 0],
    [2, 2, 2],
    [0, 0, 0],
  ],
  O: [
    [3, 3],
    [3, 3],
  ],
  L: [
    [0, 0, 5],
    [5, 5, 5],
    [0, 0, 0],
  ],
  J: [
    [4, 0, 0],
    [4, 4, 4],
    [0, 0, 0],
  ],
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  S: [
    [0, 7, 7],
    [7, 7, 0],
    [0, 0, 0],
  ],
  Z: [
    [6, 6, 0],
    [0, 6, 6],
    [0, 0, 0],
  ],
};

export const BlockTypes = Object.keys(TETROMINOES);

export type BlockTypesType = keyof typeof TETROMINOES;
//                          1     2     3     4
export type RotationType = "0" | "R" | "2" | "L";

export type RotationDirection = "CW" | "CCW";

// prettier-ignore
export const JLSTZ_KICK_TABLE = {
  "0->R": [[0, 0], [-1, 0], [-1, +1], [0, -2], [-1, -2]],
  "R->0": [[0, 0], [+1, 0], [+1, -1], [0, +2], [+1, +2]],
  "R->2": [[0, 0], [+1, 0], [+1, -1], [0, +2], [+1, +2]],
  "2->R": [[0, 0], [-1, 0], [-1, +1], [0, -2], [-1, -2]],
  "2->L": [[0, 0], [+1, 0], [+1, +1], [0, -2], [+1, -2]],
  "L->2": [[0, 0], [-1, 0], [-1, -1], [0, +2], [-1, +2]],
  "L->0": [[0, 0], [-1, 0], [-1, -1], [0, +2], [-1, +2]],
  "0->L": [[0, 0], [+1, 0], [+1, +1], [0, -2], [+1, -2]],
} as const;

// prettier-ignore
export const I_KICK_TABLE = {
  "0->R": [[0, 0], [-2, 0], [+1, 0], [-2, -1], [+1, +2]],
  "R->0": [[0, 0], [+2, 0], [-1, 0], [+2, +1], [-1, -2]],
  "R->2": [[0, 0], [-1, 0], [+2, 0], [-1, +2], [+2, -1]],
  "2->R": [[0, 0], [+1, 0], [-2, 0], [+1, -2], [-2, +1]],
  "2->L": [[0, 0], [+2, 0], [-1, 0], [+2, +1], [-1, -2]],
  "L->2": [[0, 0], [-2, 0], [+1, 0], [-2, -1], [+1, +2]],
  "L->0": [[0, 0], [+1, 0], [-2, 0], [+1, -2], [-2, +1]],
  "0->L": [[0, 0], [-1, 0], [+2, 0], [-1, +2], [+2, -1]],
} as const;

export type KickTableKey = keyof typeof JLSTZ_KICK_TABLE | keyof typeof I_KICK_TABLE;
