import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Result({ resultData }) {
  const { t, i18n } = useTranslation();
  const [speaking, setSpeaking] = useState(false);
  const pdfRef = useRef();

  if (!resultData) {
    return (
      <div className="container py-5 text-center">
        <div className="card p-5 border-0 shadow-sm">
          <i className="bi bi-exclamation-circle display-3 text-warning mb-3"></i>
          <h4>{t('txt_no_data')}</h4>
          <div className="mt-3">
            <Link to="/" className="btn btn-success rounded-pill px-4">{t('nav_home')}</Link>
          </div>
        </div>
      </div>
    );
  }

  const { details, confidence, originalImage, heatmap } = resultData;

  // Feature 2: Multilingual Speech Synthesizer (Web Speech API)
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-Speech is not supported in this browser.");
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const currentLang = i18n.language;
    let voiceCode = 'en-US';
    if (currentLang === 'bn') voiceCode = 'bn-BD';
    if (currentLang === 'hi') voiceCode = 'hi-IN';

    const text = `${details.crop}, ${details.disease}. Confidence ${confidence}. Symptoms: ${details.symptoms}. Prescribed medications: ${details.medicines.join(". ")}. Organic care: ${details.organic_care}`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceCode;
    utterance.rate = 0.9;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Feature 8: Downloadable PDF Prescription
  const handleDownloadPDF = async () => {
    const element = pdfRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Prescription_${details.crop}_${details.disease}.pdf`);
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <Link to="/" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-1"></i> {t('btn_cancel')}
        </Link>
        <div>
          <button 
            className={`btn ${speaking ? 'btn-danger' : 'btn-warning'} me-2 fw-bold text-dark`}
            onClick={toggleSpeech}
          >
            <i className={`bi ${speaking ? 'bi-stop-circle' : 'bi-volume-up'} me-1`}></i>
            {speaking ? t('btn_stop_listen') : t('btn_listen')}
          </button>
          <button className="btn btn-primary fw-bold" onClick={handleDownloadPDF}>
            <i className="bi bi-file-earmark-pdf me-1"></i> {t('btn_pdf')}
          </button>
        </div>
      </div>

      {/* Printable Area for PDF Generation */}
      <div className="card border-0 shadow p-4 p-md-5 bg-white" ref={pdfRef}>
        <div className="border-bottom pb-3 mb-4 d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h3 className="text-success fw-bold mb-0">KrishiSheba AI Diagnosis & Prescription</h3>
            <small className="text-muted">Generated: {new Date().toLocaleDateString()}</small>
          </div>
          <span className="badge bg-success fs-6 py-2 px-3 mt-2 mt-md-0">
            {t('txt_confidence')}: {confidence}
          </span>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <h5 className="fw-bold text-secondary mb-3">{t('txt_original_img')}</h5>
            <img 
              src={originalImage} 
              alt="Leaf sample" 
              className="img-fluid rounded-3 border w-100" 
              style={{ maxHeight: "280px", objectFit: "cover" }} 
            />
          </div>
          <div className="col-md-6">
            {/* Feature 7: Grad-CAM Explainable AI Heatmap */}
            <h5 className="fw-bold text-danger mb-3">
              <i className="bi bi-fire me-1"></i> {t('txt_heatmap')}
            </h5>
            {heatmap ? (
              <img 
                src={heatmap} 
                alt="GradCAM Heatmap" 
                className="img-fluid rounded-3 border w-100" 
                style={{ maxHeight: "280px", objectFit: "cover" }} 
              />
            ) : (
              <div className="p-5 bg-light text-center rounded border">Heatmap not available</div>
            )}
            <small className="text-muted d-block mt-1">{t('txt_heatmap_desc')}</small>
          </div>
        </div>

        <div className="bg-light p-3 rounded-3 mb-4">
          <h4 className="fw-bold text-dark mb-1">{details.crop}</h4>
          <h5 className="text-danger fw-bold">{details.disease}</h5>
          <p className="mb-0 text-muted"><strong>{t('txt_symptoms')}:</strong> {details.symptoms}</p>
        </div>

        <div className="card mb-4 border-warning bg-warning-subtle">
          <div className="card-body">
            <h5 className="card-title fw-bold text-dark">
              <i className="bi bi-capsule me-2 text-danger"></i>{t('txt_medicines')}
            </h5>
            <ul className="mb-0 ps-3">
              {details.medicines.map((med, idx) => (
                <li key={idx} className="fw-semibold text-dark mb-1">{med}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card border-success bg-success-subtle">
          <div className="card-body">
            <h5 className="card-title fw-bold text-success">
              <i className="bi bi-shield-check me-2"></i>{t('txt_organic')}
            </h5>
            <p className="card-text text-dark mb-0">{details.organic_care}</p>
          </div>
        </div>
      </div>
    </div>
  );
}