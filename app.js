(function () {
"use strict";

// ─── GUARD ────────────────────────────────────────────────────────────────

if (!window.APP_SPOTS || !Array.isArray(window.APP_SPOTS.spots)) {
document.body.innerHTML =
'<div style="padding:24px;color:white;background:#0b0f14;min-height:100vh;font-family:system-ui,sans-serif">' +
'<h1 style="margin-top:0">Errore dati</h1>' +
'<p>Il file spots.js manca o contiene un errore.</p></div>';
throw new Error("APP_SPOTS non disponibile");
}

// ─── STORAGE KEYS ─────────────────────────────────────────────────────────

const STORAGE_KEYS = {
favorites: APP_SPOTS.storageKeys?.favorites || "travel_sail_favorites_v1",
planner:   APP_SPOTS.storageKeys?.planner   || "travel_sail_planner_v1",
mode:      "travel_sail_mode_v1"
};

const DEFAULT_PLANNER = { alba: null, main: null, tramonto: null };

// ─── APP STATE ────────────────────────────────────────────────────────────

const APP = {
mode:            loadJson(STORAGE_KEYS.mode, "travel"),
level:           "all",
light:           "all",
zone:            "all",
activity:        "all",
favoritesFilter: "all",
sailFilter:      "all",
mapQuickFilter:  "all",
search:          "",
userPos:         null,
lastGpsPos:      null,
lastGpsUpdate:   0,
currentSpot:     null,
weatherData:     null,
marineData:      null,
hourlyData:      [],
sunTimes:        null,
sunsetTimer:     null,
favorites:       loadJson(STORAGE_KEYS.favorites, []),
planner:         loadJson(STORAGE_KEYS.planner, DEFAULT_PLANNER),
nearbySpots:     [],
activePage:      "home",
map:             null,
markers:         [],
markerBySpotId:  new Map(),
gpsWatchId:      null,
gpsPath:         [],
gpsLine:         null,
gpsMarker:       null
};

window.APP = APP;

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 1 — UTILITIES DI BASE
// ═══════════════════════════════════════════════════════════════════════════

function $(id) { return document.getElementById(id); }

function clone(value) { return JSON.parse(JSON.stringify(value)); }

function loadJson(key, fallback) {
try {
const raw = localStorage.getItem(key);
if (!raw) return clone(fallback);
return JSON.parse(raw);
} catch { return clone(fallback); }
}

function saveJson(key, value) {
localStorage.setItem(key, JSON.stringify(value));
}

function escapeHtml(str) {
return String(str ?? "")
.replaceAll("&", "&")
.replaceAll("<", "<")
.replaceAll(">", ">")
.replaceAll('"', """)
.replaceAll("'", "'");
}

function normalizeText(value) {
return String(value || "")
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g, "")
.trim();
}

function currentPeriod() {
const h = new Date().getHours();
if (h < 9)   return "alba";
if (h >= 17) return "tramonto";
return "giorno";
}

function getCurrentHour() { return new Date().getHours(); }

function normalizeLight(value) {
const v = normalizeText(value);
if (v === "alba"     || v === "sunrise") return "alba";
if (v === "tramonto" || v === "sunset")  return "tramonto";
if (v === "giorno"   || v === "day")     return "giorno";
if (v === "mattina"  || v === "morning") return "giorno";
if (v === "sera"     || v === "evening") return "tramonto";
if (v === "notte"    || v === "night")   return "tramonto";
return v || "giorno";
}

function lightMatchesFilter(spotLight, filterLight) {
if (filterLight === "all") return true;
return normalizeLight(spotLight) === normalizeLight(filterLight);
}

function isMorningLike(spotLight) {
const v = normalizeLight(spotLight);
return v === "alba" || normalizeText(spotLight) === "mattina";
}

function isEveningLike(spotLight) {
const v = normalizeLight(spotLight);
return v === "tramonto" || normalizeText(spotLight) === "sera";
}

function parseSunTime(raw) {
if (!raw) return null;
const d = new Date(raw);
return isNaN(d.getTime()) ? null : d;
}

function formatTime(dateObj) {
if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return "—";
return dateObj.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
}

function getMinutesDiff(from, to) {
return Math.floor((to.getTime() - from.getTime()) / 60000);
}

function formatCountdown(totalMinutes) {
if (!Number.isFinite(totalMinutes)) return "—";
if (totalMinutes <= 0) return "ora";
const h = Math.floor(totalMinutes / 60);
const m = totalMinutes % 60;
if (h <= 0) return ${m}m;
return ${h}h ${String(m).padStart(2, "0")}m;
}

function distKm(lat1, lon1, lat2, lon2) {
const R    = 6371;
const dLat = (lat2 - lat1) * Math.PI / 180;
const dLon = (lon2 - lon1) * Math.PI / 180;
const a    =
Math.sin(dLat / 2) ** 2 +
Math.cos(lat1 * Math.PI / 180) *
Math.cos(lat2 * Math.PI / 180) *
Math.sin(dLon / 2) ** 2;
return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function displayDistance(d) {
if (d == null) return "distanza non disponibile";
if (d < 1)    return ${Math.round(d * 1000)} m da te;
return ${d.toFixed(1)} km da te;
}

function getSpotImage(s) {
return s.image || https://picsum.photos/seed/${encodeURIComponent(s.name)}/900/600;
}

function getBaseSpots()  { return APP_SPOTS.spots; }
function getSpotById(id) { return APP_SPOTS.spots.find(s => s.id === id) || null; }

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 2 — SMART SEARCH
// ═══════════════════════════════════════════════════════════════════════════

const SEARCH_INTENT_MAP = {
"epico":       { minWow: 9 },
"wow":         { minWow: 9 },
"forte":       { minWow: 8 },
"top":         { level: "core" },
"mega":        { minWow: 9 },
"mistico":     { tagMatch: "mistico" },
"avventura":   { tagMatch: "avventura" },
"iconico":     { tagMatch: "iconico" },
"panorama":    { anyOf: [{ activity: "view" }, { tagMatch: "panorama" }] },
"trekking":    { activity: "trekking" },
"mtb":         { activity: "mtb" },
"bike":        { activity: "mtb" },
"bici":        { activity: "mtb" },
"view":        { activity: "view" },
"viewpoint":   { activity: "view" },
"belvedere":   { activity: "view" },
"relax":       { activity: "relax" },
"acqua":       { anyOf: [{ activity: "water" }, { tagMatch: "acqua" }, { tagMatch: "lago" }] },
"kayak":       { anyOf: [{ activity: "water" }, { tagMatch: "kayak" }] },
"sup":         { anyOf: [{ activity: "water" }, { tagMatch: "sup" }] },
"surf":        { anyOf: [{ activity: "water" }, { tagMatch: "surf" }] },
"nuoto":       { anyOf: [{ activity: "water" }, { tagMatch: "bagno" }] },
"sport acqua": { activity: "water" },
"tramonto":    { light: "tramonto" },
"alba":        { light: "alba" },
"giorno":      { light: "giorno" },
"mattina":     { light: "alba" },
"sera":        { light: "tramonto" },
"golden":      { light: "tramonto" },
"facile":      { difficulty: "facile" },
"easy":        { difficulty: "facile" },
"semplice":    { difficulty: "facile" },
"medio":       { difficulty: "medio" },
"difficile":   { difficulty: "impegnativo" },
"impegnativo": { difficulty: "impegnativo" },
"serio":       { difficulty: "impegnativo" },
"tecnico":     { difficulty: "impegnativo" },
"lago":        { anyOf: [{ zone: "lago" }, { tagMatch: "lago" }] },
"montagna":    { zone: "montagna" },
"nord":        { zone: "nord" },
"est":         { zone: "est" },
"ovest":       { zone: "ovest" },
"sud":         { zone: "sud" },
"vicino":      { nearMe: true },
"vicini":      { nearMe: true },
"lontano":     { farMe: true },
"calma":       { anyOf: [{ activity: "water" }, { tagMatch: "calma" }] }
};

function evaluateConstraint(spot, c) {
if (!c) return true;
if (c.anyOf) return c.anyOf.some(sub => evaluateConstraint(spot, sub));

if ("activity"   in c && spot.activity   !== c.activity)  return false;  
if ("zone"       in c && spot.zone       !== c.zone)       return false;  
if ("level"      in c && spot.level      !== c.level)      return false;  
if ("difficulty" in c && spot.difficulty !== c.difficulty) return false;  
if ("light"      in c) {  
  if (normalizeLight(spot.light) !== normalizeLight(c.light)) return false;  
}  
if ("minWow" in c) {  
  if ((spot.experience?.wow || 0) < c.minWow) return false;  
}  
if ("tagMatch" in c) {  
  const needle  = normalizeText(c.tagMatch);  
  const hayTags = [  
    ...(spot.tags   || []),  
    ...(spot.alias  || []),  
    spot.experience?.mood,  
    spot.mood,  
    spot.activity,  
    spot.zone  
  ].filter(Boolean).map(normalizeText);  
  if (!hayTags.some(t => t.includes(needle))) return false;  
}  
if ("nearMe" in c) {  
  if (APP.userPos && spot._distance != null && spot._distance > 30) return false;  
}  
return true;

}

function buildHaystack(spot) {
return [
spot.name,
spot.zone,
spot.activity,
spot.difficulty,
spot.level,
spot.light,
spot.desc,
spot.tip,
spot.mood,
spot.longDescription,
spot.weatherNote,
spot.photoTips,
spot.experience?.mood,
spot.experience?.tipo,
spot.experience?.tempo,
spot.whenToGo?.note,
spot.whenToGo?.best,
...(spot.tags        || []),
...(spot.alias       || []),
...(spot.smartTips   || []),
...(spot.whenToAvoid || [])
]
.filter(Boolean)
.map(normalizeText)
.join(" ");
}

function smartSearchMatch(spot, rawQuery) {
if (!rawQuery || !rawQuery.trim()) return true;

const q     = normalizeText(rawQuery);  
const words = q.split(/\s+/).filter(Boolean);  
const hay   = buildHaystack(spot);  

if (words.every(w => hay.includes(w))) return true;  

const intentWords = words.filter(w => w in SEARCH_INTENT_MAP);  
const textWords   = words.filter(w => !(w in SEARCH_INTENT_MAP));  

if (intentWords.length === words.length && intentWords.length > 0) {  
  return intentWords.every(w => evaluateConstraint(spot, SEARCH_INTENT_MAP[w]));  
}  

if (intentWords.length > 0) {  
  const textOk   = textWords.every(w => hay.includes(w));  
  const intentOk = intentWords.every(w => evaluateConstraint(spot, SEARCH_INTENT_MAP[w]));  
  return textOk && intentOk;  
}  

return false;

}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 3 — WEATHER SUITABILITY
// ═══════════════════════════════════════════════════════════════════════════

function getWeatherWindowFit(spot) {
const h     = getCurrentHour();
const light = normalizeLight(spot.light);

if (light === "alba") {  
  if (h < 6)  return 2;  
  if (h < 9)  return 4;  
  if (h < 11) return 1;  
  return -2;  
}  
if (light === "tramonto") {  
  if (h < 14) return -1;  
  if (h < 17) return 1;  
  if (h < 20) return 4;  
  return 1;  
}  
if (light === "giorno") {  
  if (h < 8)  return 0;  
  if (h < 17) return 3;  
  if (h < 19) return 1;  
  return -1;  
}  
return 0;

}

function weatherSuitability(spot) {
const w = APP.weatherData;
if (!w) return { score: 0, label: "meteo neutro", cls: "gold" };

let score    = 0;  
const zone   = normalizeText(spot.zone       || "");  
const act    = normalizeText(spot.activity   || "");  
const diff   = normalizeText(spot.difficulty || "");  
const light  = normalizeLight(spot.light     || "");  
const hay    = buildHaystack(spot);  

if (w.rain >= 55) {  
  if (act === "relax") score += 3;  
  if (["foresta", "bosco", "verde", "grotta"].some(t => hay.includes(t))) score += 4;  
  if (act === "view" && (zone === "montagna" || zone === "ovest")) score -= 3;  
  if (light === "tramonto" || light === "alba") score -= 2;  
} else if (w.rain >= 30) {  
  if (act === "trekking") score -= 2;  
  if (act === "relax")    score += 1;  
}  

if (w.wind >= 38) {  
  if (zone === "montagna")   score -= 5;  
  if (diff === "impegnativo") score -= 3;  
  if (act === "view")        score -= 2;  
  if (act === "relax")       score += 1;  
  if (act === "water")       score -= 5;  
} else if (w.wind >= 28) {  
  if (zone === "montagna")                        score -= 3;  
  if (act === "trekking" && diff === "impegnativo") score -= 2;  
  if (act === "water")                            score -= 3;  
} else if (w.wind <= 15) {  
  if (act === "view")  score += 1;  
  if (act === "water") score += 3;  
} else if (w.wind <= 18) {  
  if (act === "view")  score += 1;  
  if (act === "water") score += 1;  
}  

if (w.cloud >= 75) {  
  if (["foresta", "verde", "bosco"].some(t => hay.includes(t)) || act === "trekking") score += 2;  
  if (light === "tramonto" || light === "alba") score -= 2;  
} else if (w.cloud <= 35 && w.rain < 25) {  
  if (light === "alba" || light === "tramonto") score += 3;  
  if (act === "view")       score += 2;  
  if (zone === "montagna")  score += 1;  
}  

score += getWeatherWindowFit(spot);  

if ((spot.experience?.wow || 0) >= 10) score += 1;  

if (score >= 7)  return { score, label: "ottimo oggi",  cls: "green" };  
if (score >= 3)  return { score, label: "molto valido", cls: "gold" };  
if (score <= -3) return { score, label: "meno ideale",  cls: "pink" };  
return { score, label: "così così", cls: "blue" };

}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 4 — SPOT POOL & META
// ═══════════════════════════════════════════════════════════════════════════

function getAllSpotsWithMeta() {
return getBaseSpots().map(s => {
const dist = APP.userPos ? distKm(APP.userPos.lat, APP.userPos.lon, s.lat, s.lon) : null;

let alt = (typeof s.alt === "number" ? s.alt : (typeof s.altitude === "number" ? s.altitude : null));  
  if (alt == null && dist != null && dist <= 0.15 && APP.userPos && APP.userPos.altitude != null) {  
    alt = Math.round(APP.userPos.altitude);  
  }  

  return {  
    ...s,  
    _distance:  dist,  
    distance:   dist,  
    altitude:   alt,  
    weatherFit: weatherSuitability(s),  
    sailMeta:   window.SAIL ? window.SAIL.getSpotSailMeta(s, APP) : null  
  };  
});

}

function getFilteredSpots() {
let items = getAllSpotsWithMeta().filter(s =>
(APP.level           === "all" || s.level    === APP.level) &&
lightMatchesFilter(s.light, APP.light) &&
(APP.zone            === "all" || s.zone     === APP.zone) &&
(APP.activity        === "all" || s.activity === APP.activity) &&
(APP.favoritesFilter === "all" || isFavorite(s.id)) &&
smartSearchMatch(s, APP.search)
);

if (APP.mode === "sail" && window.SAIL) {  
  items = items.filter(s => window.SAIL.filterSpotForSailMode(s, APP));  
}  

return items.sort((a, b) => {  
  if (APP.mode === "sail") {  
    const sailDiff = (b.sailMeta?.score || 0) - (a.sailMeta?.score || 0);  
    if (sailDiff !== 0) return sailDiff;  
  }  
  const lo = { core: 0, secondary: 1, extra: 2 };  
  if (b.weatherFit.score !== a.weatherFit.score) return b.weatherFit.score - a.weatherFit.score;  
  if ((lo[a.level] ?? 9) !== (lo[b.level] ?? 9)) return (lo[a.level] ?? 9) - (lo[b.level] ?? 9);  
  if (a.distance == null && b.distance == null)  return a.name.localeCompare(b.name, "it");  
  if (a.distance == null) return 1;  
  if (b.distance == null) return -1;  
  if (a.distance !== b.distance) return a.distance - b.distance;  
  return a.name.localeCompare(b.name, "it");  
});

}

function getMapFilteredSpots() {
let items = getAllSpotsWithMeta();
if (APP.level !== "all") items = items.filter(s => s.level === APP.level);
if (APP.mode === "sail" && window.SAIL) {
items = items.filter(s => window.SAIL.filterSpotForSailMode(s, APP));
}
if (APP.mapQuickFilter === "wow")       return items.filter(s => (APP_SPOTS.topWowNames || []).includes(s.name));
if (APP.mapQuickFilter === "sunset")    return items.filter(s => isEveningLike(s.light));
if (APP.mapQuickFilter === "alba")      return items.filter(s => isMorningLike(s.light));
if (APP.mapQuickFilter === "favorites") return items.filter(s => isFavorite(s.id));
return items;
}

function sortBestPool(pool) {
return [...pool].sort((a, b) => {
if (b.weatherFit.score !== a.weatherFit.score) return b.weatherFit.score - a.weatherFit.score;
const lo = { core: 0, secondary: 1, extra: 2 };
if ((lo[a.level] ?? 9) !== (lo[b.level] ?? 9)) return (lo[a.level] ?? 9) - (lo[b.level] ?? 9);
const ad = a.distance ?? 999999;
const bd = b.distance ?? 999999;
if (ad !== bd) return ad - bd;
return a.name.localeCompare(b.name, "it");
});
}

function getBestSpotToday() {
if (APP.mode === "sail" && window.SAIL) return window.SAIL.getBestSailSpot(APP);
const desired = currentPeriod();
let pool = getAllSpotsWithMeta();
if (APP.level !== "all") pool = pool.filter(s => s.level === APP.level);
let pp = pool.filter(s => normalizeLight(s.light) === desired);
if (!pp.length && desired === "giorno")   pp = pool.filter(s => normalizeText(s.light) === "mattina" || normalizeLight(s.light) === "giorno");
if (!pp.length && desired === "tramonto") pp = pool.filter(s => isEveningLike(s.light));
if (!pp.length && desired === "alba")     pp = pool.filter(s => isMorningLike(s.light));
if (!pp.length) pp = pool;
return sortBestPool(pp)[0] || null;
}

function getBestWowSpot() {
let pool = getAllSpotsWithMeta().filter(s => (APP_SPOTS.topWowNames || []).includes(s.name));
if (APP.level !== "all") pool = pool.filter(s => s.level === APP.level);
return sortBestPool(pool)[0] || null;
}

function getBestSunsetSpot() {
if (APP.mode === "sail" && window.SAIL) return window.SAIL.getBestSailSunsetSpot(APP);
let pool = getAllSpotsWithMeta().filter(s => isEveningLike(s.light));
if (APP.level !== "all") pool = pool.filter(s => s.level === APP.level);
return sortBestPool(pool)[0] || null;
}

function getClosestSpot() {
if (!APP.userPos) return null;
let pool = getAllSpotsWithMeta().filter(s => s.distance != null);
if (APP.level !== "all") pool = pool.filter(s => s.level === APP.level);
if (APP.mode === "sail" && window.SAIL) pool = pool.filter(s => window.SAIL.filterSpotForSailMode(s, APP));
if (!pool.length) return null;
pool.sort((a, b) => a.distance - b.distance);
const nearest = pool[0];
if (!nearest) return null;
if (nearest.weatherFit.cls !== "pink") return nearest;
const better = pool.find(s => s.weatherFit.cls !== "pink" && s.distance <= nearest.distance + 12);
return better || nearest;
}

function getClosestSpots(limit = 5) {
if (!APP.userPos) return [];
let pool = getAllSpotsWithMeta().filter(s => s.distance != null);
if (APP.level !== "all") pool = pool.filter(s => s.level === APP.level);
if (APP.mode === "sail" && window.SAIL) {
pool = pool.filter(s => window.SAIL.filterSpotForSailMode(s, APP));
}
pool.sort((a, b) => a.distance - b.distance);
return pool.slice(0, limit);
}

function renderNearbyPage() {
const box = $("nearbyList");
if (!box) return;

const items = APP.nearbySpots || [];  

if (!APP.userPos) {  
  box.innerHTML = `<div class="detail-empty">Attiva il GPS per vedere gli spot vicini.</div>`;  
  return;  
}  

if (!items.length) {  
  box.innerHTML = `<div class="detail-empty">Nessuno spot trovato nelle vicinanze.</div>`;  
  return;  
}  

box.innerHTML = items.map(s => `  
<div class="spot-card glass tap" data-nearby-id="${escapeHtml(s.id)}">  
  <div class="spot-head">  
    <div>  
      <div class="spot-name">${escapeHtml(s.name)}</div>  
      <div class="spot-sub">  
        ${escapeHtml(s.zone)} · ${escapeHtml(s.activity)}  
      </div>  
    </div>  
  </div>  

  <div class="spot-meta">  
    <span class="tag blue">${displayDistance(s.distance)}</span>  
    ${s.weatherFit ? `<span class="tag ${s.weatherFit.cls}">${escapeHtml(s.weatherFit.label)}</span>` : ""}  
    ${s.altitude != null ? `<span class="tag">${s.altitude} m</span>` : ""}  
  </div>  

  <div class="spot-desc">  
    ${escapeHtml(s.tip || s.desc || "")}  
  </div>  
</div>

`).join("");

box.querySelectorAll("[data-nearby-id]").forEach(card => {  
  card.addEventListener("click", () => {  
    const spot = items.find(s => s.id === card.dataset.nearbyId);  
    if (spot) {  
      showSpotDetail(spot);  
      switchPage("detail");  
    }  
  });  
});

}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 5 — GO NOW ENGINE v2
// ═══════════════════════════════════════════════════════════════════════════

function scoreDistance(spot) {
const d = spot.distance;
if (d == null) return 0;
if (d <= 3)    return 25;
if (d <= 8)    return 20;
if (d <= 15)   return 14;
if (d <= 25)   return 8;
if (d <= 50)   return 2;
if (d <= 100)  return -2;
if (d <= 200)  return -5;
return -Math.min(12, Math.round(d / 60));
}

function scoreTimeLight(spot) {
const h        = getCurrentHour();
const lightRaw = normalizeText(spot.light);
const light    = normalizeLight(spot.light);

if (light === "alba") {  
  if (h < 5)  return 10;  
  if (h < 9)  return 26;  
  if (h < 11) return 8;  
  return -10;  
}  
if (lightRaw === "mattina") {  
  if (h < 8)  return 8;  
  if (h < 12) return 20;  
  if (h < 14) return 8;  
  return -5;  
}  
if (light === "giorno") {  
  if (h < 8)  return 2;  
  if (h < 16) return 20;  
  if (h < 18) return 8;  
  return -4;  
}  
if (light === "tramonto") {  
  if (h < 13) return -5;  
  if (h < 16) return 10;  
  if (h < 20) return 26;  
  return 8;  
}  
if (lightRaw === "sera") {  
  if (h < 16) return -3;  
  if (h < 21) return 20;  
  return 8;  
}  
return 0;

}

function scoreDifficulty(spot) {
const diff = normalizeText(spot.difficulty || "");
const h    = getCurrentHour();
if (diff === "impegnativo") {
if (h >= 17) return -10;
if (h >= 14) return -5;
if (h < 9)   return 4;
return 0;
}
if (diff === "medio"  && h >= 18) return -4;
if (diff === "facile" && h >= 17) return 3;
return 0;
}

function scoreWow(spot) {
const wow = spot.experience?.wow || 0;
if (wow >= 10) return 10;
if (wow >= 9)  return 7;
if (wow >= 8)  return 4;
if (wow >= 7)  return 2;
return 0;
}

function scoreActivityPeriod(spot) {
const period = currentPeriod();
const act    = normalizeText(spot.activity || "");
if (act === "view"     && period === "tramonto") return 8;
if (act === "view"     && period === "alba")     return 6;
if (act === "trekking" && period === "giorno")   return 5;
if (act === "trekking" && period === "alba")     return 4;
if (act === "relax"    && period === "tramonto") return 5;
if (act === "relax"    && period === "giorno")   return 2;
if (act === "water"    && period === "giorno")   return 5;
if (act === "mtb"      && period === "giorno")   return 5;
if (act === "mtb"      && period === "alba")     return 3;
return 0;
}

function scoreWeatherContext(spot) {
const w = APP.weatherData;
if (!w) return 0;
let bonus = 0;
const act   = normalizeText(spot.activity || "");
const zone  = normalizeText(spot.zone     || "");
const light = normalizeLight(spot.light   || "");
const hay   = buildHaystack(spot);

if (w.rain >= 50) {  
  if (["foresta", "bosco", "verde", "grotta"].some(t => hay.includes(t))) bonus += 10;  
  if (act === "relax") bonus += 5;  
  if (light === "tramonto" || light === "alba") bonus -= 6;  
  if (act === "view") bonus -= 4;  
}  
if (w.wind >= 35) {  
  if (zone === "montagna") bonus -= 10;  
  if (normalizeText(spot.difficulty || "") === "impegnativo") bonus -= 5;  
}  
if (w.wind <= 12 && act === "water") bonus += 8;  
if (w.wind >= 28 && act === "water") bonus -= 12;  
if (w.cloud <= 30 && w.rain < 20) {  
  if (light === "tramonto" || light === "alba") bonus += 8;  
  if (act === "view") bonus += 5;  
}  
if (w.cloud >= 85) {  
  if (light === "tramonto" || light === "alba") bonus -= 4;  
  if (act === "view") bonus -= 3;  
}  
return bonus;

}

function rankSpotForGoNow(spot) {
const levelBoost = { core: 18, secondary: 10, extra: 4 };
return (spot.weatherFit?.score || 0) * 10
+ scoreTimeLight(spot)
+ scoreDistance(spot)
+ (levelBoost[spot.level] || 0)
+ scoreWow(spot)
+ scoreDifficulty(spot)
+ scoreActivityPeriod(spot)
+ scoreWeatherContext(spot);
}

function getGoNowSuggestions() {
if (APP.mode === "sail" && window.SAIL) {
const best = window.SAIL.getBestSailSpot(APP);
return { best: best || null, alternatives: [] };
}
let pool = getAllSpotsWithMeta();
if (APP.level !== "all") pool = pool.filter(s => s.level === APP.level);
pool = pool
.map(s => ({ ...s, goNowScore: rankSpotForGoNow(s) }))
.sort((a, b) => b.goNowScore - a.goNowScore);
const best         = pool[0] || null;
const alternatives = pool.filter(s => !best || s.id !== best.id).slice(0, 2);
return { best, alternatives };
}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 6 — EXPLAIN ENGINE
// ═══════════════════════════════════════════════════════════════════════════

function explainGoNow(spot) {
if (!spot) return "";

const reasons = [];  
const period  = currentPeriod();  
const w       = APP.weatherData;  
const light   = normalizeLight(spot.light || "");  
const act     = normalizeText(spot.activity || "");  
const diff    = normalizeText(spot.difficulty || "");  
const h       = getCurrentHour();  
const wow     = spot.experience?.wow || 0;  

const fitCls = spot.weatherFit?.cls;  
if (fitCls === "green") {  
  reasons.push("condizioni eccellenti in questo momento");  
} else if (fitCls === "gold") {  
  reasons.push("momento favorevole");  
} else if (fitCls === "pink") {  
  if (act === "relax") reasons.push("regge bene anche con meteo incerto");  
  else reasons.push("nonostante le condizioni, vale comunque la pena");  
}  

const tlScore = scoreTimeLight(spot);  
if (tlScore >= 20) {  
  if (light === "tramonto" && period === "tramonto")  reasons.push("fascia di luce ideale per il tramonto");  
  else if (light === "alba" && period === "alba")     reasons.push("luce perfetta per partire adesso");  
  else if (light === "giorno" && period === "giorno") reasons.push("orario giusto per questo spot");  
  else reasons.push("finestra oraria ottimale");  
} else if (tlScore >= 8) {  
  reasons.push("buon momento per andarci");  
} else if (tlScore < 0) {  
  reasons.push("non è l'orario ideale, ma lo spot rimane valido");  
}  

if (w && reasons.length < 3) {  
  if (w.cloud <= 25 && w.rain < 15 && (light === "tramonto" || light === "alba")) {  
    reasons.push("cielo pulito: tramonto potenzialmente molto forte");  
  } else if (w.wind <= 12 && act === "water") {  
    reasons.push("acqua calma — condizioni perfette");  
  } else if (w.wind <= 18 && act === "view") {  
    reasons.push("vento tranquillo, ideale per stare fermi a guardare");  
  } else if (w.rain >= 50 && act === "relax") {  
    reasons.push("ideale anche con la pioggia");  
  } else if (w.cloud <= 30 && w.rain < 20 && act === "trekking") {  
    reasons.push("buona visibilità per il percorso");  
  }  
}  

if (reasons.length < 3) {  
  const d = spot.distance;  
  if (d != null) {  
    if (d <= 3)        reasons.push("praticamente sotto casa");  
    else if (d <= 8)   reasons.push("vicinissimo — facile da raggiungere");  
    else if (d <= 20)  reasons.push("a portata di mano");  
    else if (d <= 50)  reasons.push("raggiungibile senza troppi sbatti");  
    else if (d <= 120) reasons.push("vale il viaggio");  
    else reasons.push("spot forte anche se lontano");  
  } else {  
    if (spot.level === "core")           reasons.push("spot di prima fascia");  
    else if (spot.level === "secondary") reasons.push("ottima alternativa intelligente");  
  }  
}  

if (reasons.length < 3) {  
  if (wow >= 10)                    reasons.push("wow factor massimo: 10/10");  
  else if (wow >= 9)                reasons.push("resa altissima");  
  else if (diff === "facile" && wow >= 7) reasons.push("grande resa con poco sforzo");  
  else if (act === "trekking")      reasons.push("buona scelta come esperienza centrale");  
  else if (act === "view")          reasons.push("alta resa visiva");  
  else if (act === "relax")         reasons.push("ottima chiusura di giornata");  
  else if (act === "water")         reasons.push("esperienza acqua consigliata");  
  else if (act === "mtb")           reasons.push("ottimo modulo bike");  
}  

if (reasons.length < 2 && h >= 17) {  
  if (diff === "facile") reasons.push("accessibile anche partendo tardi");  
  else reasons.push("ancora gestibile per questa sera");  
}  

return reasons.slice(0, 3).join(" · ");

}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 7 — PLANNER BUILDER
// ═══════════════════════════════════════════════════════════════════════════

function bestSpotForSlot(options) {
let pool = getAllSpotsWithMeta();
if (options.light)    pool = pool.filter(s => lightMatchesFilter(s.light, options.light));
if (options.activity) pool = pool.filter(s => options.activity.includes(s.activity));
if (options.exclude?.length) pool = pool.filter(s => !options.exclude.includes(s.id));
if (APP.zone  !== "all") pool = pool.filter(s => s.zone  === APP.zone);
if (APP.level !== "all") pool = pool.filter(s => s.level === APP.level);
if (!pool.length) return null;
return sortBestPool(pool)[0] || null;
}

function buildDayPlanner() {
const hour = getCurrentHour();

const albaC = bestSpotForSlot({ light: "alba",    activity: ["view", "trekking", "relax"] })  
           || bestSpotForSlot({ light: "mattina", activity: ["view", "trekking", "relax"] });  

const mainC = bestSpotForSlot({  
  light: "giorno", activity: ["trekking", "view", "relax", "mtb", "water"],  
  exclude: [albaC?.id]  
}) || bestSpotForSlot({  
  activity: ["trekking", "view", "relax", "mtb", "water"],  
  exclude:  [albaC?.id]  
});  

const sunC = bestSpotForSlot({  
  light: "tramonto", activity: ["view", "relax"],  
  exclude: [albaC?.id, mainC?.id]  
}) || bestSpotForSlot({  
  light: "sera", activity: ["view", "relax"],  
  exclude: [albaC?.id, mainC?.id]  
});  

if (hour >= 17) {  
  APP.planner = { alba: null, main: mainC?.id || null, tramonto: sunC?.id || mainC?.id || null };  
} else if (hour >= 10) {  
  APP.planner = { alba: null, main: mainC?.id || null, tramonto: sunC?.id || null };  
} else {  
  APP.planner = { alba: albaC?.id || null, main: mainC?.id || null, tramonto: sunC?.id || null };  
}  

saveJson(STORAGE_KEYS.planner, APP.planner);  
renderPlannerBox();  
toast("Giornata pianificata");

}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 8 — FAVORITES & PLANNER CRUD
// ═══════════════════════════════════════════════════════════════════════════

function isFavorite(id) { return APP.favorites.includes(id); }

function toggleFavorite(id) {
if (isFavorite(id)) {
APP.favorites = APP.favorites.filter(x => x !== id);
} else {
APP.favorites = [...APP.favorites, id];
}
saveJson(STORAGE_KEYS.favorites, APP.favorites);
renderAll();
if (APP.currentSpot?.id === id) showSpotDetail(APP.currentSpot);
}

function setPlannerSlot(slot, spotId) {
APP.planner[slot] = spotId;
saveJson(STORAGE_KEYS.planner, APP.planner);
renderPlannerBox();
toast("Planner aggiornato");
}

function clearPlannerSlot(slot) {
APP.planner[slot] = null;
saveJson(STORAGE_KEYS.planner, APP.planner);
renderPlannerBox();
}

function clearPlannerAll() {
APP.planner = clone(DEFAULT_PLANNER);
saveJson(STORAGE_KEYS.planner, APP.planner);
renderPlannerBox();
toast("Planner svuotato");
}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 9 — EXPORT / IMPORT DATI
// ═══════════════════════════════════════════════════════════════════════════

function exportUserData() {
return {
version:    2,
exportedAt: new Date().toISOString(),
region:     APP_SPOTS.region || "unknown",
favorites:  [...APP.favorites],
planner:    clone(APP.planner)
};
}

function downloadUserData() {
const data     = exportUserData();
const blob     = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
const url      = URL.createObjectURL(blob);
const a        = document.createElement("a");
a.href         = url;
a.download     = travel-planner-backup-${new Date().toISOString().slice(0, 10)}.json;
a.click();
setTimeout(() => URL.revokeObjectURL(url), 5000);
toast("Backup scaricato");
}

function importUserData(jsonString) {
let data;
try { data = JSON.parse(jsonString); }
catch { return { ok: false, error: "JSON non valido" }; }

if (!data || typeof data !== "object") {  
  return { ok: false, error: "Struttura non riconosciuta" };  
}  

const validIds = new Set(getBaseSpots().map(s => s.id));  

if (Array.isArray(data.favorites)) {  
  APP.favorites = data.favorites.filter(id => typeof id === "string" && validIds.has(id));  
  saveJson(STORAGE_KEYS.favorites, APP.favorites);  
}  

if (data.planner && typeof data.planner === "object") {  
  const np = clone(DEFAULT_PLANNER);  
  for (const slot of ["alba", "main", "tramonto"]) {  
    const val = data.planner[slot];  
    if (typeof val === "string" && validIds.has(val)) np[slot] = val;  
  }  
  APP.planner = np;  
  saveJson(STORAGE_KEYS.planner, APP.planner);  
}  

renderAll();  
toast("Dati importati con successo");  
return { ok: true };

}

function importUserDataFromFile(file) {
if (!file) return;
const reader   = new FileReader();
reader.onload  = e => {
const result = importUserData(e.target.result);
if (!result.ok) toast(Errore importazione: ${result.error});
};
reader.onerror = () => toast("Errore nella lettura del file");
reader.readAsText(file);
}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 10 — SUN PHASE
// ═══════════════════════════════════════════════════════════════════════════

function getSunPhaseInfo() {
if (!APP.sunTimes?.sunset) {
return {
clockText: "Tramonto —",
phaseText: "Luce da leggere",
mainText:  "Sto leggendo la luce di oggi",
subText:   "Fra poco trovi countdown e stato tramonto.",
timeText:  "—"
};
}

const now         = new Date();  
const sunrise     = APP.sunTimes.sunrise;  
const sunset      = APP.sunTimes.sunset;  
const goldenStart = new Date(sunset.getTime() - 60 * 60000);  
const blueEnd     = new Date(sunset.getTime() + 40 * 60000);  

if (now < sunrise) return {  
  clockText: `Tramonto ${formatTime(sunset)}`,  
  phaseText: "Prima dell'alba",  
  mainText:  "Luce ancora chiusa",  
  subText:   "La giornata deve ancora aprirsi. Per spot alba, stai già guardando la finestra giusta.",  
  timeText:  formatCountdown(getMinutesDiff(now, sunrise))  
};  
if (now < goldenStart) return {  
  clockText: `Tramonto ${formatTime(sunset)}`,  
  phaseText: "Prima della golden hour",  
  mainText:  "La luce migliore arriva più tardi",  
  subText:   "Hai ancora margine. Inizia a muoverti quando la luce comincia a scaldarsi.",  
  timeText:  formatCountdown(getMinutesDiff(now, goldenStart))  
};  
if (now >= goldenStart && now < sunset) return {  
  clockText: `Tramonto ${formatTime(sunset)}`,  
  phaseText: "Golden hour in corso",  
  mainText:  "Se vuoi il tramonto, questo è il momento",  
  subText:   "La luce è nella fascia giusta. Adesso conviene già essere sul posto.",  
  timeText:  formatCountdown(getMinutesDiff(now, sunset))  
};  
if (now >= sunset && now < blueEnd) return {  
  clockText: `Tramonto ${formatTime(sunset)}`,  
  phaseText: "Blue hour",  
  mainText:  "Il sole è appena sceso",  
  subText:   "Hai ancora una finestra breve e molto bella per skyline e luci.",  
  timeText:  formatCountdown(getMinutesDiff(now, blueEnd))  
};  
return {  
  clockText: `Tramonto ${formatTime(sunset)}`,  
  phaseText: "Dopo il tramonto",  
  mainText:  "La finestra serale è finita",  
  subText:   "Guarda già domani o prepara una partenza all'alba.",  
  timeText:  "chiuso"  
};

}

function startSunsetCountdown() {
if (APP.sunsetTimer) clearInterval(APP.sunsetTimer);
if (window.UI?.renderSunPhase) window.UI.renderSunPhase(APP);
APP.sunsetTimer = setInterval(() => {
if (window.UI?.renderSunPhase) window.UI.renderSunPhase(APP);
}, 30000);
}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 11 — WEATHER LOADING
// ═══════════════════════════════════════════════════════════════════════════

function getNext12Hours(hourly, marineHourly) {
if (!hourly?.time) return [];
const now    = new Date();
const merged = hourly.time.map((time, i) => ({
date:          new Date(time),
temp:          hourly.temperature_2m?.[i]            ?? 0,
wind:          hourly.wind_speed_10m?.[i]            ?? 0,
windDir:       hourly.wind_direction_10m?.[i]        ?? 0,
gust:          hourly.wind_gusts_10m?.[i]            ?? 0,
rain:          hourly.precipitation_probability?.[i] ?? 0,
cloud:         hourly.cloud_cover?.[i]               ?? 0,
waveHeight:    marineHourly?.wave_height?.[i]        ?? 0,
waveDirection: marineHourly?.wave_direction?.[i]     ?? 0,
wavePeriod:    marineHourly?.wave_period?.[i]        ?? 0
}));
return merged
.filter(item => item.date.getTime() >= now.getTime() - 30 * 60 * 1000)
.slice(0, 12);
}

async function loadWeather() {
try {
const lat = APP_SPOTS.center?.[0] || 45.885;
const lon = APP_SPOTS.center?.[1] || 10.842;

const [forecastRes, marineRes] = await Promise.all([  
    fetch(  
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +  
      `&current=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover` +  
      `&hourly=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,precipitation_probability` +  
      `&daily=sunrise,sunset&forecast_days=2&timezone=auto`  
    ),  
    fetch(  
      `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}` +  
      `&current=wave_height,wave_direction,wave_period` +  
      `&hourly=wave_height,wave_direction,wave_period&timezone=auto`  
    )  
  ]);  

  const forecast = await forecastRes.json();  
  const marine   = await marineRes.json();  

  const temp    = forecast?.current?.temperature_2m     ?? 0;  
  const wind    = forecast?.current?.wind_speed_10m     ?? 0;  
  const windDir = forecast?.current?.wind_direction_10m ?? 0;  
  const gust    = forecast?.current?.wind_gusts_10m     ?? 0;  
  const cloud   = forecast?.current?.cloud_cover        ?? 0;  

  const now = new Date();  
  const idx = (forecast?.hourly?.time || []).findIndex(t => {  
    const d = new Date(t);  
    return d.getHours() === now.getHours() && d.toDateString() === now.toDateString();  
  });  
  const rain = idx >= 0  
    ? (forecast?.hourly?.precipitation_probability?.[idx] ?? 0)  
    : (forecast?.hourly?.precipitation_probability?.[0]  ?? 0);  

  const sunrise = parseSunTime(forecast?.daily?.sunrise?.[0]);  
  const sunset  = parseSunTime(forecast?.daily?.sunset?.[0]);  
  APP.sunTimes  = { sunrise, sunset };  

  let headline = "Meteo aggiornato";  
  let advice   = "Controlla rapidamente la situazione della giornata.";  
  if (rain >= 55)               { headline = "Pioggia probabile";       advice = "Meglio spot riparati o attività flessibili."; }  
  else if (wind >= 32)          { headline = "Vento forte";             advice = "Attenzione ai punti molto esposti."; }  
  else if (cloud <= 35 && rain < 25) { headline = "Finestra interessante"; advice = "Buona giornata per spot aperti e luce più pulita."; }  

  APP.weatherData = { temp, wind, windDir, gust, cloud, rain, period: currentPeriod(), headline, advice };  
  APP.marineData  = {  
    waveHeight:    marine?.current?.wave_height    ?? 0,  
    waveDirection: marine?.current?.wave_direction ?? 0,  
    wavePeriod:    marine?.current?.wave_period    ?? 0  
  };  
  APP.hourlyData = getNext12Hours(forecast.hourly, marine.hourly);  

} catch {  
  APP.weatherData = null;  
  APP.marineData  = null;  
  APP.hourlyData  = [];  
  APP.sunTimes    = null;  
}  

renderAll();  
startSunsetCountdown();

}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 12 — MAPPA
// ═══════════════════════════════════════════════════════════════════════════

function markerColor(spot) {
if (APP.mode === "sail" && window.SAIL) return window.SAIL.getMarkerColor(spot, APP);
if ((APP_SPOTS.topWowNames || []).includes(spot.name)) return "#f5c451";
if (isEveningLike(spot.light)) return "#ff9fbc";
return "#59b6ff";
}

function createMarkerIcon(color) {
return L.divIcon({
className:   "",
html:        <div style="width:18px;height:18px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,.9);box-shadow:0 0 0 6px rgba(0,0,0,.14),0 0 18px ${color}55;"></div>,
iconSize:    [18, 18],
iconAnchor:  [9, 9],
popupAnchor: [0, -10]
});
}

function initMap() {
const mapEl = $("map");
if (!mapEl || typeof L === "undefined") return;
APP.map = L.map("map", { zoomControl: true }).setView(
APP_SPOTS.center || [45.885, 10.842],
APP_SPOTS.zoom   || 11
);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
maxZoom: 18, attribution: "© OpenStreetMap"
}).addTo(APP.map);
APP.gpsLine = L.polyline([], { color: "#7dc4ff", weight: 4, opacity: 0.9 }).addTo(APP.map);
renderMarkers();
}

function renderMarkers() {
if (!APP.map) return;

const items = getMapFilteredSpots();  
const currentIds = new Set(items.map(s => s.id));  

for (const [id, marker] of APP.markerBySpotId.entries()) {  
  if (!currentIds.has(id)) {  
    APP.map.removeLayer(marker);  
    APP.markerBySpotId.delete(id);  
    APP.markers = APP.markers.filter(m => m !== marker);  
  }  
}  

const latlngs = [];  

items.forEach(spot => {  
  let marker = APP.markerBySpotId.get(spot.id);  
  const color = markerColor(spot);  

  if (!marker) {  
    marker = L.marker([spot.lat, spot.lon], { icon: createMarkerIcon(color) }).addTo(APP.map);  
    marker.bindPopup(`  
      <div style="min-width:180px">  
        <div style="font-weight:800;font-size:15px;margin-bottom:6px">${escapeHtml(spot.name)}</div>  
        <div style="font-size:12px;color:#cfe0ef">${escapeHtml(spot.desc || "")}</div>  
      </div>  
    `);  
    marker.on("click", () => showSpotDetail(spot));  
    APP.markers.push(marker);  
    APP.markerBySpotId.set(spot.id, marker);  
  }  
    
  latlngs.push([spot.lat, spot.lon]);  
});  

if (!APP._mapInitialized && latlngs.length) {  
  APP.map.fitBounds(L.latLngBounds(latlngs).pad(0.18));  
  APP._mapInitialized = true;  
}

}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 13 — SPOT DETAIL / NAVIGAZIONE
// ═══════════════════════════════════════════════════════════════════════════

function showSpotDetail(spot) {
APP.currentSpot = spot;
if (window.UI?.renderSpotDetail) window.UI.renderSpotDetail(APP, spot);
}

function centerSpot(id) {
const spot = getSpotById(id);
if (!spot || !APP.map) return;
switchPage("map");
setTimeout(() => {
APP.map.setView([spot.lat, spot.lon], 13, { animate: true });
const marker = APP.markerBySpotId.get(id);
if (marker) marker.openPopup();
}, 180);
showSpotDetail(spot);
}

function switchPage(pageName) {
APP.activePage = pageName;
document.querySelectorAll(".page").forEach(page => {
page.classList.toggle("active", page.id === page-${pageName});
});
document.querySelectorAll(".nav-btn").forEach(btn => {
btn.classList.toggle("active", btn.dataset.page === pageName);
});
window.scrollTo({ top: 0, behavior: "smooth" });
if (pageName === "map" && APP.map) setTimeout(() => APP.map.invalidateSize(), 220);
}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 14 — MODE (TRAVEL / SAIL)
// ═══════════════════════════════════════════════════════════════════════════

function updateModeUI() {
const toggle = $("sailModeToggle");
const main   = $("modeLabelMain");
const sub    = $("modeLabelSub");
const hero   = $("heroDescription");
if (toggle) toggle.checked   = APP.mode === "sail";
if (main)   main.textContent = APP.mode === "sail" ? "Sail Mode" : "Travel Mode";
if (sub)    sub.textContent  = APP.mode === "sail" ? "Sail mode ON" : "Sail mode OFF";
if (hero)   hero.textContent = APP.mode === "sail"
? "Modalità vela attiva: vento, onde, rotta live e spot compatibili quando presenti nei dati."
: "Guida travel e outdoor con mappa, spot wow, tramonti, vai ora intelligente, planner giornata e preferiti personali.";
document.body.classList.toggle("mode-sail", APP.mode === "sail");
}

function toggleMode(forceMode) {
APP.mode = forceMode || (APP.mode === "travel" ? "sail" : "travel");
saveJson(STORAGE_KEYS.mode, APP.mode);
updateModeUI();
renderAll();
toast(APP.mode === "sail" ? "Sail mode attivata" : "Travel mode attiva");
}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 15 — SEARCH (input)
// ═══════════════════════════════════════════════════════════════════════════

function searchSpot() {
const input = $("searchInput");
if (!input) return;
const q = input.value.trim();
if (!q) return;
APP.search = q;
renderAll();
const found = getBaseSpots().find(s => smartSearchMatch(s, q));
if (found) {
showSpotDetail(found);
switchPage("detail");
toast("Spot trovato");
} else {
switchPage("spots");
toast("Nessuno spot trovato per quella ricerca");
}
}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 16 — GPS
// ═══════════════════════════════════════════════════════════════════════════

function startGPSRoute() {
if (!navigator.geolocation || !APP.map) { toast("GPS non disponibile"); return; }
if (APP.gpsWatchId) return;

APP.gpsWatchId = navigator.geolocation.watchPosition(  
  pos => {  
    const now = Date.now();  
    const lat = pos.coords.latitude;  
    const lon = pos.coords.longitude;  
    const alt = typeof pos.coords.altitude === "number" ? pos.coords.altitude : null;  

    APP.gpsPath.push([lat, lon]);  
    if (APP.gpsLine) APP.gpsLine.setLatLngs(APP.gpsPath);  
      
    if (!APP.gpsMarker) {  
      APP.gpsMarker = L.circleMarker([lat, lon], {  
        radius: 8, color: "#dff3ff", weight: 2, fillColor: "#59b6ff", fillOpacity: 1  
      }).addTo(APP.map);  
    } else {  
      const current = APP.gpsMarker.getLatLng();  
      const smoothLat = current.lat + (lat - current.lat) * 0.3;  
      const smoothLon = current.lng + (lon - current.lng) * 0.3;  
      APP.gpsMarker.setLatLng([smoothLat, smoothLon]);  
    }  

    let movedMeters = 999;  
    if (APP.lastGpsPos) {  
      movedMeters = distKm(APP.lastGpsPos.lat, APP.lastGpsPos.lon, lat, lon) * 1000;  
    }  

    if (now - APP.lastGpsUpdate > 2500 || movedMeters > 50) {  
      APP.userPos = { lat, lon, accuracy: pos.coords.accuracy, altitude: alt };  
      APP.lastGpsPos = { lat, lon };  
      APP.lastGpsUpdate = now;  

      if (window.UI?.renderGpsBox) window.UI.renderGpsBox(APP, { speedMs: pos.coords.speed, heading: pos.coords.heading });  
        
      renderLight();  

      if (APP.map && APP.gpsMarker) {  
        const mapCenter = APP.map.getCenter();  
        const distToCenter = distKm(mapCenter.lat, mapCenter.lng, lat, lon);  
        if (distToCenter > 0.5) {  
          APP.map.panTo([lat, lon], { animate: true, duration: 0.5 });  
        }  
      }  
    }  
  },  
  () => toast("Permesso GPS negato o posizione non disponibile"),  
  { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }  
);

}

function stopGPSRoute() {
if (APP.gpsWatchId) { navigator.geolocation.clearWatch(APP.gpsWatchId); APP.gpsWatchId = null; }
}

function resetGPSRoute() {
stopGPSRoute();
APP.gpsPath = [];
if (APP.gpsLine) APP.gpsLine.setLatLngs([]);
if (APP.gpsMarker && APP.map) { APP.map.removeLayer(APP.gpsMarker); APP.gpsMarker = null; }
if (window.UI?.renderGpsBox) window.UI.renderGpsBox(APP, null);
}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 17 — RENDER HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function renderPlannerBox() {
if (window.UI?.renderPlannerBox) window.UI.renderPlannerBox(APP);
}

function renderLight() {
APP.nearbySpots = getClosestSpots(5);
renderNearbyPage();
if (window.UI?.renderLight) window.UI.renderLight(APP);
}

function renderAll() {
if (window.UI?.renderAll) window.UI.renderAll(APP);
renderMarkers();
renderLight();
}

function toast(message) {
if (window.UI?.toast) window.UI.toast(message);
}

function runGoNow() {
const result = getGoNowSuggestions();
if (!result.best) { toast("Nessuno spot disponibile"); return; }
showSpotDetail(result.best);
switchPage("detail");
toast("Ti ho scelto lo spot migliore di adesso");
}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 18 — EVENTS
// ═══════════════════════════════════════════════════════════════════════════

function bindEvents() {
const modeToggle = $("sailModeToggle");
if (modeToggle) {
modeToggle.addEventListener("change", () => toggleMode(modeToggle.checked ? "sail" : "travel"));
}

document.querySelectorAll(".nav-btn").forEach(btn => {  
  btn.addEventListener("click", () => switchPage(btn.dataset.page));  
});  

const searchInput = $("searchInput");  
if (searchInput) {  
  searchInput.addEventListener("input",   () => { APP.search = searchInput.value.trim(); renderAll(); });  
  searchInput.addEventListener("keydown", e  => { if (e.key === "Enter") searchSpot(); });  
}  

$("searchBtn")?.addEventListener("click",       searchSpot);  
$("goNowBtn")?.addEventListener("click",        runGoNow);  
$("autofillPlannerBtn")?.addEventListener("click", buildDayPlanner);  
$("plannerOpenBtn")?.addEventListener("click",  () => switchPage("home"));  
$("clearPlannerBtn")?.addEventListener("click", clearPlannerAll);  

$("gpsBtn")?.addEventListener("click", () => {  
  if (!navigator.geolocation) { toast("GPS non disponibile"); return; }  
  navigator.geolocation.getCurrentPosition(  
    pos => {  
      APP.userPos = {  
        lat: pos.coords.latitude,  
        lon: pos.coords.longitude,  
        accuracy: pos.coords.accuracy,  
        altitude: (typeof pos.coords.altitude === "number" ? pos.coords.altitude : null)  
      };  
      renderAll();  
      toast("Posizione aggiornata");  
    },  
    () => toast("Permesso GPS negato"),  
    { enableHighAccuracy: true, timeout: 8000 }  
  );  
});  

$("gpsStartBtn")?.addEventListener("click", startGPSRoute);  
$("gpsStopBtn")?.addEventListener("click",  stopGPSRoute);  
$("gpsResetBtn")?.addEventListener("click", resetGPSRoute);  

window.addEventListener("orientationchange", () => {  
  setTimeout(() => APP.map && APP.map.invalidateSize(), 300);  
});

}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 19 — INIT
// ═══════════════════════════════════════════════════════════════════════════

function initApp() {
updateModeUI();
bindEvents();
initMap();
renderAll();
loadWeather();

navigator.geolocation?.getCurrentPosition(  
  pos => {  
    APP.userPos = {  
      lat: pos.coords.latitude,  
      lon: pos.coords.longitude,  
      accuracy: pos.coords.accuracy,  
      altitude: (typeof pos.coords.altitude === "number" ? pos.coords.altitude : null)  
    };  
    renderAll();  
  },  
  () => {},  
  { enableHighAccuracy: true, timeout: 8000 }  
);  

if ("serviceWorker" in navigator) {  
  navigator.serviceWorker.getRegistrations().then(registrations => {  
    const toUnregister = registrations.filter(r =>  
      r.active?.scriptURL &&  
      !r.active.scriptURL.endsWith("sw-v11.js")  
    );  
    return Promise.all(toUnregister.map(r => r.unregister()));  
  }).then(() => {  
    return navigator.serviceWorker.register("sw-v11.js");  
  }).then(reg => {  
    reg.update();  
    reg.onupdatefound = () => {  
      const newWorker = reg.installing;  
      newWorker.onstatechange = () => {  
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {  
          window.location.reload();  
        }  
      };  
    };  
  }).catch(() => {});  
}  

window.addEventListener("load", () => {  
  setTimeout(() => $("splash")?.classList.add("hide"), 850);  
});

}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 20 — PUBLIC API  (window.APP_UTILS)
// ═══════════════════════════════════════════════════════════════════════════

window.APP_UTILS = {
$,
escapeHtml,
normalizeText,
formatTime,
formatCountdown,
currentPeriod,
displayDistance,
getSpotImage,
isMorningLike,
isEveningLike,
smartSearchMatch,
buildHaystack,
evaluateConstraint,
getBaseSpots,
getSpotById,
getAllSpotsWithMeta,
getFilteredSpots,
getMapFilteredSpots,
getBestSpotToday,
getBestWowSpot,
getBestSunsetSpot,
getClosestSpot,
getClosestSpots,
getGoNowSuggestions,
explainGoNow,
rankSpotForGoNow,
getSunPhaseInfo,
isFavorite,
toggleFavorite,
setPlannerSlot,
clearPlannerSlot,
clearPlannerAll,
exportUserData,
downloadUserData,
importUserData,
importUserDataFromFile,
showSpotDetail,
switchPage,
centerSpot,
renderPlannerBox,
renderLight,
renderAll,
toggleMode
};

document.addEventListener("DOMContentLoaded", initApp);
})();