import type { PlayerState, PlayerStats, UpgradeId } from './types';

export const PLAYER_MOVE_SPEED = 220;
export const BULLET_SPEED = 540;
export const DEFAULT_RESERVE_AMMO = 36;
export const PLAYER_START_X = 480;
export const PLAYER_START_Y = 270;
export const ARENA_MARGIN = 40;
export const AUTO_AIM_RANGE = 280;
export const AUTO_AIM_CONE_RADIANS = Math.PI * 0.75;
export const JOYSTICK_RADIUS = 52;
export const FIRE_BUTTON_RADIUS = 54;

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
    reserveAmmo: DEFAULT_RESERVE_AMMO,
    stats
  };
};
