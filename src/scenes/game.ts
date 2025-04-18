/* eslint-disable indent */
import { Scene } from "phaser";
import {
  BLOCK_SCALE,
  BlockTypes,
  BlockTypesType,
  COLUMNS,
  ROWS,
  TETROMINOES,
  UNIT,
} from "../constants";

export class MainGame extends Scene {
  lastUpdateTime = 0;
  gameSpeed = 1000;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  canRotate: boolean = true;
  canMove: boolean = true;
  grid = Array.from({ length: 20 }, () => Array(10).fill(0));
  playerSprite: Phaser.GameObjects.Sprite | null = null;
  playerRow = 0;
  playerCol = 0;
  playerRotation: 1 | 2 | 3 | 4 = 1;
  playerType: BlockTypesType | null = null;
  playerMatrix: number[][] | null = null;
  rectangles: Phaser.GameObjects.Rectangle[] = [];
  gridBlocks: Phaser.GameObjects.Sprite[] = [];
  clearLinesAnimPause = false;

  constructor() {
    super("Game");
  }

  preload() {
    this.load.atlas("tetrominos", "assets/tetris-blocks.png", "assets/tetris-blocks.json");
  }

  create() {
    this.add
      .rectangle(0, 0, 10 * UNIT * BLOCK_SCALE, 20 * UNIT * BLOCK_SCALE, 0x000000)
      .setOrigin(0, 0);

    this.lastUpdateTime = 0;
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.renderGridBlocks();
    this.newBlock();
  }

