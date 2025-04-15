import { GAME_HEIGHT, GAME_WIDTH } from "./constants";
import { MainGame } from "./scenes/game";
import { AUTO, Game, Scale, Types } from "phaser";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
  type: AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: "game",
  backgroundColor: "#008080", // "#333",
  scale: {
    mode: Scale.NONE,
    autoCenter: Scale.CENTER_BOTH,
  },
  antialias: false,
  scene: [MainGame],
};

export default new Game(config);
