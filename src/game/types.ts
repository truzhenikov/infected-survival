export const ENEMY_IDS = ['runner', 'heavy'] as const;
export type EnemyId = (typeof ENEMY_IDS)[number];

export type UpgradeId =
  | 'fire-rate'
  | 'max-hp'
  | 'bullet-damage'
  | 'ammo-refill'
  | 'small-heal'
  | 'trap';

export type EnemyDefinition = {
  id: EnemyId;
  name: string;
  maxHealth: number;
  speed: number;
  contactDamage: number;
  scoreValue: number;
  difficultyWeight: number;
};

export type WaveEnemyEntry = {
  enemyId: EnemyId;
  count: number;
};

export type WaveDefinition = {
  number: number;
  spawnIntervalMs: number;
  enemies: WaveEnemyEntry[];
};

export type PlayerStats = {
  maxHealth: number;
  fireRateMs: number;
  bulletDamage: number;
  ammoCapacity: number;
  trapCharges: number;
};

export type PlayerState = {
  health: number;
  ammo: number;
  stats: PlayerStats;
};

export type UpgradeDefinition = {
  id: UpgradeId;
  name: string;
  description: string;
};
