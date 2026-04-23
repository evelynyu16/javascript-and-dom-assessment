# AirBnB SF Listings — JavaScript & DOM Assessment

An interactive Airbnb listings explorer for San Francisco, built with vanilla JavaScript, DOM manipulation, and Bootstrap 5.

## 🚀 Live Demo

> **[View on GitHub Pages →](https://YOUR_USERNAME.github.io/airbnb-listings/)**

https://evelynyu16.github.io/javascript-and-dom-assessment/assessment/
---

## ✅ Requirements Checklist

- [x] Loads first **50 listings** from `airbnb_sf_listings_500.json` via **`fetch` + `async/await`** (AJAX)
- [x] Displays **listing name** (parsed from the full name string)
- [x] Displays **description** (HTML stripped to plain text)
- [x] Displays **amenities** (pills on card + full list in modal)
- [x] Displays **host name and photo**
- [x] Displays **price** per night
- [x] Displays **thumbnail** image
- [x] **Creative addition:** Click-to-expand Bootstrap **detail modal** showing full description, neighborhood overview, all amenities, host bio, rating stats, and a direct link to the Airbnb listing

---

## ✨ Features

- **AJAX data loading** — `fetch` + `async/await` in `js/main.js`
- **`MainModule` pattern** — matches the class structure exactly
- **Real-time search** — filter by name, neighborhood, or host
- **Room type filters** — All / Entire Home / Private Room
- **Sort** — Default, Price low→high / high→low, Highest Rated
- **Superhost badge** and **room type badge** on each card
- **Detail modal** — Bootstrap modal with full listing info (creative addition)
- **Responsive grid** — Bootstrap `col-sm-6 col-lg-4` layout

---

## 📁 File Structure

```
/
├── index.html                      # Main HTML page
├── css/
│   └── main.css                    # Custom styles
├── js/
│   └── main.js                     # MainModule: fetch, render, filter, modal
├── airbnb_sf_listings_500.json     # Data file (place here!)
└── README.md
```

---

## 🛠 How to Run Locally

> **Important:** `fetch()` is blocked for `file://` URLs. Always use a local server.

1. Place `airbnb_sf_listings_500.json` in the **project root** (same folder as `index.html`)

2. Start a local server:

   ```bash
   # Python (simplest)
   python3 -m http.server 8080

   # Node
   npx serve .
   ```

3. Open `http://localhost:8080`

---


