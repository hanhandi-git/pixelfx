import { weaponAttack } from "./_weapons.js";
export const { meta, act, draw, drawBack } = weaponAttack({
  weapon: "holy-sword", name: "Holy sword cleave", two: true, windup: 0.6, hits: [5 / 30], width: 12, seed: 34, duration: 1.7,
  desc: "A wing-guarded holy blade carves a broad ivory-gold crescent, stamps a radiant cross on contact and releases slowly rising golden stars.",
  palette: ["#362841", "#76504e", "#b88751", "#e8b866", "#ffe39c", "#fff4d3", "#ffffff"],
});
