// The gallery speaks three languages: 中文, English and 日本語.
// UI chrome, category names and the character/weapon labels are translated here; effect names and
// descriptions stay as authored in src/fx, so the same words reach every language (and search still
// matches the ids and English descriptions the library ships with).
//
// The choice lives in ?lang= and localStorage; without either we follow the browser's languages.

export const LANGS = [
  { id: "zh", label: "中文", html: "zh-CN" },
  { id: "en", label: "EN", html: "en" },
  { id: "ja", label: "日本語", html: "ja" },
];
const STORE = "pixelfx.gallery.lang";
const FALLBACK = "en";
let current = FALLBACK;

const TEXT = {
  en: {
    "page.title": "pixelfx-extend — pixel art effects as code",
    "page.desc": "Pixel art effects and animations, every one a small piece of code. Play them, recolor them, export sprite sheets.",
    sub: " pixel art effects, every one a small piece of code.",
    "nav.github": "github",
    "nav.skill": "claude code skill",
    "nav.site": "hanhandi.cn",
    "lang.label": "Language",
    "search.placeholder": "search",
    "search.aria": "Search effects",
    "categories.aria": "Categories",
    "chip.all": "all",
    "chip.source": "source",
    "chip.theme": "theme",
    "theme.aria": "Themes",
    "source.aria": "Source",
    "theme.all": "all themes",
    "theme.naruto": "Naruto",
    "theme.miku": "Hatsune Miku",
    "theme.dragonball": "Dragon Ball",
    "theme.konosuba": "KonoSuba",
    "theme.onepunch": "One Punch Man",
    "theme.classic": "classic effects",
    "prov.all": "all",
    "prov.original": "original",
    "prov.new": "new",
    "tag.new": "new",
    "tile.loop": "loop",
    "tile.copy": "copy",
    "tile.copy.aria": "Copy effect name: {name}",
    "copy.status": "Copied {name}",
    "section.dot": ".",
    empty: "Nothing matches that. Try fire, slash or loop.",
    "cast.aria": "Cast",
    "cast.heading": "Action cast",
    "cast.intro": "4 new characters · pick one to see the moves and costume detail.",
    "cast.weapon": "weapon",
    "cast.weapon.aria": "Weapon",
    "cast.replay": "replay",
    "cast.stage.aria": "Character and weapon action preview",
    "detail.close": "close",
    "detail.play": "play",
    "detail.again": "again",
    "detail.backdrop": "backdrop",
    "detail.palette": "palette",
    "detail.palette.own": "its own",
    "detail.seed": "new seed",
    "detail.character": "character",
    "detail.show": "show",
    "detail.mirror": "mirror",
    "detail.actor": "character",
    "detail.sheet": "sprite sheet",
    "detail.use": "use it",
    "detail.source": "source",
    "detail.copy": "copy",
    "detail.copied": "copied",
    "detail.selected": "selected",
    "control.play": "play",
    "control.pause": "pause",
    "facts.source": "source",
    "facts.kind": "kind",
    "facts.length": "length",
    "facts.acted": "acted",
    "facts.canvas": "canvas",
    "facts.tags": "tags",
    "kind.loop": "loop",
    "kind.oneshot": "one-shot",
    "facts.length.value": "{t} s, {frames} frames at {fps} fps",
    "act.windup": "{t} s wind-up",
    "act.freeze": "{ms} ms freeze at {t} s",
    "act.freezes": "{n} freezes at {t} s",
    "act.recovery": "{t} s recovery",
    "act.sep": ", ",
    "act.none": "the body moves with it",
    "sheet.text": "{n} frames of {w} × {h} px, {cols} across, {fps} fps, {plays}. Save the image, or run: {cmd}",
    "sheet.loops": "loops",
    "sheet.once": "plays once",
  },
  zh: {
    "page.title": "pixelfx-extend · 像素特效库",
    "page.desc": "像素特效与动画，每一个都是一小段代码。可实时播放、换色，并导出精灵图。",
    sub: " 个像素特效，每一个都是一小段代码。",
    "nav.github": "github",
    "nav.skill": "claude code 技能",
    "nav.site": "hanhandi.cn",
    "lang.label": "语言",
    "search.placeholder": "搜索",
    "search.aria": "搜索特效",
    "categories.aria": "分类",
    "chip.all": "全部",
    "chip.source": "来源",
    "chip.theme": "主题",
    "theme.aria": "主题",
    "source.aria": "来源",
    "theme.all": "全部主题",
    "theme.naruto": "火影忍者",
    "theme.miku": "初音未来",
    "theme.dragonball": "龙珠",
    "theme.konosuba": "为美好的世界献上祝福",
    "theme.onepunch": "一拳超人",
    "theme.classic": "经典特效",
    "prov.all": "全部",
    "prov.original": "原作",
    "prov.new": "新增",
    "tag.new": "新增",
    "tile.loop": "循环",
    "tile.copy": "复制",
    "tile.copy.aria": "复制特效名称：{name}",
    "copy.status": "已复制 {name}",
    "section.dot": "",
    empty: "没有匹配的结果，试试 fire、slash 或 loop。",
    "cast.aria": "动作人物",
    "cast.heading": "动作人物",
    "cast.intro": "4 位新增角色 · 选择人物，查看动作与服饰细节。",
    "cast.weapon": "武器",
    "cast.weapon.aria": "武器",
    "cast.replay": "重播",
    "cast.stage.aria": "人物武器动作预览",
    "detail.close": "关闭",
    "detail.play": "播放",
    "detail.again": "重播",
    "detail.backdrop": "背景",
    "detail.palette": "调色板",
    "detail.palette.own": "原样",
    "detail.seed": "新种子",
    "detail.character": "角色",
    "detail.show": "显示",
    "detail.mirror": "镜像",
    "detail.actor": "角色",
    "detail.sheet": "精灵表",
    "detail.use": "如何调用",
    "detail.source": "源码",
    "detail.copy": "复制",
    "detail.copied": "已复制",
    "detail.selected": "已选中",
    "control.play": "播放",
    "control.pause": "暂停",
    "facts.source": "来源",
    "facts.kind": "类型",
    "facts.length": "时长",
    "facts.acted": "动作",
    "facts.canvas": "画布",
    "facts.tags": "标签",
    "kind.loop": "循环",
    "kind.oneshot": "单次",
    "facts.length.value": "{t} 秒，{frames} 帧 / {fps} fps",
    "act.windup": "{t} 秒蓄力",
    "act.freeze": "{t} 秒处定格 {ms} 毫秒",
    "act.freezes": "{t} 秒处 {n} 次定格",
    "act.recovery": "{t} 秒收势",
    "act.sep": "，",
    "act.none": "身体随特效而动",
    "sheet.text": "{n} 帧，单帧 {w} × {h} px，横向 {cols} 列，{fps} fps，{plays}。保存图片，或运行：{cmd}",
    "sheet.loops": "循环播放",
    "sheet.once": "只播一次",
  },
  ja: {
    "page.title": "pixelfx-extend · ピクセルエフェクト集",
    "page.desc": "すべてが小さなコードでできたピクセルエフェクトとアニメーション。再生・色替え・スプライトシート書き出しができます。",
    sub: " 個のピクセルエフェクト。すべてが小さなコードです。",
    "nav.github": "github",
    "nav.skill": "claude code スキル",
    "nav.site": "hanhandi.cn",
    "lang.label": "言語",
    "search.placeholder": "検索",
    "search.aria": "エフェクトを検索",
    "categories.aria": "カテゴリ",
    "chip.all": "すべて",
    "chip.source": "由来",
    "chip.theme": "テーマ",
    "theme.aria": "テーマ",
    "source.aria": "由来",
    "theme.all": "すべてのテーマ",
    "theme.naruto": "NARUTO",
    "theme.miku": "初音ミク",
    "theme.dragonball": "ドラゴンボール",
    "theme.konosuba": "このすば",
    "theme.onepunch": "ワンパンマン",
    "theme.classic": "クラシック",
    "prov.all": "すべて",
    "prov.original": "オリジナル",
    "prov.new": "新規",
    "tag.new": "新規",
    "tile.loop": "ループ",
    "tile.copy": "コピー",
    "tile.copy.aria": "エフェクト名をコピー：{name}",
    "copy.status": "{name} をコピーしました",
    "section.dot": "",
    empty: "一致するものがありません。fire、slash、loop を試してください。",
    "cast.aria": "キャラクター",
    "cast.heading": "キャラクター",
    "cast.intro": "新キャラクター4人 · 選ぶとアクションと衣装のディテールを確認できます。",
    "cast.weapon": "武器",
    "cast.weapon.aria": "武器",
    "cast.replay": "リプレイ",
    "cast.stage.aria": "キャラクターと武器のアクションプレビュー",
    "detail.close": "閉じる",
    "detail.play": "再生",
    "detail.again": "もう一度",
    "detail.backdrop": "背景",
    "detail.palette": "パレット",
    "detail.palette.own": "そのまま",
    "detail.seed": "シードを変更",
    "detail.character": "キャラクター",
    "detail.show": "表示",
    "detail.mirror": "反転",
    "detail.actor": "キャラクター",
    "detail.sheet": "スプライトシート",
    "detail.use": "使い方",
    "detail.source": "ソース",
    "detail.copy": "コピー",
    "detail.copied": "コピーしました",
    "detail.selected": "選択しました",
    "control.play": "再生",
    "control.pause": "一時停止",
    "facts.source": "由来",
    "facts.kind": "種類",
    "facts.length": "長さ",
    "facts.acted": "演技",
    "facts.canvas": "キャンバス",
    "facts.tags": "タグ",
    "kind.loop": "ループ",
    "kind.oneshot": "単発",
    "facts.length.value": "{t} 秒・{frames} フレーム（{fps} fps）",
    "act.windup": "{t} 秒の溜め",
    "act.freeze": "{t} 秒で {ms} ミリ秒フリーズ",
    "act.freezes": "{t} 秒で {n} 回フリーズ",
    "act.recovery": "{t} 秒の戻り",
    "act.sep": "・",
    "act.none": "体がエフェクトと一緒に動く",
    "sheet.text": "{n} フレーム（{w} × {h} px、横 {cols} 列、{fps} fps、{plays}）。画像を保存するか、次のコマンドを実行：{cmd}",
    "sheet.loops": "ループ再生",
    "sheet.once": "1 回再生",
  },
};

