import { Scene } from "phaser";
import {
  BLOCK_SCALE,
  BlockTypes,
  BlockTypesType,
  COLUMNS,
  RotationDirection,
  RotationType,
  ROWS,
  TETROMINOES,
  UNIT,
} from "../constants";

export class MainGame extends Scene {
  lastUpdateTime = 0;
  gameSpeed = 1000;
  softDropSpeed = 10;
  downKeyPressTime = 0;
  softDropping = false;
  softDropDelay = 200;
  das = 150; // Delay before auto-repeat starts (ms)
  arr = 30; // Auto-repeat rate (ms)
  moveDirection: "left" | "right" | null = null; // 'left' or 'right'
  keyPressTime = 0;
  lastMoveTime = 0;

  cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  zKey: Phaser.Input.Keyboard.Key | undefined;
  canRotate: boolean = true;
  grid = Array.from({ length: 20 }, () => Array(10).fill(0));
  playerSprite: Phaser.GameObjects.Sprite | null = null;
  playerRow = 0;
  playerCol = 0;
  playerRotation: RotationType = "0";
  playerType: BlockTypesType | null = null;
  playerMatrix: number[][] | null = null;
  rectangles: Phaser.GameObjects.Rectangle[] = [];
  pauseGame = false;
  showGridLines = true;
  gameOver = false;

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

    if (this.showGridLines) {
      for (let i = 1; i < COLUMNS; i++) {
        const x = UNIT * BLOCK_SCALE * i;
        this.add.line(0, 0, x, 0, x, UNIT * BLOCK_SCALE * 20, 0x222222).setOrigin(0, 0);
      }
      for (let i = 1; i < ROWS; i++) {
        const y = UNIT * BLOCK_SCALE * i;
        this.add.line(0, 0, 0, y, UNIT * BLOCK_SCALE * 10, y, 0x222222).setOrigin(0, 0);
      }
    }

