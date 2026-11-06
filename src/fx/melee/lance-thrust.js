import { weaponAttack } from "./_weapons.js";
export const { meta, act, draw, drawBack } = weaponAttack({
  weapon: "lance", name: "Knight lance thrust", two: true, windup: 0.5, hits: [3 / 30], seed: 33,
  desc: "A long pennoned lance drives forward in two hands; the socket flashes, a narrow pierce ring opens at contact and steel sparks scatter.",
  palette: ["#192632", "#354d65", "#52738c", "#80acbc", "#bedfdc", "#f1f4d5", "#ffffff"],
});
