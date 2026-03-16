const CONFIG = {
  API_KEY: "7c3c863f5ce9759b81a87bc9c5e111065309a185f63464bdadefd4e4991333d5"
};

// DOM
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

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});

async function handleSearch() {

  const query = cityInput.value.trim();

  if (!query) {
    setStatus("error","Inserisci una città");
    return;
  }

  try {

    setStatus("loading","Cerco città...");

    const location = await geocode(query);

    showLocation(location);

    setStatus("loading","Cerco spot...");

    const spots = await fetchSpots(location.lat, location.lon);

    renderSpots(spots);

    setStatus("success", spots.length + " spot trovati");

  } catch(err) {

    console.error(err);

    setStatus("error","Errore nel recupero degli spot da OpenTripMap");

    renderEmpty("Errore nella ricerca");

  }

}

async function geocode(query){

  const url =
  "https://nominatim.openstreetmap.org/search?format=json&q=" +
  encodeURIComponent(query) +
  "&limit=1";

  const res = await fetch(url);

  const data = await res.json();

  if(!data.length) throw new Error("Città non trovata");

  return {
    name: data[0].display_name,
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon)
  }

}

async function fetchSpots(lat,lon){

  const url =
  "https://corsproxy.io/?https://api.opentripmap.com/0.1/en/places/radius" +
  "?radius=10000" +
  "&lon=" + lon +
  "&lat=" + lat +
  "&limit=30" +
  "&format=json" +
  "&apikey=" + CONFIG.API_KEY;

  const res = await fetch(url);

  if(!res.ok) throw new Error("API error");

  const data = await res.json();

  return data.filter(s => s.name && s.point);

}

function setStatus(type,text){

  statusBadge.className = "badge " + type;

  if(type==="loading") statusBadge.textContent="Ricerca";
  if(type==="success") statusBadge.textContent="OK";
  if(type==="error") statusBadge.textContent="Errore";

  statusText.textContent = text;

}

function showLocation(loc){

  locationCard.classList.remove("hidden");

  placeName.textContent = loc.name;
  placeLat.textContent = loc.lat.toFixed(5);
  placeLon.textContent = loc.lon.toFixed(5);

}

function renderSpots(spots){

  resultsCount.textContent = spots.length + " risultati";

  resultsGrid.innerHTML = spots.map(s=>{

    const name = s.name || "Spot";

    const lat = s.point.lat;
    const lon = s.point.lon;

    return `
      <div class="spot-card">
        <h3>${name}</h3>
        <p>${lat.toFixed(4)}, ${lon.toFixed(4)}</p>
      </div>
    `;

  }).join("");

}

function renderEmpty(msg){

  resultsCount.textContent = "0 risultati";

  resultsGrid.innerHTML =
  `<div class="empty-state">${msg}</div>`;

}