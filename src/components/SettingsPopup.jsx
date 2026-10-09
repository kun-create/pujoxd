import React, { useState, useEffect } from 'react';
import { 
  X, Pencil, MapPin, Bell, Flag, HelpCircle, 
  Share2, LogOut, Navigation, Home, Flame 
} from 'lucide-react';
import EditProfilePopup from './EditProfilePopup';
import HomeLocationPopup from './HomeLocationPopup';
import RequestPandalPopup from './RequestPandalPopup';
import VisitedPandalPopup from './VisitedPandalPopup';
import ReportPopup from './ReportPopup';
import HelpSupportPopup from './HelpSupportPopup';
import InviteFriendsPopup from './InviteFriendsPopup';
import './SettingsPopup.css';

const SettingsPopup = ({ onClose, onLogout }) => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showHomeLocation, setShowHomeLocation] = useState(false);
  const [showRequestPandal, setShowRequestPandal] = useState(false);
  const [showVisited, setShowVisited] = useState(false);
  const [visitedCount, setVisitedCount] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const storedUserStr = localStorage.getItem('pujoUser');
  const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
  const userName = storedUser ? `${storedUser.firstname || ''} ${storedUser.lastname || ''}`.trim() : 'USER';
  const userEmail = storedUser?.email || 'user@gmail.com';
  const userGender = storedUser?.gender || 'male';

  
  useEffect(() => {
    const updateCount = () => {
      try {
        const stored = localStorage.getItem('visitedPandals');
        if (stored) {
          setVisitedCount(JSON.parse(stored).length);
        }
      } catch(e) {}
    };
    updateCount();
    window.addEventListener('visitedPandalsUpdated', updateCount);
    return () => window.removeEventListener('visitedPandalsUpdated', updateCount);
  }, []);

  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state?.view !== 'settings-popup') {
        setShowEditProfile(false);
        setShowHomeLocation(false);
        setShowRequestPandal(false);
        setShowReport(false);
        setShowHelp(false);
        setShowInvite(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    
    // Check if we mounted in a state where a popup shouldn't be open
    if (window.history.state?.view !== 'settings-popup') {
        setShowEditProfile(false);
        setShowHomeLocation(false);
        setShowRequestPandal(false);
        setShowReport(false);
        setShowHelp(false);
        setShowInvite(false);
    }
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const openPopup = (setter) => {
    window.history.pushState({ view: 'settings-popup' }, '');
    setter(true);
  };

  const closePopup = (setter) => {
    setter(false);
    if (window.history.state?.view === 'settings-popup') {
      window.history.back();
    }
  };

  const [avatarSrc, setAvatarSrc] = useState(() => {
    const maleAvatars = [
      '/avatar-male-1.png',
      '/avatar-male-2.png',
      '/avatar-male-3.png',
      '/user logo1.png',
      '/user logo3.png',
      '/user logo4.png',
      '/user logo6.png'
    ];
    const femaleAvatars = [
      '/avatar-female-1.png',
      '/user logo2.png',
      '/user logo5.png',
      '/user logo7.png'
    ];
    
    if (storedUser?.picture) {
      return storedUser.picture;
    }
    const arrayToUse = userGender === 'female' ? femaleAvatars : maleAvatars;
    return arrayToUse[Math.floor(Math.random() * arrayToUse.length)];
  });

  return (
    <div className="settings-popup-overlay fade-in" onClick={onClose}>
      <div 
        className="settings-popup-content slide-up" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* User Profile Section */}
        <div className="settings-profile-section">
          <div className="settings-avatar-wrapper">
            <img src={avatarSrc} alt="User Avatar" className="settings-avatar" onError={(e) => {
              const maleAvatars = ['/avatar-male-1.png','/avatar-male-2.png','/avatar-male-3.png','/user logo1.png','/user logo3.png','/user logo4.png','/user logo6.png'];
              const femaleAvatars = ['/avatar-female-1.png','/user logo2.png','/user logo5.png','/user logo7.png'];
              const arrayToUse = userGender === 'female' ? femaleAvatars : maleAvatars;
              const fallback = arrayToUse[Math.floor(Math.random() * arrayToUse.length)];
              setAvatarSrc(fallback);
              
              // Also clean up localstorage so it doesnt happen again
              const storedUserStr = localStorage.getItem('pujoUser');
              if (storedUserStr) {
                const storedUser = JSON.parse(storedUserStr);
                delete storedUser.picture;
                localStorage.setItem('pujoUser', JSON.stringify(storedUser));
              }
            }} />
          </div>
          <div className="settings-profile-info">
            <h2 className="settings-username">{userName || 'USER'}</h2>
            <p className="settings-email">{userEmail}</p>
            <div className="settings-badge">
              <Flame size={12} className="settings-badge-icon" />
              <span>Pandal Explorer</span>
            </div>
          </div>
          <button className="settings-edit-btn" onClick={() => openPopup(setShowEditProfile)}>
            <Pencil size={18} />
          </button>
        </div>

        <div className="settings-scroll-area">
          {/* Journey Section */}
          <div className="settings-section">
            <h3 className="settings-section-title">Your Pujo journey</h3>
            <div className="settings-journey-cards" style={{ padding: '20px 24px', justifyContent: 'space-between' }}>
                <div className="settings-journey-card" style={{ flex: 'none', justifyContent: 'flex-start', marginLeft: '8px' }}>
                  <div className="settings-journey-icon-wrap">
                    <Home size={20} />
                  </div>
                  <div className="settings-journey-stats">
                    <span className="settings-stat-number">{visitedCount}</span>
                    <span className="settings-stat-label">Visited</span>
                  </div>
                </div>
                
                <div className="settings-journey-card" onClick={() => openPopup(setShowVisited)} style={{ flex: 'none', justifyContent: 'flex-end', cursor: 'pointer', marginRight: '8px' }}>
                  <span style={{ color: '#ffffff', fontWeight: '500', fontSize: '16px', letterSpacing: '0.5px' }}>view</span>
                </div>
              </div>
          </div>

          {/* Preferences Section */}
          <div className="settings-section">
            <h3 className="settings-section-title">Preferences</h3>
            <div className="settings-list-group">
              <div className="settings-list-item" onClick={() => openPopup(setShowHomeLocation)}>
                <div className="settings-list-icon">
                  <MapPin size={20} />
                </div>
                <div className="settings-list-text">
                  <h4>Home location</h4>
                  <p>Current location</p>
                </div>
                <div className="settings-list-action">
                  <span className="chevron">›</span>
                </div>
              </div>

              <div className="settings-list-item">
                <div className="settings-list-icon">
                  <Bell size={20} />
                </div>
                <div className="settings-list-text">
                  <h4>Push notifications</h4>
                  <p>Crowd & route alerts</p>
                </div>
                <div className="settings-list-action">
                  <div 
                    className={`settings-toggle ${pushEnabled ? 'active' : ''}`}
                    onClick={() => setPushEnabled(!pushEnabled)}
                  >
                    <div className="settings-toggle-knob"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="settings-section">
            <h3 className="settings-section-title">Support</h3>
            <div className="settings-list-group">
              <div className="settings-list-item" onClick={() => openPopup(setShowRequestPandal)}>
                <div className="settings-list-icon">
                  <MapPin size={20} />
                </div>
                <div className="settings-list-text">
                  <h4>Add a pandal</h4>
                  <p>Missing a pandal? Tell us about it</p>
                </div>
                <div className="settings-list-action">
                  <span className="chevron">›</span>
                </div>
              </div>

              <div className="settings-list-item" onClick={() => openPopup(setShowReport)}>
                <div className="settings-list-icon">
                  <Flag size={20} />
                </div>
                <div className="settings-list-text">
                  <h4>Report</h4>
                  <p>Report a bug or wrong info</p>
                </div>
                <div className="settings-list-action">
                  <span className="chevron">›</span>
                </div>
              </div>

              <div className="settings-list-item" onClick={() => openPopup(setShowHelp)}>
                <div className="settings-list-icon">
                  <HelpCircle size={20} />
                </div>
                <div className="settings-list-text">
                  <h4>Help & support</h4>
                  <p>FAQs, contact us</p>
                </div>
                <div className="settings-list-action">
                  <span className="chevron">›</span>
                </div>
              </div>

              <div className="settings-list-item" onClick={() => openPopup(setShowInvite)}>
                <div className="settings-list-icon">
                  <Share2 size={20} />
                </div>
                <div className="settings-list-text">
                  <h4>Invite others</h4>
                  <p>Share Pujo Porikroma with friends</p>
                </div>
                <div className="settings-list-action">
                  <span className="chevron">›</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <button className="settings-signout-btn" onClick={() => { localStorage.removeItem('pujoUser'); window.location.reload(); }}>
            <LogOut size={18} />
            <span>Sign out</span>
          </button>

          {/* Footer */}
          <div className="settings-footer">
            Pujo Porikroma V0.1 · Durga Puja 2026
          </div>
        </div>
      </div>
      {showEditProfile && (
        <EditProfilePopup 
          onClose={() => closePopup(setShowEditProfile)} 
          avatarSrc={avatarSrc}
          setAvatarSrc={setAvatarSrc}
          initialName={userName}
          initialEmail={userEmail}
        />
      )}

      {showHomeLocation && (
        <HomeLocationPopup 
          onClose={() => closePopup(setShowHomeLocation)} 
        />
      )}

      {showVisited && (
          <VisitedPandalPopup 
            onClose={() => closePopup(setShowVisited)} 
          />
        )}
        
        {showRequestPandal && (
        <RequestPandalPopup 
          onClose={() => closePopup(setShowRequestPandal)} 
        />
      )}

      {showReport && (
        <ReportPopup 
          onClose={() => closePopup(setShowReport)} 
        />
      )}

      {showHelp && (
        <HelpSupportPopup 
          onClose={() => closePopup(setShowHelp)} 
        />
      )}

      {showInvite && (
        <InviteFriendsPopup 
          onClose={() => closePopup(setShowInvite)} 
        />
      )}
    </div>
  );
};

export default SettingsPopup;
