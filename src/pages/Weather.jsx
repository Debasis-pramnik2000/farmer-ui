import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Weather.css";
function Weather() {
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [locationSource, setLocationSource] = useState("gps"); // "gps" | "search" | "profile"
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [current, setCurrent] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [hourlyAll, setHourlyAll] = useState([]);
  const [daily, setDaily] = useState([]);
  const [sun, setSun] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [advice, setAdvice] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [crop, setCrop] = useState("");
  const [cropAdvice, setCropAdvice] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const watchIdRef = useRef(null);
  const skipReverseGeocodeRef = useRef(false);
  const navigate = useNavigate();

  const crops = [
    "Paddy",
    "Wheat",
    "Tomato",
    "Potato",
    "Onion",
    "Vegetables",
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  const getSavedUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  };

  const getWeatherInfo = (code) => {
    if (code === 0) return { icon: "☀️", text: "Clear Sky" };
    if (code <= 3) return { icon: "⛅", text: "Partly Cloudy" };
    if (code <= 48) return { icon: "☁️", text: "Foggy" };
    if (code <= 67) return { icon: "🌧️", text: "Rainy" };
    if (code <= 77) return { icon: "❄️", text: "Snow" };
    if (code <= 82) return { icon: "🌦️", text: "Showers" };
    if (code <= 99) return { icon: "⛈️", text: "Thunderstorm" };
    return { icon: "🌤️", text: "Unknown" };
  };

  const getAqiInfo = (val) => {
    if (val === null || val === undefined) {
      return { text: "Unavailable", color: "#888" };
    }

    if (val <= 50) return { text: "Good", color: "#2e7d32" };
    if (val <= 100) return { text: "Moderate", color: "#f9a825" };
    if (val <= 150) {
      return { text: "Unhealthy (Sensitive)", color: "#ef6c00" };
    }
    if (val <= 200) return { text: "Unhealthy", color: "#c62828" };
    if (val <= 300) return { text: "Very Unhealthy", color: "#6a1b9a" };
    return { text: "Hazardous", color: "#4e342e" };
  };

  // Accurate Indian rural reverse geocoding (zoom=14 avoids street/building noise)
  const getLocationName = async (latitude, longitude) => {
    try {
      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1&accept-language=en`
      );

      if (nomRes.ok) {
        const nomData = await nomRes.json();
        const addr = nomData.address || {};

        const villageOrTown =
          addr.village ||
          addr.town ||
          addr.hamlet ||
          addr.suburb ||
          addr.city_district ||
          addr.city ||
          addr.county;

        const block =
          addr.county && addr.county !== villageOrTown ? addr.county : null;

        const district =
          addr.state_district && addr.state_district !== villageOrTown
            ? addr.state_district
            : addr.state;

        const parts = [villageOrTown, block, district].filter(Boolean);
        const uniqueParts = [...new Set(parts)];

        if (uniqueParts.length > 0) {
          return uniqueParts.join(", ");
        }
      }
    } catch {
      // Fallback to BigDataCloud below
    }

    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );

    if (!response.ok) {
      throw new Error("Unable to identify your current location.");
    }

    const data = await response.json();
    const administrative = data.localityInfo?.administrative || [];

    const preferredArea = administrative.find((item) =>
      /village|town|city|district/i.test(
        `${item.description || ""} ${item.name || ""}`
      )
    );

    const primary =
      data.locality ||
      data.city ||
      preferredArea?.name ||
      data.principalSubdivision ||
      "Your Village";

    const sub = data.principalSubdivision;
    if (sub && primary !== sub) {
      return `${primary}, ${sub}`;
    }

    return primary;
  };

  // Geocode farmer's registered profile village/district when GPS is inaccurate (> 2000m)
  const fallbackToProfileLocation = useCallback(async () => {
    const user = getSavedUser();
    const candidates = [
      [user.village, user.district, user.state].filter(Boolean).join(", "),
      [user.district, user.state].filter(Boolean).join(", "),
    ].filter(Boolean);

    for (const query of candidates) {
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            user.village || user.district
          )}&count=5&language=en&format=json`
        );
        if (!res.ok) continue;
        const data = await res.json();
        const results = data.results || [];
        const match =
          results.find(
            (r) =>
              (!user.state ||
                r.admin1?.toLowerCase() === user.state.toLowerCase()) &&
              (!user.district ||
                r.admin2?.toLowerCase().includes(user.district.toLowerCase()) ||
                r.name?.toLowerCase().includes(user.district.toLowerCase()))
          ) || results[0];

        if (match) {
          skipReverseGeocodeRef.current = true;
          setLocationSource("profile");
          setLocationAccuracy(null);
          setLocationName(query);
          setLat(match.latitude);
          setLon(match.longitude);
          return true;
        }
      } catch {
        // Try next candidate
      }
    }
    return false;
  }, []);

  // Stop any active GPS watcher
  const clearGeoWatch = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Automatic High-Accuracy GPS Detection
  const detectExactLocation = useCallback(() => {
    if (!navigator.geolocation) {
      fallbackToProfileLocation();
      return;
    }

    if (
      window.location.protocol !== "https:" &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      fallbackToProfileLocation();
      return;
    }

    clearGeoWatch();
    setLoading(true);
    setMsg("");
    setSearchResults([]);
    setLocationName("Detecting your village...");

    let bestCoords = null;
    let bestAccuracy = Infinity;
    let settled = false;

    const applyBestPosition = async () => {
      if (!bestCoords) {
        const usedProfile = await fallbackToProfileLocation();
        if (!usedProfile) {
          setLoading(false);
          setMsg(
            "Unable to lock GPS signal. Please search your village or district above."
          );
        }
        return;
      }

      // If accuracy is > 3000m (laptop ISP IP location) and user has a saved village, prefer their registered village
      if (bestAccuracy > 3000) {
        const usedProfile = await fallbackToProfileLocation();
        if (usedProfile) {
          setMsg(
            "Desktop IP location was imprecise, so weather is shown for your registered village. Use Search above to change location."
          );
          return;
        }
      }

      skipReverseGeocodeRef.current = false;
      setLocationSource("gps");
      setLat(bestCoords.latitude);
      setLon(bestCoords.longitude);
      setLocationAccuracy(Math.round(bestAccuracy));
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { coords } = position;

        if (coords.accuracy < bestAccuracy) {
          bestAccuracy = coords.accuracy;
          bestCoords = coords;
        }

        // Lock immediately if true hardware GPS (< 300m accuracy)
        if (coords.accuracy <= 300 && !settled) {
          settled = true;
          clearGeoWatch();
          applyBestPosition();
        }
      },
      async (error) => {
        clearGeoWatch();
        if (!settled) {
          settled = true;
          if (bestCoords) {
            applyBestPosition();
          } else {
            const usedProfile = await fallbackToProfileLocation();
            if (!usedProfile) {
              setLoading(false);
              if (error.code === error.PERMISSION_DENIED) {
                setMsg(
                  "Location access blocked. Allow location permission or search your village above."
                );
              } else {
                setMsg(
                  "Unable to lock GPS signal. Search your village or district above."
                );
              }
            }
          }
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );

    // Finalize after 5 seconds using the most accurate reading captured
    setTimeout(() => {
      if (!settled) {
        settled = true;
        clearGeoWatch();
        applyBestPosition();
      }
    }, 5000);
  }, [clearGeoWatch, fallbackToProfileLocation]);

  useEffect(() => {
    detectExactLocation();
    return () => clearGeoWatch();
  }, [detectExactLocation, clearGeoWatch]);

  // Manual Village / Town / District Search
  const handleManualSearch = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    clearGeoWatch();
    setSearching(true);
    setMsg("");
    setSearchResults([]);

    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          query
        )}&count=6&language=en&format=json`
      );

      if (!res.ok) {
        throw new Error("Location search failed.");
      }

      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        setMsg(`No village/town found for "${query}". Try nearby town or block name.`);
      } else {
        setSearchResults(data.results);
      }
    } catch (err) {
      setMsg(err.message || "Unable to search location.");
    } finally {
      setSearching(false);
    }
  };

  const selectSearchedLocation = (place) => {
    const labelParts = [place.name, place.admin2, place.admin1].filter(Boolean);
    const uniqueLabel = [...new Set(labelParts)].join(", ");

    skipReverseGeocodeRef.current = true;
    setLocationSource("search");
    setSearchResults([]);
    setSearchQuery("");
    setLocationAccuracy(null);
    setLocationName(uniqueLabel);
    setLat(place.latitude);
    setLon(place.longitude);
  };

  // Load weather using detected or searched coordinates
  const loadWeather = useCallback(async () => {
    if (lat === null || lon === null) return;

    setLoading(true);

    try {
      // 1. Reverse geocode only when coordinates came from GPS (do not overwrite manual/profile names)
      if (!skipReverseGeocodeRef.current) {
        const name = await getLocationName(lat, lon);
        setLocationName(name);
      }

      // 2. Fetch current weather and forecasts
      const weatherUrl =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}` +
        `&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,precipitation_probability` +
        `&hourly=temperature_2m,weather_code,precipitation_probability` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset` +
        `&timezone=auto&forecast_days=7`;

      const weatherResponse = await fetch(weatherUrl);

      if (!weatherResponse.ok) {
        throw new Error("Unable to fetch weather data.");
      }

      const weatherData = await weatherResponse.json();

      if (!weatherData.current || !weatherData.hourly || !weatherData.daily) {
        throw new Error("Weather data is incomplete.");
      }

      const now = weatherData.current;

      setCurrent({
        temp: now.temperature_2m,
        feels: now.apparent_temperature,
        humidity: now.relative_humidity_2m,
        wind: now.wind_speed_10m,
        windDir: now.wind_direction_10m,
        code: now.weather_code,
        rain: now.precipitation_probability ?? 0,
      });

      // 3. Sunrise and sunset
      setSun({
        sunrise: weatherData.daily.sunrise?.[0]?.slice(11, 16) || "--:--",
        sunset: weatherData.daily.sunset?.[0]?.slice(11, 16) || "--:--",
      });

      // 4. Today's hourly forecast
      const hours = weatherData.hourly.time;
      const todayStr = weatherData.daily.time[0];
      const slots = ["06:00", "12:00", "18:00", "21:00"];

      const picked = slots
        .map((slot) => {
          const index = hours.findIndex(
            (time) => time === `${todayStr}T${slot}`
          );

          if (index === -1) return null;

          return {
            time: slot,
            temp: weatherData.hourly.temperature_2m[index],
            code: weatherData.hourly.weather_code[index],
            rain: weatherData.hourly.precipitation_probability[index] ?? 0,
          };
        })
        .filter(Boolean);

      setHourly(picked);

      // 5. Full 24-hour graph
      const allHours = hours.slice(0, 24).map((time, index) => ({
        time,
        temp: weatherData.hourly.temperature_2m[index],
        rain: weatherData.hourly.precipitation_probability[index] ?? 0,
      }));

      setHourlyAll(allHours);

      // 6. Seven-day forecast
      setDaily(
        weatherData.daily.time.map((date, index) => ({
          date,
          code: weatherData.daily.weather_code[index],
          max: weatherData.daily.temperature_2m_max[index],
          min: weatherData.daily.temperature_2m_min[index],
          rain: weatherData.daily.precipitation_probability_max[index] ?? 0,
        }))
      );

      // 7. General farming advice
      const temperature = now.temperature_2m;
      const rain = now.precipitation_probability ?? 0;

      let tip = "";

      if (rain >= 70) {
        tip =
          "🌧️ Heavy rain is likely. Check field drainage and avoid unnecessary irrigation.";
      } else if (rain >= 40) {
        tip =
          "🌦️ Rain is possible. Consider reducing irrigation and keeping drainage ready.";
      } else if (temperature >= 35) {
        tip =
          "☀️ Very hot weather. Consider irrigating early in the morning or late in the evening.";
      } else if (temperature <= 12) {
        tip =
          "❄️ Cold weather. Monitor young crops for cold-related damage.";
      } else {
        tip =
          "🌤️ Weather conditions are relatively normal. Continue regular farm activities.";
      }

      setAdvice(tip);

      // 8. Weather alerts
      const newAlerts = [];

      if (now.weather_code >= 95) {
        newAlerts.push(
          "⛈️ Thunderstorm conditions detected. Take appropriate safety precautions."
        );
      }

      if (now.wind_speed_10m >= 40) {
        newAlerts.push(
          "💨 Strong winds detected. Consider postponing pesticide spraying."
        );
      }

      if (rain >= 80) {
        newAlerts.push(
          "🌧️ High chance of rain. Check drainage and consider postponing harvesting."
        );
      }

      if (temperature >= 40) {
        newAlerts.push(
          "🔥 Extreme heat. Protect crops from heat stress and stay hydrated."
        );
      }

      setAlerts(newAlerts);

      // 9. Air quality
      try {
        const aqiResponse = await fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,european_aqi`
        );

        if (!aqiResponse.ok) {
          throw new Error("Air quality data unavailable.");
        }

        const aqiData = await aqiResponse.json();

        if (aqiData.current) {
          setAqi({
            pm25: aqiData.current.pm2_5,
            pm10: aqiData.current.pm10,
            aqi: aqiData.current.european_aqi,
          });
        } else {
          setAqi(null);
        }
      } catch {
        setAqi(null);
      }

      setLastUpdated(new Date().toLocaleTimeString("en-IN"));
    } catch (error) {
      console.error("Weather loading error:", error);
      setMsg(
        error.message || "Failed to load weather data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [lat, lon]);

  useEffect(() => {
    if (lat !== null && lon !== null) {
      loadWeather();
    }
  }, [lat, lon, loadWeather]);

  // Crop-specific advice
  useEffect(() => {
    if (!crop || !current) {
      setCropAdvice("");
      return;
    }

    const temperature = current.temp;
    const rain = current.rain;
    let adviceText = "";

    if (crop === "Paddy") {
      if (rain >= 70) {
        adviceText =
          "🌾 Paddy: Rain is likely. Check field water levels before irrigation.";
      } else if (temperature >= 35) {
        adviceText =
          "🌾 Paddy: Hot weather. Check soil moisture and irrigate when needed.";
      } else {
        adviceText =
          "🌾 Paddy: Monitor field water levels and maintain suitable moisture.";
      }
    } else if (crop === "Wheat") {
      if (rain >= 60) {
        adviceText =
          "🌾 Wheat: Rain is likely. Avoid unnecessary irrigation.";
      } else if (temperature <= 15) {
        adviceText =
          "🌾 Wheat: Cold conditions. Monitor the crop for cold damage.";
      } else {
        adviceText =
          "🌾 Wheat: Check soil moisture and irrigate when necessary.";
      }
    } else if (crop === "Tomato") {
      if (rain >= 60) {
        adviceText =
          "🍅 Tomato: Wet conditions may increase fungal disease risk. Inspect leaves and ensure drainage.";
      } else {
        adviceText =
          "🍅 Tomato: Water consistently and avoid waterlogging.";
      }
    } else if (crop === "Potato") {
      if (rain >= 60) {
        adviceText =
          "🥔 Potato: Wet conditions may increase blight risk. Inspect plants and maintain drainage.";
      } else {
        adviceText =
          "🥔 Potato: Monitor soil moisture and continue regular crop care.";
      }
    } else if (crop === "Onion") {
      if (rain >= 70) {
        adviceText =
          "🧅 Onion: Rain is likely. Ensure good drainage to prevent waterlogging.";
      } else {
        adviceText =
          "🧅 Onion: Avoid overwatering and monitor soil moisture.";
      }
    } else {
      if (rain >= 70) {
        adviceText =
          "🥬 Vegetables: Rain is likely. Check soil moisture before watering.";
      } else {
        adviceText =
          "🥬 Vegetables: Water according to soil moisture and crop needs.";
      }
    }

    setCropAdvice(adviceText);
  }, [crop, current]);

  // Share weather details
  const handleShare = async () => {
    if (!current) return;

    const shareText =
      `🌦️ Weather at ${locationName}\n` +
      `Temperature: ${current.temp}°C (feels like ${current.feels}°C)\n` +
      `Condition: ${getWeatherInfo(current.code).text}\n` +
      `Humidity: ${current.humidity}%\n` +
      `Wind: ${current.wind} km/h\n` +
      `Rain chance: ${current.rain}%\n\n` +
      `${advice}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Farmer Bondhu Weather",
          text: shareText,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Share failed:", error);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setMsg("Weather information copied to clipboard.");
      } catch {
        setMsg("Unable to share or copy weather information.");
      }
    }
  };

  const currentInfo = current ? getWeatherInfo(current.code) : null;
  const aqiInfo = aqi ? getAqiInfo(aqi.aqi) : null;

  return (
    <div className="container kb-weather-wrap">
      <h2 className="kb-dash-title">🌦️ Weather Information</h2>

      {msg && <div className="alert alert-info">{msg}</div>}

      {/* Top Search & Auto-GPS Bar */}
      <div className="mb-3">
        <form onSubmit={handleManualSearch} className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search village, block, or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="btn kb-btn"
            disabled={searching || !searchQuery.trim()}
          >
            {searching ? "..." : "🔍 Search"}
          </button>
          <button
            type="button"
            className="btn kb-small-btn"
            onClick={detectExactLocation}
            title="Auto-detect my exact village via GPS"
          >
            📍 Auto GPS
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="list-group mt-2 shadow-sm">
            {searchResults.map((place) => (
              <button
                key={place.id}
                type="button"
                className="list-group-item list-group-item-action text-start"
                onClick={() => selectSearchedLocation(place)}
              >
                📍 <b>{place.name}</b>
                {place.admin2 ? `, ${place.admin2}` : ""}
                {place.admin1 ? `, ${place.admin1}` : ""}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fallback prompt only if permission was denied */}
      {lat === null && !loading && (
        <div className="kb-allow-location">
          <div className="kb-loc-icon">📍</div>
          <h4>Enable Location Access</h4>
          <p>
            Allow browser location permission to automatically detect your village weather.
          </p>

          <button className="btn kb-btn" onClick={detectExactLocation}>
            📍 Detect My Village
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <p className="text-center">
          {locationName || "Detecting your village weather..."}
        </p>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="kb-weather-alerts">
          {alerts.map((alert, index) => (
            <div key={index} className="kb-alert-item">
              {alert}
            </div>
          ))}
        </div>
      )}

      {/* Refresh and share */}
      {current && (
        <div className="kb-weather-actions">
          <span className="kb-weather-updated">
            Updated: {lastUpdated}
            {locationSource === "profile" && (
              <span className="badge bg-success-subtle text-success ms-2">
                Registered Village
              </span>
            )}
            {locationSource === "gps" && locationAccuracy !== null && (
              <span className="text-muted ms-2">
                (GPS ±{locationAccuracy}m)
              </span>
            )}
          </span>

          <div className="d-flex gap-2">
            <button
              className="btn kb-small-btn"
              onClick={loadWeather}
              disabled={loading}
            >
              🔄 Refresh
            </button>

            <button
              className="btn kb-small-btn"
              onClick={handleShare}
            >
              📤 Share
            </button>
          </div>
        </div>
      )}

      {/* Current weather */}
      {current && currentInfo && (
        <div className="kb-current-weather">
          <div className="kb-curr-left">
            <div className="kb-curr-icon">{currentInfo.icon}</div>

            <div>
              <div className="kb-curr-temp">{current.temp}°C</div>
              <div className="kb-curr-cond">{currentInfo.text}</div>
              <div className="kb-curr-loc">
                📍 {locationName}
              </div>
            </div>
          </div>

          <div className="kb-curr-right">
            <div className="kb-curr-item">
              <span>Feels Like</span>
              <b>{current.feels}°C</b>
            </div>

            <div className="kb-curr-item">
              <span>Humidity</span>
              <b>{current.humidity}%</b>
            </div>

            <div className="kb-curr-item">
              <span>Wind</span>
              <b>{current.wind} km/h</b>
            </div>

            <div className="kb-curr-item">
              <span>Rain Chance</span>
              <b>{current.rain}%</b>
            </div>
          </div>
        </div>
      )}

      {/* Sunrise and sunset */}
      {sun && (
        <div className="kb-sun-row">
          <div className="kb-sun-item">
            <span>🌅 Sunrise</span>
            <b>{sun.sunrise}</b>
          </div>

          <div className="kb-sun-item">
            <span>🌇 Sunset</span>
            <b>{sun.sunset}</b>
          </div>
        </div>
      )}

      {/* Air quality */}
      {aqi && aqiInfo && (
        <div className="kb-aqi-box">
          <h5>🌫️ Air Quality</h5>

          <div className="kb-aqi-row">
            <div className="kb-aqi-item">
              <span>European AQI</span>
              <b style={{ color: aqiInfo.color }}>{aqi.aqi ?? "—"}</b>
            </div>

            <div className="kb-aqi-item">
              <span>PM2.5</span>
              <b>{aqi.pm25 ?? "—"} µg/m³</b>
            </div>

            <div className="kb-aqi-item">
              <span>PM10</span>
              <b>{aqi.pm10 ?? "—"} µg/m³</b>
            </div>

            <div className="kb-aqi-item">
              <span>Status</span>
              <b style={{ color: aqiInfo.color }}>{aqiInfo.text}</b>
            </div>
          </div>
        </div>
      )}

      {/* General farming advice */}
      {advice && (
        <div className="kb-weather-advice">
          <h5>🌱 Farming Advice</h5>
          <p>{advice}</p>
        </div>
      )}

      {/* Crop-specific advice */}
      <div className="kb-crop-box">
        <h5>🌾 Crop-Specific Advice</h5>

        <select
          className="form-select"
          value={crop}
          onChange={(event) => setCrop(event.target.value)}
        >
          <option value="">Select Crop</option>

          {crops.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {cropAdvice && (
          <p className="kb-crop-advice">{cropAdvice}</p>
        )}
      </div>

      {/* Today's hourly forecast */}
      {hourly.length > 0 && (
        <div className="kb-weather-section">
          <h4 className="kb-weather-heading">Today's Forecast</h4>

          <div className="kb-hourly-row">
            {hourly.map((item) => {
              const info = getWeatherInfo(item.code);

              const label =
                item.time === "06:00"
                  ? "Morning"
                  : item.time === "12:00"
                  ? "Afternoon"
                  : item.time === "18:00"
                  ? "Evening"
                  : "Night";

              return (
                <div key={item.time} className="kb-hour-card">
                  <div className="kb-hour-label">{label}</div>
                  <div className="kb-hour-icon">{info.icon}</div>
                  <div className="kb-hour-temp">{item.temp}°C</div>
                  <div className="kb-hour-rain">💧{item.rain}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 24-hour graph */}
      {hourlyAll.length > 0 && (
        <div className="kb-weather-section">
          <h4 className="kb-weather-heading">24-Hour Trend</h4>

          <div className="kb-graph-scroll">
            <div className="kb-graph-inner">
              {hourlyAll.map((item, index) => {
                const temperatureHeight = Math.max(
                  20,
                  ((item.temp - 5) / 45) * 100
                );

                const rainHeight = Math.max(
                  2,
                  (item.rain / 100) * 60
                );

                return (
                  <div key={`${item.time}-${index}`} className="kb-graph-col">
                    <div className="kb-graph-bar-wrap">
                      <div
                        className="kb-graph-bar-rain"
                        style={{ height: `${rainHeight}%` }}
                        title={`Rain: ${item.rain}%`}
                      />

                      <div
                        className="kb-graph-bar-temp"
                        style={{ height: `${temperatureHeight}%` }}
                        title={`Temperature: ${item.temp}°C`}
                      />
                    </div>

                    <div className="kb-graph-label">
                      {item.time.slice(11, 16)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="kb-graph-legend">
            <span>
              <i className="kb-legend-dot kb-legend-temp" />
              {" "}Temperature
            </span>

            <span>
              <i className="kb-legend-dot kb-legend-rain" />
              {" "}Rain %
            </span>
          </div>
        </div>
      )}

      {/* Seven-day forecast */}
      {daily.length > 0 && (
        <div className="kb-weather-section">
          <h4 className="kb-weather-heading">7-Day Forecast</h4>

          <div className="kb-daily-list">
            {daily.map((item, index) => {
              const info = getWeatherInfo(item.code);

              const dayLabel =
                index === 0
                  ? "Today"
                  : new Date(`${item.date}T12:00:00`).toLocaleDateString(
                      "en-IN",
                      {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      }
                    );

              return (
                <div key={item.date} className="kb-daily-row">
                  <div className="kb-daily-day">{dayLabel}</div>
                  <div className="kb-daily-icon">{info.icon}</div>
                  <div className="kb-daily-cond">{info.text}</div>

                  <div className="kb-daily-temp">
                    {item.min}° / <b>{item.max}°</b>
                  </div>

                  <div className="kb-daily-rain">
                    💧{item.rain}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Location verification */}
      {lat !== null && lon !== null && (
        <div className="mt-3 mb-3">
          <p className="text-muted small">
            Weather coordinates: {lat.toFixed(5)}, {lon.toFixed(5)}
          </p>

          <a
            href={`https://www.google.com/maps?q=${lat},${lon}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Verify detected location on Google Maps
          </a>
        </div>
      )}
    </div>
  );
}

export default Weather;