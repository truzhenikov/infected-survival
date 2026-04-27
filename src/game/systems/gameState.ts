import { createDefaultPlayerState } from '../constants';
import type { PlayerState } from '../types';
import { applyDamage } from './combat';

export type GamePhase = 'playing' | 'game-over';

export type GameState = {
  phase: GamePhase;
  canRestart: boolean;
  player: PlayerState;
};

export const createGameState = (player: PlayerState = createDefaultPlayerState()): GameState => ({
  phase: 'playing',
  canRestart: false,
  player
});

export const applyPlayerDamage = (state: GameState, damage: number): GameState => {
  const result = applyDamage(state.player.health, damage);

  return {
    ...state,
    phase: result.isDead ? 'game-over' : state.phase,
    canRestart: result.isDead,
    player: {
      ...state.player,
      health: result.health
    }
  };
};
