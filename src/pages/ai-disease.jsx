import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AIDisease({ setResultData }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image!");
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert("Please select a leaf photo first!");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8000/api/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Diagnosis failed on the server.");
      }

      const data = await response.json();

      setResultData({
        ...data,
        originalImage: previewUrl,
      });

      navigate("/result");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="container py-4 py-md-5">
      {/* AI Hero Banner */}
      <div className="row align-items-center bg-white p-3 p-md-5 rounded-4 shadow-sm mb-4 border-start border-5 border-success mx-0">
        <div className="col-lg-7">
          <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill mb-3 fw-bold">
            <i className="bi bi-cpu me-1"></i>
            AI PLANT DOCTOR
          </span>

          <h1 className="display-6 fw-bold text-dark mb-3">
            Instant Crop{" "}
            <span className="text-success">Disease Detection</span>{" "}
            &amp; Cure
          </h1>

          <p className="lead text-muted mb-4 fs-6 fs-md-5">
            Upload or capture a clear photo of an infected crop leaf. Our AI
            agronomist will identify the disease and suggest exact medicine
            dosage and organic care within seconds.
          </p>

          <button
            type="button"
            className="btn btn-success btn-lg px-4 shadow py-2 py-md-3 fw-bold rounded-pill"
            onClick={() => fileInputRef.current.click()}
            disabled={loading}
          >
            <i className="bi bi-camera me-2"></i>
            Upload Leaf Photo
          </button>
        </div>

        {/* AI Smart Crop Protection Image Selection */}
        <div className="col-lg-5 text-center mt-4 mt-lg-0">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            className="d-none"
            onChange={handleImageChange}
          />

          <div
            onClick={() => {
              if (!loading) {
                fileInputRef.current.click();
              }
            }}
            style={{
              cursor: loading ? "default" : "pointer",
            }}
            title="Click to select or capture leaf image"
          >
            <img
              src={
                previewUrl ||
                "https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=600&q=80"
              }
              alt="AI Smart Crop Protection"
              className="img-fluid rounded-4 shadow"
              style={{
                maxHeight: "320px",
                objectFit: "cover",
                width: "100%",
              }}
            />
          </div>

          {!previewUrl ? (
            <small className="text-muted d-block mt-2">
              <i className="bi bi-hand-index-thumb me-1"></i>
              Tap the image or button above to select a leaf photo
            </small>
          ) : (
            <>
              <p className="text-success fw-semibold mt-3 mb-2">
                <i className="bi bi-check-circle me-1"></i>
                Leaf Photo Selected
              </p>

              <div className="d-flex justify-content-center gap-2 flex-wrap">
                <button
                  type="button"
                  className="btn btn-success px-4 py-2 fw-semibold"
                  onClick={handleAnalyze}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Analyzing Leaf...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-lightning-charge me-1"></i>
                      Analyze
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 py-2"
                  onClick={handleReset}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-counterclockwise me-1"></i>
                  Reset
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}