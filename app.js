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
// FUNZIONE PRINCIPALE
// ===============================

async function handleSearch() {

  const query = cityInput.value.trim();

  if (!query) {
    setStatus("error", "Inserisci una città prima di cercare.");
    return;
  }

  try {

    setStatus("loading", `Cerco "${query}"...`);

    const location = await geocodePlace(query);

    if (!location) {
      throw new Error("Luogo non trovato.");
    }

    showLocation(location);

    setStatus("loading", "Cerco spot vicino...");

    const spots = await fetchNearbySpots(location.lat, location.lon);

    if (!spots.length) {
      renderEmpty("Nessuno spot trovato.");
      setStatus("error", "Nessun spot trovato.");
      return;
    }

    renderSpots(spots);

    setStatus("success", `Trovati ${spots.length} spot.`);

  } catch (error) {

    console.error(error);

    setStatus("error", "Errore nel recupero degli spot da OpenTripMap.");

    renderEmpty("Si è verificato un errore. Riprova.");

  }
}

// ===============================
// CERCA CITTA
// ===============================

async function geocodePlace(query) {

  const url =
    `${CONFIG.NOMINATIM_BASE_URL}?format=json&q=${encodeURIComponent(query)}&limit=1`;

  const response = await fetch(url);

  const data = await response.json();

  if (!data.length) return null;

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

async function fetchNearbySpots(lat, lon) {

  const radius = 10000;
  const limit = 30;

  const kinds = [
    "natural",
    "beaches",
    "view_points",
    "interesting_places",
    "historic",
    "architecture",
    "bridges"
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
    const txt = await response.text();
    console.error("OpenTripMap error:", txt);
    throw new Error("Errore OpenTripMap");
  }

  const data = await response.json();

  return data.filter(item => item.name && item.point);
}

// ===============================
// UI
// ===============================

function setStatus(type, text) {

  statusBadge.className = `badge ${type}`;

  if (type === "loading") statusBadge.textContent = "Ricerca";
  if (type === "success") statusBadge.textContent = "Ok";
  if (type === "error") statusBadge.textContent = "Errore";
  if (type === "idle") statusBadge.textContent = "In attesa";

  statusText.textContent = text;
}

function showLocation(location) {

  locationCard.classList.remove("hidden");

  placeName.textContent = location.name;
  placeLat.textContent = location.lat.toFixed(5);
  placeLon.textContent = location.lon.toFixed(5);
}

function renderSpots(spots) {

  resultsCount.textContent = `${spots.length} risultati`;

  resultsGrid.innerHTML = spots.map(spot => {

    const name = spot.name || "Spot";

    const lat = spot.point.lat;
    const lon = spot.point.lon;

    return `
      <div class="spot-card">
        <h3>${name}</h3>
        <p>${lat.toFixed(4)}, ${lon.toFixed(4)}</p>
      </div>
    `;

  }).join("");
}

function renderEmpty(message) {

  resultsGrid.innerHTML = `
    <div class="empty-state">
      ${message}
    </div>
  `;
}