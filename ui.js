(function () {
  "use strict";

  const UI = {};

  function $(id) {
    return document.getElementById(id);
  }

  function esc(v) {
    return window.APP_UTILS.escapeHtml(v);
  }

  function isFavorite(id) {
    return window.APP_UTILS.isFavorite(id);
  }

  function getFavIcon(id){
    return isFavorite(id) ? "❤️" : "🤍";
  }

  function renderSpotList(app) {
    const items = window.APP_UTILS.getFilteredSpots();
    const box = $("spotList");
    const resultNote = $("resultNote");

    if (resultNote) {
      resultNote.textContent = `${items.length} spot · ${app.mode === "sail" ? "Sail Mode" : "Travel Mode"}`;
    }

    if (!items.length) {
      box.innerHTML = `<div class="detail-empty">Nessuno spot con questi filtri.</div>`;
      return;
    }

    box.innerHTML = items.map(s => `
      <div class="spot-card tap" data-spot-id="${esc(s.id)}">
        <div class="spot-head">
          <div>
            <div class="spot-name">${esc(s.name)}</div>
            <div class="spot-sub">
              📍 ${esc(window.APP_UTILS.displayDistance(s.distance))}
            </div>
          </div>
          <button class="fav-btn" data-fav-id="${esc(s.id)}" type="button">
            ${getFavIcon(s.id)}
          </button>
        </div>

        <div class="spot-meta">
          <span class="tag gold">${esc(s.level)}</span>
          <span class="tag blue">${esc(s.zone)}</span>
          <span class="tag">${esc(s.activity)}</span>
          <span class="tag pink">${esc(s.light)}</span>
        </div>

        <div class="spot-desc">${esc(s.desc)}</div>
      </div>
    `).join("");

    box.querySelectorAll("[data-spot-id]").forEach(card => {
      card.addEventListener("click", (e) => {
        if (e.target.matches("[data-fav-id]")) return;
        const s = APP_SPOTS.spots.find(x => x.id === card.dataset.spotId);
        if (s) {
          window.APP_UTILS.showSpotDetail(s);
          window.APP_UTILS.switchPage("detail");
        }
      });
    });

    box.querySelectorAll("[data-fav-id]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        window.APP_UTILS.toggleFavorite(btn.dataset.favId);
        window.APP_UTILS.renderAll();
      });
    });
  }

  UI.renderAll = function (app) {
    renderSpotList(app);
  };

  window.UI = UI;
})();