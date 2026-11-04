// The minion kit. Creature bodies reuse the critters' offscreen grid, springs and loop-safe helpers; this file adds
// the two things a combat minion needs that an ambient critter does not: a shadow with a live base and a readable
// hurtbox outline for tools that preview encounters.
export { Grid, shift, curve, spring, toss, lnoise, shadow, Swarm } from "../critters/_lib.js";
