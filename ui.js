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

  function favIcon(id) {
    return isFavorite(id) ? "❤️" : "🤍";
  }

  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function pretty(value) {
    if (!value) return "—";

    const map = {
      est: "Est",
      ovest: "Ovest",
      nord: "Nord",
      sud: "Sud",
      montagna: "Montagna",
      alba: "Alba",
      mattina: "Mattina",
      giorno: "Giorno",
      tramonto: "Tramonto",
      sera: "Sera",
      trekking: "Trekking",
      view: "View",
      relax: "Relax",
      mtb: "MTB",
      facile: "Facile",
      medio: "Medio",
      impegnativo: "Impegnativo",
      nebbia: "Nebbia",
      core: "Top",
      secondary: "Belli",
      extra: "Extra"
    };

    const key = String(value).toLowerCase();
    if (map[key]) return map[key];

    return String(value)
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  function premiumScore(spot) {
    let score = 50;

    score += Number(spot.experience?.wow || 5) * 3;

    if (spot.level === "core") score += 10;
    if (spot.whenToGo?.best) score += 8;
    if (safeArray(spot.whenToAvoid).length) score += 8;
    if (spot.access?.parcheggio) score += 5;
    if (spot.access?.walk) score += 4;
    if (spot.access?.strada) score += 3;
    if (spot.crowd?.best || spot.crowd?.worst) score += 4;
    if (safeArray(spot.smartTips).length >= 2) score += 8;
    if (spot.experience?.tipo) score += 4;
    if (spot.experience?.tempo) score += 4;
    if (spot.experience?.mood) score += 2;
    if (spot.longDescription) score += 4;
    if (spot.photoTips) score += 2;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  function premiumLabel(score) {
    if (score >= 90) return { text: "Premium forte", cls: "green" };
    if (score >= 78) return { text: "Molto ricco", cls: "gold" };
    if (score >= 64) return { text: "Buono", cls: "blue" };
    return { text: "Base", cls: "pink" };
  }

  function weatherChip(s) {
    const fit = s.weatherFit;
    if (!fit) return `<span class="tag blue">meteo n/d</span>`;
    return `<span class="tag ${esc(fit.cls || "blue")}">${esc(fit.label || "meteo")}</span>`;
  }

  function buildSpotMetaLine(spot) {
    const parts = [
      spot.experience?.tipo ? pretty(spot.experience.tipo) : null,
      spot.experience?.tempo || null,
      spot.access?.difficolta ? pretty(spot.access.difficolta) : (spot.difficulty ? pretty(spot.difficulty) : null)
    ].filter(Boolean);

    return parts.join(" • ") || "Spot selezionato";
  }

  function buildTravelQuickCards(app) {
    const goNow = window.APP_UTILS.getGoNowSuggestions();
    const bestNow = goNow?.best || null;
    const alt1 = goNow?.alternatives?.[0] || null;
    const alt2 = goNow?.alternatives?.[1] || null;
    const bestSunset = window.APP_UTILS.getBestSunsetSpot();
    const closestSpot = window.APP_UTILS.getClosestSpot();

    const goNowExplanation = bestNow ? window.APP_UTILS.explainGoNow(bestNow) : "";
    const closestFit = closestSpot?.weatherFit || null;
    const closestQualityChipCls = closestFit?.cls || "blue";
    const closestQualityLabel = closestFit ? closestFit.label : "stato n/d";

    return `
      <div class="quick-card glass best tap" data-quick-id="${bestNow ? esc(bestNow.id) : ""}">
        <div class="quick-label">Vai ora</div>
        <div class="quick-title">${bestNow ? esc(bestNow.name) : "—"}</div>

        ${goNowExplanation ? `
          <div class="quick-desc" style="font-size:13px;opacity:.92;font-style:italic;margin-bottom:8px;margin-top:2px">${esc(goNowExplanation)}</div>
        ` : ``}

        <div class="quick-desc">${bestNow ? esc(bestNow.desc || bestNow.tip || "") : "Sto leggendo il miglior spot del momento."}</div>

        <div class="sunset-chip-row">
          <div class="mini-chip blue">${bestNow?.distance != null ? esc(window.APP_UTILS.displayDistance(bestNow.distance)) : "distanza n/d"}</div>
          <div class="mini-chip gold">${bestNow?.experience?.tempo ? esc(bestNow.experience.tempo) : "tempo n/d"}</div>
          <div class="mini-chip ${bestNow?.weatherFit?.cls === "green" ? "gold" : "blue"}">
            ${bestNow?.weatherFit?.label || "lettura in corso"}
          </div>
        </div>

        ${(alt1 || alt2) ? `
          <div class="quick-desc" style="margin-top:12px">
            Alternative: ${[alt1?.name, alt2?.name].filter(Boolean).map(esc).join(" • ")}
          </div>
        ` : ``}
      </div>

      <div class="quick-card glass tap" data-quick-id="${closestSpot ? esc(closestSpot.id) : ""}">
        <div class="quick-label">Spot vicino a te</div>
        <div class="quick-title">${closestSpot ? esc(closestSpot.name) : "—"}</div>
        <div class="quick-desc">${closestSpot ? esc(closestSpot.tip || closestSpot.desc || "") : "Attiva il GPS per vedere lo spot più vicino."}</div>

        <div class="sunset-chip-row">
          <div class="mini-chip blue">${closestSpot?.distance != null ? esc(window.APP_UTILS.displayDistance(closestSpot.distance)) : "GPS non attivo"}</div>
          <div class="mini-chip gold">${closestSpot ? esc(pretty(closestSpot.zone)) : "zona n/d"}</div>
          ${closestSpot ? `<div class="mini-chip ${esc(closestQualityChipCls)}">${esc(closestQualityLabel)}</div>` : ``}
        </div>
      </div>

      <div class="quick-card glass sunset-card tap" data-quick-id="${bestSunset ? esc(bestSunset.id) : ""}">
        <div class="quick-label">Tramonto premium</div>
        <div class="quick-title">${bestSunset ? esc(bestSunset.name) : "—"}</div>
        <div class="quick-desc">${bestSunset ? esc(bestSunset.tip || bestSunset.desc || "") : "In attesa della lettura luce."}</div>

        <div class="sunset-chip-row" style="margin-top:12px">
          <div class="mini-chip gold" id="sunsetClockChip">Tramonto —</div>
          <div class="mini-chip blue" id="sunPhaseChip">Luce da leggere</div>
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
          <div class="mini-chip blue">Sail</div>
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

        <div class="sunset-chip-row" style="margin-top:12px">
          <div class="mini-chip gold">Onde ${app.marineData ? Number(app.marineData.waveHeight || 0).toFixed(1) + " m" : "—"}</div>
          <div class="mini-chip blue">Dir ${app.weatherData ? Math.round(app.weatherData.windDir || 0) + "°" : "—"}</div>
        </div>

        <div class="sunset-countdown" style="margin-top:12px">
          <div style="min-width:0;flex:1 1 auto">
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

    box.querySelectorAll("[data-quick-id]").forEach(card => {
      card.addEventListener("click", () => {
        const id = card.dataset.quickId;
        if (!id) return;
        const spot = APP_SPOTS.spots.find(s => s.id === id);
        if (spot) {
          window.APP_UTILS.showSpotDetail(spot);
          window.APP_UTILS.switchPage("detail");
        }
      });
    });
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

  UI.renderSunPhase = function () {
    const data = window.APP_UTILS.getSunPhaseInfo();

    const clock = $("sunsetClockChip");
    const phase = $("sunPhaseChip");
    const main = $("sunsetCountdownMain");
    const sub = $("sunsetCountdownSub");
    const time = $("sunsetCountdownTime");

    if (clock) clock.textContent = data.clockText;
    if (phase) phase.textContent = data.phaseText;
    if (main) main.textContent = data.mainText;
    if (sub) sub.textContent = data.subText;
    if (time) time.textContent = data.timeText;
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

    strip.style.display = "flex";
    strip.style.flexWrap = "nowrap";
    strip.style.overflowX = "auto";
    strip.style.overflowY = "hidden";
    strip.style.gap = "10px";
    strip.style.paddingBottom = "6px";
    strip.style.alignItems = "stretch";
    strip.style.scrollSnapType = "x proximity";
    strip.style.webkitOverflowScrolling = "touch";

    strip.innerHTML = app.hourlyData.map(item => {
      const mood = hourlyMood(item);
      const hourText = String(item.date.getHours()).padStart(2, "0") + ":00";

      if (app.mode === "sail") {
        return `
          <div class="hour-card ${mood.cls}" style="flex:0 0 150px;min-width:150px;max-width:150px;scroll-snap-align:start;">
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
        <div class="hour-card ${mood.cls}" style="flex:0 0 150px;min-width:150px;max-width:150px;scroll-snap-align:start;">
          <div class="hour-top">
            <div class="hour-time">${hourText}</div>
            <div class="hour-emoji">${mood.emoji}</div>
          </div>
          <div class="hour-line"><span class="hour-label">Temp</span><strong>${Math.round(item.temp)}°</strong></div>
          <div class="hour-line"><span class="hour-label">Vento</span><strong>${Math.round(item.wind)} km/h</strong></div>
          <div class="hour-line"><span class="hour-label">Pioggia</span><strong>${Math.round(item.rain)}%</strong></div>
          <div class="hour-line"><span class="hour-label">Nuvole</span><strong>${Math.round(item.cloud)}%</strong></div>
          <div class="hour-pill ${mood.cls}">${mood.label}</div>
        </div>
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

    if (mapQuickFilters) {
      mapQuickFilters.innerHTML = `
        <button class="chip ${app.mapQuickFilter === "all" ? "active" : ""}" data-mapquick="all" type="button">Tutti</button>
        <button class="chip ${app.mapQuickFilter === "wow" ? "active" : ""}" data-mapquick="wow" type="button">Wow</button>
        <button class="chip ${app.mapQuickFilter === "sunset" ? "active" : ""}" data-mapquick="sunset" type="button">Tramonti</button>
        <button class="chip ${app.mapQuickFilter === "alba" ? "active" : ""}" data-mapquick="alba" type="button">Albe</button>
        <button class="chip ${app.mapQuickFilter === "favorites" ? "active" : ""}" data-mapquick="favorites" type="button">Preferiti</button>
      `;

      mapQuickFilters.querySelectorAll("[data-mapquick]").forEach(btn => {
        btn.addEventListener("click", () => {
          app.mapQuickFilter = btn.dataset.mapquick;
          window.APP_UTILS.renderAll();
        });
      });
    }

    if (levelChips) {
      levelChips.innerHTML = `
        <button class="chip ${app.level === "all" ? "active" : ""}" data-level="all" type="button">Tutti</button>
        <button class="chip ${app.level === "core" ? "active" : ""}" data-level="core" type="button">Top</button>
        <button class="chip ${app.level === "secondary" ? "active" : ""}" data-level="secondary" type="button">Belli</button>
        <button class="chip ${app.level === "extra" ? "active" : ""}" data-level="extra" type="button">Extra</button>
      `;
      levelChips.querySelectorAll("[data-level]").forEach(btn => {
        btn.addEventListener("click", () => {
          app.level = btn.dataset.level;
          window.APP_UTILS.renderAll();
        });
      });
    }

    if (lightChips) {
      lightChips.innerHTML = `
        <button class="chip ${app.light === "all" ? "active" : ""}" data-light="all" type="button">Tutta la luce</button>
        <button class="chip ${app.light === "alba" ? "active" : ""}" data-light="alba" type="button">Alba</button>
        <button class="chip ${app.light === "tramonto" ? "active" : ""}" data-light="tramonto" type="button">Tramonto</button>
        <button class="chip ${app.light === "giorno" ? "active" : ""}" data-light="giorno" type="button">Giorno</button>
      `;
      lightChips.querySelectorAll("[data-light]").forEach(btn => {
        btn.addEventListener("click", () => {
          app.light = btn.dataset.light;
          window.APP_UTILS.renderAll();
        });
      });
    }

    if (zoneChips) {
      zoneChips.innerHTML = `
        <button class="chip ${app.zone === "all" ? "active" : ""}" data-zone="all" type="button">Tutte le zone</button>
        <button class="chip ${app.zone === "nord" ? "active" : ""}" data-zone="nord" type="button">Nord</button>
        <button class="chip ${app.zone === "sud" ? "active" : ""}" data-zone="sud" type="button">Sud</button>
        <button class="chip ${app.zone === "est" ? "active" : ""}" data-zone="est" type="button">Est</button>
        <button class="chip ${app.zone === "ovest" ? "active" : ""}" data-zone="ovest" type="button">Ovest</button>
        <button class="chip ${app.zone === "montagna" ? "active" : ""}" data-zone="montagna" type="button">Montagna</button>
      `;
      zoneChips.querySelectorAll("[data-zone]").forEach(btn => {
        btn.addEventListener("click", () => {
          app.zone = btn.dataset.zone;
          window.APP_UTILS.renderAll();
        });
      });
    }

    if (activityChips) {
      activityChips.innerHTML = `
        <button class="chip ${app.activity === "all" ? "active" : ""}" data-activity="all" type="button">Tutte</button>
        <button class="chip ${app.activity === "trekking" ? "active" : ""}" data-activity="trekking" type="button">Trekking</button>
        <button class="chip ${app.activity === "mtb" ? "active" : ""}" data-activity="mtb" type="button">MTB</button>
        <button class="chip ${app.activity === "view" ? "active" : ""}" data-activity="view" type="button">View</button>
        <button class="chip ${app.activity === "relax" ? "active" : ""}" data-activity="relax" type="button">Relax</button>
      `;
      activityChips.querySelectorAll("[data-activity]").forEach(btn => {
        btn.addEventListener("click", () => {
          app.activity = btn.dataset.activity;
          window.APP_UTILS.renderAll();
        });
      });
    }

    if (favoriteChips) {
      favoriteChips.innerHTML = `
        <button class="chip ${app.favoritesFilter === "all" ? "active" : ""}" data-favoritesfilter="all" type="button">Tutti</button>
        <button class="chip ${app.favoritesFilter === "favorites" ? "active" : ""}" data-favoritesfilter="favorites" type="button">Solo preferiti</button>
      `;
      favoriteChips.querySelectorAll("[data-favoritesfilter]").forEach(btn => {
        btn.addEventListener("click", () => {
          app.favoritesFilter = btn.dataset.favoritesfilter;
          window.APP_UTILS.renderAll();
        });
      });
    }

    if (sailChips) {
      sailChips.innerHTML = `
        <button class="chip ${app.sailFilter === "all" ? "active" : ""}" data-sailfilter="all" type="button">Tutti</button>
        <button class="chip ${app.sailFilter === "compat" ? "active" : ""}" data-sailfilter="compat" type="button">Compatibili oggi</button>
        <button class="chip ${app.sailFilter === "sail" ? "active" : ""}" data-sailfilter="sail" type="button">Vela</button>
        <button class="chip ${app.sailFilter === "night" ? "active" : ""}" data-sailfilter="night" type="button">Riparo notte</button>
        <button class="chip ${app.sailFilter === "beautiful" ? "active" : ""}" data-sailfilter="beautiful" type="button">Spot belli</button>
      `;
      sailChips.querySelectorAll("[data-sailfilter]").forEach(btn => {
        btn.addEventListener("click", () => {
          app.sailFilter = btn.dataset.sailfilter;
          window.APP_UTILS.renderAll();
        });
      });
    }
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

  function topCardHTML(s, i, type) {
    const score = premiumScore(s);
    const label = premiumLabel(score);
    const wow = s.experience?.wow != null ? `⭐ ${s.experience.wow}/10` : "⭐ n/d";

    return `
      <div class="featured-card ${type} tap" data-top-id="${esc(s.id)}">
        <div class="featured-rank">${i + 1}</div>
        <div style="min-width:0;flex:1 1 auto">
          <div class="featured-name">${esc(s.name)}</div>
          <div class="featured-desc">${esc(s.desc || "")}</div>
          <div class="sunset-chip-row" style="margin-top:10px">
            <div class="mini-chip gold">${wow}</div>
            <div class="mini-chip blue">${esc(s.experience?.tempo || "tempo n/d")}</div>
            <div class="mini-chip ${esc(label.cls)}">${esc(label.text)}</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderTopLists(app) {
    const wowBox = $("topWowList");
    const sunsetBox = $("topSunsetList");
    if (!wowBox || !sunsetBox) return;

    const wow = (APP_SPOTS.topWowNames || [])
      .map(name => APP_SPOTS.spots.find(s => s.name === name))
      .filter(Boolean);

    const sunset = (APP_SPOTS.topSunsetNames || [])
      .map(name => APP_SPOTS.spots.find(s => s.name === name))
      .filter(Boolean);

    wowBox.innerHTML = wow.map((s, i) => topCardHTML(s, i, "wow")).join("");
    sunsetBox.innerHTML = sunset.map((s, i) => topCardHTML(s, i, "sunset")).join("");

    wowBox.querySelectorAll("[data-top-id]").forEach(el => {
      el.addEventListener("click", () => {
        const s = APP_SPOTS.spots.find(x => x.id === el.dataset.topId);
        if (s) {
          window.APP_UTILS.showSpotDetail(s);
          window.APP_UTILS.switchPage("detail");
        }
      });
    });

    sunsetBox.querySelectorAll("[data-top-id]").forEach(el => {
      el.addEventListener("click", () => {
        const s = APP_SPOTS.spots.find(x => x.id === el.dataset.topId);
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
    if (!box) return;

    if (resultNote) {
      resultNote.textContent = `${items.length} spot · ${app.mode === "sail" ? "Sail Mode" : "Travel Mode"}`;
    }

    if (!items.length) {
      box.innerHTML = `<div class="detail-empty">Nessuno spot con questi filtri.</div>`;
      return;
    }

    box.innerHTML = items.map(s => {
      const premium = premiumLabel(premiumScore(s));
      const line = buildSpotMetaLine(s);

      return `
        <div class="spot-card tap" data-spot-id="${esc(s.id)}">
          <div class="spot-head">
            <div>
              <div class="spot-name">${esc(s.name)}</div>
              <div class="spot-sub">${esc(window.APP_UTILS.displayDistance(s.distance))}</div>
            </div>
            <button class="fav-btn" data-fav-id="${esc(s.id)}" type="button" aria-label="Preferito">${favIcon(s.id)}</button>
          </div>

          <div class="spot-meta">
            <span class="tag gold">${esc(pretty(s.level))}</span>
            <span class="tag blue">${esc(pretty(s.zone))}</span>
            <span class="tag">${esc(pretty(s.activity))}</span>
            <span class="tag">${esc(pretty(s.access?.difficolta || s.difficulty || "n.d."))}</span>
            <span class="tag pink">${esc(pretty(s.light || "giorno"))}</span>
            ${weatherChip(s)}
            <span class="tag ${esc(premium.cls)}">${esc(premium.text)}</span>
            ${app.mode === "sail" && s.sailMeta?.enabled ? `<span class="tag blue">vela</span>` : ``}
            ${app.mode === "sail" && s.sailMeta?.nightShelter ? `<span class="tag green">riparo notte</span>` : ``}
            ${app.mode === "sail" && s.sailMeta?.enabled ? `<span class="tag gold">${esc(s.sailMeta.label)}</span>` : ``}
          </div>

          <div class="spot-desc">${esc(s.desc || "")}</div>

          <div class="spot-meta" style="margin-top:10px">
            ${s.experience?.wow != null ? `<span class="tag gold">⭐ ${esc(s.experience.wow)}/10</span>` : ``}
            ${s.experience?.tempo ? `<span class="tag blue">${esc(s.experience.tempo)}</span>` : ``}
            ${s.whenToGo?.best ? `<span class="tag">${esc(pretty(s.whenToGo.best))}</span>` : ``}
          </div>

          <div class="spot-desc" style="margin-top:10px;font-size:13px;opacity:.9">${esc(line)}</div>
        </div>
      `;
    }).join("");

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

  function detailInfoGrid(spot, app, sail) {
    const premium = premiumLabel(premiumScore(spot));

    return `
      <div class="detail-grid">
        <div class="detail-box"><div class="k">Livello</div><div class="v">${esc(pretty(spot.level))}</div></div>
        <div class="detail-box"><div class="k">Zona</div><div class="v">${esc(pretty(spot.zone))}</div></div>
        <div class="detail-box"><div class="k">Attività</div><div class="v">${esc(pretty(spot.activity))}</div></div>
        <div class="detail-box"><div class="k">Luce ideale</div><div class="v">${esc(pretty(spot.light || "giorno"))}</div></div>
        <div class="detail-box"><div class="k">Difficoltà</div><div class="v">${esc(pretty(spot.access?.difficolta || spot.difficulty || "n.d."))}</div></div>
        <div class="detail-box"><div class="k">Valutazione oggi</div><div class="v">${esc(spot.weatherFit?.label || "n/d")}</div></div>
        <div class="detail-box"><div class="k">Distanza</div><div class="v">${esc(window.APP_UTILS.displayDistance(spot.distance))}</div></div>
        <div class="detail-box"><div class="k">Livello dati</div><div class="v">${esc(premium.text)}</div></div>
        <div class="detail-box"><div class="k">Wow</div><div class="v">${spot.experience?.wow != null ? esc(spot.experience.wow) + "/10" : "n/d"}</div></div>
        <div class="detail-box"><div class="k">Tipo esperienza</div><div class="v">${esc(spot.experience?.tipo || "n.d.")}</div></div>
        <div class="detail-box"><div class="k">Tempo medio</div><div class="v">${esc(spot.experience?.tempo || "n.d.")}</div></div>
        <div class="detail-box"><div class="k">Mood</div><div class="v">${esc(spot.experience?.mood || "n.d.")}</div></div>
        ${app.mode === "sail" ? `<div class="detail-box"><div class="k">Vela oggi</div><div class="v">${esc(sail?.label || "n/d")}</div></div>` : ``}
        ${app.mode === "sail" ? `<div class="detail-box"><div class="k">Onde</div><div class="v">${app.marineData ? Number(app.marineData.waveHeight || 0).toFixed(1) + " m" : "—"}</div></div>` : ``}
      </div>
    `;
  }

  function listSection(title, icon, items, emptyText) {
    const list = safeArray(items).filter(Boolean);

    return `
      <div class="detail-section">
        <h3>${esc(title)}</h3>
        ${
          list.length
            ? `<ul class="detail-ul">${list.map(item => `<li>${icon} ${esc(item)}</li>`).join("")}</ul>`
            : `<p>${esc(emptyText)}</p>`
        }
      </div>
    `;
  }

  UI.renderSpotDetail = function (app, rawSpot) {
    const box = $("spotDetail");
    if (!box || !rawSpot) return;

    const spot = window.APP_UTILS.getAllSpotsWithMeta().find(s => s.id === rawSpot.id) || rawSpot;
    const sail = window.SAIL ? window.SAIL.getSpotSailMeta(spot, app) : null;
    const goNow = app.mode === "travel" ? window.APP_UTILS.getGoNowSuggestions() : null;
    const isTopNow = goNow?.best?.id === spot.id;
    const isAlternative = goNow?.alternatives?.some(x => x.id === spot.id);
    const whenToAvoid = safeArray(spot.whenToAvoid);
    const smartTips = safeArray(spot.smartTips);
    const premium = premiumLabel(premiumScore(spot));

    box.innerHTML = `
      <div class="detail-hero" style="background-image:
        linear-gradient(180deg, rgba(4,8,14,.10), rgba(4,8,14,.84)),
        url('${window.APP_UTILS.getSpotImage(spot)}')">
        <div class="detail-hero-inner">
          <div class="sunset-chip-row" style="margin-bottom:10px">
            <div class="mini-chip ${esc(premium.cls)}">${esc(premium.text)}</div>
            ${spot.experience?.wow != null ? `<div class="mini-chip gold">⭐ ${esc(spot.experience.wow)}/10</div>` : ``}
            ${spot.whenToGo?.best ? `<div class="mini-chip blue">${esc(pretty(spot.whenToGo.best))}</div>` : ``}
          </div>
          <h3 class="detail-title">${esc(spot.name)}</h3>
          <div class="detail-sub">${esc(spot.desc)}</div>
        </div>
      </div>

      ${(isTopNow || isAlternative) ? `
        <div class="detail-section">
          <h3>Vai ora</h3>
          <p>${isTopNow ? "Questo è lo spot migliore di adesso, considerando orario, meteo e distanza." : "Questo spot è una delle alternative migliori di adesso."}</p>
        </div>
      ` : ``}

      ${detailInfoGrid(spot, app, sail)}

      <div class="detail-section">
        <h3>Consiglio pratico</h3>
        <p>${esc(spot.tip || spot.whenToGo?.note || "Nessun consiglio aggiuntivo disponibile.")}</p>
      </div>

      ${spot.longDescription ? `<div class="detail-section"><h3>Perché vale</h3><p>${esc(spot.longDescription)}</p></div>` : ``}

      <div class="detail-section">
        <h3>Quando andarci</h3>
        <p><strong>${esc(pretty(spot.whenToGo?.best || "n.d."))}</strong>${spot.whenToGo?.note ? ` · ${esc(spot.whenToGo.note)}` : ""}</p>
      </div>

      ${listSection("Quando evitarlo", "⛔", whenToAvoid, "Nessun limite specifico salvato.")}

      <div class="detail-section">
        <h3>Accesso reale</h3>
        <div class="detail-grid">
          <div class="detail-box"><div class="k">Parcheggio</div><div class="v">${esc(spot.access?.parcheggio || "n.d.")}</div></div>
          <div class="detail-box"><div class="k">Walk</div><div class="v">${esc(spot.access?.walk || "n.d.")}</div></div>
          <div class="detail-box"><div class="k">Strada</div><div class="v">${esc(spot.access?.strada || "n.d.")}</div></div>
          <div class="detail-box"><div class="k">Difficoltà</div><div class="v">${esc(pretty(spot.access?.difficolta || spot.difficulty || "n.d."))}</div></div>
        </div>
      </div>

      <div class="detail-section">
        <h3>Affollamento</h3>
        <div class="detail-grid">
          <div class="detail-box"><div class="k">Meglio</div><div class="v">${esc(spot.crowd?.best || "n.d.")}</div></div>
          <div class="detail-box"><div class="k">Peggio</div><div class="v">${esc(spot.crowd?.worst || "n.d.")}</div></div>
        </div>
      </div>

      ${listSection("Smart tips", "🧠", smartTips, "Nessun tip salvato.")}

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
    if (!box) return;

    const slots = [
      { key: "alba", title: "Alba / mattina", hint: "Tappa iniziale della giornata." },
      { key: "main", title: app.mode === "sail" ? "Spot principale" : "Attività centrale", hint: "Cuore della giornata." },
      { key: "tramonto", title: "Tramonto / chiusura", hint: "Finale forte o rilassato." }
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

      const meta = buildSpotMetaLine(spot);

      return `
        <div class="planner-slot tap">
          <div class="planner-slot-head">
            <div class="planner-slot-title">${slot.title}</div>
            <button class="btn btn-secondary tap" data-clear-slot="${slot.key}" type="button" style="width:auto;padding:8px 12px">Rimuovi</button>
          </div>
          <div class="planner-slot-name">${esc(spot.name)}</div>
          <div class="planner-slot-sub">${esc(spot.desc)}</div>
          <div class="planner-slot-sub" style="margin-top:8px;opacity:.9">${esc(meta)}</div>
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
      totalDistance += haversineKm(
        app.gpsPath[i - 1][0],
        app.gpsPath[i - 1][1],
        app.gpsPath[i][0],
        app.gpsPath[i][1]
      );
    }

    gpsDistance.textContent = `${totalDistance.toFixed(2)} km`;
    gpsPoints.textContent = String(app.gpsPath.length);
    gpsSpeed.textContent = liveData.speedMs != null ? `${(liveData.speedMs * 3.6).toFixed(1)} km/h` : "—";
    gpsHeading.textContent = liveData.heading != null ? `${toCompass(liveData.heading)} · ${liveData.heading.toFixed(0)}°` : "—";
  };

  function toCompass(deg) {
    if (deg == null || isNaN(deg)) return "—";
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(deg / 45) % 8];
  }

  function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
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
    $("topBox1Title") && ($("topBox1Title").textContent = app.mode === "sail" ? "Top spot belli" : "Top wow");
    $("topBox2Sub") && ($("topBox2Sub").textContent = "Luce serale");
    $("topBox2Title") && ($("topBox2Title").textContent = "Top tramonti");

    document.querySelectorAll(".sail-only").forEach(el => {
      el.style.display = app.mode === "sail" ? "" : "none";
    });

    if ($("travelFilters")) $("travelFilters").style.display = app.mode === "sail" ? "none" : "";
    if ($("sailFilters")) $("sailFilters").style.display = app.mode === "sail" ? "" : "";

    renderQuickGrid(app);
    renderStatsGrid(app);
    renderHourly(app);
    renderFilterBars(app);
    renderLegend(app);
    renderTopLists(app);
    renderSpotList(app);
    UI.renderPlannerBox(app);

    if ($("weatherAlert")) {
      if (!app.weatherData) {
        $("weatherAlert").className = "alert warn";
        $("weatherAlert").textContent = "Meteo non disponibile.";
      } else if (app.mode === "sail") {
        $("weatherAlert").className = "alert ok";
        $("weatherAlert").textContent = app.marineData
          ? `Vento ${Math.round(app.weatherData.wind)} km/h · onde ${Number(app.marineData.waveHeight || 0).toFixed(1)} m`
          : "Lettura vela aggiornata.";
      } else {
        $("weatherAlert").className = "alert ok";
        $("weatherAlert").textContent = `${app.weatherData.headline} — ${app.weatherData.advice}`;
      }
    }

    if (app.currentSpot) UI.renderSpotDetail(app, app.currentSpot);
    if (app.mode === "travel") UI.renderSunPhase(app);
  };

  window.UI = UI;
})();