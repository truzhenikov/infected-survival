import Phaser from 'phaser';
import { normalizeVector, type VectorLike } from '../systems/combat';

export class Player extends Phaser.Physics.Arcade.Image {
  private facing: VectorLike = { x: 1, y: 0 };

  constructor(scene: Phaser.Scene, x: number, y: number, texture = 'player') {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setCollideWorldBounds(true);

    this.setDepth(2);
  }

  move(direction: Phaser.Math.Vector2, speed: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (direction.lengthSq() > 0) {
      const intensity = Phaser.Math.Clamp(direction.length(), 0, 1);
      direction.normalize().scale(speed * intensity);
      body.setVelocity(direction.x, direction.y);
    } else {
      body.setVelocity(0, 0);
    }
  }

  aimAt(x: number, y: number): void {
    this.aimInDirection({
      x: x - this.x,
      y: y - this.y
    });
  }

  aimInDirection(direction: VectorLike): void {
    this.facing = normalizeVector(direction);
    this.setRotation(Math.atan2(this.facing.y, this.facing.x));
  }

  getFacingVector(): VectorLike {
    return { ...this.facing };
  }
}
