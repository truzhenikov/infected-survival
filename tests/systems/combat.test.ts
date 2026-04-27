import { describe, expect, it } from 'vitest';
import {
  applyDamage,
  consumeAmmo,
  reloadWeapon,
  resolveAimAngle,
  resolveJoystickInput,
  selectAutoAimTarget
} from '../../src/game/systems/combat';
import { createGameState, applyPlayerDamage } from '../../src/game/systems/gameState';

describe('combat helpers', () => {
  it('prevents ammo from going below zero when firing', () => {
    expect(consumeAmmo(3)).toBe(2);
    expect(consumeAmmo(1)).toBe(0);
    expect(consumeAmmo(0)).toBe(0);
  });

  it('reloads up to the magazine size and available reserve ammo', () => {
    expect(reloadWeapon({ ammoInMagazine: 2, reserveAmmo: 20, magazineCapacity: 12 })).toEqual({
      ammoInMagazine: 12,
      reserveAmmo: 10,
      ammoLoaded: 10
    });

    expect(reloadWeapon({ ammoInMagazine: 10, reserveAmmo: 1, magazineCapacity: 12 })).toEqual({
      ammoInMagazine: 11,
      reserveAmmo: 0,
      ammoLoaded: 1
    });
  });

  it('leaves ammo unchanged when reloading a full magazine or empty reserve', () => {
    expect(reloadWeapon({ ammoInMagazine: 12, reserveAmmo: 5, magazineCapacity: 12 })).toEqual({
      ammoInMagazine: 12,
      reserveAmmo: 5,
      ammoLoaded: 0
    });

    expect(reloadWeapon({ ammoInMagazine: 4, reserveAmmo: 0, magazineCapacity: 12 })).toEqual({
      ammoInMagazine: 4,
      reserveAmmo: 0,
      ammoLoaded: 0
    });
  });

  it('normalizes invalid reload state before applying ammo transfer', () => {
    expect(reloadWeapon({ ammoInMagazine: 15, reserveAmmo: -4, magazineCapacity: 12 })).toEqual({
      ammoInMagazine: 12,
      reserveAmmo: 0,
      ammoLoaded: 0
    });
  });

  it('applies damage and reports whether the target died', () => {
    expect(applyDamage(30, 10)).toEqual({ health: 20, isDead: false });
    expect(applyDamage(10, 10)).toEqual({ health: 0, isDead: true });
    expect(applyDamage(5, 12)).toEqual({ health: 0, isDead: true });
  });

  it('transitions the game into the dead state when player hp reaches zero', () => {
    const state = createGameState();
    const damaged = applyPlayerDamage(state, 100);

    expect(damaged.player.health).toBe(0);
    expect(damaged.phase).toBe('game-over');
    expect(damaged.canRestart).toBe(true);
  });

  it('ignores negative or zero damage', () => {
    expect(applyDamage(25, 0)).toEqual({ health: 25, isDead: false });
    expect(applyDamage(25, -5)).toEqual({ health: 25, isDead: false });
  });

  it('selects the nearest active target inside range and aim cone', () => {
    const target = selectAutoAimTarget({
      origin: { x: 100, y: 100 },
      facing: { x: 1, y: 0 },
      maxRange: 200,
      aimConeRadians: Math.PI / 2,
      candidates: [
        { id: 'ahead-near', x: 160, y: 110, active: true },
        { id: 'ahead-far', x: 240, y: 95, active: true },
        { id: 'behind', x: 40, y: 100, active: true }
      ]
    });

    expect(target?.id).toBe('ahead-near');
  });

  it('rejects inactive or out-of-cone targets and preserves current target if still valid', () => {
    const target = selectAutoAimTarget({
      origin: { x: 100, y: 100 },
      facing: { x: 0, y: -1 },
      maxRange: 180,
      aimConeRadians: Math.PI / 3,
      currentTargetId: 'locked',
      candidates: [
        { id: 'locked', x: 105, y: 20, active: true },
        { id: 'inactive', x: 102, y: 10, active: false },
        { id: 'side', x: 180, y: 100, active: true },
        { id: 'too-far', x: 100, y: -120, active: true }
      ]
    });

    expect(target?.id).toBe('locked');
  });

  it('retargets when the current target becomes invalid and another valid target exists', () => {
    const target = selectAutoAimTarget({
      origin: { x: 100, y: 100 },
      facing: { x: 1, y: 0 },
      maxRange: 120,
      aimConeRadians: Math.PI / 2,
      currentTargetId: 'lost',
      candidates: [
        { id: 'lost', x: 40, y: 100, active: true },
        { id: 'replacement', x: 160, y: 108, active: true }
      ]
    });

    expect(target?.id).toBe('replacement');
  });

  it('accepts targets on the range and cone boundaries', () => {
    const edgeAngle = Math.PI / 6;
    const distance = 100;
    const target = selectAutoAimTarget({
      origin: { x: 0, y: 0 },
      facing: { x: 1, y: 0 },
      maxRange: distance,
      aimConeRadians: edgeAngle * 2,
      candidates: [
        {
          id: 'edge',
          x: Math.cos(edgeAngle) * distance,
          y: Math.sin(edgeAngle) * distance,
          active: true
        }
      ]
    });

    expect(target?.id).toBe('edge');
  });

  it('returns no target when there are no valid candidates', () => {
    const target = selectAutoAimTarget({
      origin: { x: 100, y: 100 },
      facing: { x: 1, y: 0 },
      maxRange: 50,
      aimConeRadians: Math.PI / 4,
      candidates: [{ id: 'far', x: 180, y: 100, active: true }]
    });

    expect(target).toBeNull();
  });

  it('clamps mobile joystick movement to the control radius and emits a normalized vector', () => {
    expect(
      resolveJoystickInput({
        anchor: { x: 100, y: 100 },
        pointer: { x: 180, y: 140 },
        radius: 50,
        deadzoneRadius: 10
      })
    ).toEqual({
      movement: { x: 0.8944271909999159, y: 0.4472135954999579 },
      knobOffset: { x: 44.721359549995796, y: 22.360679774997898 },
      intensity: 1
    });
  });

  it('treats very small joystick drags as no movement', () => {
    expect(
      resolveJoystickInput({
        anchor: { x: 100, y: 100 },
        pointer: { x: 106, y: 104 },
        radius: 50,
        deadzoneRadius: 12
      })
    ).toEqual({
      movement: { x: 0, y: 0 },
      knobOffset: { x: 0, y: 0 },
      intensity: 0
    });
  });

  it('uses auto-aim target position to resolve the firing angle and falls back to facing when needed', () => {
    expect(
      resolveAimAngle({
        origin: { x: 200, y: 200 },
        fallbackFacing: { x: 0, y: 1 },
        target: { x: 260, y: 200 }
      })
    ).toBe(0);

    expect(
      resolveAimAngle({
        origin: { x: 200, y: 200 },
        fallbackFacing: { x: 0, y: -1 }
      })
    ).toBeCloseTo(-Math.PI / 2);
  });
});
