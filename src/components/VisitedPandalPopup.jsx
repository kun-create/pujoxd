import React, { useState, useEffect } from 'react';
import { X, Edit } from 'lucide-react';
import './RequestPandalPopup.css';
import { allPujos } from '../data/allPujos.js';

const VisitedPandalPopup = ({ onClose }) => {
  const [visitedPandals, setVisitedPandals] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('visitedPandals');
      if (stored) {
        setVisitedPandals(JSON.parse(stored));
      }
    } catch(e) {}
  }, []);

  const handleClearAll = () => {
    localStorage.setItem('visitedPandals', JSON.stringify([]));
    setVisitedPandals([]);
    window.dispatchEvent(new Event('visitedPandalsUpdated'));
  };

  const handleRemoveItem = (indexToRemove) => {
    const next = visitedPandals.filter((_, i) => i !== indexToRemove);
    setVisitedPandals(next);
    localStorage.setItem('visitedPandals', JSON.stringify(next));
    window.dispatchEvent(new Event('visitedPandalsUpdated'));
    if (next.length === 0) {
      setIsEditing(false);
    }
  };

  return (
    <div className="req-pandal-overlay" onClick={(e) => { e.stopPropagation(); onClose(); }}>
      <div className="req-pandal-content" onClick={(e) => e.stopPropagation()}>
        <div className="req-pandal-header">
          <div className="req-pandal-header-top">
            <h2 className="req-pandal-title">Visited Pandal</h2>
            <button className="req-pandal-close-icon-btn" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="req-pandal-subtitle">In case you have forgotten</p>
            {visitedPandals.length > 0 && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {isEditing ? (
                  <span onClick={() => setIsEditing(false)} style={{ color: '#b45309', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
                    Done
                  </span>
                ) : (
                  <>
                    <span onClick={handleClearAll} style={{ color: '#ffffff', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>Clear all</span>
                    <span onClick={() => setIsEditing(true)} style={{ color: '#b45309', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                      Edit stops <Edit size={12} strokeWidth={2.5} />
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="req-pandal-body" style={{ paddingBottom: '32px' }}>
          {visitedPandals.length === 0 ? (
            <div style={{ color: 'rgba(245, 230, 211, 0.6)', fontSize: '14px', textAlign: 'center', marginTop: '20px' }}>
              You haven't visited any pandals yet.
            </div>
          ) : (
            <ul className="hide-scrollbar" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '330px', overflowY: 'auto' }}>
              {visitedPandals.map((item, index) => {
                  const itemName = typeof item === 'object' ? item.name : item;
                  const pujoObj = allPujos.find(p => p.name === itemName || p.id === itemName);
                  const subtitle = pujoObj ? (pujoObj.address ? pujoObj.address : pujoObj.category ? `${pujoObj.category}` : 'Pandal') : 'Pandal';
                  return (
                  <li key={index} style={{ backgroundColor: '#2c2522', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ backgroundColor: '#fef3c7', color: '#7c2d12', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
                      {index + 1}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: '#f5e6d3', fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{itemName}</span>
                      <span style={{ color: 'rgba(245, 230, 211, 0.6)', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>{subtitle}</span>
                    </div>

                    {typeof item === 'object' && item.time && (
                      <span style={{ color: 'rgba(245, 230, 211, 0.6)', fontSize: '13px' }}>
                        { '{' + item.time + '}' }
                      </span>
                    )}

                    {isEditing && (
                      <button 
                        onClick={() => handleRemoveItem(index)}
                        style={{ 
                          backgroundColor: '#fef3c7', 
                          border: 'none', 
                          width: '22px', 
                          height: '22px', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          cursor: 'pointer',
                          color: '#7c2d12',
                          flexShrink: 0,
                          marginLeft: 'auto'
                        }}
                        aria-label="Remove item"
                      >
                        <X size={14} strokeWidth={3} />
                      </button>
                    )}
                  </li>
                  );
                })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitedPandalPopup;
