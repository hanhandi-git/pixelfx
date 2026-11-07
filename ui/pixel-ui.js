// pixelfx pixel UI kit — tiny DOM factories for the classes in pixel-ui.css.
// No framework, no dependencies. Every factory returns a plain HTMLElement, so a host can keep using
// its own event wiring and state. Text passed as `html` is trusted markup; labels are text.

const doc = () => globalThis.document;

/** Create an element with a class list and optional inner HTML. */
export function el(tag = "div", className = "", html = "") {
  const node = doc().createElement(tag);
  if (className) node.className = className;
  if (html !== "" && html != null) node.innerHTML = html;
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

/** A square panel. variant: "raised" | "flat" | "inset"; framed adds the two gold corner brackets. */
export function panel({ tag = "div", framed = false, raised = false, flat = false, inset = false, pad = false, className = "", html = "", id = "" } = {}) {
  const cls = ["px-panel"];
  if (framed) cls.push("px-panel--framed");
  if (raised) cls.push("px-panel--raised");
  if (flat) cls.push("px-panel--flat");
  if (inset) cls.push("px-panel--inset");
  if (pad) cls.push("px-panel--pad");
  const node = el(tag, cls.join(" "), html);
  if (id) node.id = id;
  if (className) node.classList.add(...className.split(/\s+/).filter(Boolean));
  return node;
}

/** A keycap. */
export function key(label, { small = false, ghost = false, className = "" } = {}) {
  const cls = ["px-key"];
  if (small) cls.push("px-key--sm");
  if (ghost) cls.push("px-key--ghost");
  if (className) cls.push(className);
  const node = el("kbd", cls.join(" "));
  node.textContent = label;
  return node;
}

export function keys(labels, opts = {}) {
  const row = el("div", "px-keys");
  for (const label of labels) row.append(key(label, opts));
  return row;
}

/** A button. Use variant "primary" | "ghost" | "danger", or icon:true for a square icon button. */
export function button({ label = "", sub = "", variant = "", action = "", icon = "", title = "", iconOnly = false, className = "", type = "button" } = {}) {
  const cls = ["px-btn"];
  if (variant) cls.push("px-btn--" + variant);
  if (iconOnly) cls.push("px-btn--icon");
  if (className) cls.push(className);
  const node = el("button", cls.join(" "));
  node.type = type;
  if (action) node.dataset.action = action;
  if (title) node.title = title;
  if (icon) {
    const slot = el("span", "px-btn__icon", icon);
    node.append(slot);
  }
  if (label) {
    const text = el("span", "", label);
    node.append(text);
  }
  if (sub) node.append(el("small", "px-btn__sub", sub));
  return node;
}

export function iconButton({ icon, label = "", action = "", title = "", className = "" } = {}) {
  return button({ icon, label, action, title: title || label, iconOnly: true, className });
}

/** A bar. value is 0..1; text is drawn over the fill. */
export function bar({ tone = "hp", value = 1, text = "", thin = false, seg = false, id = "", fillId = "", textId = "", className = "" } = {}) {
  const cls = ["px-bar", "px-bar--" + tone];
  if (thin) cls.push("px-bar--thin");
  if (seg) cls.push("px-bar--seg");
  if (className) cls.push(className);
  const node = el("div", cls.join(" "));
  if (id) node.id = id;
  const fill = el("i", "px-bar__fill");
  if (fillId) fill.id = fillId;
  fill.style.width = Math.max(0, Math.min(1, value)) * 100 + "%";
  node.append(fill);
  if (text !== null) {
    const label = el("span", "px-bar__text");
    if (textId) label.id = textId;
    label.textContent = text;
    node.append(label);
  }
  return node;
}

export function setBar(node, value, text) {
  if (!node) return;
  const fill = node.querySelector(".px-bar__fill");
  if (fill) fill.style.width = (Math.max(0, Math.min(1, value)) * 100).toFixed(1) + "%";
  if (text != null) {
    const label = node.querySelector(".px-bar__text");
    if (label) label.textContent = text;
  }
}

/** A skill slot. accent/glow tint only the glyph and ready frame; everything else stays UI-kit neutral. */
export function skillSlot({ id = "", key: keyLabel = "", glyph = "", name = "", cost = "", accent = "", glow = "", note = "" } = {}) {
  const node = el("div", "px-skill");
  if (id) node.dataset.skill = id;
  if (accent) node.style.setProperty("--px-accent", accent);
  if (glow) node.style.setProperty("--px-glow", glow);
  if (note) node.title = note;
  const k = key(keyLabel, { small: true, className: "px-skill__key" });
  const g = el("span", "px-skill__glyph", glyph);
  const n = el("span", "px-skill__name");
  n.textContent = name;
  const c = el("span", "px-skill__cost");
  c.textContent = cost ? String(cost) : "";
  const cd = el("span", "px-skill__cd");
  const num = el("span", "px-skill__num");
  node.append(k, g, n, c, cd, num);
  node.setAttribute("role", "img");
  node.setAttribute("aria-label", `${keyLabel} ${name}${cost ? "，消耗 " + cost : ""}`);
  return node;
}

/** Update a skill slot from cooldown + mana state. Returns its computed state. */
export function setSkill(slot, { left = 0, total = 1, mp = Infinity, cost = 0 } = {}) {
  if (!slot) return null;
  const cooling = left > 0.001;
  const poor = mp < cost;
  const ready = !cooling && !poor;
  slot.classList.toggle("is-cooling", cooling);
  slot.classList.toggle("is-ready", ready);
  slot.classList.toggle("is-nomana", poor);
  slot.style.setProperty("--px-cd", cooling ? Math.min(100, (left / total) * 100).toFixed(1) + "%" : "0%");
  const num = slot.querySelector(".px-skill__num");
  if (num) num.textContent = cooling ? (left >= 1 ? Math.ceil(left) : left.toFixed(1)) : "";
  return { cooling, poor, ready };
}

export function pulseSkill(slot, ms = 280) {
  if (!slot) return;
  slot.classList.remove("is-pulse");
  void slot.offsetWidth;
  slot.classList.add("is-pulse");
  clearTimeout(slot.__pxPulse);
  slot.__pxPulse = setTimeout(() => slot.classList.remove("is-pulse"), ms);
}

export function denySkill(slot, ms = 240) {
  if (!slot) return;
  slot.classList.remove("is-deny");
  void slot.offsetWidth;
  slot.classList.add("is-deny");
  clearTimeout(slot.__pxDeny);
  slot.__pxDeny = setTimeout(() => slot.classList.remove("is-deny"), ms);
}

export function badge(text, { tone = "", id = "", className = "" } = {}) {
  const cls = ["px-badge"];
  if (tone) cls.push("px-badge--" + tone);
  if (className) cls.push(className);
  const node = el("span", cls.join(" "));
  node.textContent = text;
  if (id) node.id = id;
  return node;
}

/** Three act pips (or any count). index 0-based. */
export function pips(count = 3, active = 0, className = "") {
  const node = el("div", ("px-pips " + className).trim());
  for (let i = 0; i < count; i++) {
    const dot = doc().createElement("i");
    if (i === active) dot.classList.add("is-on");
    node.append(dot);
  }
  return node;
}

export function setPips(node, active) {
  if (!node) return;
  [...node.children].forEach((c, i) => c.classList.toggle("is-on", i === active));
}

export function stat(value, label) {
  const node = el("div", "px-stat");
  node.append(el("b", "", String(value)), el("span", "", label));
  return node;
}

export function statGrid(items) {
  const node = el("div", "px-stat-grid");
  for (const item of items) node.append(stat(item.value, item.label));
  return node;
}

/** Key hint groups for a title screen: rows = [{ label, content }]. */
export function controls(rows) {
  const node = el("div", "px-controls");
  for (const row of rows) {
    const group = el("div", "px-control-group");
    group.append(el("div", "px-label", row.label));
    if (typeof row.content === "string") group.append(el("div", "px-keys", row.content));
    else group.append(row.content);
    node.append(group);
  }
  return node;
}

export function skillList(items) {
  const node = el("div", "px-skill-list");
  for (const item of items) {
    const row = el("span");
    row.append(key(item.key, { small: true }), el("span", "", item.name));
    node.append(row);
  }
  return node;
}

/**
 * A modal card. The host supplies the overlay container (class px-modal); this is the card only.
 * body/footer/note accept trusted HTML strings or Nodes.
 */
export function modal({ kicker = "", title = "", latin = "", sub = "", body = null, footer = null, note = "", wide = false, titleScreen = false, className = "", headHtml = "" } = {}) {
  const cls = ["px-modal__card", "px-panel", "px-panel--framed"];
  if (wide) cls.push("px-modal__card--wide");
  if (titleScreen) cls.push("px-modal__card--title");
  if (className) cls.push(className);
  const card = el("div", cls.join(" "));
  const head = el("div", "px-modal__head");
  if (kicker) head.append(el("div", "px-kicker", kicker));
  if (title) head.append(el("h1", titleScreen ? "px-display px-modal__title" : "px-title px-modal__title px-modal__title--modal", title));
  if (latin) head.append(el("div", "px-latin px-modal__latin", latin));
  if (sub) head.append(el("p", "px-sub px-modal__sub", sub));
  if (headHtml) head.append(el("div", "px-modal__head-extra", headHtml));
  card.append(head);

  if (body != null) {
    const bodyNode = el("div", "px-modal__body");
    if (typeof body === "string") bodyNode.innerHTML = body;
    else bodyNode.append(body);
    card.append(bodyNode);
  }
  if (footer != null) {
    const foot = el("div", "px-modal__foot");
    if (typeof footer === "string") foot.innerHTML = footer;
    else if (Array.isArray(footer)) for (const n of footer) foot.append(n);
    else foot.append(footer);
    card.append(foot);
  }
  if (note) card.append(el("div", "px-modal__note", note));
  return card;
}

export function banner({ kicker, title, sub } = {}) {
  const node = el("div", "px-banner");
  if (kicker != null) node.append(el("div", "px-banner__kicker", kicker));
  if (title != null) node.append(el("div", "px-banner__title", title));
  if (sub != null) node.append(el("div", "px-banner__sub", sub));
  return node;
}

export function toast(text = "") {
  const node = el("div", "px-toast");
  node.textContent = text;
  return node;
}

/* A few 16 x 16 pixel icons, drawn with rects so they stay crisp at any scale. */
export const icons = {
  sound: `<svg class="px-icon" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true" fill="currentColor"><rect x="1" y="6" width="3" height="4"/><rect x="4" y="4" width="2" height="8"/><rect x="6" y="2" width="2" height="12"/><rect x="9" y="4" width="1" height="8"/><rect x="11" y="2" width="1" height="12"/><rect x="13" y="5" width="1" height="6"/></svg>`,
  muted: `<svg class="px-icon" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true" fill="currentColor"><rect x="1" y="6" width="3" height="4"/><rect x="4" y="4" width="2" height="8"/><rect x="6" y="2" width="2" height="12"/><rect x="9" y="4" width="1" height="1"/><rect x="10" y="5" width="1" height="1"/><rect x="11" y="6" width="1" height="4"/><rect x="10" y="10" width="1" height="1"/><rect x="9" y="11" width="1" height="1"/><rect x="12" y="4" width="1" height="1"/><rect x="13" y="5" width="1" height="1"/><rect x="12" y="10" width="1" height="1"/><rect x="13" y="9" width="1" height="1"/></svg>`,
  enter: `<svg class="px-icon" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true" fill="currentColor"><rect x="2" y="2" width="12" height="1"/><rect x="2" y="2" width="1" height="4"/><rect x="13" y="2" width="1" height="4"/><rect x="4" y="6" width="8" height="1"/><rect x="8" y="5" width="1" height="6"/><rect x="5" y="9" width="1" height="1"/><rect x="6" y="10" width="1" height="1"/><rect x="7" y="11" width="1" height="2"/><rect x="8" y="12" width="1" height="1"/><rect x="9" y="10" width="1" height="1"/><rect x="10" y="9" width="1" height="1"/></svg>`,
};
