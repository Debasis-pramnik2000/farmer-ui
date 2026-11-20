import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const [loggedIn, setLoggedIn] = useState(
    () => !!localStorage.getItem("token")
  );
  const [role, setRole] = useState(localStorage.getItem("role") || "user");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role") || "user";
    setLoggedIn(!!token);
    setRole(userRole);
  }, [location.pathname]);

  const isAdminArea = location.pathname.startsWith("/admin");

  const backPages = [
    "/dashboard/user-info",
    "/dashboard/rice-rate",
    "/dashboard/vegetable",
    "/dashboard/schemes",
    "/dashboard/basic-info",
    "/dashboard/weather",
    "/dashboard/shops",
    "/dashboard/ai-disease",
    "/dashboard/soil-test",
    "/soil-test",
    "/result",
  ];

  const showBack =
    backPages.includes(location.pathname) ||
    location.pathname.startsWith("/dashboard/schemes/") ||
    location.pathname.startsWith("/dashboard/shops/") ||
    location.pathname.startsWith("/dashboard/ProfitPredictor") ||
    location.pathname.toLowerCase().includes("soil");

  return (
    <nav className="navbar navbar-expand-lg kb-navbar">
      <div className="container">
        <Link className="navbar-brand kb-brand" to="/">
          🌾 Krishi Bondhu
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#kbNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="kbNav">
          <ul className="navbar-nav ms-auto">
            {!loggedIn ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link kb-link" to="/">
                    Home
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link kb-link" to="/register">
                    Register
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link kb-link" to="/login">
                    Login
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link kb-link" to="/about">
                    About
                  </Link>
                </li>
              </>
            ) : isAdminArea ? (
              <li className="nav-item">
                <Link
                  className="nav-link kb-link"
                  to="/admin/dashboard"
                >
                  Admin Panel
                </Link>
              </li>
            ) : showBack ? (
              <li className="nav-item">
                <button
                  className="btn kb-back-btn"
                  onClick={() => navigate("/dashboard")}
                >
                  ← Back to Dashboard
                </button>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;