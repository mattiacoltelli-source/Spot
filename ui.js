(function () {
  "use strict";

  const UI = {};

  function $(id) {
    return document.getElementById(id);
  }

  function esc(v) {
    return window.APP_UTILS.escapeHtml(v);
  }

  function isFavorite(id) {
    return window.APP_UTILS.isFavorite(id);
  }

  function quickCard(title, name, desc, extraHtml = "", extraClass = "") {
    return `
      <div class="quick-card glass tap ${extraClass}">
        <div class="quick-label">${title}</div>
        <div class="quick-title">${name ? esc(name) : "—"}</div>
        <div class="quick-desc">${desc ? esc(desc) : "—"}</div>
        ${extraHtml}
      </div>
    `;
  }

  function renderQuickGrid(app) {
    const box = $("quickGrid");
    if (!box) return;

    const bestToday = window.APP_UTILS.getBestSpotToday();
    const bestWow = window.APP_UTILS.getBestWowSpot();
    const bestSunset = window.APP_UTILS.getBestSunsetSpot();

    if (app.mode === "sail") {
      const sailSpots = window.APP_UTILS.getAllSpotsWithMeta()
        .filter(s => s.sailMeta?.enabled && s.sailMeta?.nightShelter)
        .sort((a, b) => (b.sailMeta?.score || 0) - (a.sailMeta?.score || 0));

      const bestNight = sailSpots[0] || null;

      box.innerHTML =
        quickCard(
          "Spot vela oggi",
          bestToday?.name,
          bestToday?.sailMeta?.enabled ? (bestToday.sailMeta.detailText || "Compatibilità live.") : "Nessun dato vela presente negli spot attuali.",
          `<div class="sunset-chip-row">
            <div class="mini-chip blue">⛵ Sail</div>
            <div class="mini-chip gold">${esc(bestToday?.sailMeta?.label || "n/d")}</div>
          </div>`,
          "best"
        ) +
        quickCard(
          "Riparo notte",
          bestNight?.name,
          bestNight?.sailMeta?.enabled ? (bestNight.sailMeta.detailText || "Buon riparo per la notte.") : "Nessun riparo notte nei dati attuali."
        ) +
        quickCard(
          "Spot serale",
          bestSunset?.name,
          bestSunset?.sailMeta?.enabled ? (bestSunset.sailMeta.sunsetText || "Spot interessante per serata e luce.") : "Nessun dato sail sunset nei dati attuali.",
          `<div class="sunset-chip-row">
            <div class="mini-chip gold">🌊 Onde ${app.marineData ? Number(app.marineData.waveHeight || 0).toFixed(1) + " m" : "—"}</div>
            <div class="mini-chip blue">🧭 ${app.weatherData ? Math.round(app.weatherData.windDir || 0) + "°" : "—"}</div>
          </div>`,
          "sunset-card"
        );
      return;
    }

    box.innerHTML =
      quickCard(
        "Spot del giorno",
        bestToday?.name,
        bestToday?.desc || "In attesa del meteo.",
        `<div class="sunset-chip-row">
          <div class="mini-chip blue">Travel</div>
          <div class="mini-chip gold">${esc(bestToday?.weatherFit?.label || "lettura in corso")}</div>
        </div>`,
        "best"
      ) +
      quickCard(
        "Wow spot",
        bestWow?.name,
        bestWow?.tip || bestWow?.desc || "I posti più forti visivamente."
      ) +
      quickCard(
        "Tramonto premium",
        bestSunset?.name,
        bestSunset?.tip || bestSunset?.desc || "In attesa della lettura luce.",
        `<div class="sunset-chip-row">
          <div class="mini-chip gold" id="sunsetClockChip">🌇 Tramonto —</div>
          <div class="mini-chip blue" id="sunPhaseChip">✨ Luce da leggere</div>
        </div>
        <div class="sunset-countdown">
          <div>
            <div class="sunset-countdown-main" id="sunsetCountdownMain">Sto leggendo la luce di oggi</div>
            <div class="sunset-countdown-sub" id="sunsetCountdownSub">Fra poco trovi countdown e stato tramonto.</div>
          </div>
          <div class="sunset-countdown-time" id="sunsetCountdownTime">—</div>
        </div>`,
        "sunset-card"
      );
  }

  UI.renderSunPhase = function () {
    const data = window.APP_UTILS.getSunPhaseInfo();

    if ($("sunsetClockChip")) $("sunsetClockChip").textContent = data.clockText;
    if ($("sunPhaseChip")) $("sunPhaseChip").textContent = data.phaseText;
    if ($("sunsetCountdownMain")) $("sunsetCountdownMain").textContent = data.mainText;
    if ($("sunsetCountdownSub")) $("sunsetCountdownSub").textContent = data.subText;
    if ($("sunsetCountdownTime")) $("sunsetCountdownTime").textContent = data.timeText;
  };

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
      box.innerHTML = `
        <div class="stat"><div class="k">Temperatura</div><div class="v">${Math.round(app.weatherData.temp)}°</div></div>
        <div class="stat"><div class="k">Vento</div><div class="v">${Math.round(app.weatherData.wind)} km/h</div></div>
        <div class="stat"><div class="k">Nuvole</div><div class="v">${Math.round(app.weatherData.cloud)}%</div></div>
        <div class="stat"><div class="k">Pioggia</div><div class="v">${Math.round(app.weatherData.rain)}%</div></div>
      `;
    }
  }

  function renderWeatherAlert(app) {
    const box = $("weatherAlert");
    if (!box) return;

    if (!app.weatherData) {
      box.className = "alert warn";
      box.textContent = "Meteo non disponibile.";
      return;
    }

    if (app.mode === "sail") {
      const waveText = app.marineData ? `Onde ${Number(app.marineData.waveHeight || 0).toFixed(1)} m` : "Onde n/d";
      let cls = "ok";
      if ((app.weatherData.wind || 0) >= 32 || (app.marineData?.waveHeight || 0) >= 1.8) cls = "warn";
      if ((app.weatherData.wind || 0) >= 45 || (app.marineData?.waveHeight || 0) >= 2.6) cls = "danger";
      box.className = `alert ${cls}`;
      box.textContent = `${waveText} · direzione ${Math.round(app.weatherData.windDir || 0)}° · raffiche ${Math.round(app.weatherData.gust || 0)} km/h`;
      return;
    }

    let cls = "ok";
    if ((app.weatherData.rain || 0) >= 55 || (app.weatherData.wind || 0) >= 32) cls = "warn";
    if ((app.weatherData.rain || 0) >= 70 || (app.weatherData.wind || 0) >= 45) cls = "danger";

    box.className = `alert ${cls}`;
    box.textContent = `${app.weatherData.headline} — ${app.weatherData.advice}`;
  }

  function hourlyMood(item) {
    let score = 0;
    if (item.rain <= 20) score += 3;
    else if (item.rain <= 40) score += 1;
    else score -= 3;

    if (item.cloud <= 35) score += 2;
    else if (item.cloud >= 80) score -= 2;

    if (item.wind <= 18) score += 2;
    else if (item.wind > 28) score -= 2;

    if (score >= 4) return { cls: "good", label: "finestra buona", emoji: "✨" };
    if (score <= -1) return { cls: "bad", label: "finestra debole", emoji: "⚠️" };
    return { cls: "warn", label: "così così", emoji: "⛅" };
  }

  function renderHourly(app) {
    const strip = $("hourlyStrip");
    const main = $("hourlySummaryMain");
    const sub = $("hourlySummarySub");
    if (!strip) return;

    if (!app.hourlyData.length) {
      strip.innerHTML = `<div class="detail-empty">Previsione non disponibile.</div>`;
      if (main) main.textContent = "Previsione oraria non disponibile.";
      if (sub) sub.textContent = "Non sono riuscito a leggere le prossime ore.";
      return;
    }

    const bestHour = app.hourlyData[0];
    const hourText = String(bestHour.date.getHours()).padStart(2, "0") + ":00";

    if (main) {
      main.textContent = app.mode === "sail"
        ? `Finestra letta: ${hourText} · vento, direzione e onde`
        : `Finestra letta: ${hourText} · prossime 12 ore`;
    }

    if (sub) {
      sub.textContent = app.mode === "sail"
        ? "In Sail mode leggi soprattutto vento, direzione e altezza onde."
        : "Lettura rapida di meteo e comfort delle prossime ore.";
    }

    strip.innerHTML = app.hourlyData.map(item => {
      const mood = hourlyMood(item);
      const hh = String(item.date.getHours()).padStart(2, "0") + ":00";

      if (app.mode === "sail") {
        return `
          <div class="hour-card ${mood.cls}">
            <div class="hour-top">
              <div class="hour-time">${hh}</div>
              <div class="hour-emoji">${mood.emoji}</div>
            </div>
            <div class="hour-line"><span class="hour-label">Vento</span><strong>${Math.round(item.wind)} km/h</strong></div>
            <div class="hour-line"><span class="hour-label">Dir</span><strong>${Math.round(item.windDir)}°</strong></div>
            <div class="hour-line"><span class="hour-label">Onde</span><strong>${Number(item.waveHeight || 0).toFixed(1)} m</strong></div>
            <div class="hour-line"><span class="hour-label">Periodo</span><strong>${Number(item.wavePeriod || 0).toFixed(1)} s</strong></div>
            <div class="hour-pill ${mood.cls}">${mood.label}</div>
          </div>
        `;
      }

      return `
        <div class="hour-card ${mood.cls}">
          <div class="hour-top">
            <div class="hour-time">${hh}</div>
            <div class="hour-emoji">${mood.emoji}</div>
          </div>
          <div class="hour-line"><span class="hour-label">Temp</span><strong>${Math.round(item.temp)}°</strong></div>
          <div class="hour-line"><span class="hour-label">Vento</span><strong>${Math.round(item.wind)} km/h</strong></div>
          <div class="hour-line"><span class="hour-label">Pioggia</span><strong>${Math.round(item.rain)}%</strong></div>
          <div class="hour-line"><span class="hour-label">Nuvole</span><strong>${Math.round(item.cloud)}%</strong></div>
          <div class="hour-pill ${mood.cls}">${mood.label}</div>
        `;
    }).join("");
  }

  function chipButton(label, attr, value, active) {
    return `<button class="chip ${active ? "active" : ""}" data-${attr}="${value}" type="button">${label}</button>`;
  }

  function renderFilterBars(app) {
    const mapQuickFilters = $("mapQuickFilters");
    const levelChips = $("levelChips");
    const lightChips = $("lightChips");
    const zoneChips = $("zoneChips");
    const activityChips = $("activityChips");
    const favoriteChips = $("favoriteChips");
    const sailChips = $("sailChips");

    mapQuickFilters.innerHTML =
      chipButton("Tutti", "mapquick", "all", app.mapQuickFilter === "all") +
      chipButton("Wow", "mapquick", "wow", app.mapQuickFilter === "wow") +
      chipButton("Tramonti", "mapquick", "sunset", app.mapQuickFilter === "sunset") +
      chipButton("Albe", "mapquick", "alba", app.mapQuickFilter === "alba") +
      chipButton("Preferiti", "mapquick", "favorites", app.mapQuickFilter === "favorites");

    levelChips.innerHTML =
      chipButton("Tutti", "level", "all", app.level === "all") +
      chipButton("Top", "level", "core", app.level === "core") +
      chipButton("Belli", "level", "secondary", app.level === "secondary") +
      chipButton("Extra", "level", "extra", app.level === "extra");

    lightChips.innerHTML =
      chipButton("Tutta la luce", "light", "all", app.light === "all") +
      chipButton("Alba", "light", "alba", app.light === "alba") +
      chipButton("Tramonto", "light", "tramonto", app.light === "tramonto") +
      chipButton("Giorno", "light", "giorno", app.light === "giorno");

    zoneChips.innerHTML =
      chipButton("Tutte le zone", "zone", "all", app.zone === "all") +
      chipButton("Nord", "zone", "nord", app.zone === "nord") +
      chipButton("Sud", "zone", "sud", app.zone === "sud") +
      chipButton("Est", "zone", "est", app.zone === "est") +
      chipButton("Ovest", "zone", "ovest", app.zone === "ovest") +
      chipButton("Montagna", "zone", "montagna", app.zone === "montagna");

    activityChips.innerHTML =
      chipButton("Tutte", "activity", "all", app.activity === "all") +
      chipButton("Trekking", "activity", "trekking", app.activity === "trekking") +
      chipButton("MTB", "activity", "mtb", app.activity === "mtb") +
      chipButton("View", "activity", "view", app.activity === "view") +
      chipButton("Relax", "activity", "relax", app.activity === "relax");

    favoriteChips.innerHTML =
      chipButton("Tutti", "favoritesfilter", "all", app.favoritesFilter === "all") +
      chipButton("Solo preferiti", "favoritesfilter", "favorites", app.favoritesFilter === "favorites");

    sailChips.innerHTML =
      chipButton("Tutti", "sailfilter", "all", app.sailFilter === "all") +
      chipButton("Compatibili oggi", "sailfilter", "compat", app.sailFilter === "compat") +
      chipButton("Vela", "sailfilter", "sail", app.sailFilter === "sail") +
      chipButton("Riparo notte", "sailfilter", "night", app.sailFilter === "night") +
      chipButton("Spot belli", "sailfilter", "beautiful", app.sailFilter === "beautiful");

    mapQuickFilters.querySelectorAll("[data-mapquick]").forEach(btn => {
      btn.addEventListener("click", () => {
        app.mapQuickFilter = btn.dataset.mapquick;
        window.APP_UTILS.renderAll();
      });
    });
    levelChips.querySelectorAll("[data-level]").forEach(btn => {
      btn.addEventListener("click", () => {
        app.level = btn.dataset.level;
        window.APP_UTILS.renderAll();
      });
    });
    lightChips.querySelectorAll("[data-light]").forEach(btn => {
      btn.addEventListener("click", () => {
        app.light = btn.dataset.light;
        window.APP_UTILS.renderAll();
      });
    });
    zoneChips.querySelectorAll("[data-zone]").forEach(btn => {
      btn.addEventListener("click", () => {
        app.zone = btn.dataset.zone;
        window.APP_UTILS.renderAll();
      });
    });
    activityChips.querySelectorAll("[data-activity]").forEach(btn => {
      btn.addEventListener("click", () => {
        app.activity = btn.dataset.activity;
        window.APP_UTILS.renderAll();
      });
    });
    favoriteChips.querySelectorAll("[data-favoritesfilter]").forEach(btn => {
      btn.addEventListener("click", () => {
        app.favoritesFilter = btn.dataset.favoritesfilter;
        window.APP_UTILS.renderAll();
      });
    });
    sailChips.querySelectorAll("[data-sailfilter]").forEach(btn => {
      btn.addEventListener("click", () => {
        app.sailFilter = btn.dataset.sailfilter;
        window.APP_UTILS.renderAll();
      });
    });
  }

  function renderLegend(app) {
    const box = $("mapLegend");
    if (!box) return;

    if (app.mode === "sail") {
      box.innerHTML = `
        <div class="legend-item"><span class="legend-dot legend-blue"></span> Spot vela</div>
        <div class="legend-item"><span class="legend-dot legend-gold"></span> Spot belli / top acqua</div>
        <div class="legend-item"><span class="legend-dot legend-pink"></span> Spot serali</div>
        <div class="legend-item"><span class="legend-dot" style="background:#36c275"></span> Riparo notte</div>
      `;
      return;
    }

    box.innerHTML = `
      <div class="legend-item"><span class="legend-dot legend-gold"></span> Wow</div>
      <div class="legend-item"><span class="legend-dot legend-pink"></span> Tramonto</div>
      <div class="legend-item"><span class="legend-dot legend-blue"></span> Altri spot</div>
    `;
  }

  function renderTopLists(app) {
    const wowBox = $("topWowList");
    const sunsetBox = $("topSunsetList");

    const wow = (window.APP_SPOTS.topWowNames || [])
      .map(name => window.APP_SPOTS.spots.find(s => s.name === name))
      .filter(Boolean);

    const sunset = (window.APP_SPOTS.topSunsetNames || [])
      .map(name => window.APP_SPOTS.spots.find(s => s.name === name))
      .filter(Boolean);

    wowBox.innerHTML = wow.map((s, i) => `
      <div class="featured-card tap" data-top-id="${esc(s.id)}">
        <div class="featured-rank">${i + 1}</div>
        <div>
          <div class="featured-name">${esc(s.name)}</div>
          <div class="featured-desc">${esc(s.desc)}</div>
          <div class="featured-badge">${app.mode === "sail" ? "spot bello" : "wow spot"}</div>
        </div>
      </div>
    `).join("");

    sunsetBox.innerHTML = sunset.map((s, i) => `
      <div class="featured-card sunset tap" data-sunset-id="${esc(s.id)}">
        <div class="featured-rank">${i + 1}</div>
        <div>
          <div class="featured-name">${esc(s.name)}</div>
          <div class="featured-desc">${esc(s.desc)}</div>
          <div class="featured-badge">tramonto top</div>
        </div>
      </div>
    `).join("");

    wowBox.querySelectorAll("[data-top-id]").forEach(el => {
      el.addEventListener("click", () => {
        const s = window.APP_SPOTS.spots.find(x => x.id === el.dataset.topId);
        if (s) {
          window.APP_UTILS.showSpotDetail(s);
          window.APP_UTILS.switchPage("detail");
        }
      });
    });

    sunsetBox.querySelectorAll("[data-sunset-id]").forEach(el => {
      el.addEventListener("click", () => {
        const s = window.APP_SPOTS.spots.find(x => x.id === el.dataset.sunsetId);
        if (s) {
          window.APP_UTILS.showSpotDetail(s);
          window.APP_UTILS.switchPage("detail");
        }
      });
    });
  }

  function renderSpotList(app) {
    const items = window.APP_UTILS.getFilteredSpots();
    const box = $("spotList");
    const resultNote = $("resultNote");

    if (resultNote) {
      resultNote.textContent = `${items.length} spot · ${app.mode === "sail" ? "Sail Mode" : "Travel Mode"}`;
    }

    if (!items.length) {
      box.innerHTML = `<div class="detail-empty">Nessuno spot con questi filtri.</div>`;
      return;
    }

    box.innerHTML = items.map(s => `
      <div class="spot-card tap" data-spot-id="${esc(s.id)}">
        <div class="spot-head">
          <div>
            <div class="spot-name">${esc(s.name)}</div>
            <div class="spot-sub">${esc(window.APP_UTILS.displayDistance(s.distance))}</div>
          </div>
          <button class="fav-btn" data-fav-id="${esc(s.id)}" type="button">${isFavorite(s.id) ? "★" : "☆"}</button>
        </div>

        <div class="spot-meta">
          <span class="tag gold">${esc(s.level)}</span>
          <span class="tag blue">${esc(s.zone)}</span>
          <span class="tag">${esc(s.activity)}</span>
          <span class="tag">${esc(s.difficulty)}</span>
          <span class="tag pink">${esc(s.light)}</span>
          ${app.mode === "sail" && s.sailMeta?.enabled ? `<span class="tag blue">vela</span>` : ``}
          ${app.mode === "sail" && s.sailMeta?.nightShelter ? `<span class="tag green">riparo notte</span>` : ``}
          ${app.mode === "sail" && s.sailMeta?.enabled ? `<span class="tag gold">${esc(s.sailMeta.label)}</span>` : ``}
        </div>

        <div class="spot-desc">${esc(s.desc)}</div>
      </div>
    `).join("");

    box.querySelectorAll("[data-spot-id]").forEach(card => {
      card.addEventListener("click", (e) => {
        if (e.target.matches("[data-fav-id]")) return;
        const s = window.APP_SPOTS.spots.find(x => x.id === card.dataset.spotId);
        if (s) {
          window.APP_UTILS.showSpotDetail(s);
          window.APP_UTILS.switchPage("detail");
        }
      });
    });

    box.querySelectorAll("[data-fav-id]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        window.APP_UTILS.toggleFavorite(btn.dataset.favId);
      });
    });
  }

  UI.renderSpotDetail = function (app, spot) {
    const box = $("spotDetail");
    if (!box) return;

    const fit = spot.weatherFit || { label: "n/d" };
    const sail = window.SAIL ? window.SAIL.getSpotSailMeta(spot, app) : null;

    box.innerHTML = `
      <div class="detail-hero" style="background-image:
        linear-gradient(180deg, rgba(4,8,14,.10), rgba(4,8,14,.82)),
        url('${window.APP_UTILS.getSpotImage(spot)}')">
        <div class="detail-hero-inner">
          <h3 class="detail-title">${esc(spot.name)}</h3>
          <div class="detail-sub">${esc(spot.desc)}</div>
        </div>
      </div>

      <div class="detail-grid">
        <div class="detail-box"><div class="k">Livello</div><div class="v">${esc(spot.level)}</div></div>
        <div class="detail-box"><div class="k">Zona</div><div class="v">${esc(spot.zone)}</div></div>
        <div class="detail-box"><div class="k">Luce ideale</div><div class="v">${esc(spot.light)}</div></div>
        <div class="detail-box"><div class="k">Attività</div><div class="v">${esc(spot.activity)}</div></div>
        <div class="detail-box"><div class="k">Difficoltà</div><div class="v">${esc(spot.difficulty)}</div></div>
        <div class="detail-box"><div class="k">Valutazione oggi</div><div class="v">${esc(fit.label)}</div></div>
        ${app.mode === "sail" ? `<div class="detail-box"><div class="k">Vela oggi</div><div class="v">${esc(sail?.label || "n/d")}</div></div>` : ``}
        ${app.mode === "sail" ? `<div class="detail-box"><div class="k">Onde</div><div class="v">${app.marineData ? Number(app.marineData.waveHeight || 0).toFixed(1) + " m" : "—"}</div></div>` : ``}
      </div>

      <div class="detail-section">
        <h3>Consiglio pratico</h3>
        <p>${esc(spot.tip || "Nessun consiglio aggiuntivo disponibile.")}</p>
      </div>

      ${spot.longDescription ? `<div class="detail-section"><h3>Dettaglio extra</h3><p>${esc(spot.longDescription)}</p></div>` : ``}
      ${spot.photoTips ? `<div class="detail-section"><h3>Consiglio foto</h3><p>${esc(spot.photoTips)}</p></div>` : ``}
      ${app.mode === "sail" && sail?.enabled ? `<div class="detail-section"><h3>Sezione vela</h3><p>${esc(sail.detailText || "Spot compatibile con modalità vela.")}</p></div>` : ``}

      <div class="detail-section">
        <h3>Azioni</h3>
        <div class="action-grid">
          <button class="btn btn-primary tap" id="detailMapBtn" type="button">Apri sulla mappa</button>
          <a class="btn btn-secondary tap" href="https://www.google.com/maps?q=${spot.lat},${spot.lon}" target="_blank" rel="noopener noreferrer">Apri in Google Maps</a>
          <button class="btn btn-secondary tap" id="detailFavBtn" type="button">${isFavorite(spot.id) ? "Rimuovi preferito" : "Salva preferito"}</button>
          <a class="btn btn-secondary tap" href="https://www.google.com/search?q=${encodeURIComponent(spot.name + " " + (window.APP_SPOTS.region || ""))}&tbm=isch" target="_blank" rel="noopener noreferrer">Vedi foto reali</a>
          <button class="btn btn-secondary tap" id="detailAlbaBtn" type="button">Aggiungi ad Alba</button>
          <button class="btn btn-secondary tap" id="detailMainBtn" type="button">Aggiungi ad Attività</button>
          <button class="btn btn-secondary tap" id="detailSunsetBtn" type="button">Aggiungi a Tramonto</button>
        </div>
      </div>
    `;

    $("detailMapBtn")?.addEventListener("click", () => window.APP_UTILS.centerSpot(spot.id));
    $("detailFavBtn")?.addEventListener("click", () => window.APP_UTILS.toggleFavorite(spot.id));
    $("detailAlbaBtn")?.addEventListener("click", () => window.APP_UTILS.setPlannerSlot("alba", spot.id));
    $("detailMainBtn")?.addEventListener("click", () => window.APP_UTILS.setPlannerSlot("main", spot.id));
    $("detailSunsetBtn")?.addEventListener("click", () => window.APP_UTILS.setPlannerSlot("tramonto", spot.id));
  };

  UI.renderPlannerBox = function (app) {
    const box = $("plannerBox");
    if (!box) return;

    const slots = [
      { key: "alba", title: "Alba", hint: "Aggiungi uno spot da alba." },
      { key: "main", title: app.mode === "sail" ? "Spot principale" : "Attività", hint: "Aggiungi lo spot centrale della giornata." },
      { key: "tramonto", title: "Tramonto", hint: "Aggiungi la chiusura serale." }
    ];

    box.innerHTML = slots.map(slot => {
      const spotId = app.planner[slot.key];
      const spot = spotId ? window.APP_SPOTS.spots.find(s => s.id === spotId) : null;

      if (!spot) {
        return `
          <div class="planner-slot tap">
            <div class="planner-slot-head"><div class="planner-slot-title">${slot.title}</div></div>
            <div class="planner-slot-sub">${slot.hint}</div>
          </div>
        `;
      }

      return `
        <div class="planner-slot tap">
          <div class="planner-slot-head">
            <div class="planner-slot-title">${slot.title}</div>
            <button class="btn btn-secondary tap" data-clear-slot="${slot.key}" type="button" style="width:auto;padding:8px 12px">Rimuovi</button>
          </div>
          <div class="planner-slot-name">${esc(spot.name)}</div>
          <div class="planner-slot-sub">${esc(spot.desc)}</div>
        </div>
      `;
    }).join("");

    box.querySelectorAll("[data-clear-slot]").forEach(btn => {
      btn.addEventListener("click", () => window.APP_UTILS.clearPlannerSlot(btn.dataset.clearSlot));
    });
  };

  UI.renderGpsBox = function (app, liveData) {
    const gpsSpeed = $("gpsSpeed");
    const gpsHeading = $("gpsHeading");
    const gpsDistance = $("gpsDistance");
    const gpsPoints = $("gpsPoints");
    if (!gpsSpeed || !gpsHeading || !gpsDistance || !gpsPoints) return;

    if (!liveData) {
      gpsSpeed.textContent = "—";
      gpsHeading.textContent = "—";
      gpsDistance.textContent = "0 km";
      gpsPoints.textContent = "0";
      return;
    }

    let totalDistance = 0;
    for (let i = 1; i < app.gpsPath.length; i++) {
      totalDistance += haversineKm(app.gpsPath[i - 1][0], app.gpsPath[i - 1][1], app.gpsPath[i][0], app.gpsPath[i][1]);
    }

    gpsDistance.textContent = `${totalDistance.toFixed(2)} km`;
    gpsPoints.textContent = String(app.gpsPath.length);
    gpsSpeed.textContent = liveData.speedMs != null ? `${(liveData.speedMs * 3.6).toFixed(1)} km/h` : "—";
    gpsHeading.textContent = liveData.heading != null ? `${toCompass(liveData.heading)} · ${liveData.heading.toFixed(0)}°` : "—";
  };

  function toCompass(deg) {
    if (deg == null || isNaN(deg)) return "—";
    const dirs = ["N","NE","E","SE","S","SW","W","NW"];
    return dirs[Math.round(deg / 45) % 8];
  }

  function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  UI.toast = function (message) {
    const wrap = $("toastWrap");
    if (!wrap) return;

    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;
    wrap.appendChild(el);

    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
      setTimeout(() => el.remove(), 180);
    }, 2200);
  };

  UI.renderAll = function (app) {
    $("eyebrowRegion") && ($("eyebrowRegion").textContent = `Zona attiva: ${window.APP_SPOTS.region || "Area"} • ${window.APP_SPOTS.spots.length} spot`);

    $("conditionsTitle") && ($("conditionsTitle").textContent = app.mode === "sail" ? "Condizioni vela" : "Meteo e mood del giorno");
    $("conditionsSub") && ($("conditionsSub").textContent = app.mode === "sail" ? "Sail" : "Travel");
    $("forecastTitle") && ($("forecastTitle").textContent = app.mode === "sail" ? "Previsione oraria vela · prossime 12 ore" : "Previsione oraria · prossime 12 ore");
    $("forecastSub") && ($("forecastSub").textContent = app.mode === "sail" ? "Vento · direzione · onde" : "Lettura rapida");

    $("topBox1Sub") && ($("topBox1Sub").textContent = app.mode === "sail" ? "Spot belli / forti" : "I più forti del posto");
    $("topBox1Title") && ($("topBox1Title").textContent = app.mode === "sail" ? "Top spot belli" : "Top wow");
    $("topBox2Sub") && ($("topBox2Sub").textContent = "Luce serale");
    $("topBox2Title") && ($("topBox2Title").textContent = "Top tramonti");

    document.querySelectorAll(".sail-only").forEach(el => {
      el.style.display = app.mode === "sail" ? "" : "none";
    });

    if ($("travelFilters")) $("travelFilters").style.display = app.mode === "sail" ? "none" : "";
    if ($("sailFilters")) $("sailFilters").style.display = app.mode === "sail" ? "" : "none";

    renderQuickGrid(app);
    renderStatsGrid(app);
    renderWeatherAlert(app);
    renderHourly(app);
    renderFilterBars(app);
    renderLegend(app);
    renderTopLists(app);
    renderSpotList(app);

    if (app.currentSpot) UI.renderSpotDetail(app, app.currentSpot);
    if (app.mode === "travel") UI.renderSunPhase();
  };

  window.UI = UI;
})();