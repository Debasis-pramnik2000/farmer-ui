import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Schemes() {
  const [schemes, setSchemes] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true);
      setMsg("");

      try {
        const res = await API.get("/schemes", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSchemes(res.data.data || []);

        if (!res.data.data?.length) {
          setMsg("No schemes found");
        }
      } catch (err) {
        setMsg(err.response?.data?.message || "Failed to load schemes");
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, [token]);

  return (
    <div className="container kb-scheme-wrap">
      <h2 className="kb-dash-title">🏛️ Government Schemes</h2>

      {msg && <div className="alert alert-info">{msg}</div>}

      {loading && <p className="text-center">Loading...</p>}

      <div className="row g-4">
        {schemes.map((s) => (
          <div key={s._id} className="col-12 col-sm-6 col-lg-4">
            <div
              className="kb-scheme-card"
              onClick={() => navigate(`/dashboard/schemes/${s._id}`)}
            >
              <div className="kb-scheme-img-box">
                <img src={s.image} alt={s.title} />
              </div>

              <div className="kb-scheme-body">
                <h5 className="kb-scheme-title">{s.title}</h5>
                <p className="kb-scheme-desc">{s.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Schemes;