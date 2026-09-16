(function () {
  "use strict";

  const STORAGE_KEY = "retro_revivals_complete_v2";

  function getCollection() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (error) {
      return {};
    }
  }

  function saveCollection(collection) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(collection)
      );
    } catch (error) {
      console.error("Could not save collection:", error);
    }
  }

  function updateCollection() {
    const collection = getCollection();

    const cards = Array.from(
      document.querySelectorAll(".card")
    );

    let owned = 0;

    cards.forEach(function (card) {
      const checkbox = card.querySelector(
        'input[type="checkbox"]'
      );

      if (!checkbox) return;

      const id = checkbox.dataset.id;

      checkbox.checked = !!collection[id];

      if (checkbox.checked) {
        card.classList.add("owned");
        owned++;
      } else {
        card.classList.remove("owned");
      }
    });

    const total =
      Number(window.PAGE_TOTAL) || cards.length;

    const percentage =
      total > 0
        ? Math.round((owned / total) * 100)
        : 0;

    document
      .querySelectorAll("[data-owned]")
      .forEach(function (element) {
        element.textContent = owned;
      });

    document
      .querySelectorAll("[data-total]")
      .forEach(function (element) {
        element.textContent = total;
      });

    document
      .querySelectorAll("[data-pct]")
      .forEach(function (element) {
        element.textContent = percentage + "%";
      });
  }

  function filterCards() {
    const search =
      document.querySelector("#search");

    const status =
      document.querySelector("#status");

    const searchText =
      search
        ? search.value.toLowerCase().trim()
        : "";

    const selectedStatus =
      status
        ? status.value
        : "All";

    document
      .querySelectorAll(".card")
      .forEach(function (card) {

        const checkbox =
          card.querySelector(
            'input[type="checkbox"]'
          );

        const cardText =
          card.textContent.toLowerCase();

        const matchesSearch =
          !searchText ||
          cardText.includes(searchText);

        let matchesStatus = true;

        if (selectedStatus === "Owned") {
          matchesStatus =
            checkbox && checkbox.checked;
        }

        if (selectedStatus === "Missing") {
          matchesStatus =
            checkbox && !checkbox.checked;
        }

        if (
          matchesSearch &&
          matchesStatus
        ) {
          card.dataset.visible = "true";
        } else {
          card.dataset.visible = "false";
        }
      });

    showPage(1);
  }

  function showPage(page) {

    const pageSize =
      Number(window.PAGE_SIZE) || 33;

    const visibleCards =
      Array.from(
        document.querySelectorAll(".card")
      ).filter(function (card) {
        return card.dataset.visible !== "false";
      });

    const totalPages =
      Math.max(
        1,
        Math.ceil(
          visibleCards.length / pageSize
        )
      );

    if (page < 1) page = 1;
    if (page > totalPages) {
      page = totalPages;
    }

    document
      .querySelectorAll(".card")
      .forEach(function (card) {
        card.classList.add("hide");
      });

    const start =
      (page - 1) * pageSize;

    const end =
      start + pageSize;

    visibleCards
      .slice(start, end)
      .forEach(function (card) {
        card.classList.remove("hide");
      });

    createPagination(
      totalPages,
      page
    );
  }

  function createPagination(
    totalPages,
    currentPage
  ) {

    const container =
      document.querySelector(".pages");

    if (!container) return;

    container.innerHTML = "";

    for (
      let page = 1;
      page <= totalPages;
      page++
    ) {

      const button =
        document.createElement("button");

      button.type = "button";

      button.textContent = page;

      if (page === currentPage) {
        button.classList.add("active");
      }

      button.addEventListener(
        "click",
        function () {
          showPage(page);
          window.scrollTo({
            top: 300,
            behavior: "smooth"
          });
        }
      );

      container.appendChild(button);
    }
  }

  window.exportCollection =
    function () {

      const collection =
        getCollection();

      const rows = [
        ["Card ID", "Owned"]
      ];

      Object.keys(collection)
        .sort()
        .forEach(function (id) {

          rows.push([
            id,
            collection[id]
              ? "Yes"
              : "No"
          ]);

        });

      const csv =
        rows
          .map(function (row) {
            return row
              .map(function (value) {
                return '"' +
                  String(value)
                    .replaceAll(
                      '"',
                      '""'
                    ) +
                  '"';
              })
              .join(",");
          })
          .join("\r\n");

      const blob =
        new Blob(
          ["\ufeff" + csv],
          {
            type:
              "text/csv;charset=utf-8;"
          }
        );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        "retro-revivals-collection.csv";

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 1000);
    };

  window.resetCollection =
    function () {

      const confirmed =
        window.confirm(
          "Reset your Retro Revivals collection on this device?"
        );

      if (!confirmed) return;

      localStorage.removeItem(
        STORAGE_KEY
      );

      window.location.reload();
    };

  document.addEventListener(
    "DOMContentLoaded",
    function () {

      document
        .querySelectorAll(
          '.card input[type="checkbox"]'
        )
        .forEach(function (checkbox) {

          checkbox.addEventListener(
            "change",
            function () {

              const collection =
                getCollection();

              collection[
                checkbox.dataset.id
              ] = checkbox.checked;

              saveCollection(
                collection
              );

              updateCollection();
            }
          );

        });

      const search =
        document.querySelector("#search");

      if (search) {
        search.addEventListener(
          "input",
          filterCards
        );
      }

      const status =
        document.querySelector("#status");

      if (status) {
        status.addEventListener(
          "change",
          filterCards
        );
      }

      document
        .querySelectorAll(".card")
        .forEach(function (card) {
          card.dataset.visible =
            "true";
        });

      updateCollection();

      showPage(1);
    });

})();
