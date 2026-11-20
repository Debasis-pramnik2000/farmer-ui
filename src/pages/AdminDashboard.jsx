import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminDashboard() {
  const [shops, setShops] = useState([]);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token || localStorage.getItem("role") !== "admin") {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      const headers = { Authorization: `Bearer ${token}` };

      const [usersResult, shopsResult] = await Promise.allSettled([
        API.get("/user/all", { headers }),
        API.get("/shops/all", { headers }),
      ]);

      if (usersResult.status === "fulfilled") {
        setUsers(usersResult.value.data.users || []);
        setTotalUsers(usersResult.value.data.totalUsers || 0);
      } else {
        const err = usersResult.reason;
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }
        setMsg(err.response?.data?.message || "Failed to load users");
      }

      if (shopsResult.status === "fulfilled") {
        setShops(Array.isArray(shopsResult.value.data) ? shopsResult.value.data : []);
      }
    };

    loadData();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="container kb-admin-wrap">
      <div className="kb-admin-header d-flex justify-content-between align-items-center">
        <h2 className="kb-dash-title">🛠️ Admin Panel</h2>
        <button className="btn kb-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {msg && <div className="alert alert-info">{msg}</div>}

      {/* Stats Cards */}
      <div className="kb-admin-stats">
        <div className="kb-stat-card kb-stat-users">
          <div className="kb-stat-icon">👥</div>
          <div>
            <div className="kb-stat-number">{totalUsers}</div>
            <div className="kb-stat-label">Total Users</div>
          </div>
        </div>
      </div>

      {/* Users Section */}
      <div className="kb-admin-section">
        <h4 className="kb-admin-section-title">
          👥 Registered Users ({totalUsers})
        </h4>

        <div className="kb-admin-table-wrap">
          <table className="table kb-admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Photo</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>State</th>
                <th>District</th>
                <th>Village</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    No users registered yet
                  </td>
                </tr>
              ) : (
                users.map((u, i) => (
                  <tr key={u._id}>
                    <td>{i + 1}</td>
                    <td>
                      {u.profilePhoto ? (
                        <img
                          src={`http://localhost:5000${u.profilePhoto}`}
                          alt={u.name}
                          className="kb-admin-thumb"
                        />
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                    <td>{u.name}</td>
                    <td>{u.mobile}</td>
                    <td>{u.state}</td>
                    <td>{u.district}</td>
                    <td>{u.village}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;