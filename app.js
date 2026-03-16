const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const exampleBtn = document.getElementById("exampleBtn");

const statusBadge = document.getElementById("statusBadge");
const statusText = document.getElementById("statusText");

const photographerCard = document.getElementById("photographerCard");
const photographerBadge = document.getElementById("photographerBadge");
const photographerText = document.getElementById("photographerText");

const bestNowSection = document.getElementById("bestNowSection");
const bestNowGrid = document.getElementById("bestNowGrid");

const locationCard = document.getElementById("locationCard");
const placeName = document.getElementById("placeName");
const placeLat = document.getElementById("placeLat");
const placeLon = document.getElementById("placeLon");

const resultsGrid = document.getElementById("resultsGrid");
const resultsCount = document.getElementById("resultsCount");

const activeFilterLabel = document.getElementById("activeFilterLabel");
const filterButtons = document.querySelectorAll(".filter-btn");
const sortSelect = document.getElementById("sortSelect");
const mapStatus = document.getElementById("mapStatus");
const zoomAllBtn = document.getElementById("zoomAllBtn");

const countToday = document.getElementById("countToday");
const countWeekend = document.getElementById("countWeekend");
const countSunsets = document.getElementById("countSunsets");
const countCustom = document.getElementById("countCustom");
const listFilterButtons = document.querySelectorAll(".list-chip");

const detailModal = document.getElementById("detailModal");
const modalBackdrop = document.getElementById("modalBackdrop");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalContent = document.getElementById("modalContent");

const installBtn = document.getElementById("installBtn");

const APP_VERSION = "pro-7-distance-fix";
const SEARCH_RADIUS_METERS = 6000;
const MAX_SAFE_DISTANCE_KM = 12;
const IMAGE_CACHE_KEY = "photospot-image-cache-v2";

let allSpots = [];
let currentFilter = "all";
let currentLocation = null;
let favoriteKeys = loadFavorites();
let activeFocusedKey = null;
let activeListFilter = null;

let map = null;
let cityMarker = null;
let spotMarkers = [];
let markerIndex = new Map();

let savedLists = loadLists();
let deferredPrompt = null;

const FALLBACK_IMAGES = {
  natura: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  acqua: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
  panorama: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
  storico: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80",
  viewpoint: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
  turismo: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80",
  spot: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
};

searchBtn.addEventListener("click", handleSearch);
geoBtn.addEventListener("click", handleGeolocation);
zoomAllBtn.addEventListener("click", zoomAllMarkers);

exampleBtn.addEventListener("click", () => {
  cityInput.value = "Bologna";
  handleSearch();
});

cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") handleSearch();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    activeListFilter = null;
    updateFilterButtons();
    updateListFilterButtons();
    applyFilterAndRender();
  });
});

listFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const listName = button.dataset.listFilter;
    activeListFilter = activeListFilter === listName ? null : listName;
    currentFilter = "all";
    updateFilterButtons();
    updateListFilterButtons();
    applyFilterAndRender();
  });
});

sortSelect.addEventListener("change", () => {
  applyFilterAndRender();
});

modalBackdrop.addEventListener("click", closeDetailModal);
closeModalBtn.addEventListener("click", closeDetailModal);

if (installBtn) {
  installBtn.addEventListener("click", installApp);
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  if (installBtn) {
    installBtn.classList.remove("hidden");
  }
});

window.addEventListener("appinstalled", () => {
  deferredPrompt = null;
  if (installBtn) {
    installBtn.classList.add("hidden");
  }
});

initMap();
setStatus("idle", `Pronto (${APP_VERSION})`);
renderEmpty('Inserisci una città oppure premi "Usa la mia posizione".');
updateFilterButtons();
updateListFilterButtons();
updatePhotographerCard(null);
hideBestNow();
updateListCounters();

async function installApp() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  if (installBtn) {
    installBtn.classList.add("hidden");
  }
}

