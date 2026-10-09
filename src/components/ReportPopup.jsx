import React, { useState } from 'react';
import { Bug, Lightbulb, TriangleAlert, HelpCircle, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import './ReportPopup.css';

const ReportPopup = ({ onClose }) => {
  const [selectedType, setSelectedType] = useState("Something's broken");
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: string }
  const [touched, setTouched] = useState(false);

  const reportTypes = [
    { id: "Something's broken", icon: Bug },
    { id: "Suggestion", icon: Lightbulb },
    { id: "Wrong info", icon: TriangleAlert },
    { id: "Other", icon: HelpCircle }
  ];

  const isContactEmpty = !contact.trim();
  const isDescriptionEmpty = !description.trim();
  const isFormValid = !isContactEmpty && !isDescriptionEmpty;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: selectedType,
          description: description.trim(),
          contact: contact.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: data.message || 'Report sent successfully! We will review it shortly.'
        });
        setTimeout(() => {
          onClose();
        }, 2200);
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to submit report. Please try again later.'
        });
      }
    } catch (err) {
      console.error("Report submit error:", err);
      setStatusMessage({
        type: 'error',
        text: 'Network error connecting to server. Please check your connection.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="report-overlay" onClick={(e) => { e.stopPropagation(); onClose(); }}>
      <div className="report-content" onClick={(e) => e.stopPropagation()}>
        <div className="report-header">
          <div className="report-header-top">
            <h2 className="report-title">Report a problem</h2>
            <button className="report-close-icon-btn" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
          <p className="report-subtitle">Found a bug or wrong info? Tell us about it.</p>
        </div>

        {statusMessage?.type === 'success' ? (
          <div className="report-success-view">
            <CheckCircle2 size={48} className="report-success-icon" />
            <h3 className="report-success-title">Thank You!</h3>
            <p className="report-success-desc">{statusMessage.text}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="report-form-wrapper">
            <div className="report-body">
              {/* Step 1: Category Selection */}
              <div className="report-type-grid">
                {reportTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <button 
                      type="button"
                      key={type.id}
                      className={`report-type-btn ${selectedType === type.id ? 'selected' : ''}`}
                      onClick={() => setSelectedType(type.id)}
                    >
                      <Icon size={18} className="report-type-icon" />
                      <span>{type.id}</span>
                    </button>
                  );
                })}
              </div>

              {/* Step 2: Description Input */}
              <div className="report-field">
                <textarea 
                  placeholder="Describe what happened or what could be better..." 
                  rows="5"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={touched && isDescriptionEmpty ? 'input-error' : ''}
                ></textarea>
                {touched && isDescriptionEmpty && (
                  <span className="field-error-text">Please enter a description.</span>
                )}
              </div>

              {/* Step 3: Mandatory Contact Field */}
              <div className="report-field">
                <input 
                  type="text" 
                  placeholder="Email or phone (required for reply)" 
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className={touched && isContactEmpty ? 'input-error' : ''}
                />
                {touched && isContactEmpty && (
                  <span className="field-error-text">Email or phone is required so we can reply.</span>
                )}
              </div>

              {/* Error notice (e.g. rate limit) */}
              {statusMessage?.type === 'error' && (
                <div className="report-alert-banner">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{statusMessage.text}</span>
                </div>
              )}
            </div>

            <div className="report-footer">
              <button 
                type="submit" 
                className="report-send-btn" 
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="report-btn-loading">
                    <Loader2 size={18} className="spin-icon" /> Sending...
                  </span>
                ) : (
                  'Send report'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportPopup;
