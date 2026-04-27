import { ENEMY_DEFINITIONS } from './enemies';
import type { WaveDefinition, WaveEnemyEntry } from '../types';

const getRunnerCount = (waveNumber: number): number => 4 + waveNumber * 2;
const getHeavyCount = (waveNumber: number): number => Math.max(0, Math.floor((waveNumber - 2) / 2));

export const createWaveDefinition = (waveNumber: number): WaveDefinition => {
  const enemies: WaveEnemyEntry[] = [
    { enemyId: 'runner', count: getRunnerCount(waveNumber) }
  ];

  const heavyCount = getHeavyCount(waveNumber);
  if (heavyCount > 0) {
    enemies.push({ enemyId: 'heavy', count: heavyCount });
  }

  return {
    number: waveNumber,
    spawnIntervalMs: Math.max(350, 1100 - waveNumber * 60),
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