async function handleSearch() {
  const query = cityInput.value.trim();

  if (!query) {
    setStatus("error", "Inserisci una città.");
    renderEmpty("Scrivi una città per iniziare.");
    hardResetSearchState();
    return;
  }

  try {
    setStatus("idle", "Cerco la città...");
    renderEmpty("Sto cercando il luogo...");
    hideLocation();
    closeDetailModal();
    activeFocusedKey = null;

    const location = await geocodePlace(query);

    if (!location) {
      throw new Error("Città non trovata.");
    }

    await runSearchFlow(location);
  } catch (error) {
    console.error(error);
    setStatus("error", error.message || "Errore nella ricerca.");
    renderEmpty("Si è verificato un errore. Riprova.");
    hardResetSearchState();
  }
}

function handleGeolocation() {
  if (!navigator.geolocation) {
    setStatus("error", "Geolocalizzazione non supportata.");
    return;
  }

  setStatus("idle", "Sto cercando la tua posizione...");
  statusText.textContent = "Attiva il GPS e attendi qualche secondo. Se non funziona, prova con una città.";

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        closeDetailModal();
        activeFocusedKey = null;

        const location = {
          name: "La tua posizione",
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };

        await runSearchFlow(location);
      } catch (error) {
        console.error(error);
        setStatus("error", "Errore nella ricerca vicino a te.");
        renderEmpty("Non sono riuscito a cercare spot vicino a te.");
        hardResetSearchState();
      }
    },
    (error) => {
      if (error.code === 1) {
        setStatus("error", "Permesso posizione negato.");
        renderEmpty("Permesso posizione negato. Cerca una città manualmente.");
      } else if (error.code === 2) {
        setStatus("error", "Posizione non disponibile.");
        renderEmpty("Non riesco a leggere il GPS. Prova all'aperto oppure cerca una città.");
      } else {
        setStatus("error", "Timeout posizione.");
        renderEmpty("La posizione ha impiegato troppo tempo. Cerca una città oppure riprova.");
      }
      hardResetSearchState();
    },
    {
      enableHighAccuracy: true,
      timeout: 18000,
      maximumAge: 0
    }
  );
}

function hardResetSearchState() {
  allSpots = [];
  currentLocation = null;
  hideLocation();
  updatePhotographerCard(null);
  hideBestNow();
  activeFocusedKey = null;
  resetMap();
}

async function runSearchFlow(location) {
  currentLocation = location;
  activeFocusedKey = null;
  showLocation(location);

  setStatus("idle", "Cerco spot vicini...");
  renderEmpty("Sto cercando gli spot...");

  const rawSpots = await fetchNearbySpots(location.lat, location.lon);

  const enrichedSpots = rawSpots
    .map((spot) => {
      const distanceKm = calculateDistanceKm(location.lat, location.lon, spot.lat, spot.lon);
      const sun = calculateSunTimes(new Date(), spot.lat, spot.lon);

      return {
        ...spot,
        distanceKm,
        sunrise: formatTime(sun.sunrise),
        sunset: formatTime(sun.sunset),
        goldenHour: formatTime(sun.goldenHour),
        goldenMinutes: diffMinutesFromNow(sun.goldenHour),
        favoriteKey: buildSpotKey(spot),
        imageUrl: FALLBACK_IMAGES[spot.primaryType] || FALLBACK_IMAGES[spot.category] || FALLBACK_IMAGES.spot
      };
    })
    .filter((spot) => Number.isFinite(spot.distanceKm) && spot.distanceKm <= MAX_SAFE_DISTANCE_KM)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 20);

  if (!enrichedSpots.length) {
    allSpots = [];
    setStatus("error", "Nessuno spot affidabile trovato.");
    renderEmpty("Ho scartato risultati troppo lontani o incoerenti. Prova con un'altra città.");
    updatePhotographerCard(null);
    hideBestNow();
    resetMap(location);
    return;
  }

  allSpots = enrichedSpots;

  applyFilterAndRender();
  updatePhotographerInsights();
  updateBestNow();
  setStatus("ok", `${allSpots.length} spot trovati`);

  updateMap(location, allSpots);
  fetchSpotImages(allSpots);
}