// category names and one-line blurbs, in gallery order (src/fx/categories.js keeps the English source)
const CATEGORY = {
  zh: {
    moves: ["招式", "从蓄力到收招的完整攻击，由下面的特效串成"],
    fire: ["火焰", "火把、吐息、火柱、火墙"],
    explosions: ["爆炸", "爆破、烟尘、烟花、蘑菇云"],
    water: ["水流", "水花、瀑布、喷泉、浪涛"],
    ice: ["冰霜", "冰刺、冰环、冻结、碎裂"],
    lightning: ["雷电", "落雷、电弧、缠绕、雷暴"],
    scifi: ["科幻", "全息、护盾、扫描、跃迁"],
    melee: ["近战", "斩击、拖影、劈砍、连击"],
    thrown: ["投掷", "投掷武器动作：苦无、炸弹、回旋镖与符箓"],
    impacts: ["打击", "命中火花、冲击波、落地"],
    projectiles: ["弹道", "子弹、火箭、激光、箭矢"],
    spawn: ["生成与死亡", "烟雾、传送门、灵魂、碎裂"],
    arcane: ["奥术", "传送门、符文、飞弹、光束"],
    ninjutsu: ["忍术", "查克拉之术：螺旋丸、雷刃、火球、水龙、分身"],
    senjutsu: ["仙术", "自然能量之术：大玉、风刃、白光"],
    holy: ["圣光", "治疗、光环、光柱"],
    shadow: ["暗影", "诅咒、虚空、触须、灵魂"],
    status: ["状态", "燃烧、冰冻、中毒、睡眠"],
    nature: ["自然", "剧毒、藤蔓、荆棘、地裂"],
    weather: ["天气", "雨、雪、雾、极光"],
    ui: ["界面", "升级、数字、提示、倒计时"],
    pickups: ["拾取物", "金币、宝石、宝箱、药水、玉简、灯笼与飞剑"],
    miku: ["初音", "虚拟偶像与她的青绿歌声：双马尾、声环、音符与葱"],
    konosuba: ["爆裂魔法", "血色法阵、白热爆裂、焦土与整套连招：惠惠的爆裂魔法"],
    dragonball: ["龙珠", "气之技法：聚气、龟派气功、贯穿钻光、元气弹、气圆斩与金色气焰"],
    onepunch: ["一拳超人", "英雄冲击之术：认真一拳、连续普通拳与地面崩裂落地"],
    transitions: ["转场", "划像、圆形遮罩、溶解"],
    critters: ["小生物", "史莱姆、蝙蝠、幽灵、青蛙"],
    world: ["地图", "战斗地图：月光遗迹、熔岩洞窟、带布局的竞技场"],
    mobs: ["小怪", "小兵与其攻击：哥布林、孢子兽、突刺、喷吐"],
    boss: ["Boss", "Boss 单位、带预警的攻击与阶段转换"],
  },
  ja: {
    moves: ["モーション", "溜めから戻りまでの一連の攻撃。下のエフェクトを繋いだもの"],
    fire: ["炎", "松明、ブレス、火柱、炎の壁"],
    explosions: ["爆発", "爆風、煙、花火、きのこ雲"],
    water: ["水", "水しぶき、滝、噴水、波"],
    ice: ["氷", "氷柱、ノヴァ、凍結、砕け"],
    lightning: ["雷", "落雷、アーク、うねり、嵐"],
    scifi: ["SF", "ホログラム、シールド、スキャン、ワープ"],
    melee: ["近接", "斬撃、残像、薙ぎ、コンボ"],
    thrown: ["投擲", "投擲武器の動作：クナイ、爆弾、ブーメラン、符"],
    impacts: ["打撃", "ヒットスパーク、衝撃波、着地"],
    projectiles: ["飛び道具", "弾、ロケット、レーザー、矢"],
    spawn: ["生成と消滅", "煙、ポータル、魂、砕散"],
    arcane: ["秘術", "ポータル、ルーン、ミサイル、ビーム"],
    ninjutsu: ["忍術", "チャクラの術：螺旋丸、雷刃、火球、水龍、分身"],
    senjutsu: ["仙術", "自然エネルギーの術：大玉、風刃、白光"],
    holy: ["聖", "回復、光輪、光柱"],
    shadow: ["闇", "呪い、虚無、触手、魂"],
    status: ["状態", "燃焼、凍結、毒、睡眠"],
    nature: ["自然", "毒、蔦、棘、地割れ"],
    weather: ["天候", "雨、雪、霧、オーロラ"],
    ui: ["UI", "レベルアップ、数字、トースト、カウントダウン"],
    pickups: ["アイテム", "コイン、宝石、宝箱、ポーション、玉簡、提灯、飛剣"],
    miku: ["ミク", "バーチャルアイドルとティールの歌：ツインテール、音の輪、音符、ネギ"],
    konosuba: ["爆裂魔法", "血の魔法陣、白熱の爆裂、焦土、そして一連のモーション：めぐみんの爆裂魔法"],
    dragonball: ["ドラゴンボール", "気の技法：気溜め、かめはめ波、貫通ドリル光線、元気玉、気円斬、金色のオーラ"],
    onepunch: ["ワンパンマン", "ヒーローの衝撃技：マジ殴り、連続普通のパンチ、地面を砕く着地"],
    transitions: ["トランジション", "ワイプ、アイリス、ディゾルブ"],
    critters: ["小生物", "スライム、コウモリ、幽霊、カエル"],
    world: ["マップ", "戦闘マップ：月明かりの遺跡、溶岩洞窟、レイアウト付きの闘技場"],
    mobs: ["モブ", "雑魚とその攻撃：ゴブリン、スポアリング、突き、噴射"],
    boss: ["ボス", "ボスユニット、予告付きの攻撃、フェーズ移行"],
  },
};

