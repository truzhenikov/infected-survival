import type { PlayerState, PlayerStats, UpgradeId } from './types';

export const DEFAULT_PLAYER_STATS: Readonly<PlayerStats> = {
  maxHealth: 100,
  fireRateMs: 300,
  bulletDamage: 20,
  ammoCapacity: 12,
  trapCharges: 0
};

export const UPGRADE_IDS: readonly UpgradeId[] = [
  'fire-rate',
  'max-hp',
  'bullet-damage',
  'ammo-refill',
  'small-heal',
  'trap'
] as const;

export const createDefaultPlayerStats = (): PlayerStats => ({
  ...DEFAULT_PLAYER_STATS
});

export const createDefaultPlayerState = (): PlayerState => {
  const stats = createDefaultPlayerStats();

  return {
    health: stats.maxHealth,
    ammo: stats.ammoCapacity,
    stats
  };
};
