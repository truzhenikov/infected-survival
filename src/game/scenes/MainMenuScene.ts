import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('main-menu');
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2 - 20, 'Infected Survival', {
        color: '#f9fafb',
        fontFamily: 'Arial',
        fontSize: '40px'
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 40, 'Click or press SPACE to enter the yard', {
        color: '#9ca3af',
        fontFamily: 'Arial',
        fontSize: '18px'
      })
      .setOrigin(0.5);

    this.input.once('pointerdown', () => this.scene.start('game'));
    this.input.keyboard?.once('keydown-SPACE', () => this.scene.start('game'));
  }
}
