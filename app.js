(function () {
"use strict";

// ─── GUARD ────────────────────────────────────────────────────────────────
// Verifica l'integrità dei dati di input per evitare crash all'avvio
if (!window.APP_SPOTS || !Array.isArray(window.APP_SPOTS.spots)) {
const errorMsg = "Il file spots.js manca o contiene un errore.";
document.body.innerHTML =
<div style="padding:24px;color:white;background:#0b0f14;min-height:100vh;font-family:system-ui,sans-serif"> +
<h1 style="margin-top:0">Errore dati</h1><p>${errorMsg}</p></div>;
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

// GPS & POSITION STATE  
userPosition:    null,   
userPos:         null,   
liveGpsData:     { speedMs: 0, heading: 0, accuracy: 0 },  
gpsWatchId:      null,  
gpsPath:         [],  
gpsLine:         null,  
userMarker:      null,   
userCircle:      null,   
lastGpsUpdate:   0,      
  
currentSpot:     null,  
weatherData:     null,  
marineData:      null,  
hourlyData:      [],  
sunTimes:        null,  
sunsetTimer:     null,  
favorites:       loadJson(STORAGE_KEYS.favorites, []),  
planner:         loadJson(STORAGE_KEYS.planner, DEFAULT_PLANNER),  
activePage:      "home",  
map:             null,  
markers:         [],  
markerBySpotId:  new Map(),  
_mapInitialized: false,  

// CACHING INTERNO PER PERFORMANCE  
_cache: {  
  metaSpots: null,  
  filteredSpots: null,  
  lastFilterKey: ""  
}

};

window.APP = APP;

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 1 — UTILITIES DI BASE
// ═══════════════════════════════════════════════════════════════════════════

function $(id) { return document.getElementById(id); }

function clone(value) {
if (value === undefined) return null;
try {
return JSON.parse(JSON.stringify(value));
} catch (e) { return null; }
}

function loadJson(key, fallback) {
try {
const raw = localStorage.getItem(key);
if (!raw) return clone(fallback);
return JSON.parse(raw);
} catch { return clone(fallback); }
}

function saveJson(key, value) {
try {
localStorage.setItem(key, JSON.stringify(value));
} catch (e) { console.error("Storage error:", e); }
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
if (!from || !to) return 0;
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

/**

Calcola la distanza tra due punti (Haversine)

Aggiunti controlli di sicurezza per lat/lon null
*/
function distKm(lat1, lon1, lat2, lon2) {
if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
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
if (!s) return "";
return s.image || https://picsum.photos/seed/${encodeURIComponent(s.name)}/900/600;
}

function getBaseSpots()  { return APP_SPOTS.spots || []; }
function getSpotById(id) { return getBaseSpots().find(s => s.id === id) || null; }

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 2 — SMART SEARCH
// ═══════════════════════════════════════════════════════════════════════════

const SEARCH_INTENT_MAP = {
"epico": { minWow: 9 }, "wow": { minWow: 9 }, "forte": { minWow: 8 }, "top": { level: "core" },
"panorama": { anyOf: [{ activity: "view" }, { tagMatch: "panorama" }] },
"trekking": { activity: "trekking" }, "mtb": { activity: "mtb" }, "view": { activity: "view" },
"tramonto": { light: "tramonto" }, "alba": { light: "alba" }, "facile": { difficulty: "facile" },
"vicino": { nearMe: true }, "calma": { anyOf: [{ activity: "water" }, { tagMatch: "calma" }] }
};

function evaluateConstraint(spot, c) {
if (!c || !spot) return true;
if (c.anyOf) return c.anyOf.some(sub => evaluateConstraint(spot, sub));
if ("activity" in c && spot.activity !== c.activity) return false;
if ("zone" in c && spot.zone !== c.zone) return false;
if ("level" in c && spot.level !== c.level) return false;
if ("light" in c && normalizeLight(spot.light) !== normalizeLight(c.light)) return false;
if ("minWow" in c && (spot.experience?.wow ?? 0) < c.minWow) return false;
if ("nearMe" in c && (APP.userPosition && (spot.distance ?? 999) > 30)) return false;
return true;
}

function buildHaystack(spot) {
if (!spot) return "";
return [spot.name, spot.zone, spot.activity, spot.desc, spot.tip, ...(spot.tags || [])]
.filter(Boolean).map(normalizeText).join(" ");
}

function smartSearchMatch(spot, rawQuery) {
if (!rawQuery) return true;
const q = normalizeText(rawQuery);
const words = q.split(/\s+/).filter(Boolean);
const hay = buildHaystack(spot);
if (words.every(w => hay.includes(w))) return true;
const intentWords = words.filter(w => w in SEARCH_INTENT_MAP);
if (intentWords.length > 0) {
return intentWords.every(w => evaluateConstraint(spot, SEARCH_INTENT_MAP[w]));
}
return false;
}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 3 — WEATHER SUITABILITY
// ═══════════════════════════════════════════════════════════════════════════

function weatherSuitability(spot) {
const w = APP.weatherData;
if (!w || !spot) return { score: 0, label: "meteo neutro", cls: "gold" };
let score = 0;

// Check sicuri sui dati meteo e proprietà spot  
if ((w.rain ?? 0) >= 55) score -= 4;  
if ((w.wind ?? 0) >= 35) score -= 5;  
  
if (score >= 3) return { score, label: "ottimo oggi", cls: "green" };  
if (score <= -3) return { score, label: "meno ideale", cls: "pink" };  
return { score, label: "valido", cls: "gold" };

}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 4 — SPOT POOL & META
// ═══════════════════════════════════════════════════════════════════════════

function updateAllSpotsDistances() {
if (!APP.userPosition) return;
getBaseSpots().forEach(s => {
s.distance = distKm(APP.userPosition.lat, APP.userPosition.lon, s.lat, s.lon);
});
}

/**

Ottiene gli spot con metadati calcolati.

PERFORMANCE: Utilizza caching in memoria per evitare ricalcoli inutili.
*/
function getAllSpotsWithMeta() {
// Se il meteo o la posizione cambiano, la cache andrebbe invalidata esternamente
if (APP._cache.metaSpots) return APP._cache.metaSpots;


updateAllSpotsDistances();  
const result = getBaseSpots().map(s => ({  
  ...s,  
  weatherFit: weatherSuitability(s),  
  sailMeta: window.SAIL ? window.SAIL.getSpotSailMeta(s, APP) : null  
}));  

APP._cache.metaSpots = result;  
return result;

}

/**

PERFORMANCE: Invalida la cache dei filtri quando i parametri cambiano
*/
function getFilterKey() {
return ${APP.level}|${APP.light}|${APP.zone}|${APP.activity}|${APP.favoritesFilter}|${APP.search};
}


function getFilteredSpots() {
const currentKey = getFilterKey();
if (APP._cache.filteredSpots && APP._cache.lastFilterKey === currentKey) {
return APP._cache.filteredSpots;
}

let items = getAllSpotsWithMeta().filter(s =>  
  (APP.level === "all" || s.level === APP.level) &&  
  lightMatchesFilter(s.light, APP.light) &&  
  (APP.zone === "all" || s.zone === APP.zone) &&  
  (APP.activity === "all" || s.activity === APP.activity) &&  
  (APP.favoritesFilter === "all" || isFavorite(s.id)) &&  
  smartSearchMatch(s, APP.search)  
);  
  
const sortedItems = items.sort((a, b) => (a.distance || 999) - (b.distance || 999));  
  
APP._cache.filteredSpots = sortedItems;  
APP._cache.lastFilterKey = currentKey;  
  
return sortedItems;

}

function getClosestSpot() {
if (!APP.userPosition) return null;
const pool = getAllSpotsWithMeta().filter(s => s.distance != null);
if (!pool.length) return null;
return pool.reduce((prev, curr) => ((curr.distance ?? 999) < (prev.distance ?? 999) ? curr : prev));
}

function getClosestSpots(limit = 5) {
if (!APP.userPosition) return [];
return getAllSpotsWithMeta()
.filter(s => s.distance != null)
.sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999))
.slice(0, limit);
}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 5 — GO NOW ENGINE
// ═══════════════════════════════════════════════════════════════════════════

function getGoNowSuggestions() {
const pool = [...getAllSpotsWithMeta()].sort((a, b) => (b.weatherFit?.score ?? 0) - (a.weatherFit?.score ?? 0));
return { best: pool[0] || null, alternatives: pool.slice(1, 3) };
}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 11 — WEATHER LOADING
// ═══════════════════════════════════════════════════════════════════════════

async function loadWeather() {
try {
const lat = APP_SPOTS.center?.[0] || 45.885;
const lon = APP_SPOTS.center?.[1] || 10.842;
const url = https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,cloud_cover&daily=sunrise,sunset&timezone=auto;

const res = await fetch(url);  
  if (!res.ok) throw new Error(`Weather server error: ${res.status}`);  
    
  const data = await res.json();  
    
  APP.sunTimes = {   
    sunrise: parseSunTime(data.daily?.sunrise?.[0]),   
    sunset: parseSunTime(data.daily?.sunset?.[0])   
  };  
    
  APP.weatherData = {   
    temp: data.current?.temperature_2m ?? 0,   
    wind: data.current?.wind_speed_10m ?? 0,   
    headline: "Meteo ok",   
    advice: "Situazione stabile"   
  };  
    
  // Invalida cache metadati per ricalcolare fit meteo  
  APP._cache.metaSpots = null;  
  APP._cache.filteredSpots = null;  
    
  renderAll();  
} catch (e) {   
  console.warn("Weather error fallback:", e);   
  APP.weatherData = APP.weatherData || { temp: "--", wind: 0, headline: "Offline", advice: "Meteo non disponibile" };  
}

}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 12 — MAPPA & MARKER
// ═══════════════════════════════════════════════════════════════════════════

function initMap() {
const mapEl = $("map");
if (!mapEl || typeof L === "undefined") return;
try {
APP.map = L.map("map").setView(APP_SPOTS.center || [45.885, 10.842], 11);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OSM" }).addTo(APP.map);
APP.gpsLine = L.polyline([], { color: "#3498db", weight: 3 }).addTo(APP.map);
renderMarkers();
} catch (e) { console.error("Map Init Error:", e); }
}

function updateUserMarkerOnMap() {
if (!APP.map || !APP.userPosition) return;
const pos = [APP.userPosition.lat, APP.userPosition.lon];
if (!APP.userMarker) {
APP.userMarker = L.marker(pos, {
zIndexOffset: 1000,
icon: L.divIcon({
className: 'user-marker-gps',
html: '<div style="background:#3498db;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 8px rgba(0,0,0,0.3)"></div>',
iconSize: [14, 14], iconAnchor: [7, 7]
})
}).addTo(APP.map);
APP.userCircle = L.circle(pos, { radius: APP.liveGpsData.accuracy || 20, color: '#3498db', weight: 1, fillOpacity: 0.15 }).addTo(APP.map);
APP.map.setView(pos, 14);
} else {
APP.userMarker.setLatLng(pos);
APP.userCircle.setLatLng(pos);
APP.userCircle.setRadius(APP.liveGpsData.accuracy || 20);
}
}

function renderMarkers() {
if (!APP.map) return;
APP.markers.forEach(m => APP.map.removeLayer(m));
APP.markers = [];
getFilteredSpots().forEach(spot => {
if (!spot.lat || !spot.lon) return;
const m = L.marker([spot.lat, spot.lon]).addTo(APP.map)
.bindPopup(<b>${spot.name}</b><br>${spot.activity})
.on("click", () => showSpotDetail(spot));
APP.markers.push(m);
});
}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 16 — GPS
// ═══════════════════════════════════════════════════════════════════════════

/**

Gestione segnale GPS.

MIGLIORAMENTI: Filtraggio accuratezza e jitter per stabilità.
*/
function handleGpsSuccess(pos) {
const { latitude, longitude, speed, heading, accuracy } = pos.coords;


// SAFETY: Filtra aggiornamenti con accuratezza pessima (>100m)  
if (accuracy > 100) return;  

const now = Date.now();  
if (now - APP.lastGpsUpdate < 1000) return;  

// ANTI-JITTER: Se lo spostamento è minimo (< 5 metri), non ricalcolare tutto  
if (APP.userPosition) {  
  const delta = distKm(APP.userPosition.lat, APP.userPosition.lon, latitude, longitude);  
  if (delta !== null && delta < 0.005 && APP.gpsPath.length > 0) {  
      // Aggiorna solo i dati live senza invalidare tutto  
      APP.liveGpsData = { speedMs: speed || 0, heading: heading || 0, accuracy: accuracy || 0 };  
      return;  
  }  
}  

APP.lastGpsUpdate = now;  
APP.userPosition = { lat: latitude, lon: longitude };  
APP.userPos = APP.userPosition;  
APP.liveGpsData = { speedMs: speed || 0, heading: heading || 0, accuracy: accuracy || 0 };  
APP.gpsPath.push([latitude, longitude]);  

// Invalidamento cache a causa del cambio posizione  
APP._cache.metaSpots = null;  
APP._cache.filteredSpots = null;  

updateAllSpotsDistances();  
updateUserMarkerOnMap();  
if (APP.gpsLine) APP.gpsLine.setLatLngs(APP.gpsPath);  
if (window.UI && typeof UI.renderLight === "function") UI.renderLight(APP);

}

function startGPSRoute() {
if (!navigator.geolocation) { toast("GPS non supportato"); return; }
if (APP.gpsWatchId) return;

// SAFETY: Wrap in try/catch per ambienti restrittivi  
try {  
  APP.gpsWatchId = navigator.geolocation.watchPosition(  
    handleGpsSuccess,   
    (err) => console.warn(`GPS Watch error (${err.code}): ${err.message}`),   
    { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }  
  );  
  toast("GPS Live attivato");  
} catch (e) {  
  console.error("GPS startup failed", e);  
}

}

function stopGPSRoute() {
if (APP.gpsWatchId) {
navigator.geolocation.clearWatch(APP.gpsWatchId);
APP.gpsWatchId = null;
}
}

function resetGPSRoute() {
stopGPSRoute();
APP.gpsPath = [];
if (APP.gpsLine) APP.gpsLine.setLatLngs([]);
if (APP.userMarker) { APP.map.removeLayer(APP.userMarker); APP.userMarker = null; }
if (APP.userCircle) { APP.map.removeLayer(APP.userCircle); APP.userCircle = null; }
}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 13 — SPOT DETAIL / NAVIGAZIONE
// ═══════════════════════════════════════════════════════════════════════════

function showSpotDetail(spot) {
if (!spot) return;
APP.currentSpot = spot;
if (window.UI?.renderSpotDetail) window.UI.renderSpotDetail(APP, spot);
switchPage("detail");
}

function switchPage(pageName) {
APP.activePage = pageName;
document.querySelectorAll(".page").forEach(p => p.classList.toggle("active", p.id === page-${pageName}));
document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.page === pageName));
if (pageName === "map" && APP.map) setTimeout(() => APP.map.invalidateSize(), 200);
window.scrollTo(0, 0);
}

