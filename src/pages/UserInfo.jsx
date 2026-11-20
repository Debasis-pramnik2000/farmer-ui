import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function UserInfo() {
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const clearSessionAndRedirect = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  useEffect(() => {
    if (!token || token === "undefined" || token === "null") {
      clearSessionAndRedirect();
      return;
    }

    const load = async () => {
      try {
        const res = await API.get("/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          clearSessionAndRedirect();
          return;
        }
        setMsg(err.response?.data?.message || "Failed to load");
      }
    };

    load();
  }, [token, navigate]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handlePhotoUpload = async () => {
    if (!photo) return setMsg("Please choose a photo");

    const fd = new FormData();
    fd.append("photo", photo);

    try {
      const res = await API.post("/user/me/photo", fd, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser({ ...user, profilePhoto: res.data.profilePhoto });
      setMsg(res.data.message);
      setPhoto(null);
    } catch (err) {
      if (err.response?.status === 401) {
        clearSessionAndRedirect();
        return;
      }
      setMsg(err.response?.data?.message || "Upload failed");
    }
  };

  const handleLogout = () => {
    clearSessionAndRedirect();
  };

  if (!user) {
    return (
      <div className="container kb-form-wrap">
        {msg ? <div className="alert alert-danger">{msg}</div> : <p>Loading...</p>}
      </div>
    );
  }

  const photoUrl = user.profilePhoto
    ? `http://localhost:5000${user.profilePhoto}`
    : "https://via.placeholder.com/150?text=No+Photo";

  return (
    <div className="container kb-userinfo-wrap">
      <h2 className="kb-dash-title">My Information</h2>

      {msg && <div className="alert alert-info">{msg}</div>}

      <div className="kb-userinfo-box">
        {/* Profile Photo */}
        <div className="kb-photo-section">
          <img
            src={preview || photoUrl}
            alt="profile"
            className="kb-profile-photo"
          />

          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="form-control mb-2"
          />

          <button
            type="button"
            className="btn kb-btn w-100"
            onClick={handlePhotoUpload}
          >
            Update Photo
          </button>
        </div>

        {/* Info (read only) */}
        <div className="kb-info-section">
          <p><b>Name:</b> {user.name}</p>
          <p><b>Gender:</b> {user.gender}</p>
          <p><b>DOB:</b> {user.dob?.slice(0, 10)}</p>
          <p><b>Mobile:</b> {user.mobile}</p>
          <p><b>State:</b> {user.state}</p>
          <p><b>District:</b> {user.district}</p>
          <p><b>Village:</b> {user.village}</p>
          <div className="d-flex justify-content-end mt-3">
            <button
              className="btn kb-logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserInfo;