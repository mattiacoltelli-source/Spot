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

  function buildTravelQuickCards(app) {
    const bestToday = window.APP_UTILS.getBestSpotToday();
    const bestWow = window.APP_UTILS.getBestWowSpot();
    const bestSunset = window.APP_UTILS.getBestSunsetSpot();

    return `
      <div class="quick-card glass best tap">
        <div class="quick-label">Spot del giorno</div>
        <div class="quick-title">${bestToday ? esc(bestToday.name) : "—"}</div>
        <div class="quick-desc">${bestToday ? esc(bestToday.desc || bestToday.tip || "") : "In attesa del meteo."}</div>

        <div class="sunset-chip-row">
          <div class="mini-chip blue"> Travel</div>
          <div class="mini-chip ${bestToday?.weatherFit?.cls === "green" ? "gold" : "blue"}">${bestToday?.weatherFit?.label || "lettura in corso"}</div>
        </div>
      </div>

      <div class="quick-card glass tap">
        <div class="quick-label">Wow spot</div>
        <div class="quick-title">${bestWow ? esc(bestWow.name) : "—"}</div>
        <div class="quick-desc">${bestWow ? esc(bestWow.tip || bestWow.desc || "") : "I posti più forti visivamente."}</div>
      </div>

      <div class="quick-card glass sunset-card tap">
        <div class="quick-label">Tramonto premium</div>
        <div class="quick-title">${bestSunset ? esc(bestSunset.name) : "—"}</div>
        <div class="quick-desc">${bestSunset ? esc(bestSunset.tip || bestSunset.desc || "") : "In attesa della lettura luce."}</div>

        <div class="sunset-chip-row">
          <div class="mini-chip gold" id="sunsetClockChip"> Tramonto —</div>
          <div class="mini-chip blue" id="sunPhaseChip"> Luce da leggere</div>
        </div>

        <div class="sunset-countdown">
          <div>
            <div class="sunset-countdown-main" id="sunsetCountdownMain">Sto leggendo la luce di oggi</div>
            <div class="sunset-countdown-sub" id="sunsetCountdownSub">Fra poco trovi countdown e stato tramonto.</div>
          </div>
          <div class="sunset-countdown-time" id="sunsetCountdownTime">—</div>
        </div>
      </div>
    `;
  }

  function buildSailQuickCards(app) {
    const bestToday = window.APP_UTILS.getBestSpotToday();
    const bestSunset = window.APP_UTILS.getBestSunsetSpot();

    const sailSpots = window.APP_UTILS.getAllSpotsWithMeta()
      .filter(s => s.sailMeta?.enabled && s.sailMeta?.nightShelter)
      .sort((a, b) => (b.sailMeta?.score || 0) - (a.sailMeta?.score || 0));

    const bestNight = sailSpots[0] || null;

    return `
      <div class="quick-card glass best tap">
        <div class="quick-label">Spot vela oggi</div>
        <div class="quick-title">${bestToday ? esc(bestToday.name) : "—"}</div>
        <div class="quick-desc">${bestToday?.sailMeta?.enabled ? esc(bestToday.sailMeta.detailText || "Compatibilità live") : "Nessun dato vela negli spot attuali."}</div>

        <div class="sunset-chip-row">
          <div class="mini-chip blue"> Sail</div>
          <div class="mini-chip gold">${bestToday?.sailMeta?.label || "n/d"}</div>
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

        <div class="sunset-chip-row">
          <div class="mini-chip gold"> Onde ${app.marineData ? Number(app.marineData.waveHeight || 0).toFixed(1) + " m" : "—"}</div>
          <div class="mini-chip blue"> ${app.weatherData ? Math.round(app.weatherData.windDir || 0) + "°" : "—"}</div>
        </div>

        <div class="sunset-countdown">
          <div>
            <div class="sunset-countdown-main">Sail mode attiva</div>
            <div class="sunset-countdown-sub">Quando aggiungerai spot con dati sail, qui avrai lettura live migliore.</div>
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
  }

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

  UI.renderSunPhase = function (app) {
    const data = window.APP_UTILS.getSunPhaseInfo();

    $("sunsetClockChip") && ($("sunsetClockChip").textContent = data.clockText);
    $("sunPhaseChip") && ($("sunPhaseChip").textContent = data.phaseText);
    $("sunsetCountdownMain") && ($("sunsetCountdownMain").textContent = data.mainText);
    $("sunsetCountdownSub") && ($("sunsetCountdownSub").textContent = data.subText);
    $("sunsetCountdownTime") && ($("sunsetCountdownTime").textContent = data.timeText);
  };

  function hourlyMood(item) {
    let score = 0;
    if (item.rain <= 20) score += 3;
    else if (item.rain <= 40) score += 1;
    else score -= 3;

    if (item.cloud <= 35) score += 2;
    else if (item.cloud >= 80) score -= 2;

    if (item.wind <= 18) score += 2;
    else if (item.wind > 28) score -= 2;

    if (score >= 4) return { cls: "good", label: "finestra buona", emoji: "" };
    if (score <= -1) return { cls: "bad", label: "finestra debole", emoji: "" };
    return { cls: "warn", label: "così così", emoji: "" };
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
    const hh = String(bestHour.date.getHours()).padStart(2, "0") + ":00";

    if (main) {
      main.textContent = app.mode === "sail"
        ? `Finestra letta: ${hh} · vento, direzione e onde`
        : `Finestra letta: ${hh} · prossime 12 ore`;
    }

    if (sub) {
      sub.textContent = app.mode === "sail"
        ? "In Sail mode leggi soprattutto vento, direzione e altezza onde."
        : "Lettura rapida di meteo e comfort delle prossime ore.";
    }

    strip.innerHTML = app.hourlyData.map(item => {
      const mood = hourlyMood(item);
      const hourText = String(item.date.getHours()).padStart(2, "0") + ":00";

      if (app.mode === "sail") {
        return `
          <div class="hour-card ${mood.cls}">
            <div class="hour-top">
              <div class="hour-time">${hourText}</div>
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
            <div class="hour-time">${hourText}</div>
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

  function renderFilterBars(app) {
    const mapQuickFilters = $("mapQuickFilters");
    const levelChips = $("levelChips");
    const lightChips = $("lightChips");
    const zoneChips = $("zoneChips");
    const activityChips = $("activityChips");
    const favoriteChips = $("favoriteChips");
    const sailChips = $("sailChips");

    mapQuickFilters.innerHTML = `
      <button class="chip ${app.mapQuickFilter === "all" ? "active" : ""}" data-mapquick="all" type="button">Tutti</button>
      <button class="chip ${app.mapQuickFilter === "wow" ? "active" : ""}" data-mapquick="wow" type="button">Wow</button>
      <button class="chip ${app.mapQuickFilter === "sunset" ? "active" : ""}" data-mapquick="sunset" type="button">Tramonti</button>
      <button class="chip ${app.mapQuickFilter === "alba" ? "active" : ""}" data-mapquick="alba" type="button">Albe</button>
      <button class="chip ${app.mapQuickFilter === "favorites" ? "active" : ""}" data-mapquick="favorites" type="button">Preferiti</button>
    `;

    levelChips.innerHTML = `
      <button class="chip ${app.level === "all" ? "active" : ""}" data-level="all" type="button">Tutti</button>
      <button class="chip ${app.level === "core" ? "active" : ""}" data-level="core" type="button">Top</button>
      <button class="chip ${app.level === "secondary" ? "active" : ""}" data-level="secondary" type="button">Belli</button>
      <button class="chip ${app.level === "extra" ? "active" : ""}" data-level="extra" type="button">Extra</button>
    `;

    lightChips.innerHTML = `
      <button class="chip ${app.light === "all" ? "active" : ""}" data-light="all" type="button">Tutta la luce</button>
      <button class="chip ${app.light === "alba" ? "active" : ""}" data-light="alba" type="button">Alba</button>
      <button class="chip ${app.light === "tramonto" ? "active" : ""}" data-light="tramonto" type="button">Tramonto</button>
      <button class="chip ${app.light === "giorno" ? "active" : ""}" data-light="giorno" type="button">Giorno</button>
    `;

    zoneChips.innerHTML = `
      <button class="chip ${app.zone === "all" ? "active" : ""}" data-zone="all" type="button">Tutte le zone</button>
      <button class="chip ${app.zone === "nord" ? "active" : ""}" data-zone="nord" type="button">Nord</button>
      <button class="chip ${app.zone === "sud" ? "active" : ""}" data-zone="sud" type="button">Sud</button>
      <button class="chip ${app.zone === "est" ? "active" : ""}" data-zone="est" type="button">Est</button>
      <button class="chip ${app.zone === "ovest" ? "active" : ""}" data-zone="ovest" type="button">Ovest</button>
      <button class="chip ${app.zone === "montagna" ? "active" : ""}" data-zone="montagna" type="button">Montagna</button>
    `;

    activityChips.innerHTML = `
      <button class="chip ${app.activity === "all" ? "active" : ""}" data-activity="all" type="button">Tutte</button>
      <button class="chip ${app.activity === "trekking" ? "active" : ""}" data-activity="trekking" type="button">Trekking</button>
      <button class="chip ${app.activity === "mtb" ? "active" : ""}" data-activity="mtb" type="button">MTB</button>
      <button class="chip ${app.activity === "view" ? "active" : ""}" data-activity="view" type="button">View</button>
      <button class="chip ${app.activity === "relax" ? "active" : ""}" data-activity="relax" type="button">Relax</button>
    `;

    favoriteChips.innerHTML = `
      <button class="chip ${app.favoritesFilter === "all" ? "active" : ""}" data-favoritesfilter="all" type="button">Tutti</button>
      <button class="chip ${app.favoritesFilter === "favorites" ? "active" : ""}" data-favoritesfilter="favorites" type="button">Solo preferiti</button>
    `;

    sailChips.innerHTML = `
      <button class="chip ${app.sailFilter === "all" ? "active" : ""}" data-sailfilter="all" type="button">Tutti</button>
      <button class="chip ${app.sailFilter === "compat" ? "active" : ""}" data-sailfilter="compat" type="button">Compatibili oggi</button>
      <button class="chip ${app.sailFilter === "sail" ? "active" : ""}" data-sailfilter="sail" type="button">Vela</button>
      <button class="chip ${app.sailFilter === "night" ? "active" : ""}" data-sailfilter="night" type="button">Riparo notte</button>
      <button class="chip ${app.sailFilter === "beautiful" ? "active" : ""}" data-sailfilter="beautiful" type="button">Spot belli</button>
    `;

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

    box.innerHTML = app.mode === "sail"
      ? `
        <div class="legend-item"><span class="legend-dot legend-blue"></span> Spot vela</div>
        <div class="legend-item"><span class="legend-dot legend-gold"></span> Spot belli / top acqua</div>
        <div class="legend-item"><span class="legend-dot legend-pink"></span> Spot serali</div>
        <div class="legend-item"><span class="legend-dot" style="background:#36c275"></span> Riparo notte</div>
      `
      : `
        <div class="legend-item"><span class="legend-dot legend-gold"></span> Wow</div>
        <div class="legend-item"><span class="legend-dot legend-pink"></span> Tramonto</div>
        <div class="legend-item"><span class="legend-dot legend-blue"></span> Altri spot</div>
      `;
  }

  function renderTopLists(app) {
    const wowBox = $("topWowList");
    const sunsetBox = $("topSunsetList");

    const wow = (APP_SPOTS.topWowNames || []).map(name => APP_SPOTS.spots.find(s => s.name === name)).filter(Boolean);
    const sunset = (APP_SPOTS.topSunsetNames || []).map(name => APP_SPOTS.spots.find(s => s.name === name)).filter(Boolean);

    wowBox.innerHTML = wow.map((s, i) => `
      <div class="featured-card wow tap" data-top-id="${esc(s.id)}">
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
        const s = APP_SPOTS.spots.find(x => x.id === el.dataset.topId);
        if (s) {
          window.APP_UTILS.showSpotDetail(s);
          window.APP_UTILS.switchPage("detail");
        }
      });
    });

    sunsetBox.querySelectorAll("[data-sunset-id]").forEach(el => {
      el.addEventListener("click", () => {
        const s = APP_SPOTS.spots.find(x => x.id === el.dataset.sunsetId);
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
          <button class="fav-btn" data-fav-id="${esc(s.id)}" type="button">${isFavorite(s.id) ? "" : ""}</button>
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
        const s = APP_SPOTS.spots.find(x => x.id === card.dataset.spotId);
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
        <div class="detail-box"><div class="k">Valutazione oggi</div><div class="v">${esc(spot.weatherFit?.label || "n/d")}</div></div>
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
          <a class="btn btn-secondary tap" href="https://www.google.com/search?q=${encodeURIComponent(spot.name + " " + (APP_SPOTS.region || ""))}&tbm=isch" target="_blank" rel="noopener noreferrer">Vedi foto reali</a>
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
    const slots = [
      { key: "alba", title: "Alba", hint: "Aggiungi uno spot da alba." },
      { key: "main", title: app.mode === "sail" ? "Spot principale" : "Attività", hint: "Aggiungi lo spot centrale della giornata." },
      { key: "tramonto", title: "Tramonto", hint: "Aggiungi la chiusura serale." }
    ];

    box.innerHTML = slots.map(slot => {
      const spotId = app.planner[slot.key];
      const spot = spotId ? APP_SPOTS.spots.find(s => s.id === spotId) : null;

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
    $("eyebrowRegion") && ($("eyebrowRegion").textContent = `Zona attiva: ${APP_SPOTS.region || "Area"} • ${APP_SPOTS.spots.length} spot`);

    $("conditionsTitle") && ($("conditionsTitle").textContent = app.mode === "sail" ? "Condizioni vela" : "Meteo e mood del giorno");
    $("conditionsSub") && ($("conditionsSub").textContent = app.mode === "sail" ? "Sail" : "Travel");
    $("forecastTitle") && ($("forecastTitle").textContent = app.mode === "sail" ? "Previsione oraria vela · prossime 12 ore" : "Previsione oraria · prossime 12 ore");
    $("forecastSub") && ($("forecastSub").textContent = app.mode === "sail" ? "Vento · direzione · onde" : "Lettura rapida");

    $("topBox1Sub") && ($("topBox1Sub").textContent = app.mode === "sail" ? "Spot belli / forti" : "I più forti del posto");
    $("topBox1Title") && ($("topBox1Title").textContent = app.mode === "sail" ? "Top spot belli" : "Top 10 wow");
    $("topBox2Sub") && ($("topBox2Sub").textContent = "Luce serale");
    $("topBox2Title") && ($("topBox2Title").textContent = "Top 10 tramonti");

    document.querySelectorAll(".sail-only").forEach(el => {
      el.style.display = app.mode === "sail" ? "" : "none";
    });

    $("travelFilters").style.display = app.mode === "sail" ? "none" : "";
    $("sailFilters").style.display = app.mode === "sail" ? "" : "none";

    renderQuickGrid(app);
    renderStatsGrid(app);
    renderHourly(app);
    renderFilterBars(app);
    renderLegend(app);
    renderTopLists(app);
    renderSpotList(app);

    if (app.currentSpot) UI.renderSpotDetail(app, app.currentSpot);
    if (app.mode === "travel") UI.renderSunPhase(app);
  };

  window.UI = UI;
})();