function renderAll() {
if (window.UI?.renderAll) window.UI.renderAll(APP);
renderMarkers();
}

function isFavorite(id) { return APP.favorites.includes(id); }

function toast(msg) { if (window.UI?.toast) window.UI.toast(msg); }

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 18 — EVENTS
// ═══════════════════════════════════════════════════════════════════════════

function bindEvents() {
document.querySelectorAll(".nav-btn").forEach(b => b.addEventListener("click", () => switchPage(b.dataset.page)));
$("gpsBtn")?.addEventListener("click", startGPSRoute);
$("gpsStartBtn")?.addEventListener("click", startGPSRoute);
$("gpsStopBtn")?.addEventListener("click", stopGPSRoute);
$("gpsResetBtn")?.addEventListener("click", resetGPSRoute);

$("searchBtn")?.addEventListener("click", () => {   
  APP.search = $("searchInput")?.value || "";   
  APP._cache.filteredSpots = null; // Invalida cache ricerca  
  renderAll();   
});  
  
$("goNowBtn")?.addEventListener("click", () => {   
  const s = getGoNowSuggestions().best;   
  if(s) showSpotDetail(s);   
});  
  
$("sailModeToggle")?.addEventListener("change", (e) => {   
  APP.mode = e.target.checked ? "sail" : "travel";   
  APP._cache.metaSpots = null; // Invalida cache per ricalcolare sailMeta  
  renderAll();   
});

}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 19 — INIT
// ═══════════════════════════════════════════════════════════════════════════

function initApp() {
bindEvents();
initMap();
loadWeather();

// SAFETY: Chiamata iniziale GPS protetta  
if (navigator.geolocation) {  
  navigator.geolocation.getCurrentPosition(handleGpsSuccess, () => console.log("GPS Off"), { timeout: 10000 });  
}  
  
setTimeout(() => $("splash")?.classList.add("hide"), 800);

}

// ═══════════════════════════════════════════════════════════════════════════
// SEZIONE 20 — APP_UTILS
// ═══════════════════════════════════════════════════════════════════════════

window.APP_UTILS = {
$,
escapeHtml,
displayDistance,
showSpotDetail,
switchPage,
getClosestSpot,
getClosestSpots,
getFilteredSpots,
getAllSpotsWithMeta,
getGoNowSuggestions,
isFavorite: (id) => APP.favorites.includes(id),
toggleFavorite: (id) => {
if (APP.favorites.includes(id)) {
APP.favorites = APP.favorites.filter(f => f !== id);
} else {
APP.favorites.push(id);
}
saveJson(STORAGE_KEYS.favorites, APP.favorites);
APP._cache.filteredSpots = null;
renderAll();
},
getBestSunsetSpot: () => {
return getAllSpotsWithMeta()
.filter(s => {
const l = (s.light || "").toLowerCase();
return l === "tramonto" || l === "sera";
})
.sort((a, b) => (b.experience?.wow ?? 0) - (a.experience?.wow ?? 0))[0] || null;
}
};

document.addEventListener("DOMContentLoaded", initApp);

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE WORKER AUTO-UPDATE (Strettamente mantenuto come da versione v10)
// ═══════════════════════════════════════════════════════════════════════════

if ('serviceWorker' in navigator) {
window.addEventListener('load', () => {
navigator.serviceWorker.getRegistrations()
.then(regs => Promise.all(regs.map(r => r.unregister())))
.then(() => navigator.serviceWorker.register('sw-v10.js'))
.then(() => console.log('SW aggiornato'))
.catch(err => console.error('SW error:', err));
});
}

})();