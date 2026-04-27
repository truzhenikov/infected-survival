export type WaveState = {
  currentWave: number;
  enemiesRemaining: number;
  isIntermission: boolean;
};

export const createInitialWaveState = (): WaveState => ({
  currentWave: 1,
  enemiesRemaining: 0,
  isIntermission: false
});

export const getNextWaveNumber = (currentWave: number): number => currentWave + 1;
