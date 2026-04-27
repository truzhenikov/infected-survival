import { describe, expect, it } from 'vitest';
import { ENEMY_DEFINITIONS } from '../../src/game/data/enemies';
import { createWaveDefinition, getWaveDifficultyScore } from '../../src/game/data/waves';

describe('wave data', () => {
  it('creates waves with increasing difficulty', () => {
    const wave1 = createWaveDefinition(1);
    const wave2 = createWaveDefinition(2);
    const wave5 = createWaveDefinition(5);

    expect(wave1.number).toBe(1);
    expect(wave2.number).toBe(2);
    expect(wave5.number).toBe(5);

    expect(getWaveDifficultyScore(wave2)).toBeGreaterThan(getWaveDifficultyScore(wave1));
    expect(getWaveDifficultyScore(wave5)).toBeGreaterThan(getWaveDifficultyScore(wave2));
  });

  it('includes runner and heavy enemy definitions', () => {
    expect(ENEMY_DEFINITIONS.runner).toBeDefined();
    expect(ENEMY_DEFINITIONS.heavy).toBeDefined();
    expect(ENEMY_DEFINITIONS.runner.speed).toBeGreaterThan(ENEMY_DEFINITIONS.heavy.speed);
    expect(ENEMY_DEFINITIONS.heavy.maxHealth).toBeGreaterThan(ENEMY_DEFINITIONS.runner.maxHealth);
  });
});
