import { RotationDirection, RotationType } from "../constants";

export function rotateMatrix(player: number[][] | null, dir: RotationDirection) {
  if (!player) {
    return null;
  }
  const matrix: number[][] = structuredClone(player);
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir === "CW") {
    matrix.forEach((row) => row.reverse());
  } else {
    matrix.reverse();
  }
  return matrix;
}

export function getNextRotation(rotation: RotationType, dir: RotationDirection): RotationType {
  if (dir === "CW") {
    if (rotation === "0") {
      return "R" as RotationType;
    } else if (rotation === "R") {
      return "2" as RotationType;
    } else if (rotation === "2") {
      return "L" as RotationType;
    } else if (rotation === "L") {
      return "0" as RotationType;
    }
  } else {
    if (rotation === "0") {
      return "L" as RotationType;
    } else if (rotation === "L") {
      return "2" as RotationType;
    } else if (rotation === "2") {
      return "R" as RotationType;
    } else if (rotation === "R") {
      return "0" as RotationType;
    }
  }
  return rotation;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function consoleLogGrid(grid: any[][]) {
  // console.clear();

  let gridString = "";
  for (let row = 0; row < grid.length; row++) {
    if (row === 0) {
      gridString += "    ";
      for (let col = 0; col < grid[row].length; col++) {
        gridString += String(col) + "   ";
      }
      gridString += "\n";
    }
    gridString += `${String(row).padStart(2, " ")}: `;
    for (let col = 0; col < grid[row].length; col++) {
      gridString += String(grid[row][col] ? "#" : ".") + "   ";
    }
    gridString += "\n";
  }
  console.log(gridString);
}
