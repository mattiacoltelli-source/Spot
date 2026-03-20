(function () {
  "use strict";

  if (!window.APP_SPOTS || !Array.isArray(window.APP_SPOTS.spots)) {
    document.body.innerHTML = '<div style="padding:24px;color:white;background:#0b0f14;min-height:100vh;font-family:system-ui,sans-serif"><h1 style="margin-top:0">Errore dati</h1><p>Il file spots.js manca o contiene un errore.</p></div>';
    throw new Error("APP_SPOTS non disponibile");
  }

  const STORAGE_KEYS = {
    favorites: APP_SPOTS.storageKeys?.favorites || "travel_sail_favorites_v1",
    planner: APP_SPOTS.storageKeys?.planner || "travel_sail_planner_v1",
    mode: "travel_sail_mode_v1"
  };

  const DEFAULT_PLANNER = { alba: null, main: null, tramonto: null };

  const APP = {
    mode: loadJson(STORAGE_KEYS.mode, "travel"),
    level: "all",
    light: "all",
    zone: "all",
    activity: "all",
    favoritesFilter: "all",
    sailFilter: "all",
    mapQuickFilter: "all",
    search: "",
    userPos: null,
    currentSpot: null,
    weatherData: null,
    marineData: null,
    hourlyData: [],
    sunTimes: null,
    sunsetTimer: null,
    favorites: loadJson(STORAGE_KEYS.favorites, []),
    planner: loadJson(STORAGE_KEYS.planner, DEFAULT_PLANNER),
    activePage: "home",
    map: null,
    markers: [],
    markerBySpotId: new Map(),
    gpsWatchId: null,
    gpsPath: [],
    gpsLine: null,
    gpsMarker: null
  };

  window.APP = APP;

  function $(id) {
    return document.getElementById(id);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return clone(fallback);
      return JSON.parse(raw);
    } catch {
      return clone(fallback);
    }
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
    if (h < 9) return "alba";
    if (h >= 17) return "tramonto";
    return "giorno";
  }

  function parseSunTime(raw) {
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }

  function formatTime(dateObj) {
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return "—";
    return dateObj.toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit"
    });
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

  function distKm(a, b, c, d) {
    const R = 6371;
    const dLat = (c - a) * Math.PI / 180;
    const dLon = (d - b) * Math.PI / 180;
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(a * Math.PI / 180) *
      Math.cos(c * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)));
  }

  function displayDistance(d) {
    if (d == null) return "distanza non disponibile";
    return `${d.toFixed(1)} km da te`;
  }

  function isFavorite(id) {
    return APP.favorites.includes(id);
  }

  function toggleFavorite(id) {
    if (isFavorite(id)) {
      APP.favorites = APP.favorites.filter(x => x !== id);
    } else {
      APP.favorites = [...APP.favorites, id];
    }

    saveJson(STORAGE_KEYS.favorites, APP.favorites);
    renderAll();

    if (APP.currentSpot?.id === id) {
      showSpotDetail(APP.currentSpot);
    }
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

  function getSpotImage(s) {
    return s.image || `https://picsum.photos/seed/${encodeURIComponent(s.name)}/900/600`;
  }

  function weatherSuitability(spot) {
    const w = APP.weatherData;
    if (!w) return { score: 0, label: "meteo neutro", cls: "gold" };

    let score = 0;

    if (w.rain >= 55) {
      if (spot.activity === "relax") score += 3;
      if (normalizeText(spot.name).includes("forest") || normalizeText(spot.name).includes("fanal")) score += 4;
      if (spot.activity === "view" && (spot.zone === "montagna" || spot.zone === "ovest")) score -= 3;
    }

    if (w.wind >= 32) {
      if (spot.zone === "montagna") score -= 4;
      if (normalizeText(spot.name).includes("pico")) score -= 4;
      if (spot.activity === "view") score -= 2;
      if (spot.activity === "relax") score += 2;
      if (spot.activity === "trekking" && spot.difficulty === "facile") score += 1;
    }

    if (w.cloud >= 65) {
      if (normalizeText(spot.name).includes("forest") || spot.activity === "trekking") score += 2;
      if (spot.light === "tramonto") score -= 1;
    }

    if (w.cloud <= 35 && w.rain < 25) {
      if (spot.light === "alba" || spot.light === "tramonto") score += 3;
      if (spot.activity === "view") score += 2;
    }

    if (w.period === "alba" && spot.light === "alba") score += 2;
    if (w.period === "tramonto" && spot.light === "tramonto") score += 2;
    if (w.period === "giorno" && spot.light === "giorno") score += 1;

    if (score >= 4) return { score, label: "ottimo oggi", cls: "green" };
    if (score <= -2) return { score, label: "meno ideale", cls: "pink" };
    return { score, label: "molto valido", cls: "gold" };
  }

  function getAllSpotsWithMeta() {
    return APP_SPOTS.spots.map(s => ({
      ...s,
      distance: APP.userPos ? distKm(APP.userPos.lat, APP.userPos.lon, s.lat, s.lon) : null,
      weatherFit: weatherSuitability(s),
      sailMeta: window.SAIL ? window.SAIL.getSpotSailMeta(s, APP) : null
    }));
  }

  function getFilteredSpots() {
    let items = getAllSpotsWithMeta().filter(s =>
      (APP.level === "all" || s.level === APP.level) &&
      (APP.light === "all" || s.light === APP.light) &&
      (APP.zone === "all" || s.zone === APP.zone) &&
      (APP.activity === "all" || s.activity === APP.activity) &&
      (APP.favoritesFilter === "all" || isFavorite(s.id)) &&
      (!APP.search || normalizeText(s.name).includes(normalizeText(APP.search)))
    );

    if (APP.mode === "sail" && window.SAIL) {
      items = items.filter(s => window.SAIL.filterSpotForSailMode(s, APP));
    }

    return items.sort((a, b) => {
      if (APP.mode === "sail") {
        const sailDiff = (b.sailMeta?.score || 0) - (a.sailMeta?.score || 0);
        if (sailDiff !== 0) return sailDiff;
      }

      const levelOrder = { core: 0, secondary: 1, extra: 2 };
      if (b.weatherFit.score !== a.weatherFit.score) return b.weatherFit.score - a.weatherFit.score;
      if (levelOrder[a.level] !== levelOrder[b.level]) return levelOrder[a.level] - levelOrder[b.level];
      if (a.distance == null && b.distance == null) return a.name.localeCompare(b.name, "it");
      if (a.distance == null) return 1;
      if (b.distance == null) return -1;
      return a.distance - b.distance;
    });
  }

  function getMapFilteredSpots() {
    let items = getAllSpotsWithMeta();

    if (APP.mode === "sail" && window.SAIL) {
      items = items.filter(s => window.SAIL.filterSpotForSailMode(s, APP));
    }

    if (APP.mapQuickFilter === "wow") return items.filter(s => (APP_SPOTS.topWowNames || []).includes(s.name));
    if (APP.mapQuickFilter === "sunset") return items.filter(s => s.light === "tramonto");
    if (APP.mapQuickFilter === "alba") return items.filter(s => s.light === "alba");
    if (APP.mapQuickFilter === "favorites") return items.filter(s => isFavorite(s.id));

    return items;
  }

  function getBestSpotToday() {
    if (APP.mode === "sail" && window.SAIL) {
      return window.SAIL.getBestSailSpot(APP);
    }

    const desired = currentPeriod();
    let pool = getAllSpotsWithMeta().filter(s => s.light === desired);
    if (!pool.length) pool = getAllSpotsWithMeta();

    return pool.sort((a, b) =>
      b.weatherFit.score - a.weatherFit.score || ((a.distance ?? 9999) - (b.distance ?? 9999))
    )[0] || null;
  }

  function getBestWowSpot() {
    const pool = getAllSpotsWithMeta().filter(s => (APP_SPOTS.topWowNames || []).includes(s.name));
    return pool.sort((a, b) =>
      b.weatherFit.score - a.weatherFit.score || ((a.distance ?? 9999) - (b.distance ?? 9999))
    )[0] || null;
  }

  function getBestSunsetSpot() {
    if (APP.mode === "sail" && window.SAIL) {
      return window.SAIL.getBestSailSunsetSpot(APP);
    }

    const pool = getAllSpotsWithMeta().filter(s => s.light === "tramonto");
    return pool.sort((a, b) =>
      b.weatherFit.score - a.weatherFit.score || ((a.distance ?? 9999) - (b.distance ?? 9999))
    )[0] || null;
  }

  // getClosestSpot migliorata:
  // Preferisce lo spot più vicino che non sia "meno ideale" (cls === "pink").
  // Accetta fino a 15 km in più rispetto al nearest per trovarne uno decente.
  // Ricade sul più vicino assoluto solo se non trova alternative valide.
  function getClosestSpot() {
    if (!APP.userPos) return null;

    let pool = getAllSpotsWithMeta().filter(s => s.distance != null);

    if (APP.mode === "sail" && window.SAIL) {
      pool = pool.filter(s => window.SAIL.filterSpotForSailMode(s, APP));
    }

    if (!pool.length) return null;

    pool.sort((a, b) => a.distance - b.distance);

    const nearest = pool[0];

    if (nearest.weatherFit.cls !== "pink") return nearest;

    const EXTRA_KM_TOLERANCE = 15;
    const decent = pool.find(
      s => s.weatherFit.cls !== "pink" && s.distance <= nearest.distance + EXTRA_KM_TOLERANCE
    );

    return decent || nearest;
  }

  // explainGoNow: genera una stringa breve con i motivi della scelta "Vai ora".
  // Combina al massimo 3 ragioni separate da " · ".
  function explainGoNow(spot) {
    if (!spot) return "";

    const reasons = [];
    const period = currentPeriod();
    const w = APP.weatherData;

    // Motivo 1: meteo
    if (spot.weatherFit?.cls === "green") {
      reasons.push("meteo favorevole");
    } else if (w && w.cloud <= 35 && w.rain < 25) {
      reasons.push("cielo aperto");
    } else if (w && w.rain >= 55) {
      reasons.push("riparato dalla pioggia");
    }

    // Motivo 2: luce / orario
    if (spot.light === period) {
      if (period === "alba") reasons.push("luce perfetta per l'alba");
      else if (period === "tramonto") reasons.push("luce perfetta per il tramonto");
      else reasons.push("orario ideale");
    } else if (period === "tramonto" && spot.light === "tramonto") {
      reasons.push("tramonto imminente");
    }

    // Motivo 3: distanza
    if (spot.distance != null) {
      if (spot.distance <= 8) reasons.push("vicinissimo a te");
      else if (spot.distance <= 18) reasons.push("raggiungibile facilmente");
      else if (spot.distance <= 30) reasons.push("a portata di mano");
    }

    // Fallback se abbiamo meno di 2 ragioni
    if (reasons.length < 2) {
      if (spot.level === "core") reasons.push("spot di prima fascia");
      else if (spot.activity === "view" && period !== "giorno") reasons.push("viewpoint ideale");
    }

    return reasons.slice(0, 3).join(" · ");
  }

  function bestSpot(options) {
    let pool = getAllSpotsWithMeta();

    if (options.light) {
      pool = pool.filter(s => s.light === options.light);
    }

    if (options.activity) {
      pool = pool.filter(s => options.activity.includes(s.activity));
    }

    if (options.exclude?.length) {
      pool = pool.filter(s => !options.exclude.includes(s.id));
    }

    if (APP.zone !== "all") {
      pool = pool.filter(s => s.zone === APP.zone);
    }

    if (APP.level !== "all") {
      pool = pool.filter(s => s.level === APP.level);
    }

    if (!pool.length) return null;

    return pool.sort((a, b) =>
      b.weatherFit.score - a.weatherFit.score || ((a.distance ?? 9999) - (b.distance ?? 9999))
    )[0];
  }

  function rankSpotForGoNow(spot) {
    let score = 0;

    score += (spot.weatherFit?.score || 0) * 12;

    const period = currentPeriod();
    if (spot.light === period) score += 22;
    else if (period === "giorno" && spot.light === "giorno") score += 10;
    else score -= 3;

    const levelBoost = { core: 18, secondary: 10, extra: 4 };
    score += levelBoost[spot.level] || 0;

    if (spot.distance != null) {
      if (spot.distance <= 8) score += 22;
      else if (spot.distance <= 18) score += 16;
      else if (spot.distance <= 30) score += 10;
      else if (spot.distance <= 50) score += 4;
      else score -= Math.min(18, Math.round(spot.distance / 10));
    }

    if (period === "alba" && (spot.activity === "view" || spot.activity === "relax")) score += 7;
    if (period === "giorno" && (spot.activity === "trekking" || spot.activity === "view")) score += 6;
    if (period === "tramonto" && (spot.activity === "view" || spot.activity === "relax")) score += 8;

    return score;
  }

  function getGoNowSuggestions() {
    if (APP.mode === "sail" && window.SAIL) {
      const best = window.SAIL.getBestSailSpot(APP);
      return { best: best || null, alternatives: [] };
    }

    let pool = getAllSpotsWithMeta().map(s => ({
      ...s,
      goNowScore: rankSpotForGoNow(s)
    }));

    pool.sort((a, b) => b.goNowScore - a.goNowScore);

    const best = pool[0] || null;
    const alternatives = pool.filter(s => !best || s.id !== best.id).slice(0, 2);

    return { best, alternatives };
  }

  function runGoNow() {
    const result = getGoNowSuggestions();
    if (!result.best) {
      toast("Nessuno spot disponibile");
      return;
    }

    showSpotDetail(result.best);
    switchPage("detail");
    toast("Ti ho scelto lo spot migliore di adesso");
  }

  function buildDayPlanner() {
    const albaCandidate = bestSpot({ light: "alba", activity: ["view", "trekking", "relax"] });
    const mainCandidate = bestSpot({
      activity: ["trekking", "view", "relax", "mtb"],
      exclude: [albaCandidate?.id]
    });
    const sunsetCandidate = bestSpot({
      light: "tramonto",
      activity: ["view", "relax"],
      exclude: [albaCandidate?.id, mainCandidate?.id]
    });

    const period = currentPeriod();

    if (period === "tramonto") {
      APP.planner = {
        alba: null,
        main: mainCandidate?.id || null,
        tramonto: sunsetCandidate?.id || mainCandidate?.id || null
      };
    } else if (period === "giorno") {
      APP.planner = {
        alba: null,
        main: mainCandidate?.id || null,
        tramonto: sunsetCandidate?.id || null
      };
    } else {
      APP.planner = {
        alba: albaCandidate?.id || null,
        main: mainCandidate?.id || null,
        tramonto: sunsetCandidate?.id || null
      };
    }

    saveJson(STORAGE_KEYS.planner, APP.planner);
    renderPlannerBox();
    toast("Giornata pianificata");
  }

  function getSunPhaseInfo() {
    if (!APP.sunTimes?.sunset) {
      return {
        clockText: "Tramonto —",
        phaseText: "Luce da leggere",
        mainText: "Sto leggendo la luce di oggi",
        subText: "Fra poco trovi countdown e stato tramonto.",
        timeText: "—"
      };
    }

    const now = new Date();
    const sunrise = APP.sunTimes.sunrise;
    const sunset = APP.sunTimes.sunset;
    const goldenStart = new Date(sunset.getTime() - 60 * 60000);
    const blueEnd = new Date(sunset.getTime() + 40 * 60000);

    if (now < sunrise) {
      return {
        clockText: `Tramonto ${formatTime(sunset)}`,
        phaseText: "Prima dell'alba",
        mainText: "Luce ancora chiusa",
        subText: "La giornata deve ancora aprirsi. Per spot alba, stai già guardando la finestra giusta.",
        timeText: formatCountdown(getMinutesDiff(now, sunrise))
      };
    }

    if (now < goldenStart) {
      return {
        clockText: `Tramonto ${formatTime(sunset)}`,
        phaseText: "Prima della golden hour",
        mainText: "La luce migliore arriva più tardi",
        subText: "Hai ancora margine. Se vuoi un tramonto forte, inizia a muoverti quando la luce comincia a scaldarsi.",
        timeText: formatCountdown(getMinutesDiff(now, goldenStart))
      };
    }

    if (now >= goldenStart && now < sunset) {
      return {
        clockText: `Tramonto ${formatTime(sunset)}`,
        phaseText: "Golden hour in corso",
        mainText: "Se vuoi il tramonto, questo è il momento",
        subText: "La luce è nella fascia giusta per viewpoint, costa o scogliere. Adesso conviene già essere sul posto.",
        timeText: formatCountdown(getMinutesDiff(now, sunset))
      };
    }

    if (now >= sunset && now < blueEnd) {
      return {
        clockText: `Tramonto ${formatTime(sunset)}`,
        phaseText: "Blue hour",
        mainText: "Il sole è appena sceso",
        subText: "Hai ancora una finestra breve, morbida e molto bella per skyline, costa e luci artificiali leggere.",
        timeText: formatCountdown(getMinutesDiff(now, blueEnd))
      };
    }

    return {
      clockText: `Tramonto ${formatTime(sunset)}`,
      phaseText: "Dopo il tramonto",
      mainText: "La finestra serale è finita",
      subText: "Per una nuova lettura forte della luce, guarda già la giornata di domani o prepara una partenza all'alba.",
      timeText: "chiuso"
    };
  }

  function startSunsetCountdown() {
    if (APP.sunsetTimer) clearInterval(APP.sunsetTimer);
    if (window.UI?.renderSunPhase) {
      window.UI.renderSunPhase(APP);
    }
    APP.sunsetTimer = setInterval(() => {
      if (window.UI?.renderSunPhase) {
        window.UI.renderSunPhase(APP);
      }
    }, 30000);
  }

  function getNext12Hours(hourly, marineHourly) {
    if (!hourly?.time) return [];
    const now = new Date();

    const merged = hourly.time.map((time, i) => ({
      date: new Date(time),
      temp: hourly.temperature_2m?.[i] ?? 0,
      wind: hourly.wind_speed_10m?.[i] ?? 0,
      windDir: hourly.wind_direction_10m?.[i] ?? 0,
      gust: hourly.wind_gusts_10m?.[i] ?? 0,
      rain: hourly.precipitation_probability?.[i] ?? 0,
      cloud: hourly.cloud_cover?.[i] ?? 0,
      waveHeight: marineHourly?.wave_height?.[i] ?? 0,
      waveDirection: marineHourly?.wave_direction?.[i] ?? 0,
      wavePeriod: marineHourly?.wave_period?.[i] ?? 0
    }));

    return merged
      .filter(item => item.date.getTime() >= now.getTime() - 30 * 60 * 1000)
      .slice(0, 12);
  }

  async function loadWeather() {
    try {
      const lat = (APP_SPOTS.center && APP_SPOTS.center[0]) || 32.75;
      const lon = (APP_SPOTS.center && APP_SPOTS.center[1]) || -16.95;

      const forecastUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover` +
        `&hourly=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,precipitation_probability` +
        `&daily=sunrise,sunset&forecast_days=2&timezone=auto`;

      const marineUrl =
        `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}` +
        `&current=wave_height,wave_direction,wave_period` +
        `&hourly=wave_height,wave_direction,wave_period&timezone=auto`;

      const [forecastRes, marineRes] = await Promise.all([
        fetch(forecastUrl),
        fetch(marineUrl)
      ]);

      const forecast = await forecastRes.json();
      const marine = await marineRes.json();

      const temp = forecast?.current?.temperature_2m ?? 0;
      const wind = forecast?.current?.wind_speed_10m ?? 0;
      const windDir = forecast?.current?.wind_direction_10m ?? 0;
      const gust = forecast?.current?.wind_gusts_10m ?? 0;
      const cloud = forecast?.current?.cloud_cover ?? 0;
      const waveHeight = marine?.current?.wave_height ?? 0;
      const waveDirection = marine?.current?.wave_direction ?? 0;
      const wavePeriod = marine?.current?.wave_period ?? 0;

      const currentHourlyIndex = (forecast?.hourly?.time || []).findIndex(t => {
        const d = new Date(t);
        const now = new Date();
        return d.getHours() === now.getHours() && d.toDateString() === now.toDateString();
      });

      const rain = currentHourlyIndex >= 0
        ? (forecast?.hourly?.precipitation_probability?.[currentHourlyIndex] ?? 0)
        : (forecast?.hourly?.precipitation_probability?.[0] ?? 0);

      const sunrise = parseSunTime(forecast?.daily?.sunrise?.[0]);
      const sunset = parseSunTime(forecast?.daily?.sunset?.[0]);

      APP.sunTimes = { sunrise, sunset };

      let headline = "Meteo aggiornato";
      let advice = "Controlla rapidamente la situazione della giornata.";

      if (rain >= 55) {
        headline = "Pioggia probabile";
        advice = "Meglio spot più riparati o giornate flessibili.";
      } else if (wind >= 32) {
        headline = "Vento forte";
        advice = "Attenzione ai punti molto esposti.";
      } else if (cloud <= 35 && rain < 25) {
        headline = "Finestra interessante";
        advice = "Buona giornata per spot aperti e luce più pulita.";
      }

      APP.weatherData = {
        temp,
        wind,
        windDir,
        gust,
        cloud,
        rain,
        period: currentPeriod(),
        headline,
        advice
      };

      APP.marineData = {
        waveHeight,
        waveDirection,
        wavePeriod
      };

      APP.hourlyData = getNext12Hours(forecast.hourly, marine.hourly);
    } catch {
      APP.weatherData = null;
      APP.marineData = null;
      APP.hourlyData = [];
      APP.sunTimes = null;
    }

    renderAll();
    startSunsetCountdown();
  }

  function markerColor(spot) {
    if (APP.mode === "sail" && window.SAIL) {
      return window.SAIL.getMarkerColor(spot, APP);
    }
    if ((APP_SPOTS.topWowNames || []).includes(spot.name)) return "#f5c451";
    if (spot.light === "tramonto") return "#ff9fbc";
    return "#59b6ff";
  }

  function createMarkerIcon(color) {
    return L.divIcon({
      className: "",
      html: `
        <div style="
          width:18px;
          height:18px;
          border-radius:50%;
          background:${color};
          border:2px solid rgba(255,255,255,.9);
          box-shadow:0 0 0 6px rgba(0,0,0,.14), 0 0 18px ${color}55;
        "></div>
      `,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
      popupAnchor: [0, -10]
    });
  }

  function initMap() {
    const mapEl = $("map");
    if (!mapEl || typeof L === "undefined") return;

    APP.map = L.map("map", { zoomControl: true }).setView(
      APP_SPOTS.center || [32.75, -16.95],
      APP_SPOTS.zoom || 10
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap"
    }).addTo(APP.map);

    APP.gpsLine = L.polyline([], {
      color: "#7dc4ff",
      weight: 4,
      opacity: 0.9
    }).addTo(APP.map);

    renderMarkers();
  }

  function renderMarkers() {
    if (!APP.map) return;

    APP.markers.forEach(m => APP.map.removeLayer(m));
    APP.markers = [];
    APP.markerBySpotId.clear();

    const items = getMapFilteredSpots();
    const latlngs = [];

    items.forEach(spot => {
      const marker = L.marker([spot.lat, spot.lon], {
        icon: createMarkerIcon(markerColor(spot))
      }).addTo(APP.map);

      marker.bindPopup(`
        <div style="min-width:180px">
          <div style="font-weight:800;font-size:15px;margin-bottom:6px">${escapeHtml(spot.name)}</div>
          <div style="font-size:12px;color:#cfe0ef;margin-bottom:8px">${escapeHtml(spot.desc || "")}</div>
        </div>
      `);

      marker.on("click", () => showSpotDetail(spot));

      APP.markers.push(marker);
      APP.markerBySpotId.set(spot.id, marker);
      latlngs.push([spot.lat, spot.lon]);
    });

    if (latlngs.length) {
      APP.map.fitBounds(L.latLngBounds(latlngs).pad(0.18));
    }
  }

  function showSpotDetail(spot) {
    APP.currentSpot = spot;
    if (window.UI?.renderSpotDetail) {
      window.UI.renderSpotDetail(APP, spot);
    }
  }

  function centerSpot(id) {
    const spot = APP_SPOTS.spots.find(s => s.id === id);
    if (!spot || !APP.map) return;

    switchPage("map");

    setTimeout(() => {
      APP.map.setView([spot.lat, spot.lon], 13, { animate: true });
      const marker = APP.markerBySpotId.get(id);
      if (marker) marker.openPopup();
    }, 180);

    showSpotDetail(spot);
  }

  function renderPlannerBox() {
    if (window.UI?.renderPlannerBox) {
      window.UI.renderPlannerBox(APP);
    }
  }

  function switchPage(pageName) {
    APP.activePage = pageName;

    document.querySelectorAll(".page").forEach(page => {
      page.classList.toggle("active", page.id === `page-${pageName}`);
    });

    document.querySelectorAll(".nav-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.page === pageName);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (pageName === "map" && APP.map) {
      setTimeout(() => APP.map.invalidateSize(), 220);
    }
  }

  function updateModeUI() {
    const toggle = $("sailModeToggle");
    const main = $("modeLabelMain");
    const sub = $("modeLabelSub");
    const hero = $("heroDescription");

    if (toggle) toggle.checked = APP.mode === "sail";
    if (main) main.textContent = APP.mode === "sail" ? "Sail Mode" : "Travel Mode";
    if (sub) sub.textContent = APP.mode === "sail" ? "Sail mode ON" : "Sail mode OFF";

    if (hero) {
      hero.textContent = APP.mode === "sail"
        ? "Modalità vela attiva: vento, onde, rotta live e spot compatibili quando presenti nei dati."
        : "Guida travel e outdoor con mappa, spot wow, tramonti, vai ora intelligente, planner giornata e preferiti personali.";
    }

    document.body.classList.toggle("mode-sail", APP.mode === "sail");
  }

  function toggleMode(forceMode) {
    APP.mode = forceMode || (APP.mode === "travel" ? "sail" : "travel");
    saveJson(STORAGE_KEYS.mode, APP.mode);
    updateModeUI();
    renderAll();
    toast(APP.mode === "sail" ? "Sail mode attivata" : "Travel mode attiva");
  }

  function searchSpot() {
    const input = $("searchInput");
    if (!input) return;

    const q = input.value.trim();
    if (!q) return;

    APP.search = q;
    renderAll();

    const found = APP_SPOTS.spots.find(s =>
      normalizeText(s.name).includes(normalizeText(q))
    );

    if (found) {
      showSpotDetail(found);
      switchPage("detail");
      toast("Spot trovato");
    } else {
      toast("Nessuno spot trovato");
    }
  }

  function startGPSRoute() {
    if (!navigator.geolocation || !APP.map) {
      toast("GPS non disponibile");
      return;
    }

    if (APP.gpsWatchId) return;

    APP.gpsWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const speedMs = pos.coords.speed;
        const heading = pos.coords.heading;

        APP.gpsPath.push([lat, lon]);

        if (APP.gpsLine) APP.gpsLine.setLatLngs(APP.gpsPath);

        if (!APP.gpsMarker) {
          APP.gpsMarker = L.circleMarker([lat, lon], {
            radius: 8,
            color: "#dff3ff",
            weight: 2,
            fillColor: "#59b6ff",
            fillOpacity: 1
          }).addTo(APP.map);
        } else {
          APP.gpsMarker.setLatLng([lat, lon]);
        }

        if (window.UI?.renderGpsBox) {
          window.UI.renderGpsBox(APP, { speedMs, heading });
        }
      },
      () => toast("Permesso GPS negato o posizione non disponibile"),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
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
    if (APP.gpsMarker && APP.map) {
      APP.map.removeLayer(APP.gpsMarker);
      APP.gpsMarker = null;
    }
    if (window.UI?.renderGpsBox) {
      window.UI.renderGpsBox(APP, null);
    }
  }

  function bindEvents() {
    const modeToggle = $("sailModeToggle");
    if (modeToggle) {
      modeToggle.addEventListener("change", () => {
        toggleMode(modeToggle.checked ? "sail" : "travel");
      });
    }

    document.querySelectorAll(".nav-btn").forEach(btn => {
      btn.addEventListener("click", () => switchPage(btn.dataset.page));
    });

    const searchInput = $("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        APP.search = searchInput.value.trim();
        renderAll();
      });

      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") searchSpot();
      });
    }

    $("searchBtn")?.addEventListener("click", searchSpot);
    $("spotNowBtn")?.addEventListener("click", runGoNow);   // ← corretto da goNowBtn
    $("autofillPlannerBtn")?.addEventListener("click", buildDayPlanner);
    $("plannerOpenBtn")?.addEventListener("click", () => switchPage("home"));
    $("clearPlannerBtn")?.addEventListener("click", clearPlannerAll);

    $("gpsBtn")?.addEventListener("click", () => {
      if (!navigator.geolocation) {
        toast("GPS non disponibile");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        pos => {
          APP.userPos = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
          };
          renderAll();
          toast("Posizione aggiornata");
        },
        () => toast("Permesso GPS negato"),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });

    $("gpsStartBtn")?.addEventListener("click", startGPSRoute);
    $("gpsStopBtn")?.addEventListener("click", stopGPSRoute);
    $("gpsResetBtn")?.addEventListener("click", resetGPSRoute);

    window.addEventListener("orientationchange", () => {
      setTimeout(() => APP.map && APP.map.invalidateSize(), 300);
    });
  }

  function renderAll() {
    if (window.UI?.renderAll) {
      window.UI.renderAll(APP);
    }
    renderMarkers();
  }

  function toast(message) {
    if (window.UI?.toast) {
      window.UI.toast(message);
    }
  }

  function initApp() {
    updateModeUI();
    bindEvents();
    initMap();
    renderAll();
    loadWeather();

    navigator.geolocation?.getCurrentPosition(
      pos => {
        APP.userPos = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        renderAll();
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("service-worker.js").catch(() => {});
    }

    window.addEventListener("load", () => {
      setTimeout(() => $("splash")?.classList.add("hide"), 850);
    });
  }

  window.APP_UTILS = {
    $,
    escapeHtml,
    normalizeText,
    formatTime,
    formatCountdown,
    currentPeriod,
    displayDistance,
    getSpotImage,
    isFavorite,
    toggleFavorite,
    setPlannerSlot,
    clearPlannerSlot,
    clearPlannerAll,
    getFilteredSpots,
    getMapFilteredSpots,
    getAllSpotsWithMeta,
    getBestSpotToday,
    getBestWowSpot,
    getBestSunsetSpot,
    getClosestSpot,
    getGoNowSuggestions,
    explainGoNow,
    getSunPhaseInfo,
    showSpotDetail,
    switchPage,
    centerSpot,
    renderPlannerBox,
    toggleMode,
    renderAll
  };

  document.addEventListener("DOMContentLoaded", initApp);
})();