async function geocodePlace(query) {
  const url =
    "https://nominatim.openstreetmap.org/search?format=jsonv2&q=" +
    encodeURIComponent(query) +
    "&limit=1";

  const response = await fetch(url, {
    headers: { "Accept-Language": "it" }
  });

  if (!response.ok) {
    throw new Error("Errore nella ricerca della città.");
  }

  const data = await response.json();

  if (!Array.isArray(data) || !data.length) return null;

  const item = data[0];

  return {
    name: item.display_name,
    lat: Number(item.lat),
    lon: Number(item.lon)
  };
}

async function fetchNearbySpots(lat, lon) {
  const overpassQuery = `
    [out:json][timeout:25];
    (
      node(around:${SEARCH_RADIUS_METERS},${lat},${lon})["tourism"];
      node(around:${SEARCH_RADIUS_METERS},${lat},${lon})["natural"];
      node(around:${SEARCH_RADIUS_METERS},${lat},${lon})["historic"];
      node(around:${SEARCH_RADIUS_METERS},${lat},${lon})["amenity"="viewpoint"];
      node(around:${SEARCH_RADIUS_METERS},${lat},${lon})["waterway"];
      node(around:${SEARCH_RADIUS_METERS},${lat},${lon})["natural"="water"];
      node(around:${SEARCH_RADIUS_METERS},${lat},${lon})["natural"="beach"];
      node(around:${SEARCH_RADIUS_METERS},${lat},${lon})["natural"="coastline"];
      way(around:${SEARCH_RADIUS_METERS},${lat},${lon})["tourism"];
      way(around:${SEARCH_RADIUS_METERS},${lat},${lon})["natural"];
      way(around:${SEARCH_RADIUS_METERS},${lat},${lon})["historic"];
      way(around:${SEARCH_RADIUS_METERS},${lat},${lon})["amenity"="viewpoint"];
      way(around:${SEARCH_RADIUS_METERS},${lat},${lon})["waterway"];
      way(around:${SEARCH_RADIUS_METERS},${lat},${lon})["natural"="water"];
      way(around:${SEARCH_RADIUS_METERS},${lat},${lon})["natural"="beach"];
      way(around:${SEARCH_RADIUS_METERS},${lat},${lon})["natural"="coastline"];
    );
    out center;
  `;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: overpassQuery
  });

  if (!response.ok) {
    throw new Error("Errore nel recupero degli spot.");
  }

  const data = await response.json();

  if (!data || !Array.isArray(data.elements)) return [];

  const spots = data.elements
    .map((item) => {
      const itemLat = item.lat ?? item.center?.lat;
      const itemLon = item.lon ?? item.center?.lon;
      const name = item.tags?.name;

      if (!name || !isFinite(itemLat) || !isFinite(itemLon)) return null;

      const spotType = buildSpotType(item.tags);

      return {
        name,
        lat: Number(itemLat),
        lon: Number(itemLon),
        category: spotType.category,
        primaryType: spotType.primaryType,
        tags: spotType.tags
      };
    })
    .filter(Boolean);

  return dedupeSpots(spots);
}

function buildSpotType(tags = {}) {
  const derived = [];

  if (tags.amenity === "viewpoint") derived.push("viewpoint");
  if (tags.waterway || tags.natural === "water" || tags.natural === "beach" || tags.natural === "coastline") derived.push("acqua");
  if (tags.amenity === "viewpoint" || tags.tourism === "viewpoint") derived.push("panorama");
  if (tags.natural) derived.push("natura");
  if (tags.historic) derived.push("storico");
  if (tags.tourism) derived.push("turismo");

  const unique = [...new Set(derived)];

  let category = "turismo";
  if (unique.includes("viewpoint")) category = "viewpoint";
  else if (unique.includes("acqua")) category = "acqua";
  else if (unique.includes("natura")) category = "natura";
  else if (unique.includes("storico")) category = "storico";
  else if (unique.includes("turismo")) category = "turismo";

  return {
    category,
    primaryType: unique[0] || category,
    tags: unique.length ? unique : ["turismo"]
  };
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
  const filtered = getCurrentFilteredSpots();

  activeFilterLabel.textContent = activeListFilter
    ? humanizeList(activeListFilter)
    : humanizeFilter(currentFilter);

  if (!filtered.length) {
    resultsCount.textContent = "0 risultati";
    renderEmpty("Nessuno spot per questo filtro.");
    if (mapStatus) mapStatus.textContent = "Nessun marker per questo filtro";
    updateMap(currentLocation, []);
    return;
  }

  renderSpots(filtered);
  if (currentLocation) updateMap(currentLocation, filtered);
}

