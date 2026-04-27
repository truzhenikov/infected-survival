import type { PlayerState, UpgradeDefinition, UpgradeId } from '../types';
import { UPGRADE_DEFINITIONS } from '../data/upgrades';

export const MIN_FIRE_RATE_MS = 120;
export const MAX_BULLET_DAMAGE = 60;
export const MAX_TRAP_CHARGES = 3;
export const MAX_UPGRADE_OFFERS = 3;

const FIRE_RATE_STEP_MS = 40;
const MAX_HEALTH_STEP = 20;
const BULLET_DAMAGE_STEP = 10;
const SMALL_HEAL_AMOUNT = 25;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export const isUpgradeAvailable = (player: PlayerState, upgradeId: UpgradeId): boolean => {
  switch (upgradeId) {
    case 'fire-rate':
      return player.stats.fireRateMs > MIN_FIRE_RATE_MS;
    case 'max-hp':
      return true;
    case 'bullet-damage':
      return player.stats.bulletDamage < MAX_BULLET_DAMAGE;
    case 'ammo-refill':
      return player.ammo < player.stats.ammoCapacity;
    case 'small-heal':
      return player.health < player.stats.maxHealth;
    case 'trap':
      return player.stats.trapCharges < MAX_TRAP_CHARGES;
    default:
      return false;
  }
};

export const getUpgradeOffers = (
  player: PlayerState,
  definitions: readonly UpgradeDefinition[] = UPGRADE_DEFINITIONS,
  preferredStartIndex = 0
): UpgradeDefinition[] => {
  const availableUpgrades = definitions.filter((upgrade) => isUpgradeAvailable(player, upgrade.id));

  if (availableUpgrades.length <= MAX_UPGRADE_OFFERS) {
    return availableUpgrades;
  }

  const normalizedStartIndex =
    ((preferredStartIndex % availableUpgrades.length) + availableUpgrades.length) % availableUpgrades.length;

  return Array.from({ length: MAX_UPGRADE_OFFERS }, (_, index) => {
    const nextIndex = (normalizedStartIndex + index) % availableUpgrades.length;
    return availableUpgrades[nextIndex]!;
  });
};

export const applyUpgrade = (player: PlayerState, upgradeId: UpgradeId): PlayerState => {
  switch (upgradeId) {
    case 'fire-rate': {
      const fireRateMs = clamp(player.stats.fireRateMs - FIRE_RATE_STEP_MS, MIN_FIRE_RATE_MS, player.stats.fireRateMs);

      return {
        ...player,
        stats: {
          ...player.stats,
          fireRateMs
        }
      };
    }
    case 'max-hp': {
      const maxHealth = player.stats.maxHealth + MAX_HEALTH_STEP;

      return {
        ...player,
        health: Math.min(maxHealth, player.health + MAX_HEALTH_STEP),
        stats: {
          ...player.stats,
          maxHealth
        }
      };
    }
    case 'bullet-damage': {
      return {
        ...player,
        stats: {
          ...player.stats,
          bulletDamage: clamp(player.stats.bulletDamage + BULLET_DAMAGE_STEP, player.stats.bulletDamage, MAX_BULLET_DAMAGE)
        }
      };
    }
    case 'ammo-refill': {
      return {
        ...player,
        ammo: player.stats.ammoCapacity
      };
    }
    case 'small-heal': {
      return {
        ...player,
        health: clamp(player.health + SMALL_HEAL_AMOUNT, 0, player.stats.maxHealth)
      };
    }
    case 'trap': {
      return {
        ...player,
        stats: {
          ...player.stats,
          trapCharges: clamp(player.stats.trapCharges + 1, player.stats.trapCharges, MAX_TRAP_CHARGES)
        }
      };
    }
    default:
      return player;
  }
};
