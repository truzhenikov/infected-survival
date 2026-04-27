import { UPGRADE_IDS } from '../constants';
import type { UpgradeDefinition, UpgradeId } from '../types';

const UPGRADE_CONTENT: Record<UpgradeId, Omit<UpgradeDefinition, 'id'>> = {
  'fire-rate': {
    name: 'Faster Cycling',
    description: 'Reduce the delay between shots.'
  },
  'max-hp': {
    name: 'Reinforced Jacket',
    description: 'Increase maximum health.'
  },
  'bullet-damage': {
    name: 'Hot Loads',
    description: 'Increase bullet damage.'
  },
  'ammo-refill': {
    name: 'Ammo Refill',
    description: 'Top up the current magazine.'
  },
  'small-heal': {
    name: 'Field Dressing',
    description: 'Recover a small amount of health.'
  },
  trap: {
    name: 'Snap Trap',
    description: 'Gain one deployable trap charge.'
  }
};

export { UPGRADE_IDS };

export const UPGRADE_DEFINITIONS: UpgradeDefinition[] = UPGRADE_IDS.map((id) => ({
  id,
  ...UPGRADE_CONTENT[id]
}));
