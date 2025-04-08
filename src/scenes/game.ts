import { Scene } from 'phaser';
import {
  BLOCK_DEFS,
  BlockFrameType,
  BlockRotationType,
  BlockType,
  UNIT,
} from '../constants';

export class MainGame extends Scene {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  canRotate: boolean = true;
  canMove: boolean = true;
  grid = Array.from({ length: 20 }, () => Array(10).fill(0));
  currentBlockType: BlockType = 'I';
  currentBlockRotation: BlockRotationType = 1;
  activeBlock: Phaser.GameObjects.Sprite | undefined;
  activeBlockX = 0;
  activeBlockY = 0;

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

  removeBlockFromGrid() {
    const blockFrame: BlockFrameType = `${this.currentBlockType}-${this.currentBlockRotation}`;
    const blockDefinition = BLOCK_DEFS[blockFrame];

    // reset block spots on the grid
    for (let row = 0; row < blockDefinition.length; row++) {
      for (let col = 0; col < blockDefinition[row].length; col++) {
        this.grid[this.activeBlockY + row][this.activeBlockX + col] = 0;
      }
    }
  }

  addBlockToGrid() {
    const blockFrame: BlockFrameType = `${this.currentBlockType}-${this.currentBlockRotation}`;
    const blockDefinition = BLOCK_DEFS[blockFrame];

    // update grid with the block definition
    for (let row = 0; row < blockDefinition.length; row++) {
      for (let col = 0; col < blockDefinition[row].length; col++) {
        this.grid[this.activeBlockY + row][this.activeBlockX + col] =
          blockDefinition[row][col];
      }
    }
  }

  renderBlock({
    moveLeft = false,
    moveRight = false,
    rotate = false,
  }: {
    moveLeft?: boolean;
    moveRight?: boolean;
    rotate?: boolean;
  } = {}) {
    this.removeBlockFromGrid();

    let blockFrame: BlockFrameType = `${this.currentBlockType}-${this.currentBlockRotation}`;

    if (rotate) {
      if (this.currentBlockRotation < 4) {
        this.currentBlockRotation++;
      } else {
        this.currentBlockRotation = 1;
      }

      blockFrame =
        `${this.currentBlockType}-${this.currentBlockRotation}` as BlockFrameType;
    }

    if (moveLeft) {
      this.activeBlockX -= 1;
    }
    if (moveRight) {
      this.activeBlockX += 1;
    }

    let offsetX = 0;
    let offsetY = 0;
    // one off offset for the I block
    if (this.currentBlockType === 'I') {
      if (this.currentBlockRotation === 1 || this.currentBlockRotation === 3) {
        offsetX = UNIT;
      } else {
        offsetY = UNIT;
      }
    }

    const newX = this.activeBlockX * UNIT + offsetX;
    const newY = this.activeBlockY * UNIT + offsetY;

    if (!this.activeBlock) {
      this.activeBlock = this.add
        .sprite(newX, newY, 'tetrominos', blockFrame)
        .setOrigin(0, 0);
    } else {
      this.activeBlock.setFrame(blockFrame);
      this.activeBlock.setX(newX);
      this.activeBlock.setY(newY);
    }

    this.addBlockToGrid();

    this.consoleLogGrid();
  }

  update() {
    if (this.cursors.up.isDown && this.canRotate) {
      this.canRotate = false;
      this.renderBlock({ rotate: true });
    }
    if (this.cursors.up.isUp && !this.canRotate) {
      this.canRotate = true;
    }
    if (this.cursors.left.isDown && this.canMove) {
      this.canMove = false;
      this.renderBlock({ moveLeft: true });
    }
    if (this.cursors.right.isDown && this.canMove) {
      this.canMove = false;
      this.renderBlock({ moveRight: true });
    }
    if (this.cursors.left.isUp && this.cursors?.right.isUp && !this.canMove) {
      this.canMove = true;
    }
  }

  consoleLogGrid() {
    console.clear();
    let gridString = '';
    for (let row = 0; row < this.grid.length; row++) {
      if (row === 0) {
        gridString += '    ';
        for (let col = 0; col < this.grid[row].length; col++) {
          gridString += String(col) + '  ';
        }
        gridString += '\n';
      }
      gridString += `${String(row).padStart(2, ' ')}: `;
      for (let col = 0; col < this.grid[row].length; col++) {
        gridString += String(this.grid[row][col] ? '1' : '.') + '  ';
      }
      gridString += '\n';
    }
    console.log(gridString);
  }
}
