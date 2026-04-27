export type ReloadResult = {
  ammoInMagazine: number;
  reserveAmmo: number;
  ammoLoaded: number;
};

export type VectorLike = {
  x: number;
  y: number;
};

export type AutoAimCandidate = {
  id: string;
  x: number;
  y: number;
  active?: boolean;
};

export type AutoAimResult = AutoAimCandidate & {
  distance: number;
  angleDelta: number;
};

export type AutoAimParams = {
  origin: VectorLike;
  facing: VectorLike;
  maxRange: number;
  aimConeRadians: number;
  candidates: AutoAimCandidate[];
  currentTargetId?: string;
};

export type JoystickInputParams = {
  anchor: VectorLike;
  pointer: VectorLike;
  radius: number;
  deadzoneRadius: number;
};

export type JoystickInputResult = {
  movement: VectorLike;
  knobOffset: VectorLike;
  intensity: number;
};

export type AimAngleParams = {
  origin: VectorLike;
  fallbackFacing: VectorLike;
  target?: VectorLike | null;
};

export const consumeAmmo = (currentAmmo: number): number => Math.max(0, currentAmmo - 1);

export const reloadWeapon = ({
  ammoInMagazine,
  reserveAmmo,
  magazineCapacity
}: {
  ammoInMagazine: number;
  reserveAmmo: number;
  magazineCapacity: number;
}): ReloadResult => {
  const normalizedMagazineCapacity = Math.max(0, magazineCapacity);
  const normalizedAmmoInMagazine = Math.min(Math.max(0, ammoInMagazine), normalizedMagazineCapacity);
  const normalizedReserveAmmo = Math.max(0, reserveAmmo);
  const missingAmmo = Math.max(0, normalizedMagazineCapacity - normalizedAmmoInMagazine);
  const ammoLoaded = Math.min(missingAmmo, normalizedReserveAmmo);

  return {
    ammoInMagazine: normalizedAmmoInMagazine + ammoLoaded,
    reserveAmmo: normalizedReserveAmmo - ammoLoaded,
    ammoLoaded
  };
};

export const applyDamage = (
  currentHealth: number,
  damage: number
): { health: number; isDead: boolean } => {
  const health = Math.max(0, currentHealth - Math.max(0, damage));

  return {
    health,
    isDead: health <= 0
  };
};

export const normalizeVector = ({ x, y }: VectorLike): VectorLike => {
  const length = Math.hypot(x, y);

  if (length === 0) {
    return { x: 1, y: 0 };
  }

  return {
    x: x / length,
    y: y / length
  };
};

export const resolveJoystickInput = ({
  anchor,
  pointer,
  radius,
  deadzoneRadius
}: JoystickInputParams): JoystickInputResult => {
  const delta = {
    x: pointer.x - anchor.x,
    y: pointer.y - anchor.y
  };
  const distance = Math.hypot(delta.x, delta.y);

  if (distance <= Math.max(0, deadzoneRadius) || radius <= 0) {
    return {
      movement: { x: 0, y: 0 },
      knobOffset: { x: 0, y: 0 },
      intensity: 0
    };
  }

  const normalized = normalizeVector(delta);
  const clampedDistance = Math.min(distance, radius);

  return {
    movement: normalized,
    knobOffset: {
      x: normalized.x * clampedDistance,
      y: normalized.y * clampedDistance
    },
    intensity: Math.min(1, clampedDistance / radius)
  };
};

export const resolveAimAngle = ({ origin, fallbackFacing, target }: AimAngleParams): number => {
  if (target) {
    return Math.atan2(target.y - origin.y, target.x - origin.x);
  }

  const facing = normalizeVector(fallbackFacing);
  return Math.atan2(facing.y, facing.x);
};

const angleDeltaBetween = (a: VectorLike, b: VectorLike): number => {
  const normalizedA = normalizeVector(a);
  const normalizedB = normalizeVector(b);
  const dot = normalizedA.x * normalizedB.x + normalizedA.y * normalizedB.y;
  const clampedDot = Math.min(1, Math.max(-1, dot));

  return Math.acos(clampedDot);
};

const evaluateTarget = (
  candidate: AutoAimCandidate,
  { origin, facing, maxRange, aimConeRadians }: Omit<AutoAimParams, 'candidates' | 'currentTargetId'>
): AutoAimResult | null => {
  const FLOAT_EPSILON = 1e-6;

  if (candidate.active === false) {
    return null;
  }

  const offset = {
    x: candidate.x - origin.x,
    y: candidate.y - origin.y
  };
  const distance = Math.hypot(offset.x, offset.y);

  if (distance === 0 || distance - maxRange > FLOAT_EPSILON) {
    return null;
  }

  const angleDelta = angleDeltaBetween(facing, offset);

  if (angleDelta - aimConeRadians * 0.5 > FLOAT_EPSILON) {
    return null;
  }

  return {
    ...candidate,
    distance,
    angleDelta
  };
};

export const selectAutoAimTarget = ({ currentTargetId, candidates, ...rest }: AutoAimParams): AutoAimResult | null => {
  if (currentTargetId) {
    const currentTarget = candidates.find((candidate) => candidate.id === currentTargetId);
    if (currentTarget) {
      const evaluatedCurrent = evaluateTarget(currentTarget, rest);
      if (evaluatedCurrent) {
        return evaluatedCurrent;
      }
    }
  }

  const validTargets = candidates
    .map((candidate) => evaluateTarget(candidate, rest))
    .filter((candidate): candidate is AutoAimResult => candidate !== null)
    .sort((left, right) => left.distance - right.distance || left.angleDelta - right.angleDelta);

  return validTargets[0] ?? null;
};
