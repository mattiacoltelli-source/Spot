const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const exampleBtn = document.getElementById("exampleBtn");

const statusBadge = document.getElementById("statusBadge");
const statusText = document.getElementById("statusText");

const photographerCard = document.getElementById("photographerCard");
const photographerBadge = document.getElementById("photographerBadge");
const photographerText = document.getElementById("photographerText");

const locationCard = document.getElementById("locationCard");
const placeName = document.getElementById("placeName");
const placeLat = document.getElementById("placeLat");
const placeLon = document.getElementById("placeLon");

const resultsGrid = document.getElementById("resultsGrid");
const resultsCount = document.getElementById("resultsCount");

const activeFilterLabel = document.getElementById("activeFilterLabel");
const filterButtons = document.querySelectorAll(".filter-btn");
const sortSelect = document.getElementById("sortSelect");

const APP_VERSION = "lite-3";

let allSpots = [];
let currentFilter = "all";
let currentLocation = null;
let favoriteKeys = loadFavorites();

searchBtn.addEventListener("click", handleSearch);

exampleBtn.addEventListener("click", () => {
  cityInput.value = "Bologna";
  handleSearch();
});

cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleSearch();
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    updateFilterButtons();
    applyFilterAndRender();
  });
});

sortSelect.addEventListener("change", () => {
  applyFilterAndRender();
});

setStatus("idle", `Pronto (${APP_VERSION})`);
renderEmpty('Inserisci una città oppure premi "Usa esempio".');
updateFilterButtons();
updatePhotographerCard(null);

async function handleSearch() {
  const query = cityInput.value.trim();

  if (!query) {
    setStatus("error", "Inserisci una città.");
    renderEmpty("Scrivi una città per iniziare.");
    hideLocation();
    updatePhotographerCard(null);
    return;
  }

  try {
    setStatus("idle", "Cerco la città...");
    renderEmpty("Sto cercando il luogo...");
    hideLocation();

    const location = await geocodePlace(query);

    if (!location) {
      throw new Error("Città non trovata.");
    }

    currentLocation = location;
    showLocation(location);

    setStatus("idle", "Cerco spot vicini...");

    const spots = await fetchNearbySpots(location.lat, location.lon);

    if (!spots.length) {
      allSpots = [];
      setStatus("error", "Nessuno spot trovato.");
      renderEmpty("Non ho trovato spot utili in quest'area.");
      updatePhotographerCard(null);
      return;
    }

    allSpots = spots
      .map((spot) => {
        const sun = calculateSunTimes(new Date(), spot.lat, spot.lon);

        return {
          ...spot,
          distanceKm: calculateDistanceKm(
            location.lat,
            location.lon,
            spot.lat,
            spot.lon
          ),
          sunrise: formatTime(sun.sunrise),
          sunset: formatTime(sun.sunset),
          goldenHour: formatTime(sun.goldenHour),
          goldenMinutes: diffMinutesFromNow(sun.goldenHour),
          favoriteKey: buildSpotKey(spot)
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 20);

    applyFilterAndRender();
    updatePhotographerInsights();

    setStatus("ok", `${allSpots.length} spot trovati`);
  } catch (error) {
    console.error(error);
    setStatus("error", error.message || "Errore nella ricerca.");
    renderEmpty("Si è verificato un errore. Riprova.");
    hideLocation();
    updatePhotographerCard(null);
  }
}

async function geocodePlace(query) {
  const url =
    "https://nominatim.openstreetmap.org/search?format=jsonv2&q=" +
    encodeURIComponent(query) +
    "&limit=1";

  const response = await fetch(url, {
    headers: {
      "Accept-Language": "it"
    }
  });

  if (!response.ok) {
    throw new Error("Errore nella ricerca della città.");
  }

  const data = await response.json();

  if (!Array.isArray(data) || !data.length) {
    return null;
  }

  const item = data[0];

  return {
    name: item.display_name,
    lat: Number(item.lat),
    lon: Number(item.lon)
  };
}

async function fetchNearbySpots(lat, lon) {
  const radius = 6000;

  const overpassQuery = `
    [out:json][timeout:25];
    (
      node(around:${radius},${lat},${lon})["tourism"];
      node(around:${radius},${lat},${lon})["natural"];
      node(around:${radius},${lat},${lon})["historic"];
      node(around:${radius},${lat},${lon})["amenity"="viewpoint"];
      way(around:${radius},${lat},${lon})["tourism"];
      way(around:${radius},${lat},${lon})["natural"];
      way(around:${radius},${lat},${lon})["historic"];
      way(around:${radius},${lat},${lon})["amenity"="viewpoint"];
    );
    out center;
  `;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain"
    },
    body: overpassQuery
  });

  if (!response.ok) {
    throw new Error("Errore nel recupero degli spot.");
  }

  const data = await response.json();

  if (!data || !Array.isArray(data.elements)) {
    return [];
  }

  const spots = data.elements
    .map((item) => {
      const itemLat = item.lat ?? item.center?.lat;
      const itemLon = item.lon ?? item.center?.lon;
      const name = item.tags?.name;

      if (!name || !isFinite(itemLat) || !isFinite(itemLon)) {
        return null;
      }

      return {
        name,
        lat: Number(itemLat),
        lon: Number(itemLon),
        category: pickCategory(item.tags)
      };
    })
    .filter(Boolean);

  return dedupeSpots(spots);
}

