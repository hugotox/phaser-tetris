import { Scene } from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "../constants";

export class StartScene extends Scene {
  constructor() {
    super("Start");
  }

  preload() {
    this.load.bitmapFont("arcade", "assets/arcade.png", "assets/arcade.xml");
    this.load.image("background", "assets/background.png");
  }

  create() {
    this.add
      .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "background")
      .setAlpha(0.3)
      .setOrigin(0.5);
    this.add
      .bitmapText(GAME_WIDTH / 2, 200, "arcade", "PHASER TETRIS", 48)
      .setOrigin(0.5)
      .setTint(0xffe066);
    this.add
      .bitmapText(GAME_WIDTH / 2, 320, "arcade", "Press SPACE to Start", 24)
      .setOrigin(0.5)
      .setTint(0xffffff);
    this.add
      .bitmapText(
        GAME_WIDTH / 2,
        400,
        "arcade",
        "Arrow keys: Move\nUp/Z: Rotate\nSpace: Hard Drop",
        18,
      )
      .setOrigin(0.5)
      .setTint(0xcccccc);

    this.input.keyboard?.on("keydown-SPACE", () => {
      this.scene.start("Game");
    });
    this.input.on("pointerdown", () => {
      this.scene.start("Game");
    });
  }
}
