import { describe, expect, it } from 'vitest';
import { ENEMY_DEFINITIONS } from '../../src/game/data/enemies';
import {
  WAVE_DEFINITIONS,
  createWaveDefinition,
  getWaveDifficultyScore
} from '../../src/game/data/waves';

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

  it('introduces heavies starting on wave 4', () => {
    expect(createWaveDefinition(3).enemies.find((entry) => entry.enemyId === 'heavy')).toBeUndefined();
    expect(createWaveDefinition(4).enemies.find((entry) => entry.enemyId === 'heavy')?.count).toBe(1);
  });

  it('reduces spawn interval until it reaches the configured floor', () => {
    expect(createWaveDefinition(1).spawnIntervalMs).toBe(1040);
    expect(createWaveDefinition(10).spawnIntervalMs).toBe(500);
    expect(createWaveDefinition(20).spawnIntervalMs).toBe(350);
  });

  it('rejects invalid wave numbers', () => {
    expect(() => createWaveDefinition(0)).toThrow('waveNumber must be a positive integer');
    expect(() => createWaveDefinition(1.5)).toThrow('waveNumber must be a positive integer');
  });

  it('includes runner and heavy enemy definitions', () => {
    expect(ENEMY_DEFINITIONS.runner).toBeDefined();
    expect(ENEMY_DEFINITIONS.heavy).toBeDefined();
    expect(ENEMY_DEFINITIONS.runner.speed).toBeGreaterThan(ENEMY_DEFINITIONS.heavy.speed);
    expect(ENEMY_DEFINITIONS.heavy.maxHealth).toBeGreaterThan(ENEMY_DEFINITIONS.runner.maxHealth);
  });

  it('publishes the first ten wave definitions', () => {
    expect(WAVE_DEFINITIONS).toHaveLength(10);
    expect(WAVE_DEFINITIONS[0].number).toBe(1);
    expect(WAVE_DEFINITIONS[9].number).toBe(10);
  });
});
