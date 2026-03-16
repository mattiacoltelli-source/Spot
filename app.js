const CONFIG = {
  OPENTRIPMAP_API_KEY: "49233ef14675352094db78f9021de6d6d0e20d0d9355a451f8bf8713380f8feb",
  NOMINATIM_URL: "https://nominatim.openstreetmap.org/search"
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

let map;
let markers = [];

initMap();

searchBtn.addEventListener("click", handleSearch);

exampleBtn.addEventListener("click", () => {
  cityInput.value = "Firenze";
  handleSearch();
});

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});

function initMap() {

  map = L.map("map").setView([41.9, 12.49], 5);

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { attribution: "© OpenStreetMap" }
  ).addTo(map);

}

async function handleSearch() {

  const query = cityInput.value.trim();

  if (!query) {
    setStatus("error", "Inserisci una città.");
    return;
  }

  try {

    setStatus("loading", "Cerco città...");

    const location = await geocodePlace(query);

    showLocation(location);

    map.setView([location.lat, location.lon], 12);

    setStatus("loading", "Cerco spot fotografici...");

    const spots = await fetchNearbySpots(location.lat, location.lon);

    renderSpots(spots);
    renderMarkers(spots);

    setStatus("success", `${spots.length} spot trovati`);

  } catch (error) {

    console.error(error);

    setStatus("error", "Errore nel recupero degli spot da OpenTripMap.");

  }

}

async function geocodePlace(query) {

  const url =
    `${CONFIG.NOMINATIM_URL}?format=json&q=${encodeURIComponent(query)}&limit=1`;

  const response = await fetch(url);

  const data = await response.json();

  if (!data.length) throw new Error("Città non trovata");

  const item = data[0];

  return {
    name: item.display_name,
    lat: Number(item.lat),
    lon: Number(item.lon)
  };

}

async function fetchNearbySpots(lat, lon) {

  const delta = 0.1;

  const url =
    `https://api.opentripmap.com/0.1/en/places/bbox?lon_min=${lon - delta}&lon_max=${lon + delta}&lat_min=${lat - delta}&lat_max=${lat + delta}&format=json&apikey=${CONFIG.OPENTRIPMAP_API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Errore API");
  }

  const data = await response.json();

  return data.filter(item => item.name && item.point).slice(0,30);

}

function renderMarkers(spots) {

  markers.forEach(m => map.removeLayer(m));
  markers = [];

  spots.forEach(spot => {

    const lat = spot.point.lat;
    const lon = spot.point.lon;

    const marker = L.marker([lat, lon]).addTo(map);

    marker.bindPopup(
      `<b>${spot.name}</b><br>
      <a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank">
      Apri in Google Maps
      </a>`
    );

    markers.push(marker);

  });

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

    const lat = spot.point.lat;
    const lon = spot.point.lon;

    return `
      <div class="spot-card">
        <h3>${spot.name}</h3>
        <p>${lat.toFixed(4)}, ${lon.toFixed(4)}</p>
      </div>
    `;

  }).join("");

}