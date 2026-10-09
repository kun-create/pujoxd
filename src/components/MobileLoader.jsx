import React, { useState, useEffect } from 'react';
import './MobileLoader.css';

const MobileLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  // Initialize synchronously to prevent 1-frame flash of main app
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const [displayedText, setDisplayedText] = useState('');
  
  const loadingText = "লোড হচ্ছে, অপেক্ষা করুন।....";

  useEffect(() => {
    // Typing animation logic
    let index = 0;
    const typingInterval = setInterval(() => {
      setDisplayedText((prev) => {
        const nextStr = loadingText.slice(0, index + 1);
        if (nextStr === loadingText) {
          clearInterval(typingInterval);
        }
        return nextStr;
      });
      index++;
    }, 100);

    // Check if device is mobile width (phone)
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Fallback: forcefully trigger fade out after 6 seconds
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 6000);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timeout);
      clearInterval(typingInterval);
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      // Once loading finishes, wait for the 1-second CSS blur/fade animation to complete before completely unmounting
      const hideTimeout = setTimeout(() => {
        setIsHidden(true);
      }, 1000);
      return () => clearTimeout(hideTimeout);
    }
  }, [isLoading]);

  const handleVideoEnd = () => {
    setIsLoading(false);
  };

  // Only render on mobile. If it's hidden (after animation), return null.
  if (!isMobile || isHidden) return null;

  return (
    <div className={`mobile-loader-overlay ${!isLoading ? 'fade-out' : ''}`}>
      <video
        className="mobile-loader-video"
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        onError={handleVideoEnd} // Hide if video fails to load
      >
        <source src="/loader.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="loader-text-container">
        <span className="loader-typing-text bengali-text">{displayedText}</span>
      </div>
    </div>
  );
};

export default MobileLoader;
