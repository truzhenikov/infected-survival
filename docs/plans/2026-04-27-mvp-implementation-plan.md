# Infected Survival MVP Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build a browser-playable one-screen survival defense MVP in Phaser 3 where the player survives escalating infected waves, chooses one of three upgrades between waves, and can restart after death.

**Architecture:** Use Phaser 3 with TypeScript and Vite. Keep gameplay in a single main arena scene plus lightweight UI/boot flow. Use a data-driven wave and upgrade model so balancing can be changed without rewriting gameplay logic.

**Tech Stack:** Phaser 3, TypeScript, Vite, Vitest, npm.

---

## Product assumptions locked for MVP

These assumptions are fixed to avoid blocking implementation:

- **Engine:** Phaser 3
- **Platform:** desktop browser first
- **Camera/readability:** top-down gameplay with a gritty pseudo-isometric art direction
- **Control scheme:** WASD movement + mouse aim + left click fire
- **Setting:** abandoned gas station forecourt / service yard
- **Game loop:** one static arena, escalating waves, short intermission, choose 1 of 3 upgrades
- **Initial enemy roster:** Runner and Heavy
- **Initial weapon roster:** one improvised pistol/rifle hybrid placeholder weapon
- **Art approach:** programmer art first, atmosphere later

## Definition of MVP done

The MVP is done when all of the following are true:

1. The game launches locally in browser with one command.
2. The player can move, aim, shoot, take damage, die, and restart.
3. Enemies spawn from arena edges and path toward the player.
4. Waves escalate in difficulty.
5. Intermission appears after each cleared wave.
6. The player chooses 1 of 3 upgrades during intermission.
7. UI shows HP, ammo, current wave, and game-over state.
8. The build runs without placeholder-breaking runtime errors.
9. Core gameplay logic has automated tests for pure systems.

---

## Project structure target

```text
/root/projects/infected-survival/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  src/
    main.ts
    game/
      config.ts
      constants.ts
      types.ts
      scenes/
        BootScene.ts
        MainMenuScene.ts
        GameScene.ts
        UIScene.ts
      entities/
        Player.ts
        Enemy.ts
        Bullet.ts
      systems/
        combat.ts
        waves.ts
        upgrades.ts
        spawning.ts
        gameState.ts
      data/
        enemies.ts
        upgrades.ts
        waves.ts
      utils/
        math.ts
    assets/
      README.md
  tests/
    systems/
      waves.test.ts
      upgrades.test.ts
      combat.test.ts
  docs/
    plans/
      2026-04-27-mvp-implementation-plan.md
```

---

## Task 1: Scaffold the Phaser + TypeScript project

**Objective:** Create a runnable project skeleton with dev, build, and test commands.

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `src/main.ts`
- Create: `src/game/config.ts`
- Create: `src/game/scenes/BootScene.ts`
- Create: `src/game/scenes/MainMenuScene.ts`
- Create: `src/assets/README.md`

**Step 1: Write failing test**

Create `tests/systems/waves.test.ts` with a trivial import from a future game module so test runner setup is exercised.

**Step 2: Run test to verify failure**

Run: `npm test -- --run`
Expected: FAIL because the project and test tooling are not configured yet.

**Step 3: Write minimal implementation**

- Initialize npm project
- Add dependencies: `phaser`
- Add dev dependencies: `vite`, `typescript`, `vitest`
- Add a minimal Phaser boot sequence that shows a title screen

**Step 4: Run verification**

Run: `npm test -- --run`
Expected: PASS for the trivial test

