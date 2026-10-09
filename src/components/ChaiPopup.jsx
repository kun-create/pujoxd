import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import './ChaiPopup.css';

const ChaiPopup = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const upiId = "saikatsom51@okaxis";

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="chai-overlay" onClick={onClose}>
      <div className="chai-modal" onClick={e => e.stopPropagation()}>
        <button className="chai-close-btn" onClick={onClose}>
          <X size={20} />
        </button>
        
        <h2 className="chai-title">BUY ME A COFFEE</h2>
        
        <p className="chai-desc">
          If u like my Page, Support my work with a small contribution! It means a lot & helps me to create more in the future.
        </p>
        
        <div className="chai-qr-container">
          <img src="/my_QR.jpg" alt="UPI QR Code" className="chai-qr" />
        </div>
        
        <p className="chai-scan-text">Scan with any UPI app</p>
        
        <div className="chai-upi-box">
          <span className="chai-upi-id">{upiId}</span>
          <button className="chai-copy-btn" onClick={handleCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'COPIED' : 'COPY'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChaiPopup;
