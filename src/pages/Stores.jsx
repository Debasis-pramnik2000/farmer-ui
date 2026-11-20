import React, { useEffect, useState, useCallback } from "react";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(2);
}

export default function NearbyShops() {
  const [coords, setCoords] = useState(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locError, setLocError] = useState("");

  const savedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const requestLocation = useCallback(() => {
    setLocError("");
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setLoading(false);
        setLocError(
          "Location access denied. Please allow location permission in your browser to see shops near you."
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    if (!coords) return;

    let cancelled = false;

    const fetchNearbyShops = async () => {
      setLoading(true);
      setLocError("");
      const radiusMeters = radiusKm * 1000;

      const query = `[out:json][timeout:15];(node["shop"~"agrarian|fertilizer|seed|pesticide|farm|garden_centre|hardware"](around:${radiusMeters},${coords.lat},${coords.lng});node["name"~"Krishi|Kisan|Fertilizer|Seed|Pesticide|Agro|Bhandar|Sar",i](around:${radiusMeters},${coords.lat},${coords.lng}););out 30;`;

      let fetchedData = null;

      for (const endpoint of OVERPASS_ENDPOINTS) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 10000);

          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
            body: `data=${encodeURIComponent(query)}`,
            signal: controller.signal,
          });

          clearTimeout(timer);

          if (!res.ok) continue;
          fetchedData = await res.json();
          break;
        } catch {
          // Try next Overpass mirror
        }
      }

      if (cancelled) return;

      if (!fetchedData) {
        setLoading(false);
        setLocError("Map server is busy right now. You can still view shops directly on Google Maps below.");
        return;
      }

      const elements = fetchedData.elements || [];
      const seenIds = new Set();

      const mapped = elements
        .filter((el) => {
          if (seenIds.has(el.id)) return false;
          seenIds.add(el.id);
          return el.lat && el.lon;
        })
        .map((el) => {
          const tags = el.tags || {};
          const name =
            tags.name ||
            tags["name:en"] ||
            "Local Agri & Fertilizer Store";

          const address = [
            tags["addr:street"],
            tags["addr:village"] || tags["addr:suburb"] || tags["addr:city"],
            tags["addr:district"],
          ]
            .filter(Boolean)
            .join(", ");

          return {
            id: el.id,
            name,
            address: address || "Near your current location",
            phone: tags.phone || tags["contact:phone"] || "",
            lat: el.lat,
            lng: el.lon,
            distance: getDistanceKm(coords.lat, coords.lng, el.lat, el.lon),
          };
        })
        .sort((a, b) => a.distance - b.distance);

      setShops(mapped);
      setLoading(false);
    };

    fetchNearbyShops();

    return () => {
      cancelled = true;
    };
  }, [coords, radiusKm]);

  const fallbackArea = [savedUser.village, savedUser.district, savedUser.state]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 bg-white">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h5 className="fw-bold text-success mb-1">
            🏪 Nearby Agri &amp; Pesticide Shops
          </h5>
          <small className="text-muted">
            {coords
              ? `Showing shops within ${radiusKm} km of your live location`
              : "Enable location to find fertilizer & medicine shops near you"}
          </small>
        </div>

        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select form-select-sm kb-radius-select"
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
          >
            <option value={5}>Within 5 km</option>
            <option value={10}>Within 10 km</option>
            <option value={20}>Within 20 km</option>
          </select>

          <button
            type="button"
            className="btn btn-outline-success btn-sm"
            onClick={requestLocation}
          >
            📍 Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-success spinner-border-sm me-2"></div>
          <span className="text-muted">Searching agri shops near you...</span>
        </div>
      )}

      {!loading && locError && (
        <div className="alert alert-warning d-flex justify-content-between align-items-center flex-wrap gap-2 mb-0">
          <span>{locError}</span>
          <div className="d-flex gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-outline-dark btn-sm"
              onClick={requestLocation}
            >
              🔄 Retry
            </button>
            {coords && (
              <a
                href={`https://www.google.com/maps/search/fertilizer+pesticide+shop/@${coords.lat},${coords.lng},13z`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-success btn-sm"
              >
                🗺️ Open in Google Maps
              </a>
            )}
          </div>
        </div>
      )}

      {!loading && !locError && shops.length === 0 && coords && (
        <div className="text-center py-3">
          <p className="text-muted mb-2">
            No tagged agri shops found within {radiusKm} km on OpenStreetMap.
            Try increasing the radius to 20 km or view directly on Maps:
          </p>
          <a
            href={`https://www.google.com/maps/search/fertilizer+pesticide+shop/@${coords.lat},${coords.lng},13z`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-success btn-sm"
          >
            🗺️ View Agri Shops Near Me on Google Maps
          </a>
        </div>
      )}

      {!loading && shops.length > 0 && (
        <div className="kb-shop-list mt-2">
          {shops.map((shop) => (
            <div className="kb-shop-card" key={shop.id}>
              <div className="kb-shop-card-left">
                <div className="kb-shop-name">{shop.name}</div>
                <div className="kb-shop-address">📍 {shop.address}</div>
                <div className="kb-shop-distance">
                  📏 {shop.distance} km away
                </div>
              </div>

              <div className="kb-shop-card-right">
                {shop.phone && (
                  <a
                    href={`tel:${shop.phone}`}
                    className="kb-shop-btn kb-call-btn text-decoration-none text-center"
                  >
                    📞 Call
                  </a>
                )}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="kb-shop-btn kb-dir-btn text-decoration-none text-center"
                >
                  🧭 Directions
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {!coords && fallbackArea && (
        <div className="mt-3 text-center">
          <a
            href={`https://www.google.com/maps/search/${encodeURIComponent(
              `fertilizer pesticide shop near ${fallbackArea}`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline-success btn-sm"
          >
            Search Shops Near {fallbackArea}
          </a>
        </div>
      )}
    </div>
  );
}