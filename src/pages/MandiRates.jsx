import React, { useState, useEffect } from "react";

export default function PaddyRiceRate() {
  const [hierarchyData, setHierarchyData] = useState({});
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [markets, setMarkets] = useState([]);

  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("All");

  const [ratesData, setRatesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Load All States, Districts & Markets
  useEffect(() => {
    fetch("https://farmer-ai-avva.onrender.com/api/mandi/locations")
      .then((res) => res.json())
      .then((resData) => {
        const fullData = resData.data || {};

        setHierarchyData(fullData);

        const stateList = Object.keys(fullData);
        setStates(stateList);

        if (stateList.length > 0) {
          const defaultState = stateList.includes("West Bengal")
            ? "West Bengal"
            : stateList[0];

          setSelectedState(defaultState);

          const distList = Object.keys(fullData[defaultState] || {});
          setDistricts(distList);

          if (distList.length > 0) {
            const defaultDist = distList[0];

            setSelectedDistrict(defaultDist);

            setMarkets(
              fullData[defaultState][defaultDist] || []
            );
          }
        }
      })
      .catch((err) =>
        console.error("Error loading location master:", err)
      );
  }, []);

  // State Change
  const handleStateChange = (e) => {
    const newState = e.target.value;

    setSelectedState(newState);

    const distList = Object.keys(
      hierarchyData[newState] || {}
    );

    setDistricts(distList);

    if (distList.length > 0) {
      const firstDist = distList[0];

      setSelectedDistrict(firstDist);

      setMarkets(
        hierarchyData[newState][firstDist] || []
      );
    } else {
      setSelectedDistrict("");
      setMarkets([]);
    }

    setSelectedMarket("All");
  };

  // District Change
  const handleDistrictChange = (e) => {
    const newDistrict = e.target.value;

    setSelectedDistrict(newDistrict);

    setMarkets(
      hierarchyData[selectedState]?.[newDistrict] || []
    );

    setSelectedMarket("All");
  };

  // Fetch Paddy/Rice Rates Only
  const fetchTodayPrices = () => {
    if (!selectedState || !selectedDistrict) return;

    setLoading(true);

    const queryUrl = `hhttps://farmer-ai-avva.onrender.com/api/mandi/prices?state=${encodeURIComponent(
      selectedState
    )}&district=${encodeURIComponent(
      selectedDistrict
    )}&market=${encodeURIComponent(
      selectedMarket
    )}&category=Paddy`;

    fetch(queryUrl)
      .then((res) => res.json())
      .then((resData) => {
        setRatesData(resData.data || []);
        setCurrentDate(resData.date || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching paddy/rice rates:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (selectedState && selectedDistrict) {
      fetchTodayPrices();
    }
  }, [
    selectedState,
    selectedDistrict,
    selectedMarket,
  ]);

  // Search
  const filteredData = ratesData.filter(
    (row) =>
      row.commodity
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      row.market
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      row.variety
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-4">

      {/* Title */}
      <div className="text-center mb-4">
        <span className="badge bg-warning-subtle text-warning px-3 py-2 rounded-pill fw-bold mb-2">
          <i className="bi bi-flower2 me-1"></i>
          TODAY'S PADDY / RICE RATES
        </span>

        <h2 className="fw-bold text-success">
          Paddy & Rice Mandi Price
        </h2>

        <p className="text-muted">
          Today's official wholesale market prices for
          Paddy and Rice varieties.
        </p>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm p-4 mb-4 bg-white rounded-4">
        <div className="row g-3 align-items-end">

          {/* State */}
          <div className="col-md-4">
            <label className="form-label fw-bold text-dark">
              <i className="bi bi-geo-alt-fill text-success me-1"></i>
              Select State
            </label>

            <select
              className="form-select py-2 border-success-subtle shadow-none fw-semibold"
              value={selectedState}
              onChange={handleStateChange}
            >
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div className="col-md-4">
            <label className="form-label fw-bold text-dark">
              <i className="bi bi-pin-map text-primary me-1"></i>
              Select District / Region
            </label>

            <select
              className="form-select py-2 border-primary-subtle shadow-none fw-semibold"
              value={selectedDistrict}
              onChange={handleDistrictChange}
            >
              {districts.map((dst) => (
                <option key={dst} value={dst}>
                  {dst}
                </option>
              ))}
            </select>
          </div>

          {/* Market */}
          <div className="col-md-4">
            <label className="form-label fw-bold text-dark">
              <i className="bi bi-shop text-danger me-1"></i>
              Select Mandi / Market
            </label>

            <select
              className="form-select py-2 shadow-none"
              value={selectedMarket}
              onChange={(e) =>
                setSelectedMarket(e.target.value)
              }
            >
              <option value="All">
                All Mandis in {selectedDistrict}
              </option>

              {markets.map((mkt) => (
                <option key={mkt} value={mkt}>
                  {mkt}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Header + Search */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">

        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-success py-2 px-3 fs-6">
            <i className="bi bi-calendar-event me-1"></i>
            Date: {currentDate || "Today"}
          </span>

          <span className="badge bg-light text-dark border py-2 px-3">
            {selectedState} ➔ {selectedDistrict}

            {selectedMarket !== "All" &&
              ` ➔ ${selectedMarket}`}
          </span>
        </div>

        <div style={{ maxWidth: "320px", width: "100%" }}>
          <div className="input-group">
            <span className="input-group-text bg-white">
              <i className="bi bi-search text-muted"></i>
            </span>

            <input
              type="text"
              className="form-control"
              placeholder="Search paddy, rice or market..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">

          <table className="table table-hover align-middle mb-0">

            <thead className="table-warning text-dark">
              <tr>
                <th className="py-3 ps-4">
                  Paddy / Rice
                </th>

                <th className="py-3">
                  Variety / Grade
                </th>

                <th className="py-3">
                  Original Mandi / APMC Market
                </th>

                <th className="py-3">
                  Min Price (₹/Kg)
                </th>

                <th className="py-3">
                  Max Price (₹/Kg)
                </th>

                <th className="py-3 text-success fw-bold">
                  Today's Price (₹/Kg)
                </th>

                <th className="py-3 text-center">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">

                    <div
                      className="spinner-border text-success"
                      role="status"
                    ></div>

                    <p className="text-muted mt-2 mb-0">
                      Loading Paddy/Rice rates...
                    </p>

                  </td>
                </tr>

              ) : filteredData.length > 0 ? (

                filteredData.map((row, index) => (
                  <tr key={index}>

                    <td className="ps-4 fw-bold text-dark">
                      <i className="bi bi-flower2 text-warning me-2"></i>
                      {row.commodity}
                    </td>

                    <td>
                      <span className="badge bg-light text-dark border">
                        {row.variety}
                      </span>
                    </td>

                    <td className="text-dark fw-semibold">
                      <i className="bi bi-building me-1 text-secondary"></i>
                      {row.market}
                    </td>

                    <td className="text-muted">
                      {row.min_price_kg}
                    </td>

                    <td className="text-muted">
                      {row.max_price_kg}
                    </td>

                    <td className="fw-bold text-success fs-6">
                      {row.modal_price_kg}
                      <small className="text-muted fw-normal">
                        {" "}/ kg
                      </small>
                    </td>

                    <td className="text-center text-muted small fw-semibold">
                      {row.date}
                    </td>

                  </tr>
                ))

              ) : (

                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-5 text-muted"
                  >
                    <i className="bi bi-inbox display-4 d-block mb-2 text-secondary"></i>

                    No Paddy/Rice market records found.
                  </td>
                </tr>

              )}

            </tbody>
          </table>

        </div>
      </div>

    </div>
  );
}