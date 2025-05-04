export class GravityManager {
  level: number = 0;
  linesCleared: number = 0;
  currentSpeed: number = 800; // in ms

  constructor(startLevel: number = 0) {
    this.level = startLevel;
    this.updateSpeed();
  }

  // Call this after each line clear
  addClearedLines(count: number) {
    this.linesCleared += count;

    // NES rules: Level up every 10 lines from starting point
    const target = this.level < 10 ? (this.level + 1) * 10 : 100 + (this.level - 9) * 10;

    if (this.linesCleared >= target) {
      this.level++;
      this.updateSpeed();
    }
  }

  updateSpeed() {
    let framesPerCell: number;

    if (this.level <= 8) {
      const frameTable = [48, 43, 38, 33, 28, 23, 18, 13, 8];
      framesPerCell = frameTable[this.level];
    } else if (this.level === 9) {
      framesPerCell = 6;
    } else if (this.level <= 12) {
      framesPerCell = 5;
    } else if (this.level <= 15) {
      framesPerCell = 4;
    } else if (this.level <= 18) {
      framesPerCell = 3;
    } else if (this.level <= 28) {
      framesPerCell = 2;
    } else {
      framesPerCell = 1; // level 29+
    }

    this.currentSpeed = (framesPerCell / 60) * 1000;
  }
}
