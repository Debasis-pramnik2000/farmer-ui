import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useParams } from "react-router-dom";

function SchemeDetails() {
  const { id } = useParams();
  const [scheme, setScheme] = useState(null);
  const [msg, setMsg] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get(`/schemes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setScheme(res.data.data || res.data);
      } catch (err) {
        setMsg(err.response?.data?.message || "Failed to load scheme");
      }
    };

    load();
  }, [id, token]);

  if (msg) {
    return (
      <div className="container kb-scheme-wrap">
        <div className="alert alert-info">{msg}</div>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="container kb-scheme-wrap">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container kb-scheme-wrap">
      <div className="kb-scheme-detail-box">
        <div className="kb-scheme-detail-img-box">
          <img src={scheme.image} alt={scheme.title} />
        </div>

        <h2 className="kb-scheme-detail-title">{scheme.title}</h2>
        <p className="kb-scheme-detail-cat">{scheme.category} Scheme</p>

        <div className="kb-scheme-section">
          <h5>Description</h5>
          <p>{scheme.description}</p>
        </div>

        <div className="kb-scheme-section">
          <h5>Benefit</h5>
          <p>{scheme.benefit}</p>
        </div>

        <div className="kb-scheme-section">
          <h5>Eligibility</h5>
          <p>{scheme.eligibility}</p>
        </div>

        {scheme.documents?.length > 0 && (
          <div className="kb-scheme-section">
            <h5>Documents Required</h5>
            <ul>
              {scheme.documents.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        )}

        <a
          href={scheme.officialLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn kb-btn kb-apply-btn"
        >
          Apply for Scheme →
        </a>
      </div>
    </div>
  );
}

export default SchemeDetails;