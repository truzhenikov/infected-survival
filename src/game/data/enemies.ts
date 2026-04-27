import type { EnemyDefinition, EnemyId } from '../types';

export const ENEMY_DEFINITIONS: Record<EnemyId, EnemyDefinition> = {
  runner: {
    id: 'runner',
    name: 'Runner',
    maxHealth: 35,
    speed: 160,
    contactDamage: 10,
    scoreValue: 10,
    difficultyWeight: 1,
    radius: 16,
    tint: 0xef4444
  },
  heavy: {
    id: 'heavy',
    name: 'Heavy',
    maxHealth: 90,
    speed: 90,
    contactDamage: 20,
    scoreValue: 25,
    difficultyWeight: 3,
    radius: 22,
    tint: 0x991b1b
  }
};
