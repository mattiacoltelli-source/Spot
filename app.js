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
    favorites:    APP_SPOTS.storageKeys?.favorites || "travel_sail_favorites_v1",
    planner:      APP_SPOTS.storageKeys?.planner   || "travel_sail_planner_v1",
    mode:         "travel_sail_mode_v1",
    weatherCache: "weather_cache",
    lastPosition: "last_position"
  };

  const DEFAULT_PLANNER = { alba: null, main: null, tramonto: null };

  // ─── APP STATE ────────────────────────────────────────────────────────────

  const APP = {
    mode:              loadJson(STORAGE_KEYS.mode, "travel"),
    level:             "all",
    light:             "all",
    zone:              "all",
    activity:          "all",
    favoritesFilter:   "all",
    sailFilter:        "all",
    mapQuickFilter:    "all",
    distanceFilter:    "all",
    search:            "",
    userPos:           null,
    currentSpot:       null,
    weatherData:       null,
    marineData:        null,
    hourlyData:        [],
    sunTimes:          null,
    sunsetTimer:       null,
    favorites:         loadJson(STORAGE_KEYS.favorites, []),
    planner:           loadJson(STORAGE_KEYS.planner, DEFAULT_PLANNER),
    activePage:        "home",
    map:               null,
    markers:           [],
    markerBySpotId:    new Map(),
    userMarker:        null,
    gpsWatchId:        null,
    gpsPath:           [],
    gpsLine:           null,
    gpsMarker:         null,
    liveGpsData:       null,
    _lightUpdateTimer: null,
    _weatherRefreshTimer: null,
    _nearbyCache:      null,
    _weatherStamp:     null
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
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
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
    const lights = Array.isArray(spotLight) ? spotLight : [spotLight];
    return lights.some(l => normalizeLight(l) === normalizeLight(filterLight));
  }

  function isMorningLike(spotLight) {
    const lights = Array.isArray(spotLight) ? spotLight : [spotLight];
    return lights.some(l => {
      const v = normalizeLight(l);
      return v === "alba" || normalizeText(l) === "mattina";
    });
  }

  function isEveningLike(spotLight) {
    const lights = Array.isArray(spotLight) ? spotLight : [spotLight];
    return lights.some(l => {
      const v = normalizeLight(l);
      return v === "tramonto" || normalizeText(l) === "sera";
    });
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
    if (h <= 0) return `${m}m`;
    return `${h}h ${String(m).padStart(2, "0")}m`;
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
    if (d < 1)    return `${Math.round(d * 1000)} m da te`;
    return `${d.toFixed(1)} km da te`;
  }

  function getSpotImage(s) {
    return s.image || `https://picsum.photos/seed/${encodeURIComponent(s.name)}/900/600`;
  }

  function getBaseSpots()  { return APP_SPOTS.spots; }
  function getSpotById(id) { return APP_SPOTS.spots.find(s => s.id === id) || null; }

  function getCoords(s) {
    if (s.coords && Array.isArray(s.coords)) return s.coords;
    return [s.lat, s.lon];
  }

  function matchValue(val, filter) {
    if (filter === "all") return true;
    const arr = Array.isArray(val) ? val : [val];
    return arr.includes(filter);
  }

  function distanceFilterKm() {
    const v = APP.distanceFilter;
    if (v === "5")  return 5;
    if (v === "10") return 10;
    if (v === "15") return 15;
    return null;
  }

  // Unico punto di ingresso render — evita chiamate duplicate
  function smartRender(type = "light") {
    if (window.UI?.smartRender) {
      window.UI.smartRender(APP, type);
    } else if (window.UI?.renderAll) {
      window.UI.renderAll(APP);
    }
  }

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
    if ("activity" in c && !matchValue(spot.activity, c.activity))  return false;
    if ("zone"       in c && spot.zone       !== c.zone)             return false;
    if ("level"      in c && spot.level      !== c.level)            return false;
    if ("difficulty" in c && spot.difficulty !== c.difficulty)       return false;
    if ("light"      in c && !matchValue(spot.light, c.light))       return false;
    if ("minWow"     in c && (spot.experience?.wow || 0) < c.minWow) return false;
    if ("tagMatch"   in c) {
      const needle  = normalizeText(c.tagMatch);
      const actArr  = Array.isArray(spot.activity) ? spot.activity : [spot.activity];
      const hayTags = [
        ...(spot.tags  || []),
        ...(spot.alias || []),
        spot.experience?.mood,
        spot.mood,
        ...actArr,
        spot.zone
      ].filter(Boolean).map(normalizeText);
      if (!hayTags.some(t => t.includes(needle))) return false;
    }
    if ("nearMe" in c && APP.userPos && spot._distance != null && spot._distance > 30) return false;
    return true;
  }

  function buildHaystack(spot) {
    if (spot._haystack) return spot._haystack;
    const actArr   = Array.isArray(spot.activity) ? spot.activity : [spot.activity];
    const lightArr = Array.isArray(spot.light)    ? spot.light    : [spot.light];
    spot._haystack = [
      spot.name, spot.zone, ...actArr, spot.difficulty, spot.level, ...lightArr,
      spot.desc, spot.tip, spot.mood, spot.longDescription, spot.weatherNote, spot.photoTips,
      spot.experience?.mood, spot.experience?.tipo, spot.experience?.tempo,
      spot.whenToGo?.note, spot.whenToGo?.best,
      ...(spot.tags || []), ...(spot.alias || []), ...(spot.smartTips || []), ...(spot.whenToAvoid || [])
    ].filter(Boolean).map(normalizeText).join(" ");
    return spot._haystack;
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
      return textWords.every(w => hay.includes(w)) &&
             intentWords.every(w => evaluateConstraint(spot, SEARCH_INTENT_MAP[w]));
    }
    return false;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SEZIONE 3 — WEATHER SUITABILITY
  // ═══════════════════════════════════════════════════════════════════════════

  function getWeatherWindowFit(spot) {
    const h     = getCurrentHour();
    const light = normalizeLight((Array.isArray(spot.light) ? spot.light[0] : spot.light) || "");
    if (light === "alba") {
      if (h < 6) return 2; if (h < 9) return 4; if (h < 11) return 1; return -2;
    }
    if (light === "tramonto") {
      if (h < 14) return -1; if (h < 17) return 1; if (h < 20) return 4; return 1;
    }
    if (light === "giorno") {
      if (h < 8) return 0; if (h < 17) return 3; if (h < 19) return 1; return -1;
    }
    return 0;
  }

  function weatherSuitability(spot) {
    const w = APP.weatherData;
    if (!w) return { score: 0, label: "meteo neutro", cls: "gold" };
    if (spot._weatherFit && spot._weatherStamp === APP._weatherStamp) return spot._weatherFit;

    let score    = 0;
    const zone   = normalizeText(spot.zone || "");
    const act    = normalizeText((Array.isArray(spot.activity) ? spot.activity[0] : spot.activity) || "");
    const diff   = normalizeText(spot.difficulty || "");
    const light  = normalizeLight((Array.isArray(spot.light) ? spot.light[0] : spot.light) || "");
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
      if (zone === "montagna") score -= 5;
      if (diff === "impegnativo") score -= 3;
      if (act === "view")  score -= 2;
      if (act === "relax") score += 1;
      if (act === "water") score -= 5;
    } else if (w.wind >= 28) {
      if (zone === "montagna") score -= 3;
      if (act === "trekking" && diff === "impegnativo") score -= 2;
      if (act === "water") score -= 3;
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
      if (act === "view")      score += 2;
      if (zone === "montagna") score += 1;
    }
    score += getWeatherWindowFit(spot);
    if ((spot.experience?.wow || 0) >= 10) score += 1;

    const result =
      score >= 7   ? { score, label: "ottimo oggi",  cls: "green" } :
      score >= 3   ? { score, label: "molto valido", cls: "gold"  } :
      score >= -1  ? { score, label: "nella norma",  cls: "blue"  } :
      score >= -4  ? { score, label: "poco adatto",  cls: "pink"  } :
                     { score, label: "sconsigliato", cls: "danger" };

    spot._weatherFit  = result;
    spot._weatherStamp = APP._weatherStamp;
    return result;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SEZIONE 4 — SPOT META / FILTERING
  // ═══════════════════════════════════════════════════════════════════════════

  function getAllSpotsWithMeta() {
    return getBaseSpots().map(spot => {
      const enriched = { ...spot };
      if (APP.userPos) {
        enriched.distance = distKm(APP.userPos.lat, APP.userPos.lon, spot.lat, spot.lon);
        spot._distance    = enriched.distance;
      } else {
        enriched.distance = null;
        spot._distance    = null;
      }
      enriched.weatherFit = weatherSuitability(spot);
      if (window.SAIL && APP.mode === "sail") {
        enriched.sailMeta = window.SAIL.getSpotSailMeta(spot, APP);
      }
      return enriched;
    });
  }

  function getFilteredSpots() {
    let items = getAllSpotsWithMeta();
    if (APP.search) items = items.filter(s => smartSearchMatch(s, APP.search));
    if (APP.mode === "sail" && window.SAIL) {
      if (APP.sailFilter !== "all") items = items.filter(s => window.SAIL.filterSpotForSailMode(s, APP));
    } else {
      if (APP.level    !== "all") items = items.filter(s => s.level    === APP.level);
      if (APP.zone     !== "all") items = items.filter(s => s.zone     === APP.zone);
      if (APP.activity !== "all") items = items.filter(s => matchValue(s.activity, APP.activity));
      if (APP.light    !== "all") items = items.filter(s => lightMatchesFilter(s.light, APP.light));
      if (APP.favoritesFilter === "favorites") items = items.filter(s => APP.favorites.includes(s.id));
      const maxKm = distanceFilterKm();
      if (maxKm !== null && APP.userPos) items = items.filter(s => s.distance != null && s.distance <= maxKm);
    }
    return items;
  }

  function getMapFilteredSpots() {
    let items = getAllSpotsWithMeta();
    if (APP.mapQuickFilter === "wow")       items = items.filter(s => (APP_SPOTS.topWowNames || []).includes(s.name));
    if (APP.mapQuickFilter === "sunset")    items = items.filter(s => isEveningLike(s.light));
    if (APP.mapQuickFilter === "alba")      items = items.filter(s => isMorningLike(s.light));
    if (APP.mapQuickFilter === "favorites") items = items.filter(s => APP.favorites.includes(s.id));
    return items;
  }

  function getBestSpotToday() {
    const pool = getAllSpotsWithMeta();
    return pool.sort((a, b) => (b.weatherFit?.score || 0) - (a.weatherFit?.score || 0))[0] || null;
  }

  function getBestWowSpot() {
    return getBaseSpots().reduce((best, s) => (!best || (s.experience?.wow || 0) > (best.experience?.wow || 0)) ? s : best, null);
  }

  function getBestSunsetSpot() {
    const names = APP_SPOTS.topSunsetNames;
    if (names?.length) {
      const found = names.map(n => getBaseSpots().find(s => s.name === n)).filter(Boolean);
      if (found.length) return found[0];
    }
    return getBaseSpots()
      .filter(s => isEveningLike(s.light))
      .sort((a, b) => (b.experience?.wow || 0) - (a.experience?.wow || 0))[0] || null;
  }

  function getClosestSpot() {
    if (!APP.userPos) return null;
    const pool = getAllSpotsWithMeta().filter(s => s.distance != null);
    return pool.sort((a, b) => a.distance - b.distance)[0] || null;
  }

  function getClosestSpots(limit = 5) {
    if (!APP.userPos) return [];
    let pool = getAllSpotsWithMeta().filter(s => s.distance != null);
    if (APP.level !== "all") pool = pool.filter(s => s.level === APP.level);
    if (APP.mode === "sail" && window.SAIL) pool = pool.filter(s => window.SAIL.filterSpotForSailMode(s, APP));
    return pool.sort((a, b) => a.distance - b.distance).slice(0, limit);
  }

  function renderNearbyPage() {
    const box = $("nearbyList");
    if (!box) return;
    if (!APP.userPos || !Number.isFinite(APP.userPos.lat) || !Number.isFinite(APP.userPos.lon)) {
      box.innerHTML = `<div class="detail-empty">Attiva il GPS per vedere gli spot vicini.</div>`;
      return;
    }
    const items = getClosestSpots(5);
    if (!items || !items.length) {
      box.innerHTML = `<div class="detail-empty">Sto cercando spot vicini...</div>`;
      return;
    }
    if (items[0].distance == null || items[0].distance > 200) {
      box.innerHTML = `<div class="detail-empty">Sei lontano dalla zona degli spot.</div>`;
      return;
    }
    box.innerHTML = items.map(s => `
      <div class="spot-card glass tap" data-nearby-id="${escapeHtml(s.id)}">
        <div class="spot-head">
          <div>
            <div class="spot-name">${escapeHtml(s.name)}</div>
            <div class="spot-sub">${escapeHtml(s.zone)} · ${escapeHtml(Array.isArray(s.activity) ? s.activity[0] : s.activity)}</div>
          </div>
        </div>
        <div class="spot-meta">
          <span class="tag blue">${displayDistance(s.distance)}</span>
          ${s.weatherFit ? `<span class="tag ${s.weatherFit.cls}">${escapeHtml(s.weatherFit.label)}</span>` : ""}
          ${s.altitude != null ? `<span class="tag">${s.altitude} m</span>` : ""}
        </div>
        <div class="spot-desc">${escapeHtml(s.tip || s.desc || "")}</div>
      </div>
    `).join("");
    box.querySelectorAll("[data-nearby-id]").forEach(card => {
      card.addEventListener("click", () => {
        const spot = items.find(s => s.id === card.dataset.nearbyId);
        if (spot) { showSpotDetail(spot); switchPage("detail"); }
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SEZIONE 5 — GO NOW ENGINE v2
  // ═══════════════════════════════════════════════════════════════════════════

  function scoreDistance(spot) {
    const d = spot.distance;
    if (d == null) return 0;
    if (d <= 3)   return 25; if (d <= 8)   return 20; if (d <= 15) return 14;
    if (d <= 25)  return 8;  if (d <= 50)  return 2;  if (d <= 100) return -2;
    if (d <= 200) return -5;
    return -Math.min(12, Math.round(d / 60));
  }

  function scoreTimeLight(spot) {
    const h        = getCurrentHour();
    const lights   = Array.isArray(spot.light) ? spot.light : [spot.light];
    const lightRaw = normalizeText(lights[0]);
    const light    = normalizeLight(lights[0]);
    if (light === "alba") {
      if (h < 5) return 10; if (h < 9) return 26; if (h < 11) return 8; return -10;
    }
    if (lightRaw === "mattina") {
      if (h < 8) return 8; if (h < 12) return 20; if (h < 14) return 8; return -5;
    }
    if (light === "giorno") {
      if (h < 8) return 2; if (h < 16) return 20; if (h < 18) return 8; return -4;
    }
    if (light === "tramonto") {
      if (h < 13) return -5; if (h < 16) return 10; if (h < 20) return 26; return 8;
    }
    if (lightRaw === "sera") {
      if (h < 16) return -3; if (h < 21) return 20; return 8;
    }
    return 0;
  }

  function scoreDifficulty(spot) {
    const diff = normalizeText(spot.difficulty || "");
    const h    = getCurrentHour();
    if (diff === "impegnativo") {
      if (h >= 17) return -10; if (h >= 14) return -5; if (h < 9) return 4; return 0;
    }
    if (diff === "medio"  && h >= 18) return -4;
    if (diff === "facile" && h >= 17) return 3;
    return 0;
  }

  function scoreWow(spot) {
    const wow = spot.experience?.wow || 0;
    if (wow >= 10) return 10; if (wow >= 9) return 7;
    if (wow >= 8)  return 4;  if (wow >= 7) return 2;
    return 0;
  }

  function scoreActivityPeriod(spot) {
    const period = currentPeriod();
    const act    = normalizeText((Array.isArray(spot.activity) ? spot.activity[0] : spot.activity) || "");
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
    const act   = normalizeText((Array.isArray(spot.activity) ? spot.activity[0] : spot.activity) || "");
    const zone  = normalizeText(spot.zone || "");
    const light = normalizeLight((Array.isArray(spot.light) ? spot.light[0] : spot.light) || "");
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
      + scoreTimeLight(spot) + scoreDistance(spot)
      + (levelBoost[spot.level] || 0) + scoreWow(spot)
      + scoreDifficulty(spot) + scoreActivityPeriod(spot) + scoreWeatherContext(spot);
  }

  function getGoNowSuggestions() {
    if (APP.mode === "sail" && window.SAIL) {
      return { best: window.SAIL.getBestSailSpot(APP) || null, alternatives: [] };
    }
    let pool = getAllSpotsWithMeta();
    if (APP.level !== "all") pool = pool.filter(s => s.level === APP.level);
    pool = pool.map(s => ({ ...s, goNowScore: rankSpotForGoNow(s) }))
               .sort((a, b) => b.goNowScore - a.goNowScore);
    const best = pool[0] || null;
    return { best, alternatives: pool.filter(s => !best || s.id !== best.id).slice(0, 2) };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SEZIONE 6 — EXPLAIN ENGINE
  // ═══════════════════════════════════════════════════════════════════════════

  function explainGoNow(spot) {
    if (!spot) return "";
    const reasons = [];
    const period  = currentPeriod();
    const w       = APP.weatherData;
    const light   = normalizeLight((Array.isArray(spot.light)   ? spot.light[0]   : spot.light)   || "");
    const act     = normalizeText((Array.isArray(spot.activity) ? spot.activity[0] : spot.activity) || "");
    const diff    = normalizeText(spot.difficulty || "");
    const h       = getCurrentHour();
    const wow     = spot.experience?.wow || 0;

    const fitCls = spot.weatherFit?.cls;
    if (fitCls === "green")      reasons.push("condizioni eccellenti in questo momento");
    else if (fitCls === "gold")  reasons.push("momento favorevole");
    else if (fitCls === "pink") {
      reasons.push(act === "relax" ? "regge bene anche con meteo incerto" : "nonostante le condizioni, vale comunque la pena");
    }

    const tl = scoreTimeLight(spot);
    if (tl >= 20) {
      if (light === "tramonto" && period === "tramonto")  reasons.push("fascia di luce ideale per il tramonto");
      else if (light === "alba" && period === "alba")     reasons.push("luce perfetta per partire adesso");
      else if (light === "giorno" && period === "giorno") reasons.push("orario giusto per questo spot");
      else reasons.push("finestra oraria ottimale");
    } else if (tl >= 8) {
      reasons.push("buon momento per andarci");
    } else if (tl < 0) {
      reasons.push("non è l'orario ideale, ma lo spot rimane valido");
    }

    if (w && reasons.length < 3) {
      if (w.cloud <= 25 && w.rain < 15 && (light === "tramonto" || light === "alba"))
        reasons.push("cielo pulito: tramonto potenzialmente molto forte");
      else if (w.wind <= 12 && act === "water") reasons.push("acqua calma — condizioni perfette");
      else if (w.wind <= 18 && act === "view")  reasons.push("vento tranquillo, ideale per stare fermi a guardare");
      else if (w.rain >= 50 && act === "relax") reasons.push("ideale anche con la pioggia");
      else if (w.cloud <= 30 && w.rain < 20 && act === "trekking") reasons.push("buona visibilità per il percorso");
    }

    if (reasons.length < 3) {
      const d = spot.distance;
      if (d != null) {
        if (d <= 3)       reasons.push("praticamente sotto casa");
        else if (d <= 8)  reasons.push("vicinissimo — facile da raggiungere");
        else if (d <= 20) reasons.push("a portata di mano");
        else if (d <= 50) reasons.push("raggiungibile senza troppi sbatti");
        else if (d <= 120) reasons.push("vale il viaggio");
        else reasons.push("spot forte anche se lontano");
      } else {
        if (spot.level === "core")           reasons.push("spot di prima fascia");
        else if (spot.level === "secondary") reasons.push("ottima alternativa intelligente");
      }
    }

    if (reasons.length < 3) {
      if (wow >= 10)                          reasons.push("wow factor massimo: 10/10");
      else if (wow >= 9)                      reasons.push("resa altissima");
      else if (diff === "facile" && wow >= 7) reasons.push("grande resa con poco sforzo");
      else if (act === "trekking") reasons.push("buona scelta come esperienza centrale");
      else if (act === "view")     reasons.push("alta resa visiva");
      else if (act === "relax")    reasons.push("ottima chiusura di giornata");
      else if (act === "water")    reasons.push("esperienza acqua consigliata");
      else if (act === "mtb")      reasons.push("ottimo modulo bike");
    }

    if (reasons.length < 2 && h >= 17) {
      reasons.push(diff === "facile" ? "accessibile anche partendo tardi" : "ancora gestibile per questa sera");
    }

    return reasons.slice(0, 3).join(" · ");
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SEZIONE 7 — PLANNER BUILDER
  // ═══════════════════════════════════════════════════════════════════════════

  function sortBestPool(pool) {
    return pool.sort((a, b) => {
      const wA = a.weatherFit?.score || 0;
      const wB = b.weatherFit?.score || 0;
      const lvA = { core: 2, secondary: 1, extra: 0 }[a.level] || 0;
      const lvB = { core: 2, secondary: 1, extra: 0 }[b.level] || 0;
      const wowA = a.experience?.wow || 0;
      const wowB = b.experience?.wow || 0;
      return (wB * 10 + lvB * 5 + wowB) - (wA * 10 + lvA * 5 + wowA);
    });
  }

  function bestSpotForSlot(options) {
    let pool = getAllSpotsWithMeta();
    if (options.light)         pool = pool.filter(s => lightMatchesFilter(s.light, options.light));
    if (options.activity)      pool = pool.filter(s => options.activity.some(a => matchValue(s.activity, a)));
    if (options.exclude?.length) pool = pool.filter(s => !options.exclude.includes(s.id));
    if (APP.zone  !== "all") pool = pool.filter(s => s.zone  === APP.zone);
    if (APP.level !== "all") pool = pool.filter(s => s.level === APP.level);
    return sortBestPool(pool)[0] || null;
  }

  function buildDayPlanner() {
    const hour  = getCurrentHour();
    const albaC = bestSpotForSlot({ light: "alba",    activity: ["view", "trekking", "relax"] })
               || bestSpotForSlot({ light: "mattina", activity: ["view", "trekking", "relax"] });
    const mainC = bestSpotForSlot({ light: "giorno",  activity: ["trekking", "view", "relax", "mtb", "water"], exclude: [albaC?.id] })
               || bestSpotForSlot({ activity: ["trekking", "view", "relax", "mtb", "water"], exclude: [albaC?.id] });
    const sunC  = bestSpotForSlot({ light: "tramonto", activity: ["view", "relax"], exclude: [albaC?.id, mainC?.id] })
               || bestSpotForSlot({ light: "sera",     activity: ["view", "relax"], exclude: [albaC?.id, mainC?.id] });
    APP.planner = hour >= 17
      ? { alba: null, main: mainC?.id || null, tramonto: sunC?.id || mainC?.id || null }
      : hour >= 10
      ? { alba: null, main: mainC?.id || null, tramonto: sunC?.id || null }
      : { alba: albaC?.id || null, main: mainC?.id || null, tramonto: sunC?.id || null };
    saveJson(STORAGE_KEYS.planner, APP.planner);
    renderPlannerBox();
    toast("Giornata pianificata");
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SEZIONE 8 — FAVORITES & PLANNER CRUD
  // ═══════════════════════════════════════════════════════════════════════════

  function isFavorite(id) { return APP.favorites.includes(id); }

  function toggleFavorite(id) {
    APP.favorites = isFavorite(id)
      ? APP.favorites.filter(x => x !== id)
      : [...APP.favorites, id];
    saveJson(STORAGE_KEYS.favorites, APP.favorites);
    smartRender("light");
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
    return { version: 2, exportedAt: new Date().toISOString(), region: APP_SPOTS.region || "unknown", favorites: [...APP.favorites], planner: clone(APP.planner) };
  }

  function downloadUserData() {
    const blob = new Blob([JSON.stringify(exportUserData(), null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `travel-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast("Backup scaricato");
  }

  function importUserData(jsonString) {
    let data;
    try { data = JSON.parse(jsonString); } catch { return { ok: false, error: "JSON non valido" }; }
    if (!data || typeof data !== "object") return { ok: false, error: "Struttura non riconosciuta" };
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
    smartRender("full");
    toast("Dati importati con successo");
    return { ok: true };
  }

  function importUserDataFromFile(file) {
    if (!file) return;
    const reader  = new FileReader();
    reader.onload = e => { const r = importUserData(e.target.result); if (!r.ok) toast(`Errore importazione: ${r.error}`); };
    reader.onerror = () => toast("Errore nella lettura del file");
    reader.readAsText(file);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SEZIONE 10 — SUN PHASE
  // ═══════════════════════════════════════════════════════════════════════════

  function getSunPhaseInfo() {
    if (!APP.sunTimes?.sunset) {
      return { clockText: "Tramonto —", phaseText: "Luce da leggere", mainText: "Sto leggendo la luce di oggi", subText: "Fra poco trovi countdown e stato tramonto.", timeText: "—" };
    }
    const now         = new Date();
    const { sunrise, sunset } = APP.sunTimes;
    const goldenStart = new Date(sunset.getTime() - 60 * 60000);
    const blueEnd     = new Date(sunset.getTime() + 40 * 60000);
    const ct = `Tramonto ${formatTime(sunset)}`;
    if (now < sunrise)     return { clockText: ct, phaseText: "Prima dell'alba",       mainText: "Luce ancora chiusa",                    subText: "La giornata deve ancora aprirsi. Per spot alba, stai già guardando la finestra giusta.", timeText: formatCountdown(getMinutesDiff(now, sunrise)) };
    if (now < goldenStart) return { clockText: ct, phaseText: "Prima della golden hour", mainText: "La luce migliore arriva più tardi",   subText: "Hai ancora margine. Inizia a muoverti quando la luce comincia a scaldarsi.", timeText: formatCountdown(getMinutesDiff(now, goldenStart)) };
    if (now < sunset)      return { clockText: ct, phaseText: "Golden hour in corso",  mainText: "Se vuoi il tramonto, questo è il momento", subText: "La luce è nella fascia giusta. Adesso conviene già essere sul posto.", timeText: formatCountdown(getMinutesDiff(now, sunset)) };
    if (now < blueEnd)     return { clockText: ct, phaseText: "Blue hour",             mainText: "Il sole è appena sceso",                subText: "Hai ancora una finestra breve e molto bella per skyline e luci.", timeText: formatCountdown(getMinutesDiff(now, blueEnd)) };
    return { clockText: ct, phaseText: "Dopo il tramonto", mainText: "La finestra serale è finita", subText: "Guarda già domani o prepara una partenza all'alba.", timeText: "chiuso" };
  }

  // ── SUN PHASE TIMER: render iniziale solo, countdown gestito da UI ──────────
  function startSunsetCountdown() {
    if (APP.sunsetTimer) clearInterval(APP.sunsetTimer);
    if (window.UI?.renderSunPhase) {
      window.UI.renderSunPhase(APP);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SEZIONE 11 — WEATHER LOADING  (+ auto-refresh ogni 5 minuti)
  // ═══════════════════════════════════════════════════════════════════════════

  function getNext12Hours(hourly, marineHourly) {
    if (!hourly?.time) return [];
    const now = new Date();
    return hourly.time
      .map((time, i) => ({
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
      }))
      .filter(item => item.date.getTime() >= now.getTime() - 30 * 60 * 1000)
      .slice(0, 12);
  }

  async function loadWeather() {
    try {
      const lat = APP_SPOTS.center?.[0] || 45.885;
      const lon = APP_SPOTS.center?.[1] || 10.842;
      const [forecastRes, marineRes] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover&hourly=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,precipitation_probability&daily=sunrise,sunset&forecast_days=2&timezone=auto`),
        fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period&hourly=wave_height,wave_direction,wave_period&timezone=auto`)
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
      const rain = idx >= 0 ? (forecast?.hourly?.precipitation_probability?.[idx] ?? 0) : (forecast?.hourly?.precipitation_probability?.[0] ?? 0);
      APP.sunTimes      = { sunrise: parseSunTime(forecast?.daily?.sunrise?.[0]), sunset: parseSunTime(forecast?.daily?.sunset?.[0]) };
      let headline = "Meteo aggiornato", advice = "Controlla rapidamente la situazione della giornata.";
      if (rain >= 55)                    { headline = "Pioggia probabile";     advice = "Meglio spot riparati o attività flessibili."; }
      else if (wind >= 32)               { headline = "Vento forte";           advice = "Attenzione ai punti molto esposti."; }
      else if (cloud <= 35 && rain < 25) { headline = "Finestra interessante"; advice = "Buona giornata per spot aperti e luce più pulita."; }
      APP.weatherData   = { temp, wind, windDir, gust, cloud, rain, period: currentPeriod(), headline, advice };
      APP._weatherStamp = Date.now();
      APP.marineData    = { waveHeight: marine?.current?.wave_height ?? 0, waveDirection: marine?.current?.wave_direction ?? 0, wavePeriod: marine?.current?.wave_period ?? 0 };
      APP.hourlyData    = getNext12Hours(forecast.hourly, marine.hourly);
      saveWeatherCache(); // salva in cache dopo fetch riuscito
    } catch {
      APP.weatherData = null; APP._weatherStamp = null; APP.marineData = null; APP.hourlyData = []; APP.sunTimes = null;
    }
    smartRender("light"); // render leggero dopo fetch: evita refresh completo
    startSunsetCountdown();
  }

  // Auto-refresh meteo ogni 5 minuti senza ricaricare l'app
  function startWeatherRefreshLoop() {
    if (APP._weatherRefreshTimer) clearInterval(APP._weatherRefreshTimer);
    APP._weatherRefreshTimer = setInterval(() => {
      loadWeather();
    }, 5 * 60 * 1000); // 5 minuti
  }

  // ── CACHE METEO ────────────────────────────────────────────────────────────

  function saveWeatherCache() {
    try {
      const sunTimesRaw = APP.sunTimes
        ? { sunrise: APP.sunTimes.sunrise?.toISOString() || null, sunset: APP.sunTimes.sunset?.toISOString() || null }
        : null;
      const cache = {
        version:     1,
        timestamp:   Date.now(),
        weatherData: APP.weatherData,
        marineData:  APP.marineData,
        hourlyData:  APP.hourlyData.map(item => ({ ...item, date: item.date.toISOString() })),
        sunTimes:    sunTimesRaw
      };
      localStorage.setItem(STORAGE_KEYS.weatherCache, JSON.stringify(cache));
    } catch { /* silenzioso: la cache è opzionale */ }
  }

  function loadWeatherFromCache() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.weatherCache);
      if (!raw) return false;
      const cache = JSON.parse(raw);
      if (!cache || !cache.timestamp || !cache.weatherData) return false;
      if (cache.version !== 1) return false;
      // Valida: max 3 ore
      if (Date.now() - cache.timestamp > 3 * 60 * 60 * 1000) return false;
      APP.weatherData   = cache.weatherData;
      APP.marineData    = cache.marineData  || null;
      APP.hourlyData    = (cache.hourlyData || []).map(item => ({ ...item, date: new Date(item.date) }));
      APP.sunTimes      = cache.sunTimes
        ? { sunrise: parseSunTime(cache.sunTimes.sunrise), sunset: parseSunTime(cache.sunTimes.sunset) }
        : null;
      APP._weatherStamp = cache.timestamp;
      return true;
    } catch { return false; }
  }

  // ── CACHE POSIZIONE ────────────────────────────────────────────────────────

  function saveLastPosition(pos) {
    try {
      localStorage.setItem(STORAGE_KEYS.lastPosition, JSON.stringify({
        timestamp: Date.now(),
        lat:       pos.lat,
        lon:       pos.lon,
        altitude:  pos.altitude ?? null
      }));
    } catch { /* silenzioso */ }
  }

  function loadLastPosition() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.lastPosition);
      if (!raw) return false;
      const pos = JSON.parse(raw);
      if (!pos || !pos.lat || !pos.lon || !pos.timestamp) return false;
      // Valida: max 2 ore
      if (Date.now() - pos.timestamp > 2 * 60 * 60 * 1000) return false;
      APP.userPos = { lat: pos.lat, lon: pos.lon, accuracy: null, altitude: pos.altitude ?? null };
      return true;
    } catch { return false; }
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
      className: "",
      html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,.9);box-shadow:0 0 0 6px rgba(0,0,0,.14),0 0 18px ${color}55;"></div>`,
      iconSize: [18, 18], iconAnchor: [9, 9], popupAnchor: [0, -10]
    });
  }

  // ── Marker posizione utente: pin stile Google Maps (punto blu con alone) ──
  function createUserMarkerIcon() {
    return L.divIcon({
      className: "",
      html: `
        <div style="position:relative;width:24px;height:24px">
          <!-- Alone esterno pulsante -->
          <div style="
            position:absolute;inset:-8px;
            border-radius:50%;
            background:rgba(45,142,255,.18);
            animation:userPulse 2s ease-in-out infinite;
          "></div>
          <!-- Cerchio bianco esterno -->
          <div style="
            position:absolute;inset:0;
            border-radius:50%;
            background:#fff;
            box-shadow:0 2px 8px rgba(0,0,0,.38);
          "></div>
          <!-- Punto blu interno -->
          <div style="
            position:absolute;inset:4px;
            border-radius:50%;
            background:#2d8eff;
          "></div>
        </div>
      `,
      iconSize:    [24, 24],
      iconAnchor:  [12, 12],
      popupAnchor: [0, -14]
    });
  }

  function initMap() {
    const mapEl = $("map");
    if (!mapEl || typeof L === "undefined") return;
    APP.map = L.map("map", { zoomControl: true }).setView(APP_SPOTS.center || [45.885, 10.842], APP_SPOTS.zoom || 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "&copy; OpenStreetMap" }).addTo(APP.map);
    APP.gpsLine = L.polyline([], { color: "#7dc4ff", weight: 4, opacity: 0.9 }).addTo(APP.map);
    renderMarkers();
  }

  // Marker posizione utente — punto blu stile Google Maps, z-index alto
  function updateUserMarker() {
    if (!APP.map || typeof L === "undefined") return;
    if (!APP.userPos) {
      if (APP.userMarker) { APP.map.removeLayer(APP.userMarker); APP.userMarker = null; }
      return;
    }
    const { lat, lon } = APP.userPos;

    // Testo altitudine solo se disponibile
    const altText = APP.userPos.altitude != null
      ? `<div style="font-size:12px;color:#8fc9f8;margin-top:2px">${Math.round(APP.userPos.altitude)} m s.l.m.</div>`
      : "";

    if (!APP.userMarker) {
      APP.userMarker = L.marker([lat, lon], {
        icon:        createUserMarkerIcon(),
        zIndexOffset: 2000  // sempre sopra gli altri marker
      }).addTo(APP.map);
      APP.userMarker.bindPopup(
        `<div style="font-size:13px;font-weight:700">La tua posizione</div>${altText}`
      );
    } else {
      APP.userMarker.setLatLng([lat, lon]);
      APP.userMarker.setIcon(createUserMarkerIcon());
      // Aggiorna popup altitudine live
      APP.userMarker.setPopupContent(
        `<div style="font-size:13px;font-weight:700">La tua posizione</div>${altText}`
      );
    }
  }

  function renderMarkers() {
    if (!APP.map) return;
    APP.markers.forEach(m => APP.map.removeLayer(m));
    APP.markers = [];
    APP.markerBySpotId.clear();

    const items   = getMapFilteredSpots();
    const latlngs = [];

    items.forEach(spot => {
      const marker = L.marker([spot.lat, spot.lon], { icon: createMarkerIcon(markerColor(spot)) }).addTo(APP.map);
      marker.bindPopup(`<div style="min-width:180px"><div style="font-weight:800;font-size:15px;margin-bottom:6px">${escapeHtml(spot.name)}</div><div style="font-size:12px;color:#cfe0ef">${escapeHtml(spot.desc || "")}</div></div>`);
      marker.on("click", () => showSpotDetail(spot));
      APP.markers.push(marker);
      APP.markerBySpotId.set(spot.id, marker);
      latlngs.push([spot.lat, spot.lon]);
    });

    if (!APP._mapInitialized && latlngs.length) {
      APP.map.fitBounds(L.latLngBounds(latlngs).pad(0.18));
      APP._mapInitialized = true;
    }

    updateUserMarker();
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
      APP.markerBySpotId.get(id)?.openPopup();
    }, 180);
    showSpotDetail(spot);
  }

  function switchPage(pageName) {
    APP.activePage = pageName;
    document.querySelectorAll(".page").forEach(p => p.classList.toggle("active", p.id === `page-${pageName}`));
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.page === pageName));

    // Mostra/nascondi search box solo su Home
    const searchWrapper = $("searchBoxWrapper");
    if (searchWrapper) {
      searchWrapper.style.display = pageName === "home" ? "" : "none";
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    if (pageName === "map" && APP.map) {
      setTimeout(() => { APP.map.invalidateSize(); updateUserMarker(); }, 220);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SEZIONE 14 — MODE (TRAVEL / SAIL)
  // ═══════════════════════════════════════════════════════════════════════════

  function updateModeUI() {
    const toggle = $("sailModeToggle"), main = $("modeLabelMain"), sub = $("modeLabelSub"), hero = $("heroDescription");
    const isSail = APP.mode === "sail";
    if (toggle) toggle.checked   = isSail;
    if (main)   main.textContent = isSail ? "Sail Mode"   : "Travel Mode";
    if (sub)    sub.textContent  = isSail ? "Sail mode ON" : "Sail mode OFF";
    if (hero)   hero.textContent = isSail
      ? "Modalità vela attiva: vento, onde, rotta live e spot compatibili quando presenti nei dati."
      : "Guida travel e outdoor con mappa, spot wow, tramonti, vai ora intelligente, planner giornata e preferiti personali.";
    document.body.classList.toggle("mode-sail", isSail);
  }

  function toggleMode(forceMode) {
    APP.mode = forceMode || (APP.mode === "travel" ? "sail" : "travel");
    saveJson(STORAGE_KEYS.mode, APP.mode);
    updateModeUI();
    smartRender("full");
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
    smartRender("light");
    const found = getBaseSpots().find(s => smartSearchMatch(s, q));
    if (found) { showSpotDetail(found); switchPage("detail"); toast("Spot trovato"); }
    else       { switchPage("spots"); toast("Nessuno spot trovato per quella ricerca"); }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SEZIONE 16 — GPS
  // ═══════════════════════════════════════════════════════════════════════════

  function startGPSRoute() {
    if (!navigator.geolocation || !APP.map) { toast("GPS non disponibile"); return; }
    if (APP.gpsWatchId) return;
    APP.gpsWatchId = navigator.geolocation.watchPosition(
      pos => {
        const lat      = pos.coords.latitude;
        const lon      = pos.coords.longitude;
        const speedMs  = typeof pos.coords.speed    === "number" ? pos.coords.speed    : null;
        const heading  = typeof pos.coords.heading  === "number" ? pos.coords.heading  : null;
        const altitude = typeof pos.coords.altitude === "number" ? pos.coords.altitude : null;

        APP.liveGpsData = { lat, lon, speedMs, heading, altitude, timestamp: Date.now() };
        APP.userPos     = { lat, lon, accuracy: pos.coords.accuracy, altitude };
        saveLastPosition(APP.userPos); // aggiorna cache posizione live

        APP.gpsPath.push([lat, lon]);
        if (APP.gpsLine) APP.gpsLine.setLatLngs(APP.gpsPath);

        if (!APP.gpsMarker) {
          APP.gpsMarker = L.circleMarker([lat, lon], {
            radius: 8, color: "#dff3ff", weight: 2, fillColor: "#59b6ff", fillOpacity: 1
          }).addTo(APP.map);
        } else {
          const cur = APP.gpsMarker.getLatLng();
          APP.gpsMarker.setLatLng([cur.lat + (lat - cur.lat) * 0.3, cur.lng + (lon - cur.lng) * 0.3]);
        }

        if (APP.map && APP.gpsMarker) {
          const c = APP.map.getCenter();
          if (Math.abs(c.lat - lat) + Math.abs(c.lng - lon) > 0.01) {
            APP.map.panTo([lat, lon], { animate: true, duration: 0.5 });
          }
        }

        updateUserMarker();
        APP._nearbyCache = getClosestSpots(3);

        if (!APP._lastUiUpdate || Date.now() - APP._lastUiUpdate > 15000) {
          if (window.UI?.renderGpsBox) {
            window.UI.renderGpsBox(APP, APP.liveGpsData);
          }
          APP._lastUiUpdate = Date.now();
        }

        if (!APP._lastMarkerUpdate || Date.now() - APP._lastMarkerUpdate > 4000) {
          renderMarkers();
          APP._lastMarkerUpdate = Date.now();
        }
      },
      () => toast("Permesso GPS negato o posizione non disponibile"),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  }

  function stopGPSRoute() {
    if (APP.gpsWatchId) { navigator.geolocation.clearWatch(APP.gpsWatchId); APP.gpsWatchId = null; }
  }

  function resetGPSRoute() {
    stopGPSRoute();
    APP.gpsPath = []; APP.liveGpsData = null; APP._nearbyCache = null;
    if (APP.gpsLine)              APP.gpsLine.setLatLngs([]);
    if (APP.gpsMarker && APP.map) { APP.map.removeLayer(APP.gpsMarker); APP.gpsMarker = null; }
    if (window.UI?.renderGpsBox)  window.UI.renderGpsBox(APP, null);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SEZIONE 17 — RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  function renderPlannerBox() { if (window.UI?.renderPlannerBox) window.UI.renderPlannerBox(APP); }

  function renderAll() { smartRender("full"); renderMarkers(); renderNearbyPage(); }

  function toast(message) { if (window.UI?.toast) window.UI.toast(message); }

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
    $("sailModeToggle")?.addEventListener("change", e => toggleMode(e.target.checked ? "sail" : "travel"));

    document.querySelectorAll(".nav-btn").forEach(btn => {
      btn.addEventListener("click", () => switchPage(btn.dataset.page));
    });

    const searchInput = $("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input",   () => { APP.search = searchInput.value.trim(); smartRender("light"); });
      searchInput.addEventListener("keydown", e  => { if (e.key === "Enter") searchSpot(); });
    }

    $("searchBtn")?.addEventListener("click",          searchSpot);
    $("goNowBtn")?.addEventListener("click",           runGoNow);
    $("autofillPlannerBtn")?.addEventListener("click", buildDayPlanner);
    $("plannerOpenBtn")?.addEventListener("click",     () => switchPage("home"));
    $("clearPlannerBtn")?.addEventListener("click",    clearPlannerAll);

    $("gpsBtn")?.addEventListener("click", () => {
      if (!navigator.geolocation) { toast("GPS non disponibile"); return; }
      navigator.geolocation.getCurrentPosition(
        pos => {
          APP.userPos = {
            lat:      pos.coords.latitude,
            lon:      pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: typeof pos.coords.altitude === "number" ? pos.coords.altitude : null
          };
          saveLastPosition(APP.userPos); // salva in cache
          updateUserMarker();
          APP._nearbyCache = null;
          smartRender("light");
          const altMsg = APP.userPos.altitude != null
            ? ` · altitudine ${Math.round(APP.userPos.altitude)} m`
            : "";
          toast(`Posizione aggiornata${altMsg}`);
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

  // Light update loop: 5 secondi per sun phase reattiva, render leggero
  function startLightUpdateLoop() {
    if (APP._lightUpdateTimer) clearInterval(APP._lightUpdateTimer);
    APP._lightUpdateTimer = setInterval(() => {
      smartRender("light");
    }, 15000); // 15 secondi
  }

  function initApp() {
    updateModeUI();
    bindEvents();
    initMap();

    // 1) Carica cache meteo e posizione PRIMA del render → nessun loading visibile
    loadWeatherFromCache();
    loadLastPosition();

    // 2) Primo render con i dati già disponibili (cache o vuoti)
    if (APP.userPos) updateUserMarker();
    smartRender("full");

    // 3) Carica meteo reale in background dopo il render: non blocca UI
    setTimeout(() => loadWeather(), 0);

    startLightUpdateLoop();
    startWeatherRefreshLoop(); // auto-refresh ogni 5 minuti
    if (APP.sunTimes) startSunsetCountdown(); // avvia countdown se cache disponibile

    // Stato iniziale search box (home attivo di default)
    const searchWrapper = $("searchBoxWrapper");
    if (searchWrapper) searchWrapper.style.display = "";

    // GPS fresco in background — sovrascrive cache se disponibile
    if (!APP.userPos) {
      navigator.geolocation?.getCurrentPosition(
        pos => {
          APP.userPos = {
            lat:      pos.coords.latitude,
            lon:      pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: typeof pos.coords.altitude === "number" ? pos.coords.altitude : null
          };
          saveLastPosition(APP.userPos); // aggiorna cache posizione
          updateUserMarker();
          smartRender("light");
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    window.addEventListener("load", () => {
      setTimeout(() => $("splash")?.classList.add("hide"), 850);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SEZIONE 20 — PUBLIC API  (window.APP_UTILS)
  // ═══════════════════════════════════════════════════════════════════════════

  window.APP_UTILS = {
    $, escapeHtml, normalizeText, formatTime, formatCountdown,
    currentPeriod, displayDistance, getSpotImage, isMorningLike, isEveningLike,
    getCoords, matchValue, distanceFilterKm,

    smartSearchMatch, buildHaystack, evaluateConstraint,

    getBaseSpots, getSpotById, getAllSpotsWithMeta, getFilteredSpots, getMapFilteredSpots,

    getBestSpotToday, getBestWowSpot, getBestSunsetSpot, getClosestSpot, getClosestSpots,

    getGoNowSuggestions, explainGoNow, rankSpotForGoNow,

    getSunPhaseInfo,

    isFavorite, toggleFavorite, setPlannerSlot, clearPlannerSlot, clearPlannerAll,

    exportUserData, downloadUserData, importUserData, importUserDataFromFile,

    showSpotDetail, switchPage, centerSpot, renderPlannerBox, renderAll,
    renderMarkers, updateUserMarker, toggleMode
  };

  document.addEventListener("DOMContentLoaded", initApp);
})();