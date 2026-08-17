(function () {
  "use strict";

  const SAIL = {};

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

  function directionScore(currentDeg, list = []) {
    if (!list.length || currentDeg == null || !isFinite(currentDeg)) return 1;
    let best = Infinity;
    for (const dir of list) {
      const deg = compassToDeg(dir);
      if (deg != null) best = Math.min(best, degDiff(currentDeg, deg));
    }
    if (best <= 35)  return 3;
    if (best <= 70)  return 1;
    return 0;
  }

  function scoreSpot(spot, app) {
    if (!hasSailData(spot) || !app.weatherData) return null;

    const sail = spot.sail;

    const windKmh    = safeNum(app.weatherData.wind);
    const windKnots  = windKmh * 0.539957;
    const windDirDeg = safeNum(app.weatherData.windDir);
    const waveHeight = safeNum(app.marineData?.waveHeight);

    const wMin  = safeNum(sail.windMinKnots, 0);
    const wMax  = safeNum(sail.windMaxKnots, 999);
    const wMax2 = safeNum(sail.waveMaxMeters, 999);

    let score = 0;

    if (windKnots >= wMin && windKnots <= wMax) {
      const center    = (wMin + wMax) / 2;
      const halfWidth = (wMax - wMin) / 2 || 1;
      const proximity = 1 - Math.min(Math.abs(windKnots - center) / halfWidth, 1);
      score += 3 + proximity;
    } else if (windKnots >= wMin - 3 && windKnots < wMin) {
      score += 1.5;
    } else if (windKnots > wMax && windKnots <= wMax + 5) {
      score += 1;
    } else if (windKnots > wMax + 5) {
      score -= 1;
    }

    score += directionScore(windDirDeg, sail.windIdealFrom || []);

    if (waveHeight <= wMax2) {
      const waveFraction = wMax2 > 0 ? waveHeight / wMax2 : 0;
      score += 2 * (1 - waveFraction * 0.5);
    } else if (waveHeight <= wMax2 + 0.3) {
      score += 0.5;
    }

    if (sail.sailSpot) score += 1;

    return Math.max(0, Number(score.toFixed(1)));
  }

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

  function getBestSailSpot(app) {
    const items = (window.APP_SPOTS?.spots || [])
      .filter(hasSailData)
      .map(spot => ({ ...spot, sailMeta: getSpotSailMeta(spot, app) }))
      .sort((a, b) => (b.sailMeta.score || 0) - (a.sailMeta.score || 0));
    return items[0] || null;
  }

  function getBestSailSunsetSpot(app) {
    const items = (window.APP_SPOTS?.spots || [])
      .filter(hasSailData)
      .map(spot => {
        const meta       = getSpotSailMeta(spot, app);
        const liveScore  = meta.score || 0;
        const livePenalty = liveScore < 2 ? -3 : 0;
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

  function getMarkerColor(spot, app) {
    const meta = getSpotSailMeta(spot, app);
    if (!meta.enabled)                                            return "#3c4a5d";
    if (meta.nightShelter)                                        return "#36c275";
    if (meta.topWater || meta.topSunset || meta.beautifulWater)   return "#f5c451";
    if ((meta.score || 0) < 5)                                    return "#ff6b6b";
    return "#4da3ff";
  }

  SAIL.hasSailData           = hasSailData;
  SAIL.getSpotSailMeta       = getSpotSailMeta;
  SAIL.filterSpotForSailMode = filterSpotForSailMode;
  SAIL.getBestSailSpot       = getBestSailSpot;
  SAIL.getBestSailSunsetSpot = getBestSailSunsetSpot;
  SAIL.getMarkerColor        = getMarkerColor;

  window.SAIL = SAIL;
})();
