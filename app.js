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
    lastPosition: "last_position",
    visited:      APP_SPOTS.storageKeys?.visited   || "travel_sail_visited_v1"
  };

  (function migrateVisited() {
    const newKey = APP_SPOTS.storageKeys?.visited;
    const oldKey = "travel_sail_visited_v1";
    if (newKey && newKey !== oldKey) {
      try {
        const alreadyMigrated = localStorage.getItem(newKey);
        if (!alreadyMigrated) {
          const legacy = localStorage.getItem(oldKey);
          if (legacy) {
            localStorage.setItem(newKey, legacy);
            localStorage.removeItem(oldKey);
          }
        }
      } catch { /* silenzioso */ }
    }
  })();

  const PLANNER_SLOTS   = ["alba", "tappa2", "tappa3", "tappa4", "tramonto"];
  const DEFAULT_PLANNER = { alba: null, tappa2: null, tappa3: null, tappa4: null, tramonto: null };

  function loadPlanner() {
    const loaded = loadJson(STORAGE_KEYS.planner, DEFAULT_PLANNER);
    const planner = clone(DEFAULT_PLANNER);
    for (const slot of PLANNER_SLOTS) {
      if (loaded && typeof loaded[slot] === "string") planner[slot] = loaded[slot];
    }
    return planner;
  }

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
    visited:           loadJson(STORAGE_KEYS.visited, []),
    planner:           loadPlanner(),
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
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("saveJson: impossibile salvare", key, e);
      toast("Spazio di archiviazione pieno. Alcuni dati potrebbero non essere stati salvati.");
    }
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

  function smartRender(type = "light") {
    if (window.UI?.smartRender) {
      window.UI.smartRender(APP, type);
    } else if (window.UI?.renderAll) {
      window.UI.renderAll(APP);
    }
  }

  const SEARCH_INTENT_MAP = {
    "epico":       { minWow: 9 },
    "wow":         { minWow: 9 },
    "forte":       { minWow: 8 },
    "top":         { level: "core" },
    "mega":        { minWow: 9 },
    "panorama":    { anyOf: [{ activity: "view" }, { tagMatch: "panorama" }] },
    "spiaggia":    { activity: "spiaggia" },
    "borgo":       { activity: "borgo" },
    "storico":     { activity: "storico" },
    "natura":      { activity: "natura" },
    "view":        { activity: "view" },
    "belvedere":   { activity: "view" },
    "tramonto":    { light: "tramonto" },
    "alba":        { light: "alba" },
    "giorno":      { light: "giorno" },
    "facile":      { difficulty: "facile" },
    "medio":       { difficulty: "medio" },
    "difficile":   { difficulty: "impegnativo" },
    "impegnativo": { difficulty: "impegnativo" },
    "vicino":      { nearMe: true },
    "vicini":      { nearMe: true },
    "lontano":     { farMe: true }
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
    // FIX: "farMe" era definito nell'intento "lontano" ma mai controllato qui,
    // quindi la ricerca "lontano" non scartava nessuno spot. Simmetrico a
    // nearMe: scarta gli spot entro la stessa soglia di 30 km.
    if ("farMe" in c && APP.userPos && spot._distance != null && spot._distance <= 30) return false;
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
      if (act === "natura") score += 2;
      if (["grotta", "natura"].some(t => hay.includes(t))) score += 3;
      if (act === "view" ) score -= 2;
      if (light === "tramonto" || light === "alba") score -= 2;
    } else if (w.rain >= 30) {
      if (act === "spiaggia") score -= 2;
    }
    if (w.wind >= 38) {
      if (act === "spiaggia") score -= 5;
      if (diff === "impegnativo") score -= 3;
      if (act === "view")  score -= 2;
    } else if (w.wind >= 28) {
      if (act === "spiaggia") score -= 3;
    } else if (w.wind <= 15) {
      if (act === "spiaggia") score += 3;
      if (act === "view")     score += 1;
    } else if (w.wind <= 18) {
      if (act === "spiaggia") score += 1;
    }
    if (w.cloud >= 75) {
      if (light === "tramonto" || light === "alba") score -= 2;
    } else if (w.cloud <= 35 && w.rain < 25) {
      if (light === "alba" || light === "tramonto") score += 3;
      if (act === "spiaggia" || act === "view") score += 2;
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
    if (APP.mapQuickFilter === "wow")       items = items.filter(s => (APP_SPOTS.topWowIds || APP_SPOTS.topWowNames || []).some(v => v === s.id || v === s.name));
    if (APP.mapQuickFilter === "sunset")    items = items.filter(s => isEveningLike(s.light));
    if (APP.mapQuickFilter === "alba")      items = items.filter(s => isMorningLike(s.light));
    if (APP.mapQuickFilter === "giorno")    items = items.filter(s => !isEveningLike(s.light) && !isMorningLike(s.light));
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
    const ids   = APP_SPOTS.topSunsetIds   || [];
    const names = APP_SPOTS.topSunsetNames || [];
    if (ids.length || names.length) {
      const found = getBaseSpots()
        .filter(s => ids.includes(s.id) || names.includes(s.name))
        .filter(s => !isVisited(s.id));
      const order = ids.length ? ids : names;
      found.sort((a, b) => order.indexOf(ids.length ? a.id : a.name) - order.indexOf(ids.length ? b.id : b.name));
      if (found.length) return found[0];
    }
    return getBaseSpots()
      .filter(s => isEveningLike(s.light) && !isVisited(s.id))
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
    if (light === "giorno") {
      if (h < 8) return 2; if (h < 16) return 20; if (h < 18) return 8; return -4;
    }
    if (light === "tramonto") {
      if (h < 13) return -5; if (h < 16) return 10; if (h < 20) return 26; return 8;
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
    if (act === "spiaggia" && period === "giorno")   return 6;
    if (act === "borgo"    && period === "tramonto") return 5;
    if (act === "natura"   && period === "giorno")   return 4;
    return 0;
  }

  function scoreWeatherContext(spot) {
    const w = APP.weatherData;
    if (!w) return 0;
    let bonus = 0;
    const act   = normalizeText((Array.isArray(spot.activity) ? spot.activity[0] : spot.activity) || "");
    const light = normalizeLight((Array.isArray(spot.light) ? spot.light[0] : spot.light) || "");
    if (w.rain >= 50) {
      if (act === "natura") bonus += 6;
      if (light === "tramonto" || light === "alba") bonus -= 6;
      if (act === "view") bonus -= 4;
    }
    if (w.wind >= 35) {
      if (act === "spiaggia") bonus -= 8;
    }
    if (w.wind <= 12 && act === "spiaggia") bonus += 8;
    if (w.wind >= 28 && act === "spiaggia") bonus -= 12;
    if (w.cloud <= 30 && w.rain < 20) {
      if (light === "tramonto" || light === "alba") bonus += 8;
      if (act === "view") bonus += 5;
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
    const notVisited = pool.filter(s => !APP.visited.includes(s.id));
    if (notVisited.length > 0) pool = notVisited;

    if (APP.level !== "all") pool = pool.filter(s => s.level === APP.level);
    pool = pool.map(s => ({ ...s, goNowScore: rankSpotForGoNow(s) }))
               .sort((a, b) => b.goNowScore - a.goNowScore);
    const best = pool[0] || null;
    const bestLight = best ? normalizeLight((Array.isArray(best.light) ? best.light[0] : best.light) || "") : null;

    const remaining = pool.filter(s => !best || s.id !== best.id);
    const alt1 = remaining[0] || null;

    let alt2 = null;
    if (bestLight) {
      alt2 = remaining.find(s =>
        s.id !== alt1?.id &&
        normalizeLight((Array.isArray(s.light) ? s.light[0] : s.light) || "") !== bestLight
      ) || remaining.find(s => s.id !== alt1?.id) || remaining[1] || null;
    } else {
      alt2 = remaining.find(s => s.id !== alt1?.id) || remaining[1] || null;
    }

    return { best, alternatives: [alt1, alt2].filter(Boolean) };
  }

  function explainGoNow(spot) {
    if (!spot) return "";
    const reasons = [];
    const period  = currentPeriod();
    const w       = APP.weatherData;
    const light   = normalizeLight((Array.isArray(spot.light)   ? spot.light[0]   : spot.light)   || "");
    const act     = normalizeText((Array.isArray(spot.activity) ? spot.activity[0] : spot.activity) || "");
    const h       = getCurrentHour();
    const wow     = spot.experience?.wow || 0;

    const fitCls = spot.weatherFit?.cls;
    if (fitCls === "green")      reasons.push("condizioni eccellenti in questo momento");
    else if (fitCls === "gold")  reasons.push("momento favorevole");

    const tl = scoreTimeLight(spot);
    if (tl >= 20) {
      if (light === "tramonto" && period === "tramonto")  reasons.push("fascia di luce ideale per il tramonto");
      else if (light === "alba" && period === "alba")     reasons.push("luce perfetta per partire adesso");
      else reasons.push("finestra oraria ottimale");
    } else if (tl >= 8) {
      reasons.push("buon momento per andarci");
    }

    if (w && reasons.length < 3) {
      if (w.wind <= 12 && act === "spiaggia") reasons.push("mare calmo — condizioni perfette");
      else if (w.cloud <= 25 && w.rain < 15 && (light === "tramonto" || light === "alba"))
        reasons.push("cielo pulito: luce potenzialmente molto forte");
    }

    if (reasons.length < 3) {
      const d = spot.distance;
      if (d != null) {
        if (d <= 3)       reasons.push("praticamente a un passo");
        else if (d <= 15) reasons.push("vicinissimo");
        else if (d <= 50) reasons.push("raggiungibile senza troppa navigazione");
        else reasons.push("vale la rotta più lunga");
      } else if (spot.level === "core") reasons.push("spot di prima fascia");
    }

    if (reasons.length < 3) {
      if (wow >= 10)      reasons.push("wow factor massimo: 10/10");
      else if (wow >= 9)  reasons.push("resa altissima");
      else if (act === "spiaggia") reasons.push("acqua e colori da non perdere");
      else if (act === "borgo")    reasons.push("atmosfera molto bella");
    }

    return reasons.slice(0, 3).join(" · ");
  }

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

  function nearestSpotTo(coords, pool) {
    return pool.slice().sort((a, b) => {
      const dA = distKm(coords[0], coords[1], ...getCoords(a));
      const dB = distKm(coords[0], coords[1], ...getCoords(b));
      return dA - dB;
    })[0] || null;
  }

  function midStopPool(excludeIds) {
    let pool = getAllSpotsWithMeta()
      .filter(s => !excludeIds.includes(s.id))
      .filter(s => ["spiaggia", "view", "natura", "borgo"].some(a => matchValue(s.activity, a)));
    if (APP.zone  !== "all") pool = pool.filter(s => s.zone  === APP.zone);
    if (APP.level !== "all") pool = pool.filter(s => s.level === APP.level);
    return sortBestPool(pool);
  }

  function buildDayPlanner() {
    const hour   = getCurrentHour();
    const albaC  = hour >= 10 ? null : bestSpotForSlot({ light: "alba", activity: ["view", "spiaggia"] });
    const usedIds = [albaC?.id].filter(Boolean);

    const sunC = bestSpotForSlot({ light: "tramonto", activity: ["view", "borgo"], exclude: usedIds });
    if (sunC) usedIds.push(sunC.id);

    const mids = [];
    let fromCoords = albaC ? getCoords(albaC) : (sunC ? getCoords(sunC) : null);
    for (let i = 0; i < 3; i++) {
      const pool = midStopPool(usedIds);
      if (!pool.length) break;
      const topCandidates = pool.slice(0, 8);
      const pick = fromCoords ? nearestSpotTo(fromCoords, topCandidates) : topCandidates[0];
      if (!pick) break;
      mids.push(pick);
      usedIds.push(pick.id);
      fromCoords = getCoords(pick);
    }

    APP.planner = {
      alba:     albaC?.id || null,
      tappa2:   mids[0]?.id || null,
      tappa3:   mids[1]?.id || null,
      tappa4:   mids[2]?.id || null,
      tramonto: sunC?.id || null
    };
    saveJson(STORAGE_KEYS.planner, APP.planner);
    renderPlannerBox();
    toast("Itinerario pianificato");
  }

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

  function isVisited(id) { return APP.visited.includes(id); }

  function toggleVisited(id) {
    APP.visited = isVisited(id)
      ? APP.visited.filter(x => x !== id)
      : [...APP.visited, id];
    saveJson(STORAGE_KEYS.visited, APP.visited);
    smartRender("light");
  }

  function markVisited(id) {
    if (!isVisited(id)) {
      APP.visited = [...APP.visited, id];
      saveJson(STORAGE_KEYS.visited, APP.visited);
    }
    smartRender("light");
  }

  function getSunPhaseInfo() {
    if (!APP.sunTimes?.sunset) {
      return {
        clockText: "Tramonto —",
        phaseText: "Luce da leggere",
        mainText:  "Caricamento in corso",
        subText:   "Il meteo sta arrivando.",
        timeText:  "—"
      };
    }

    const now    = new Date();
    const sunset = APP.sunTimes.sunset instanceof Date ? APP.sunTimes.sunset : new Date(APP.sunTimes.sunset);
    const sunrise = APP.sunTimes.sunrise instanceof Date ? APP.sunTimes.sunrise : (APP.sunTimes.sunrise ? new Date(APP.sunTimes.sunrise) : null);

    const diffMin = getMinutesDiff(now, sunset);
    const clockText = `Tramonto ${formatTime(sunset)}`;

    let phaseText, mainText, subText, timeText;

    if (sunrise && now < sunrise) {
      const minsToSunrise = getMinutesDiff(now, sunrise);
      phaseText = "Notte / Pre-alba";
      mainText  = "Prima dell'alba";
      subText   = `Alba alle ${formatTime(sunrise)}`;
      timeText  = formatCountdown(minsToSunrise);
    } else if (diffMin > 90) {
      phaseText = "Giorno pieno";
      mainText  = "Giornata in corso";
      subText   = `Tramonto fra ${formatCountdown(diffMin)}`;
      timeText  = formatCountdown(diffMin);
    } else if (diffMin > 30) {
      phaseText = "Golden hour vicina";
      mainText  = "La luce si fa interessante";
      subText   = `Tramonto fra ${formatCountdown(diffMin)} — inizia a muoverti`;
      timeText  = formatCountdown(diffMin);
    } else if (diffMin > 0) {
      phaseText = "🔥 Golden hour";
      mainText  = "Adesso — luce al massimo";
      subText   = `Tramonto fra ${formatCountdown(diffMin)} — vai subito`;
      timeText  = formatCountdown(diffMin);
    } else {
      phaseText = "Tramonto passato";
      mainText  = "Luce serale residua";
      subText   = `Tramontato alle ${formatTime(sunset)}`;
      timeText  = "Tramontato";
    }

    return { clockText, phaseText, mainText, subText, timeText };
  }

  function startSunsetCountdown() {
    if (APP.sunsetTimer) clearInterval(APP.sunsetTimer);
    APP.sunsetTimer = setInterval(() => {
      if (window.UI?.renderSunPhase) window.UI.renderSunPhase(APP);
    }, 60000);
    if (window.UI?.renderSunPhase) window.UI.renderSunPhase(APP);
  }

  async function loadWeather() {
    const coords = APP_SPOTS.weatherCoords || APP_SPOTS.center;
    if (!coords) return;
    const [lat, lon] = coords;

    try {
      const [meteoRes, marineRes] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,windspeed_10m,winddirection_10m,windgusts_10m,cloudcover,precipitation_probability&hourly=temperature_2m,windspeed_10m,precipitation_probability,cloudcover&forecast_days=1&timezone=auto`),
        fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period&timezone=auto`).catch(() => null)
      ]);

      if (!meteoRes.ok) throw new Error("Meteo non disponibile");
      const meteo = await meteoRes.json();
      const c     = meteo.current;

      APP.weatherData = {
        temp:     c.temperature_2m,
        wind:     c.windspeed_10m,
        windDir:  c.winddirection_10m,
        gust:     c.windgusts_10m,
        cloud:    c.cloudcover,
        rain:     c.precipitation_probability,
        headline: c.cloudcover < 30 && c.precipitation_probability < 20
          ? "Cielo sereno — ottima giornata"
          : c.precipitation_probability >= 60
          ? "Pioggia probabile — scegli spot coperti"
          : c.cloudcover >= 75
          ? "Nuvoloso ma stabile"
          : "Condizioni miste",
        advice: c.windspeed_10m >= 35
          ? "vento forte, valuta ancoraggi riparati"
          : c.precipitation_probability >= 60
          ? "porta impermeabile"
          : c.cloudcover <= 25
          ? "luce ottima per foto"
          : "giornata standard"
      };

      APP._weatherStamp = Date.now();

      if (marineRes?.ok) {
        const marine = await marineRes.json();
        const mc = marine.current;
        APP.marineData = mc ? {
          waveHeight:    mc.wave_height,
          waveDirection: mc.wave_direction,
          wavePeriod:    mc.wave_period
        } : null;
      }

      if (meteo.hourly) {
        const times = meteo.hourly.time || [];
        const now = new Date();
        const startIdx = times.findIndex(t => new Date(t) > now);
        const from = startIdx >= 0 ? startIdx : 0;
        APP.hourlyData = times.slice(from, from + 12).map((t, i) => ({
          date:  new Date(t),
          temp:  meteo.hourly.temperature_2m?.[from + i] ?? 0,
          wind:  meteo.hourly.windspeed_10m?.[from + i]  ?? 0,
          rain:  meteo.hourly.precipitation_probability?.[from + i] ?? 0,
          cloud: meteo.hourly.cloudcover?.[from + i] ?? 0
        }));
      }

      try {
        const sunRes = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`);
        if (sunRes.ok) {
          const sun = await sunRes.json();
          if (sun.results) {
            APP.sunTimes = {
              sunrise: parseSunTime(sun.results.sunrise),
              sunset:  parseSunTime(sun.results.sunset)
            };
          }
        }
      } catch { /* sun times non critici */ }

      saveWeatherCache();

    } catch {
      APP.weatherData = null; APP._weatherStamp = null; APP.marineData = null; APP.hourlyData = []; APP.sunTimes = null;
    }
    smartRender("light");
    startSunsetCountdown();
  }

  function startWeatherRefreshLoop() {
    if (APP._weatherRefreshTimer) clearInterval(APP._weatherRefreshTimer);
    APP._weatherRefreshTimer = setInterval(() => {
      loadWeather();
    }, 5 * 60 * 1000);
  }

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
    } catch { /* silenzioso */ }
  }

  function loadWeatherFromCache() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.weatherCache);
      if (!raw) return false;
      const cache = JSON.parse(raw);
      if (!cache || !cache.timestamp || !cache.weatherData) return false;
      if (cache.version !== 1) return false;
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
      if (Date.now() - pos.timestamp > 2 * 60 * 60 * 1000) return false;
      APP.userPos = { lat: pos.lat, lon: pos.lon, accuracy: null, altitude: pos.altitude ?? null };
      return true;
    } catch { return false; }
  }

  function markerColor(spot) {
    if (APP.mode === "sail" && window.SAIL) return window.SAIL.getMarkerColor(spot, APP);
    if ((APP_SPOTS.topWowIds || APP_SPOTS.topWowNames || []).some(v => v === spot.id || v === spot.name)) return "#f5c451";
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

  function createUserMarkerIcon() {
    return L.divIcon({
      className: "",
      html: `
        <div style="position:relative;width:24px;height:24px">
          <div style="position:absolute;inset:-8px;border-radius:50%;background:rgba(45,142,255,.18);animation:userPulse 2s ease-in-out infinite;"></div>
          <div style="position:absolute;inset:0;border-radius:50%;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.38);"></div>
          <div style="position:absolute;inset:4px;border-radius:50%;background:#2d8eff;"></div>
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
    APP.map = L.map("map", { zoomControl: true, touchZoom: true, dragging: true, tap: false, tapTolerance: 15 }).setView(APP_SPOTS.center || [38.9, 20.3], APP_SPOTS.zoom || 8);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "&copy; OpenStreetMap" }).addTo(APP.map);
    APP.gpsLine = L.polyline([], { color: "#7dc4ff", weight: 4, opacity: 0.9 }).addTo(APP.map);
    renderMarkers();
  }

  function updateUserMarker() {
    if (!APP.map || typeof L === "undefined") return;
    if (!APP.userPos) {
      if (APP.userMarker) { APP.map.removeLayer(APP.userMarker); APP.userMarker = null; }
      return;
    }
    const { lat, lon } = APP.userPos;
    const altText = APP.userPos.altitude != null
      ? `<div style="font-size:12px;color:#8fc9f8;margin-top:2px">${Math.round(APP.userPos.altitude)} m s.l.m.</div>`
      : "";
    if (!APP.userMarker) {
      APP.userMarker = L.marker([lat, lon], { icon: createUserMarkerIcon(), zIndexOffset: 2000 }).addTo(APP.map);
      APP.userMarker.bindPopup(`<div style="font-size:13px;font-weight:700">La tua posizione</div>${altText}`);
    } else {
      APP.userMarker.setLatLng([lat, lon]);
      APP.userMarker.setIcon(createUserMarkerIcon());
      APP.userMarker.setPopupContent(`<div style="font-size:13px;font-weight:700">La tua posizione</div>${altText}`);
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

  function showSpotDetail(spot) {
    APP.currentSpot = spot;
    if (window.UI?.renderSpotDetail) window.UI.renderSpotDetail(APP, spot);
  }

  function centerSpot(id) {
    const spot = getSpotById(id);
    if (!spot || !APP.map) return;
    switchPage("map");
    setTimeout(() => {
      APP.map.setView([spot.lat, spot.lon], 11, { animate: true });
      APP.markerBySpotId.get(id)?.openPopup();
    }, 180);
    showSpotDetail(spot);
  }

  function switchPage(pageName) {
    APP.activePage = pageName;
    const activePage = document.querySelector(`#page-${pageName}`);
    document.querySelectorAll(".page").forEach(p => p.classList.toggle("active", p.id === `page-${pageName}`));
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.page === pageName));

    if (activePage) {
      activePage.style.opacity = "0";
      requestAnimationFrame(() => {
        activePage.style.transition = "opacity 150ms ease";
        activePage.style.opacity = "1";
      });
    }

    const searchWrapper = $("searchBoxWrapper");
    if (searchWrapper) {
      searchWrapper.style.display = pageName === "home" ? "" : "none";
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    if (pageName === "map" && APP.map) {
      setTimeout(() => { APP.map.invalidateSize(); updateUserMarker(); }, 220);
    }
  }

  function updateModeUI() {
    const toggle = $("sailModeToggle"), main = $("modeLabelMain"), sub = $("modeLabelSub"), hero = $("heroDescription");
    const isSail = APP.mode === "sail";
    if (toggle) toggle.checked   = isSail;
    if (main)   main.textContent = isSail ? "Sail Mode"   : "Travel Mode";
    if (sub)    sub.textContent  = isSail ? "Sail mode ON" : "Sail mode OFF";
    if (hero)   hero.textContent = isSail
      ? "Modalità vela attiva: filtra gli spot compatibili con vento e onde attuali."
      : "Spiagge, borghi e punti di interesse lungo la rotta: cerca, scopri, pianifica ogni tappa.";
    document.body.classList.toggle("mode-sail", isSail);
  }

  function toggleMode(forceMode) {
    APP.mode = forceMode || (APP.mode === "travel" ? "sail" : "travel");
    saveJson(STORAGE_KEYS.mode, APP.mode);
    updateModeUI();
    smartRender("full");
    toast(APP.mode === "sail" ? "Sail mode attivata" : "Travel mode attiva");
  }

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
        saveLastPosition(APP.userPos);

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
          if (window.UI?.renderGpsBox) window.UI.renderGpsBox(APP, APP.liveGpsData);
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

  const COSA_ORA_DIST = { 30: 5, 60: 15, 90: 30, 120: 50 };

  function runCosaOra() {
    const activeBtn = document.querySelector(".cosa-ora-option.active");
    const minutes   = parseInt(activeBtn?.dataset.min || "30", 10);
    const maxKm     = COSA_ORA_DIST[minutes] || 5;
    const hint      = $("cosaOraGpsHint");

    if (!APP.userPos && navigator.geolocation) {
      if (hint) hint.classList.add("visible");
      navigator.geolocation.getCurrentPosition(
        pos => {
          APP.userPos = {
            lat:      pos.coords.latitude,
            lon:      pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: typeof pos.coords.altitude === "number" ? pos.coords.altitude : null
          };
          saveLastPosition(APP.userPos);
          updateUserMarker();
          APP._nearbyCache = null;
          if (hint) hint.classList.remove("visible");
          smartRender("light");
          _eseguiCosaOra(minutes, maxKm);
        },
        () => {
          if (hint) hint.classList.add("visible");
          _eseguiCosaOra(minutes, maxKm);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
      return;
    }

    if (hint) hint.classList.remove("visible");
    _eseguiCosaOra(minutes, maxKm);
  }

  function _eseguiCosaOra(minutes, maxKm) {
    let pool = getAllSpotsWithMeta();
    const notVisited = pool.filter(s => !APP.visited.includes(s.id));
    if (notVisited.length > 0) pool = notVisited;

    if (APP.userPos) {
      const filtered = pool.filter(s => s.distance != null && s.distance <= maxKm);
      if (filtered.length > 0) pool = filtered;
    }

    const ranked = pool
      .map(s => ({ ...s, goNowScore: rankSpotForGoNow(s) }))
      .sort((a, b) => b.goNowScore - a.goNowScore);

    const best = ranked[0] || null;
    if (!best) { toast("Nessuno spot disponibile"); return; }

    showSpotDetail(best);
    switchPage("detail");
    const label = minutes < 60 ? `${minutes} min` : minutes === 60 ? "1h" : minutes === 90 ? "1h 30" : "2h";
    toast(`Spot perfetto per ${label} — eccolo`);
  }

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
    $("cosaOraBtn")?.addEventListener("click",         runCosaOra);
    $("autofillPlannerBtn")?.addEventListener("click", buildDayPlanner);
    $("plannerOpenBtn")?.addEventListener("click",     () => switchPage("home"));
    $("clearPlannerBtn")?.addEventListener("click",    clearPlannerAll);

    const trigger = $("cosaOraTrigger");
    const menu    = $("cosaOraMenu");
    if (trigger && menu) {
      trigger.addEventListener("click", e => {
        e.stopPropagation();
        menu.classList.toggle("open");
        trigger.classList.toggle("open");
      });
      document.addEventListener("click", () => {
        menu.classList.remove("open");
        trigger.classList.remove("open");
      });
      menu.querySelectorAll(".cosa-ora-option").forEach(opt => {
        opt.addEventListener("click", e => {
          e.stopPropagation();
          menu.querySelectorAll(".cosa-ora-option").forEach(o => o.classList.remove("active"));
          opt.classList.add("active");
          const label = $("cosaOraSelected");
          if (label) label.textContent = opt.textContent;
          menu.classList.remove("open");
          trigger.classList.remove("open");
          const hint = $("cosaOraGpsHint");
          if (hint) hint.classList.remove("visible");
        });
      });
    }

    $("gpsStartBtn")?.addEventListener("click", startGPSRoute);
    $("gpsStopBtn")?.addEventListener("click",  stopGPSRoute);
    $("gpsResetBtn")?.addEventListener("click", resetGPSRoute);

    window.addEventListener("orientationchange", () => {
      setTimeout(() => APP.map && APP.map.invalidateSize(), 300);
    });
  }

  function startLightUpdateLoop() {
    if (APP._lightUpdateTimer) clearInterval(APP._lightUpdateTimer);
    let _lastHour = -1;

    APP._lightUpdateTimer = setInterval(() => {
      if (document.hidden) return;

      const currentHour = new Date().getHours();
      if (currentHour !== _lastHour) {
        _lastHour = currentHour;
        smartRender("light");
      } else {
        if (window.UI?.renderSunPhase) window.UI.renderSunPhase(APP);
      }
    }, 15000);
  }

  function initApp() {
    updateModeUI();
    bindEvents();
    initMap();

    const fadeStyle = document.createElement("style");
    fadeStyle.textContent = ".page { transition: opacity 150ms ease; }";
    document.head.appendChild(fadeStyle);

    history.pushState(null, "", location.href);
    window.addEventListener("popstate", () => {
      if (APP.activePage !== "home") {
        history.pushState(null, "", location.href);
        switchPage("home");
      }
    });

    loadWeatherFromCache();
    loadLastPosition();

    if (APP.userPos) updateUserMarker();
    smartRender("full");

    setTimeout(() => loadWeather(), 0);

    startLightUpdateLoop();
    startWeatherRefreshLoop();
    if (APP.sunTimes) startSunsetCountdown();

    const searchWrapper = $("searchBoxWrapper");
    if (searchWrapper) searchWrapper.style.display = "";

    if (!APP.userPos) {
      navigator.geolocation?.getCurrentPosition(
        pos => {
          APP.userPos = {
            lat:      pos.coords.latitude,
            lon:      pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: typeof pos.coords.altitude === "number" ? pos.coords.altitude : null
          };
          saveLastPosition(APP.userPos);
          updateUserMarker();
          smartRender("light");
        },
        err => {
          const msgs = {
            1: "Posizione non disponibile: permesso GPS negato.",
            2: "Posizione non disponibile: GPS non raggiungibile.",
            3: "Posizione non disponibile: timeout GPS."
          };
          toast(msgs[err?.code] || "Posizione non disponibile.");
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    window.addEventListener("load", () => {
      setTimeout(() => $("splash")?.classList.add("hide"), 850);
    });
  }

  window.APP_UTILS = {
    $, escapeHtml, normalizeText, formatTime, formatCountdown,
    currentPeriod, displayDistance, getSpotImage, isMorningLike, isEveningLike,
    getCoords, matchValue, distanceFilterKm, distKm,

    smartSearchMatch, buildHaystack, evaluateConstraint,

    getBaseSpots, getSpotById, getAllSpotsWithMeta, getFilteredSpots, getMapFilteredSpots,

    getBestSpotToday, getBestWowSpot, getBestSunsetSpot, getClosestSpot, getClosestSpots,

    getGoNowSuggestions, explainGoNow, rankSpotForGoNow,

    getSunPhaseInfo,

    isFavorite, toggleFavorite, setPlannerSlot, clearPlannerSlot, clearPlannerAll,

    isVisited, toggleVisited, markVisited,

    showSpotDetail, switchPage, centerSpot, renderPlannerBox, renderAll,
    renderMarkers, updateUserMarker, toggleMode
  };

  document.addEventListener("DOMContentLoaded", initApp);
})();
