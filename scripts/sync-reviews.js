const fs = require("fs");
const path = require("path");

const PLACE_ID = "ChIJzQeWRGqvbUcRpvOyffsIFT8";
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const OUTPUT_PATH = path.join(process.cwd(), "public/reviews.json");

const FALLBACK_REVIEWS = [
  {
    review_id: "fallback_1",
    name: "Marlene H.",
    rating: 5,
    text: "Matthias hat unsere Hochzeit so wunderschön festgehalten – die Bilder sind einfach atemberaubend.",
    date: "2024-09-14",
    profile_photo_url: "",
  },
  {
    review_id: "fallback_2",
    name: "Thomas B.",
    rating: 5,
    text: "Tolle Drohnenaufnahmen für unser Firmenevent. Schnelle Kommunikation, top Ergebnis.",
    date: "2024-11-03",
    profile_photo_url: "",
  },
  {
    review_id: "fallback_3",
    name: "Sandra K.",
    rating: 5,
    text: "Die Fotos für unsere Website sind genau das, was wir uns vorgestellt haben.",
    date: "2025-01-22",
    profile_photo_url: "",
  },
];

async function fetchReviews() {
  if (!API_KEY) {
    console.log("Kein API Key – Fallback wird verwendet.");
    return write(FALLBACK_REVIEWS);
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews&language=de&key=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("API Status:", data.status);

    if (data.status !== "OK" || !data.result?.reviews?.length) {
      console.log("Keine Reviews – Fallback.");
      return write(FALLBACK_REVIEWS);
    }

    const reviews = data.result.reviews
      .filter((r) => r.rating >= 4)
      .map((r) => ({
        review_id: `google_${r.time}`,
        name: r.author_name,
        rating: r.rating,
        text: r.text,
        date: new Date(r.time * 1000).toISOString().split("T")[0],
        profile_photo_url: r.profile_photo_url ?? "",
      }));

    write(reviews.length ? reviews : FALLBACK_REVIEWS);
    console.log(`${reviews.length} Reviews gespeichert.`);
  } catch (err) {
    console.error("Fehler:", err.message);
    write(FALLBACK_REVIEWS);
  }
}

function write(reviews) {
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ reviews }, null, 2), "utf-8");
  console.log("Datei geschrieben:", OUTPUT_PATH);
}

fetchReviews();
