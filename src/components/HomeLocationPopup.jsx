import React, { useEffect, useRef, useState } from 'react';
import { Search, Crosshair } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './HomeLocationPopup.css';

// Fix for default marker icons in Leaflet when using Webpack/Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const pandalLocations = [
  { name: 'Sree Bhumi Sporting Club', lat: 22.5958, lng: 88.3815 },
  { name: 'Ahiritola Itwaribazar', lat: 22.5979, lng: 88.3639 },
  { name: 'College Square', lat: 22.5736, lng: 88.3653 },
  { name: 'Bagbazar Sarbojanin', lat: 22.6025, lng: 88.3712 },
  { name: 'Ekdalia Evergreen', lat: 22.5181, lng: 88.3695 },
  { name: 'Dumdum', lat: 22.6224, lng: 88.4115 }
];

const HomeLocationPopup = ({ onClose, onSetHome }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      // Initialize Leaflet Map inside the exact target box dimensions
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([22.5726, 88.3639], 13); // Centered on Kolkata

      // Match the app's dark theme using dark_all CartoDB tiles, authenticated to remove watermark
      const apiKey = "cb1_2zpy_1_5578b74846ef709b32860fd7";
      L.tileLayer(`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${apiKey}`, {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      mapInstanceRef.current = map;

      // Allow users to click anywhere on the map to drop a pin and select location
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        updateMarker(lat, lng, 'Custom Selected Location');
      });

      // Let the map resize properly to avoid grey tiles inside modals
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const updateMarker = (lat, lng, title) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng]).addTo(map);
    }

    map.setView([lat, lng], 15, { animate: true });
    setSelectedLocation({ lat, lng, name: title });
  };

  // Handler for "Use my current location" button
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        updateMarker(lat, lng, 'My Current Location');
      },
      () => {
        alert('Unable to retrieve your location. Please check permission settings.');
      }
    );
  };

  // Handler for Search bar ("Go" button)
  const handleSearchGo = (e) => {
    e.preventDefault();
    const queryLower = searchQuery.toLowerCase().trim();
    const found = pandalLocations.find(p => p.name.toLowerCase().includes(queryLower));

    if (found) {
      updateMarker(found.lat, found.lng, found.name);
    } else {
      alert('Location or pandal not found in the list. Try searching another landmark.');
    }
  };

  // Final confirmation to set home location
  const handleConfirmHome = () => {
    if (!selectedLocation) {
      alert('Please select a location via GPS, search, or by clicking on the map first.');
      return;
    }
    if (onSetHome) onSetHome(selectedLocation);
    alert(`Home location successfully set to: ${selectedLocation.name}`);
    onClose();
  };

  return (
    <div className="home-loc-overlay" onClick={(e) => { e.stopPropagation(); onClose(); }}>
      <div className="home-loc-content" onClick={(e) => e.stopPropagation()}>
        <div className="home-loc-header">
          <h2 className="home-loc-title">Set home location</h2>
          <p className="home-loc-subtitle">Search or drag the map to centre the pin</p>
        </div>

        <form className="home-loc-search-box" onSubmit={handleSearchGo}>
          <Search size={20} className="home-loc-search-icon" />
          <input 
            type="text" 
            placeholder="Search area or landmark" 
            className="home-loc-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="home-loc-go-btn">Go</button>
        </form>

        <button type="button" className="home-loc-current-btn" onClick={handleUseCurrentLocation}>
          <Crosshair size={20} />
          Use my current location
        </button>

        <div 
          ref={mapRef}
          className="home-loc-map-area" 
          style={{ position: 'relative' }}
        >
        </div>

        <div className="home-loc-footer">
          <button type="button" className="home-loc-save-btn" onClick={handleConfirmHome}>
            Set as home location
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeLocationPopup;
