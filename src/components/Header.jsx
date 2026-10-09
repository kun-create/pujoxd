import React, { useState, useEffect } from 'react';
import { Settings, User, Coffee, Globe2 } from 'lucide-react';
import { io } from 'socket.io-client';
import { toBengaliNumber, getPujoText } from '../utils/dateUtils';
import CreatorCard from './CreatorCard';
import ChaiPopup from './ChaiPopup';
import ChatPopup from './ChatPopup';
import SettingsPopup from './SettingsPopup';
import './Header.css';

const Header = ({ onOpenMap }) => {
  const [onlineCount, setOnlineCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCreatorCard, setShowCreatorCard] = useState(false);
  const [showChaiPopup, setShowChaiPopup] = useState(false);
  const [showChatPopup, setShowChatPopup] = useState(false);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);

  useEffect(() => {
        const handlePopState = (e) => {
      // Sync Settings
      if (e.state?.view === 'settings' || e.state?.view === 'settings-popup') {
        setShowSettingsPopup(true);
      } else {
        setShowSettingsPopup(false);
      }

      // Sync Chat
      if (e.state?.view === 'chat-main' || e.state?.view === 'chat-popup') {
        setShowChatPopup(true);
      } else {
        setShowChatPopup(false);
      }

      // Sync Creator Card
      if (e.state?.view === 'creator-card') {
        setShowCreatorCard(true);
      } else {
        setShowCreatorCard(false);
      }

      // Sync Coffee Popup
      if (e.state?.view === 'coffee-popup') {
        setShowChaiPopup(true);
      } else {
        setShowChaiPopup(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    
    // On mount check
    if (window.history.state?.view === 'settings' || window.history.state?.view === 'settings-popup') {
      setShowSettingsPopup(true);
    }
    if (window.history.state?.view === 'chat-main' || window.history.state?.view === 'chat-popup') {
      setShowChatPopup(true);
    }
    if (window.history.state?.view === 'creator-card') {
      setShowCreatorCard(true);
    }
    if (window.history.state?.view === 'coffee-popup') {
      setShowChaiPopup(true);
    }
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const openSettings = () => {
    window.history.pushState({ view: 'settings' }, '');
    setShowSettingsPopup(true);
  };

  const closeSettings = () => {
    if (window.history.state?.view === 'settings' || window.history.state?.view === 'settings-popup') {
      window.history.back();
    } else {
      setShowSettingsPopup(false);
    }
  };

  const openChat = () => {
    window.history.pushState({ view: 'chat-main' }, '');
    setShowChatPopup(true);
  };

  const closeChat = () => {
    if (window.history.state?.view === 'chat-main' || window.history.state?.view === 'chat-popup') {
      window.history.back();
    } else {
      setShowChatPopup(false);
    }
  };

  const openCreatorCard = () => {
    window.history.pushState({ view: 'creator-card' }, '');
    setShowCreatorCard(true);
  };

  const closeCreatorCard = () => {
    if (window.history.state?.view === 'creator-card') {
      window.history.back();
    } else {
      setShowCreatorCard(false);
    }
  };

  const openChaiPopup = () => {
    window.history.pushState({ view: 'coffee-popup' }, '');
    setShowChaiPopup(true);
  };

  const closeChaiPopup = () => {
    if (window.history.state?.view === 'coffee-popup') {
      window.history.back();
    } else {
      setShowChaiPopup(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatBengaliTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    let timePrefix = '';
    if (hours >= 5 && hours < 12) {
      timePrefix = 'সকাল';
    } else if (hours >= 12 && hours < 16) {
      timePrefix = 'দুপুর';
    } else if (hours >= 16 && hours < 18) {
      timePrefix = 'বিকেল';
    } else if (hours >= 18 && hours < 21) {
      timePrefix = 'সন্ধ্যা';
    } else if (hours >= 21 && hours < 24) {
      timePrefix = 'রাত';
    } else if (hours >= 0 && hours < 3) {
      timePrefix = 'মধ্যরাত';
    } else if (hours >= 3 && hours < 5) {
      timePrefix = 'ভোর';
    }
    
    let displayHours = hours % 12;
    displayHours = displayHours ? displayHours : 12;
    
    const strHours = toBengaliNumber(displayHours);
    const strMins = toBengaliNumber(minutes < 10 ? '0' + minutes : minutes);
    
    // In Bengali, the time period comes before the time (e.g., "সকাল ১০:১৫")
    return `${timePrefix} ${strHours}:${strMins}`;
  };

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '/';

    const newSocket = io(backendUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to real-time server');
    });

    newSocket.on('onlineUsersUpdate', (count) => {
      setOnlineCount(count);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <>
      <header className="header">
        <div className="header-left">
          <div className="online-badge glass-panel" onClick={openChat} style={{ cursor: 'pointer' }}>
            <span className="dot"></span>
            <span className="bengali-text">{toBengaliNumber(onlineCount)} সক্রিয়</span>
          </div>
          <div className="countdown hide-mobile fancy-bengali">
            {getPujoText()}
          </div>
        </div>
        
        <div className="header-right">
          {/* Clock visible on all devices */}
          <div className="mobile-actions glass-panel mobile-clock">
            <span className="bengali-text">{formatBengaliTime(currentTime)}</span>
          </div>
          
          <div className="desktop-actions glass-panel">
            <button className="icon-btn" onClick={openSettings}><Settings size={18} /></button>
            <button className="icon-btn" onClick={onOpenMap}><Globe2 size={18} /></button>
            <button className="icon-btn" onClick={openCreatorCard}><User size={18} /></button>
            <button className="icon-btn" onClick={openChaiPopup}><Coffee size={18} /></button>
          </div>
        </div>
      </header>

      {/* Render popups over everything when state is true */}
      {showSettingsPopup && <SettingsPopup onClose={closeSettings} />}
      {showCreatorCard && <CreatorCard onClose={closeCreatorCard} />}
      {showChaiPopup && <ChaiPopup onClose={closeChaiPopup} />}
      {showChatPopup && <ChatPopup onClose={closeChat} socket={socket} />}
    </>
  );
};

export default Header;



