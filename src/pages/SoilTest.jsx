import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const FALLBACK_REGIONS = [
  {
    state: "West Bengal",
    districts: [
      "Burdwan",
      "Hooghly",
      "Murshidabad",
      "Nadia",
      "North 24 Parganas",
      "Paschim Medinipur",
      "Purba Medinipur",
      "South 24 Parganas",
    ],
  },
  { state: "Punjab", districts: ["Amritsar", "Ludhiana"] },
  { state: "Uttar Pradesh", districts: ["Lucknow", "Meerut", "Varanasi"] },
  { state: "Bihar", districts: ["Muzaffarpur", "Patna"] },
  { state: "Odisha", districts: ["Cuttack", "Ganjam"] },
];

export default function SoilTest() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [regions, setRegions] = useState(FALLBACK_REGIONS);
  const [formData, setFormData] = useState({
    state: "West Bengal",
    district: "Purba Medinipur",
    previous_crop: "Paddy",
    water_availability: "Medium",
    soil_feel: "Sticky",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await fetch("https://farmer-ai-avva.onrender.com/api/profit/regions");
        if (!res.ok) return;
        const data = await res.json();
        if (data.states && data.states.length > 0) {
          setRegions(data.states);
        }
      } catch {
        // Fallback regions remain active
      }
    };

    fetchRegions();
  }, []);

  const currentDistricts =
    regions.find((r) => r.state === formData.state)?.districts || [];

  const handleStateChange = (e) => {
    const newState = e.target.value;
    const found = regions.find((r) => r.state === newState);
    const firstDistrict = found?.districts?.[0] || "";
    setFormData({
      ...formData,
      state: newState,
      district: firstDistrict,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please capture or upload a clear photo of your field soil.");
      return;
    }

    setLoading(true);
    setError(null);

    const locationStr = formData.district
      ? `${formData.district}, ${formData.state}`
      : formData.state;

    const payload = new FormData();
    payload.append("file", selectedFile);
    payload.append("location", locationStr);
    payload.append("previous_crop", formData.previous_crop);
    payload.append("water_availability", formData.water_availability);
    payload.append("soil_feel", formData.soil_feel);

    try {
      const response = await fetch("https://farmer-ai-avva.onrender.com/api/soil-test", {
        method: "POST",
        body: payload,
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(
          resData.detail || "Failed to analyze soil. Please verify backend connection."
        );
      }

      setResult(resData.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Top Back to Dashboard Button (Same style as other pages}
      {/* Title Header */}
      <div className="text-center mb-4">
        <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-bold mb-2">
          <i className="bi bi-camera-fill me-1"></i> AI VISION AGRONOMIST
        </span>
        <h2 className="fw-bold text-success">AI Soil Health & Crop Advisor</h2>
        <p className="text-muted">
          Upload a soil photo and input field conditions to get crop recommendations and tailored fertilizer plans.
        </p>
      </div>

      <div className="row g-4">
        {/* Left Column: Form & Image Upload */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold mb-3 text-dark">
              <i className="bi bi-sliders me-2 text-success"></i>Field Input Data
            </h5>

            <form onSubmit={handleSubmit}>
              {/* Image Picker */}
              <div className="mb-3">
                <label className="form-label small fw-bold">Field Soil Photograph</label>
                <div
                  className="border border-2 border-dashed rounded-3 p-3 text-center bg-light position-relative"
                  style={{ cursor: "pointer" }}
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Soil Preview"
                      className="img-fluid rounded-2 mb-2"
                      style={{ maxHeight: "160px", objectFit: "cover" }}
                    />
                  ) : (
                    <div className="py-3">
                      <i className="bi bi-cloud-arrow-up display-5 text-secondary d-block mb-1"></i>
                      <small className="text-muted">Click to select or capture soil photo</small>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    required
                  />
                </div>
              </div>

              {/* State Selection */}
              <div className="mb-3">
                <label className="form-label small fw-bold">State</label>
                <select
                  name="state"
                  className="form-select shadow-none"
                  value={formData.state}
                  onChange={handleStateChange}
                  required
                >
                  {regions.map((item) => (
                    <option key={item.state} value={item.state}>
                      {item.state}
                    </option>
                  ))}
                </select>
              </div>

              {/* District Selection */}
              <div className="mb-3">
                <label className="form-label small fw-bold">District</label>
                <select
                  name="district"
                  className="form-select shadow-none"
                  value={formData.district}
                  onChange={handleInputChange}
                  required
                >
                  {currentDistricts.length > 0 ? (
                    currentDistricts.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))
                  ) : (
                    <option value={formData.district}>
                      {formData.district || "Select District"}
                    </option>
                  )}
                </select>
              </div>

              {/* Previous Crop */}
              <div className="mb-3">
                <label className="form-label small fw-bold">Previously Harvested Crop</label>
                <select
                  name="previous_crop"
                  className="form-select shadow-none"
                  value={formData.previous_crop}
                  onChange={handleInputChange}
                >
                  <option value="Paddy">Paddy / Rice (Aman/Boro)</option>
                  <option value="Potato">Potato</option>
                  <option value="Jute">Jute</option>
                  <option value="Mustard">Mustard</option>
                  <option value="Vegetables">Vegetables / Fallow</option>
                </select>
              </div>

              {/* Water Availability */}
              <div className="mb-3">
                <label className="form-label small fw-bold">Water / Irrigation Availability</label>
                <select
                  name="water_availability"
                  className="form-select shadow-none"
                  value={formData.water_availability}
                  onChange={handleInputChange}
                >
                  <option value="Abundant">Abundant (Canal / Submersible)</option>
                  <option value="Medium">Medium (Pond / Shared Borewell)</option>
                  <option value="Low">Low (Rainfed / Limited)</option>
                </select>
              </div>

              {/* Soil Feel */}
              <div className="mb-4">
                <label className="form-label small fw-bold">How does the soil feel in hand?</label>
                <select
                  name="soil_feel"
                  className="form-select shadow-none"
                  value={formData.soil_feel}
                  onChange={handleInputChange}
                >
                  <option value="Sticky">Sticky & Heavy (Clay dominant)</option>
                  <option value="Loose">Loose & Gritty (Sandy / Silt)</option>
                  <option value="Soft">Soft & Crumbly (Loamy)</option>
                  <option value="Hard">Dry & Hard clods</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-success w-100 py-2 fw-bold shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Analyzing Soil Sample...
                  </>
                ) : (
                  <>
                    <i className="bi bi-search me-1"></i> Analyze & Get Advice
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: AI Soil Diagnosis & Recommendations */}
        <div className="col-lg-8">
          {error && <div className="alert alert-danger shadow-sm rounded-3">{error}</div>}

          {!result && !loading && (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white h-100 justify-content-center">
              <i className="bi bi-moisture display-3 text-success mb-3"></i>
              <h5 className="fw-bold">Ready to Inspect Soil Quality</h5>
              <p className="text-muted mx-auto" style={{ maxWidth: "480px" }}>
                Capture a close-up photo of your field topsoil. The AI vision system will evaluate texture,
                organic characteristics, and previous crop residual nitrogen to build an accurate plan.
              </p>
            </div>
          )}

          {loading && (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white h-100 justify-content-center">
              <div className="spinner-border text-success mx-auto mb-3" role="status"></div>
              <h5 className="fw-bold">Please wait, Running Soil Diagnostics</h5>
              <p className="text-muted">Evaluating soil structure, drainage capability, and nutrient needs.</p>
            </div>
          )}

          {result && !loading && (
            <div>
              {/* Soil Overview Card */}
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4 border-start border-4 border-success">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                  <div>
                    <span className="badge bg-success-subtle text-success mb-1">Identified Soil Profile</span>
                    <h4 className="fw-bold text-dark mb-0">{result.soil_type}</h4>
                  </div>
                  <div className="d-flex gap-2">
                    <span className="badge bg-light text-dark border px-3 py-2">
                      <i className="bi bi-droplet-half text-primary me-1"></i>
                      Drainage: {result.drainage}
                    </span>
                    <span className="badge bg-light text-dark border px-3 py-2">
                      <i className="bi bi-layers text-warning me-1"></i>
                      Organic Carbon: {result.organic_matter_estimate}
                    </span>
                  </div>
                </div>
                <p className="text-muted mb-0">{result.soil_condition}</p>
              </div>

              {/* Recommended Crops Grid */}
              <h5 className="fw-bold text-dark mb-3">
                <i className="bi bi-stars text-warning me-2"></i>Recommended Crops for this Soil
              </h5>
              <div className="row g-3 mb-4">
                {result.recommended_crops?.map((crop, idx) => (
                  <div className="col-md-4" key={idx}>
                    <div className="card h-100 border-0 shadow-sm rounded-4 p-3 bg-white border-top border-4 border-primary">
                      <h6 className="fw-bold text-primary mb-1">{crop.crop}</h6>
                      <small className="badge bg-light text-dark border mb-2 d-inline-block">
                        Variety: {crop.variety}
                      </small>
                      <p className="small text-muted mb-0">{crop.suitability_reason}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fertilizer Dosage & Soil Tips */}
              <div className="row g-3">
                <div className="col-md-7">
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                    <h6 className="fw-bold text-dark mb-3">
                      <i className="bi bi-bag-check-fill text-success me-2"></i>
                      Fertilizer Advisory (Per Bigha Baseline)
                    </h6>
                    <ul className="list-group list-group-flush small">
                      <li className="list-group-item px-0 py-2 border-0">
                        <strong className="text-dark d-block">Basal Application (Field Prep):</strong>
                        <span className="text-muted">{result.fertilizer_plan_per_bigha?.basal_dose}</span>
                      </li>
                      <li className="list-group-item px-0 py-2 border-0">
                        <strong className="text-dark d-block">Top Dressing (After Sowing):</strong>
                        <span className="text-muted">{result.fertilizer_plan_per_bigha?.top_dressing}</span>
                      </li>
                      <li className="list-group-item px-0 py-2 border-0">
                        <strong className="text-dark d-block">Micronutrients (Zinc / Boron):</strong>
                        <span className="text-muted">{result.fertilizer_plan_per_bigha?.micronutrients}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="col-md-5">
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                    <h6 className="fw-bold text-dark mb-3">
                      <i className="bi bi-heart-pulse-fill text-danger me-2"></i>
                      Soil Health Management
                    </h6>
                    <div className="p-3 bg-light rounded-3 small text-muted">
                      {result.soil_health_tips}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}