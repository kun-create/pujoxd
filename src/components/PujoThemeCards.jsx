import React, { useState } from 'react';
import './PujoThemeCards.css';
import HindusthanImg from '/Hindusthan-Park-1.png';


const themes = [
  { id: 1, title: "Santosh Mitra Square", subtitle: "Explore Pujo Theme", subtitles: ["Operation Sindoor (2025)", "Vande Mataram (2026)"], image: "/Santosh-Mitra-Square1.jpg", images: ["/Santosh-Mitra-Square1.jpg", "/Santosh-Mitra-Square2.jpg"], colorScheme: "black-ochre" },
  { id: 2, title: "Sreebhumi Sporting Club", subtitle: "Explore Pujo Theme", subtitles: ["Swaminarayan Akshardham Temple (2025)", "Rajasthan Hawa Mahal (2026)"], image: "/Sreebhumi-Sporting-Club1.jpg", images: ["/Sreebhumi-Sporting-Club1.jpg", "/Sreebhumi-Sporting-Club2.jpg"], colorScheme: "yellow-green" },
  { id: 3, title: "Tala Prattoy", subtitle: "Explore Pujo Theme", subtitles: ["Bij Angan (2025)", "not been officially announced yet (2026)"], image: "/tala-prottoy1.jpg", images: ["/tala-prottoy1.jpg", "/tala-prottoy2.jpg"], colorScheme: "brown" },
  { id: 4, title: "Suruchi Sangha", subtitle: "Explore Pujo Theme", subtitles: ["Ahuti (2025)", "Utsho (2026)"], image: "/Suruchi-Sangha1.jpg", images: ["/Suruchi-Sangha1.jpg", "/Suruchi-Sangha2.jpg"], colorScheme: "red-brown" },
  { id: 5, title: "Kashi Bose Lane", subtitle: "Explore Pujo Theme", subtitles: ["Pakdondi (2025)", "not been officially announced yet (2026)"], image: "/kashi-bose-lane1.jpg", images: ["/kashi-bose-lane1.jpg", "/kashi-bose-lane2.jpg"], colorScheme: "ochre" },
  { id: 6, title: "Dum Dum Park Bharat Chakra", subtitle: "Explore Pujo Theme", subtitles: ["Tanmatra (The Aura) (2025)", "Antaryami (অন্তর্যামী) (2026)"], image: "/DumDum-Park-BharatChakra1.jpg", images: ["/DumDum-Park-BharatChakra1.jpg", "/DumDum-Park-BharatChakra2.jpg"], colorScheme: "black" },
  { id: 7, title: "Kalyani ITI More Luminos Club", subtitle: "Explore Pujo Theme", subtitles: ["Hsinbyume Pagoda from Myanmar (2025)", "Swe Taw Myat Pagoda of Myanmar (2026)"], image: "/Kalyani-ITI-1.png", images: ["/Kalyani-ITI-1.png", "/Kalyani-ITI-2.jpg"], colorScheme: "ochre" },
  { id: 8, title: "Kumartuli Park", subtitle: "Explore Pujo Theme", subtitles: ["Potroshova (2025)", "Mati O Shilpi (2026)"], image: "/Kumartuli-Park1.jpg", images: ["/Kumartuli-Park1.jpg", "/Kumartuli-Park2.jpg"], colorScheme: "violet" },
  { id: 10, title: "Ahiritola Sarbajanin Durgotsav", subtitle: "Explore Pujo Theme", subtitles: ["Probaho (2025)", "Chhanda (2026)"], image: "/Ahiritola-Sarbajanin-Durgotsav1.jpg", images: ["/Ahiritola-Sarbajanin-Durgotsav1.jpg", "/Ahiritola-Sarbajanin-Durgotsav2.jpg"], colorScheme: "ochre-lite" },
  { id: 11, title: "Hindusthan Park", subtitle: "Explore Pujo Theme", subtitles: ["Lokoj (2025)", "not been officially announced yet (2026)"], image: "/Hindusthan-Park-1.png", images: ["/Hindusthan-Park-1.png", "/Hindusthan-Park-2.png"], colorScheme: "brown" }
];

export default function PujoThemeCards() {
  const [themeData] = useState(() => [...themes].sort(() => Math.random() - 0.5));
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardImageIndexes, setCardImageIndexes] = useState({});

  const toggleCardImage = (e, themeId, imagesArray) => {
    if (!imagesArray || imagesArray.length <= 1) return;
    e.stopPropagation();
    setCardImageIndexes(prev => ({
      ...prev,
      [themeId]: prev[themeId] ? 0 : 1
    }));
  };

  const nextCard = () => {
    setActiveIndex((prev) => (prev + 1) % themeData.length);
  };

  const prevCard = () => {
    setActiveIndex((prev) => (prev - 1 + themeData.length) % themeData.length);
  };


  return (
    <div className="pujo-theme-container">
      <div className="pujo-theme-header">
        <h2 className="pujo-theme-title">পুজো থিম</h2>
        <div className="pujo-theme-underline"></div>
      </div>
      
      <div className="pujo-theme-stack">
        {themeData.map((theme, index) => {
          let position = 'hidden';
          if (index === activeIndex) position = 'active';
          else if (index === (activeIndex - 1 + themeData.length) % themeData.length) position = 'prev';
          else if (index === (activeIndex + 1) % themeData.length) position = 'next';

          return (
            <div key={theme.id} className={`pujo-theme-card ${position} ${theme.colorScheme ? 'theme-' + theme.colorScheme : ''}`}>
              <img src={theme.images ? theme.images[cardImageIndexes[theme.id] || 0] : theme.image} alt={theme.title} className="pujo-theme-img" />
              <div className="pujo-theme-gradient"></div>
              <div className="pujo-theme-info">
                <div className="pujo-theme-pagination">
                  <span className={`dot ${(cardImageIndexes[theme.id] || 0) === 0 ? 'active-dot' : ''}`}></span>
                  <span className={`dot ${(cardImageIndexes[theme.id] || 0) === 1 ? 'active-dot' : ''}`}></span>
                </div>
                <h3>
                    {theme.title}
                    <span 
    onClick={(e) => toggleCardImage(e, theme.id, theme.images)}
    style={{ cursor: theme.images && theme.images.length > 1 ? 'pointer' : 'default', display: 'inline-flex', verticalAlign: 'middle', marginLeft: '6px', fontSize: '16px', fontWeight: 'normal', color: 'white', transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
  >&gt;</span>
                  </h3>
                <p>{theme.subtitles ? theme.subtitles[cardImageIndexes[theme.id] || 0] : theme.subtitle}</p>
                <div className="pujo-explore-action">
                  <button onClick={prevCard} className="arrow-btn">&lt;</button>
                  <span className="explore-text">এক্সপ্লোর করুন</span>
                  <button onClick={nextCard} className="arrow-btn">&gt;</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}