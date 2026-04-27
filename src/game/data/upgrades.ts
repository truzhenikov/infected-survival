import { UPGRADE_IDS, type UpgradeDefinition } from '../types';

export { UPGRADE_IDS } from '../types';

export const UPGRADE_DEFINITIONS: UpgradeDefinition[] = [
  {
    id: 'fire-rate',
    name: 'Faster Cycling',
    description: 'Reduce the delay between shots.'
  },
  {
    id: 'max-hp',
    name: 'Reinforced Jacket',
    description: 'Increase maximum health.'
  },
  {
    id: 'bullet-damage',
    name: 'Hot Loads',
    description: 'Increase bullet damage.'
  },
  {
    id: 'ammo-refill',
    name: 'Ammo Refill',
    description: 'Top up the current magazine.'
  },
  {
    id: 'small-heal',
    name: 'Field Dressing',
    description: 'Recover a small amount of health.'
  },
  {
    id: 'trap',
    name: 'Snap Trap',
    description: 'Gain one deployable trap charge.'
  }
] satisfies UpgradeDefinition[];

const definedUpgradeIds = UPGRADE_DEFINITIONS.map((upgrade) => upgrade.id);

if (definedUpgradeIds.length !== UPGRADE_IDS.length || definedUpgradeIds.some((id, index) => id !== UPGRADE_IDS[index])) {
  throw new Error('Upgrade definitions must stay aligned with UPGRADE_IDS.');
}
