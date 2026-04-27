import Phaser from 'phaser';
import type { EnemyDefinition } from '../types';

export class Enemy extends Phaser.Physics.Arcade.Image {
  readonly definition: EnemyDefinition;
  health: number;

  constructor(scene: Phaser.Scene, x: number, y: number, definition: EnemyDefinition, instanceId: number, texture = 'enemy') {
    super(scene, x, y, texture);

    this.definition = definition;
    this.health = definition.maxHealth;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setName(`enemy-${definition.id}-${instanceId}`);
    this.setTint(definition.tint);
    this.setDisplaySize(definition.radius * 2, definition.radius * 2);
    this.setDepth(1);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setCollideWorldBounds(false);
    body.setCircle(definition.radius);
    body.setOffset(this.width * 0.5 - definition.radius, this.height * 0.5 - definition.radius);
  }

  seek(target: { x: number; y: number }): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const direction = new Phaser.Math.Vector2(target.x - this.x, target.y - this.y);

    if (direction.lengthSq() === 0) {
      body.setVelocity(0, 0);
      return;
    }

    direction.normalize().scale(this.definition.speed);
    body.setVelocity(direction.x, direction.y);
    this.setRotation(Math.atan2(direction.y, direction.x));
  }
}