  rotate(player: number[][], dir: "right" | "left" = "right") {
    const matrix = JSON.parse(JSON.stringify(player));
    for (let y = 0; y < matrix.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
      }
    }
    if (dir === "right") {
      matrix.forEach((row) => row.reverse());
    } else {
      matrix.reverse();
    }
    return matrix;
  }

  checkCollision() {
    for (let x = 0; x < this.playerMatrix.length; x++) {
      for (let y = 0; y < this.playerMatrix[x].length; y++) {
        if (this.playerMatrix[x][y] !== 0) {
          if (
            typeof this.grid[this.playerRow + x]?.[this.playerCol + y] === "undefined" ||
            this.grid[this.playerRow + x]?.[this.playerCol + y] !== 0
          )
            return true;
        }
      }
    }
    return false;
  }

  addBlockToGrid() {
    for (let x = 0; x < this.playerMatrix.length; x++) {
      for (let y = 0; y < this.playerMatrix[x].length; y++) {
        if (this.playerMatrix[x][y] !== 0) {
          this.grid[this.playerRow + x][this.playerCol + y] = this.playerMatrix[x][y];
        }
      }
    }
  }

  checkCompletedLines() {
    let lines = 0;
    const deleteRowIndices: number[] = [];
    for (let i = 0; i < ROWS; i++) {
      let count = 0;
      for (let j = 0; j < COLUMNS; j++) {
        if (this.grid[i][j]) {
          count += 1;
        }
      }
      if (count === COLUMNS) {
        lines += 1;
        deleteRowIndices.push(i);
      }
    }

    if (lines) {
      this.clearLinesAnimPause = true;
    }

    setTimeout(() => {
      deleteRowIndices.forEach((row) => {
        this.grid.splice(row, 1);
        this.grid.unshift(Array(COLUMNS).fill(0));
      });
      this.playerSprite?.destroy();
      this.playerSprite = null;
      this.newBlock();
      this.renderGridBlocks();
      this.clearLinesAnimPause = false;
    }, 300);
  }

  newBlock() {
    const typeCount = BlockTypes.length;
    const newBlockIdx = Math.floor(Math.random() * typeCount);
    this.playerRotation = 1;
    this.playerType = BlockTypes[newBlockIdx] as BlockTypesType;
    this.playerRow = this.playerType === "I" ? -2 : -1;
    this.playerCol = 3;
    this.playerMatrix = TETROMINOES[this.playerType];
  }

  renderBlockSprite() {
    const sprite = `${this.playerType}-${this.playerRotation}`;
    let newX = this.playerCol;
    let newY = this.playerRow;

    if (this.playerType === "I") {
      if (this.playerRotation === 1) {
        newY += 1;
      } else if (this.playerRotation === 2) {
        newX += 2;
      } else if (this.playerRotation === 3) {
        newY += 2;
      } else if (this.playerRotation === 4) {
        newX += 1;
      }
    } else if (
      this.playerType === "J" ||
      this.playerType === "L" ||
      this.playerType === "T" ||
      this.playerType === "S" ||
      this.playerType === "Z"
    ) {
      if (this.playerRotation === 2) {
        newX += 1;
      } else if (this.playerRotation === 3) {
        newY += 1;
      }
    }

    if (!this.playerSprite) {
      this.playerSprite = this.add
        .sprite(newX * UNIT * BLOCK_SCALE, newY * UNIT * BLOCK_SCALE, "tetrominos", sprite)
        .setOrigin(0, 0)
        .setScale(BLOCK_SCALE);
    } else {
      this.playerSprite.setFrame(sprite);
      this.playerSprite.setX(newX * UNIT * BLOCK_SCALE);
      this.playerSprite.setY(newY * UNIT * BLOCK_SCALE);
    }
  }

  renderBlock(move?: "right" | "left" | "down" | "rotate") {
    let collision = false;
    switch (move) {
      case "right":
        this.playerCol += 1;
        if (this.checkCollision()) {
          collision = true;
          this.playerCol -= 1;
        }
        break;
      case "left":
        this.playerCol -= 1;
        if (this.checkCollision()) {
          collision = true;
          this.playerCol += 1;
        }
        break;
      case "down":
        this.playerRow += 1;
        if (this.checkCollision()) {
          collision = true;
          this.playerRow -= 1;
        }
        break;
      case "rotate":
        this.playerMatrix = this.rotate(this.playerMatrix);
        if (this.playerRotation < 4) {
          this.playerRotation += 1;
        } else {
          this.playerRotation = 1;
        }
        if (this.checkCollision()) {
          collision = true;
          this.playerMatrix = this.rotate(this.playerMatrix, "left");
          if (this.playerRotation === 1) {
            this.playerRotation = 4;
          } else {
            this.playerRotation -= 1;
          }
        } else {
          // rotate sprite animation
        }
    }

    this.renderBlockSprite();
    // this.consoleLogGrid();
    return collision;
  }

  renderGridBlocks() {
    this.rectangles.forEach((rectangle) => rectangle.destroy());
    this.gridBlocks.forEach((block) => block.destroy());

    for (let row = 0; row < this.grid.length; row++) {
      for (let col = 0; col < this.grid[row].length; col++) {
        if (this.grid[row][col] !== 0) {
          const rectangle = this.add
            .rectangle(
              col * UNIT * BLOCK_SCALE,
              row * UNIT * BLOCK_SCALE,
              UNIT * BLOCK_SCALE,
              UNIT * BLOCK_SCALE,
              0xff0000,
            )
            .setOrigin(0, 0);
          this.rectangles.push(rectangle);
        }
      }
    }
  }

  update(time: number) {
    if (this.clearLinesAnimPause) {
      return;
    }
    if (time > this.lastUpdateTime + this.gameSpeed) {
      this.lastUpdateTime = time;
      const collision = this.renderBlock("down");
      if (collision) {
        this.addBlockToGrid();
        this.checkCompletedLines();
      }
    }
    if (this.cursors.up.isDown && this.canRotate) {
      this.canRotate = false;
      this.renderBlock("rotate");
    }
    if (this.cursors.up.isUp && !this.canRotate) {
      this.canRotate = true;
    }
    if (this.cursors.left.isDown && this.canMove) {
      this.canMove = false;
      this.renderBlock("left");
    }
    if (this.cursors.right.isDown && this.canMove) {
      this.canMove = false;
      this.renderBlock("right");
    }
    if (this.cursors.down.isDown && this.canMove) {
      this.canMove = false;
      this.renderBlock("down");
    }
    if (
      this.cursors.left.isUp &&
      this.cursors.right.isUp &&
      this.cursors.down.isUp &&
      !this.canMove
    ) {
      this.canMove = true;
    }
  }

  consoleLogGrid() {
    // console.clear();
    console.log({
      X: this.playerRow,
      Y: this.playerCol,
      R: this.playerRotation,
    });
    let gridString = "";
    for (let row = 0; row < this.grid.length; row++) {
      if (row === 0) {
        gridString += "    ";
        for (let col = 0; col < this.grid[row].length; col++) {
          gridString += String(col) + "   ";
        }
        gridString += "\n";
      }
      gridString += `${String(row).padStart(2, " ")}: `;
      for (let col = 0; col < this.grid[row].length; col++) {
        gridString += String(this.grid[row][col] ? this.grid[row][col] : ".") + "   ";
      }
      gridString += "\n";
    }
    console.log(gridString);
  }
}
