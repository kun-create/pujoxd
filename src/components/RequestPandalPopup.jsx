import React, { useState } from 'react';
import { Crosshair, CheckCircle2, AlertCircle, Loader2, X, MapPin } from 'lucide-react';
import { checkPandalDuplicate, parseLocationCoords } from '../data/pandals';
import './RequestPandalPopup.css';

const RequestPandalPopup = ({ onClose }) => {
  const [pandalName, setPandalName] = useState('');
  const [area, setArea] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [coords, setCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: string }
  const [locStatus, setLocStatus] = useState(null); // { type: 'success' | 'error', text: string }

  const isNameEmpty = !pandalName.trim();
  const isAreaEmpty = !area.trim();
  const isFormValid = !isNameEmpty && !isAreaEmpty;

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus({ type: 'error', text: 'Geolocation is not supported by your device.' });
      return;
    }

    setIsLocating(true);
    setLocStatus(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setLocation(`📍 ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setLocStatus({
          type: 'success',
          text: `Location captured: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        });
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        let msg = 'Could not get location. Please paste a link or coordinates manually.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location in your browser or paste coordinates manually.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location unavailable. Please paste a link manually.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please try again.';
        }
        setLocStatus({ type: 'error', text: msg });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    if (!isFormValid || isSubmitting) return;

    // Instant client-side duplicate pre-check
    const clientDup = checkPandalDuplicate(
      pandalName.trim(), 
      area.trim(), 
      location.trim(), 
      coords || parseLocationCoords(location.trim())
    );

    if (clientDup.isDuplicate) {
      const existingName = clientDup.matchedPandal?.name || pandalName.trim();
      setStatusMessage({
        type: 'error',
        text: `"${existingName}" is already listed on the map!`
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const response = await fetch('/api/request-pandal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pandalName: pandalName.trim(),
          area: area.trim(),
          location: location.trim(),
          notes: notes.trim(),
          coords: coords || parseLocationCoords(location.trim())
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: data.message || 'Pandal request sent successfully! We will review and add it to the map soon.'
        });
        setTimeout(() => {
          onClose();
        }, 2200);
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to submit pandal request. Please try again later.'
        });
      }
    } catch (err) {
      console.error('Pandal request submit error:', err);
      setStatusMessage({
        type: 'error',
        text: 'Network error connecting to server. Please check your connection.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="req-pandal-overlay" onClick={(e) => { e.stopPropagation(); onClose(); }}>
      <div className="req-pandal-content" onClick={(e) => e.stopPropagation()}>
        <div className="req-pandal-header">
          <div className="req-pandal-header-top">
            <h2 className="req-pandal-title">Request a pandal</h2>
            <button className="req-pandal-close-icon-btn" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
          <p className="req-pandal-subtitle">Know a pandal that is missing from the map? Send us the details.</p>
        </div>

        {statusMessage?.type === 'success' ? (
          <div className="req-pandal-success-view">
            <CheckCircle2 size={48} className="req-pandal-success-icon" />
            <h3 className="req-pandal-success-title">Request Submitted!</h3>
            <p className="req-pandal-success-desc">{statusMessage.text}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="req-pandal-form-wrapper">
            <div className="req-pandal-body">
              {/* Field 1: Pandal name (Mandatory) */}
              <div className="req-pandal-field">
                <label>Pandal name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Bagbazar Sarbojanin Durgotsab" 
                  value={pandalName}
                  onChange={(e) => {
                    setPandalName(e.target.value);
                    if (statusMessage) setStatusMessage(null);
                  }}
                  className={touched && isNameEmpty ? 'input-error' : ''}
                />
                {touched && isNameEmpty && (
                  <span className="field-error-text">Pandal name is required.</span>
                )}
              </div>

              {/* Field 2: Area (Mandatory) */}
              <div className="req-pandal-field">
                <label>Area</label>
                <input 
                  type="text" 
                  placeholder="e.g. Bagbazar, North Kolkata" 
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className={touched && isAreaEmpty ? 'input-error' : ''}
                />
                {touched && isAreaEmpty && (
                  <span className="field-error-text">Area is required.</span>
                )}
              </div>

              {/* Field 3: Google Maps Location (Optional link or GPS) */}
              <div className="req-pandal-field">
                <label>
                  Google Maps location <span className="req-pandal-optional">· optional</span>
                </label>
                <input 
                  type="text" 
                  placeholder="Paste a Google Maps link or coordinates" 
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setCoords(null);
                    setLocStatus(null);
                  }}
                />
                <button 
                  type="button"
                  className={`req-pandal-current-loc-btn ${coords ? 'loc-captured' : ''}`}
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <>
                      <Loader2 size={16} className="spin-icon" />
                      Fetching GPS location...
                    </>
                  ) : coords ? (
                    <>
                      <MapPin size={16} className="loc-pin-icon" />
                      Location captured (Click to re-fetch)
                    </>
                  ) : (
                    <>
                      <Crosshair size={16} />
                      Use my current location
                    </>
                  )}
                </button>
                {locStatus && (
                  <span className={`req-pandal-loc-status ${locStatus.type}`}>
                    {locStatus.text}
                  </span>
                )}
              </div>

              {/* Field 4: Anything else (Optional) */}
              <div className="req-pandal-field">
                <label>
                  Anything else <span className="req-pandal-optional">· optional</span>
                </label>
                <textarea 
                  placeholder="Landmark, theme, nearest metro..." 
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>

              {/* Alert Banner for errors, duplicate detection, or rate limiting */}
              {statusMessage?.type === 'error' && (
                <div className="req-pandal-alert-banner">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{statusMessage.text}</span>
                </div>
              )}
            </div>

            <div className="req-pandal-footer">
              <button 
                type="submit" 
                className="req-pandal-send-btn" 
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="req-pandal-btn-loading">
                    <Loader2 size={18} className="spin-icon" /> Sending request...
                  </span>
                ) : (
                  "Send request"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RequestPandalPopup;