// [display label, role line] — characters ship a Chinese label and an English name; ja is here
const CHARACTER = {
  en: {
    dummy: ["Armored stand-in", "training dummy"],
    "ember-duelist": ["Ember duelist", "short cape · crimson gold"],
    "moon-oracle": ["Moon oracle", "moon crown · indigo robe"],
    "laurel-ranger": ["Laurel ranger", "long braid · green shawl"],
    "styx-warden": ["Styx warden", "bone mask · dark purple heavy armor"],
    naruto: ["Naruto", "sun-blond spikes · orange shinobi jacket"],
    sasuke: ["Sasuke", "long fringe · high collar and violet sash"],
    "hatsune-miku": ["Hatsune Miku", "teal twin tails · idol uniform"],
    daoist: ["Daoist", "topknot · indigo robe"],
    "lu-mingfei": ["Lu Mingfei", "messy hair · school uniform"],
    "uesugi-eriyi": ["Uesugi Eriyi", "crimson hair · white dress"],
    "iron-man": ["Iron Man", "red-gold armor · arc reactor"],
    hulk: ["Hulk", "gamma green · torn purple"],
    thor: ["Thor", "winged helm · red cape"],
    "captain-america": ["Captain America", "white star · red-white stripes"],
  },
  ja: {
    dummy: ["甲冑の人形", "訓練用の人形"],
    "ember-duelist": ["残火の剣士", "ショートマント・紅金"],
    "moon-oracle": ["月相の神官", "月冠・藍の長衣"],
    "laurel-ranger": ["月桂のレンジャー", "長い三つ編み・緑の肩掛け"],
    "styx-warden": ["冥河の番人", "骨面・暗紫の重装"],
    naruto: ["ナルト", "金髪のツンツン頭・橙の忍装束"],
    sasuke: ["サスケ", "長い前髪・ハイカラーと紫の帯"],
    "hatsune-miku": ["初音ミク", "青緑のツインテール・アイドル衣装"],
    daoist: ["道士", "道髻・藍の道服"],
    "lu-mingfei": ["路明非", "寝ぐせ・学院の制服"],
    "uesugi-eriyi": ["上杉絵梨衣", "緋色の長い髪・白いワンピース"],
    "iron-man": ["アイアンマン", "赤金の装甲・アークリアクター"],
    hulk: ["ハルク", "ガンマの緑・破れた紫"],
    thor: ["ソー", "翼の兜・赤いマント"],
    "captain-america": ["キャプテン・アメリカ", "白い星・紅白の腰帯"],
  },
};

