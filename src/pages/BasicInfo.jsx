import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function BasicInfo() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  return (
    <div className="container kb-basic-wrap">
      <h2 className="kb-dash-title">📋 Basic Information</h2>

      {/* Section 1: About */}
      <div className="kb-basic-section">
        <h3 className="kb-basic-heading">About Krishi Bondhu</h3>

        <p>
          <b>Krishi Bondhu</b> (meaning "Farmer's Friend") is a comprehensive
          smart farming assistant designed specifically for Indian farmers. The
          platform was created to solve one of the biggest challenges farmers
          face today — the lack of accurate, real-time information in one
          place. Instead of visiting multiple websites, asking middlemen, or
          relying on word of mouth, farmers can now access everything they need
          from a single, easy-to-use dashboard. Krishi Bondhu brings together
          live crop prices from government mandis, AI-powered disease
          detection, weather forecasts, government scheme information, and
          nearby agricultural shop locations — all in one place.
        </p>

        <p>
          The idea behind Krishi Bondhu is simple: farmers deserve the same
          access to technology and information that large agribusinesses have.
          Small and marginal farmers often make critical decisions — when to
          sell, what to plant, how to treat a disease — based on incomplete or
          delayed information. This leads to lower profits and unnecessary
          losses. Krishi Bondhu changes that by delivering real data at the
          right time. Whether a farmer needs to check today's paddy price in
          their district, upload a photo of a diseased leaf for instant
          diagnosis, or find the nearest shop selling fertilizer, Krishi Bondhu
          makes it possible within seconds.
        </p>

        <p>
          This platform is built for farmers across all Indian states,
          supporting multiple crops including paddy, vegetables, and more. It
          is designed to be simple enough for first-time smartphone users while
          powerful enough to provide genuine value. Every feature — from live
          mandi rates to government scheme details — is built with one goal: to
          help farmers make better decisions, increase their income, and reduce
          risk. Krishi Bondhu is more than just an app; it is a digital
          companion for every farmer who wants to grow smarter.
        </p>
      </div>

      {/* Section 2: Features */}
      <div className="kb-basic-section">
        <h3 className="kb-basic-heading">Features</h3>

        <ul className="kb-basic-list">
          <li>
            <b>👤 User Information</b> — Manage your profile and upload a
            profile photo.
          </li>
          <li>
            <b>🤖 AI Disease Detection</b> — Upload a leaf photo and get instant
            disease diagnosis with solutions.
          </li>
          <li>
            <b>💰 Today Rice Rate</b> — Live paddy and rice mandi prices from
            AgMarknet, filtered by state.
          </li>
          <li>
            <b>🥬 Vegetable Market</b> — Daily vegetable prices from all major
            mandis across India.
          </li>
          <li>
            <b>🏛️ Govt Schemes</b> — State-specific government schemes with
            eligibility, benefits, and official apply links.
          </li>
          <li>
            <b>🌦️ Weather Information</b> — Real-time weather forecast for your
            location.
          </li>
          <li>
            <b>🏪 Nearby Local Shops</b> — Find agricultural shops near you on
            the map.
          </li>
        </ul>
      </div>

      {/* Section 3: How to Use */}
      <div className="kb-basic-section">
        <h3 className="kb-basic-heading">How to Use</h3>

        <ol className="kb-basic-list">
          <li>Register with your name, mobile number, and location.</li>
          <li>Login with your mobile number and password.</li>
          <li>You will land on the Dashboard with all feature cards.</li>
          <li>Click any card to use that feature.</li>
          <li>Use the "Back to Dashboard" button to return anytime.</li>
          <li>Logout from the top-right button when done.</li>
        </ol>
      </div>

      {/* Section 4: Contact */}
      <div className="kb-basic-section">
        <h3 className="kb-basic-heading">Contact & Support</h3>

        <p>
          For any question, feedback, or technical support, please reach out:
        </p>

        <p>
          📧 <b>Email:</b> support@krishibondhu.app
          <br />
          📞 <b>Phone:</b> +91 XXXXX XXXXX
          <br />
          🌐 <b>Website:</b> www.krishibondhu.app
        </p>
      </div>
    </div>
  );
}

export default BasicInfo;