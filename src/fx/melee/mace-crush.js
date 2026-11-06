import { weaponAttack } from "./_weapons.js";
export const { meta, act, draw, drawBack } = weaponAttack({
  weapon: "war-mace", name: "War mace crush", two: true, windup: 0.7, hits: [6 / 30], width: 14, seed: 37, duration: 1.6,
  desc: "A flanged spiked mace drops with a thick steel-blue wake, freezes on the crushing blow and throws blocky chips across a spreading ground shock.",
  palette: ["#212638", "#424d68", "#65768a", "#91a7b1", "#c6d6d3", "#edf0dd", "#ffffff"],
});
