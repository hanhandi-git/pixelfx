# Encounters

2 choreographed encounters in `src/encounters/`. Render one with `node tools/encounter.mjs <id> --mp4`.

An encounter places a map, a hero, minions, a boss and that boss's attack effects on one timeline. The units and
attacks are ordinary effects from `src/fx/`; the encounter only says when they happen and what the fight calls them.

| encounter | map | boss | minions | length | what it does |
|---|---|---|---|---|---|
| Ashfall Skirmish | `world/ember-depths` | — | 3 | 14.5s | A minion skirmish in the Ember Depths: goblin raiders close in while a sporeling lobs clouds from the back, each kill a soft poof, the wave ended with a banner. |
| The Verdant Throne | `world/mossy-ruins` | `boss/thorn-king` | 2 | 27.5s | The Thorn King wakes in the mossy ruins: root quakes, a thorn volley and goblin raiders in the first phase, then a roar splits the arena and the second phase gives the floor no rest. |
