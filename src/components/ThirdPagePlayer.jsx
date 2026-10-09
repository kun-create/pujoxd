import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, Power } from 'lucide-react';
import SongListPopup, { mahalayaSongs } from './SongListPopup';
import './ThirdPagePlayer.css';

const defaultSongs = [
  {
    id: 'tp-2',
    title: 'Mahishasura Mardini',
    artist: 'Birendra Krishna Bhadra',
    cover: '/3rdpageplaylistlogo.png',
    duration: '89:13',
    src: '/songs/mahalaya.mp3'
  },
  {
    id: 'tp-1',
    title: 'Bajlo Tomar Aalor Benu',
    artist: 'Birendra Krishna Bhadra',
    cover: '/3rdpageplaylistlogo.png',
    duration: '4:41',
    src: '/songs/bajlo-tomar-aalor-benu-with-narration.mp3'
  },
  {
    id: 'tp-3',
    title: 'Bajlo Tomar Aalor Benu',
    artist: 'Supriti Ghosh',
    cover: '/3rdpageplaylistlogo.png',
    duration: '3:40',
    src: '/songs/bajlo-tomar-aalor-benu-supriti.mp3'
  },
  {
    id: 'tp-4',
    title: 'Agomoni Aalo',
    artist: 'Jayati Chakraborty',
    cover: '/agomoni-aalo-cover.jpg',
    duration: '5:40',
    src: '/songs/agomoni-aalo.mp3'
  }
];

const combinedPlaylist = [...defaultSongs];
mahalayaSongs.forEach(song => {
  if (!combinedPlaylist.find(s => s.src === song.src)) {
    combinedPlaylist.push({ ...song, cover: '/3rdpageplaylistlogo.png' });
  }
});

combinedPlaylist.splice(2, 2);

const ThirdPagePlayer = ({ playerId = 'third-page-mobile' }) => {
  const [songIndex, setSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [favoriteSongs, setFavoriteSongs] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const audioRef = useRef(null);
  const currentSong = combinedPlaylist[songIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        window.dispatchEvent(new CustomEvent('player-play', { detail: playerId }));
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            const forcePlay = (e) => {
              if (e && !e.isTrusted) return;
              if (isPlaying && audioRef.current && audioRef.current.paused) {
                audioRef.current.play().catch(e => console.log("Still blocked", e));
              }
              document.removeEventListener('click', forcePlay);
              document.removeEventListener('touchstart', forcePlay);
              document.removeEventListener('mousedown', forcePlay);
              document.removeEventListener('keydown', forcePlay);
              window.removeEventListener('scroll', forcePlay);
            };
            document.addEventListener('click', forcePlay);
            document.addEventListener('touchstart', forcePlay, { passive: true });
            document.addEventListener('mousedown', forcePlay, { passive: true });
            document.addEventListener('keydown', forcePlay, { passive: true });
            window.addEventListener('scroll', forcePlay, { passive: true });
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, songIndex]);

  useEffect(() => {
    const handleGlobalPlay = (e) => {
      if (e.detail !== playerId) {
        setIsPlaying(false);
      }
    };
    window.addEventListener('player-play', handleGlobalPlay);
    return () => window.removeEventListener('player-play', handleGlobalPlay);
  }, [playerId]);

  useEffect(() => {
    const handleAutoPlay = () => {
      const isMobile = window.innerWidth <= 768;
      if ((isMobile && playerId === 'third-page-mobile') || (!isMobile && playerId === 'third-page-desktop')) {
        setSongIndex(0);
        setIsPlaying(true);
      }
    };
    window.addEventListener('mahalaya-auto-play', handleAutoPlay);
    return () => window.removeEventListener('mahalaya-auto-play', handleAutoPlay);
  }, [playerId]);

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    handleNext();
  };

  const handlePrev = () => {
    setSongIndex(prev => (prev === 0 ? combinedPlaylist.length - 1 : prev - 1));
    setIsPlaying(true);
  };

  const handleNext = () => {
    setSongIndex(prev => (prev === combinedPlaylist.length - 1 ? 0 : prev + 1));
    setIsPlaying(true);
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    if (width > 0 && duration > 0 && audioRef.current) {
      const newTime = (clickX / width) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSelectSong = (song) => {
    const index = combinedPlaylist.findIndex(s => s.src === song.src);
    if (index !== -1) {
      setSongIndex(index);
      setIsPlaying(true);
    }
  };

  return (
    <>
      <div className="tp-player-wrapper">
        <audio
          ref={audioRef}
          src={currentSong.src}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />

        <div className="tp-css-radio">
          
          <div 
            className="tp-css-radio-speaker"
            onClick={() => setShowPopup(true)}
          >
            <div className="tp-css-radio-mesh"></div>
            <img 
              src={currentSong.cover} 
              alt={currentSong.title} 
              className={`tp-css-radio-portrait ${isPlaying ? 'spinning' : ''}`} 
            />
          </div>

          <div className="tp-css-radio-right">
            
            <div className="tp-css-radio-display" style={{ '--progress': `${progressPercent}%` }} onClick={handleSeek}>
              <div className="tp-css-radio-track-title">{currentSong.title}</div>
              <div className="tp-css-radio-artist">{currentSong.artist}</div>
            </div>

            <div className="tp-css-radio-controls">
              <button className="tp-css-radio-btn" onClick={handlePrev} aria-label="Previous">
                <SkipBack size={16} color="#fff" />
              </button>
              <button className="tp-css-radio-btn tp-play-btn" onClick={togglePlay} aria-label="Play/Pause">
                <Power size={16} color={isPlaying ? "#4cd137" : "#fff"} strokeWidth={3} />
              </button>
              <button className="tp-css-radio-btn" onClick={handleNext} aria-label="Next">
                <SkipForward size={16} color="#fff" />
              </button>
            </div>

          </div>
        </div>
      </div>

      {showPopup && (
        <div className="tp-popup-layer">
          <SongListPopup
            onClose={() => setShowPopup(false)}
            onSelectSong={handleSelectSong}
            currentSong={currentSong}
            pandalList={combinedPlaylist}
            favoriteList={favoriteSongs}
            customTitle="মহালয়া ও গান"
hideTabs={true}
            className="tp-glass-popup-overlay"
          />
        </div>
      )}
    </>
  );
};

export default ThirdPagePlayer;
