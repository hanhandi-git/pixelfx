import { weaponAttack } from "./_weapons.js";
export const { meta, act, draw, drawBack } = weaponAttack({
  weapon: "rapier", name: "Rapier lunge", windup: 0.4, hits: [2 / 30], seed: 38,
  desc: "A basket-hilt rapier extends in a precise lunge, drawing a needle-white line and a small pierce ring before the point recoils into guard.",
  palette: ["#29233b", "#544362", "#8c6a89", "#c396b0", "#e8c7d3", "#fff0e8", "#ffffff"],
});
