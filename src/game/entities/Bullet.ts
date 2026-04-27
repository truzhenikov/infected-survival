import Phaser from 'phaser';

export class Bullet extends Phaser.Physics.Arcade.Image {
  private readonly spawnedAt: number;
  private readonly lifetimeMs: number;
  readonly damage: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    angle: number,
    speed: number,
    damage: number,
    texture = 'bullet'
  ) {
    super(scene, x, y, texture);

    this.damage = damage;
    this.lifetimeMs = 900;
    this.spawnedAt = scene.time.now;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setRotation(angle);
    this.setDepth(2);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setCircle(this.width * 0.5);
    scene.physics.velocityFromRotation(angle, speed, body.velocity);
  }

  update(): void {
    if (!this.active) {
      return;
    }

    const outOfBounds =
      this.x < -32 ||
      this.y < -32 ||
      this.x > this.scene.scale.width + 32 ||
      this.y > this.scene.scale.height + 32;

    if (outOfBounds || this.scene.time.now - this.spawnedAt > this.lifetimeMs) {
      this.destroy();
    }
  }
}
