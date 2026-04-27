import type { PlayerState, PlayerStats } from './types';

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  maxHealth: 100,
  fireRateMs: 300,
  bulletDamage: 20,
  ammoCapacity: 12,
  trapCharges: 0
};

export const DEFAULT_PLAYER_STATE: PlayerState = {
  health: DEFAULT_PLAYER_STATS.maxHealth,
  ammo: DEFAULT_PLAYER_STATS.ammoCapacity,
  stats: DEFAULT_PLAYER_STATS
};
