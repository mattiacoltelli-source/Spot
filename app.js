// ===============================
// CONFIGURAZIONE APP
// ===============================
const CONFIG = {
  OPENTRIPMAP_API_KEY: "7c3c863f5ce9759b81a87bc9c5e111065309a185f63464bdadefd4e4991333d5",
  OPENTRIPMAP_BASE_URL: "https://api.opentripmap.com/0.1/en/places",
  NOMINATIM_BASE_URL: "https://nominatim.openstreetmap.org/search"
};

// ===============================
// ELEMENTI DOM
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

// ===============================
// EVENTI
// ===============================
searchBtn.addEventListener("click", handleSearch);
exampleBtn.addEventListener("click", () => {
  cityInput.value = "Firenze";
  handleSearch();
});

cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleSearch();
  }
});

// ===============================
// FUNZIONI PRINCIPALI
// ===============================
async function handleSearch() {
  const query = cityInput.value.trim();

  if (!query) {
    setStatus("error", "Inserisci una città prima di cercare.");
    renderEmpty("Scrivi una città per iniziare.");
    hideLocation();
    return;
  }

  try {
    setStatus("loading", `Cerco "${query}"...`);
    renderEmpty("Sto cercando il luogo...");
    hideLocation();

    const location = await geocodePlace(query);

    if (!location) {
      throw new Error("Luogo non trovato.");
    }

    showLocation(location);
    setStatus("loading", `Luogo trovato. Cerco gli spot vicini...`);

    const spots = await fetchNearbySpots(location.lat, location.lon);

    if (!spots.length) {
      setStatus("error", "Nessuno spot trovato vicino a questa zona.");
      renderEmpty("Non ho trovato spot utili in quest'area.");
      return;
    }

    const enrichedSpots = spots
      .map((spot) => ({
        ...spot,
        distanceKm: calculateDistanceKm(location.lat, location.lon, spot.point.lat, spot.point.lon)
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 12);

    renderSpots(enrichedSpots);
    setStatus("success", `Trovati ${enrichedSpots.length} spot vicino a ${location.name}.`);
  } catch (error) {
    console.error(error);
    setStatus("error", error.message || "Errore durante la ricerca.");
    renderEmpty("Si è verificato un errore. Riprova.");
    hideLocation();
  }
}

// ===============================
// API CALLS
// ===============================
async function geocodePlace(query) {
  const url = `${CONFIG.NOMINATIM_BASE_URL}?format=jsonv2&q=${encodeURIComponent(query)}&limit=1`;

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
  const radius = 10000;
  const limit = 30;
  const kinds = [
    "view_points",
    "interesting_places",
    "natural",
    "architecture",
    "historic",
    "bridges",
    "beaches"
  ].join(",");

  const url =
    `${CONFIG.OPENTRIPMAP_BASE_URL}/radius` +
    `?radius=${radius}` +
    `&lon=${lon}` +
    `&lat=${lat}` +
    `&limit=${limit}` +
    `&rate=2` +
    `&format=json` +
    `&kinds=${encodeURIComponent(kinds)}` +
    `&apikey=${CONFIG.OPENTRIPMAP_API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Errore nel recupero degli spot da OpenTripMap.");
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter((item) => item.name && item.point && item.point.lat && item.point.lon);
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
      return "Ricerca...";
    case "success":
      return "Ok";
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
  const name = spot.name || "Spot senza nome";
  const kinds = formatKinds(spot.kinds);
  const lat = spot.point?.lat ?? 0;
  const lon = spot.point?.lon ?? 0;
  const distance = `${spot.distanceKm.toFixed(1)} km`;

  return `
    <article class="spot-card">
      <h3>${escapeHtml(name)}</h3>

      <div class="spot-meta">
        <span class="tag">${escapeHtml(kinds)}</span>
      </div>

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
    </article>
  `;
}

// ===============================
// UTILS
// ===============================
function formatKinds(kindsString = "") {
  const firstKind = kindsString.split(",")[0]?.trim() || "spot";
  return firstKind
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
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

// ===============================
// STATO INIZIALE
// ===============================
renderEmpty("Inserisci una città oppure premi “Usa esempio”.");