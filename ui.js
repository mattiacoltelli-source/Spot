(function () {
  "use strict";

  const UI = {};

  function $(id) { return document.getElementById(id); }
  function esc(v) { return window.APP_UTILS.escapeHtml(v); }
  function isFavorite(id) { return window.APP_UTILS.isFavorite(id); }
  function favIcon(id) { return isFavorite(id) ? "❤️" : "🤍"; }

  // ─── LABEL HELPER ─────────────────────────────────────────────────────────

  function pretty(value) {
    if (!value) return "—";
    const zones = APP_SPOTS.zones || [];
    const zoneEntry = zones.find(z => z.id === value);
    if (zoneEntry) return zoneEntry.label;
    const activities = APP_SPOTS.activities || [];
    const actEntry = activities.find(a => a.id === value);
    if (actEntry) return actEntry.label;
    const map = {
      core: "Top", secondary: "Belli", extra: "Extra",
      alba: "Alba", giorno: "Giorno", tramonto: "Tramonto", mattina: "Mattina", sera: "Sera",
      facile: "Facile", medio: "Medio", impegnativo: "Impegnativo",
      epico: "Epico", iconico: "Iconico", mistico: "Mistico",
      avventura: "Avventura", "relax wow": "Relax wow",
      "grande panorama": "Grande panorama", "panorama pulito": "Panorama pulito"
    };
    return map[value] || value;
  }

  function getSpotCounts() {
    const spots = Array.isArray(APP_SPOTS?.spots) ? APP_SPOTS.spots : [];
    const core      = spots.filter(s => s.level === "core").length;
    const secondary = spots.filter(s => s.level === "secondary").length;
    const extra     = spots.filter(s => s.level === "extra").length;
    return { core, secondary, extra, main: core + secondary, total: spots.length };
  }

  function chipClassFromFit(fit) {
    if (!fit) return "blue";
    return fit.cls || "blue";
  }

  function getDistanceLabel(spot) {
    if (!spot || spot.distance == null) return "";
    return window.APP_UTILS.displayDistance(spot.distance);
  }

  function getSpotMicroSummary(spot) {
    if (!spot) return "—";
    if (spot.tip) return spot.tip;
    if (spot.experience?.tipo && spot.experience?.tempo) return `${spot.experience.tipo} · ${spot.experience.tempo}`;
    return spot.desc || "Spot disponibile.";
  }

  function getBestPracticalLine(spot) {
    if (!spot) return "Sto leggendo lo spot migliore del momento.";
    const parts = [];
    if (spot.experience?.tipo)  parts.push(spot.experience.tipo);
    if (spot.experience?.tempo) parts.push(spot.experience.tempo);
    if (spot.experience?.mood)  parts.push(pretty(spot.experience.mood));
    if (!parts.length && spot.whenToGo?.note) parts.push(spot.whenToGo.note);
    if (!parts.length && spot.tip)            parts.push(spot.tip);
    return parts.slice(0, 2).join(" · ") || "Spot consigliato adesso.";
  }

  function getClosestPracticalLine(spot) {
    if (!spot) return "Attiva il GPS per leggere lo spot più vicino.";
    const parts = [];
    if (spot.zone)              parts.push(pretty(spot.zone));
    if (spot.activity)          parts.push(pretty(spot.activity));
    if (spot.experience?.tempo) parts.push(spot.experience.tempo);
    if (parts.length) return parts.join(" · ");
    return spot.tip || spot.desc || "Spot vicino disponibile.";
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUICK GRID
  // ═══════════════════════════════════════════════════════════════════════════

  // ── SMART SIGNALS — segnali contestuali per ogni spot ─────────────────────
  function buildSmartSignals(spot, app) {
    if (!spot) return "";
    const signals = [];
    const w   = app.weatherData;
    const now = new Date();
    const sunset = app.sunTimes?.sunset;

    if (w) {
      if (w.cloud <= 30 && w.rain < 20)      signals.push("🌤 cielo pulito");
      else if (w.cloud <= 60)                 signals.push("⛅ parzialmente nuvoloso");
      if (w.wind <= 15)                       signals.push("💨 vento basso");
      else if (w.wind >= 30)                  signals.push("💨 vento forte");
    }

    if (sunset instanceof Date) {
      const diffMin = Math.floor((sunset - now) / 60000);
      if (diffMin > 0 && diffMin <= 90)       signals.push(`🌅 tramonto tra ${diffMin} min`);
      else if (diffMin > 90 && diffMin <= 180) signals.push(`🌅 tramonto tra ${Math.round(diffMin/60*10)/10}h`);
    }

    if (spot.distance != null) {
      if (spot.distance <= 5)                 signals.push(`📍 ${spot.distance.toFixed(1)} km`);
      else if (spot.distance <= 15)           signals.push(`📍 ${Math.round(spot.distance)} km`);
    }

    if ((spot.experience?.wow || 0) >= 9)     signals.push("🔥 spot forte");

    return signals.slice(0, 3).join(" · ");
  }

  function buildTravelQuickCards(app) {
    const goNow      = window.APP_UTILS.getGoNowSuggestions();
    const bestNow    = goNow?.best || null;
    const alt1       = goNow?.alternatives?.[0] || null;
    const alt2       = goNow?.alternatives?.[1] || null;
    const bestSunset = window.APP_UTILS.getBestSunsetSpot();

    const mainSignals = bestNow ? buildSmartSignals(bestNow, app) : "";
    const alt1Signals = alt1    ? buildSmartSignals(alt1, app)    : "";
    const alt2Signals = alt2    ? buildSmartSignals(alt2, app)    : "";

    // ── Card principale "Vai ora" ──────────────────────────────────────────
    const mainCard = `
      <div class="go-now-main glass best tap" data-quick-id="${bestNow ? esc(bestNow.id) : ""}">
        <div class="go-now-main-header">
          <div class="quick-label go-now-fire">🔥 Perfetto adesso</div>
          ${bestNow?.experience?.wow ? `<div class="mini-chip gold">Wow ${esc(String(bestNow.experience.wow))}/10</div>` : ""}
        </div>
        <div class="go-now-title">${bestNow ? esc(bestNow.name) : "Lettura in corso…"}</div>
        ${mainSignals ? `<div class="quick-explain smart-signals">${esc(mainSignals)}</div>` : ""}
        <div class="quick-desc">${bestNow ? esc(getBestPracticalLine(bestNow)) : "Sto calcolando il miglior spot del momento."}</div>
        <div class="sunset-chip-row">
          ${bestNow && getDistanceLabel(bestNow) ? `<div class="mini-chip blue">📍 ${esc(getDistanceLabel(bestNow))}</div>` : ""}
          <div class="mini-chip ${chipClassFromFit(bestNow?.weatherFit)}">${bestNow?.weatherFit?.label || "meteo in lettura"}</div>
        </div>
      </div>
    `;

    // ── Due card alternative ───────────────────────────────────────────────
    const altCards = (alt1 || alt2) ? `
      <div class="go-now-alts">
        ${alt1 ? `
          <div class="go-now-alt glass tap" data-quick-id="${esc(alt1.id)}">
            <div class="quick-label go-now-alt-label">👌 Ottima alternativa</div>
            <div class="go-now-alt-name">${esc(alt1.name)}</div>
            ${alt1Signals ? `<div class="go-now-alt-explain smart-signals">${esc(alt1Signals)}</div>` : ""}
            <div class="quick-desc go-now-alt-desc">${esc(getBestPracticalLine(alt1))}</div>
            <div class="sunset-chip-row">
              ${getDistanceLabel(alt1) ? `<div class="mini-chip blue">${esc(getDistanceLabel(alt1))}</div>` : ""}
              ${alt1.weatherFit ? `<div class="mini-chip ${chipClassFromFit(alt1.weatherFit)}">${esc(alt1.weatherFit.label)}</div>` : ""}
              ${alt1.experience?.wow ? `<div class="mini-chip gold">Wow ${esc(String(alt1.experience.wow))}</div>` : ""}
            </div>
          </div>
        ` : ""}
        ${alt2 ? `
          <div class="go-now-alt glass tap" data-quick-id="${esc(alt2.id)}">
            <div class="quick-label go-now-alt-label">👍 Piano B</div>
            <div class="go-now-alt-name">${esc(alt2.name)}</div>
            ${alt2Signals ? `<div class="go-now-alt-explain smart-signals">${esc(alt2Signals)}</div>` : ""}
            <div class="quick-desc go-now-alt-desc">${esc(getBestPracticalLine(alt2))}</div>
            <div class="sunset-chip-row">
              ${getDistanceLabel(alt2) ? `<div class="mini-chip blue">${esc(getDistanceLabel(alt2))}</div>` : ""}
              ${alt2.weatherFit ? `<div class="mini-chip ${chipClassFromFit(alt2.weatherFit)}">${esc(alt2.weatherFit.label)}</div>` : ""}
              ${alt2.experience?.wow ? `<div class="mini-chip gold">Wow ${esc(String(alt2.experience.wow))}</div>` : ""}
            </div>
          </div>
        ` : ""}
      </div>
    ` : "";

    // ── Card tramonto ──────────────────────────────────────────────────────
    const sunsetCard = `
      <div class="quick-card glass sunset-card tap" data-quick-id="${bestSunset ? esc(bestSunset.id) : ""}">
        <div class="quick-label">Tramonto premium</div>
        <div class="quick-title">${bestSunset ? esc(bestSunset.name) : "—"}</div>
        <div class="quick-desc">${bestSunset ? esc(bestSunset.tip || bestSunset.whenToGo?.note || bestSunset.desc || "") : "In attesa della lettura luce."}</div>
        <div class="sunset-chip-row" style="margin-top:12px">
          <div class="mini-chip gold" id="sunsetClockChip">Tramonto —</div>
          <div class="mini-chip blue" id="sunPhaseChip">Luce da leggere</div>
          ${bestSunset?.experience?.wow ? `<div class="mini-chip gold">Wow ${esc(String(bestSunset.experience.wow))}/10</div>` : ""}
        </div>
        <div class="sunset-countdown" style="margin-top:12px">
          <div style="min-width:0;flex:1 1 auto">
            <div class="sunset-countdown-main" id="sunsetCountdownMain">Sto leggendo la luce di oggi</div>
            <div class="sunset-countdown-sub" id="sunsetCountdownSub">Fra poco trovi countdown e stato tramonto.</div>
          </div>
          <div class="sunset-countdown-time" id="sunsetCountdownTime">—</div>
        </div>
      </div>
    `;

    return mainCard + altCards + sunsetCard;
  }

  function buildSailQuickCards(app) {
    const bestToday  = window.APP_UTILS.getBestSpotToday();
    const bestSunset = window.APP_UTILS.getBestSunsetSpot();
    const sailSpots  = window.APP_UTILS.getAllSpotsWithMeta()
      .filter(s => s.sailMeta?.enabled && s.sailMeta?.nightShelter)
      .sort((a, b) => (b.sailMeta?.score || 0) - (a.sailMeta?.score || 0));
    const bestNight = sailSpots[0] || null;

    return `
      <div class="quick-card glass best tap">
        <div class="quick-label">Spot vela oggi</div>
        <div class="quick-title">${bestToday ? esc(bestToday.name) : "—"}</div>
        <div class="quick-desc">${bestToday?.sailMeta?.enabled ? esc(bestToday.sailMeta.detailText || "Compatibilità live") : "Nessun dato vela negli spot attuali."}</div>
        <div class="sunset-chip-row">
          <div class="mini-chip blue">Sail</div>
          ${bestToday?.sailMeta?.label ? `<div class="mini-chip gold">${esc(bestToday.sailMeta.label)}</div>` : ""}
        </div>
      </div>

      <div class="quick-card glass tap">
        <div class="quick-label">Riparo notte</div>
        <div class="quick-title">${bestNight ? esc(bestNight.name) : "—"}</div>
        <div class="quick-desc">${bestNight?.sailMeta?.enabled ? esc(bestNight.sailMeta.detailText || "Buon riparo per la notte.") : "Nessun riparo notte disponibile nei dati."}</div>
      </div>

      <div class="quick-card glass sunset-card tap">
        <div class="quick-label">Spot serale</div>
        <div class="quick-title">${bestSunset ? esc(bestSunset.name) : "—"}</div>
        <div class="quick-desc">${bestSunset?.sailMeta?.enabled ? esc(bestSunset.sailMeta.sunsetText || "Spot forte per serata e luce.") : "Nessun dato sail sunset nei dati attuali."}</div>
        <div class="sunset-chip-row" style="margin-top:12px">
          <div class="mini-chip gold">Onde ${app.marineData ? Number(app.marineData.waveHeight || 0).toFixed(1) + " m" : "—"}</div>
          <div class="mini-chip blue">Dir ${app.weatherData ? Math.round(app.weatherData.windDir || 0) + "°" : "—"}</div>
        </div>
        <div class="sunset-countdown" style="margin-top:12px">
          <div style="min-width:0;flex:1 1 auto">
            <div class="sunset-countdown-main">Sail mode attiva</div>
            <div class="sunset-countdown-sub">Aggiungi spot con dati sail per una lettura live migliore.</div>
          </div>
          <div class="sunset-countdown-time">${app.weatherData ? Math.round(app.weatherData.wind || 0) + " km/h" : "—"}</div>
        </div>
      </div>
    `;
  }

  function renderQuickGrid(app) {
    const box = $("quickGrid");
    if (!box) return;
    box.innerHTML = app.mode === "sail" ? buildSailQuickCards(app) : buildTravelQuickCards(app);
    box.querySelectorAll("[data-quick-id]").forEach(card => {
      card.addEventListener("click", () => {
        const id = card.dataset.quickId;
        if (!id) return;
        const spot = APP_SPOTS.spots.find(s => s.id === id);
        if (spot) { window.APP_UTILS.showSpotDetail(spot); window.APP_UTILS.switchPage("detail"); }
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATS GRID
  // ═══════════════════════════════════════════════════════════════════════════

  function renderStatsGrid(app) {
    const box = $("statsGrid");
    if (!box) return;
    if (!app.weatherData) {
      box.innerHTML = `
        <div class="stat"><div class="k">Temperatura</div><div class="v">—</div></div>
        <div class="stat"><div class="k">Vento</div><div class="v">—</div></div>
        <div class="stat"><div class="k">Nuvole</div><div class="v">—</div></div>
        <div class="stat"><div class="k">Pioggia</div><div class="v">—</div></div>
      `;
      return;
    }
    if (app.mode === "sail") {
      box.innerHTML = `
        <div class="stat"><div class="k">Vento</div><div class="v">${Math.round(app.weatherData.wind)} km/h</div></div>
        <div class="stat"><div class="k">Direzione</div><div class="v">${Math.round(app.weatherData.windDir)}°</div></div>
        <div class="stat"><div class="k">Raffiche</div><div class="v">${Math.round(app.weatherData.gust)} km/h</div></div>
        <div class="stat"><div class="k">Onde</div><div class="v">${app.marineData ? Number(app.marineData.waveHeight || 0).toFixed(1) + " m" : "—"}</div></div>
      `;
    } else {
      const altCard = (app.userPos && typeof app.userPos.altitude === "number")
        ? `<div class="stat"><div class="k">Altitudine</div><div class="v">${Math.round(app.userPos.altitude)} m</div></div>`
        : "";
      box.innerHTML = `
        <div class="stat"><div class="k">Temperatura</div><div class="v">${Math.round(app.weatherData.temp)}°</div></div>
        <div class="stat"><div class="k">Vento</div><div class="v">${Math.round(app.weatherData.wind)} km/h</div></div>
        <div class="stat"><div class="k">Nuvole</div><div class="v">${Math.round(app.weatherData.cloud)}%</div></div>
        <div class="stat"><div class="k">Pioggia</div><div class="v">${Math.round(app.weatherData.rain)}%</div></div>
        ${altCard}
      `;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SUN PHASE
  // ═══════════════════════════════════════════════════════════════════════════

  UI.renderSunPhase = function () {
    const data = window.APP_UTILS.getSunPhaseInfo();
    const ids  = ["sunsetClockChip","sunPhaseChip","sunsetCountdownMain","sunsetCountdownSub","sunsetCountdownTime"];
    const vals = [data.clockText, data.phaseText, data.mainText, data.subText, data.timeText];
    ids.forEach((id, i) => { const el = $(id); if (el) el.textContent = vals[i]; });
    _startSunCountdownTick();
  };

  let _sunCountdownInterval = null;
  function _startSunCountdownTick() {
    if (_sunCountdownInterval) clearInterval(_sunCountdownInterval);
    _sunCountdownInterval = setInterval(_tickSunCountdown, 1000);
  }

  function _tickSunCountdown() {
    const el = $("sunsetCountdownTime");
    if (!el) return;
    const sunTimes = window.APP && window.APP.sunTimes;
    if (!sunTimes) return;
    const now     = new Date();
    const sunset  = sunTimes.sunset instanceof Date ? sunTimes.sunset : new Date(sunTimes.sunset);
    const diffMs  = sunset - now;
    if (isNaN(diffMs)) return;
    if (diffMs <= 0) { el.textContent = "Tramontato"; return; }
    const totalMin = Math.floor(diffMs / 60000);
    const h        = Math.floor(totalMin / 60);
    const m        = totalMin % 60;
    el.textContent = h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HOURLY STRIP
  // ═══════════════════════════════════════════════════════════════════════════

  function hourlyMood(item) {
    let score = 0;
    if (item.rain <= 20)       score += 3;
    else if (item.rain <= 40)  score += 1;
    else                       score -= 3;
    if (item.cloud <= 35)      score += 2;
    else if (item.cloud >= 80) score -= 2;
    if (item.wind <= 18)       score += 2;
    else if (item.wind > 28)   score -= 2;
    if (score >= 4)  return { cls: "good", label: "finestra buona",  emoji: "✨" };
    if (score <= -1) return { cls: "bad",  label: "finestra debole", emoji: "⚠️" };
    return { cls: "warn", label: "così così", emoji: "⛅" };
  }

  function renderHourly(app) {
    const strip = $("hourlyStrip");
    const main  = $("hourlySummaryMain");
    const sub   = $("hourlySummarySub");
    if (!strip) return;
    if (!app.hourlyData.length) {
      strip.innerHTML = `<div class="detail-empty">Previsione non disponibile.</div>`;
      if (main) main.textContent = "Previsione oraria non disponibile.";
      if (sub)  sub.textContent  = "Non sono riuscito a leggere le prossime ore.";
      return;
    }

    const good  = app.hourlyData.filter(h => hourlyMood(h).cls === "good").length;
    const total = app.hourlyData.length;
    if (main) main.textContent = good >= total * 0.6
      ? `Prossime ore favorevoli — ${good} finestre buone su ${total}`
      : good >= total * 0.3
        ? `Giornata mista — alcune finestre buone`
        : `Condizioni difficili nelle prossime ore`;
    if (sub) sub.textContent = app.hourlyData[0]
      ? `Ora: ${Math.round(app.hourlyData[0].temp)}° · vento ${Math.round(app.hourlyData[0].wind)} km/h · pioggia ${Math.round(app.hourlyData[0].rain)}%`
      : "";

    strip.innerHTML = app.hourlyData.slice(0, 12).map(item => {
      const mood = hourlyMood(item);
      const d    = item.date instanceof Date ? item.date : new Date(item.date || item.time || 0);
      const hStr = isNaN(d.getTime()) ? "—" : d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
      return `
        <div class="hour-card ${mood.cls}">
          <div class="hour-top">
            <span class="hour-time">${hStr}</span>
            <span class="hour-emoji">${mood.emoji}</span>
          </div>
          <div class="hour-line"><span class="hour-label">Temp</span><strong>${Math.round(item.temp)}°</strong></div>
          <div class="hour-line"><span class="hour-label">Vento</span><strong>${Math.round(item.wind)} km/h</strong></div>
          <div class="hour-line"><span class="hour-label">Pioggia</span><strong>${Math.round(item.rain)}%</strong></div>
          <div class="hour-pill ${mood.cls}">${mood.label}</div>
        </div>
      `;
    }).join("");
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FILTER BARS
  // ═══════════════════════════════════════════════════════════════════════════

  function getAvailableZones() {
    const zones    = APP_SPOTS.zones || [];
    const spotZones = new Set((APP_SPOTS.spots || []).map(s => s.zone).filter(Boolean));
    return zones.filter(z => spotZones.has(z.id));
  }

  function getAvailableActivities() {
    const activities    = APP_SPOTS.activities || [];
    const spotActivities = new Set((APP_SPOTS.spots || []).map(s => s.activity).filter(Boolean));
    return activities.filter(a => spotActivities.has(a.id));
  }

  function renderFilterBars(app) {
    const mapQuickFilters = $("mapQuickFilters");
    const levelChips      = $("levelChips");
    const lightChips      = $("lightChips");
    const zoneChips       = $("zoneChips");
    const activityChips   = $("activityChips");
    const favoriteChips   = $("favoriteChips");
    const distanceChips   = $("distanceChips");
    const sailChips       = $("sailChips");

    if (mapQuickFilters) {
      mapQuickFilters.innerHTML = `
        <button class="chip ${app.mapQuickFilter === "all"       ? "active" : ""}" data-mapquick="all"       type="button">Tutti</button>
        <button class="chip ${app.mapQuickFilter === "wow"       ? "active" : ""}" data-mapquick="wow"       type="button">Wow</button>
        <button class="chip ${app.mapQuickFilter === "sunset"    ? "active" : ""}" data-mapquick="sunset"    type="button">Tramonto</button>
        <button class="chip ${app.mapQuickFilter === "alba"      ? "active" : ""}" data-mapquick="alba"      type="button">Alba</button>
        <button class="chip ${app.mapQuickFilter === "favorites" ? "active" : ""}" data-mapquick="favorites" type="button">Preferiti</button>
      `;
      mapQuickFilters.querySelectorAll("[data-mapquick]").forEach(btn => {
        btn.addEventListener("click", () => {
          app.mapQuickFilter = btn.dataset.mapquick;
          if (window.APP_UTILS?.renderMarkers) window.APP_UTILS.renderMarkers();
          mapQuickFilters.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c.dataset.mapquick === app.mapQuickFilter));
        });
      });
    }

    if (levelChips) {
      levelChips.innerHTML = `
        <button class="chip ${app.level === "all"       ? "active" : ""}" data-level="all"       type="button">Tutti</button>
        <button class="chip ${app.level === "core"      ? "active" : ""}" data-level="core"      type="button">Top</button>
        <button class="chip ${app.level === "secondary" ? "active" : ""}" data-level="secondary" type="button">Belli</button>
        <button class="chip ${app.level === "extra"     ? "active" : ""}" data-level="extra"     type="button">Extra</button>
      `;
      levelChips.querySelectorAll("[data-level]").forEach(btn => {
        btn.addEventListener("click", () => { app.level = btn.dataset.level; UI.smartRender(app, "light"); });
      });
    }

    if (lightChips) {
      lightChips.innerHTML = `
        <button class="chip ${app.light === "all"      ? "active" : ""}" data-light="all"      type="button">Tutta la luce</button>
        <button class="chip ${app.light === "alba"     ? "active" : ""}" data-light="alba"     type="button">Alba</button>
        <button class="chip ${app.light === "tramonto" ? "active" : ""}" data-light="tramonto" type="button">Tramonto</button>
        <button class="chip ${app.light === "giorno"   ? "active" : ""}" data-light="giorno"   type="button">Giorno</button>
      `;
      lightChips.querySelectorAll("[data-light]").forEach(btn => {
        btn.addEventListener("click", () => { app.light = btn.dataset.light; UI.smartRender(app, "light"); });
      });
    }

    if (zoneChips) {
      const zones = getAvailableZones();
      zoneChips.innerHTML =
        `<button class="chip ${app.zone === "all" ? "active" : ""}" data-zone="all" type="button">Tutte le zone</button>` +
        zones.map(z => `<button class="chip ${app.zone === z.id ? "active" : ""}" data-zone="${esc(z.id)}" type="button">${esc(z.label)}</button>`).join("");
      zoneChips.querySelectorAll("[data-zone]").forEach(btn => {
        btn.addEventListener("click", () => { app.zone = btn.dataset.zone; UI.smartRender(app, "light"); });
      });
    }

    if (activityChips) {
      const activities = getAvailableActivities();
      activityChips.innerHTML =
        `<button class="chip ${app.activity === "all" ? "active" : ""}" data-activity="all" type="button">Tutte</button>` +
        activities.map(a => `<button class="chip ${app.activity === a.id ? "active" : ""}" data-activity="${esc(a.id)}" type="button">${a.emoji ? a.emoji + " " : ""}${esc(a.label)}</button>`).join("");
      activityChips.querySelectorAll("[data-activity]").forEach(btn => {
        btn.addEventListener("click", () => { app.activity = btn.dataset.activity; UI.smartRender(app, "light"); });
      });
    }

    if (favoriteChips) {
      favoriteChips.innerHTML = `
        <button class="chip ${app.favoritesFilter === "all"       ? "active" : ""}" data-favoritesfilter="all"       type="button">Tutti</button>
        <button class="chip ${app.favoritesFilter === "favorites" ? "active" : ""}" data-favoritesfilter="favorites" type="button">Solo preferiti</button>
      `;
      favoriteChips.querySelectorAll("[data-favoritesfilter]").forEach(btn => {
        btn.addEventListener("click", () => { app.favoritesFilter = btn.dataset.favoritesfilter; UI.smartRender(app, "light"); });
      });
    }

    if (distanceChips) {
      if (!app.userPos) {
        distanceChips.innerHTML = `<span style="font-size:12px;color:var(--muted);padding:4px 0">Attiva GPS per filtrare per distanza</span>`;
      } else {
        distanceChips.innerHTML = `
          <button class="chip ${app.distanceFilter === "all" ? "active" : ""}" data-dist="all" type="button">Tutti</button>
          <button class="chip ${app.distanceFilter === "5"   ? "active" : ""}" data-dist="5"   type="button">≤ 5 km</button>
          <button class="chip ${app.distanceFilter === "10"  ? "active" : ""}" data-dist="10"  type="button">≤ 10 km</button>
          <button class="chip ${app.distanceFilter === "15"  ? "active" : ""}" data-dist="15"  type="button">≤ 15 km</button>
        `;
        distanceChips.querySelectorAll("[data-dist]").forEach(btn => {
          btn.addEventListener("click", () => { app.distanceFilter = btn.dataset.dist; UI.smartRender(app, "light"); });
        });
      }
    }

    if (sailChips) {
      sailChips.innerHTML = `
        <button class="chip ${app.sailFilter === "all"       ? "active" : ""}" data-sailfilter="all"       type="button">Tutti</button>
        <button class="chip ${app.sailFilter === "compat"    ? "active" : ""}" data-sailfilter="compat"    type="button">Compatibili oggi</button>
        <button class="chip ${app.sailFilter === "sail"      ? "active" : ""}" data-sailfilter="sail"      type="button">Vela</button>
        <button class="chip ${app.sailFilter === "night"     ? "active" : ""}" data-sailfilter="night"     type="button">Riparo notte</button>
        <button class="chip ${app.sailFilter === "beautiful" ? "active" : ""}" data-sailfilter="beautiful" type="button">Spot belli</button>
      `;
      sailChips.querySelectorAll("[data-sailfilter]").forEach(btn => {
        btn.addEventListener("click", () => { app.sailFilter = btn.dataset.sailfilter; UI.smartRender(app, "light"); });
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MAP LEGEND
  // ═══════════════════════════════════════════════════════════════════════════

  function renderLegend(app) {
    const box = $("mapLegend");
    if (!box) return;
    box.innerHTML = app.mode === "sail"
      ? `
        <div class="legend-item"><span class="legend-dot legend-blue"></span> Spot vela</div>
        <div class="legend-item"><span class="legend-dot legend-gold"></span> Spot belli / top acqua</div>
        <div class="legend-item"><span class="legend-dot legend-pink"></span> Spot serali</div>
        <div class="legend-item"><span class="legend-dot" style="background:#36c275"></span> Riparo notte</div>
      `
      : `
        <div class="legend-item"><span class="legend-dot legend-gold"></span> Wow</div>
        <div class="legend-item"><span class="legend-dot legend-pink"></span> Tramonto / Alba</div>
        <div class="legend-item"><span class="legend-dot legend-blue"></span> Altri spot</div>
        <div class="legend-item"><span class="legend-dot" style="background:#2d8eff;border:2px solid white"></span> La tua posizione</div>
      `;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TOP LIST
  // ═══════════════════════════════════════════════════════════════════════════

  function renderTopLists(app) {
    const wowBox    = $("topWowList");
    const sunsetBox = $("topSunsetList");
    if (!wowBox || !sunsetBox) return;

    let wowSpots = [];
    if (APP_SPOTS.topWowNames?.length) {
      wowSpots = APP_SPOTS.topWowNames.map(name => APP_SPOTS.spots.find(s => s.name === name)).filter(Boolean);
    } else {
      wowSpots = [...APP_SPOTS.spots].filter(s => s.experience?.wow).sort((a, b) => (b.experience?.wow || 0) - (a.experience?.wow || 0)).slice(0, 10);
    }

    let sunsetSpots = [];
    if (APP_SPOTS.topSunsetNames?.length) {
      sunsetSpots = APP_SPOTS.topSunsetNames.map(name => APP_SPOTS.spots.find(s => s.name === name)).filter(Boolean);
    } else {
      sunsetSpots = [...APP_SPOTS.spots].filter(s => { const l = (s.light || "").toLowerCase(); return l === "tramonto" || l === "sera"; })
        .sort((a, b) => (b.experience?.wow || 0) - (a.experience?.wow || 0)).slice(0, 10);
    }

    const allSpotsMeta = window.APP_UTILS.getAllSpotsWithMeta();
    const metaById     = new Map(allSpotsMeta.map(s => [s.id, s]));

    const renderCard = spot => {
      const meta = metaById.get(spot.id);
      const fit  = meta?.weatherFit || null;
      return `
        <div class="featured-card tap" data-featured-id="${esc(spot.id)}">
          <div class="featured-card-img" style="background-image:url('${esc(spot.image || "")}')"></div>
          <div class="featured-card-body">
            <div class="featured-card-name">${esc(spot.name)}</div>
            <div class="featured-card-sub">${esc(spot.tip || spot.desc || "")}</div>
            <div class="featured-card-chips">
              ${fit ? `<div class="mini-chip ${chipClassFromFit(fit)}">${esc(fit.label)}</div>` : ""}
              ${spot.experience?.wow ? `<div class="mini-chip gold">Wow ${esc(String(spot.experience.wow))}/10</div>` : ""}
              <div class="mini-chip blue">${esc(pretty(spot.activity))}</div>
            </div>
          </div>
        </div>
      `;
    };

    wowBox.innerHTML    = wowSpots.map(renderCard).join("");
    sunsetBox.innerHTML = sunsetSpots.map(renderCard).join("");

    [wowBox, sunsetBox].forEach(box => {
      box.querySelectorAll("[data-featured-id]").forEach(card => {
        card.addEventListener("click", () => {
          const spot = APP_SPOTS.spots.find(s => s.id === card.dataset.featuredId);
          if (spot) { window.APP_UTILS.showSpotDetail(spot); window.APP_UTILS.switchPage("detail"); }
        });
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SPOT LIST
  // ═══════════════════════════════════════════════════════════════════════════

  function renderSpotList(app) {
    const box  = $("spotList");
    const note = $("resultNote");
    if (!box) return;

    const items = window.APP_UTILS.getFilteredSpots();

    if (note) {
      note.textContent = app.search
        ? (items.length ? `${items.length} risultato${items.length !== 1 ? "i" : ""} per "${app.search}"` : `Nessuno spot trovato per "${app.search}"`)
        : `${items.length} spot${app.level !== "all" || app.zone !== "all" || app.activity !== "all" ? " (filtrati)" : ""}`;
    }

    if (!items.length) {
      box.innerHTML = `<div class="detail-empty">Nessuno spot corrisponde ai filtri o alla ricerca attuale.</div>`;
      return;
    }

    box.innerHTML = items.map(s => {
      const fit    = s.weatherFit;
      const sail   = s.sailMeta;
      const isCore = s.level === "core";
      const tags   = (s.tags || []).slice(0, 3);
      return `
        <div class="spot-card glass tap" data-spot-id="${esc(s.id)}">
          <div class="spot-head">
            <div>
              <div class="spot-name">${esc(s.name)}</div>
              <div class="spot-sub">${esc(pretty(s.zone))} · ${esc(pretty(s.activity))} · ${esc(pretty(s.light))}</div>
            </div>
            <button class="fav-btn tap" data-fav-id="${esc(s.id)}" type="button">${favIcon(s.id)}</button>
          </div>
          <div class="spot-meta">
            ${isCore ? `<span class="tag gold">Top</span>` : ""}
            ${fit    ? `<span class="tag ${chipClassFromFit(fit)}">${esc(fit.label)}</span>` : ""}
            ${s.experience?.wow ? `<span class="tag gold">Wow ${esc(String(s.experience.wow))}/10</span>` : ""}
            ${s.difficulty ? `<span class="tag">${esc(pretty(s.difficulty))}</span>` : ""}
            ${app.mode === "sail" && sail?.enabled ? `<span class="tag blue">Vela ${esc(sail.label)}</span>` : ""}
            ${tags.map(t => `<span class="tag spot-tag">${esc(t)}</span>`).join("")}
          </div>
          <div class="spot-desc">${esc(s.tip || s.desc || "")}</div>
          ${s.distance != null ? `<div class="spot-dist">${esc(window.APP_UTILS.displayDistance(s.distance))}</div>` : ""}
        </div>
      `;
    }).join("");

    box.querySelectorAll("[data-spot-id]").forEach(card => {
      card.addEventListener("click", e => {
        if (e.target.closest("[data-fav-id]")) return;
        const enriched = window.APP_UTILS.getAllSpotsWithMeta().find(s => s.id === card.dataset.spotId)
                      || APP_SPOTS.spots.find(s => s.id === card.dataset.spotId);
        if (enriched) { window.APP_UTILS.showSpotDetail(enriched); window.APP_UTILS.switchPage("detail"); }
      });
    });

    box.querySelectorAll("[data-fav-id]").forEach(btn => {
      btn.addEventListener("click", e => { e.stopPropagation(); window.APP_UTILS.toggleFavorite(btn.dataset.favId); });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SPOT DETAIL
  // ═══════════════════════════════════════════════════════════════════════════

  function renderExperienceSection(spot) {
    const exp = spot.experience;
    if (!exp) return "";
    return `
      <div class="detail-section"><h3>Esperienza</h3>
        <div class="detail-grid">
          ${exp.tipo  ? `<div class="detail-box"><div class="k">Tipo</div><div class="v">${esc(exp.tipo)}</div></div>` : ""}
          ${exp.tempo ? `<div class="detail-box"><div class="k">Durata</div><div class="v">${esc(exp.tempo)}</div></div>` : ""}
          ${exp.mood  ? `<div class="detail-box"><div class="k">Mood</div><div class="v">${esc(pretty(exp.mood))}</div></div>` : ""}
          ${exp.wow   ? `<div class="detail-box"><div class="k">Wow</div><div class="v">${esc(String(exp.wow))}/10</div></div>` : ""}
        </div>
      </div>
    `;
  }

  function renderWhenSection(spot) {
    if (!spot.whenToGo) return "";
    return `
      <div class="detail-section"><h3>Quando andare</h3>
        <p>Momento migliore: <strong>${esc(pretty(spot.whenToGo.best))}</strong>${spot.whenToGo.note ? ` — ${esc(spot.whenToGo.note)}` : ""}</p>
      </div>
    `;
  }

  function renderAccessSection(spot) {
    const acc = spot.access;
    if (!acc) return "";
    return `
      <div class="detail-section"><h3>Accesso</h3>
        <div class="detail-grid">
          ${acc.difficolta ? `<div class="detail-box"><div class="k">Difficoltà</div><div class="v">${esc(pretty(acc.difficolta))}</div></div>` : ""}
          ${acc.parcheggio ? `<div class="detail-box"><div class="k">Parcheggio</div><div class="v">${esc(acc.parcheggio)}</div></div>` : ""}
          ${acc.walk       ? `<div class="detail-box"><div class="k">A piedi</div><div class="v">${esc(acc.walk)}</div></div>` : ""}
          ${acc.strada     ? `<div class="detail-box"><div class="k">Strada</div><div class="v">${esc(acc.strada)}</div></div>` : ""}
        </div>
      </div>
    `;
  }

  function renderCrowdSection(spot) {
    if (!spot.crowd) return "";
    return `
      <div class="detail-section"><h3>Folla</h3>
        ${spot.crowd.best  ? `<p>Meglio: ${esc(spot.crowd.best)}</p>`  : ""}
        ${spot.crowd.worst ? `<p>Peggio: ${esc(spot.crowd.worst)}</p>` : ""}
      </div>
    `;
  }

  function renderArrayAsList(title, arr) {
    if (!arr?.length) return "";
    return `
      <div class="detail-section"><h3>${title}</h3>
        <ul>${arr.map(item => `<li style="color:var(--muted);font-size:14px;line-height:1.5;margin-bottom:4px">${esc(item)}</li>`).join("")}</ul>
      </div>
    `;
  }

  function renderSpotTags(spot) {
    if (!spot.tags?.length) return "";
    return `
      <div class="detail-section"><h3>Tag</h3>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${spot.tags.map(t => `<span class="tag spot-tag">${esc(t)}</span>`).join("")}
        </div>
      </div>
    `;
  }

  UI.renderSpotDetail = function (app, spot) {
    const box = $("spotDetail") || $("detailBox");
    if (!box || !spot) return;

    const fit  = spot.weatherFit || null;
    const dist = spot.distance   != null ? spot.distance : null;
    const sail = spot.sailMeta   || null;

    box.innerHTML = `
      ${spot.image ? `
        <div class="detail-hero" style="background-image:url('${esc(spot.image)}')">
          <div class="detail-hero-inner">
            <h2 class="detail-title">${esc(spot.name)}</h2>
            <div class="detail-sub">${esc(pretty(spot.zone))} · ${esc(pretty(spot.activity))}</div>
          </div>
        </div>
      ` : `
        <div style="margin-bottom:12px">
          <h2 class="detail-title" style="margin:0 0 4px">${esc(spot.name)}</h2>
          <div class="detail-sub">${esc(pretty(spot.zone))} · ${esc(pretty(spot.activity))}</div>
        </div>
      `}

      <div class="detail-grid">
        <div class="detail-box"><div class="k">Zona</div><div class="v">${esc(pretty(spot.zone))}</div></div>
        <div class="detail-box"><div class="k">Luce</div><div class="v">${esc(pretty(spot.light))}</div></div>
        <div class="detail-box"><div class="k">Livello</div><div class="v">${esc(pretty(spot.level))}</div></div>
        <div class="detail-box"><div class="k">Difficoltà</div><div class="v">${esc(pretty(spot.difficulty || "—"))}</div></div>
        ${fit  ? `<div class="detail-box"><div class="k">Meteo adesso</div><div class="v">${esc(fit.label)}</div></div>` : ""}
        ${dist != null ? `<div class="detail-box"><div class="k">Distanza</div><div class="v">${esc(window.APP_UTILS.displayDistance(dist))}</div></div>` : ""}
        ${app.mode === "sail" && sail?.enabled ? `<div class="detail-box"><div class="k">Vela</div><div class="v">${esc(sail.label)}</div></div>` : ""}
        ${spot.altitude != null ? `<div class="detail-box"><div class="k">Altitudine</div><div class="v">${Math.round(spot.altitude)} m</div></div>` : ""}
      </div>

      ${spot.desc ? `<div class="detail-section"><p style="margin:0;font-size:15px;line-height:1.55;color:#deebf6">${esc(spot.desc)}</p></div>` : ""}
      ${spot.tip  ? `<div class="detail-section"><h3>Consiglio principale</h3><p>${esc(spot.tip)}</p></div>` : ""}

      ${renderExperienceSection(spot)}
      ${renderWhenSection(spot)}
      ${renderAccessSection(spot)}
      ${renderCrowdSection(spot)}
      ${renderArrayAsList("Quando evitare", spot.whenToAvoid)}
      ${renderArrayAsList("Smart tips", spot.smartTips)}
      ${renderSpotTags(spot)}

      ${spot.longDescription ? `<div class="detail-section"><h3>Dettaglio extra</h3><p>${esc(spot.longDescription)}</p></div>` : ""}
      ${spot.photoTips       ? `<div class="detail-section"><h3>Consiglio foto</h3><p>${esc(spot.photoTips)}</p></div>` : ""}
      ${spot.weatherNote     ? `<div class="detail-section"><h3>Nota meteo</h3><p>${esc(spot.weatherNote)}</p></div>` : ""}
      ${app.mode === "sail" && sail?.enabled ? `<div class="detail-section"><h3>Sezione vela</h3><p>${esc(sail.detailText || "Spot compatibile con modalità vela.")}</p></div>` : ""}

      <div class="detail-section"><h3>Azioni</h3>
        <div class="action-grid">
          <button class="btn btn-primary tap"  id="detailMapBtn"  type="button">Apri sulla mappa</button>
          <a class="btn btn-secondary tap" href="https://www.google.com/maps?q=${spot.lat},${spot.lon}" target="_blank" rel="noopener noreferrer">Apri in Google Maps</a>
          <button class="btn btn-secondary tap" id="detailFavBtn" type="button">${isFavorite(spot.id) ? "Rimuovi preferito" : "Salva preferito"}</button>
          <a class="btn btn-secondary tap" href="https://www.google.com/search?q=${encodeURIComponent(spot.name + " " + (APP_SPOTS.region || ""))}&tbm=isch" target="_blank" rel="noopener noreferrer">Vedi foto reali</a>
        </div>
      </div>
    `;

    $("detailMapBtn")?.addEventListener("click", () => window.APP_UTILS.centerSpot(spot.id));
    $("detailFavBtn")?.addEventListener("click", () => window.APP_UTILS.toggleFavorite(spot.id));
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PLANNER BOX
  // ═══════════════════════════════════════════════════════════════════════════

  UI.renderPlannerBox = function (app) {
    const box = $("plannerBox");
    if (!box) return;
    const slots = [
      { key: "alba",     title: "Alba / mattina",                                               hint: "Tappa iniziale della giornata." },
      { key: "main",     title: app.mode === "sail" ? "Spot principale" : "Attività centrale",  hint: "Cuore della giornata." },
      { key: "tramonto", title: "Tramonto / chiusura",                                          hint: "Finale forte o rilassato." }
    ];
    box.innerHTML = slots.map(slot => {
      const spot = slot.key in app.planner && app.planner[slot.key]
        ? APP_SPOTS.spots.find(s => s.id === app.planner[slot.key])
        : null;
      if (!spot) {
        return `<div class="planner-slot tap"><div class="planner-slot-head"><div class="planner-slot-title">${slot.title}</div></div><div class="planner-slot-sub">${slot.hint}</div></div>`;
      }
      return `
        <div class="planner-slot tap">
          <div class="planner-slot-head">
            <div class="planner-slot-title">${slot.title}</div>
            <button class="btn btn-secondary tap" data-clear-slot="${slot.key}" type="button" style="width:auto;padding:8px 12px">Rimuovi</button>
          </div>
          <div class="planner-slot-name">${esc(spot.name)}</div>
          <div class="planner-slot-sub">${esc(spot.tip || spot.desc || "")}</div>
        </div>
      `;
    }).join("");
    box.querySelectorAll("[data-clear-slot]").forEach(btn => {
      btn.addEventListener("click", () => window.APP_UTILS.clearPlannerSlot(btn.dataset.clearSlot));
    });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // NEARBY PANEL — versione premium
  // ═══════════════════════════════════════════════════════════════════════════

  function renderNearbyPanel(app) {
    let panel = $("nearbyPanel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id        = "nearbyPanel";
      panel.className = "panel glass";
      // Inserisce dopo quickGrid, prima del meteo
      const anchor = $("quickGrid");
      if (anchor) anchor.insertAdjacentElement("afterend", panel);
      else {
        const homeSection = document.querySelector("#page-home .stack");
        if (homeSection) homeSection.prepend(panel);
      }
    }

    // GPS non disponibile
    if (!app.userPos || !Number.isFinite(app.userPos.lat) || !Number.isFinite(app.userPos.lon)) {
      panel.innerHTML = `
        <div class="panel-head">
          <h2>📍 Vicino a te</h2>
          <span class="tiny muted">GPS</span>
        </div>
        <div class="detail-empty" style="padding:12px 0">Attiva il GPS per vedere gli spot vicini</div>
      `;
      return;
    }

    const allClosest = window.APP_UTILS.getClosestSpots ? window.APP_UTILS.getClosestSpots(10) : [];

    if (!allClosest.length) {
      panel.innerHTML = `
        <div class="panel-head">
          <h2>📍 Vicino a te</h2>
          <span class="tiny muted">GPS attivo</span>
        </div>
        <div class="detail-empty" style="padding:12px 0">Sto cercando spot vicini...</div>
      `;
      return;
    }

    const allMeta  = window.APP_UTILS.getAllSpotsWithMeta();
    const metaById = new Map(allMeta.map(s => [s.id, s]));

    function estimateDriveTime(spot) {
      if (spot.distance == null) return null;
      const avgSpeed = { montagna: 25, nord: 30, est: 35, ovest: 35, sud: 40 };
      const speed    = avgSpeed[spot.zone] || 38;
      const min      = Math.round((spot.distance / speed) * 60);
      if (min < 60) return `~${min} min`;
      const h = Math.floor(min / 60);
      const m = min % 60;
      return m > 0 ? `~${h}h ${m}m` : `~${h}h`;
    }

    function buildRow(spot) {
      const meta      = metaById.get(spot.id) || spot;
      const fit       = meta.weatherFit || null;
      const distLbl   = window.APP_UTILS.displayDistance(spot.distance);
      const driveLbl  = estimateDriveTime(spot);
      const zoneLbl   = spot.zone     ? pretty(spot.zone)     : null;
      const actLbl    = spot.activity ? pretty(spot.activity) : null;
      const shortDesc = spot.tip || spot.desc || null;
      return `
        <div class="nearby-card glass tap" data-nearby-id="${esc(spot.id)}">
          <div class="nearby-card-top">
            <div class="nearby-card-name">${esc(spot.name)}</div>
            ${fit ? `<div class="mini-chip ${chipClassFromFit(fit)}">${esc(fit.label)}</div>` : ""}
          </div>
          ${(zoneLbl || actLbl) ? `<div class="nearby-card-sub">${[zoneLbl, actLbl].filter(Boolean).map(esc).join(" · ")}</div>` : ""}
          <div class="nearby-card-badges">
            <div class="mini-chip blue">📍 ${esc(distLbl)}</div>
            ${driveLbl ? `<div class="mini-chip">🚗 ${esc(driveLbl)}</div>` : ""}
            ${spot.altitude != null ? `<div class="mini-chip">${Math.round(spot.altitude)} m</div>` : ""}
          </div>
          ${shortDesc ? `<div class="nearby-card-desc">${esc(shortDesc)}</div>` : ""}
        </div>
      `;
    }

    const first3  = allClosest.slice(0, 3);
    const rest    = allClosest.slice(3);
    const hasMore = rest.length > 0;

    panel.innerHTML = `
      <div class="panel-head">
        <h2>📍 Vicino a te</h2>
        <span class="tiny muted">Spot più vicini</span>
      </div>
      <div class="nearby-list" id="nearbyList">
        ${first3.map(buildRow).join("")}
      </div>
      ${hasMore ? `
        <div style="margin-top:12px;text-align:center">
          <button class="nearby-expand-btn tap" id="nearbyExpandBtn" type="button">
            Vedi altri spot
          </button>
        </div>
      ` : ""}
    `;

    // Click spot
    panel.querySelectorAll("[data-nearby-id]").forEach(card => {
      card.addEventListener("click", () => {
        const spot = APP_SPOTS.spots.find(s => s.id === card.dataset.nearbyId);
        if (spot) { window.APP_UTILS.showSpotDetail(spot); window.APP_UTILS.switchPage("detail"); }
      });
    });

    // Espandi a 10
    $("nearbyExpandBtn")?.addEventListener("click", () => {
      const list = $("nearbyList");
      if (!list) return;
      list.insertAdjacentHTML("beforeend", rest.map(buildRow).join(""));
      $("nearbyExpandBtn").style.display = "none";
      // Bind click sui nuovi card
      list.querySelectorAll("[data-nearby-id]").forEach(card => {
        if (card._bound) return;
        card._bound = true;
        card.addEventListener("click", () => {
          const spot = APP_SPOTS.spots.find(s => s.id === card.dataset.nearbyId);
          if (spot) { window.APP_UTILS.showSpotDetail(spot); window.APP_UTILS.switchPage("detail"); }
        });
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPORT / IMPORT UI
  // ═══════════════════════════════════════════════════════════════════════════

  function renderDataPanel() {
    const target = $("plannerBox")?.closest(".panel.glass");
    if (!target || $("dataPanel")) return;
    const panel     = document.createElement("div");
    panel.id        = "dataPanel";
    panel.className = "panel glass";
    panel.innerHTML = `
      <div class="panel-head">
        <h2>Dati personali</h2>
        <span class="tiny muted">Preferiti</span>
      </div>
      <div class="planner-actions" style="grid-template-columns:1fr 1fr;gap:10px;margin-top:0">
        <button class="btn btn-secondary tap" id="exportDataBtn" type="button">⬇ Esporta dati</button>
        <button class="btn btn-secondary tap" id="importDataBtn" type="button">⬆ Importa dati</button>
      </div>
      <input type="file" id="importDataInput" accept=".json" style="display:none">
      <div id="dataHint" style="margin-top:10px;font-size:12px;color:var(--muted);line-height:1.5">
        Esporta preferiti e planner come file JSON. Importa un backup precedente.
      </div>
    `;
    target.insertAdjacentElement("afterend", panel);
    $("exportDataBtn")?.addEventListener("click", () => window.APP_UTILS.downloadUserData());
    $("importDataBtn")?.addEventListener("click", () => $("importDataInput")?.click());
    $("importDataInput")?.addEventListener("change", e => {
      const file = e.target.files?.[0];
      if (file) { window.APP_UTILS.importUserDataFromFile(file); e.target.value = ""; }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GPS BOX
  // ═══════════════════════════════════════════════════════════════════════════

  UI.renderGpsBox = function (app, liveData) {
    const gpsSpeed    = $("gpsSpeed");
    const gpsHeading  = $("gpsHeading");
    const gpsDistance = $("gpsDistance");
    const gpsPoints   = $("gpsPoints");
    if (!gpsSpeed || !gpsHeading || !gpsDistance || !gpsPoints) return;

    if (!liveData) {
      gpsSpeed.textContent = gpsHeading.textContent = gpsDistance.textContent = gpsPoints.textContent = "—";
      return;
    }

    let totalDistance = 0;
    for (let i = 1; i < app.gpsPath.length; i++) {
      totalDistance += haversineKm(app.gpsPath[i-1][0], app.gpsPath[i-1][1], app.gpsPath[i][0], app.gpsPath[i][1]);
    }
    gpsDistance.textContent = `${totalDistance.toFixed(2)} km`;
    gpsPoints.textContent   = String(app.gpsPath.length);
    gpsSpeed.textContent    = liveData.speedMs  != null ? `${(liveData.speedMs * 3.6).toFixed(1)} km/h` : "—";
    gpsHeading.textContent  = liveData.heading  != null ? `${toCompass(liveData.heading)} · ${liveData.heading.toFixed(0)}°` : "—";
  };

  function toCompass(deg) {
    if (deg == null || isNaN(deg)) return "—";
    return ["N","NE","E","SE","S","SW","W","NW"][Math.round(deg / 45) % 8];
  }

  function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLon = (lon2-lon1)*Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TOAST
  // ═══════════════════════════════════════════════════════════════════════════

  UI.toast = function (message) {
    const wrap = $("toastWrap");
    if (!wrap) return;
    const el = document.createElement("div");
    el.className   = "toast";
    el.textContent = message;
    wrap.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0"; el.style.transform = "translateY(8px)";
      setTimeout(() => el.remove(), 180);
    }, 2200);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER ALL / LIGHT / SMART
  // ═══════════════════════════════════════════════════════════════════════════

  let lastFullRender = 0;

  UI.renderAll = function (app) {
    const now    = Date.now();
    const doFull = (now - lastFullRender) > 1500;

    if (doFull) {
      lastFullRender = now;
      const counts = getSpotCounts();

      $("eyebrowRegion") && ($("eyebrowRegion").textContent = `${APP_SPOTS.region || "Area"} · ${counts.main} spot principali${counts.extra ? ` + ${counts.extra} extra` : ""}`);
      $("conditionsTitle") && ($("conditionsTitle").textContent = app.mode === "sail" ? "Condizioni vela" : "Meteo e mood del giorno");
      $("conditionsSub")   && ($("conditionsSub").textContent   = app.mode === "sail" ? "Sail" : "Travel");
      $("forecastTitle")   && ($("forecastTitle").textContent   = app.mode === "sail" ? "Previsione oraria vela · prossime 12 ore" : "Previsione oraria · prossime 12 ore");
      $("forecastSub")     && ($("forecastSub").textContent     = app.mode === "sail" ? "Vento · direzione · onde" : "Lettura rapida");
      $("topBox1Sub")   && ($("topBox1Sub").textContent   = app.mode === "sail" ? "Spot belli / forti" : "I più forti del posto");
      $("topBox1Title") && ($("topBox1Title").textContent = app.mode === "sail" ? "Top spot belli" : "Top wow");
      $("topBox2Sub")   && ($("topBox2Sub").textContent   = "Luce serale");
      $("topBox2Title") && ($("topBox2Title").textContent = "Top tramonti");

      document.querySelectorAll(".sail-only").forEach(el => { el.style.display = app.mode === "sail" ? "" : "none"; });
      if ($("travelFilters")) $("travelFilters").style.display = app.mode === "sail" ? "none" : "";
      if ($("sailFilters"))   $("sailFilters").style.display   = app.mode === "sail" ? ""     : "";

      renderStatsGrid(app);
      renderHourly(app);
      renderFilterBars(app);
      renderLegend(app);
      renderTopLists(app);
      UI.renderGpsBox(app, app.liveGpsData || null);
      renderDataPanel();
      renderNearbyPanel(app);

      if ($("weatherAlert")) {
        if (!app.weatherData) {
          $("weatherAlert").className   = "alert warn";
          $("weatherAlert").textContent = "Meteo non disponibile.";
        } else if (app.mode === "sail") {
          $("weatherAlert").className   = "alert ok";
          $("weatherAlert").textContent = app.marineData
            ? `Vento ${Math.round(app.weatherData.wind)} km/h · onde ${Number(app.marineData.waveHeight || 0).toFixed(1)} m`
            : "Lettura vela aggiornata.";
        } else {
          $("weatherAlert").className   = "alert ok";
          $("weatherAlert").textContent = `${app.weatherData.headline} — ${app.weatherData.advice}`;
        }
      }

      if (app.mode === "travel") UI.renderSunPhase(app);
    }

    renderQuickGrid(app);
    renderSpotList(app);
    if (app.currentSpot) UI.renderSpotDetail(app, app.currentSpot);
  };

  UI.renderLight = function (app) {
    renderQuickGrid(app);
    renderSpotList(app);
    renderNearbyPanel(app);
    if (app.currentSpot) UI.renderSpotDetail(app, app.currentSpot);
  };

  UI.smartRender = function (app, type = "light") {
    if (type === "full") UI.renderAll(app);
    else                 UI.renderLight(app);
  };

  window.UI = UI;
})();