Run: `npm run build`
Expected: PASS with production bundle created

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold phaser survival MVP"
```

---

## Task 2: Add shared game types, constants, and data models

**Objective:** Create the central data contracts for enemies, waves, upgrades, and player state.

**Files:**
- Create: `src/game/types.ts`
- Create: `src/game/constants.ts`
- Create: `src/game/data/enemies.ts`
- Create: `src/game/data/upgrades.ts`
- Create: `src/game/data/waves.ts`
- Test: `tests/systems/waves.test.ts`
- Test: `tests/systems/upgrades.test.ts`

**Step 1: Write failing tests**

Add tests that assert:
- wave generation produces increasing difficulty
- upgrades catalog contains the expected MVP upgrade IDs
- enemy definitions exist for runner and heavy

**Step 2: Run tests to verify failure**

Run:
`npm test -- --run tests/systems/waves.test.ts tests/systems/upgrades.test.ts`
Expected: FAIL because types/data do not exist.

**Step 3: Write minimal implementation**

Create:
- typed enemy definitions
- 6 upgrade definitions
- wave config for first 10 waves or a generator function

**Step 4: Run tests to verify pass**

Run:
`npm test -- --run tests/systems/waves.test.ts tests/systems/upgrades.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add core wave enemy and upgrade data"
```

---

## Task 3: Implement player movement, aim, and shooting shell

**Objective:** Make a controllable player entity with movement, aim direction, ammo tracking, and bullet spawning.

**Files:**
- Create: `src/game/entities/Player.ts`
- Create: `src/game/entities/Bullet.ts`
- Modify: `src/game/scenes/GameScene.ts`
- Create: `src/game/systems/combat.ts`
- Test: `tests/systems/combat.test.ts`

**Step 1: Write failing tests**

Add tests for pure combat helpers:
- ammo cannot go below zero
- reload restores magazine up to reserve constraints
- damage application returns dead/alive state correctly

**Step 2: Run test to verify failure**

Run: `npm test -- --run tests/systems/combat.test.ts`
Expected: FAIL because combat helpers do not exist.

**Step 3: Write minimal implementation**

Implement:
- player state model
- keyboard movement
- mouse aim
- click-to-fire bullet creation
- ammo and reload helper functions

**Step 4: Run tests and build**

Run:
`npm test -- --run tests/systems/combat.test.ts`
Expected: PASS

Run:
`npm run build`
Expected: PASS

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add player controls and shooting shell"
```

---

## Task 4: Implement enemy entities and edge spawning

**Objective:** Spawn infected from screen edges and move them toward the player.

**Files:**
- Create: `src/game/entities/Enemy.ts`
- Create: `src/game/systems/spawning.ts`
- Modify: `src/game/scenes/GameScene.ts`
- Modify: `src/game/data/enemies.ts`
- Test: `tests/systems/spawning.test.ts`

**Step 1: Write failing tests**

Add tests for spawn helpers:
- spawn positions always land on arena edges
- spawned enemy types respect requested roster mix

**Step 2: Run test to verify failure**

Run: `npm test -- --run tests/systems/spawning.test.ts`
Expected: FAIL because spawning helpers do not exist.

**Step 3: Write minimal implementation**

Implement:
- runner and heavy visuals/stats
- edge spawn selection
- simple seek behavior toward player

**Step 4: Run tests and verify**

Run: `npm test -- --run tests/systems/spawning.test.ts`
Expected: PASS

Run the game locally and verify enemies approach from all sides.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add enemies and arena edge spawning"
```

---

## Task 5: Add collision, damage, death, and wave progression

**Objective:** Make combat resolve, enemies damage the player, and waves complete/escalate.

**Files:**
- Create: `src/game/systems/waves.ts`
- Create: `src/game/systems/gameState.ts`
- Modify: `src/game/scenes/GameScene.ts`
- Modify: `src/game/systems/combat.ts`
- Test: `tests/systems/waves.test.ts`
- Test: `tests/systems/combat.test.ts`

**Step 1: Write failing tests**

Add tests for:
- next wave increases spawn pressure
- game enters dead state at zero HP
- wave clears when all scheduled enemies are defeated

**Step 2: Run tests to verify failure**

Run:
`npm test -- --run tests/systems/waves.test.ts tests/systems/combat.test.ts`
Expected: FAIL because the wave progression system is incomplete.

**Step 3: Write minimal implementation**

Implement:
- bullet vs enemy hit resolution
- enemy contact damage
- player death state
- wave start / active / cleared transitions

**Step 4: Run tests and build**

Run:
`npm test -- --run tests/systems/waves.test.ts tests/systems/combat.test.ts`
Expected: PASS

Run:
`npm run build`
Expected: PASS

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add combat resolution and wave progression"
```

