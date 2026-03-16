const CONFIG = {
  OPENTRIPMAP_API_KEY: "49233ef14675352094db78f9021de6d6d0e20d0d9355a451f8bf8713380f8feb",
  OPENTRIPMAP_BASE_URL: "https://api.opentripmap.com/0.1/en/places",
  NOMINATIM_BASE_URL: "https://nominatim.openstreetmap.org/search"
};

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

searchBtn.addEventListener("click", handleSearch);

exampleBtn.addEventListener("click", () => {
  cityInput.value = "Firenze";
  handleSearch();
});

cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") handleSearch();
});

async function handleSearch() {

  const query = cityInput.value.trim();

  if (!query) {
    setStatus("error", "Inserisci una città.");
    return;
  }

  try {

    setStatus("loading", "Cerco città...");

    const location = await geocodePlace(query);

    if (!location) {
      throw new Error("Città non trovata.");
    }

    showLocation(location);

    setStatus("loading", "Cerco spot fotografici...");

    const spots = await fetchNearbySpots(location.lat, location.lon);

    if (!spots.length) {
      setStatus("error", "Nessuno spot trovato.");
      renderEmpty("Nessuno spot trovato.");
      return;
    }

    renderSpots(spots);

    setStatus("success", `Trovati ${spots.length} spot.`);

  } catch (error) {

    console.error(error);

    setStatus("error", "Errore nel recupero degli spot da OpenTripMap.");

    renderEmpty("Si è verificato un errore.");

  }

}

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

async function fetchNearbySpots(lat, lon) {

  const radius = 10000;
  const limit = 20;

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
    throw new Error("Errore API");
  }

  const data = await response.json();

  return data.filter(item => item.name && item.point);

}

function setStatus(type, text) {

  statusBadge.className = `badge ${type}`;

  if (type === "loading") statusBadge.textContent = "Ricerca";
  if (type === "success") statusBadge.textContent = "OK";
  if (type === "error") statusBadge.textContent = "Errore";

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

  resultsCount.textContent = "0 risultati";

  resultsGrid.innerHTML = `
    <div class="empty-state">
      ${message}
    </div>
  `;

}