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

async function handleSearch(){

  const query = cityInput.value.trim();

  if(!query){
    setStatus("error","Inserisci una città");
    return;
  }

  try{

    setStatus("loading","Cerco città...");

    const location = await geocode(query);

    showLocation(location);

    setStatus("loading","Cerco spot...");

    const spots = await fetchSpots(location.lat,location.lon);

    renderSpots(spots);

    setStatus("success",spots.length+" spot trovati");

  }catch(err){

    console.error(err);

    setStatus("error","Errore nella ricerca");

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

  return{
    name:data[0].display_name,
    lat:parseFloat(data[0].lat),
    lon:parseFloat(data[0].lon)
  }

}

async function fetchSpots(lat,lon){

  const radius = 5000;

  const query =
  `[out:json];
  (
  node(around:${radius},${lat},${lon})["tourism"];
  node(around:${radius},${lat},${lon})["natural"];
  node(around:${radius},${lat},${lon})["historic"];
  );
  out;`;

  const url =
  "https://overpass-api.de/api/interpreter?data=" +
  encodeURIComponent(query);

  const res = await fetch(url);

  const data = await res.json();

  return data.elements
  .filter(e=>e.tags && e.tags.name)
  .slice(0,30)
  .map(e=>({
    name:e.tags.name,
    lat:e.lat,
    lon:e.lon
  }));

}

function setStatus(type,text){

  statusBadge.className="badge "+type;

  if(type==="loading") statusBadge.textContent="Ricerca";
  if(type==="success") statusBadge.textContent="OK";
  if(type==="error") statusBadge.textContent="Errore";

  statusText.textContent=text;

}

function showLocation(loc){

  locationCard.classList.remove("hidden");

  placeName.textContent=loc.name;
  placeLat.textContent=loc.lat.toFixed(5);
  placeLon.textContent=loc.lon.toFixed(5);

}

function renderSpots(spots){

  resultsCount.textContent=spots.length+" risultati";

  resultsGrid.innerHTML=spots.map(s=>{

    return `
    <div class="spot-card">
      <h3>${s.name}</h3>
      <p>${s.lat.toFixed(4)}, ${s.lon.toFixed(4)}</p>
    </div>
    `;

  }).join("");

}

function renderEmpty(msg){

  resultsCount.textContent="0 risultati";

  resultsGrid.innerHTML=
  `<div class="empty-state">${msg}</div>`;

}