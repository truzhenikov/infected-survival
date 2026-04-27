import { describe, expect, it } from 'vitest';
import { createDefaultPlayerState } from '../../src/game/constants';
import { UPGRADE_DEFINITIONS, UPGRADE_IDS } from '../../src/game/data/upgrades';
import { applyUpgrade, getUpgradeOffers } from '../../src/game/systems/upgrades';

describe('upgrade data', () => {
  it('contains the expected MVP upgrade ids', () => {
    expect(UPGRADE_IDS).toEqual([
      'fire-rate',
      'max-hp',
      'bullet-damage',
      'ammo-refill',
      'small-heal',
      'trap'
    ]);
  });

  it('has a definition for every MVP upgrade id', () => {
    expect(UPGRADE_DEFINITIONS).toHaveLength(UPGRADE_IDS.length);
    expect(UPGRADE_DEFINITIONS.map((upgrade) => upgrade.id)).toEqual(UPGRADE_IDS);
  });

  it('keeps upgrade metadata non-empty and ids unique', () => {
    expect(new Set(UPGRADE_DEFINITIONS.map((upgrade) => upgrade.id)).size).toBe(UPGRADE_IDS.length);

    for (const upgrade of UPGRADE_DEFINITIONS) {
      expect(upgrade.name.length).toBeGreaterThan(0);
      expect(upgrade.description.length).toBeGreaterThan(0);
    }
  });
});

describe('upgrade system', () => {
  it('offers exactly 3 unique upgrade choices', () => {
    const offers = getUpgradeOffers(createDefaultPlayerState());

    expect(offers).toHaveLength(3);
    expect(new Set(offers.map((offer) => offer.id)).size).toBe(3);
  });

  it('applies upgrades to mutate player stats correctly', () => {
    const state = createDefaultPlayerState();
    state.health = 70;
    state.ammo = 3;

    const upgraded = applyUpgrade(state, 'max-hp');

    expect(upgraded.stats.maxHealth).toBe(120);
    expect(upgraded.health).toBe(90);
    expect(upgraded.ammo).toBe(3);
  });

  it('filters already maxed or invalid upgrade offers', () => {
    const state = createDefaultPlayerState();
    state.health = state.stats.maxHealth;
    state.ammo = state.stats.ammoCapacity;
    state.stats.fireRateMs = 120;
    state.stats.bulletDamage = 60;
    state.stats.trapCharges = 3;

    const offers = getUpgradeOffers(state);

    expect(offers).toHaveLength(1);
    expect(offers[0]?.id).toBe('max-hp');
  });
});