---

## Task 6: Add intermission and upgrade selection

**Objective:** Give the player a short pause after each wave and a meaningful 1-of-3 choice.

**Files:**
- Modify: `src/game/systems/upgrades.ts`
- Modify: `src/game/scenes/GameScene.ts`
- Create: `src/game/scenes/UIScene.ts`
- Test: `tests/systems/upgrades.test.ts`

**Step 1: Write failing tests**

Add tests for:
- exactly 3 unique upgrade choices are offered
- an applied upgrade mutates player stats correctly
- already-maxed or invalid offers are filtered out if needed

**Step 2: Run tests to verify failure**

Run: `npm test -- --run tests/systems/upgrades.test.ts`
Expected: FAIL because the upgrade system is incomplete.

**Step 3: Write minimal implementation**

Implement:
- intermission state and timer
- 3-card upgrade offer generation
- one-click upgrade selection
- resume next wave after selection or timeout

**Step 4: Run tests and verify**

Run: `npm test -- --run tests/systems/upgrades.test.ts`
Expected: PASS

Run the game locally and verify an upgrade appears after a wave.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add intermission upgrade choices"
```

---

## Task 7: Add HUD, game over screen, and restart loop

**Objective:** Surface the core game state clearly and support replay.

**Files:**
- Modify: `src/game/scenes/UIScene.ts`
- Modify: `src/game/scenes/GameScene.ts`
- Modify: `src/game/constants.ts`

**Step 1: Write failing test**

If UI logic is abstracted into helpers, add pure tests for formatter/selector logic. Otherwise document manual verification because Phaser scene text rendering is integration-heavy.

**Step 2: Run test/verification to establish baseline**

Run relevant UI helper tests if created.

**Step 3: Write minimal implementation**

Implement HUD labels for:
- HP
- ammo / reserve
- wave number
- phase text

Implement game over overlay with restart action.

**Step 4: Verify**

Run `npm run build`
Expected: PASS

Manual verify:
- UI updates during combat
- death shows restart option
- restart resets wave/state cleanly

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add HUD and restart loop"
```

---

## Task 8: Add atmosphere pass and balancing pass

**Objective:** Improve feel enough that the prototype reads as a real vertical slice.

**Files:**
- Modify: `src/game/scenes/GameScene.ts`
- Modify: `src/game/data/waves.ts`
- Modify: `src/game/data/upgrades.ts`
- Modify: `src/assets/README.md`
- Create optional placeholders under: `public/` or `src/assets/`

**Step 1: Write/update tests**

Update any balance-sensitive tests if wave formulas changed.

**Step 2: Implement minimal polish**

Add:
- hit flash
- simple screen shake
- spawn telegraph marker
- arena dressing with primitive shapes/tiles
- tuning pass on speeds, HP, counts, ammo economy

**Step 3: Verify**

Run:
`npm test -- --run`
Expected: PASS

Run:
`npm run build`
Expected: PASS

Manual verify that wave 1 is accessible and wave 5 is threatening.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: polish survival MVP feel and balance"
```

---

## Recommended commands

```bash
npm install
npm run dev
npm test -- --run
npm run build
```

## Acceptance checklist

- [ ] Browser build boots successfully
- [ ] Keyboard + mouse controls feel responsive
- [ ] Wave difficulty ramps up perceptibly
- [ ] Upgrade choices create visible stat differences
- [ ] Death/restart loop is stable
- [ ] No blocking console errors in local play
- [ ] Pure systems are test-covered

## Post-MVP backlog

- fast runner enemy archetype
- spitters or leapers
- melee panic shove
- molotov or trap consumable
- destructible barricade
- score leaderboard / local best
- audio pass
- real art pass
