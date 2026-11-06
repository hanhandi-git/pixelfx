import { weaponAttack } from "./_weapons.js";
export const { meta, act, draw, drawBack } = weaponAttack({
  weapon: "staff", name: "Banded staff combo", two: true, windup: 0.45, hits: [4 / 30, 13 / 30], width: 5, seed: 32, duration: 1.6,
  desc: "A gold-banded wooden staff sweeps low and reverses upward in two hands, trailing amber arcs and showers of small impact splinters.",
  palette: ["#30202b", "#644437", "#a26a42", "#d59b50", "#f2cc80", "#fff0b6", "#ffffff"],
});
