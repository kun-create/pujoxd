import React from 'react';
import { X, Copy } from 'lucide-react';
import './InviteFriendsPopup.css';

const InviteFriendsPopup = ({ onClose }) => {
  const shareText = "🎉 Join me on Sharodiya — plan the perfect Durga P...";

  const handleCopy = () => {
    navigator.clipboard.writeText("Join me on Sharodiya — plan the perfect Durga Pandal hopping route! https://sharodiya.com");
    // Optionally add a toast here later
  };

  return (
    <div className="invite-overlay" onClick={(e) => { e.stopPropagation(); onClose(); }}>
      <div className="invite-content" onClick={(e) => e.stopPropagation()}>
        <div className="invite-header">
          <button className="invite-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
          <h2 className="invite-title">Share</h2>
        </div>

        <div className="invite-body">
          <div className="invite-copy-box" onClick={handleCopy}>
            <span className="invite-text">{shareText}</span>
            <Copy size={20} className="invite-copy-icon" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteFriendsPopup;
