import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Bullet } from '../entities/Bullet';
import { Enemy } from '../entities/Enemy';
import {
  ARENA_MARGIN,
  AUTO_AIM_CONE_RADIANS,
  AUTO_AIM_RANGE,
  BULLET_SPEED,
  FIRE_BUTTON_RADIUS,
  JOYSTICK_RADIUS,
  PLAYER_MOVE_SPEED,
  createDefaultPlayerState
} from '../constants';
import { ENEMY_DEFINITIONS } from '../data/enemies';
import { createWaveDefinition } from '../data/waves';
import type { EnemyId } from '../types';
import {
  consumeAmmo,
  reloadWeapon,
  resolveAimAngle,
  resolveJoystickInput,
  selectAutoAimTarget,
  type AutoAimCandidate
} from '../systems/combat';
import { buildSpawnQueue, createEdgeSpawnPosition, getSpawnEdgeForIndex, resolveSpawnCadence } from '../systems/spawning';

type PointerLike = Pick<Phaser.Input.Pointer, 'id' | 'x' | 'y' | 'worldX' | 'worldY' | 'leftButtonDown'>;

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private bullets!: Phaser.GameObjects.Group;
  private enemies!: Phaser.GameObjects.Group;
  private ammoText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private movementKeys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    reload: Phaser.Input.Keyboard.Key;
  };
  private joystickBase!: Phaser.GameObjects.Arc;
  private joystickThumb!: Phaser.GameObjects.Arc;
  private fireButton!: Phaser.GameObjects.Arc;
  private fireLabel!: Phaser.GameObjects.Text;
  private playerState = createDefaultPlayerState();
  private lastShotAt = Number.NEGATIVE_INFINITY;
  private nextEnemySpawnAt = Number.NEGATIVE_INFINITY;
  private spawnIntervalMs = 1_000;
  private spawnQueue: EnemyId[] = [];
  private spawnSequenceIndex = 0;
  private enemyInstanceId = 0;
  private escHandler?: () => void;
  private resizeHandler?: (gameSize: Phaser.Structs.Size) => void;
  private pointerDownHandler?: (pointer: Phaser.Input.Pointer) => void;
  private pointerMoveHandler?: (pointer: Phaser.Input.Pointer) => void;
  private pointerUpHandler?: (pointer: Phaser.Input.Pointer) => void;
  private joystickPointerId: number | null = null;
  private firePointerId: number | null = null;
  private joystickMovement = new Phaser.Math.Vector2();
  private fireHeld = false;
  private currentAutoAimTargetId?: string;

  constructor() {
    super('game');
  }

  create(): void {
    this.playerState = createDefaultPlayerState();
    this.lastShotAt = Number.NEGATIVE_INFINITY;
    this.currentAutoAimTargetId = undefined;
    this.joystickPointerId = null;
    this.firePointerId = null;
    this.fireHeld = false;
    this.joystickMovement.set(0, 0);

    this.input.addPointer(2);
    this.createPrimitiveTextures();
    this.drawArena();

    this.physics.world.setBounds(
      ARENA_MARGIN,
      ARENA_MARGIN,
      this.scale.width - ARENA_MARGIN * 2,
      this.scale.height - ARENA_MARGIN * 2
    );

    this.player = new Player(this, this.scale.width * 0.5, this.scale.height * 0.5);
    this.player.setTint(0xdbeafe);

    this.bullets = this.add.group({ runChildUpdate: true });
    this.enemies = this.add.group({ runChildUpdate: true });
    const previewWave = createWaveDefinition(1);
    this.spawnQueue = buildSpawnQueue(previewWave.enemies);
    this.spawnIntervalMs = previewWave.spawnIntervalMs;
    this.spawnSequenceIndex = 0;
    this.enemyInstanceId = 0;
    this.nextEnemySpawnAt = this.time.now + 250;

    this.movementKeys = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      reload: Phaser.Input.Keyboard.KeyCodes.R
    }) as GameScene['movementKeys'];

    this.ammoText = this.add.text(20, 20, '', {
      color: '#f9fafb',
      fontFamily: 'Arial',
      fontSize: '18px'
    });
    this.ammoText.setDepth(10).setScrollFactor(0);

    this.hintText = this.add.text(20, 46, 'Left thumb move • right side hold to fire • auto-aim • R reload • ESC menu', {
      color: '#9ca3af',
      fontFamily: 'Arial',
      fontSize: '14px',
      wordWrap: { width: Math.max(240, this.scale.width - 40) }
    });
    this.hintText.setDepth(10).setScrollFactor(0);

    this.createTouchControls();
    this.layoutControls();

    this.escHandler = () => {
      this.scene.start('main-menu');
    };
    this.input.keyboard?.on('keydown-ESC', this.escHandler);

    this.pointerDownHandler = (pointer) => {
      this.handlePointerDown(pointer);
    };
    this.pointerMoveHandler = (pointer) => {
      this.handlePointerMove(pointer);
    };
    this.pointerUpHandler = (pointer) => {
      this.handlePointerUp(pointer);
    };

    this.input.on('pointerdown', this.pointerDownHandler);
    this.input.on('pointermove', this.pointerMoveHandler);
    this.input.on('pointerup', this.pointerUpHandler);

    this.resizeHandler = () => {
      this.layoutControls();
      this.drawArena();
      this.physics.world.setBounds(
        ARENA_MARGIN,
        ARENA_MARGIN,
        this.scale.width - ARENA_MARGIN * 2,
        this.scale.height - ARENA_MARGIN * 2
      );
    };
    this.scale.on(Phaser.Scale.Events.RESIZE, this.resizeHandler);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.escHandler) {
        this.input.keyboard?.off('keydown-ESC', this.escHandler);
      }
      if (this.pointerDownHandler) {
        this.input.off('pointerdown', this.pointerDownHandler);
      }
      if (this.pointerMoveHandler) {
        this.input.off('pointermove', this.pointerMoveHandler);
      }
      if (this.pointerUpHandler) {
        this.input.off('pointerup', this.pointerUpHandler);
      }
      if (this.resizeHandler) {
        this.scale.off(Phaser.Scale.Events.RESIZE, this.resizeHandler);
      }
    });

    this.updateHud();
  }

  update(): void {
    this.spawnEnemiesIfNeeded(this.time.now);

    const movement = this.resolveMovementVector();
    this.player.move(movement, PLAYER_MOVE_SPEED);
    this.updateEnemies();

    const autoAimTarget = this.resolveAutoAimTarget();
    const aimAngle = resolveAimAngle({
      origin: this.player,
      fallbackFacing: movement.lengthSq() > 0 ? movement : this.player.getFacingVector(),
      target: autoAimTarget
    });
    this.player.aimInDirection({ x: Math.cos(aimAngle), y: Math.sin(aimAngle) });

    if (Phaser.Input.Keyboard.JustDown(this.movementKeys.reload)) {
      this.reload();
    }

    if (this.fireHeld || this.isDesktopFirePressed()) {
      this.tryFire(this.time.now, autoAimTarget);
    }
  }

  private resolveMovementVector(): Phaser.Math.Vector2 {
    if (this.joystickMovement.lengthSq() > 0) {
      return this.joystickMovement.clone();
    }

    return new Phaser.Math.Vector2(
      Number(this.movementKeys.right.isDown) - Number(this.movementKeys.left.isDown),
      Number(this.movementKeys.down.isDown) - Number(this.movementKeys.up.isDown)
    ).normalize();
  }

  private resolveAutoAimTarget(): AutoAimCandidate | null {
    const target = selectAutoAimTarget({
      origin: this.player,
      facing: this.player.getFacingVector(),
      maxRange: AUTO_AIM_RANGE,
      aimConeRadians: AUTO_AIM_CONE_RADIANS,
      currentTargetId: this.currentAutoAimTargetId,
      candidates: this.getAutoAimCandidates()
    });

    this.currentAutoAimTargetId = target?.id;
    return target;
  }

  private getAutoAimCandidates(): AutoAimCandidate[] {
    return this.enemies
      .getChildren()
      .filter((child): child is Enemy => child instanceof Enemy)
      .map((enemy) => ({
        id: enemy.name ?? `${enemy.x}-${enemy.y}`,
        x: enemy.x,
        y: enemy.y,
        active: enemy.active
      }));
  }

  private tryFire(time: number, autoAimTarget: AutoAimCandidate | null): void {
    if (this.playerState.ammo <= 0 || time - this.lastShotAt < this.playerState.stats.fireRateMs) {
      return;
    }

    const shotAngle = resolveAimAngle({
      origin: this.player,
      fallbackFacing: this.player.getFacingVector(),
      target: autoAimTarget
    });

    this.playerState.ammo = consumeAmmo(this.playerState.ammo);
    this.lastShotAt = time;

    const bullet = new Bullet(
      this,
      this.player.x + Math.cos(shotAngle) * 20,
      this.player.y + Math.sin(shotAngle) * 20,
      shotAngle,
      BULLET_SPEED,
      this.playerState.stats.bulletDamage
    );

    this.bullets.add(bullet);
    this.updateHud();
  }

  private reload(): void {
    const result = reloadWeapon({
      ammoInMagazine: this.playerState.ammo,
      reserveAmmo: this.playerState.reserveAmmo,
      magazineCapacity: this.playerState.stats.ammoCapacity
    });

    this.playerState.ammo = result.ammoInMagazine;
    this.playerState.reserveAmmo = result.reserveAmmo;
    this.updateHud();
  }

  private updateHud(): void {
    this.ammoText.setText(
      `HP ${this.playerState.health}/${this.playerState.stats.maxHealth}   Ammo ${this.playerState.ammo}/${this.playerState.stats.ammoCapacity}   Reserve ${this.playerState.reserveAmmo}   Infected ${this.enemies.countActive(true)}`
    );
  }

  private spawnEnemiesIfNeeded(time: number): void {
    const cadence = resolveSpawnCadence({
      now: time,
      nextSpawnAt: this.nextEnemySpawnAt,
      intervalMs: this.spawnIntervalMs,
      remainingCount: this.spawnQueue.length
    });

    if (cadence.spawnCount === 0) {
      return;
    }

    this.nextEnemySpawnAt = cadence.nextSpawnAt;

    const arena = {
      left: ARENA_MARGIN,
      top: ARENA_MARGIN,
      right: this.scale.width - ARENA_MARGIN,
      bottom: this.scale.height - ARENA_MARGIN
    };

    for (let spawnIndex = 0; spawnIndex < cadence.spawnCount; spawnIndex += 1) {
      const nextEnemyId = this.spawnQueue.shift();
      if (!nextEnemyId) {
        this.nextEnemySpawnAt = Number.POSITIVE_INFINITY;
        break;
      }

      const progress = ((this.spawnSequenceIndex % 5) + 1) / 6;
      const edge = getSpawnEdgeForIndex(this.spawnSequenceIndex);
      const spawnPosition = createEdgeSpawnPosition({ arena, edge, progress });
      const enemy = new Enemy(
        this,
        spawnPosition.x,
        spawnPosition.y,
        ENEMY_DEFINITIONS[nextEnemyId],
        this.enemyInstanceId++
      );

      this.enemies.add(enemy);
      this.spawnSequenceIndex += 1;
    }

    if (this.spawnQueue.length === 0) {
      this.nextEnemySpawnAt = Number.POSITIVE_INFINITY;
    }

    this.updateHud();
  }

  private updateEnemies(): void {
    this.enemies
      .getChildren()
      .filter((child): child is Enemy => child instanceof Enemy)
      .forEach((enemy) => enemy.seek(this.player));
  }

  private createTouchControls(): void {
    this.joystickBase = this.add.circle(0, 0, JOYSTICK_RADIUS, 0x111827, 0.28);
    this.joystickBase.setStrokeStyle(2, 0x94a3b8, 0.6).setDepth(10).setScrollFactor(0);

    this.joystickThumb = this.add.circle(0, 0, JOYSTICK_RADIUS * 0.46, 0xe2e8f0, 0.4);
    this.joystickThumb.setStrokeStyle(2, 0xf8fafc, 0.8).setDepth(11).setScrollFactor(0);

    this.fireButton = this.add.circle(0, 0, FIRE_BUTTON_RADIUS, 0xf97316, 0.28);
    this.fireButton.setStrokeStyle(3, 0xfb923c, 0.9).setDepth(10).setScrollFactor(0);

    this.fireLabel = this.add.text(0, 0, 'FIRE', {
      color: '#fff7ed',
      fontFamily: 'Arial',
      fontSize: '18px'
    });
    this.fireLabel.setOrigin(0.5).setDepth(11).setScrollFactor(0);
  }

  private layoutControls(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const bottomInset = Math.max(76, Math.min(height * 0.18, 120));
    const sideInset = Math.max(28, Math.min(width * 0.08, 64));

    this.joystickBase.setPosition(sideInset + JOYSTICK_RADIUS, height - bottomInset);
    this.joystickThumb.setPosition(this.joystickBase.x, this.joystickBase.y);
    this.fireButton.setPosition(width - sideInset - FIRE_BUTTON_RADIUS, height - bottomInset);
    this.fireLabel.setPosition(this.fireButton.x, this.fireButton.y);

    this.hintText.setWordWrapWidth(Math.max(220, width - 40));
  }

  private handlePointerDown(pointer: PointerLike): void {
    if (pointer.leftButtonDown && !pointer.leftButtonDown()) {
      return;
    }

    if (this.isLeftControlZone(pointer) && this.joystickPointerId === null) {
      this.joystickPointerId = pointer.id;
      this.updateJoystick(pointer);
      return;
    }

    if (this.firePointerId === null) {
      this.firePointerId = pointer.id;
      this.fireHeld = true;
      this.setFireButtonPressed(true);
    }
  }

  private handlePointerMove(pointer: PointerLike): void {
    if (pointer.id === this.joystickPointerId) {
      this.updateJoystick(pointer);
    }
  }

  private handlePointerUp(pointer: PointerLike): void {
    if (pointer.id === this.joystickPointerId) {
      this.joystickPointerId = null;
      this.joystickMovement.set(0, 0);
      this.joystickThumb.setPosition(this.joystickBase.x, this.joystickBase.y);
    }

    if (pointer.id === this.firePointerId) {
      this.firePointerId = null;
      this.fireHeld = false;
      this.setFireButtonPressed(false);
    }
  }

  private updateJoystick(pointer: Pick<PointerLike, 'x' | 'y'>): void {
    const result = resolveJoystickInput({
      anchor: { x: this.joystickBase.x, y: this.joystickBase.y },
      pointer,
      radius: JOYSTICK_RADIUS,
      deadzoneRadius: JOYSTICK_RADIUS * 0.2
    });

    this.joystickMovement.set(result.movement.x * result.intensity, result.movement.y * result.intensity);
    this.joystickThumb.setPosition(
      this.joystickBase.x + result.knobOffset.x,
      this.joystickBase.y + result.knobOffset.y
    );
  }

  private isLeftControlZone(pointer: Pick<PointerLike, 'x'>): boolean {
    return pointer.x <= this.scale.width * 0.5;
  }

  private isDesktopFirePressed(): boolean {
    const activePointer = this.input.activePointer;
    return activePointer.leftButtonDown() && !this.isLeftControlZone(activePointer);
  }

  private setFireButtonPressed(pressed: boolean): void {
    this.fireButton.setFillStyle(pressed ? 0xfb923c : 0xf97316, pressed ? 0.5 : 0.28);
    this.fireButton.setScale(pressed ? 0.94 : 1);
    this.fireLabel.setScale(pressed ? 0.96 : 1);
  }

  private drawArena(): void {
    this.cameras.main.setBackgroundColor('#0b1220');

    this.children.getByName('arena-background')?.destroy();
    this.children.getByName('arena-bounds')?.destroy();

    this.add
      .rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x1f2937)
      .setName('arena-background');
    this.add
      .rectangle(
        this.scale.width / 2,
        this.scale.height / 2,
        this.scale.width - ARENA_MARGIN * 2,
        this.scale.height - ARENA_MARGIN * 2,
        0x2d3748
      )
      .setName('arena-bounds')
      .setStrokeStyle(4, 0xf59e0b, 0.7);
  }

  private createPrimitiveTextures(): void {
    if (!this.textures.exists('player')) {
      const playerGraphics = this.make.graphics({ x: 0, y: 0 }, false);
      playerGraphics.fillStyle(0xe5e7eb, 1);
      playerGraphics.fillCircle(16, 16, 16);
      playerGraphics.lineStyle(3, 0x111827, 1);
      playerGraphics.strokeCircle(16, 16, 16);
      playerGraphics.generateTexture('player', 32, 32);
      playerGraphics.destroy();
    }

    if (!this.textures.exists('bullet')) {
      const bulletGraphics = this.make.graphics({ x: 0, y: 0 }, false);
      bulletGraphics.fillStyle(0xf59e0b, 1);
      bulletGraphics.fillCircle(4, 4, 4);
      bulletGraphics.generateTexture('bullet', 8, 8);
      bulletGraphics.destroy();
    }

    if (!this.textures.exists('enemy')) {
      const enemyGraphics = this.make.graphics({ x: 0, y: 0 }, false);
      enemyGraphics.fillStyle(0xffffff, 1);
      enemyGraphics.fillCircle(16, 16, 16);
      enemyGraphics.lineStyle(3, 0x111827, 1);
      enemyGraphics.strokeCircle(16, 16, 16);
      enemyGraphics.generateTexture('enemy', 32, 32);
      enemyGraphics.destroy();
    }
  }
}
