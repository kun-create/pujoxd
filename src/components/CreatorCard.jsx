import React from 'react';

import './CreatorCard.css';

const CreatorCard = ({ onClose }) => {
  const handleCopyEmail = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText("saikatsom234@gmail.com");
    alert("Email copied to clipboard: saikatsom234@gmail.com");
  };

  return (
    <div className="creator-card-overlay" onClick={onClose}>
      
      {/* Main Card */}
      <div className="creator-card" onClick={(e) => e.stopPropagation()}>
        
        <div className="creator-card-top">
          <p className="creator-credit">Created With Love &amp; Passion By</p>
          <hr className="creator-divider" />
        </div>
        
        <div className="creator-content">
          <div className="creator-info">
            <h2 className="creator-name">Saikat Som</h2>
            <p className="creator-title">Ichapur, West Bengal</p>
            
            <div className="creator-social-links">
              <a href="https://www.facebook.com/share/1JvbakpQCZ/" target="_blank" rel="noopener noreferrer" className="social-icon facebook">
                <img src="/facebook-logo.png" alt="Facebook" />
              </a>
              <a href="https://www.instagram.com/saikatsom83?igsi=d2l6d3RzbTZjOGF2" target="_blank" rel="noopener noreferrer" className="social-icon">
                <img src="/instagram-logo.png" alt="Instagram" />
              </a>
              <button onClick={handleCopyEmail} className="social-icon" title="Copy Email">
                <img src="/gmail-logo.png" alt="Gmail" />
              </button>
            </div>
            
            <div className="creator-email-text">
              or<br/>
              <u>saikatsom234@gmail.com</u>
            </div>
          </div>
          
          <div className="creator-image-container">
            <img src="/creator-avatar.jpg" alt="Saikat Som" className="creator-avatar" />
          </div>
        </div>
        
        <hr className="creator-divider bottom-divider" />
        
        <div className="creator-footer">
          <p>Created for Durga Puja 2026</p>
        </div>
      </div>
    </div>
  );
};

export default CreatorCard;
