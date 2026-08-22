(function () {
  "use strict";

  const UI = {};

  function $(id) { return document.getElementById(id); }
  function esc(v) { return window.APP_UTILS.escapeHtml(v); }
  function isFavorite(id) { return window.APP_UTILS.isFavorite(id); }
  function favIcon(id) { return isFavorite(id) ? "❤️" : "🤍"; }
  function isVisited(id) { return window.APP_UTILS.isVisited(id); }

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
      alba: "Alba", giorno: "Giorno", tramonto: "Tramonto",
      facile: "Facile", medio: "Medio", impegnativo: "Impegnativo",
      epico: "Epico", iconico: "Iconico", elegante: "Elegante", magico: "Magico",
      romantico: "Romantico", rilassato: "Rilassato", vivace: "Vivace", tranquillo: "Tranquillo"
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

  function buildSmartSignals(spot, app) {
    if (!spot) return "";
    const signals = [];
    const w      = app.weatherData;
    const now    = new Date();
    const sunset = app.sunTimes?.sunset;

    const wow  = spot.experience?.wow || 0;
    const tipo = spot.experience?.tipo || null;
    const mood = spot.experience?.mood || null;
    const best = spot.whenToGo?.best  || null;
    const act  = (Array.isArray(spot.activity) ? spot.activity[0] : spot.activity) || null;
    const diff = spot.difficulty || null;

    if (tipo)                                  signals.push("✨ " + tipo);
    else if (mood)                             signals.push("🎯 " + mood);
    else if (best) {
      const bm = {
        alba:     "🌄 ideale all'alba",
        tramonto: "🌅 ideale al tramonto",
        giorno:   "☀️ ottimo di giorno"
      };
      if (bm[best]) signals.push(bm[best]);
    }

    if (diff && diff !== "medio" && signals.length < 4) {
      if (diff === "facile")           signals.push("🟢 facile da raggiungere");
      else if (diff === "impegnativo") signals.push("🔴 ancoraggio esposto");
    }

    if (act && signals.length < 4) {
      const am = {
        spiaggia: "🏖️ spiaggia",
        borgo:    "🏘️ borgo",
        storico:  "🏛️ storico",
        natura:   "🌿 natura",
        view:     "🔭 vista"
      };
      if (am[act]) signals.push(am[act]);
    }

    if (wow >= 10 && signals.length < 4)     signals.push("🔥 wow massimo");
    else if (wow >= 9 && signals.length < 4) signals.push("🔥 spot forte");

    if (sunset instanceof Date && signals.length < 4) {
      const diffMin = Math.floor((sunset - now) / 60000);
      if (diffMin > 0 && diffMin <= 90) signals.push("🌅 tramonto tra " + diffMin + " min");
    }

    if (w && signals.length < 4) {
      if (w.cloud <= 30 && w.rain < 20)  signals.push("🌤️ cielo pulito");
      else if (w.wind >= 30)             signals.push("💨 vento forte");
      else if (w.rain >= 50)             signals.push("🌧️ pioggia probabile");
    }

    return signals.slice(0, 4).join(" · ");
  }

  function visitedBtn(spotId) {
    const visited = isVisited(spotId);
    return `<button
      class="visited-btn${visited ? " visited" : ""}"
      data-visited-id="${esc(spotId)}"
      type="button"
      title="${visited ? "Rimuovi da visitati" : "Segna come visitato"}"
    >${visited ? "✓" : "○"}</button>`;
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

    const mainCard = `
      <div class="go-now-main glass best tap" data-quick-id="${bestNow ? esc(bestNow.id) : ""}">
        <div class="go-now-main-header">
          <div class="quick-label go-now-fire">🔥 Perfetto adesso</div>
          ${bestNow ? visitedBtn(bestNow.id) : ""}
        </div>
        <div class="go-now-title">${bestNow ? esc(bestNow.name) : "Lettura in corso…"}</div>
        ${mainSignals ? `<div class="quick-explain smart-signals">${esc(mainSignals)}</div>` : ""}
        <div class="quick-desc">${bestNow ? esc(getBestPracticalLine(bestNow)) : "Sto calcolando il miglior spot del momento."}</div>
        <div class="sunset-chip-row">
          ${bestNow && getDistanceLabel(bestNow) ? `<div class="mini-chip blue">📍 ${esc(getDistanceLabel(bestNow))}</div>` : ""}
          <div class="mini-chip ${chipClassFromFit(bestNow?.weatherFit)}">${bestNow?.weatherFit?.label || "meteo in lettura"}</div>
          ${bestNow?.experience?.wow ? `<div class="mini-chip gold">Wow ${esc(String(bestNow.experience.wow))}/10</div>` : ""}
        </div>
      </div>
    `;

    const altCards = (alt1 || alt2) ? `
      <div class="go-now-alts">
        ${alt1 ? `
          <div class="go-now-alt glass tap" data-quick-id="${esc(alt1.id)}" style="position:relative">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:4px">
              <div class="quick-label go-now-alt-label">👌 Ottima alternativa</div>
              ${visitedBtn(alt1.id)}
            </div>
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
          <div class="go-now-alt glass tap" data-quick-id="${esc(alt2.id)}" style="position:relative">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:4px">
              <div class="quick-label go-now-alt-label">👍 Piano B</div>
              ${visitedBtn(alt2.id)}
            </div>
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

    const sunsetCard = `
      <div class="quick-card glass sunset-card tap" data-quick-id="${bestSunset ? esc(bestSunset.id) : ""}">
        <div class="sunset-card-header">
          <div class="quick-label">🌅 Tramonto premium</div>
          ${bestSunset ? visitedBtn(bestSunset.id) : ""}
        </div>
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
      card.addEventListener("click", e => {
        if (e.target.closest("[data-visited-id]")) return;
        const id = card.dataset.quickId;
        if (!id) return;
        const spot = APP_SPOTS.spots.find(s => s.id === id);
        if (spot) { window.APP_UTILS.showSpotDetail(spot); window.APP_UTILS.switchPage("detail"); }
      });
    });

    box.querySelectorAll("[data-visited-id]").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const id = btn.dataset.visitedId;
        const alreadyVisited = window.APP_UTILS.isVisited(id);

        if (!alreadyVisited) {
          btn.classList.add("visited");
          btn.textContent = "✓";
          btn.style.pointerEvents = "none";
          setTimeout(() => {
            window.APP_UTILS.toggleVisited(id);
          }, 900);
        } else {
          window.APP_UTILS.toggleVisited(id);
        }
      });
    });
  }

  function renderStatsGrid(app) {
    const box = $("statsGrid");
    if (!box) return;
    if (app._weatherLoading) {
      box.innerHTML = Array.from({ length: 4 }).map(() => `
        <div class="stat"><div class="skel skel-k"></div><div class="skel skel-v"></div></div>
      `).join("");
      return;
    }
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
      box.innerHTML = `
        <div class="stat"><div class="k">Temperatura</div><div class="v">${Math.round(app.weatherData.temp)}°</div></div>
        <div class="stat"><div class="k">Vento</div><div class="v">${Math.round(app.weatherData.wind)} km/h</div></div>
        <div class="stat"><div class="k">Nuvole</div><div class="v">${Math.round(app.weatherData.cloud)}%</div></div>
        <div class="stat"><div class="k">Pioggia</div><div class="v">${Math.round(app.weatherData.rain)}%</div></div>
      `;
    }
  }

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
    if (app._weatherLoading) {
      strip.innerHTML = Array.from({ length: 5 }).map(() => `
        <div class="hour-card">
          <div class="skel skel-title"></div>
          <div class="skel skel-row"></div>
          <div class="skel skel-row"></div>
          <div class="skel skel-row"></div>
          <div class="skel skel-pill"></div>
        </div>
      `).join("");
      if (main) main.textContent = "Sto leggendo la finestra migliore della giornata.";
      if (sub)  sub.textContent  = "Fra poco trovi una lettura rapida delle prossime ore.";
      return;
    }
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
        <button class="chip ${app.mapQuickFilter === "giorno"    ? "active" : ""}" data-mapquick="giorno"    type="button">Giorno</button>
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
        `<button class="chip ${app.zone === "all" ? "active" : ""}" data-zone="all" type="button">Tutte le tappe</button>` +
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
        <button class="chip ${app.sailFilter === "night"     ? "active" : ""}" data-sailfilter="night"     type="button">Riparo notte</button>
      `;
      sailChips.querySelectorAll("[data-sailfilter]").forEach(btn => {
        btn.addEventListener("click", () => { app.sailFilter = btn.dataset.sailfilter; UI.smartRender(app, "light"); });
      });
    }
  }

  function renderLegend(app) {
    const box = $("mapLegend");
    if (!box) return;
    box.innerHTML = `
      <div class="legend-item"><span class="legend-dot legend-gold"></span> Wow</div>
      <div class="legend-item"><span class="legend-dot legend-pink"></span> Tramonto / Sera</div>
      <div class="legend-item"><span class="legend-dot legend-blue"></span> Altri spot</div>
      <div class="legend-item"><span class="legend-dot" style="background:#2d8eff;border:2px solid white"></span> La tua posizione</div>
    `;
  }

  function renderTopLists(app) {
    const wowBox    = $("topWowList");
    const sunsetBox = $("topSunsetList");
    if (!wowBox || !sunsetBox) return;

    let wowSpots = [];
    if (APP_SPOTS.topWowIds?.length) {
      wowSpots = APP_SPOTS.topWowIds.map(id => APP_SPOTS.spots.find(s => s.id === id)).filter(Boolean);
    } else {
      wowSpots = [...APP_SPOTS.spots].sort((a, b) => (b.experience?.wow || 0) - (a.experience?.wow || 0)).slice(0, 10);
    }

    let sunsetSpots = [];
    if (APP_SPOTS.topSunsetIds?.length) {
      sunsetSpots = APP_SPOTS.topSunsetIds.map(id => APP_SPOTS.spots.find(s => s.id === id)).filter(Boolean);
    } else {
      sunsetSpots = [...APP_SPOTS.spots].filter(s => { const l = (s.light || "").toLowerCase(); return l === "tramonto"; })
        .sort((a, b) => (b.experience?.wow || 0) - (a.experience?.wow || 0)).slice(0, 10);
    }

    const allSpotsMeta = window.APP_UTILS.getAllSpotsWithMeta();
    const metaById     = new Map(allSpotsMeta.map(s => [s.id, s]));

    const renderCard = spot => {
      const meta = metaById.get(spot.id);
      const fit  = meta?.weatherFit || null;
      return `
        <div class="featured-card tap" data-featured-id="${esc(spot.id)}" style="position:relative">
          ${isVisited(spot.id) ? '<div class="featured-card-visited">✓</div>' : ""}
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

  function renderSpotList(app) {
    const box  = $("spotList");
    const note = $("resultNote");
    if (!box) return;

    const items = window.APP_UTILS.getFilteredSpots();

    if (note) {
      if (app.search) {
        const countText = items.length
          ? `${items.length} risultato${items.length !== 1 ? "i" : ""} per "${esc(app.search)}"`
          : `Nessuno spot trovato per "${esc(app.search)}"`;
        // Il campo di ricerca è visibile solo in Home: qui offriamo un modo
        // di azzerare il filtro anche da questa pagina.
        note.innerHTML = `${countText} <button type="button" class="result-note-clear tap" id="clearSearchBtn">✕ cancella ricerca</button>`;
        const clearBtn = $("clearSearchBtn");
        if (clearBtn) clearBtn.addEventListener("click", () => window.APP_UTILS.clearSearch());
      } else {
        note.textContent = `${items.length} spot${app.level !== "all" || app.zone !== "all" || app.activity !== "all" ? " (filtrati)" : ""}`;
      }
    }

    if (!items.length) {
      box.innerHTML = `<div class="detail-empty">Nessuno spot corrisponde ai filtri o alla ricerca attuale.</div>`;
      return;
    }

    box.innerHTML = items.map(s => {
      const fit    = s.weatherFit;
      const isCore = s.level === "core";
      const tags   = (s.tags || []).slice(0, 3);
      return `
        <div class="spot-card glass tap" data-spot-id="${esc(s.id)}">
          <div class="spot-head">
            <div>
              <div class="spot-name">${esc(s.name)}${isVisited(s.id) ? '<span class="spot-visited-badge">✓ visitato</span>' : ""}</div>
              <div class="spot-sub">${esc(pretty(s.zone))} · ${esc(pretty(s.activity))} · ${esc(pretty(s.light))}</div>
            </div>
            <button class="fav-btn tap" data-fav-id="${esc(s.id)}" type="button">${favIcon(s.id)}</button>
          </div>
          <div class="spot-meta">
            ${isCore ? `<span class="tag gold">Top</span>` : ""}
            ${fit    ? `<span class="tag ${chipClassFromFit(fit)}">${esc(fit.label)}</span>` : ""}
            ${s.experience?.wow ? `<span class="tag gold">Wow ${esc(String(s.experience.wow))}/10</span>` : ""}
            ${s.difficulty ? `<span class="tag">${esc(pretty(s.difficulty))}</span>` : ""}
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
          ${acc.parcheggio ? `<div class="detail-box"><div class="k">Ormeggio</div><div class="v">${esc(acc.parcheggio)}</div></div>` : ""}
          ${acc.walk       ? `<div class="detail-box"><div class="k">A piedi</div><div class="v">${esc(acc.walk)}</div></div>` : ""}
        </div>
      </div>
    `;
  }

  function renderCrowdSection(spot) {
    if (!spot.crowd) return "";
    return `
      <div class="detail-section"><h3>Affollamento</h3>
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
        <div class="detail-box"><div class="k">Tappa</div><div class="v">${esc(pretty(spot.zone))}</div></div>
        <div class="detail-box"><div class="k">Luce</div><div class="v">${esc(pretty(spot.light))}</div></div>
        <div class="detail-box"><div class="k">Livello</div><div class="v">${esc(pretty(spot.level))}</div></div>
        <div class="detail-box"><div class="k">Difficoltà</div><div class="v">${esc(pretty(spot.difficulty || "—"))}</div></div>
        ${fit  ? `<div class="detail-box"><div class="k">Meteo adesso</div><div class="v">${esc(fit.label)}</div></div>` : ""}
        ${dist != null ? `<div class="detail-box"><div class="k">Distanza</div><div class="v">${esc(window.APP_UTILS.displayDistance(dist))}</div></div>` : ""}
      </div>

      ${spot.desc ? `<div class="detail-section"><p style="margin:0;font-size:15px;line-height:1.55;color:#deebf6">${esc(spot.desc)}</p></div>` : ""}
      ${spot.tip  ? `<div class="detail-section"><h3>Consiglio principale</h3><p>${esc(spot.tip)}</p></div>` : ""}

      ${renderExperienceSection(spot)}
      ${renderWhenSection(spot)}
      ${renderAccessSection(spot)}
      ${renderCrowdSection(spot)}
      ${renderArrayAsList("Quando evitare", spot.whenToAvoid)}
      ${renderArrayAsList("Consigli pratici", spot.smartTips)}
      ${renderSpotTags(spot)}

      ${spot.longDescription ? `<div class="detail-section"><h3>Dettaglio extra</h3><p>${esc(spot.longDescription)}</p></div>` : ""}
      ${spot.photoTips       ? `<div class="detail-section"><h3>Consiglio foto</h3><p>${esc(spot.photoTips)}</p></div>` : ""}

      <div class="detail-section"><h3>Azioni</h3>
        <button class="detail-visited-btn${isVisited(spot.id) ? " visited" : ""}" id="detailVisitedBtn" type="button">
          <span class="detail-visited-icon">${isVisited(spot.id) ? "✓" : "○"}</span>
          <span id="detailVisitedLabel">${isVisited(spot.id) ? "Visitato — tocca per rimuovere" : "Segna come visitato"}</span>
        </button>
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

    $("detailVisitedBtn")?.addEventListener("click", () => {
      window.APP_UTILS.toggleVisited(spot.id);
      const nowVisited = window.APP_UTILS.isVisited(spot.id);
      const btn   = $("detailVisitedBtn");
      const label = $("detailVisitedLabel");
      const icon  = btn?.querySelector(".detail-visited-icon");
      if (btn)   btn.classList.toggle("visited", nowVisited);
      if (icon)  icon.textContent = nowVisited ? "✓" : "○";
      if (label) label.textContent = nowVisited ? "Visitato — tocca per rimuovere" : "Segna come visitato";
    });
  };

  const PLANNER_SLOT_META = [
    { key: "alba",     title: "Alba / mattina",      hint: "Tappa iniziale della giornata." },
    { key: "tappa2",   title: "Tappa 2",              hint: "Seconda tappa del giro." },
    { key: "tappa3",   title: "Tappa 3",              hint: "Terza tappa del giro." },
    { key: "tappa4",   title: "Tappa 4",              hint: "Quarta tappa del giro." },
    { key: "tramonto", title: "Tramonto / chiusura",  hint: "Finale forte o rilassato." }
  ];

  // Menu di assegnazione integrato nella tabella itinerario: null, oppure
  // { type:"forSlot", slotKey } (scegli uno spot per una tappa) oppure
  // { type:"forSpot", spotId } (scegli una tappa per uno spot, es. dalla mappa).
  let plannerPickerMode = null;

  function assignPlannerSlot(app, slotKey, spotId) {
    const occupantId = app.planner[slotKey];
    if (occupantId === spotId) {
      plannerPickerMode = null;
      window.APP_UTILS.clearPlannerSlot(slotKey);
      return;
    }
    if (occupantId) {
      const occupant  = window.APP_UTILS.getSpotById(occupantId);
      const newSpot   = window.APP_UTILS.getSpotById(spotId);
      const slotTitle = PLANNER_SLOT_META.find(s => s.key === slotKey)?.title || slotKey;
      const ok = confirm(`"${slotTitle}" contiene già "${occupant ? occupant.name : "un altro spot"}". Sostituirlo con "${newSpot ? newSpot.name : "questo spot"}"?`);
      if (!ok) return;
    }
    plannerPickerMode = null;
    window.APP_UTILS.setPlannerSlot(slotKey, spotId);
  }

  function plannerSlotPickerHtml(app, slotKey) {
    const occupantId = app.planner[slotKey];
    const rows = APP_SPOTS.spots.map(s => {
      const isCurrent = s.id === occupantId;
      return `
        <button class="planner-picker-row tap${isCurrent ? " is-current" : ""}" data-pick-spot="${s.id}" type="button">
          <span class="planner-picker-row-title">${esc(s.name)}</span>
          <span class="planner-picker-row-state">${isCurrent ? "Qui ora — tocca per togliere" : esc(pretty(s.zone))}</span>
        </button>
      `;
    }).join("");
    return `
      <div class="planner-picker-panel">
        <div class="planner-picker-panel-head">
          <div class="planner-picker-panel-title">Scegli uno spot per «${esc(PLANNER_SLOT_META.find(s => s.key === slotKey)?.title || slotKey)}»</div>
          <button class="planner-picker-close tap" data-close-picker type="button">✕</button>
        </div>
        <div class="planner-picker">${rows}</div>
      </div>
    `;
  }

  function plannerSpotPickerHtml(app, spotId) {
    const spot = window.APP_UTILS.getSpotById(spotId);
    if (!spot) return "";
    const rows = PLANNER_SLOT_META.map(slot => {
      const occupantId = app.planner[slot.key];
      const isCurrent  = occupantId === spotId;
      const occupant   = !isCurrent && occupantId ? window.APP_UTILS.getSpotById(occupantId) : null;
      let state;
      if (isCurrent)      state = "Qui ora — tocca per togliere";
      else if (occupant)  state = `Occupata: ${esc(occupant.name)}`;
      else                state = "Libera — tocca per assegnare";
      return `
        <button class="planner-picker-row tap${isCurrent ? " is-current" : ""}" data-assign-slot="${slot.key}" type="button">
          <span class="planner-picker-row-title">${esc(slot.title)}</span>
          <span class="planner-picker-row-state">${state}</span>
        </button>
      `;
    }).join("");
    return `
      <div class="planner-picker-panel">
        <div class="planner-picker-panel-head">
          <div class="planner-picker-panel-title">Scegli una tappa per «${esc(spot.name)}»</div>
          <button class="planner-picker-close tap" data-close-picker type="button">✕</button>
        </div>
        <div class="planner-picker">${rows}</div>
      </div>
    `;
  }

  UI.renderPlannerBox = function (app) {
    const boxes = [$("plannerBox"), $("plannerBoxMap")].filter(Boolean);
    if (!boxes.length) return;

    if (plannerPickerMode?.type === "forSpot" && !window.APP_UTILS.getSpotById(plannerPickerMode.spotId)) {
      plannerPickerMode = null;
    }
    const topPickerHtml = plannerPickerMode?.type === "forSpot" ? plannerSpotPickerHtml(app, plannerPickerMode.spotId) : "";

    let prevSpot = null;
    const slotsHtml = PLANNER_SLOT_META.map(slot => {
      const spot = slot.key in app.planner && app.planner[slot.key]
        ? APP_SPOTS.spots.find(s => s.id === app.planner[slot.key])
        : null;

      const isOpenHere = plannerPickerMode?.type === "forSlot" && plannerPickerMode.slotKey === slot.key;
      const pickerHtml = isOpenHere ? plannerSlotPickerHtml(app, slot.key) : "";

      if (!spot) {
        const skippedForTime = slot.key === "alba" && new Date().getHours() >= 10;
        const hint = skippedForTime
          ? "L'alba è già passata per oggi: non suggerita, riparti dalla tappa successiva."
          : slot.hint;
        return `
          <div class="planner-slot tap" data-open-slot="${slot.key}">
            <div class="planner-slot-head"><div class="planner-slot-title">${slot.title}</div></div>
            <div class="planner-slot-sub">${hint}</div>
          </div>
          ${pickerHtml}
        `;
      }

      let distanceRow = "";
      if (prevSpot) {
        const [lat1, lon1] = window.APP_UTILS.getCoords(prevSpot);
        const [lat2, lon2] = window.APP_UTILS.getCoords(spot);
        const nm = window.APP_UTILS.distKm(lat1, lon1, lat2, lon2) / 1.852;
        distanceRow = `<div class="planner-distance">⛵ ${nm.toFixed(1)} NM dalla tappa precedente</div>`;
      }
      prevSpot = spot;

      return `
        ${distanceRow}
        <div class="planner-slot tap" data-open-slot="${slot.key}">
          <div class="planner-slot-head">
            <div class="planner-slot-title">${slot.title}</div>
            <button class="btn btn-secondary tap" data-clear-slot="${slot.key}" type="button" style="width:auto;padding:8px 12px">Rimuovi</button>
          </div>
          <div class="planner-slot-name">${esc(spot.name)}</div>
          <div class="planner-slot-sub">${esc(spot.tip || spot.desc || "")}</div>
        </div>
        ${pickerHtml}
      `;
    }).join("");

    const html = topPickerHtml + slotsHtml;
    boxes.forEach(box => { box.innerHTML = html; });

    boxes.forEach(box => {
      box.querySelectorAll("[data-clear-slot]").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          plannerPickerMode = null;
          window.APP_UTILS.clearPlannerSlot(btn.dataset.clearSlot);
        });
      });

      box.querySelectorAll("[data-open-slot]").forEach(card => {
        card.addEventListener("click", () => {
          const key = card.dataset.openSlot;
          plannerPickerMode = (plannerPickerMode?.type === "forSlot" && plannerPickerMode.slotKey === key)
            ? null
            : { type: "forSlot", slotKey: key };
          UI.renderPlannerBox(app);
        });
      });

      box.querySelectorAll("[data-close-picker]").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          plannerPickerMode = null;
          UI.renderPlannerBox(app);
        });
      });

      box.querySelectorAll("[data-assign-slot]").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          assignPlannerSlot(app, btn.dataset.assignSlot, plannerPickerMode.spotId);
        });
      });

      box.querySelectorAll("[data-pick-spot]").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          assignPlannerSlot(app, plannerPickerMode.slotKey, btn.dataset.pickSpot);
        });
      });
    });
  };

  UI.openPlannerPickerForSpot = function (app, spotId) {
    plannerPickerMode = { type: "forSpot", spotId };
    UI.renderPlannerBox(app);
    $("plannerPanelMap")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  function renderNearbyPanel(app) {
    let panel = $("nearbyPanel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id        = "nearbyPanel";
      panel.className = "panel glass";
      const anchor = $("quickGrid");
      if (anchor) anchor.insertAdjacentElement("afterend", panel);
      else {
        const homeSection = document.querySelector("#page-home .stack");
        if (homeSection) homeSection.prepend(panel);
      }
    }

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

    function buildRow(spot) {
      const meta      = metaById.get(spot.id) || spot;
      const fit       = meta.weatherFit || null;
      const distLbl   = window.APP_UTILS.displayDistance(spot.distance);
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

    panel.querySelectorAll("[data-nearby-id]").forEach(card => {
      card.addEventListener("click", () => {
        const spot = APP_SPOTS.spots.find(s => s.id === card.dataset.nearbyId);
        if (spot) { window.APP_UTILS.showSpotDetail(spot); window.APP_UTILS.switchPage("detail"); }
      });
    });

    const expandBtn = $("nearbyExpandBtn");
    if (expandBtn) {
      expandBtn.dataset.restIds = JSON.stringify(rest.map(s => s.id));
      expandBtn.addEventListener("click", () => {
        const list = $("nearbyList");
        if (!list) return;
        const savedIds  = JSON.parse(expandBtn.dataset.restIds || "[]");
        const allMeta2  = window.APP_UTILS.getAllSpotsWithMeta();
        const metaById2 = new Map(allMeta2.map(s => [s.id, s]));
        const restSpots = savedIds.map(id => metaById2.get(id)).filter(Boolean);
        list.insertAdjacentHTML("beforeend", restSpots.map(buildRow).join(""));
        expandBtn.style.display = "none";
        list.querySelectorAll("[data-nearby-id]:not([data-bound])").forEach(card => {
          card.dataset.bound = "1";
          card.addEventListener("click", () => {
            const spot = APP_SPOTS.spots.find(s => s.id === card.dataset.nearbyId);
            if (spot) { window.APP_UTILS.showSpotDetail(spot); window.APP_UTILS.switchPage("detail"); }
          });
        });
      });
    }
  }

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

  let lastFullRender = 0;

  UI.renderAll = function (app, force) {
    const now    = Date.now();
    const doFull = force || (now - lastFullRender) > 1500;

    if (doFull) {
      lastFullRender = now;
      const counts = getSpotCounts();

      $("eyebrowRegion") && ($("eyebrowRegion").textContent = `${APP_SPOTS.region || "Area"} · ${counts.main} spot`);
      $("conditionsTitle") && ($("conditionsTitle").textContent = "Meteo e mare del giorno");
      $("conditionsSub")   && ($("conditionsSub").textContent   = "Rotta");
      $("forecastTitle")   && ($("forecastTitle").textContent   = "Previsione oraria · prossime 12 ore");
      $("forecastSub")     && ($("forecastSub").textContent     = "Lettura rapida");
      $("topBox1Sub")   && ($("topBox1Sub").textContent   = "I più belli della rotta");
      $("topBox1Title") && ($("topBox1Title").textContent = "Top wow");
      $("topBox2Sub")   && ($("topBox2Sub").textContent   = "Luce serale");
      $("topBox2Title") && ($("topBox2Title").textContent = "Top tramonti");

      document.querySelectorAll(".sail-only").forEach(el => { el.style.display = app.mode === "sail" ? "" : "none"; });
      if ($("travelFilters")) $("travelFilters").style.display = app.mode === "sail" ? "none" : "";
      if ($("sailFilters"))   $("sailFilters").style.display   = app.mode === "sail" ? ""     : "none";

      renderStatsGrid(app);
      renderHourly(app);
      renderFilterBars(app);
      renderLegend(app);
      renderTopLists(app);
      renderNearbyPanel(app);

      if ($("weatherAlert")) {
        if (app._weatherLoading) {
          $("weatherAlert").className   = "alert skel-alert";
          $("weatherAlert").textContent = " ";
        } else if (!app.weatherData) {
          $("weatherAlert").className   = "alert warn";
          $("weatherAlert").textContent = "Meteo non disponibile.";
        } else {
          $("weatherAlert").className   = "alert ok";
          $("weatherAlert").textContent = `${app.weatherData.headline} — ${app.weatherData.advice}`;
        }
      }

      UI.renderSunPhase(app);
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
    // Una richiesta esplicita di render "full" (es. cambio Sail/Travel mode)
    // deve sempre applicarsi subito: il throttle qui sopra serve solo a
    // evitare full-render involontari troppo ravvicinati, non a ignorare
    // un cambio di stato che il chiamante ha chiesto apposta di mostrare.
    if (type === "full") UI.renderAll(app, true);
    else                 UI.renderLight(app);
  };

  window.UI = UI;
})();
