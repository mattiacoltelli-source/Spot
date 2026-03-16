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

const APP_VERSION = "lite-1";

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

setStatus("idle", `Pronto (${APP_VERSION})`);
renderEmpty('Inserisci una città oppure premi "Usa esempio".');

async function handleSearch() {
  const query = cityInput.value.trim();

  if (!query) {
    setStatus("error", "Inserisci una città.");
    renderEmpty("Scrivi una città per iniziare.");
    hideLocation();
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

    showLocation(location);
    setStatus("idle", "Cerco spot vicini...");

    const spots = await fetchNearbySpots(location.lat, location.lon);

    if (!spots.length) {
      setStatus("error", "Nessuno spot trovato.");
      renderEmpty("Non ho trovato spot utili in quest'area.");
      return;
    }

    const enrichedSpots = spots
      .map((spot) => ({
        ...spot,
        distanceKm: calculateDistanceKm(
          location.lat,
          location.lon,
          spot.lat,
          spot.lon
        )
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 12);

    renderSpots(enrichedSpots);
    setStatus("ok", `${enrichedSpots.length} spot trovati`);
  } catch (error) {
    console.error(error);
    setStatus("error", error.message || "Errore nella ricerca.");
    renderEmpty("Si è verificato un errore. Riprova.");
    hideLocation();
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
  if (tags.amenity === "viewpoint") return "Viewpoint";
  if (tags.natural) return "Natura";
  if (tags.historic) return "Storico";
  if (tags.tourism) return "Turismo";
  return "Spot";
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
    return `
      <article class="spot-card">
        <div class="spot-title">${escapeHtml(spot.name)}</div>
        <div class="spot-coords">${escapeHtml(spot.category)} • ${spot.distanceKm.toFixed(1)} km</div>
        <div class="spot-coords">${spot.lat.toFixed(4)}, ${spot.lon.toFixed(4)}</div>
        <button onclick="openInMaps(${spot.lat}, ${spot.lon})">Apri in Google Maps</button>
      </article>
    `;
  }).join("");
}

function renderEmpty(message) {
  resultsCount.textContent = "0 risultati";
  resultsGrid.innerHTML = `
    <div class="spot-card">
      <div class="spot-coords">${escapeHtml(message)}</div>
    </div>
  `;
}

function openInMaps(lat, lon) {
  const url = `https://www.google.com/maps?q=${lat},${lon}`;
  window.open(url, "_blank");
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