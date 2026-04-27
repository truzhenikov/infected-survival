import { createWaveDefinition } from '../data/waves';
import type { WaveDefinition } from '../types';

export type WavePhase = 'spawning' | 'active' | 'cleared';

export type WaveProgressState = {
  wave: WaveDefinition;
  phase: WavePhase;
  totalEnemies: number;
  spawnedEnemies: number;
  activeEnemies: number;
  defeatedEnemies: number;
};

const getTotalEnemies = (wave: WaveDefinition): number => wave.enemies.reduce((total, entry) => total + entry.count, 0);

const getWavePhase = ({ totalEnemies, spawnedEnemies, activeEnemies }: Omit<WaveProgressState, 'wave' | 'defeatedEnemies' | 'phase'>): WavePhase => {
  if (spawnedEnemies >= totalEnemies && activeEnemies <= 0) {
    return 'cleared';
  }

  if (spawnedEnemies > 0) {
    return 'active';
  }

  return 'spawning';
};

export const createWaveProgressState = (waveNumber: number): WaveProgressState => {
  const wave = createWaveDefinition(waveNumber);
  const totalEnemies = getTotalEnemies(wave);

  return {
    wave,
    phase: 'spawning',
    totalEnemies,
    spawnedEnemies: 0,
    activeEnemies: 0,
    defeatedEnemies: 0
  };
};

export const registerEnemySpawn = (state: WaveProgressState, count = 1): WaveProgressState => {
  const safeCount = Math.max(0, Math.floor(count));
  const spawnCount = Math.min(safeCount, state.totalEnemies - state.spawnedEnemies);
  const spawnedEnemies = state.spawnedEnemies + spawnCount;
  const activeEnemies = state.activeEnemies + spawnCount;

  return {
    ...state,
    spawnedEnemies,
    activeEnemies,
    phase: getWavePhase({
      totalEnemies: state.totalEnemies,
      spawnedEnemies,
      activeEnemies
    })
  };
};

export const registerEnemyDefeat = (state: WaveProgressState, count = 1): WaveProgressState => {
  const safeCount = Math.max(0, Math.floor(count));
  const defeatCount = Math.min(safeCount, state.activeEnemies);
  const activeEnemies = state.activeEnemies - defeatCount;
  const defeatedEnemies = Math.min(state.totalEnemies, state.defeatedEnemies + defeatCount);

  return {
    ...state,
    activeEnemies,
    defeatedEnemies,
    phase: getWavePhase({
      totalEnemies: state.totalEnemies,
      spawnedEnemies: state.spawnedEnemies,
      activeEnemies
    })
  };
};

export const advanceToNextWave = (state: Pick<WaveProgressState, 'wave'>): WaveProgressState =>
  createWaveProgressState(state.wave.number + 1);

export const createInitialWaveState = (): WaveProgressState => createWaveProgressState(1);

export const getNextWaveNumber = (currentWave: number): number => currentWave + 1;
