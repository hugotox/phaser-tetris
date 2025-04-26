import { BlockTypesType } from "../constants";

export class PieceGenerator {
  private bag: BlockTypesType[] = [];

  constructor(private blockTypes: BlockTypesType[]) {}

  private shuffleBag() {
    this.bag = [...this.blockTypes];
    for (let i = this.bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
    }
  }

  generatePiece(): BlockTypesType {
    if (this.bag.length === 0) {
      this.shuffleBag();
    }
    const piece = this.bag.pop()!;
    return piece;
  }
}
