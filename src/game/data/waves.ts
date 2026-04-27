import { ENEMY_DEFINITIONS } from './enemies';
import type { WaveDefinition, WaveEnemyEntry } from '../types';

const MIN_SPAWN_INTERVAL_MS = 350;
const INITIAL_SPAWN_INTERVAL_MS = 1100;
const SPAWN_INTERVAL_STEP_MS = 60;

const getRunnerCount = (waveNumber: number): number => 4 + waveNumber * 2;
const getHeavyCount = (waveNumber: number): number => Math.max(0, Math.floor((waveNumber - 2) / 2));

export const createWaveDefinition = (waveNumber: number): WaveDefinition => {
  if (!Number.isInteger(waveNumber) || waveNumber < 1) {
    throw new Error('waveNumber must be a positive integer');
  }

  const enemies: WaveEnemyEntry[] = [{ enemyId: 'runner', count: getRunnerCount(waveNumber) }];
  const heavyCount = getHeavyCount(waveNumber);

  if (heavyCount > 0) {
    enemies.push({ enemyId: 'heavy', count: heavyCount });
  }

  return {
    number: waveNumber,
    spawnIntervalMs: Math.max(
      MIN_SPAWN_INTERVAL_MS,
      INITIAL_SPAWN_INTERVAL_MS - waveNumber * SPAWN_INTERVAL_STEP_MS
    ),
    enemies
  };
};

export const getWaveDifficultyScore = (wave: WaveDefinition): number =>
  wave.enemies.reduce(
    (total, entry) => total + ENEMY_DEFINITIONS[entry.enemyId].difficultyWeight * entry.count,
    0
  );

export const WAVE_DEFINITIONS: WaveDefinition[] = Array.from({ length: 10 }, (_, index) =>
  createWaveDefinition(index + 1)
);
