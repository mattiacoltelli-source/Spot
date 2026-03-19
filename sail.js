(function () {
  "use strict";

  const SAIL = {};

  function hasSailData(spot) {
    return !!(spot && spot.sail && spot.sail.enabled);
  }

  function degDiff(a, b) {
    let d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
  }

  function compassToDeg(dir) {
    const map = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 };
    return map[dir] ?? null;
  }

  function matchDirection(currentDeg, list = []) {
    if (!list.length || currentDeg == null || isNaN(currentDeg)) return true;
    return list.some(dir => {
      const deg = compassToDeg(dir);
      if (deg == null) return false;
      return degDiff(currentDeg, deg) <= 35;
    });
  }

  function getLiveScoreClass(score) {
    if (score == null) return "gold";
    if (score >= 8) return "green";
    if (score >= 5) return "gold";
    return "pink";
  }

  function scoreSpot(spot, app) {
    if (!hasSailData(spot) || !app.weatherData) return null;

    const sail = spot.sail;
    const windKnots = Number(app.weatherData.wind || 0) * 0.539957;
    const windDirDeg = Number(app.weatherData.windDir || 0);
    const waveHeight = Number(app.marineData?.waveHeight || 0);

    let score = 0;

    if (windKnots >= (sail.windMinKnots || 0) && windKnots <= (sail.windMaxKnots || 999)) score += 4;
    else if (windKnots >= (sail.windMinKnots || 0) - 4 && windKnots <= (sail.windMaxKnots || 999) + 4) score += 2;

    if (matchDirection(windDirDeg, sail.windIdealFrom || [])) score += 3;
    if (waveHeight <= (sail.waveMaxMeters || 999)) score += 2;
    if (sail.sailSpot) score += 1;
    if ((sail.beautyScore || 0) >= 4) score += 0.5;
    if (app.sailFilter === "night" && sail.nightShelter) score += 1.5;

    return Number(score.toFixed(1));
  }

  function getLabel(score) {
    if (score == null) return "n/d";
    if (score >= 8) return "ottimo";
    if (score >= 5) return "buono";
    return "così così";
  }

  function getSpotSailMeta(spot, app) {
    if (!hasSailData(spot)) {
      return {
        enabled: false,
        score: 0,
        cls: "gold",
        label: "n/d",
        nightShelter: false,
        beautifulWater: false,
        topWater: false,
        topSunset: false,
        detailText: "",
        sunsetText: ""
      };
    }

    const sail = spot.sail;
    const score = scoreSpot(spot, app);

    return {
      enabled: true,
      score,
      cls: getLiveScoreClass(score),
      label: getLabel(score),
      nightShelter: !!sail.nightShelter,
      beautifulWater: !!sail.beautifulWater,
      topWater: !!sail.topWater,
      topSunset: !!sail.topSunset,
      detailText: sail.sailNotes || "Spot compatibile con modalità vela.",
      sunsetText: sail.beautyNotes || "Spot interessante per luce serale."
    };
  }

  function filterSpotForSailMode(spot, app) {
    const meta = getSpotSailMeta(spot, app);
    if (!meta.enabled) return false;

    switch (app.sailFilter) {
      case "compat":
        return (meta.score || 0) >= 5;
      case "sail":
        return !!spot.sail?.sailSpot;
      case "night":
        return !!spot.sail?.nightShelter;
      case "beautiful":
        return !!spot.sail?.beautifulWater || !!spot.sail?.topWater || (spot.sail?.beautyScore || 0) >= 4;
      default:
        return true;
    }
  }

  function getBestSailSpot(app) {
    const items = APP_SPOTS.spots
      .filter(hasSailData)
      .map(spot => ({ ...spot, sailMeta: getSpotSailMeta(spot, app) }))
      .sort((a, b) => (b.sailMeta.score || 0) - (a.sailMeta.score || 0));

    return items[0] || null;
  }

  function getBestSailSunsetSpot(app) {
    const items = APP_SPOTS.spots
      .filter(hasSailData)
      .map(spot => ({
        ...spot,
        sailMeta: getSpotSailMeta(spot, app),
        sunsetRank: (spot.sail?.sunsetScore || 0) * 2 + (spot.sail?.beautyScore || 0)
      }))
      .sort((a, b) => b.sunsetRank - a.sunsetRank);

    return items[0] || null;
  }

  function getMarkerColor(spot, app) {
    const meta = getSpotSailMeta(spot, app);
    if (!meta.enabled) return "#3c4a5d";
    if (meta.nightShelter) return "#36c275";
    if (meta.topWater || meta.topSunset || meta.beautifulWater) return "#f5c451";
    if ((meta.score || 0) < 5) return "#ff6b6b";
    return "#4da3ff";
  }

  SAIL.hasSailData = hasSailData;
  SAIL.getSpotSailMeta = getSpotSailMeta;
  SAIL.filterSpotForSailMode = filterSpotForSailMode;
  SAIL.getBestSailSpot = getBestSailSpot;
  SAIL.getBestSailSunsetSpot = getBestSailSunsetSpot;
  SAIL.getMarkerColor = getMarkerColor;

  window.SAIL = SAIL;
})();