import Phaser from 'phaser';
import { gameConfig } from './game/config';

const container = document.getElementById('app');

if (!container) {
  throw new Error('Missing #app container');
}

new Phaser.Game({
  ...gameConfig,
  parent: container
});