const WEAPON = {
  ja: {
    melee: "近接武器",
    thrown: "投擲武器",
    sword: "長剣",
    dagger: "短剣",
    staff: "金箍棒",
    spear: "長槍",
    lance: "騎兵槍",
    "holy-sword": "聖剣",
    katana: "太刀",
    "war-mace": "重メイス",
    rapier: "レイピア",
    kunai: "クナイ",
    "powder-bomb": "火薬弾",
    boomerang: "ブーメラン",
    talisman: "符",
    "flying-sword": "飛剣",
    "binding-silk": "縛仙綾",
    "soul-bell": "摂魂鈴",
    "pear-needles": "梨花針",
  },
};

const BACKDROP = {
  zh: { dark: "暗底", ground: "地面", sky: "夜空", light: "亮底", black: "纯黑", none: "无" },
  ja: { dark: "暗い", ground: "地面", sky: "夜空", light: "明るい", black: "黒", none: "なし" },
};

export function langHtml(id = current) {
  return LANGS.find((l) => l.id === id)?.html ?? "en";
}
export function getLang() {
  return current;
}
export function isLang(id) {
  return LANGS.some((l) => l.id === id);
}

// ?lang= wins, then the last choice, then the browser; a bare "zh-*" (简体 or 繁体) counts as 中文
export function detectLang() {
  const fromUrl = new URLSearchParams(location.search).get("lang");
  let stored = null;
  try {
    stored = localStorage.getItem(STORE);
  } catch {}
  const tags = [fromUrl, stored, ...(navigator.languages ?? [navigator.language ?? ""])].filter(Boolean);
  for (const tag of tags) {
    const low = String(tag).toLowerCase();
    const hit = LANGS.find((l) => low === l.id || low.startsWith(`${l.id}-`) || (l.id === "zh" && low.startsWith("zh")));
    if (hit) return hit.id;
  }
  return FALLBACK;
}

