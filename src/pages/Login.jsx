import React, { useState } from "react";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [msg, setMsg] = useState("");
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const value = form.identifier.trim();
      const isEmail = value.includes("@");

      const payload = isEmail
        ? { email: value, password: form.password }
        : { mobile: value, password: form.password };

      const res = await API.post("/auth/login", payload);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role || "user");
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setMsg(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container kb-form-wrap">
      <div className="kb-form-box">
        <h2 className="kb-form-title text-center mb-3">Login</h2>

        {msg && <div className="alert alert-info mt-3">{msg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Mobile Number or Email</label>
            <input
              type="text"
              name="identifier"
              className="form-control"
              placeholder="Enter 10-digit mobile or email"
              value={form.identifier}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="kb-pass-wrap">
              <input
                type={showPass ? "text" : "password"}
                name="password"
                className="form-control"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
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

          <button type="submit" className="btn kb-btn w-100">
            Login
          </button>
        </form>

        <p className="kb-switch-text">
          Don't have an account?{" "}
          <Link to="/register" className="kb-switch-link">
            Please Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;