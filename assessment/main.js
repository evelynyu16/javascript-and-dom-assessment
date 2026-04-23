/**
 * main.js — AirBnB SF Listings Explorer
 * Follows the MainModule pattern from class.
 * Loads the first 50 listings via fetch + async/await,
 * then renders cards into #listings using DOM manipulation.
 */

function MainModule(listingsID = "#listings") {
  const me = {};

  // ── DOM refs ─────────────────────────────────────────────────────
  const listingsEl   = document.querySelector(listingsID);
  const searchInput  = document.querySelector("#search-input");
  const sortSelect   = document.querySelector("#sort-select");
  const filterBtns   = document.querySelectorAll("[data-filter]");
  const resultsCount = document.querySelector("#results-count");
  const modalEl      = document.getElementById("listingModal");
  const modalBody    = document.getElementById("modal-body");
  const modalTitle   = document.getElementById("listingModalLabel");
  const modalLink    = document.getElementById("modal-airbnb-link");
  const bsModal      = new bootstrap.Modal(modalEl);

  // ── State ────────────────────────────────────────────────────────
  let allListings = [];
  let activeFilter = "all";

  // ── Helpers ──────────────────────────────────────────────────────
  function stripHtml(html) {
    const div = document.createElement("div");
    div.innerHTML = html || "";
    return div.textContent || div.innerText || "";
  }

  function parsePrice(str) {
    return parseFloat((str || "0").replace(/[$,]/g, "")) || 0;
  }

  function formatPrice(str) {
    const n = parsePrice(str);
    return n ? `$${n.toLocaleString()}` : "N/A";
  }

  function shortTitle(name) {
    // "Serviced apartment in San Francisco · ★4.87 · 1 bedroom…"
    // → show only the part before the first ·
    return name.split("·")[0].trim();
  }

  function keyAmenities(amenities) {
    const keys = ["Wifi", "Kitchen", "Washer", "Air conditioning", "Heating", "Parking", "Pool"];
    return (amenities || [])
      .filter((a) => keys.some((k) => a.toLowerCase().includes(k.toLowerCase())))
      .slice(0, 4);
  }

  // ── Build one card's HTML string ─────────────────────────────────
  function getListingCode(listing, idx) {
    const isSuperhost  = listing.host_is_superhost === "t";
    const rating       = listing.review_scores_rating;
    const cleanDesc    = stripHtml(listing.description);
    const highlighted  = keyAmenities(listing.amenities);
    const otherAm      = (listing.amenities || [])
      .filter((a) => !highlighted.includes(a))
      .slice(0, 3);
    const delay        = (idx % 12) * 40;

    return `
    <div class="col-sm-6 col-lg-4 listing-col" style="animation-delay:${delay}ms">
      <div class="listing card" data-id="${listing.id}">

        <!-- Image + badges -->
        <div class="card-img-wrap">
          <img
            src="${listing.picture_url || ""}"
            class="card-img-top"
            alt="${shortTitle(listing.name)}"
            loading="lazy"
            onerror="this.src='https://placehold.co/400x200/e8e0d8/b8a89a?text=No+Image'"
          />
          <span class="badge-room-type">${listing.room_type || "Room"}</span>
          ${isSuperhost ? `<span class="badge-superhost">⭐ Superhost</span>` : ""}
        </div>

        <!-- Card body -->
        <div class="card-body d-flex flex-column">
          <p class="card-neighborhood">${listing.neighbourhood_cleansed || "San Francisco"}</p>
          <h5 class="card-title">${shortTitle(listing.name)}</h5>

          <p class="card-meta">
            ${listing.bedrooms ? `🛏 ${listing.bedrooms} bed · ` : ""}
            ${listing.bathrooms_text ? `🚿 ${listing.bathrooms_text} · ` : ""}
            ${listing.accommodates ? `👥 ${listing.accommodates} guests` : ""}
          </p>

          ${rating ? `
          <p class="card-rating">
            ★ ${parseFloat(rating).toFixed(2)}
            <span class="reviews">(${(listing.number_of_reviews || 0).toLocaleString()} reviews)</span>
          </p>` : ""}

          <p class="card-description">${cleanDesc}</p>

          <!-- Amenities -->
          <div class="amenities-row">
            ${highlighted.map((a) => `<span class="amenity-pill">${a}</span>`).join("")}
            ${otherAm.map((a) => `<span class="amenity-pill">${a}</span>`).join("")}
          </div>

          <!-- Host + Price -->
          <div class="card-footer-row">
            <div class="host-info">
              <img
                class="host-avatar"
                src="${listing.host_thumbnail_url || ""}"
                alt="${listing.host_name}"
                onerror="this.src='https://placehold.co/32x32/2a2420/f5efe6?text=${(listing.host_name || "?")[0]}'"
              />
              <div class="host-name">
                <strong>${listing.host_name || "Host"}</strong>
                Since ${new Date(listing.host_since).getFullYear()}
              </div>
            </div>
            <div class="price-block">
              <span class="price-amount">${formatPrice(listing.price)}</span>
              <span class="price-label">/ night</span>
            </div>
          </div>
        </div><!-- /card-body -->

      </div><!-- /listing card -->
    </div>`;
  }

  // ── Render listing cards ─────────────────────────────────────────
  function redraw(listings) {
    // Remove loading state if present
    const loadingEl = document.getElementById("loading-state");
    if (loadingEl) loadingEl.remove();

    if (!listings.length) {
      listingsEl.innerHTML = `<div class="empty-msg"><p>No listings match your search.</p></div>`;
      resultsCount.textContent = "0 listings";
      return;
    }

    listingsEl.innerHTML = listings.map(getListingCode).join("\n");
    resultsCount.textContent = `Showing ${listings.length} listing${listings.length !== 1 ? "s" : ""}`;

    // Attach click listeners for modal
    listingsEl.querySelectorAll(".listing.card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = parseInt(card.dataset.id);
        const listing = allListings.find((l) => l.id === id);
        if (listing) openModal(listing);
      });
    });
  }

  // ── Filter + Sort logic ──────────────────────────────────────────
  function applyFiltersAndSort() {
    const query = (searchInput ? searchInput.value : "").toLowerCase().trim();
    const sort  = sortSelect ? sortSelect.value : "default";

    let results = allListings.filter((l) => {
      if (activeFilter !== "all" && l.room_type !== activeFilter) return false;
      if (query) {
        const haystack = `${l.name} ${l.neighbourhood_cleansed} ${l.host_name}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    if (sort === "price-asc")  results.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    if (sort === "price-desc") results.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    if (sort === "rating")     results.sort((a, b) => (b.review_scores_rating || 0) - (a.review_scores_rating || 0));

    me.redraw(results);
  }

  // ── Modal ────────────────────────────────────────────────────────
  function openModal(listing) {
    const isSuperhost = listing.host_is_superhost === "t";
    const cleanDesc   = stripHtml(listing.description);
    const cleanNeigh  = stripHtml(listing.neighborhood_overview);
    const amenities   = listing.amenities || [];

    modalTitle.textContent = shortTitle(listing.name);
    modalLink.href = listing.listing_url || "#";

    modalBody.innerHTML = `
      <img
        src="${listing.picture_url || ""}"
        class="modal-listing-img"
        alt="${shortTitle(listing.name)}"
        onerror="this.src='https://placehold.co/680x320/e8e0d8/b8a89a?text=No+Image'"
      />

      <p class="text-muted small text-uppercase mb-1" style="letter-spacing:.1em;color:#c4593a!important">
        ${listing.neighbourhood_cleansed || "San Francisco"} · ${listing.room_type}
      </p>

      <!-- Stats row -->
      <div class="d-flex gap-4 flex-wrap mb-3">
        ${listing.review_scores_rating ? `<div><strong>★ ${parseFloat(listing.review_scores_rating).toFixed(2)}</strong><br><small class="text-muted">Rating</small></div>` : ""}
        ${listing.number_of_reviews    ? `<div><strong>${listing.number_of_reviews}</strong><br><small class="text-muted">Reviews</small></div>` : ""}
        ${listing.bedrooms             ? `<div><strong>${listing.bedrooms}</strong><br><small class="text-muted">Bedroom${listing.bedrooms > 1 ? "s" : ""}</small></div>` : ""}
        ${listing.accommodates         ? `<div><strong>${listing.accommodates}</strong><br><small class="text-muted">Guests</small></div>` : ""}
        ${listing.minimum_nights       ? `<div><strong>${listing.minimum_nights}</strong><br><small class="text-muted">Min. nights</small></div>` : ""}
      </div>

      <hr/>

      <!-- Description -->
      ${cleanDesc ? `
      <h6 class="fw-bold">About this place</h6>
      <p class="text-muted">${cleanDesc.slice(0, 600)}${cleanDesc.length > 600 ? "…" : ""}</p>
      ` : ""}

      <!-- Neighborhood -->
      ${cleanNeigh ? `
      <h6 class="fw-bold mt-3">The neighborhood</h6>
      <p class="text-muted">${cleanNeigh}</p>
      ` : ""}

      <hr/>

      <!-- Amenities -->
      ${amenities.length ? `
      <h6 class="fw-bold mt-3">Amenities</h6>
      <div class="mb-3">
        ${amenities.slice(0, 20).map((a) => `<span class="modal-amenity-pill">${a}</span>`).join("")}
        ${amenities.length > 20 ? `<span class="modal-amenity-pill text-muted">+${amenities.length - 20} more</span>` : ""}
      </div>
      ` : ""}

      <hr/>

      <!-- Host -->
      <h6 class="fw-bold">Your host</h6>
      <div class="modal-host-row">
        <img
          class="modal-host-avatar"
          src="${listing.host_picture_url || listing.host_thumbnail_url || ""}"
          alt="${listing.host_name}"
          onerror="this.src='https://placehold.co/52x52/2a2420/f5efe6?text=${(listing.host_name || "?")[0]}'"
        />
        <div>
          <strong>${listing.host_name}${isSuperhost ? " ⭐ Superhost" : ""}</strong><br/>
          <small class="text-muted">
            Hosting since ${new Date(listing.host_since).getFullYear()} ·
            ${listing.host_response_rate || "–"} response rate
          </small>
          ${listing.host_about ? `<p class="small text-muted mt-1 mb-0">${listing.host_about.slice(0, 200)}…</p>` : ""}
        </div>
      </div>

      <!-- Price -->
      <div class="d-flex justify-content-between align-items-center mt-3">
        <div>
          <span style="font-family:'Playfair Display',serif;font-size:1.8rem;font-weight:700">
            ${formatPrice(listing.price)}
          </span>
          <span class="text-muted"> / night</span>
        </div>
      </div>
    `;

    bsModal.show();
  }

  // ── Load data via fetch + async/await ────────────────────────────
  async function loadData() {
    try {
      const res      = await fetch("./airbnb_sf_listings_500.json");
      const listings = await res.json();

      allListings = listings.slice(0, 50);
      me.redraw(allListings);
    } catch (err) {
      console.error("Failed to load listings:", err);
      const loadingEl = document.getElementById("loading-state");
      if (loadingEl) {
        loadingEl.innerHTML = `
          <p class="text-danger">
            ⚠️ Could not load listings.<br/>
            Run this page through a local server, e.g.:<br/>
            <code>python3 -m http.server 8080</code>
          </p>`;
      }
    }
  }

  // ── Wire up controls ─────────────────────────────────────────────
  function init() {
    if (searchInput) {
      searchInput.addEventListener("input", applyFiltersAndSort);
    }
    if (sortSelect) {
      sortSelect.addEventListener("change", applyFiltersAndSort);
    }
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeFilter = btn.dataset.filter;
        applyFiltersAndSort();
      });
    });
  }

  me.redraw   = redraw;
  me.loadData = loadData;

  init();
  return me;
}

// ── Bootstrap the app ─────────────────────────────────────────────
const main = MainModule();
main.loadData();
