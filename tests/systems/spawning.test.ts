import { describe, expect, it } from 'vitest';
import {
  buildSpawnQueue,
  createEdgeSpawnPosition,
  resolveSpawnCadence,
  type ArenaBounds,
  type SpawnEdge
} from '../../src/game/systems/spawning';

const arena: ArenaBounds = {
  left: 40,
  top: 40,
  right: 500,
  bottom: 920
};

describe('spawning helpers', () => {
  it.each<{
    edge: SpawnEdge;
    progress: number;
    expected: { x: number; y: number };
  }>([
    { edge: 'top', progress: 0.25, expected: { x: 155, y: 40 } },
    { edge: 'right', progress: 0.5, expected: { x: 500, y: 480 } },
    { edge: 'bottom', progress: 0.75, expected: { x: 385, y: 920 } },
    { edge: 'left', progress: 1, expected: { x: 40, y: 920 } }
  ])('places $edge spawns on the arena boundary', ({ edge, progress, expected }) => {
    expect(createEdgeSpawnPosition({ arena, edge, progress })).toEqual({
      edge,
      ...expected
    });
  });

  it('clamps progress so spawns still stay on arena edges', () => {
    expect(createEdgeSpawnPosition({ arena, edge: 'top', progress: -1 })).toEqual({
      edge: 'top',
      x: 40,
      y: 40
    });

    expect(createEdgeSpawnPosition({ arena, edge: 'right', progress: 3 })).toEqual({
      edge: 'right',
      x: 500,
      y: 920
    });
  });

  it('builds a spawn queue that preserves requested enemy counts', () => {
    expect(
      buildSpawnQueue([
        { enemyId: 'runner', count: 4 },
        { enemyId: 'heavy', count: 2 }
      ])
    ).toEqual(['runner', 'heavy', 'runner', 'heavy', 'runner', 'runner']);
  });

  it('ignores zero-or-negative roster entries', () => {
    expect(
      buildSpawnQueue([
        { enemyId: 'runner', count: 0 },
        { enemyId: 'heavy', count: -3 },
        { enemyId: 'runner', count: 2 }
      ])
    ).toEqual(['runner', 'runner']);
  });

  it('catches up missed spawn intervals without exceeding remaining queue size', () => {
    expect(resolveSpawnCadence({ now: 4_000, nextSpawnAt: 1_000, intervalMs: 750, remainingCount: 10 })).toEqual({
      spawnCount: 5,
      nextSpawnAt: 4_750
    });

    expect(resolveSpawnCadence({ now: 4_000, nextSpawnAt: 1_000, intervalMs: 750, remainingCount: 2 })).toEqual({
      spawnCount: 2,
      nextSpawnAt: 2_500
    });
  });
});