export function setLang(id) {
  current = isLang(id) ? id : FALLBACK;
  try {
    localStorage.setItem(STORE, current);
  } catch {}
  return current;
}

export function t(key, vars) {
  const s = TEXT[current]?.[key] ?? TEXT[FALLBACK][key] ?? key;
  return vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : s;
}

export function categoryText(c) {
  const hit = CATEGORY[current]?.[c.id];
  return hit ? { name: hit[0], blurb: hit[1] } : { name: c.name, blurb: c.blurb };
}
export function characterText(c) {
  const hit = CHARACTER[current]?.[c.id];
  if (hit) return { label: hit[0], role: hit[1] };
  return { label: c.label, role: c.role };
}
// the option line in a picker: the localized label first, the library's English name after it
export function characterOption(c) {
  return current === "en" ? c.name : `${characterText(c).label} · ${c.name}`;
}
export function weaponText(w) {
  if (current === "zh") return w.label;
  if (current === "ja") return WEAPON.ja[w.id] ?? w.name;
  return w.name;
}
export function weaponOption(w) {
  return current === "en" ? w.name : `${weaponText(w)} · ${w.name}`;
}
export function weaponClassText(k) {
  if (current === "zh") return k.label;
  if (current === "ja") return WEAPON.ja[k.id] ?? k.name;
  return k.name;
}
export function backdropText(kind) {
  return BACKDROP[current]?.[kind] ?? kind;
}

// Fill every [data-i18n] hook in the markup, plus the page title and description.
export function applyStatic(root = document) {
  for (const el of root.querySelectorAll("[data-i18n]")) el.textContent = t(el.dataset.i18n);
  for (const el of root.querySelectorAll("[data-i18n-placeholder]")) el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder));
  for (const el of root.querySelectorAll("[data-i18n-aria-label]")) el.setAttribute("aria-label", t(el.dataset.i18nAriaLabel));
  for (const el of root.querySelectorAll("[data-i18n-title]")) el.setAttribute("title", t(el.dataset.i18nTitle));
  document.documentElement.lang = langHtml();
  document.title = t("page.title");
  document.querySelector('meta[name="description"]')?.setAttribute("content", t("page.desc"));
}
