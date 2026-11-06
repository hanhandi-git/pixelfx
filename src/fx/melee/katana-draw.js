import { weaponAttack } from "./_weapons.js";
export const { meta, act, draw, drawBack } = weaponAttack({
  weapon: "katana", name: "Katana draw cut", two: true, windup: 0.5, hits: [2 / 30], width: 4, seed: 35,
  desc: "A curved katana snaps through a thin horizontal crescent; a white cutting line hangs for a beat, then cold violet sparks fade.",
  palette: ["#252039", "#453a66", "#70608e", "#a18db6", "#d3c0db", "#f4e6ec", "#ffffff"],
});
