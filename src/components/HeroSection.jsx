import React, { useState, useEffect } from 'react';
import { getPujoText } from '../utils/dateUtils';
import './HeroSection.css';

const HeroSection = () => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const fullText = getPujoText();

  useEffect(() => {
    let index = 0;
    setDisplayedText(''); // Reset on mount
    setIsTyping(true);
    
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => {
        const nextStr = fullText.slice(0, index + 1);
        if (nextStr === fullText) {
          clearInterval(intervalId);
          setIsTyping(false);
        }
        return nextStr;
      });
      index++;
    }, 100); // 100ms per character typing speed
    
    return () => clearInterval(intervalId);
  }, [fullText]);

  return (
    <section className="hero-section">
      <div className="hero-content">
        {/* Extracted logo overlay for mobile */}
        <img src="/ma-logo.png" className="mobile-logo show-mobile-only" alt="Ma Aschen" />
        
        {/* Countdown for mobile layout with typing animation */}
        <div className="mobile-countdown show-mobile-only fancy-bengali">
          <span>{displayedText}</span>
          <img 
            src="/dhak-icon.png" 
            className={`dhak-cursor ${isTyping ? 'typing' : ''}`} 
            alt="dhak" 
          />
          <span style={{ visibility: 'hidden' }}>{fullText.slice(displayedText.length)}</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
