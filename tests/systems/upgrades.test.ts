import { describe, expect, it } from 'vitest';
import { UPGRADE_DEFINITIONS, UPGRADE_IDS } from '../../src/game/data/upgrades';

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
