const APP_VERSION = "v6-fallback";

const CONFIG = {
  OPENTRIPMAP_API_KEY: "49233ef14675352094db78f9021de6d6d0e20d0d9355a451f8bf8713380f8feb",
  OPENTRIPMAP_BASE_URL: "https://api.opentripmap.com/0.1/en/places",
  NOMINATIM_URL: "https://nominatim.openstreetmap.org/search",
  OVERPASS_URL: "https://overpass-api.de/api/interpreter"
};

// ===============================
// DOM
// ===============================
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const exampleBtn = document.getElementById("exampleBtn");

const statusBadge = document.getElementById("statusBadge");
const statusText = document.getElementById("statusText");

const locationCard = document.getElementById("locationCard");
const placeName = document.getElementById("placeName");
const placeLat = document.getElementById("placeLat");
const placeLon = document.getElementById("placeLon");

const resultsGrid = document.getElementById("resultsGrid");
const resultsCount = document.getElementById("resultsCount");
const mapHint = document.getElementById("mapHint");

// ===============================
// MAPPA
// ===============================
let map = null;
let cityMarker = null;
let spotMarkers = [];

initMap();

// ===============================
// EVENTI
// ===============================
searchBtn.addEventListener("click", handleSearch);

exampleBtn.addEventListener("click", () => {
  cityInput.value = "Firenze";
  handleSearch();
});

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});

// ===============================
// AVVIO
// ===============================
console.log("PhotoSpot Planner", APP_VERSION);
renderEmpty('Inserisci una città oppure premi "Usa esempio".');
setStatus("idle", `Pronto (${APP_VERSION})`);

