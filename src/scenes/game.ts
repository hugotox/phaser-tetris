/* eslint-disable indent */
import { Scene } from 'phaser';
import { BlockTypes, TETROMINOES, UNIT } from '../constants';

export class MainGame extends Scene {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  canRotate: boolean = true;
  canMove: boolean = true;
  grid = Array.from({ length: 20 }, () => Array(10).fill(0));
  playerSprite: Phaser.GameObjects.Sprite | undefined;
  playerRow = 0;
  playerCol = 0;
  playerRotation: 1 | 2 | 3 | 4 = 1;
  playerType: BlockTypes = 'I';
  playerMatrix = TETROMINOES[this.playerType];

  constructor() {
    super('Game');
  }

  preload() {
    this.load.atlas(
      'tetrominos',
      'assets/tetris-blocks.png',
      'assets/tetris-blocks.json',
    );
  }

  create() {
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.renderBlock();
  }

  rotate(player: number[][], dir: 'right' | 'left' = 'right') {
    const matrix = JSON.parse(JSON.stringify(player));
    for (let y = 0; y < matrix.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
      }
    }
    if (dir === 'right') {
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
            typeof this.grid[this.playerRow + x]?.[this.playerCol + y] ===
              'undefined' ||
            this.grid[this.playerRow + x]?.[this.playerCol + y] !== 0
          )
            return true;
        }
      }
    }
    return false;
  }

  renderBlockSprite() {
    const sprite = `${this.playerType}-${this.playerRotation}`;
    let newX = this.playerCol;
    let newY = this.playerRow;
    switch (this.playerType) {
      case 'I':
        if (this.playerRotation === 1) {
          newY += 1;
        } else if (this.playerRotation === 2) {
          newX += 2;
        } else if (this.playerRotation === 3) {
          newY += 2;
        } else if (this.playerRotation === 4) {
          newX += 1;
        }
        break;
      case 'T':
        if (this.playerRotation === 2) {
          newX += 1;
        } else if (this.playerRotation === 3) {
          newY += 1;
        }
        break;
    }
    if (!this.playerSprite) {
      this.playerSprite = this.add
        .sprite(newX * UNIT, newY * UNIT, 'tetrominos', sprite)
        .setOrigin(0, 0);
    } else {
      this.playerSprite.setFrame(sprite);
      this.playerSprite.setX(newX * UNIT);
      this.playerSprite.setY(newY * UNIT);
    }
  }

  renderBlock(move?: 'right' | 'left' | 'down' | 'rotate') {
    switch (move) {
      case 'right':
        this.playerCol += 1;
        if (this.checkCollision()) {
          this.playerCol -= 1;
        }
        break;
      case 'left':
        this.playerCol -= 1;
        if (this.checkCollision()) {
          this.playerCol += 1;
        }
        break;
      case 'down':
        this.playerRow += 1;
        if (this.checkCollision()) {
          this.playerRow -= 1;
        }
        break;
      case 'rotate':
        this.playerMatrix = this.rotate(this.playerMatrix);
        if (this.playerRotation < 4) {
          this.playerRotation += 1;
        } else {
          this.playerRotation = 1;
        }
        if (this.checkCollision()) {
          this.playerMatrix = this.rotate(this.playerMatrix, 'left');
          if (this.playerRotation === 1) {
            this.playerRotation = 4;
          } else {
            this.playerRotation -= 1;
          }
        }
    }

    this.renderBlockSprite();

    // this.consoleLogGrid();
  }

  update() {
    if (this.cursors.up.isDown && this.canRotate) {
      this.canRotate = false;
      this.renderBlock('rotate');
    }
    if (this.cursors.up.isUp && !this.canRotate) {
      this.canRotate = true;
    }
    if (this.cursors.left.isDown && this.canMove) {
      this.canMove = false;
      this.renderBlock('left');
    }
    if (this.cursors.right.isDown && this.canMove) {
      this.canMove = false;
      this.renderBlock('right');
    }
    if (this.cursors.down.isDown && this.canMove) {
      this.canMove = false;
      this.renderBlock('down');
    }
    if (
      this.cursors.left.isUp &&
      this.cursors?.right.isUp &&
      this.cursors?.down.isUp &&
      !this.canMove
    ) {
      this.canMove = true;
    }
  }

  consoleLogGrid() {
    console.clear();
    console.log({
      X: this.playerRow,
      Y: this.playerCol,
      R: this.playerRotation,
    });
    let gridString = '';
    for (let row = 0; row < this.grid.length; row++) {
      if (row === 0) {
        gridString += '    ';
        for (let col = 0; col < this.grid[row].length; col++) {
          gridString += String(col) + '   ';
        }
        gridString += '\n';
      }
      gridString += `${String(row).padStart(2, ' ')}: `;
      for (let col = 0; col < this.grid[row].length; col++) {
        gridString +=
          String(this.grid[row][col] ? this.grid[row][col] : '.') + '   ';
      }
      gridString += '\n';
    }
    console.log(gridString);
  }
}
