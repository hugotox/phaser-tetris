import { Scene } from "phaser";
import {
  BLOCK_SCALE,
  BlockTypes,
  BlockTypesType,
  COLUMNS,
  I_KICK_TABLE,
  JLSTZ_KICK_TABLE,
  KickTableKey,
  LINES_MULTIPLIER,
  NUMBER_OF_NEXT_BLOCKS,
  RotationDirection,
  RotationType,
  ROWS,
  TETROMINOES,
  UNIT,
} from "../constants";
import { PieceGenerator } from "../lib/PieceGenerator";
import tetrisMusic from "../lib/tetris-theme.mp3";
import { getNextRotation, rotateMatrix } from "../lib/utils";
import { GravityManager } from "../lib/GravityManager";

export class MainGame extends Scene {
  playAreaX = 0; // set in setupWorld
  playAreaY = 20;
  lastUpdateTime = 0;
  gravity: GravityManager | null = null;
  gameSpeed = -1;
  softDropSpeed = 20;
  downKeyPressTime = 0;
  softDropping = false;
  softDropDelay = 100;
  das = 150; // Delay before auto-repeat starts (ms)
  arr = 30; // Auto-repeat rate (ms)
  moveDirection: "left" | "right" | null = null; // 'left' or 'right'
  keyPressTime = 0;
  lastMoveTime = 0;
  bgMusic: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;

  cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  zKey: Phaser.Input.Keyboard.Key | undefined;
  spaceKey: Phaser.Input.Keyboard.Key | undefined;
  canRotate: boolean = true;
  inputLocked: boolean = false;
  // grid: (number | number[])[][] = Array.from({ length: 20 }, () => Array(10).fill(0));
  grid = Array.from({ length: 20 }, () => Array(10).fill(0));
  playerSprite: Phaser.GameObjects.Sprite | null = null;
  playerRow = 0;
  playerCol = 0;
  playerRotation: RotationType = "0";
  playerType: BlockTypesType | null = null;
  playerMatrix: number[][] | null = null;
  gridBlocks: Phaser.GameObjects.Sprite[] = [];
  pauseGame = false;
  showGridLines = false;
  gameOver = false;
  downKeyReleased = true;

  pieceGenerator = new PieceGenerator(BlockTypes as BlockTypesType[]);
  nextPieces: BlockTypesType[] = [];
  nextPiecesSprites: Phaser.GameObjects.Sprite[] = [];
  score = 0;
  level = 0;
  initialLevel = 0;
  totalLines = 0;
  scoreText: Phaser.GameObjects.BitmapText | null = null;
  levelText: Phaser.GameObjects.BitmapText | null = null;
  linesText: Phaser.GameObjects.BitmapText | null = null;

  btnLeft: Phaser.GameObjects.Image | null = null;
  btnLeftPressed = false;
  btnRight: Phaser.GameObjects.Image | null = null;
  btnRightPressed = false;
  btnDrop: Phaser.GameObjects.Image | null = null;
  btnDropPressed = false;
  btnRotate: Phaser.GameObjects.Image | null = null;

  constructor() {
    super("Game");
  }

  preload() {
    this.load.atlas("tetrominos", "assets/tetris-blocks2.png", "assets/tetris-blocks2.json");
    this.load.spritesheet("tiles", "assets/tetris-tiles2.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.audio("tetrisMusic", tetrisMusic);
    this.load.image("background", "assets/background.png");
    this.load.image("btnLeft", "assets/btn-left.png");
    this.load.image("btnRotate", "assets/btn-rotate.png");
    this.load.bitmapFont("arcade", "assets/arcade.png", "assets/arcade.xml");
  }

  create() {
    this.score = 0;
    this.lastUpdateTime = 0;
    this.level = this.initialLevel;
    this.gravity = new GravityManager(this.initialLevel);
    this.gameSpeed = this.gravity.currentSpeed;

    this.setupWorld();
    this.setupMusic();

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.zKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    // this.spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.input?.keyboard?.on("keydown-SPACE", () => {
      if (!this.inputLocked && this.playerSprite) {
        this.handleHardDrop();
      }
    });

    this.nextPieces.push(this.pieceGenerator.generatePiece());