// ===============================
// FUNZIONE PRINCIPALE
// ===============================
async function handleSearch() {
  const query = cityInput.value.trim();

  if (!query) {
    setStatus("error", "Inserisci una città.");
    return;
  }

  try {
    setStatus("loading", `Cerco città... (${APP_VERSION})`);
    renderEmpty("Sto cercando il luogo...");
    clearSpotMarkers();

    const location = await geocodePlace(query);

    if (!location) {
      throw new Error("Città non trovata.");
    }

    showLocation(location);
    centerMapOnCity(location);

    setStatus("loading", "Cerco spot fotografici...");

    let spots = [];
    let sourceLabel = "";

    try {
      spots = await fetchNearbySpotsOpenTripMap(location.lat, location.lon);
      sourceLabel = "OpenTripMap";
    } catch (otpError) {
      console.warn("OpenTripMap non disponibile, passo a Overpass.", otpError);
      spots = await fetchNearbySpotsOverpass(location.lat, location.lon);
      sourceLabel = "OpenStreetMap";
    }

    if (!spots.length) {
      setStatus("error", "Nessuno spot trovato.");
      renderEmpty("Non ho trovato spot utili in quest'area.");
      if (mapHint) mapHint.textContent = "Nessuno spot visibile";
      return;
    }

    const enrichedSpots = spots
      .map((spot) => ({
        ...spot,
        distanceKm: calculateDistanceKm(
          location.lat,
          location.lon,
          spot.point.lat,
          spot.point.lon
        )
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 30);

    renderSpots(enrichedSpots);
    renderMarkers(enrichedSpots, location);

    if (mapHint) {
      mapHint.textContent = `${enrichedSpots.length} spot • fonte: ${sourceLabel}`;
    }

    setStatus("success", `${enrichedSpots.length} spot trovati • fonte: ${sourceLabel}`);
  } catch (error) {
    console.error(error);
    setStatus("error", `Errore nella ricerca (${APP_VERSION})`);
    renderEmpty("Si è verificato un errore. Riprova.");
    if (mapHint) mapHint.textContent = "Errore mappa";
  }
}

// ===============================
// GEOCODING
// ===============================
async function geocodePlace(query) {
  const url =
    `${CONFIG.NOMINATIM_URL}?format=json&q=${encodeURIComponent(query)}&limit=1`;

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

// ===============================
// OPEN TRIP MAP
// ===============================
async function fetchNearbySpotsOpenTripMap(lat, lon) {
  const radius = 10000;
  const limit = 30;

  const url =
    `${CONFIG.OPENTRIPMAP_BASE_URL}/radius` +
    `?radius=${radius}` +
    `&lon=${lon}` +
    `&lat=${lat}` +
    `&limit=${limit}` +
    `&format=json` +
    `&apikey=${CONFIG.OPENTRIPMAP_API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`OpenTripMap HTTP ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Risposta OpenTripMap non valida.");
  }

  return data
    .filter((item) => item && item.name && item.point && isFinite(item.point.lat) && isFinite(item.point.lon))
    .map((item) => ({
      name: item.name,
      point: {
        lat: Number(item.point.lat),
        lon: Number(item.point.lon)
      }
    }));
}

// ===============================
// OVERPASS FALLBACK
// ===============================
async function fetchNearbySpotsOverpass(lat, lon) {
  const radius = 6000;

  const query = `
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

  const response = await fetch(CONFIG.OVERPASS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain"
    },
    body: query
  });

  if (!response.ok) {
    throw new Error(`Overpass HTTP ${response.status}`);
  }

  const data = await response.json();

  if (!data || !Array.isArray(data.elements)) {
    throw new Error("Risposta Overpass non valida.");
  }

  const spots = data.elements
    .map((item) => {
      const latValue = item.lat ?? item.center?.lat;
      const lonValue = item.lon ?? item.center?.lon;
      const nameValue = item.tags?.name;

      if (!nameValue || !isFinite(latValue) || !isFinite(lonValue)) {
        return null;
      }

      return {
        name: nameValue,
        point: {
          lat: Number(latValue),
          lon: Number(lonValue)
        }
      };
    })
    .filter(Boolean);

  return dedupeSpots(spots);
}

function dedupeSpots(spots) {
  const seen = new Set();

  return spots.filter((spot) => {
    const key = `${spot.name}|${spot.point.lat.toFixed(4)}|${spot.point.lon.toFixed(4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ===============================
// MAPPA
// ===============================
function initMap() {
  const mapEl = document.getElementById("map");
  if (!mapEl || typeof L === "undefined") return;

  map = L.map("map", {
    zoomControl: true
  }).setView([41.9, 12.49], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
}

function centerMapOnCity(location) {
  if (!map) return;

  if (cityMarker) {
    map.removeLayer(cityMarker);
  }

  map.setView([location.lat, location.lon], 12);

  cityMarker = L.marker([location.lat, location.lon]).addTo(map);
  cityMarker.bindPopup(`<strong>${escapeHtml(location.name)}</strong><br>Città cercata`);
}

function clearSpotMarkers() {
  if (!map) return;

  spotMarkers.forEach((marker) => map.removeLayer(marker));
  spotMarkers = [];
}

function renderMarkers(spots, location) {
  if (!map) return;

  clearSpotMarkers();

  const bounds = [];
  bounds.push([location.lat, location.lon]);

  spots.forEach((spot) => {
    const lat = spot.point.lat;
    const lon = spot.point.lon;

    const marker = L.marker([lat, lon]).addTo(map);

    marker.bindPopup(`
      <strong>${escapeHtml(spot.name)}</strong><br>
      ${escapeHtml(spot.distanceKm.toFixed(1))} km dal centro<br>
      <a href="${buildGoogleMapsLink(lat, lon)}" target="_blank" rel="noopener noreferrer">
        Apri in Google Maps
      </a>
    `);

    spotMarkers.push(marker);
    bounds.push([lat, lon]);
  });

  if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [30, 30] });
  }
}

// ===============================
// UI
// ===============================
function setStatus(type, text) {
  statusBadge.className = `badge ${type}`;
  statusBadge.textContent = getBadgeLabel(type);
  statusText.textContent = text;
}

function getBadgeLabel(type) {
  switch (type) {
    case "loading":
      return "Ricerca";
    case "success":
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

function renderSpots(spots) {
  resultsCount.textContent = `${spots.length} risultati`;
  resultsGrid.innerHTML = spots.map(createSpotCard).join("");
}

function renderEmpty(message) {
  resultsCount.textContent = "0 risultati";
  resultsGrid.innerHTML = `
    <div class="empty-state">
      ${escapeHtml(message)}
    </div>
  `;
}

function createSpotCard(spot) {
  const name = spot.name || "Spot";
  const lat = spot.point.lat;
  const lon = spot.point.lon;
  const distance = isFinite(spot.distanceKm) ? `${spot.distanceKm.toFixed(1)} km` : "-";

  return `
    <article class="spot-card">
      <h3>${escapeHtml(name)}</h3>

      <div class="spot-info">
        <div class="spot-info-item">
          <span class="small">Distanza</span>
          <span>${escapeHtml(distance)}</span>
        </div>
        <div class="spot-info-item">
          <span class="small">Coordinate</span>
          <span>${lat.toFixed(4)}, ${lon.toFixed(4)}</span>
        </div>
      </div>

      <div class="card-actions">
        <a
          class="map-link"
          href="${buildGoogleMapsLink(lat, lon)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Apri in Google Maps
        </a>
      </div>
    </article>
  `;
}

// ===============================
// UTILS
// ===============================
function buildGoogleMapsLink(lat, lon) {
  return `https://www.google.com/maps?q=${lat},${lon}`;
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}