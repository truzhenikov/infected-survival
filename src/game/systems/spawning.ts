import type { EnemyId, WaveEnemyEntry } from '../types';

export type SpawnEdge = 'top' | 'right' | 'bottom' | 'left';

export type ArenaBounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type SpawnPosition = {
  x: number;
  y: number;
  edge: SpawnEdge;
};

const SPAWN_EDGES: readonly SpawnEdge[] = ['top', 'right', 'bottom', 'left'] as const;

export const createEdgeSpawnPosition = ({
  arena,
  edge,
  progress
}: {
  arena: ArenaBounds;
  edge: SpawnEdge;
  progress: number;
}): SpawnPosition => {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const width = arena.right - arena.left;
  const height = arena.bottom - arena.top;

  switch (edge) {
    case 'top':
      return { edge, x: arena.left + width * clampedProgress, y: arena.top };
    case 'right':
      return { edge, x: arena.right, y: arena.top + height * clampedProgress };
    case 'bottom':
      return { edge, x: arena.left + width * clampedProgress, y: arena.bottom };
    case 'left':
      return { edge, x: arena.left, y: arena.top + height * clampedProgress };
  }
};

export const buildSpawnQueue = (entries: WaveEnemyEntry[]): EnemyId[] => {
  const remaining: Partial<Record<EnemyId, number>> = {};
  const orderedIds: EnemyId[] = [];

  for (const entry of entries) {
    const count = Math.max(0, Math.floor(entry.count));
    if (count <= 0) {
      continue;
    }

    if (!(entry.enemyId in remaining)) {
      orderedIds.push(entry.enemyId);
      remaining[entry.enemyId] = 0;
    }

    remaining[entry.enemyId] = (remaining[entry.enemyId] ?? 0) + count;
  }

  const queue: EnemyId[] = [];

  while (orderedIds.some((enemyId) => (remaining[enemyId] ?? 0) > 0)) {
    for (const enemyId of orderedIds) {
      const count = remaining[enemyId] ?? 0;
      if (count <= 0) {
        continue;
      }

      queue.push(enemyId);
      remaining[enemyId] = count - 1;
    }
  }

  return queue;
};

export const getSpawnEdgeForIndex = (index: number): SpawnEdge => SPAWN_EDGES[Math.abs(index) % SPAWN_EDGES.length];

export const resolveSpawnCadence = ({
  now,
  nextSpawnAt,
  intervalMs,
  remainingCount
}: {
  now: number;
  nextSpawnAt: number;
  intervalMs: number;
  remainingCount: number;
}): { spawnCount: number; nextSpawnAt: number } => {
  if (remainingCount <= 0) {
    return { spawnCount: 0, nextSpawnAt };
  }

  const safeIntervalMs = Math.max(1, intervalMs);
  if (now < nextSpawnAt) {
    return { spawnCount: 0, nextSpawnAt };
  }

  const dueCount = Math.floor((now - nextSpawnAt) / safeIntervalMs) + 1;
  const spawnCount = Math.min(remainingCount, dueCount);

  return {
    spawnCount,
    nextSpawnAt: nextSpawnAt + spawnCount * safeIntervalMs
  };
};