function getCurrentFilteredSpots() {
  let filtered = [...allSpots];

  if (activeListFilter) {
    filtered = filtered.filter((spot) => isInList(activeListFilter, spot.favoriteKey));
  } else if (currentFilter === "favorites") {
    filtered = filtered.filter((spot) => favoriteKeys.includes(spot.favoriteKey));
  } else if (currentFilter !== "all") {
    filtered = filtered.filter((spot) => {
      if (spot.category === currentFilter) return true;
      return Array.isArray(spot.tags) && spot.tags.includes(currentFilter);
    });
  }

  const sortBy = sortSelect.value;

  if (sortBy === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name, "it"));
  } else if (sortBy === "golden") {
    filtered.sort((a, b) => normalizeGoldenScore(a.goldenMinutes) - normalizeGoldenScore(b.goldenMinutes));
  } else {
    filtered.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  return filtered;
}

function normalizeGoldenScore(minutes) {
  if (!isFinite(minutes)) return 999999;
  if (minutes < 0) return 500000 + Math.abs(minutes);
  return minutes;
}

function updateFilterButtons() {
  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === currentFilter && !activeListFilter);
  });
}

function updateListFilterButtons() {
  listFilterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.listFilter === activeListFilter);
  });
}

function humanizeFilter(filter) {
  switch (filter) {
    case "natura": return "Natura";
    case "acqua": return "Acqua";
    case "panorama": return "Panorama";
    case "storico": return "Storico";
    case "viewpoint": return "Viewpoint";
    case "turismo": return "Turismo";
    case "favorites": return "Preferiti";
    default: return "Tutti";
  }
}

