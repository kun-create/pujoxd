import React, { useState } from 'react';
import { ChevronLeft, ChevronDown, Pencil } from 'lucide-react';
import { GenderPickerModal, DatePickerModal } from './CustomPickers';
import './EditProfilePopup.css';

const EditProfilePopup = ({ onClose, avatarSrc, setAvatarSrc, initialName = 'USER', initialEmail = 'user@gmail.com' }) => {
  const [fullName, setFullName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [mobile, setMobile] = useState('');
  const [gender, setGender] = useState('Prefer not to say');
  const [dob, setDob] = useState('');
  
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(avatarSrc);
  
  const handleGoogleSync = async () => {
    try {
      // Force OAuth popup since OneTap prompt() can be suppressed by cooldowns
      if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: '49194794217-itqs33ak7u66mgui0pj4tj9bd253gebr.apps.googleusercontent.com',
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
          callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              // Fetch profile data using the access token
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const payload = await res.json();
                
                if (payload.picture && !payload.picture.includes('default-user')) {
                  setCurrentAvatar(payload.picture);
                  if (setAvatarSrc) setAvatarSrc(payload.picture);
                  const storedUserStr = localStorage.getItem('pujoUser');
                  if (storedUserStr) {
                    const storedUser = JSON.parse(storedUserStr);
                    storedUser.picture = payload.picture;
                    localStorage.setItem('pujoUser', JSON.stringify(storedUser));
                  } else {
                    localStorage.setItem('pujoUser', JSON.stringify({
                      firstname: payload.given_name || '',
                      lastname: payload.family_name || '',
                      email: payload.email || '',
                      picture: payload.picture,
                      isGoogle: true
                    }));
                  }
                } else {
                  // Revert to default website cartoon avatar
                  setCurrentAvatar(avatarSrc);
                  if (setAvatarSrc) setAvatarSrc(avatarSrc);
                  const storedUserStr = localStorage.getItem('pujoUser');
                  if (storedUserStr) {
                    const storedUser = JSON.parse(storedUserStr);
                    delete storedUser.picture;
                    localStorage.setItem('pujoUser', JSON.stringify(storedUser));
                  }
                }
              } catch(e) {
                console.error('Failed to fetch userinfo from Google', e);
              }
            }
          },
        });
        client.requestAccessToken();
      }
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="edit-profile-overlay fade-in" onClick={(e) => { e.stopPropagation(); onClose(); }}>
      <div 
        className="edit-profile-content slide-up" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="edit-profile-header">
          <button className="edit-profile-back-btn" onClick={onClose}>
            <ChevronLeft size={24} />
          </button>
          <h2 className="edit-profile-title">Edit profile</h2>
          <button className="edit-profile-save-btn-top" onClick={onClose}>
            Save
          </button>
        </div>

        <div className="edit-profile-scroll-area">
          <div className="edit-profile-avatar-section">
            <div className="edit-profile-avatar-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
              <img src={currentAvatar} alt="User Avatar" className="edit-profile-avatar" onError={(e) => {
                // If it fails to load, fall back to the safe avatarSrc we started with
                setCurrentAvatar(avatarSrc);
                if (setAvatarSrc) setAvatarSrc(avatarSrc);
              }} />
              <div style={{ position: 'absolute', bottom: '0', right: '0', background: '#33221c', border: '1px solid #ff8a00', borderRadius: '50%', padding: '4px', display: 'flex', cursor: 'pointer' }} onClick={handleGoogleSync}>
                <Pencil size={12} color="#ffb366" />
              </div>
            </div>
            <p className="edit-profile-avatar-text" onClick={handleGoogleSync} style={{ cursor: 'pointer' }}>Photo from your Google account</p>
          </div>

          <div className="edit-profile-form">
            <div className="edit-profile-field">
              <label>Full name</label>
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
              />
            </div>

            <div className="edit-profile-field">
              <label>Email</label>
              <input 
                type="email" 
                value={email} 
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>

            <div className="edit-profile-field">
              <label>Mobile number</label>
              <input 
                type="tel" 
                value={mobile} 
                onChange={(e) => setMobile(e.target.value)} 
              />
            </div>

            <div className="edit-profile-field">
              <label>Gender</label>
              <div className="dropdown-input-wrapper" onClick={() => setShowGenderPicker(true)}>
                <input 
                  type="text" 
                  value={gender} 
                  readOnly 
                  style={{ cursor: 'pointer' }}
                />
                <div className="dropdown-icon">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            <div className="edit-profile-field">
              <label>Date of birth</label>
              <div className="dropdown-input-wrapper" onClick={() => setShowDatePicker(true)}>
                <input 
                  type="text" 
                  value={dob} 
                  readOnly 
                  style={{ cursor: 'pointer' }}
                />
                <div className="dropdown-icon">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>
          </div>

          <button className="edit-profile-save-btn-bottom" onClick={onClose}>
            Save changes
          </button>
        </div>
      </div>
      
      {showGenderPicker && (
        <GenderPickerModal 
          selected={gender} 
          onSelect={setGender} 
          onClose={() => setShowGenderPicker(false)} 
        />
      )}
      {showDatePicker && (
        <DatePickerModal 
          initialDate={dob} 
          onSelect={setDob} 
          onClose={() => setShowDatePicker(false)} 
        />
      )}
    </div>
  );
};

export default EditProfilePopup;