    this.newBlock();
  }

  setupMusic() {
    this.bgMusic = this.sound.add("tetrisMusic");
    this.bgMusic.loop = true;
    // this.bgMusic.play();
  }

  setupWorld() {
    const playAreaWidth = 10 * UNIT * BLOCK_SCALE;
    const playAreaHeight = 20 * UNIT * BLOCK_SCALE;
    this.playAreaX = 20;

    // play area background:
    this.add
      .rectangle(
        this.playAreaX,
        this.playAreaY,
        10 * UNIT * BLOCK_SCALE + UNIT / 2,
        20 * UNIT * BLOCK_SCALE + UNIT / 2,
        0x000000,
      )
      .setOrigin(0, 0);

    // next piece area background
    this.add
      .rectangle(
        this.playAreaX + playAreaWidth + 20,
        this.playAreaY,
        150,
        10 * UNIT * BLOCK_SCALE + UNIT / 2,
        0x000000,
      )
      .setOrigin(0, 0);

    // "Score" text
    this.add
      .bitmapText(this.playAreaX + playAreaWidth + 40, this.playAreaY + 20, "arcade", "Score", 18)
      .setOrigin(0, 0)
      .setTint(0xffe066);
    this.scoreText = this.add
      .bitmapText(
        this.playAreaX + playAreaWidth + 40,
        this.playAreaY + 45,
        "arcade",
        String(this.score),
        18,
      )
      .setOrigin(0, 0)
      .setTint(0xffffff);

    // "Next" text
    this.add
      .bitmapText(this.playAreaX + playAreaWidth + 40, this.playAreaY + 80, "arcade", "Next", 18)
      .setOrigin(0, 0)
      .setTint(0xffe066);

    // "Level" text
    this.add
      .bitmapText(this.playAreaX + playAreaWidth + 40, this.playAreaY + 200, "arcade", "Level", 18)
      .setOrigin(0, 0)
      .setTint(0xffe066);
    this.levelText = this.add
      .bitmapText(
        this.playAreaX + playAreaWidth + 40,
        this.playAreaY + 225,
        "arcade",
        String(this.level),
        18,
      )
      .setOrigin(0, 0)
      .setTint(0xffffff);

    // "Lines" text
    this.add
      .bitmapText(this.playAreaX + playAreaWidth + 40, this.playAreaY + 260, "arcade", "Lines", 18)
      .setOrigin(0, 0)
      .setTint(0xffe066);
    this.linesText = this.add
      .bitmapText(
        this.playAreaX + playAreaWidth + 40,
        this.playAreaY + 285,
        "arcade",
        String(this.totalLines),
        18,
      )
      .setOrigin(0, 0)
      .setTint(0xffffff);

    this.btnLeft = this.add
      .image(this.playAreaX + 60, playAreaHeight + 110, "btnLeft")
      // .setOrigin(0, 0)
      .setInteractive();
    this.btnLeft.on("pointerdown", () => {
      this.btnLeftPressed = true;
    });
    this.btnLeft.on("pointerup", () => {
      this.btnLeftPressed = false;
    });
    this.btnLeft.on("pointerout", () => {
      this.btnLeftPressed = false;
    });
    this.btnLeft.on("pointerupoutside", () => {
      this.btnLeftPressed = false;
    });

    // "right" button
    this.btnRight = this.add
      .image(this.playAreaX + 250, playAreaHeight + 110, "btnLeft")
      // .setOrigin(0, 0)
      .setRotation(Math.PI)
      .setInteractive();
    this.btnRight.on("pointerdown", () => {
      this.btnRightPressed = true;
    });
    this.btnRight.on("pointerup", () => {
      this.btnRightPressed = false;
    });
    this.btnRight.on("pointerout", () => {
      this.btnRightPressed = false;
    });
    this.btnRight.on("pointerupoutside", () => {
      this.btnRightPressed = false;
    });

    // "drop" button
    this.btnDrop = this.add
      .image(this.playAreaX + 155, playAreaHeight + 220, "btnLeft")
      // .setOrigin(0, 0)
      .setRotation((Math.PI / 2) * -1)
      .setInteractive();
    this.btnDrop.on("pointerdown", () => {
      this.btnDropPressed = true;
    });
    this.btnDrop.on("pointerup", () => {
      this.btnDropPressed = false;
    });
    this.btnDrop.on("pointerout", () => {
      this.btnDropPressed = false;
    });
    this.btnDrop.on("pointerupoutside", () => {
      this.btnDropPressed = false;
    });

    // "rotate" button
    this.btnRotate = this.add
      .image(this.playAreaX + 340, playAreaHeight + 50, "btnRotate")
      .setOrigin(0, 0)
      .setInteractive();
    this.btnRotate.on("pointerdown", () => {
      this.renderPlayer("rotate", "CW");
    });

    if (this.showGridLines) {
      for (let i = 1; i < COLUMNS; i++) {
        const x = UNIT * BLOCK_SCALE * i;
        this.add
          .line(this.playAreaX, this.playAreaY, x, 0, x, UNIT * BLOCK_SCALE * 20, 0x222222)
          .setOrigin(0, 0);
      }
      for (let i = 1; i < ROWS; i++) {
        const y = UNIT * BLOCK_SCALE * i;
        this.add
          .line(this.playAreaX, this.playAreaY, 0, y, UNIT * BLOCK_SCALE * 10, y, 0x222222)
          .setOrigin(0, 0);
      }
    }
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
    if (this.playerRow === 0) {
      // reached the top, game over
      return false;
    }
    for (let x = 0; x < this.playerMatrix.length; x++) {
      for (let y = 0; y < this.playerMatrix[x].length; y++) {
        if (this.playerMatrix[x][y] !== 0) {
          const top = this.playerMatrix[x - 1]?.[y] ?? 0;
          const right = this.playerMatrix[x]?.[y + 1] ?? 0;
          const bottom = this.playerMatrix[x + 1]?.[y] ?? 0;
          const left = this.playerMatrix[x]?.[y - 1] ?? 0;

          this.grid[this.playerRow + x][this.playerCol + y] = [top, right, bottom, left];
        }
      }
    }
    return true;
  }

  updateScore(lines: number) {
    if (lines > 0) {
      this.totalLines += lines;
      this.score += LINES_MULTIPLIER[lines - 1] * (this.level + 1);
      this.level = Math.floor(this.totalLines / 10) + this.initialLevel;

      if (this.gravity) {
        this.gravity.addClearedLines(lines);
        this.gameSpeed = this.gravity.currentSpeed;
      }

      this.scoreText?.setText(`${this.score}`);
      this.levelText?.setText(`${this.level}`);
      this.linesText?.setText(`${this.totalLines}`);

      // this.events.emit("scoreUpdated", this.score, this.level);
    }
  }

  clearCompletedLines(callback?: () => void) {
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

    this.updateScore(lines);

    this.pauseGame = true;

    // if there are lines to clear, we pause for longer to show an animation
    this.time.delayedCall(lines ? 100 + lines * 100 : 10, () => {
      if (!this.gameOver) {
        deleteRowIndices.forEach((row) => {
          for (let i = 0; i < COLUMNS; i++) {
            // update the row above the cleared row to make all blocks to not have bottom connection
            if (Array.isArray(this.grid[row - 1][i]) && this.grid[row - 1][i].length === 4) {
              // mark bottom as not connected:
              const origValue = this.grid[row - 1][i].flat().filter(Boolean)[0];
              this.grid[row - 1][i][2] = 0;

              if (this.grid[row - 1][i].flat().filter(Boolean).length === 0) {
                this.grid[row - 1][i] = [origValue];
              }
            }

            // update the row below the cleared row to make all blocks to not have top connection
            if (Array.isArray(this.grid[row + 1]?.[i]) && this.grid[row + 1][i].length === 4) {
              // mark top as not connected:
              const origValue = this.grid[row + 1][i].flat().filter(Boolean)[0];
              this.grid[row + 1][i][0] = 0;

              if (this.grid[row + 1][i].flat().filter(Boolean).length === 0) {
                this.grid[row + 1][i] = [origValue];
              }
            }
          }
        });

        deleteRowIndices.forEach((row) => {
          this.grid.splice(row, 1);
          this.grid.unshift(Array(COLUMNS).fill(0));
        });

        this.playerSprite?.destroy();
        this.playerSprite = null;
        this.newBlock();
        this.renderGridBlocks();
        this.pauseGame = false;
        this.inputLocked = false;
        callback?.();
      }
    });

    // force a down key release
    this.downKeyPressTime = 0;
    this.softDropping = false;

    return lines;
  }

  newBlock() {
    const nextPiece = this.nextPieces.shift();
    if (!nextPiece) {
      return;
    }
    this.playerType = nextPiece; //this.pieceGenerator.generatePiece();
    this.playerRotation = "0";
    this.playerRow = 0;
    this.playerCol = 3;
    this.playerMatrix = TETROMINOES[this.playerType];

    let collision = false;
    if (this.checkCollision()) {
      collision = true;
    }
    this.renderPlayerSprite();
    if (collision) {
      this.lockPiece();
    }

    this.lastUpdateTime = this.time.now;
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
        .sprite(
          newX * UNIT * BLOCK_SCALE + this.playAreaX,
          newY * UNIT * BLOCK_SCALE + this.playAreaY,
          "tetrominos",
          sprite,
        )
        .setOrigin(0, 0);
      // .setScale(BLOCK_SCALE);
    } else {
      this.playerSprite.setFrame(sprite);
      this.playerSprite.setX(newX * UNIT * BLOCK_SCALE + this.playAreaX);
      this.playerSprite.setY(newY * UNIT * BLOCK_SCALE + this.playAreaY);
    }
  }

  canPlacePieceAt(x: number, y: number) {
    if (!this.playerMatrix) {
      return false;
    }
    for (let i = 0; i < this.playerMatrix.length; i++) {
      for (let j = 0; j < this.playerMatrix[i].length; j++) {
        if (
          this.playerMatrix[i][j] !== 0 &&
          (this.grid[y + i] === undefined || this.grid[y + i][x + j] !== 0)
        ) {
          return false;
        }
      }
    }
    return true;
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
      const prevRotation = this.playerRotation;
      const newRotation = getNextRotation(this.playerRotation, rotationDir);
      const kickTable = this.playerType === "I" ? I_KICK_TABLE : JLSTZ_KICK_TABLE;
      const key = `${prevRotation}->${newRotation}` as KickTableKey;

      this.playerMatrix = rotateMatrix(this.playerMatrix, rotationDir);
      collision = true;

      for (const [dx, dy] of kickTable[key]) {
        const testX = this.playerCol + dx;
        const testY = this.playerRow + dy;

        if (this.canPlacePieceAt(testX, testY)) {
          this.playerCol = testX;
          this.playerRow = testY;
          this.playerRotation = newRotation;

          if (!this.checkCollision()) {
            collision = false;
            break;
          }
        }
      }

      if (collision) {
        this.playerMatrix = rotateMatrix(this.playerMatrix, rotationDir === "CW" ? "CCW" : "CW");
        this.playerRotation = prevRotation;
      }
    }

    this.renderPlayerSprite();
    return collision;
  }

  renderGridBlocks() {
    this.gridBlocks.forEach((block) => block.destroy());

    for (let row = 0; row < this.grid.length; row++) {
      for (let col = 0; col < this.grid[row].length; col++) {
        if (this.grid[row][col] !== 0) {
          if (Array.isArray(this.grid[row][col])) {
            //
            const top = this.grid[row][col][0];
            const right = this.grid[row][col][1];
            const bottom = this.grid[row][col][2];
            const left = this.grid[row][col][3];
            let sprite = 14;

            if (this.grid[row][col].length === 4) {
              if (!top && right && !bottom && !left) {
                sprite = 0;
              } else if (!top && right && !bottom && left) {
                sprite = 1;
              } else if (!top && !right && !bottom && left) {
                sprite = 2;
              } else if (!top && !right && bottom && !left) {
                sprite = 3;
              } else if (top && !right && bottom && !left) {
                sprite = 4;
              } else if (top && !right && !bottom && !left) {
                sprite = 5;
              } else if (top && right && !bottom && left) {
                sprite = 6;
              } else if (top && right && bottom && !left) {
                sprite = 7;
              } else if (!top && right && bottom && left) {
                sprite = 8;
              } else if (top && !right && bottom && left) {
                sprite = 9;
              } else if (!top && right && bottom && !left) {
                sprite = 10;
              } else if (top && !right && !bottom && left) {
                sprite = 11;
              } else if (top && right && !bottom && !left) {
                sprite = 12;
              } else if (!top && !right && bottom && left) {
                sprite = 13;
              } else if (!top && !right && !bottom && !left) {
                sprite = 14;
              }
            }

            const color = (this.grid[row][col].flat().filter(Boolean)[0] ?? 8) - 1;

            const block = this.add
              .sprite(
                col * UNIT * BLOCK_SCALE + this.playAreaX,
                row * UNIT * BLOCK_SCALE + this.playAreaY,
                "tiles",
                sprite + 15 * color,
              )
              .setOrigin(0, 0);
            // .setScale(BLOCK_SCALE);
            this.gridBlocks.push(block);
            //
          }
        }
      }
    }
  }

  handleHorizontalMove(time: number) {
    const leftPressed = this.cursors?.left.isDown || this.btnLeftPressed;
    const rightPressed = this.cursors?.right.isDown || this.btnRightPressed;

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

  handleHardDrop() {
    this.inputLocked = true; // Prevent multiple hard drops on a single press

    // Calculate the target row for the hard drop
    const initialRow = this.playerRow;
    let testRow = this.playerRow; // Use a temporary variable
    while (true) {
      testRow += 1;
      this.playerRow = testRow;
      if (this.checkCollision()) {
        testRow -= 1; // Undo the last move that caused the collision
        break;
      }
    }
    const targetRow = testRow;

    // Animate the drop
    const distance = targetRow - initialRow;
    const duration = Phaser.Math.Clamp(distance * 10, 50, 200);

    this.tweens.add({
      targets: this.playerSprite,
      y: targetRow * UNIT * BLOCK_SCALE + this.playAreaY,
      duration,
      ease: "Quad.easeIn",
      onComplete: () => {
        // Update the logical position after the animation
        this.playerRow = targetRow;

        // Lock the piece into the grid after the animation
        const added = this.addPlayerToGrid();
        if (!added) {
          this.playerRow += 1;
          this.renderPlayerSprite();
          this.gameOver = true;
        }

        // Clear completed lines and spawn a new block
        this.clearCompletedLines(() => {
          this.inputLocked = false;
        });
      },
    });
  }

  lockPiece() {
    this.inputLocked = true;
    const added = this.addPlayerToGrid();
    if (!added) {
      this.renderPlayerSprite();
      this.gameOver = true;
    }
    this.clearCompletedLines(() => {
      this.downKeyReleased = false;
    });
  }

  handleVerticalMove(time: number) {
    if (this.cursors?.down.isDown || this.btnDropPressed) {
      if (!this.downKeyReleased) {
        // Block soft drop if the down key hasn't been released
        return;
      }
      if (this.downKeyPressTime === 0) {
        this.lastUpdateTime = time; // Reset timer so we don’t double drop
        // First press
        this.downKeyPressTime = time;
        this.softDropping = false; // Single drop
        const collision = this.renderPlayer("down"); // Immediate single drop
        if (collision) {
          this.lockPiece(); // Lock the piece immediately if it collides
          return;
        }
      } else if (time - this.downKeyPressTime > this.softDropDelay) {
        this.softDropping = true; // Begin fast drop after delay
      }
    } else {
      // Key released
      this.downKeyPressTime = 0;
      this.softDropping = false;
      this.downKeyReleased = true; // Mark the key as released
    }

    const currentSpeed = this.softDropping ? this.softDropSpeed : this.gameSpeed;

    if (time > this.lastUpdateTime + currentSpeed) {
      this.lastUpdateTime = time;
      const collision = this.renderPlayer("down");
      if (collision) {
        this.lockPiece();
      }
      // consoleLogGrid(this.grid);
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

  renderNextPieces() {
    if (this.nextPieces.length < NUMBER_OF_NEXT_BLOCKS) {
      while (this.nextPieces.length < NUMBER_OF_NEXT_BLOCKS) {
        this.nextPieces.push(this.pieceGenerator.generatePiece());
      }
      this.nextPiecesSprites.forEach((s) => s.destroy());
      const playAreaWidth = 10 * UNIT * BLOCK_SCALE;
      for (let i = 0; i < this.nextPieces.length; i++) {
        const sprite = `${this.nextPieces[i]}-0`;
        this.nextPiecesSprites.push(
          this.add
            .sprite(this.playAreaX + playAreaWidth + 40, 130 + 80 * i, "tetrominos", sprite)
            .setScale(0.7)
            .setOrigin(0, 0),
        );
      }
    }
  }

  update(time: number) {
    if (this.pauseGame || this.gameOver || this.inputLocked) {
      return;
    }

    this.handleHorizontalMove(time);
    this.handleVerticalMove(time);
    this.handleRotationalMove();
    this.renderNextPieces();
  }
}
