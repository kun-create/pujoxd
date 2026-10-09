import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import MusicPlayer from './components/MusicPlayer';
import MobileLoader from './components/MobileLoader';
import MapPage from './components/MapPage';
import ThirdPagePlayer from './components/ThirdPagePlayer';
import PujoThemeCards from './components/PujoThemeCards';
import LoginModal from './components/LoginModal';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMapPage, setShowMapPage] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [isMapFadingOut, setIsMapFadingOut] = useState(false);
  const videoRef = React.useRef(null);

  // ── Third-page countdown: days until October 10, 2026 (Mahalaya) ──
  const [thirdPageDays, setThirdPageDays] = useState('');
  useEffect(() => {
    const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    const toBn = n => n.toString().split('').map(d => bn[+d] ?? d).join('');
    const today = new Date();
    const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const target  = new Date(2026, 9, 10); // October 10, 2026
    const diffDays = Math.ceil((target - current) / 86400000);
    setThirdPageDays(diffDays > 0 ? toBn(diffDays) : '০');
  }, []);

  // 🔴 MAHALAYA AUTOMATION LOGIC 🔴
  useEffect(() => {
    const isWithinTimeRange = (start, end) => {
      const now = new Date();
      return now >= start && now <= end;
    };

    const checkAutomation = () => {
      // Main Function: Oct 10, 2026, 4:30 AM to 6:30 AM
      const mainStart = new Date(2026, 9, 10, 4, 30, 0);
      const mainEnd = new Date(2026, 9, 10, 6, 30, 0);

      // Test Function: Sept 14, 2026, 5:40 PM to 5:55 PM (Today)
      const testStart = new Date(2026, 8, 14, 21, 0, 0);
      const testEnd = new Date(2026, 8, 14, 21, 10, 0);

      if (isWithinTimeRange(mainStart, mainEnd) || isWithinTimeRange(testStart, testEnd)) {
        // 1) Force the browser to start strictly at the very top landing page.
        // This overrides Chrome's memory of where you scrolled last time.
        if ('scrollRestoration' in history) {
          history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);

        // 2) Run automation once site has loaded.
        // Wait 1.5 seconds on the landing page before sliding.
        setTimeout(() => {
          const thirdPage = document.getElementById('third-page');
          if (thirdPage) {
            thirdPage.scrollIntoView({ behavior: 'smooth' });
            
            // Dispatch event to play ThirdPagePlayer after scrolling
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('mahalaya-auto-play'));
            }, 1200); 
          }
        }, 1500); 
      }
    };

    checkAutomation();
  }, []);

  useEffect(() => {
        const handlePopState = (e) => {
      const mapSubStates = ['direction', 'update', 'nearby', 'preview', 'location-popup', 'routes'];
      if (!e.state || (e.state.id !== 'map' && !mapSubStates.includes(e.state.id))) {
        setShowMapPage(false);
        setIsMapLoading(false);
        setIsMapFadingOut(false);
      } else if (e.state && (e.state.id === 'map' || mapSubStates.includes(e.state.id))) {
        setShowMapPage(true);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleHash = () => {
      // If automation is actively running, ignore the hash jump so it stays on landing page
      const now = new Date();
      const isAutoTesting = (now >= new Date(2026, 8, 14, 21, 0, 0) && now <= new Date(2026, 8, 14, 21, 10, 0));
      const isAutoMain = (now >= new Date(2026, 9, 10, 4, 30, 0) && now <= new Date(2026, 9, 10, 6, 30, 0));
      if (isAutoTesting || isAutoMain) return;

      if (window.location.hash === '#third-page' || window.location.pathname.endsWith('/third-page')) {
        setTimeout(() => {
          document.getElementById('third-page')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const openMap = () => {
    setIsMapLoading(true);
    setIsMapFadingOut(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(e => console.error("Video play error:", e));
    }
  };

  const handleLoaderEnded = () => {
    // Show map right away under the fading video
    setShowMapPage(true);
    window.history.pushState({ modalOpen: true, id: 'map' }, '');
    
    // Start fade out animation
    setIsMapFadingOut(true);
    
    // Complete the process after 1 second (matches CSS transition)
    setTimeout(() => {
      setIsMapLoading(false);
      setIsMapFadingOut(false);
    }, 1000);
  };

  const closeModal = () => {
    setShowMapPage(false);
    setIsMapLoading(false);
    setIsMapFadingOut(false);
    // Push home state so that hardware back won't reopen map
    window.history.pushState({ id: 'home' }, '');
  };

  return (
    <>
      {!isLoggedIn && <LoginModal onLogin={() => setIsLoggedIn(true)} />}
      {isLoggedIn && (
        <div className="app-container">
      <MobileLoader />
      
      {/* Landscape Warning Overlay */}
      <div className="landscape-overlay">
        <p className="landscape-text">Horizontal view is under construction</p>
      </div>

      {/* Scrollable Content Wrapper */}
      <div className="scrollable-wrapper">
        {/* Main Content (First Page) */}
        <main className="main-content">
          {/* Background Image Layer */}
          <div className="background-image"></div>
          
          {/* Dark Overlay for better text legibility */}
          <div className="background-overlay"></div>

          <Header onOpenMap={openMap} />
          <HeroSection />
          <MusicPlayer />
        </main>

        {/* Blur seam to blend the two pages */}
        <div className="page-seam-blur lg:hidden"></div>

        {/* Second Page */}
        <div className="second-page" id="second-page">
          {/* Mobile View Image */}
          <img src="/2nd page.jpg" alt="Puja Schedule Mobile" className="w-full h-auto block lg:hidden" />
          
          {/* PC Dedicated View Image */}
          <div className="hidden lg:flex w-full min-h-screen items-center justify-center p-8 bg-[#550719]">
            <img 
              src="/puja-schedule.jpg" 
              alt="Puja Schedule Desktop" 
              className="max-w-full object-contain shadow-2xl" 
              style={{ width: '100%', height: 'auto', maxHeight: '100vh' }}
            />
          </div>
        </div>

        {/* Blur seam to blend the second and third pages */}
        <div className="page-seam-blur md:hidden"></div>

        {/* Third Page */}
        <div className="third-page" id="third-page">
          {/* Mobile View Image (max-width: 768px) */}
          <div className="third-page-mobile">
            <img 
              src="/third-page-image.jpg?v=2" 
              alt="Mahalaya & Puja Info Mobile" 
              className="third-page-mobile-img" 
            />
            <div className="third-page-mobile-bottom-space"></div>
            
            {/* ── Third-page countdown badge (yellow circle area) ── */}
            
            <div className="tp3-countdown-badge">
              <span className="tp3-countdown-text">
                অপেক্ষার আর মাত্র {thirdPageDays} দিন
              </span>
              <span className="tp3-radio-icon" role="img" aria-label="radio">📻</span>
            </div>

            {/* ── Musical Wave + Bengali Text Animation ── */}
            <div className="music-wave-overlay" aria-hidden="true">

              {/* Layer 1 — Bengali text scrolling right to left */}
              <div className="bengali-text-runner">
                <span className="bengali-text-scroll">
                  {'আশ্বিনের শারদপ্রাতে বেজে উঠেছে আলোক-মঞ্জীর; ধরণীর বহিরাকাশে অন্তরিত মেঘমালা; প্রকৃতির অন্তরাকাশে জাগরিত জ্যোতির্ময়ী জগন্মাতার আগমন বার্তা। আনন্দময়ী মহামায়ার পদধ্বনি অসীম ছন্দে বেজে উঠে রূপলোক ও রসলোকে আনে নব ভাবমাধুরীর সঞ্জীবন। তাই আনন্দিতা শ্যামলীমাতৃকার চিন্ময়ীকে মৃণ্ময়ীতে আবাহন। আজ চিৎ-শক্তিরূপিনী বিশ্বজননীর শারদ-স্মৃতিমণ্ডিতা প্রতিমা মন্দিরে মন্দিরে ধ্যানবোধিতা।'}
                </span>
              </div>

              {/* Layer 2+3 — Staff lines + perspective notes in ONE shared container */}
              <div className="staff-notes-layer">
                <svg
                  className="staff-lines-svg"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 400 46"
                  preserveAspectRatio="none"
                >
                  <path d="M 0,5  Q 200,3  400,1"  stroke="rgba(92,32,0,0.35)" strokeWidth="2.2" fill="none" />
                  <path d="M 0,16 Q 200,13 400,10" stroke="rgba(92,32,0,0.35)" strokeWidth="2.2" fill="none" />
                  <path d="M 0,27 Q 200,23 400,19" stroke="rgba(92,32,0,0.35)" strokeWidth="2.2" fill="none" />
                  <path d="M 0,38 Q 200,33 400,28" stroke="rgba(92,32,0,0.35)" strokeWidth="2.2" fill="none" />
                </svg>
                <span className="music-note mn-1">𝄞</span>
                <span className="music-note mn-2">♪</span>
                <span className="music-note mn-3">♫</span>
                <span className="music-note mn-4">#</span>
                <span className="music-note mn-5">♬</span>
                <span className="music-note mn-6">♩</span>
                <span className="music-note mn-7">𝄞</span>
                <span className="music-note mn-8">♪</span>
                <span className="music-note mn-9">#</span>
                <span className="music-note mn-10">♫</span>
                <span className="music-note mn-11">♬</span>
                <span className="music-note mn-12">𝄞</span>
              </div>

            </div>{/* end .music-wave-overlay */}

            {/* ── Third-page floating mini music player ── */}
            <ThirdPagePlayer />
          </div>
          
          {/* Desktop Dedicated View Image (min-width: 769px) */}
          <div className="third-page-desktop">
            <img 
              src="/third-page-desktop.jpg" 
              alt="Mahalaya & Puja Info Desktop" 
              className="third-page-desktop-img" 
            />

            {/* Desktop countdown badges */}
            
            <div className="tp3-desktop-countdown-badge">
              <span className="tp3-desktop-countdown-text">
                অপেক্ষার আর মাত্র {thirdPageDays} দিন
              </span>
              <span className="tp3-desktop-radio-icon" role="img" aria-label="radio">📻</span>
            </div>

            <div className="tp3-desktop-player">
              <ThirdPagePlayer playerId="third-page-desktop" />
            </div>
          </div>
        </div>

        <div className="page-seam-blur md:hidden"></div>

        {/* Fourth Page */}
        <div className="fourth-page" id="fourth-page">
          {/* Mobile View Image (max-width: 768px) */}
          <img src="/4thpage-1080.jpg" alt="Fourth Page Mobile" className="w-full h-auto fourth-page-mobile-img" />
          
          {/* Desktop Dedicated View Image (min-width: 769px) */}
          <img src="/4th-page-dekstop.jpg" alt="Fourth Page Desktop" className="w-full h-auto fourth-page-desktop-img" />
          
          {/* Reusable Theme Card System */}
          <PujoThemeCards />
          <div style={{ position: 'absolute', bottom: '3px', width: '100%', textAlign: 'center', color: '#a69a8b', fontSize: '14px', zIndex: 20, fontFamily: 'sans-serif', letterSpacing: '1px' }}>
            <div style={{ marginBottom: '0px', opacity: 0.8 }}>&copy; 2026 Pujo Porikroma. All rights reserved.</div>
            <div style={{ opacity: 0.8 }}>contact us : saikatsom234@gmail.com</div>
            <div style={{ opacity: 0.8, marginTop: '0px' }}>keep supporting · Happy Durga Puja😊</div>
          </div>
        </div>
      </div>

      {/* Map Loader Overlay */}
      <div 
        className={`map-loader-overlay ${isMapFadingOut ? 'fade-out' : ''}`}
        style={{ display: (isMapLoading || isMapFadingOut) ? 'flex' : 'none' }}
      >
        <video 
          ref={videoRef}
          src="/map_loader.mp4" 
          preload="auto"
          muted
          playsInline
          onEnded={handleLoaderEnded}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Map Page */}
      {showMapPage && <MapPage onClose={closeModal} />}
    </div>
      )}
    </>
  );
}

export default App;