function pickCategory(tags = {}) {
  if (tags.amenity === "viewpoint") return "viewpoint";
  if (tags.natural) return "natura";
  if (tags.historic) return "storico";
  if (tags.tourism) return "turismo";
  return "spot";
}

function dedupeSpots(spots) {
  const seen = new Set();

  return spots.filter((spot) => {
    const key = `${spot.name}|${spot.lat.toFixed(4)}|${spot.lon.toFixed(4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function applyFilterAndRender() {
  let filtered =
    currentFilter === "all"
      ? [...allSpots]
      : currentFilter === "favorites"
      ? allSpots.filter((spot) => favoriteKeys.includes(spot.favoriteKey))
      : allSpots.filter((spot) => spot.category === currentFilter);

  const sortBy = sortSelect.value;

  if (sortBy === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name, "it"));
  } else if (sortBy === "golden") {
    filtered.sort((a, b) => normalizeGoldenScore(a.goldenMinutes) - normalizeGoldenScore(b.goldenMinutes));
  } else {
    filtered.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  activeFilterLabel.textContent = humanizeFilter(currentFilter);

  if (!filtered.length) {
    resultsCount.textContent = "0 risultati";
    renderEmpty("Nessuno spot per questo filtro.");
    return;
  }

  renderSpots(filtered);
}

function normalizeGoldenScore(minutes) {
  if (!isFinite(minutes)) return 999999;
  if (minutes < 0) return 500000 + Math.abs(minutes);
  return minutes;
}

function updateFilterButtons() {
  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === currentFilter);
  });
}

function humanizeFilter(filter) {
  switch (filter) {
    case "natura":
      return "Natura";
    case "storico":
      return "Storico";
    case "viewpoint":
      return "Viewpoint";
    case "turismo":
      return "Turismo";
    case "favorites":
      return "Preferiti";
    default:
      return "Tutti";
  }
}

function updatePhotographerInsights() {
  if (!allSpots.length) {
    updatePhotographerCard(null);
    return;
  }

  const upcoming = [...allSpots]
    .filter((spot) => isFinite(spot.goldenMinutes) && spot.goldenMinutes >= 0)
    .sort((a, b) => a.goldenMinutes - b.goldenMinutes);

  if (!upcoming.length) {
    updatePhotographerCard({
      badge: "Info",
      text: "Per oggi la golden hour utile è già passata. Puoi comunque esplorare gli spot e salvare i preferiti."
    });
    return;
  }

  const bestNow = upcoming.slice(0, 3);
  const first = bestNow[0];

  const spotNames = bestNow.map((spot) => spot.name).join(" • ");

  updatePhotographerCard({
    badge: "Ora",
    text: `Golden hour tra ${first.goldenMinutes} min. Spot consigliati adesso: ${spotNames}.`
  });
}

function updatePhotographerCard(data) {
  if (!data) {
    photographerCard.classList.add("hidden");
    photographerBadge.textContent = "Analisi";
    photographerText.textContent = "Nessuna analisi disponibile.";
    return;
  }

  photographerCard.classList.remove("hidden");
  photographerBadge.textContent = data.badge;
  photographerText.textContent = data.text;
}

function setStatus(type, text) {
  statusBadge.className = `badge ${type}`;
  statusBadge.textContent = getBadgeLabel(type);
  statusText.textContent = text;
}

function getBadgeLabel(type) {
  switch (type) {
    case "ok":
      return "OK";
    case "error":
      return "Errore";
    default:
      return "In attesa";
  }
}

function showLocation(location) {
  locationCard.classList.remove("hidden");
  placeName.textContent = location.name;
  placeLat.textContent = location.lat.toFixed(5);
  placeLon.textContent = location.lon.toFixed(5);
}

function hideLocation() {
  locationCard.classList.add("hidden");
  placeName.textContent = "-";
  placeLat.textContent = "-";
  placeLon.textContent = "-";
}

function renderSpots(spots) {
  resultsCount.textContent = `${spots.length} risultati`;

  resultsGrid.innerHTML = spots.map((spot) => {
    const isFav = favoriteKeys.includes(spot.favoriteKey);

    return `
      <article class="spot-card">
        <div class="spot-header">
          <div class="spot-title-wrap">
            <div class="spot-title">${escapeHtml(spot.name)}</div>
            <div class="spot-subline">${spot.distanceKm.toFixed(1)} km dal centro</div>
          </div>

          <div class="spot-category">${escapeHtml(humanizeFilter(spot.category))}</div>
        </div>

        <div class="spot-grid">
          <div class="spot-box">
            <div class="spot-box-label">Coordinate</div>
            <div class="spot-box-value">${spot.lat.toFixed(4)}, ${spot.lon.toFixed(4)}</div>
          </div>

          <div class="spot-box">
            <div class="spot-box-label">Alba</div>
            <div class="spot-box-value">${spot.sunrise}</div>
          </div>

          <div class="spot-box">
            <div class="spot-box-label">Tramonto</div>
            <div class="spot-box-value">${spot.sunset}</div>
          </div>

          <div class="spot-box">
            <div class="spot-box-label">Golden hour</div>
            <div class="spot-box-value">${spot.goldenHour}</div>
          </div>
        </div>

        <div class="spot-actions">
          <a class="spot-link" href="${buildGoogleMapsLink(spot.lat, spot.lon)}" target="_blank" rel="noopener noreferrer">
            Apri in Maps
          </a>

          <a class="spot-link secondary" href="${buildNavigationLink(spot.lat, spot.lon)}" target="_blank" rel="noopener noreferrer">
            Naviga
          </a>

          <button class="favorite-btn ${isFav ? "active" : ""}" onclick="toggleFavorite('${escapeForJs(spot.favoriteKey)}')">
            ${isFav ? "❤️ Salvato" : "🤍 Salva"}
          </button>
        </div>
      </article>
    `;
  }).join("");
}

function renderEmpty(message) {
  resultsGrid.innerHTML = `
    <div class="spot-card">
      <div class="spot-subline">${escapeHtml(message)}</div>
    </div>
  `;
}

function buildGoogleMapsLink(lat, lon) {
  return `https://www.google.com/maps?q=${lat},${lon}`;
}

function buildNavigationLink(lat, lon) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
}

function buildSpotKey(spot) {
  return `${spot.name}|${spot.lat.toFixed(4)}|${spot.lon.toFixed(4)}`;
}

function toggleFavorite(key) {
  if (favoriteKeys.includes(key)) {
    favoriteKeys = favoriteKeys.filter((item) => item !== key);
  } else {
    favoriteKeys.push(key);
  }

  saveFavorites(favoriteKeys);
  applyFilterAndRender();
}

window.toggleFavorite = toggleFavorite;

function loadFavorites() {
  try {
    const raw = localStorage.getItem("photospot-favorites");
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveFavorites(list) {
  localStorage.setItem("photospot-favorites", JSON.stringify(list));
}

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function formatTime(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "--:--";
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function diffMinutesFromNow(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return NaN;
  const diffMs = date.getTime() - Date.now();
  return Math.round(diffMs / 60000);
}

function calculateSunTimes(date, lat, lon) {
  const rad = Math.PI / 180;
  const dayMs = 86400000;
  const J1970 = 2440588;
  const J2000 = 2451545;

  const toJulian = (dateObj) => dateObj.getTime() / dayMs - 0.5 + J1970;
  const fromJulian = (j) => new Date((j + 0.5 - J1970) * dayMs);
  const toDays = (dateObj) => toJulian(dateObj) - J2000;

  const e = rad * 23.4397;

  const solarMeanAnomaly = (d) => rad * (357.5291 + 0.98560028 * d);
  const eclipticLongitude = (M) => {
    const C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
    const P = rad * 102.9372;
    return M + C + P + Math.PI;
  };

  const declination = (L) => Math.asin(Math.sin(L) * Math.sin(e));
  const julianCycle = (d, lw) => Math.round(d - 0.0009 - lw / (2 * Math.PI));
  const approxTransit = (Ht, lw, n) => 0.0009 + (Ht + lw) / (2 * Math.PI) + n;
  const solarTransitJ = (ds, M, L) => J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
  const hourAngle = (h, phi, d) =>
    Math.acos((Math.sin(h) - Math.sin(phi) * Math.sin(d)) / (Math.cos(phi) * Math.cos(d)));

  const observerAngle = -0.833 * rad;
  const goldenAngle = 6 * rad * -1;

  const lw = rad * -lon;
  const phi = rad * lat;
  const d = toDays(date);

  const n = julianCycle(d, lw);
  const ds = approxTransit(0, lw, n);
  const M = solarMeanAnomaly(ds);
  const L = eclipticLongitude(M);
  const dec = declination(L);
  const Jnoon = solarTransitJ(ds, M, L);

  const wSunrise = hourAngle(observerAngle, phi, dec);
  const aSunrise = approxTransit(wSunrise, lw, n);
  const Jset = solarTransitJ(aSunrise, M, L);
  const Jrise = Jnoon - (Jset - Jnoon);

  const wGolden = hourAngle(goldenAngle, phi, dec);
  const aGolden = approxTransit(wGolden, lw, n);
  const JgoldenSet = solarTransitJ(aGolden, M, L);

  return {
    sunrise: fromJulian(Jrise),
    sunset: fromJulian(Jset),
    goldenHour: fromJulian(JgoldenSet)
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeForJs(value) {
  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'");
}