function humanizeList(listName) {
  switch (listName) {
    case "today": return "Lista Oggi";
    case "weekend": return "Lista Weekend";
    case "sunsets": return "Lista Tramonti";
    case "custom": return "Mia lista";
    default: return "Lista";
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

function updateBestNow() {
  const upcoming = [...allSpots]
    .filter((spot) => isFinite(spot.goldenMinutes) && spot.goldenMinutes >= 0)
    .sort((a, b) => a.goldenMinutes - b.goldenMinutes)
    .slice(0, 3);

  if (!upcoming.length) {
    hideBestNow();
    return;
  }

  bestNowSection.classList.remove("hidden");
  bestNowGrid.innerHTML = upcoming.map((spot) => `
    <article class="best-now-card">
      <div class="best-now-top">
        <div>
          <div class="best-now-title">${escapeHtml(spot.name)}</div>
          <div class="best-now-sub">${spot.distanceKm.toFixed(1)} km • ${humanizeFilter(spot.category)}</div>
        </div>
        <div class="best-now-badge">tra ${spot.goldenMinutes} min</div>
      </div>

      <div class="best-now-actions">
        <button class="map-control-btn" onclick="focusSpot('${escapeForJs(spot.favoriteKey)}')">Centra sulla mappa</button>
        <button class="map-control-btn" onclick="openDetailByKey('${escapeForJs(spot.favoriteKey)}')">Dettagli</button>
      </div>
    </article>
  `).join("");
}

function hideBestNow() {
  bestNowSection.classList.add("hidden");
  bestNowGrid.innerHTML = "";
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
    case "ok": return "OK";
    case "error": return "Errore";
    default: return "In attesa";
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
    const goldenLabel = isFinite(spot.goldenMinutes) && spot.goldenMinutes >= 0
      ? `🌅 Golden hour tra ${spot.goldenMinutes} min`
      : "🌙 Golden hour passata";

    const goldenClass = isFinite(spot.goldenMinutes) && spot.goldenMinutes >= 0 ? "" : "past";
    const focusedClass = activeFocusedKey === spot.favoriteKey ? "focused" : "";

    return `
      <article class="spot-card ${focusedClass}" id="card-${escapeAttr(spot.favoriteKey)}">
        <div class="spot-image" style="background-image:url('${escapeHtml(spot.imageUrl)}')"></div>

        <div class="spot-header">
          <div class="spot-title-wrap">
            <div class="spot-title">${escapeHtml(spot.name)}</div>
            <div class="distance-pill">📍 ${spot.distanceKm.toFixed(1)} km</div>
          </div>

          <div class="spot-category">${escapeHtml(humanizeFilter(spot.category))}</div>
        </div>

        <div class="golden-badge ${goldenClass}">
          ${goldenLabel}
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

        <div class="list-menu">
          <button class="list-mini-btn ${isInList("today", spot.favoriteKey) ? "active" : ""}" onclick="toggleListItem('today','${escapeForJs(spot.favoriteKey)}')">Oggi</button>
          <button class="list-mini-btn ${isInList("weekend", spot.favoriteKey) ? "active" : ""}" onclick="toggleListItem('weekend','${escapeForJs(spot.favoriteKey)}')">Weekend</button>
          <button class="list-mini-btn ${isInList("sunsets", spot.favoriteKey) ? "active" : ""}" onclick="toggleListItem('sunsets','${escapeForJs(spot.favoriteKey)}')">Tramonti</button>
          <button class="list-mini-btn ${isInList("custom", spot.favoriteKey) ? "active" : ""}" onclick="toggleListItem('custom','${escapeForJs(spot.favoriteKey)}')">Mia lista</button>
        </div>

        <div class="spot-actions">
          <a class="spot-link" href="${buildGoogleMapsLink(spot.lat, spot.lon)}" target="_blank" rel="noopener noreferrer">
            Apri in Maps
          </a>

          <a class="spot-link secondary" href="${buildNavigationLink(spot.lat, spot.lon)}" target="_blank" rel="noopener noreferrer">
            Naviga
          </a>

          <button class="map-control-btn" onclick="focusSpot('${escapeForJs(spot.favoriteKey)}')">
            Vedi sulla mappa
          </button>

          <button class="map-control-btn" onclick="openDetailByKey('${escapeForJs(spot.favoriteKey)}')">
            Dettagli
          </button>

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

function openDetailByKey(key) {
  const spot = allSpots.find((item) => item.favoriteKey === key);
  if (!spot) return;

  const advice = buildPhotoAdvice(spot);

  modalContent.innerHTML = `
    <div class="modal-image" style="background-image:url('${escapeHtml(spot.imageUrl)}')"></div>
    <div class="modal-title">${escapeHtml(spot.name)}</div>
    <div class="spot-category">${escapeHtml(humanizeFilter(spot.category))}</div>

    <div class="modal-advice">${escapeHtml(advice)}</div>

    <div class="spot-grid">
      <div class="spot-box">
        <div class="spot-box-label">Distanza</div>
        <div class="spot-box-value">${spot.distanceKm.toFixed(1)} km</div>
      </div>

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

      <div class="spot-box">
        <div class="spot-box-label">Filtri</div>
        <div class="spot-box-value">${spot.tags.map(humanizeFilter).join(", ")}</div>
      </div>
    </div>

    <div class="spot-actions">
      <a class="spot-link" href="${buildGoogleMapsLink(spot.lat, spot.lon)}" target="_blank" rel="noopener noreferrer">
        Apri in Maps
      </a>
      <a class="spot-link secondary" href="${buildNavigationLink(spot.lat, spot.lon)}" target="_blank" rel="noopener noreferrer">
        Naviga
      </a>
    </div>
  `;

  detailModal.classList.remove("hidden");
}

window.openDetailByKey = openDetailByKey;

function closeDetailModal() {
  detailModal.classList.add("hidden");
}

function buildPhotoAdvice(spot) {
  if (isFinite(spot.goldenMinutes) && spot.goldenMinutes >= 0 && spot.goldenMinutes <= 90) {
    return "Ottimo momento fotografico: la golden hour è vicina. Questo spot è ideale da raggiungere adesso.";
  }
  if (spot.tags.includes("acqua")) {
    return "Spot con acqua: spesso rende molto bene con luce morbida, riflessi e cielo interessante, soprattutto verso il tramonto.";
  }
  if (spot.tags.includes("panorama") || spot.category === "viewpoint") {
    return "Spot panoramico: tende a rendere meglio con luce calda e cielo pulito, soprattutto verso il tramonto.";
  }
  if (spot.category === "storico") {
    return "Spot storico: spesso rende molto bene al mattino presto o nel tardo pomeriggio, con ombre più morbide.";
  }
  if (spot.tags.includes("natura")) {
    return "Spot naturale: prova a visitarlo nelle ore con luce più morbida, evitando il sole troppo alto.";
  }
  return "Spot versatile: controlla alba, tramonto e golden hour per scegliere il momento più fotogenico.";
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

function loadLists() {
  try {
    const raw = localStorage.getItem("photospot-lists");
    const parsed = JSON.parse(raw || "{}");
    return {
      today: Array.isArray(parsed.today) ? parsed.today : [],
      weekend: Array.isArray(parsed.weekend) ? parsed.weekend : [],
      sunsets: Array.isArray(parsed.sunsets) ? parsed.sunsets : [],
      custom: Array.isArray(parsed.custom) ? parsed.custom : []
    };
  } catch {
    return { today: [], weekend: [], sunsets: [], custom: [] };
  }
}

function saveLists() {
  localStorage.setItem("photospot-lists", JSON.stringify(savedLists));
}

function isInList(listName, key) {
  return savedLists[listName]?.includes(key);
}

function toggleListItem(listName, key) {
  const list = savedLists[listName] || [];

  if (list.includes(key)) {
    savedLists[listName] = list.filter((item) => item !== key);
  } else {
    savedLists[listName] = [...list, key];
  }

  saveLists();
  updateListCounters();
  applyFilterAndRender();
}

window.toggleListItem = toggleListItem;

function updateListCounters() {
  countToday.textContent = savedLists.today.length;
  countWeekend.textContent = savedLists.weekend.length;
  countSunsets.textContent = savedLists.sunsets.length;
  countCustom.textContent = savedLists.custom.length;
}

async function fetchSpotImages(spots) {
  const cityName = currentLocation?.name?.split(",")[0]?.trim() || "";
  const cache = loadImageCache();

  for (const spot of spots) {
    const cacheKey = buildImageCacheKey(spot);

    if (cache[cacheKey]) {
      spot.imageUrl = cache[cacheKey];
      rerenderIfVisible();
      continue;
    }

    try {
      const url = await fetchSmartPlaceImage(spot, cityName);
      if (url) {
        spot.imageUrl = url;
        cache[cacheKey] = url;
        saveImageCache(cache);
        rerenderIfVisible();
      }
    } catch (error) {
      console.warn("Immagine non trovata per", spot.name, error);
    }
  }
}

async function fetchSmartPlaceImage(spot, cityName) {
  const categoryHints = buildCategoryHints(spot);
  const candidates = [
    spot.name,
    `${spot.name}, ${cityName}`,
    `${spot.name} ${cityName}`,
    ...categoryHints.map((hint) => `${spot.name} ${hint}`),
    ...categoryHints.map((hint) => `${spot.name} ${cityName} ${hint}`)
  ];

  for (const candidate of candidates) {
    const endpoint = `https://it.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(candidate)}`;
    const response = await fetch(endpoint);
    if (!response.ok) continue;

    const data = await response.json();
    const image = data?.thumbnail?.source || data?.originalimage?.source;
    if (image) return image;
  }

  return null;
}

function buildCategoryHints(spot) {
  const hints = [];

  if (spot.tags.includes("acqua")) {
    hints.push("fiume", "lago", "waterfall", "beach", "coast");
  }

  if (spot.tags.includes("panorama") || spot.category === "viewpoint") {
    hints.push("viewpoint", "belvedere", "panorama");
  }

  if (spot.category === "storico") {
    hints.push("monument", "historic", "palace", "church");
  }

  if (spot.tags.includes("natura")) {
    hints.push("landscape", "park", "mountain", "nature");
  }

  if (spot.category === "turismo") {
    hints.push("landmark", "tourism");
  }

  return [...new Set(hints)];
}

function buildImageCacheKey(spot) {
  return `${spot.name}__${spot.lat.toFixed(4)}__${spot.lon.toFixed(4)}`.toLowerCase();
}

function loadImageCache() {
  try {
    const raw = localStorage.getItem(IMAGE_CACHE_KEY);
    const parsed = JSON.parse(raw || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveImageCache(cache) {
  localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache));
}

function initMap() {
  map = L.map("map", { zoomControl: true }).setView([41.9, 12.49], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
}

function resetMap(location = null) {
  clearMapMarkers();

  if (cityMarker) {
    map.removeLayer(cityMarker);
    cityMarker = null;
  }

  if (location) {
    cityMarker = L.marker([location.lat, location.lon]).addTo(map);
    map.setView([location.lat, location.lon], 12);
    if (mapStatus) mapStatus.textContent = "In attesa degli spot";
  } else {
    map.setView([41.9, 12.49], 5);
    if (mapStatus) mapStatus.textContent = "Aspetto una ricerca";
  }
}

function updateMap(location, spots) {
  if (!location) {
    resetMap();
    return;
  }

  if (cityMarker) {
    map.removeLayer(cityMarker);
  }

  clearMapMarkers();
  markerIndex.clear();

  cityMarker = L.marker([location.lat, location.lon]).addTo(map);
  cityMarker.bindPopup(`<strong>${escapeHtml(location.name)}</strong>`);

  const bounds = [[location.lat, location.lon]];

  spots.forEach((spot) => {
    const marker = L.marker([spot.lat, spot.lon]).addTo(map);
    marker.bindPopup(`
      <strong>${escapeHtml(spot.name)}</strong><br>
      ${escapeHtml(humanizeFilter(spot.category))}<br>
      <a href="${buildGoogleMapsLink(spot.lat, spot.lon)}" target="_blank" rel="noopener noreferrer">
        Apri in Maps
      </a>
    `);

    marker.on("click", () => {
      activeFocusedKey = spot.favoriteKey;
      renderFocusedCards();
    });

    spotMarkers.push(marker);
    markerIndex.set(spot.favoriteKey, marker);
    bounds.push([spot.lat, spot.lon]);
  });

  if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [30, 30] });
  } else {
    map.setView([location.lat, location.lon], 12);
  }

  if (mapStatus) {
    mapStatus.textContent = `${spots.length} marker visibili`;
  }
}

