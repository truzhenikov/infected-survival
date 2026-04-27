import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainMenuScene } from './scenes/MainMenuScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  backgroundColor: '#111827',
  scene: [BootScene, MainMenuScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};
