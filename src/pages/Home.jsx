import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "../components/Slider";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="kb-home">
      <Slider />

      <div className="container kb-cards">
        <div className="row g-4">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="kb-card">
              <h5>🌱 Crop Guide</h5>
              <p>Learn the right way to grow your crops.</p>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-4">
            <div className="kb-card">
              <h5>💰 Market Price</h5>
              <p>Check today's crop and vegetable rates.</p>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-4">
            <div className="kb-card">
              <h5>🏛️ Govt Schemes</h5>
              <p>Find schemes made for farmers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;