function zoomAllMarkers() {
  if (!currentLocation || !map) return;
  updateMap(currentLocation, getCurrentFilteredSpots());
}

function clearMapMarkers() {
  spotMarkers.forEach((marker) => map.removeLayer(marker));
  spotMarkers = [];
}

function rerenderIfVisible() {
  applyFilterAndRender();
  updateBestNow();
}

function focusSpot(key) {
  const spot = allSpots.find((item) => item.favoriteKey === key);
  if (!spot || !map) return;

  activeFocusedKey = key;
  renderFocusedCards();

  const marker = markerIndex.get(key);
  map.setView([spot.lat, spot.lon], 15);

  if (marker) marker.openPopup();

  const card = document.getElementById(`card-${escapeAttr(key)}`);
  if (card) {
    card.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

window.focusSpot = focusSpot;

function renderFocusedCards() {
  const cards = document.querySelectorAll(".spot-card");
  cards.forEach((card) => card.classList.remove("focused"));

  if (!activeFocusedKey) return;

  const card = document.getElementById(`card-${escapeAttr(activeFocusedKey)}`);
  if (card) card.classList.add("focused");
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
  return Math.round((date.getTime() - Date.now()) / 60000);
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

function escapeAttr(value) {
  return String(value)
    .replaceAll(" ", "_")
    .replaceAll("|", "_")
    .replaceAll(".", "_")
    .replaceAll(",", "_")
    .replaceAll("'", "_");
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch((error) => {
      console.warn("Service worker non registrato:", error);
    });
  });
}