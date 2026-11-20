import React, { useState, useEffect } from "react";

const API_BASE = "https://farmer-ai-avva.onrender.com";

const FALLBACK_REGIONS = [
  {
    state: "West Bengal",
    districts: [
      "Burdwan",
      "Purba Medinipur",
      "Paschim Medinipur",
      "Nadia",
      "Murshidabad",
    ],
  },
];

export default function ProfitPredictor() {
  const [formData, setFormData] = useState({
    crop: "Paddy",
    area: 1,
    unit: "bigha",
    state: "West Bengal",
    district: "Purba Medinipur",
    season: "Kharif",
  });

  const [regions, setRegions] = useState(FALLBACK_REGIONS);
  const [regionsLoading, setRegionsLoading] = useState(true);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const crops = [
    "Paddy",
    "Potato",
    "Wheat",
    "Tomato",
    "Onion",
    "Mustard",
    "Maize",
  ];

  // Load States + Districts from the backend once on mount
  useEffect(() => {
    let cancelled = false;

    const loadRegions = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/profit/regions`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load regions (${response.status}).`
          );
        }

        const data = await response.json();

        if (
          !cancelled &&
          Array.isArray(data.states) &&
          data.states.length > 0
        ) {
          setRegions(data.states);
        }
      } catch (err) {
        // Keep fallback regions so the form stays usable
        console.warn("Region load failed, using fallback:", err);
      } finally {
        if (!cancelled) {
          setRegionsLoading(false);
        }
      }
    };

    loadRegions();

    return () => {
      cancelled = true;
    };
  }, []);

  // Derived list of districts for the currently selected state
  const selectedStateEntry = regions.find(
    (entry) => entry.state === formData.state
  );

  const districts = selectedStateEntry?.districts || [];

  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // When state changes, reset district to the first district of
  // the new state so we never send a district/state mismatch.
  const handleStateChange = (newState) => {
    const entry = regions.find((item) => item.state === newState);
    const firstDistrict = entry?.districts?.[0] || "";

    setFormData((previous) => ({
      ...previous,
      state: newState,
      district: firstDistrict,
    }));
  };

  const formatCurrency = (value) => {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
      return "N/A";
    }

    return `₹${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const formatNumber = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "N/A";
    }

    return number.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `${API_BASE}/api/predict-profit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            area: Number(formData.area),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail ||
            errorData?.message ||
            `Request failed with status ${response.status}.`
        );
      }

      const data = await response.json();

      if (!data.prediction) {
        throw new Error(
          "The server response does not contain prediction data."
        );
      }

      setResult(data.prediction);
    } catch (err) {
      setError(
        err.message ||
          "Unable to calculate the crop profit. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const financialSummary = result?.financial_summary || {};
  const costs = result?.costs || {};
  const yieldPrediction = result?.yield_prediction || {};
  const marketPrice = result?.market_price || {};

  return (
    <div className="container py-4">
      {/* Page Header */}
      <div className="text-center mb-4">
        <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-bold mb-2">
          AI FARM FINANCE
        </span>

        <h2 className="fw-bold text-success">
          Crop Profit and Yield Predictor
        </h2>

        <p className="text-muted">
          Estimate your farming costs, crop yield, market revenue,
          and potential profit before cultivation.
        </p>
      </div>

      <div className="row g-4">
        {/* Input Form */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold mb-3 text-dark">
              <i className="bi bi-pencil-square text-success me-2"></i>
              Farm Details
            </h5>

            <form onSubmit={handleSubmit}>
              {/* Crop */}
              <div className="mb-3">
                <label className="form-label small fw-bold">
                  Select Crop
                </label>

                <select
                  className="form-select shadow-none"
                  value={formData.crop}
                  onChange={(e) =>
                    updateField("crop", e.target.value)
                  }
                  required
                >
                  {crops.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </div>

              {/* Land Area and Unit */}
              <div className="row g-2 mb-3">
                <div className="col-7">
                  <label className="form-label small fw-bold">
                    Land Area
                  </label>

                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    className="form-control shadow-none"
                    value={formData.area}
                    onChange={(e) =>
                      updateField(
                        "area",
                        e.target.value === ""
                          ? ""
                          : Number(e.target.value)
                      )
                    }
                    required
                  />
                </div>

                <div className="col-5">
                  <label className="form-label small fw-bold">
                    Unit
                  </label>

                  <select
                    className="form-select shadow-none"
                    value={formData.unit}
                    onChange={(e) =>
                      updateField("unit", e.target.value)
                    }
                  >
                    <option value="bigha">Bigha</option>
                    <option value="acre">Acre</option>
                    <option value="decimal">Decimal</option>
                  </select>
                </div>
              </div>

              {/* State */}
              <div className="mb-3">
                <label className="form-label small fw-bold">
                  State
                </label>

                <select
                  className="form-select shadow-none"
                  value={formData.state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  disabled={regionsLoading}
                  required
                >
                  {regionsLoading && (
                    <option value={formData.state}>
                      Loading states...
                    </option>
                  )}

                  {!regionsLoading &&
                    regions.map((entry) => (
                      <option key={entry.state} value={entry.state}>
                        {entry.state}
                      </option>
                    ))}
                </select>
              </div>

              {/* District */}
              <div className="mb-3">
                <label className="form-label small fw-bold">
                  District
                </label>

                <select
                  className="form-select shadow-none"
                  value={formData.district}
                  onChange={(e) =>
                    updateField("district", e.target.value)
                  }
                  disabled={regionsLoading || districts.length === 0}
                  required
                >
                  {districts.length === 0 && (
                    <option value="">
                      {regionsLoading
                        ? "Loading districts..."
                        : "No districts available"}
                    </option>
                  )}

                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              {/* Season */}
              <div className="mb-3">
                <label className="form-label small fw-bold">
                  Farming Season
                </label>

                <select
                  className="form-select shadow-none"
                  value={formData.season}
                  onChange={(e) =>
                    updateField("season", e.target.value)
                  }
                  required
                >
                  <option value="Kharif">Kharif</option>
                  <option value="Rabi">Rabi</option>
                  <option value="Zaid">Zaid</option>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-success w-100 py-2 fw-bold shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Calculating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-calculator me-2"></i>
                    Predict Profit and Yield
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results Dashboard */}
        <div className="col-lg-8">
          {/* Error */}
          {error && (
            <div
              className="alert alert-danger"
              role="alert"
            >
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {/* Initial State */}
          {!result && !loading && (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white h-100 d-flex justify-content-center">
              <i className="bi bi-calculator display-3 text-muted mb-3"></i>

              <h5 className="fw-bold">
                Your Crop Prediction Will Appear Here
              </h5>

              <p className="text-muted mb-0">
                Enter your farm details and click the prediction
                button to view the estimated costs, yield, and profit.
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
              <div
                className="spinner-border text-success mx-auto mb-3"
                role="status"
              ></div>

              <h5 className="fw-bold">
                Analyzing Your Farm Data
              </h5>

              <p className="text-muted mb-0">
                Please wait while the server calculates your crop
                prediction.
              </p>
            </div>
          )}

          {/* Prediction Results */}
          {result && (
            <div>
              {/* Financial Summary */}
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-top border-4 border-danger h-100">
                    <small className="text-muted fw-bold">
                      Estimated Total Cost
                    </small>

                    <h3 className="fw-bold text-danger my-2">
                      {formatCurrency(financialSummary.total_cost)}
                    </h3>

                    <small className="text-muted">
                      Total cultivation expenses
                    </small>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-top border-4 border-primary h-100">
                    <small className="text-muted fw-bold">
                      Expected Revenue
                    </small>

                    <h3 className="fw-bold text-primary my-2">
                      {formatCurrency(
                        financialSummary.gross_revenue
                      )}
                    </h3>

                    <small className="text-muted">
                      Estimated sales income
                    </small>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-top border-4 border-success h-100">
                    <small className="text-muted fw-bold">
                      Estimated Net Profit
                    </small>

                    <h3
                      className={`fw-bold my-2 ${
                        Number(financialSummary.net_profit) < 0
                          ? "text-danger"
                          : "text-success"
                      }`}
                    >
                      {formatCurrency(financialSummary.net_profit)}
                    </h3>

                    <span className="badge bg-success-subtle text-success align-self-start">
                      ROI:{" "}
                      {financialSummary.roi_percentage ?? "N/A"}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown and Yield */}
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                    <h6 className="fw-bold text-dark mb-3">
                      <i className="bi bi-receipt text-danger me-2"></i>
                      Cost Breakdown
                    </h6>

                    <ul className="list-group list-group-flush small">
                      <li className="list-group-item d-flex justify-content-between px-0">
                        <span>Seeds and Seedlings</span>
                        <strong>
                          {formatCurrency(costs.seeds)}
                        </strong>
                      </li>

                      <li className="list-group-item d-flex justify-content-between px-0">
                        <span>Land Preparation</span>
                        <strong>
                          {formatCurrency(costs.land_preparation)}
                        </strong>
                      </li>

                      <li className="list-group-item d-flex justify-content-between px-0">
                        <span>Fertilizers and Pesticides</span>
                        <strong>
                          {formatCurrency(
                            costs.fertilizer_pesticide
                          )}
                        </strong>
                      </li>

                      <li className="list-group-item d-flex justify-content-between px-0">
                        <span>Irrigation</span>
                        <strong>
                          {formatCurrency(costs.irrigation)}
                        </strong>
                      </li>

                      <li className="list-group-item d-flex justify-content-between px-0">
                        <span>Labor</span>
                        <strong>
                          {formatCurrency(costs.labor)}
                        </strong>
                      </li>

                      <li className="list-group-item d-flex justify-content-between px-0">
                        <span>Harvesting and Transport</span>
                        <strong>
                          {formatCurrency(costs.harvesting)}
                        </strong>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                    <h6 className="fw-bold text-dark mb-3">
                      <i className="bi bi-bar-chart-line text-success me-2"></i>
                      Yield and Market Price
                    </h6>

                    <div className="p-3 bg-light rounded-3 mb-3">
                      <small className="text-muted d-block">
                        Expected Crop Yield
                      </small>

                      <span className="fs-5 fw-bold text-dark">
                        {formatNumber(
                          yieldPrediction.expected_quintals
                        )}{" "}
                        quintals
                      </span>

                      <span className="text-muted small ms-2">
                        (
                        {formatNumber(
                          yieldPrediction.expected_kg
                        )}{" "}
                        kg)
                      </span>
                    </div>

                    <div className="p-3 bg-light rounded-3 mb-3">
                      <small className="text-muted d-block">
                        Predicted Market Price
                      </small>

                      <span className="fs-5 fw-bold text-success">
                        {formatCurrency(marketPrice.price_per_kg)}
                        {" / kg"}
                      </span>

                      <div className="text-muted small mt-1">
                        {formatCurrency(
                          marketPrice.price_per_quintal
                        )}{" "}
                        per quintal
                      </div>
                    </div>

                    {result.advice && (
                      <div className="p-3 bg-success-subtle text-success-emphasis rounded-3 small">
                        <strong>
                          <i className="bi bi-lightbulb me-2"></i>
                          Farming Advice
                        </strong>

                        <p className="mb-0 mt-2">
                          {result.advice}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="alert alert-warning mt-3 small">
                <strong>Important:</strong> These figures are
                estimates, not guaranteed results. Actual costs,
                yields, market prices, and profits may vary depending
                on local conditions and farming practices.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}