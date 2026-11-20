import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserInfo from "./pages/UserInfo";
import Vegetable from "./pages/Vegetable";
import Schemes from "./pages/Schemes";
import SchemeDetails from "./pages/SchemeDetails";
import BasicInfo from "./pages/BasicInfo";
import Weather from "./pages/Weather";
import Stores from "./pages/Stores";
import About from "./pages/About";
import ProfitPredictor from "./pages/ProfitPredictor";
import AdminDashboard from "./pages/AdminDashboard";
import MandiRates from "./pages/MandiRates";
import AIDisease from "./pages/ai-disease";
import Result from "./pages/Result";
import SoilTest from "./pages/SoilTest";

function App() {
  const [resultData, setResultData] = useState(null);

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/About" element={<About />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/user-info" element={<UserInfo />} />
        <Route path="/dashboard/rice-rate" element={<MandiRates />} />
        <Route path="/dashboard/vegetable" element={<Vegetable />} />
        <Route path="/dashboard/schemes" element={<Schemes />} />
        <Route path="/dashboard/schemes/:id" element={<SchemeDetails />} />
        <Route path="/dashboard/basic-info" element={<BasicInfo />} />
        <Route path="/dashboard/weather" element={<Weather />} />
        <Route path="/dashboard/shops" element={<Stores />} />
        <Route path="/dashboard/ProfitPredictor" element={<ProfitPredictor />} />
        <Route path="/soil-test" element={<SoilTest />} />
        <Route path="/dashboard/soil-test" element={<SoilTest />} />
        <Route
          path="/dashboard/ai-disease"
          element={<AIDisease setResultData={setResultData} />}
        />

        <Route
          path="/result"
          element={<Result resultData={resultData} />}
        />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;