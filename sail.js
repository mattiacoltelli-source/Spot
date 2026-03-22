(function () {
  "use strict";

  // ─── SAIL MODULE ──────────────────────────────────────────────────────────
  //
  // Modulo opzionale. Se nessuno spot ha sail.enabled = true,
  // il travel mode funziona normalmente senza attivare nulla.
  //
  // Struttura sail nello spot:
  //   sail: {
  //     enabled: true,
  //     windMinKnots: 8,       // vento minimo utile
  //     windMaxKnots: 22,      // vento massimo sicuro
  //     windIdealFrom: ["NW", "N", "NE"],
  //     waveMaxMeters: 1.5,
  //     sailSpot: true,        // spot per navigare (vs ormeggio/relax)
  //     nightShelter: false,   // riparo sicuro per la notte
  //     beautifulWater: false,
  //     topWater: false,
  //     topSunset: false,
  //     beautyScore: 4,        // 1-5 — valore estetico / serata
  //     sunsetScore: 4,        // 1-5 — qualità tramonto
  //     sailNotes: "...",
  //     beautyNotes: "..."
  //   }

  const SAIL = {};

  // ─── UTILITIES ────────────────────────────────────────────────────────────

  function hasSailData(spot) {
    return !!(spot && spot.sail && spot.sail.enabled);
  }

  function safeNum(val, fallback = 0) {
    const n = Number(val);
    return isFinite(n) ? n : fallback;
  }

  function degDiff(a, b) {
    const d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
  }

  function compassToDeg(dir) {
    const map = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 };
    return map[String(dir).toUpperCase()] ?? null;
  }

  // Ritorna un punteggio 0-3 per la direzione del vento:
  //   3 = entro 35° da un'ideale   → direzione ottimale
  //   1 = entro 70° da un'ideale   → accettabile
  //   0 = fuori da tutto            → non ideale
  function directionScore(currentDeg, list = []) {
    if (!list.length || currentDeg == null || !isFinite(currentDeg)) return 1; // neutro se sconosciuto
    let best = Infinity;
    for (const dir of list) {
      const deg = compassToDeg(dir);
      if (deg != null) best = Math.min(best, degDiff(currentDeg, deg));
    }
    if (best <= 35)  return 3;
    if (best <= 70)  return 1;
    return 0;
  }

  // ─── SCORE SPOT ───────────────────────────────────────────────────────────
  //
  // Punteggio composito 0-10.
  //
  // Fattori e pesi massimi:
  //   Vento (range)     → 0-4  (perfetto / accettabile / marginale / fuori)
  //   Direzione vento   → 0-3  (ottimale / accettabile / non ideale)
  //   Onde              → 0-2  (ok / margine / fuori)
  //   sailSpot bonus    → 0-1
  //
  // Totale massimo: 10

  function scoreSpot(spot, app) {
    if (!hasSailData(spot) || !app.weatherData) return null;

    const sail = spot.sail;

    // Dati meteo — con fallback sicuro
    const windKmh    = safeNum(app.weatherData.wind);
    const windKnots  = windKmh * 0.539957;
    const windDirDeg = safeNum(app.weatherData.windDir);
    const waveHeight = safeNum(app.marineData?.waveHeight);

    // Limiti configurati nello spot
    const wMin  = safeNum(sail.windMinKnots, 0);
    const wMax  = safeNum(sail.windMaxKnots, 999);
    const wMax2 = safeNum(sail.waveMaxMeters, 999);

    let score = 0;

    // ── Vento (0-4) ──────────────────────────────────────────────────────
    if (windKnots >= wMin && windKnots <= wMax) {
      // Finestra perfetta: bonus extra se si è nel cuore del range
      const center    = (wMin + wMax) / 2;
      const halfWidth = (wMax - wMin) / 2 || 1;
      const proximity = 1 - Math.min(Math.abs(windKnots - center) / halfWidth, 1);
      score += 3 + proximity; // 3.0 – 4.0
    } else if (windKnots >= wMin - 3 && windKnots < wMin) {
      score += 1.5; // sottovento marginale
    } else if (windKnots > wMax && windKnots <= wMax + 5) {
      score += 1;   // leggermente sopra il limite
    } else if (windKnots > wMax + 5) {
      score -= 1;   // vento eccessivo: penalità
    }
    // vento < wMin - 3: niente punti (troppo poco per navigare)

    // ── Direzione vento (0-3) ────────────────────────────────────────────
    score += directionScore(windDirDeg, sail.windIdealFrom || []);

    // ── Onde (0-2) ───────────────────────────────────────────────────────
    if (waveHeight <= wMax2) {
      // Bonus scalare: onde basse → valore pieno
      const waveFraction = wMax2 > 0 ? waveHeight / wMax2 : 0;
      score += 2 * (1 - waveFraction * 0.5); // 1.0 – 2.0
    } else if (waveHeight <= wMax2 + 0.3) {
      score += 0.5; // margine minimo
    }
    // onde troppo alte: nessun punto

    // ── Bonus sailSpot (0-1) ─────────────────────────────────────────────
    if (sail.sailSpot) score += 1;

    return Math.max(0, Number(score.toFixed(1)));
  }

  // ─── LABEL / CLASS ────────────────────────────────────────────────────────

  function labelFromScore(score) {
    if (score == null) return "n/d";
    if (score >= 8)    return "ottimo";
    if (score >= 5)    return "buono";
    if (score >= 2)    return "marginale";
    return "non ideale";
  }

  function getScoreClass(score) {
    if (score == null) return "gold";
    if (score >= 8)    return "green";
    if (score >= 5)    return "gold";
    return "pink";
  }

  // ─── META SPOT ────────────────────────────────────────────────────────────

  function getSpotSailMeta(spot, app) {
    if (!hasSailData(spot)) {
      return {
        enabled:        false,
        score:          0,
        label:          "n/d",
        cls:            "gold",
        nightShelter:   false,
        beautifulWater: false,
        topWater:       false,
        topSunset:      false,
        detailText:     "",
        sunsetText:     ""
      };
    }

    const sail  = spot.sail;
    const score = scoreSpot(spot, app);

    return {
      enabled:        true,
      score,
      label:          labelFromScore(score),
      cls:            getScoreClass(score),
      nightShelter:   !!sail.nightShelter,
      beautifulWater: !!sail.beautifulWater,
      topWater:       !!sail.topWater,
      topSunset:      !!sail.topSunset,
      detailText:     sail.sailNotes   || "Spot compatibile con modalità vela.",
      sunsetText:     sail.beautyNotes || "Spot interessante per luce serale."
    };
  }

  // ─── FILTRO SAIL MODE ─────────────────────────────────────────────────────

  function filterSpotForSailMode(spot, app) {
    const meta = getSpotSailMeta(spot, app);
    if (!meta.enabled) return false;

    switch (app.sailFilter) {
      case "compat":    return (meta.score || 0) >= 5;
      case "sail":      return !!spot.sail?.sailSpot;
      case "night":     return !!spot.sail?.nightShelter;
      case "beautiful": return !!spot.sail?.beautifulWater || !!spot.sail?.topWater || safeNum(spot.sail?.beautyScore) >= 4;
      default:          return true;
    }
  }

  // ─── BEST SPOT SELECTORS ──────────────────────────────────────────────────

  function getBestSailSpot(app) {
    const items = (window.APP_SPOTS?.spots || [])
      .filter(hasSailData)
      .map(spot => ({ ...spot, sailMeta: getSpotSailMeta(spot, app) }))
      .sort((a, b) => (b.sailMeta.score || 0) - (a.sailMeta.score || 0));
    return items[0] || null;
  }

  // Seleziona il miglior spot per la serata / tramonto in sail mode.
  // Bilancia tre fattori:
  //   sunsetScore × 2   → qualità intrinseca per il tramonto
  //   beautyScore       → valore estetico generale
  //   score live × 0.4  → compatibilità attuale (peso ridotto: siamo in sosta, non navigando)
  // Penalizza gli spot con score live molto basso (< 2) per evitare di suggerire
  // posti in condizioni proibitive anche per stare ormeggiati.

  function getBestSailSunsetSpot(app) {
    const items = (window.APP_SPOTS?.spots || [])
      .filter(hasSailData)
      .map(spot => {
        const meta       = getSpotSailMeta(spot, app);
        const liveScore  = meta.score || 0;
        const livePenalty = liveScore < 2 ? -3 : 0; // penalizza condizioni proibitive
        const sunsetRank =
          safeNum(spot.sail?.sunsetScore) * 2 +
          safeNum(spot.sail?.beautyScore) +
          liveScore * 0.4 +
          livePenalty;
        return { ...spot, sailMeta: meta, sunsetRank };
      })
      .sort((a, b) => b.sunsetRank - a.sunsetRank);
    return items[0] || null;
  }

  // ─── MARKER COLOR ─────────────────────────────────────────────────────────

  function getMarkerColor(spot, app) {
    const meta = getSpotSailMeta(spot, app);
    if (!meta.enabled)                                            return "#3c4a5d";
    if (meta.nightShelter)                                        return "#36c275";
    if (meta.topWater || meta.topSunset || meta.beautifulWater)   return "#f5c451";
    if ((meta.score || 0) < 5)                                    return "#ff6b6b";
    return "#4da3ff";
  }

  // ─── EXPORT ───────────────────────────────────────────────────────────────

  SAIL.hasSailData           = hasSailData;
  SAIL.getSpotSailMeta       = getSpotSailMeta;
  SAIL.filterSpotForSailMode = filterSpotForSailMode;
  SAIL.getBestSailSpot       = getBestSailSpot;
  SAIL.getBestSailSunsetSpot = getBestSailSunsetSpot;
  SAIL.getMarkerColor        = getMarkerColor;

  window.SAIL = SAIL;
})();
