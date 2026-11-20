import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
  const [form, setForm] = useState({
    name: "",
    gender: "",
    dob: "",
    mobile: "",
    state: "",
    district: "",
    village: "",
    password: "",
    confirmPassword: "",
  });

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [msg, setMsg] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  // Load India states
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/states",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ country: "India" }),
          }
        );

        const data = await res.json();

        if (data.error) {
          setMsg("Failed to load states");
          return;
        }

        setStates(data.data.states || []);
      } catch (error) {
        console.error("State API Error:", error);
        setMsg("Failed to load states");
      }
    };

    fetchStates();
  }, []);

  // Load districts according to selected state
  const handleStateChange = async (e) => {
    const stateName = e.target.value;

    setForm({ ...form, state: stateName, district: "" });
    setDistricts([]);
    setMsg("");

    if (!stateName) return;

    try {
      const res = await fetch(
        "https://countriesnow.space/api/v0.1/countries/state/cities",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: "India", state: stateName }),
        }
      );

      const data = await res.json();

      if (data.error) {
        setMsg("Failed to load districts");
        return;
      }

      setDistricts(data.data || []);
    } catch (error) {
      console.error("District API Error:", error);
      setMsg("Failed to load districts");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!/^[0-9]{10}$/.test(form.mobile)) {
      return setMsg("Mobile must be 10 digits");
    }

    if (form.password.length !== 6) {
      return setMsg("Password must be exactly 6 characters");
    }

    if (form.password !== form.confirmPassword) {
      return setMsg("Password and Confirm Password do not match");
    }

    try {
      const { confirmPassword, ...payload } = form;
      const res = await API.post("/auth/register", payload);

      setMsg(res.data.message);

      setForm({
        name: "",
        gender: "",
        dob: "",
        mobile: "",
        state: "",
        district: "",
        village: "",
        password: "",
        confirmPassword: "",
      });
      setDistricts([]);

      // Redirect to login after short delay
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      setMsg(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="container kb-form-wrap">
      <div className="kb-form-box">
        <h2 className="kb-form-title">Register</h2>

        {msg && <div className="alert alert-info">{msg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Gender</label>
            <select
              name="gender"
              className="form-select"
              value={form.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              name="dob"
              className="form-control"
              value={form.dob}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Mobile Number</label>
            <input
              type="text"
              name="mobile"
              className="form-control"
              value={form.mobile}
              onChange={handleChange}
              maxLength={10}
              placeholder="10 digit mobile number"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">State</label>
            <select
              name="state"
              className="form-select"
              value={form.state}
              onChange={handleStateChange}
              required
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">District</label>
            <select
              name="district"
              className="form-select"
              value={form.district}
              onChange={handleChange}
              required
              disabled={!districts.length}
            >
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Village</label>
            <input
              type="text"
              name="village"
              className="form-control"
              value={form.village}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password (6 characters)</label>
            <div className="kb-pass-wrap">
              <input
                type={showPass ? "text" : "password"}
                name="password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                maxLength={6}
                required
              />
              <button
                type="button"
                className="kb-eye"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <div className="kb-pass-wrap">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                className="form-control"
                value={form.confirmPassword}
                onChange={handleChange}
                maxLength={6}
                required
              />
              <button
                type="button"
                className="kb-eye"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" className="btn kb-btn w-100">
            Register
          </button>
        </form>

        <p className="kb-switch-text">
          Have an account?{" "}
          <Link to="/login" className="kb-switch-link">
            Please Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;