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
alba: "Alba", giorno: "Giorno", tramonto: "Tramonto",
mattina: "Mattina", sera: "Sera",
facile: "Facile", medio: "Medio", impegnativo: "Impegnativo",
epico: "Epico", iconico: "Iconico", mistico: "Mistico",
avventura: "Avventura", "relax wow": "Relax wow",
"grande panorama": "Grande panorama", "panorama pulito": "Panorama pulito"
};
return map[value] || value;
}

function getSpotCounts() {
const spots     = Array.isArray(APP_SPOTS?.spots) ? APP_SPOTS.spots : [];
const core      = spots.filter(s => s.level === "core").length;
const secondary = spots.filter(s => s.level === "secondary").length;
const extra     = spots.filter(s => s.level === "extra").length;
return { core, secondary, extra, main: core + secondary, total: spots.length };
}

function chipClassFromFit(fit) {
if (!fit) return "blue";
if (fit.cls === "green") return "green";
if (fit.cls === "gold")  return "gold";
if (fit.cls === "pink")  return "pink";
return "blue";
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
// QUICK GRID - OTTIMIZZAZIONE LIVE
// ═══════════════════════════════════════════════════════════════════════════

function buildTravelQuickCards(app) {
const goNow       = window.APP_UTILS.getGoNowSuggestions();
const bestNow     = goNow?.best || null;
const alt1        = goNow?.alternatives?.[0] || null;
const alt2        = goNow?.alternatives?.[1] || null;
const bestSunset  = window.APP_UTILS.getBestSunsetSpot();
const closestSpot = window.APP_UTILS.getClosestSpot ? window.APP_UTILS.getClosestSpot() : (app.nearbySpots?.[0] || null);

const goNowExplanation      = bestNow ? window.APP_UTILS.explainGoNow(bestNow) : "";  
const closestFit            = closestSpot?.weatherFit || null;  
const closestQualityChipCls = chipClassFromFit(closestFit);  
const closestQualityLabel   = closestFit ? closestFit.label : "stato n/d";  

return `  
  <div class="quick-card glass best tap" data-quick-id="${bestNow ? esc(bestNow.id) : ""}" data-live-dist-id="${bestNow ? esc(bestNow.id) : ""}">  
    <div class="quick-label">Vai ora</div>  
    <div class="quick-title">${bestNow ? esc(bestNow.name) : "—"}</div>  
    ${goNowExplanation ? `<div class="quick-explain">${esc(goNowExplanation)}</div>` : ""}  
    <div class="quick-desc">${bestNow ? esc(getBestPracticalLine(bestNow)) : "Sto leggendo lo spot migliore del momento."}</div>  
    <div class="sunset-chip-row">  
      <div class="mini-chip blue live-dist-label">${bestNow ? esc(getDistanceLabel(bestNow)) : ""}</div>  
      <div class="mini-chip ${chipClassFromFit(bestNow?.weatherFit)}">${bestNow?.weatherFit?.label || "lettura in corso"}</div>  
      ${bestNow?.experience?.wow ? `<div class="mini-chip gold">Wow ${esc(String(bestNow.experience.wow))}/10</div>` : ""}  
    </div>  
    ${(alt1 || alt2) ? `  
      <div class="quick-desc" style="margin-top:12px">  
        Alternative: ${[alt1?.name, alt2?.name].filter(Boolean).map(esc).join(" · ")}  
      </div>  
    ` : ""}  
  </div>  

  <div class="quick-card glass tap" data-quick-id="${closestSpot ? esc(closestSpot.id) : ""}" data-live-dist-id="${closestSpot ? esc(closestSpot.id) : ""}" id="qc-closest">  
    <div class="quick-label">Spot vicino a te</div>  
    <div class="quick-title">${closestSpot ? esc(closestSpot.name) : "—"}</div>  
    <div class="quick-desc">${closestSpot ? esc(getClosestPracticalLine(closestSpot)) : "Attiva il GPS per vedere lo spot più vicino."}</div>  
    <div class="sunset-chip-row">  
      <div class="mini-chip blue live-dist-label">${closestSpot ? esc(getDistanceLabel(closestSpot)) : ""}</div>  
      ${closestSpot?.zone ? `<div class="mini-chip gold">${esc(pretty(closestSpot.zone))}</div>` : ""}  
      <div class="mini-chip ${esc(closestQualityChipCls)}">${esc(closestQualityLabel)}</div>  
    </div>  
  </div>  

  <div class="quick-card glass sunset-card tap" data-quick-id="${bestSunset ? esc(bestSunset.id) : ""}" data-live-dist-id="${bestSunset ? esc(bestSunset.id) : ""}">  
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

}

function buildSailQuickCards(app) {
const bestToday  = window.APP_UTILS.getBestSpotToday();
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
const id   = card.dataset.quickId;
if (!id) return;
const spot = APP_SPOTS.spots.find(s => s.id === id) || app.nearbySpots.find(s => s.id === id);
if (spot) { window.APP_UTILS.showSpotDetail(spot); window.APP_UTILS.switchPage("detail"); }
});
});
}

function renderStatsGrid(app) {
const box = $("statsGrid");
if (!box) return;
if (!app.weatherData) {
box.innerHTML =   <div class="stat"><div class="k">Temperatura</div><div class="v">—</div></div>   <div class="stat"><div class="k">Vento</div><div class="v">—</div></div>   <div class="stat"><div class="k">Nuvole</div><div class="v">—</div></div>   <div class="stat"><div class="k">Pioggia</div><div class="v">—</div></div>  ;
return;
}
if (app.mode === "sail") {
box.innerHTML =   <div class="stat"><div class="k">Vento</div><div class="v">${Math.round(app.weatherData.wind)} km/h</div></div>   <div class="stat"><div class="k">Direzione</div><div class="v">${Math.round(app.weatherData.windDir)}°</div></div>   <div class="stat"><div class="k">Raffiche</div><div class="v">${Math.round(app.weatherData.gust)} km/h</div></div>   <div class="stat"><div class="k">Onde</div><div class="v">${app.marineData ? Number(app.marineData.waveHeight || 0).toFixed(1) + " m" : "—"}</div></div>  ;
} else {
box.innerHTML =   <div class="stat"><div class="k">Temperatura</div><div class="v">${Math.round(app.weatherData.temp)}°</div></div>   <div class="stat"><div class="k">Vento</div><div class="v">${Math.round(app.weatherData.wind)} km/h</div></div>   <div class="stat"><div class="k">Nuvole</div><div class="v">${Math.round(app.weatherData.cloud)}%</div></div>   <div class="stat"><div class="k">Pioggia</div><div class="v">${Math.round(app.weatherData.rain)}%</div></div>  ;
}
}

UI.renderSunPhase = function () {
const data  = window.APP_UTILS.getSunPhaseInfo();
const clock = $("sunsetClockChip");
const phase = $("sunPhaseChip");
const main  = $("sunsetCountdownMain");
const sub   = $("sunsetCountdownSub");
const time  = $("sunsetCountdownTime");
if (clock) clock.textContent = data.clockText;
if (phase) phase.textContent = data.phaseText;
if (main)  main.textContent  = data.mainText;
if (sub)   sub.textContent   = data.subText;
if (time)  time.textContent  = data.timeText;
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
strip.innerHTML = <div class="detail-empty">Previsione non disponibile.</div>;
if (main) main.textContent = "Previsione oraria non disponibile.";
if (sub)  sub.textContent  = "Non sono riuscito a leggere le prossime ore.";
return;
}
const bestHour = app.hourlyData[0];
const hh       = String(bestHour.date.getHours()).padStart(2, "0") + ":00";
if (main) {
main.textContent = app.mode === "sail"
? Finestra letta: ${hh} · vento, direzione e onde
: Finestra letta: ${hh} · prossime 12 ore;
}
if (sub) {
sub.textContent = app.mode === "sail"
? "In Sail mode leggi soprattutto vento, direzione e altezza onde."
: "Lettura rapida di meteo e comfort delle prossime ore.";
}
strip.style.display   = "flex";
strip.style.flexWrap  = "nowrap";
strip.style.overflowX = "auto";
strip.style.overflowY = "hidden";
strip.innerHTML = app.hourlyData.map(item => {
const mood     = hourlyMood(item);
const hourText = ${String(item.date.getHours()).padStart(2, "0")}:00;
const extraLines = app.mode === "sail" ?   <div class="hour-line"><span class="hour-label">Dir</span><strong>${Math.round(item.windDir)}°</strong></div>   <div class="hour-line"><span class="hour-label">Onde</span><strong>${Number(item.waveHeight || 0).toFixed(1)} m</strong></div>   <div class="hour-line"><span class="hour-label">Periodo</span><strong>${Number(item.wavePeriod || 0).toFixed(1)} s</strong></div>   <div class="hour-pill ${mood.cls}">${mood.label}</div>   : <div class="hour-pill ${mood.cls}">${mood.label}</div>;
return   <div class="hour-card ${mood.cls}" style="flex:0 0 150px;min-width:150px;max-width:150px;scroll-snap-align:start;">   <div class="hour-top">   <div class="hour-time">${hourText}</div>   <div class="hour-emoji">${mood.emoji}</div>   </div>   <div class="hour-line"><span class="hour-label">Temp</span><strong>${Math.round(item.temp)}°</strong></div>   <div class="hour-line"><span class="hour-label">Vento</span><strong>${Math.round(item.wind)} km/h</strong></div>   <div class="hour-line"><span class="hour-label">Pioggia</span><strong>${Math.round(item.rain)}%</strong></div>   <div class="hour-line"><span class="hour-label">Nuvole</span><strong>${Math.round(item.cloud)}%</strong></div>   ${extraLines}   </div>  ;
}).join("");
}

function getAvailableZones() {
if (Array.isArray(APP_SPOTS.zones) && APP_SPOTS.zones.length) return APP_SPOTS.zones;
const ids = [...new Set((APP_SPOTS.spots || []).map(s => s.zone).filter(Boolean))].sort();
return ids.map(id => ({ id, label: id.charAt(0).toUpperCase() + id.slice(1) }));
}

function getAvailableActivities() {
if (Array.isArray(APP_SPOTS.activities) && APP_SPOTS.activities.length) return APP_SPOTS.activities;
const ids = [...new Set((APP_SPOTS.spots || []).map(s => s.activity).filter(Boolean))].sort();
return ids.map(id => ({ id, label: id.charAt(0).toUpperCase() + id.slice(1) }));
}

function renderFilterBars(app) {
const mapQuickFilters = $("mapQuickFilters");
const levelChips      = $("levelChips");
const lightChips      = $("lightChips");
const zoneChips       = $("zoneChips");
const activityChips   = $("activityChips");
const favoriteChips   = $("favoriteChips");
const sailChips       = $("sailChips");

if (mapQuickFilters) {  
  mapQuickFilters.innerHTML = `  
    <button class="chip ${app.mapQuickFilter === "all"       ? "active" : ""}" data-mapquick="all"       type="button">Tutti</button>  
    <button class="chip ${app.mapQuickFilter === "wow"       ? "active" : ""}" data-mapquick="wow"       type="button">Wow</button>  
    <button class="chip ${app.mapQuickFilter === "sunset"    ? "active" : ""}" data-mapquick="sunset"    type="button">Tramonti</button>  
    <button class="chip ${app.mapQuickFilter === "alba"      ? "active" : ""}" data-mapquick="alba"      type="button">Albe</button>  
    <button class="chip ${app.mapQuickFilter === "favorites" ? "active" : ""}" data-mapquick="favorites" type="button">Preferiti</button>  
  `;  
  mapQuickFilters.querySelectorAll("[data-mapquick]").forEach(btn => {  
    btn.addEventListener("click", () => { app.mapQuickFilter = btn.dataset.mapquick; UI.smartRender(app, "full"); });  
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
    btn.addEventListener("click", () => { app.level = btn.dataset.level; UI.smartRender(app, "full"); });  
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
    btn.addEventListener("click", () => { app.light = btn.dataset.light; UI.smartRender(app, "full"); });  
  });  
}  

if (zoneChips) {  
  const zones = getAvailableZones();  
  zoneChips.innerHTML =  
    `<button class="chip ${app.zone === "all" ? "active" : ""}" data-zone="all" type="button">Tutte le zone</button>` +  
    zones.map(z =>  
      `<button class="chip ${app.zone === z.id ? "active" : ""}" data-zone="${esc(z.id)}" type="button">${esc(z.label)}</button>`  
    ).join("");  
  zoneChips.querySelectorAll("[data-zone]").forEach(btn => {  
    btn.addEventListener("click", () => { app.zone = btn.dataset.zone; UI.smartRender(app, "full"); });  
  });  
}  

if (activityChips) {  
  const activities = getAvailableActivities();  
  activityChips.innerHTML =  
    `<button class="chip ${app.activity === "all" ? "active" : ""}" data-activity="all" type="button">Tutte</button>` +  
    activities.map(a =>  
      `<button class="chip ${app.activity === a.id ? "active" : ""}" data-activity="${esc(a.id)}" type="button">${a.emoji ? a.emoji + " " : ""}${esc(a.label)}</button>`  
    ).join("");  
  activityChips.querySelectorAll("[data-activity]").forEach(btn => {  
    btn.addEventListener("click", () => { app.activity = btn.dataset.activity; UI.smartRender(app, "full"); });  
  });  
}  

if (favoriteChips) {  
  favoriteChips.innerHTML = `  
    <button class="chip ${app.favoritesFilter === "all"       ? "active" : ""}" data-favoritesfilter="all"       type="button">Tutti</button>  
    <button class="chip ${app.favoritesFilter === "favorites" ? "active" : ""}" data-favoritesfilter="favorites" type="button">Solo preferiti</button>  
  `;  
  favoriteChips.querySelectorAll("[data-favoritesfilter]").forEach(btn => {  
    btn.addEventListener("click", () => { app.favoritesFilter = btn.dataset.favoritesfilter; UI.smartRender(app, "full"); });  
  });  
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
    btn.addEventListener("click", () => { app.sailFilter = btn.dataset.sailfilter; UI.smartRender(app, "full"); });  
  });  
}

}

function renderLegend(app) {
const box = $("mapLegend");
if (!box) return;
box.innerHTML = app.mode === "sail"
?   <div class="legend-item"><span class="legend-dot legend-blue"></span> Spot vela</div>   <div class="legend-item"><span class="legend-dot legend-gold"></span> Spot belli / top acqua</div>   <div class="legend-item"><span class="legend-dot legend-pink"></span> Spot serali</div>   <div class="legend-item"><span class="legend-dot" style="background:#36c275"></span> Riparo notte</div>  
:   <div class="legend-item"><span class="legend-dot legend-gold"></span> Wow</div>   <div class="legend-item"><span class="legend-dot legend-pink"></span> Tramonto</div>   <div class="legend-item"><span class="legend-dot legend-blue"></span> Altri spot</div>  ;
}

function renderTopLists(app) {
const wowBox    = $("topWowList");
const sunsetBox = $("topSunsetList");
if (!wowBox || !sunsetBox) return;

let wowSpots = [];  
if (APP_SPOTS.topWowNames?.length) {  
  wowSpots = APP_SPOTS.topWowNames  
    .map(name => APP_SPOTS.spots.find(s => s.name === name))  
    .filter(Boolean);  
} else {  
  wowSpots = [...APP_SPOTS.spots]  
    .filter(s => s.experience?.wow)  
    .sort((a, b) => (b.experience?.wow || 0) - (a.experience?.wow || 0))  
    .slice(0, 10);  
}  

let sunsetSpots = [];  
if (APP_SPOTS.topSunsetNames?.length) {  
  sunsetSpots = APP_SPOTS.topSunsetNames  
    .map(name => APP_SPOTS.spots.find(s => s.name === name))  
    .filter(Boolean);  
} else {  
  sunsetSpots = [...APP_SPOTS.spots]  
    .filter(s => {  
      const l = (s.light || "").toLowerCase();  
      return l === "tramonto" || l === "sera";  
    })  
    .sort((a, b) => (b.experience?.wow || 0) - (a.experience?.wow || 0))  
    .slice(0, 10);  
}  

const allSpotsMeta = window.APP_UTILS.getAllSpotsWithMeta();  
const metaById     = new Map(allSpotsMeta.map(s => [s.id, s]));  

const renderCard = (spot) => {  
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
// SPOT LIST - SYNC CON APP.nearbySpots
// ═══════════════════════════════════════════════════════════════════════════

function renderSpotList(app) {
const box  = $("spotList");
const note = $("resultNote");
if (!box) return;

let items;  
if (!app.search && app.level === "all" && app.zone === "all" && app.activity === "all" && app.favoritesFilter === "all") {  
   items = app.nearbySpots || window.APP_UTILS.getFilteredSpots();  
} else {  
   items = window.APP_UTILS.getFilteredSpots();  
}  

if (note) {  
  if (app.search) {  
    note.textContent = items.length ? `${items.length} risultati per "${app.search}"` : `Nessuno spot trovato.`;  
  } else {  
    note.textContent = `${items.length} spot disponibili`;  
  }  
}  

if (!items.length) {  
  box.innerHTML = `<div class="detail-empty">Nessuno spot trovato.</div>`;  
  return;  
}  

box.innerHTML = items.map(s => {  
  const fit    = s.weatherFit;  
  const sail   = s.sailMeta;  
  const distLabel = s.distance != null ? window.APP_UTILS.displayDistance(s.distance) : "";  

  return `  
    <div class="spot-card glass tap" data-spot-id="${esc(s.id)}" data-live-dist-id="${esc(s.id)}">  
      <div class="spot-head">  
        <div>  
          <div class="spot-name">${esc(s.name)}</div>  
          <div class="spot-sub">${esc(pretty(s.zone))} · ${esc(pretty(s.activity))}</div>  
        </div>  
        <button class="fav-btn tap" data-fav-id="${esc(s.id)}" type="button">${favIcon(s.id)}</button>  
      </div>  
      <div class="spot-meta">  
        ${s.level === "core" ? `<span class="tag gold">Top</span>` : ""}  
        ${fit ? `<span class="tag ${chipClassFromFit(fit)}">${esc(fit.label)}</span>` : ""}  
        ${s.experience?.wow ? `<span class="tag gold">Wow ${esc(String(s.experience.wow))}/10</span>` : ""}  
        ${app.mode === "sail" && sail?.enabled ? `<span class="tag blue">Vela</span>` : ""}  
      </div>  
      <div class="spot-desc">${esc(s.tip || s.desc || "")}</div>  
      <div class="spot-dist live-dist-label">${esc(distLabel)}</div>  
    </div>  
  `;  
}).join("");  

box.querySelectorAll("[data-spot-id]").forEach(card => {  
  card.addEventListener("click", e => {  
    if (e.target.closest("[data-fav-id]")) return;  
    const enriched = (app.nearbySpots || []).find(s => s.id === card.dataset.spotId) || APP_SPOTS.spots.find(s => s.id === card.dataset.spotId);  
    if (enriched) { window.APP_UTILS.showSpotDetail(enriched); window.APP_UTILS.switchPage("detail"); }  
  });  
});  

box.querySelectorAll("[data-fav-id]").forEach(btn => {  
  btn.addEventListener("click", e => {  
    e.stopPropagation();  
    window.APP_UTILS.toggleFavorite(btn.dataset.favId);  
  });  
});

}

// ═══════════════════════════════════════════════════════════════════════════
// SPOT DETAIL
// ═══════════════════════════════════════════════════════════════════════════

function renderExperienceSection(spot) {
const exp = spot.experience;
if (!exp) return "";
return   <div class="detail-section">   <h3>Esperienza</h3>   <div class="detail-grid">   ${exp.tipo  ?<div class="detail-box"><div class="k">Tipo</div><div class="v">${esc(exp.tipo)}</div></div>: ""}   ${exp.tempo ?<div class="detail-box"><div class="k">Durata</div><div class="v">${esc(exp.tempo)}</div></div>: ""}   ${exp.mood  ?<div class="detail-box"><div class="k">Mood</div><div class="v">${esc(pretty(exp.mood))}</div></div>: ""}   ${exp.wow   ?<div class="detail-box"><div class="k">Wow</div><div class="v">${esc(String(exp.wow))}/10</div></div>: ""}   </div>   </div>  ;
}

function renderWhenSection(spot) {
if (!spot.whenToGo) return "";
return   <div class="detail-section">   <h3>Quando andare</h3>   <p>Momento migliore: <strong>${esc(pretty(spot.whenToGo.best))}</strong>${spot.whenToGo.note ? — ${esc(spot.whenToGo.note)}: ""}</p>   </div>  ;
}

function renderAccessSection(spot) {
const acc = spot.access;
if (!acc) return "";
return   <div class="detail-section">   <h3>Accesso</h3>   <div class="detail-grid">   ${acc.difficolta ?<div class="detail-box"><div class="k">Difficoltà</div><div class="v">${esc(pretty(acc.difficolta))}</div></div>: ""}   ${acc.parcheggio ?<div class="detail-box"><div class="k">Parcheggio</div><div class="v">${esc(acc.parcheggio)}</div></div>        : ""}   ${acc.walk       ?<div class="detail-box"><div class="k">A piedi</div><div class="v">${esc(acc.walk)}</div></div>                 : ""}   ${acc.strada     ?<div class="detail-box"><div class="k">Strada</div><div class="v">${esc(acc.strada)}</div></div>                : ""}   </div>   </div>  ;
}

UI.renderSpotDetail = function (app, rawSpot) {
const box = $("spotDetail");
if (!box || !rawSpot) return;

const spot = rawSpot.weatherFit != null ? rawSpot : ((app.nearbySpots || []).find(s => s.id === rawSpot.id) || rawSpot);  
const sail = spot.sailMeta || (window.SAIL ? window.SAIL.getSpotSailMeta(spot, app) : null);  
  
box.innerHTML = `  
  <div class="detail-hero" style="background-image:url('${esc(spot.image || "")}')">  
    <div class="detail-hero-inner">  
      <h2 class="detail-title">${esc(spot.name)}</h2>  
      <div class="detail-sub">${esc(pretty(spot.zone))} · ${esc(pretty(spot.activity))}</div>  
    </div>  
  </div>  
  <div class="detail-grid">  
    <div class="detail-box"><div class="k">Livello</div><div class="v">${esc(pretty(spot.level))}</div></div>  
    ${spot.distance != null ? `<div class="detail-box"><div class="k">Distanza</div><div class="v live-dist-label" data-live-dist-id="${esc(spot.id)}">${esc(window.APP_UTILS.displayDistance(spot.distance))}</div></div>` : ""}  
    ${spot.altitude != null ? `<div class="detail-box"><div class="k">Altitudine</div><div class="v">${Math.round(spot.altitude)} m</div></div>` : ""}  
  </div>  
  ${spot.desc ? `<div class="detail-section"><p>${esc(spot.desc)}</p></div>` : ""}  
  ${renderExperienceSection(spot)}  
  ${renderWhenSection(spot)}  
  ${renderAccessSection(spot)}  
  <div class="detail-section">  
    <h3>Azioni</h3>  
    <div class="action-grid">  
      <button class="btn btn-primary tap" id="detailMapBtn" type="button">Mappa</button>  
      <button class="btn btn-secondary tap" id="detailFavBtn" type="button">${isFavorite(spot.id) ? "Rimuovi" : "Salva"}</button>  
    </div>  
  </div>  
`;  
$("detailMapBtn")?.addEventListener("click", () => window.APP_UTILS.centerSpot(spot.id));  
$("detailFavBtn")?.addEventListener("click", () => window.APP_UTILS.toggleFavorite(spot.id));

};

UI.renderPlannerBox = function (app) {
const box = $("plannerBox");
if (!box) return;
const slots = [
{ key: "alba", title: "Alba" },
{ key: "main", title: "Spot principale" },
{ key: "tramonto", title: "Tramonto" }
];
box.innerHTML = slots.map(slot => {
const spotId = app.planner[slot.key];
const spot   = spotId ? APP_SPOTS.spots.find(s => s.id === spotId) : null;
return   <div class="planner-slot glass">   <div class="planner-slot-head"><strong>${slot.title}</strong></div>   <div class="planner-slot-name">${spot ? esc(spot.name) : "—"}</div>   ${spot ?<button class="btn tap" data-clear-slot="${slot.key}" style="padding:4px">×</button>: ""}   </div>  ;
}).join("");
box.querySelectorAll("[data-clear-slot]").forEach(btn => {
btn.addEventListener("click", () => window.APP_UTILS.clearPlannerSlot(btn.dataset.clearSlot));
});
};

// ═══════════════════════════════════════════════════════════════════════════
// GPS BOX REATTIVO
// ═══════════════════════════════════════════════════════════════════════════

UI.renderGpsBox = function (app) {
const live = app.userPos;
const speedEl = $("gpsSpeed");
const headEl  = $("gpsHeading");
const altEl   = $("gpsAltitude");

if (speedEl) speedEl.textContent = live?.speed != null ? `${(live.speed * 3.6).toFixed(1)} km/h` : "—";  
if (headEl)  headEl.textContent  = live?.heading != null ? `${Math.round(live.heading)}°` : "—";  
  
// Altitudine: mostra solo se esiste, altrimenti nasconde il blocco genitore se possibile  
if (altEl) {  
  if (live?.altitude != null) {  
    altEl.textContent = `${Math.round(live.altitude)} m`;  
    altEl.closest('.stat')?.classList.remove('hidden');  
  } else {  
    altEl.closest('.stat')?.classList.add('hidden');  
  }  
}

};

// ═══════════════════════════════════════════════════════════════════════════
// RENDER LIGHT (OTTIMIZZATO)
// ═══════════════════════════════════════════════════════════════════════════

UI.renderLight = function (app) {
// 1. GPS Box
UI.renderGpsBox(app);

// 2. Aggiornamento selettivo distanze senza re-render HTML  
const distLabels = document.querySelectorAll(".live-dist-label");  
distLabels.forEach(el => {  
  const id = el.dataset.liveDistId || el.closest("[data-live-dist-id]")?.dataset.liveDistId;  
  if (id) {  
    const spot = (app.nearbySpots || []).find(s => s.id === id) || APP_SPOTS.spots.find(s => s.id === id);  
    if (spot && spot.distance != null) {  
      const newLabel = window.APP_UTILS.displayDistance(spot.distance);  
      if (el.textContent !== newLabel) el.textContent = newLabel;  
    }  
  }  
});  

// 3. Sync Spot vicino in Quick Grid se cambiato radicalmente  
const qcClosest = $("qc-closest");  
if (qcClosest && app.nearbySpots?.[0]) {  
  const currentId = qcClosest.dataset.quickId;  
  const newId = app.nearbySpots[0].id;  
  if (currentId !== newId) renderQuickGrid(app);  
}

};

UI.renderAll = function (app) {
const counts = getSpotCounts();
if ($("eyebrowRegion")) $("eyebrowRegion").textContent = ${APP_SPOTS.region || "Area"} · ${counts.main} spot;
renderStatsGrid(app);
renderHourly(app);
renderFilterBars(app);
renderLegend(app);
renderTopLists(app);
renderSpotList(app);
renderQuickGrid(app);
UI.renderGpsBox(app);
UI.renderPlannerBox(app);
if (app.mode === "travel") UI.renderSunPhase(app);
};

UI.smartRender = function(app, type = "light") {
if (type === "full") UI.renderAll(app);
else UI.renderLight(app);
};

UI.toast = function (message) {
const wrap = $("toastWrap");
if (!wrap) return;
const el = document.createElement("div");
el.className = "toast";
el.textContent = message;
wrap.appendChild(el);
setTimeout(() => {
el.style.opacity = "0";
setTimeout(() => el.remove(), 200);
}, 2000);
};

window.UI = UI;
})();