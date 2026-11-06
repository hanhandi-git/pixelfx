// Franchise themes. One work can own several categories (Naruto ships ninjutsu and senjutsu, and a future set
// may add a third), so the bar filters by series first and by material second. Any category no work claims
// falls under "classic", which keeps the original 244 effects browsable as one shelf.
export const THEMES = [
  { id: "naruto", cats: ["ninjutsu", "senjutsu"] },
  { id: "miku", cats: ["miku"] },
  { id: "dragonball", cats: ["dragonball"] },
  { id: "konosuba", cats: ["konosuba"] },
];

/** The theme a category belongs to, or "classic" when no work claims it. */
export const themeOfCat = (cat) => THEMES.find((t) => t.cats.includes(cat))?.id ?? "classic";