    this.lastUpdateTime = 0;
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.zKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    // this.renderGridBlocks();
    this.newBlock();
  }

  rotate(player: number[][] | null, dir: RotationDirection) {
    if (!player) {
      return null;
    }
    const matrix: number[][] = JSON.parse(JSON.stringify(player));
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

  checkCollision() {
    if (!this.playerMatrix) {
      return false;
    }
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

  addPlayerToGrid() {
    if (!this.playerMatrix) {
      return;
    }
    if (this.playerRow < 0) {
      // reached the top, game over
      return false;
    }
    for (let x = 0; x < this.playerMatrix.length; x++) {
      for (let y = 0; y < this.playerMatrix[x].length; y++) {
        if (this.playerMatrix[x][y] !== 0) {
          this.grid[this.playerRow + x][this.playerCol + y] = this.playerMatrix[x][y];
        }
      }
    }
    return true;
  }

  clearCompletedLines() {
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

    this.pauseGame = true;

    // if there are lines to clear, we pause for longer to show an animation
    this.time.delayedCall(lines ? 300 : 200, () => {
      if (!this.gameOver) {
        deleteRowIndices.forEach((row) => {
          this.grid.splice(row, 1);
          this.grid.unshift(Array(COLUMNS).fill(0));
        });
        this.playerSprite?.destroy();
        this.playerSprite = null;
        this.newBlock();
        this.renderGridBlocks();
        this.pauseGame = false;
      }
    });

    // force a down key release
    this.downKeyPressTime = 0;
    this.softDropping = false;

    return lines;
  }

  newBlock() {
    const typeCount = BlockTypes.length;
    const newBlockIdx = Math.floor(Math.random() * typeCount);
    this.playerRotation = "0";
    this.playerType = BlockTypes[newBlockIdx] as BlockTypesType;
    this.playerRow = this.playerType === "I" ? -2 : -1;
    this.playerCol = 3;
    this.playerMatrix = TETROMINOES[this.playerType];
  }

  renderPlayerSprite() {
    const sprite = `${this.playerType}-${this.playerRotation}`;
    let newX = this.playerCol;
    let newY = this.playerRow;

    if (this.playerType === "I") {
      if (this.playerRotation === "0") {
        newY += 1;
      } else if (this.playerRotation === "R") {
        newX += 2;
      } else if (this.playerRotation === "2") {
        newY += 2;
      } else if (this.playerRotation === "L") {
        newX += 1;
      }
    } else if (
      this.playerType === "J" ||
      this.playerType === "L" ||
      this.playerType === "T" ||
      this.playerType === "S" ||
      this.playerType === "Z"
    ) {
      if (this.playerRotation === "R") {
        newX += 1;
      } else if (this.playerRotation === "2") {
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

  getNextRotation(rotation: RotationType, dir: RotationDirection): RotationType {
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

  renderPlayer(move: "right" | "left" | "down" | "rotate", rotationDir: RotationDirection = "CW") {
    let collision = false;
    if (move === "right") {
      this.playerCol += 1;
      if (this.checkCollision()) {
        collision = true;
        this.playerCol -= 1;
      }
    } else if (move === "left") {
      this.playerCol -= 1;
      if (this.checkCollision()) {
        collision = true;
        this.playerCol += 1;
      }
    } else if (move === "down") {
      this.playerRow += 1;
      if (this.checkCollision()) {
        collision = true;
        this.playerRow -= 1;
      }
    } else if (move === "rotate") {
      this.playerMatrix = this.rotate(this.playerMatrix, rotationDir);
      this.playerRotation = this.getNextRotation(this.playerRotation, rotationDir);
      if (this.checkCollision()) {
        collision = true;
        // rollback rotation:
        this.playerMatrix = this.rotate(this.playerMatrix, rotationDir === "CW" ? "CCW" : "CW");
        if (rotationDir === "CW") {
          this.playerRotation = this.getNextRotation(this.playerRotation, "CCW");
        } else {
          this.playerRotation = this.getNextRotation(this.playerRotation, "CW");
        }
      } else {
        // rotate sprite animation
      }
    }

    this.renderPlayerSprite();
    // this.consoleLogGrid();
    return collision;
  }

  renderGridBlocks() {
    this.rectangles.forEach((rectangle) => rectangle.destroy());

    for (let row = 0; row < this.grid.length; row++) {
      for (let col = 0; col < this.grid[row].length; col++) {
        if (this.grid[row][col] !== 0) {
          const rectangle = this.add
            .rectangle(
              col * UNIT * BLOCK_SCALE,
              row * UNIT * BLOCK_SCALE,
              UNIT * BLOCK_SCALE,
              UNIT * BLOCK_SCALE,
              0x333333,
            )
            .setOrigin(0, 0);
          this.rectangles.push(rectangle);
        }
      }
    }
  }

  handleHorizontalMove(time: number) {
    const leftPressed = this.cursors?.left.isDown;
    const rightPressed = this.cursors?.right.isDown;

    if (leftPressed || rightPressed) {
      const dir = leftPressed ? "left" : "right";

      if (this.moveDirection !== dir) {
        // New key press or switched direction
        this.moveDirection = dir;
        this.keyPressTime = time;
        this.lastMoveTime = time;
        this.renderPlayer(dir); // Move once immediately
      } else {
        const heldTime = time - this.keyPressTime;
        const timeSinceLastMove = time - this.lastMoveTime;

        if (heldTime >= this.das && timeSinceLastMove >= this.arr) {
          this.lastMoveTime = time;
          this.renderPlayer(dir); // Auto-repeat
        }
      }
    } else {
      // No horizontal key held
      this.moveDirection = null;
      this.keyPressTime = 0;
      this.lastMoveTime = 0;
    }
  }

  handleVerticalMove(time: number) {
    if (this.cursors?.down.isDown) {
      if (this.downKeyPressTime === 0) {
        // First press
        this.downKeyPressTime = time;
        this.softDropping = false; // Single drop
        this.renderPlayer("down"); // Immediate single drop
        this.lastUpdateTime = time; // Reset timer so we don’t double drop
      } else if (time - this.downKeyPressTime > this.softDropDelay) {
        this.softDropping = true; // Begin fast drop after delay
      }
    } else {
      // Key released
      this.downKeyPressTime = 0;
      this.softDropping = false;
    }

    const currentSpeed = this.softDropping ? this.softDropSpeed : this.gameSpeed;

    if (time > this.lastUpdateTime + currentSpeed) {
      this.lastUpdateTime = time;
      const collision = this.renderPlayer("down");
      if (collision) {
        const added = this.addPlayerToGrid();
        if (!added) {
          this.playerRow += 1;
          this.renderPlayerSprite();
          this.gameOver = true;
        }
        this.clearCompletedLines();
      }
    }
  }

  handleRotationalMove() {
    if (this.cursors?.up.isDown && this.canRotate) {
      this.canRotate = false;
      this.renderPlayer("rotate", "CW");
    }

    if (this.zKey?.isDown && this.canRotate) {
      this.canRotate = false;
      this.renderPlayer("rotate", "CCW");
    }

    if (this.cursors?.up.isUp && this.zKey?.isUp && !this.canRotate) {
      this.canRotate = true;
    }
  }

  update(time: number) {
    if (this.pauseGame || this.gameOver) {
      return;
    }

    this.handleHorizontalMove(time);
    this.handleVerticalMove(time);
    this.handleRotationalMove();
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
