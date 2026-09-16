/* RETRO REVIVALS - COLLECTION APP */

(function () {
  "use strict";

  var STORAGE_KEY = "retro_revivals_collection_v3";

  function getOwned() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  }

  function saveOwned(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Collection could not be saved.");
    }
  }

  function updateStats() {
    var boxes = Array.prototype.slice.call(
      document.querySelectorAll(".check")
    );

    var owned = boxes.filter(function (box) {
      return box.checked;
    }).length;

    var total = Number(window.PAGE_TOTAL) || boxes.length;
    var percent = total
      ? Math.round((owned / total) * 100)
      : 0;

    var count = document.querySelector("[data-owned-count]");
    var percentage = document.querySelector("[data-percent]");
    var bars = document.querySelectorAll(".progress");

    if (count) {
      count.textContent = owned + " / " + total;
    }

    if (percentage) {
      percentage.textContent = percent + "%";
    }

    Array.prototype.forEach.call(bars, function (bar) {
      bar.style.width = percent + "%";
    });
  }

  function applyOwnedState() {
    var owned = getOwned();

    Array.prototype.forEach.call(
      document.querySelectorAll(".check"),
      function (box) {
        var id = box.getAttribute("data-id");

        box.checked = !!owned[id];

        var card = box.closest(".card");

        if (card) {
          card.classList.toggle("owned", box.checked);
        }
      }
    );

    updateStats();
  }

  function saveCheckbox(box) {
    var owned = getOwned();
    var id = box.getAttribute("data-id");

    if (!id) {
      return;
    }

    owned[id] = box.checked;
    saveOwned(owned);

    var card = box.closest(".card");

    if (card) {
      card.classList.toggle("owned", box.checked);
    }

    updateStats();
  }

  function filterCards() {
    var searchBox = document.getElementById("search");
    var ownedBox = document.getElementById("owned");

    var query = searchBox
      ? searchBox.value.toLowerCase().trim()
      : "";

    var ownedFilter = ownedBox
      ? ownedBox.value
      : "All";

    Array.prototype.forEach.call(
      document.querySelectorAll(".card"),
      function (card) {

        var text = (card.textContent || "").toLowerCase();
        var checkbox = card.querySelector(".check");

        var matchesSearch =
          !query || text.indexOf(query) !== -1;

        var matchesOwned =
          ownedFilter === "All" ||
          (
            ownedFilter === "Owned" &&
            checkbox &&
            checkbox.checked
          ) ||
          (
            ownedFilter === "Missing" &&
            checkbox &&
            !checkbox.checked
          );

        card.style.display =
          matchesSearch && matchesOwned
            ? ""
            : "none";
      }
    );
  }

  function exportCollection() {
    var owned = getOwned();

    var rows = [
      ["ID", "Owned"]
    ];

    Object.keys(owned)
      .sort()
      .forEach(function (id) {
        rows.push([
          id,
          owned[id] ? "Yes" : "No"
        ]);
      });

    var csv = rows.map(function (row) {
      return row.map(function (value) {
        return '"' +
          String(value).replace(/"/g, '""') +
          '"';
      }).join(",");
    }).join("\r\n");

    var blob = new Blob(
      ["\uFEFF" + csv],
      {
        type: "text/csv;charset=utf-8"
      }
    );

    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");

    link.href = url;
    link.download =
      "retro-revivals-collection.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function resetCollection() {
    if (!window.confirm(
      "Reset your Retro Revivals collection?"
    )) {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}

    window.location.reload();
  }

  function updateMyCollection() {
    var counter =
      document.getElementById("mycount");

    var bar =
      document.getElementById("mybar");

    if (!counter && !bar) {
      return;
    }

    var owned = getOwned();

    var count = Object.keys(owned).filter(
      function (id) {
        return owned[id] === true;
      }
    ).length;

    if (counter) {
      counter.textContent = count;
    }

    if (bar) {
      var total = 199;

      var percent = Math.min(
        100,
        Math.round((count / total) * 100)
      );

      bar.style.width = percent + "%";
    }
  }

  function start() {

    Array.prototype.forEach.call(
      document.querySelectorAll(".check"),
      function (box) {

        box.addEventListener(
          "change",
          function () {
            saveCheckbox(box);
            filterCards();
          }
        );

      }
    );

    var search =
      document.getElementById("search");

    if (search) {
      search.addEventListener(
        "input",
        filterCards
      );
    }

    var owned =
      document.getElementById("owned");

    if (owned) {
      owned.addEventListener(
        "change",
        filterCards
      );
    }

    applyOwnedState();
    filterCards();
    updateMyCollection();
  }

  window.exportCollection =
    exportCollection;

  window.resetCollection =
    resetCollection;

  window.filterCards =
    filterCards;

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      start
    );

  } else {

    start();

  }

})();
