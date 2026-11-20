import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
    } else {
      setReady(true);
    }
  }, [navigate]);

  const cards = [
    {
      icon: "👤",
      title: "User Information",
      image: "/images/user-info.jpg",
      path: "/dashboard/user-info",
    },
    {
      icon: "🤖",
      title: "AI Disease Detection",
      image: "/images/ai-disease.jpg",
      path: "/dashboard/ai-disease",
    },
    {
      icon: "💰",
      title: "Today Rice Rate",
      image: "/images/rice-rate.jpg",
      path: "/dashboard/rice-rate",
    },
    {
      icon: "🥬",
      title: "Vegetable Market",
      image: "/images/vegetable.jpg",
      path: "/dashboard/vegetable",
    },
    {
      icon: "🏛️",
      title: "Govt Schemes",
      image: "/images/scheme.jpg",
      path: "/dashboard/schemes",
    },
    {
      icon: "📋",
      title: "Basic Information",
      image: "/images/basic-info.jpg",
      path: "/dashboard/basic-info",
    },
    {
      icon: "🌦️",
      title: "Weather Information",
      image: "/images/weather.jpg",
      path: "/dashboard/weather",
    },
    {
      icon: "🏪",
      title: "Nearby Local Shops",
      image: "/images/local-shop.jpg",
      path: "/dashboard/shops",
    },
    {
      icon: "📈",
      title: "Crop Profit Predictor",
      image: "/images/profit-predictor.jpg",
      path: "/dashboard/ProfitPredictor",
    },
    {
      icon: "🌱",
      title: "AI Soil Test & Advisor",
      image: "/images/soiltest.jpg",
      path: "/soil-test",
    },
  ];

  if (!ready) return null;

  return (
    <div className="container kb-dash-wrap">
      <h2 className="kb-dash-title">Welcome, Farmer 🌾</h2>

      <div className="row g-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className="col-12 col-sm-6 col-md-4 col-lg-3"
          >
            <div
              className="kb-dash-card"
              onClick={() => navigate(card.path)}
              style={{
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-4px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <div className="kb-dash-img-box">
                {card.image ? (
                  <img src={card.image} alt={card.title} />
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      height: "140px",
                      background: "#f5f0e6",
                    }}
                  >
                    <i
                      className="bi bi-camera-fill text-success"
                      style={{ fontSize: "4rem" }}
                    ></i>
                  </div>
                )}
              </div>

              <div className="kb-dash-info">
                <span className="kb-dash-icon">{card.icon}</span>
                <span className="kb-dash-text">{card.title}</span>
              </div>

              {card.title === "AI Soil Test & Advisor" && (
                <div className="text-center pb-3">
                  <small className="text-muted">
                    Upload photo for crop & fertilizer advice
                  </small>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;