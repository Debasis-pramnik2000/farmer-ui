import React from "react";
import { Link } from "react-router-dom";

function About() {
  const isLoggedIn = !!localStorage.getItem("token");

  const features = [
    {
      icon: "🤖",
      title: "AI Crop Disease Detection",
      desc: "Upload a leaf photo and get instant disease diagnosis, symptoms, chemical dosage, and organic remedies in English, Bengali, or Hindi.",
    },
    {
      icon: "🧪",
      title: "AI Soil Health & Crop Advisor",
      desc: "Analyze field topsoil photos along with state, district, and moisture feel to get best crop suggestions and per-bigha fertilizer schedules.",
    },
    {
      icon: "📈",
      title: "AI Crop Profit Predictor",
      desc: "Calculate realistic cultivation costs, expected yield, selling prices, and net profit tailored to your district and season.",
    },
    {
      icon: "💰",
      title: "Today Rice & Vegetable Mandi Rates",
      desc: "Check daily AgMarknet APMC mandi prices (min, max, and modal rates per kg) across Indian states and districts.",
    },
    {
      icon: "🏛️",
      title: "Government Schemes",
      desc: "Browse state-specific agricultural subsidies, crop insurance, and farmer welfare schemes with eligibility and direct apply links.",
    },
    {
      icon: "🌦️",
      title: "Live Weather & Nearby Agri Shops",
      desc: "Track real-time local weather forecasts and locate nearby seed, fertilizer, and pesticide shops on the map.",
    },
  ];

  return (
    <div className="container kb-basic-wrap py-4">
      {/* Hero Banner */}
      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4 text-center bg-white">
        <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-bold mx-auto mb-3">
          🌾 SMART DIGITAL FARMING COMPANION
        </span>
        <h1 className="fw-bold text-success mb-3">About Krishi Bondhu</h1>
        <p
          className="text-muted mx-auto mb-4"
          style={{ maxWidth: "760px", fontSize: "1.05rem" }}
        >
          <b>Krishi Bondhu</b> (meaning <i>"Farmer's Friend"</i>) is an
          all-in-one AI-powered smart agriculture platform built for Indian
          farmers—bringing live mandi prices, crop disease diagnosis, soil
          testing, profit forecasting, weather updates, and government schemes
          into a single easy-to-use dashboard.
        </p>

        <div className="d-flex justify-content-center gap-3 flex-wrap">
          {isLoggedIn ? (
            <Link to="/dashboard" className="btn btn-success px-4 py-2 fw-bold">
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-success px-4 py-2 fw-bold">
                Get Started — Register Free
              </Link>
              <Link
                to="/login"
                className="btn btn-outline-success px-4 py-2 fw-bold"
              >
                Farmer Login
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mission & Story */}
      <div className="kb-basic-section card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <h3 className="kb-basic-heading fw-bold text-success mb-3">
          Our Mission & Vision
        </h3>
        <p>
          Small and marginal farmers often make critical farming decisions—what
          crop to sow, how much fertilizer to apply, how to treat a sudden leaf
          infection, or when to sell at the mandi—without timely, scientific
          information. Relying on guesswork or middlemen often reduces crop
          yield and farmer income.
        </p>
        <p className="mb-0">
          <b>Krishi Bondhu</b> bridges this gap by combining{" "}
          <b>Hybrid AI Vision</b>, regional agronomic data, and live APMC
          market intelligence into a simple mobile-friendly interface—so every
          farmer can grow smarter, reduce input costs, and maximize profit.
        </p>
      </div>

      {/* Key Features Grid */}
      <div className="mb-4">
        <h3 className="kb-basic-heading fw-bold text-center mb-4">
          What You Can Do on Krishi Bondhu
        </h3>
        <div className="row g-3">
          {features.map((item, idx) => (
            <div className="col-md-6 col-lg-4" key={idx}>
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4 bg-white">
                <div className="fs-2 mb-2">{item.icon}</div>
                <h5 className="fw-bold mb-2">{item.title}</h5>
                <p className="text-muted small mb-0">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="kb-basic-section card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <h3 className="kb-basic-heading fw-bold text-success mb-3">
          How to Use Krishi Bondhu
        </h3>
        <ol className="mb-0 ps-3">
          <li className="mb-2">
            <b>Create Your Account:</b> Register using your name, 10-digit
            mobile number, state, district, and village.
          </li>
          <li className="mb-2">
            <b>Open Your Dashboard:</b> Log in to access all AI tools, live
            mandi rates, weather, and nearby agri shops.
          </li>
          <li className="mb-2">
            <b>Upload & Diagnose:</b> Snap a photo of a diseased crop leaf or
            field soil to receive instant AI recommendations.
          </li>
          <li>
            <b>Plan & Sell Smarter:</b> Check daily mandi prices and profit
            projections before sowing or selling your harvest.
          </li>
        </ol>
      </div>

      {/* Contact & Support */}
      <div className="kb-basic-section card border-0 shadow-sm rounded-4 p-4 bg-white">
        <h3 className="kb-basic-heading fw-bold text-success mb-3">
          Contact & Farmer Support
        </h3>
        <p className="text-muted mb-3">
          Have a question, suggestion, or need technical help using Krishi
          Bondhu? Reach out to our support team:
        </p>
        <div className="row g-3 small">
          <div className="col-md-4">
            <div className="p-3 rounded-3 bg-light">
              <b>📧 Email Support</b>
              <div className="text-muted mt-1">support@krishibondhu.app</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-3 rounded-3 bg-light">
              <b>📞 Helpline</b>
              <div className="text-muted mt-1">+91 1800-180-1551</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-3 rounded-3 bg-light">
              <b>🌐 Platform</b>
              <div className="text-muted mt-1">www.krishibondhu.app</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;