import { COLUMNS, ROWS, UNIT } from './constants';
import { MainGame } from './scenes/game';
import { AUTO, Game, Scale, Types } from 'phaser';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
  type: AUTO,
  width: COLUMNS * UNIT,
  height: ROWS * UNIT,
  parent: 'game',
  backgroundColor: '#000',
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
  antialias: false,
  scene: [MainGame],
};

export default new Game(config);
