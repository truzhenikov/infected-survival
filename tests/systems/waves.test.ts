import { describe, expect, it } from 'vitest';
import {
  createInitialWaveState,
  getNextWaveNumber
} from '../../src/game/systems/waves';

describe('waves system scaffold', () => {
  it('creates the expected initial wave state', () => {
    expect(createInitialWaveState()).toEqual({
      currentWave: 1,
      enemiesRemaining: 0,
      isIntermission: false
    });
  });

  it('increments the wave number', () => {
    expect(getNextWaveNumber(1)).toBe(2);
  });
});
