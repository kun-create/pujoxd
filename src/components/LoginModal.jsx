import React, { useState, useEffect } from 'react';

const LoginModal = ({ onLogin }) => {
  const [view, setView] = useState('login'); // 'login', 'register', 'confirm_email', 'verify_code', 'reset_password'
  
  // Login states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Password visibility states for reset
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Browser History Back Button Support
  useEffect(() => {
    if (view === 'register') {
      fetch('/api/auth/reserved-names')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setReservedNames(data.reservedNames);
            setReservedEmails(data.reservedEmails || []);
          }
        })
        .catch(console.error);
    }
  }, [view]);

  useEffect(() => {
    window.history.replaceState({ modalView: 'login' }, '', '');
    const handlePopState = (event) => {
      if (event.state && event.state.modalView) {
          setView(event.state.modalView);
        } else {
          setView('login');
        }
    };
    window.addEventListener('popstate', handlePopState);
  return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    if (view === 'verify_success') {
      const timer = setTimeout(() => {
        onLogin();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [view, onLogin]);

  const navigateView = (newView) => {
    window.history.pushState({ modalView: newView }, '', '');
    setView(newView);
  };


  const [reservedNames, setReservedNames] = useState([]);
  const [reservedEmails, setReservedEmails] = useState([]);
  const [regFirstname, setRegFirstname] = useState('');
  const [regLastname, setRegLastname] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regConfirmEmail, setRegConfirmEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regGender, setRegGender] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '']);

  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);



  
  const handleResetRequestSubmit = async (e) => {
    e.preventDefault();
    if (resetPassword.length < 8 || resetPassword !== resetConfirmPassword) return;
    try {
      const response = await fetch('/api/auth/reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await response.json();
      if (data.rateLimited) return; // Do nothing if limit reached
      if (data.success) {
        setCodeDigits(['', '', '', '', '']); // Clear digits for safety
        setView('verify_reset_code');
      } else {
        setView('reset_error');
      }
    } catch (err) {
      setView('reset_error');
    }
  };

  const handleResetVerifySubmit = async (e) => {
    e.preventDefault();
    const fullCode = codeDigits.join('');
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, code: fullCode, newPassword: resetPassword })
      });
      const data = await response.json();
      if (data.success) {
        setView('reset_success');
      } else {
        setView('verify_error');
      }
    } catch (err) {
      setView('verify_error');
    }
  };


  const handleGoogleLogin = () => {
    try {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.initialize({
          client_id: '49194794217-itqs33ak7u66mgui0pj4tj9bd253gebr.apps.googleusercontent.com', // Replace with your actual Google Client ID
          callback: (response) => {
              console.log("Encoded JWT ID token: " + response.credential);
              try {
                const payload = JSON.parse(atob(response.credential.split('.')[1]));
                const userObj = {
                  firstname: payload.given_name || '',
                  lastname: payload.family_name || '',
                  email: payload.email || '',
                  picture: payload.picture || '',
                  isGoogle: true
                };
                localStorage.setItem('pujoUser', JSON.stringify(userObj));
              } catch(e) {
                console.error('Failed to parse Google JWT');
              }
              onLogin(); 
            }
        });
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('Google prompt could not be displayed or was skipped. Reason:', notification.getNotDisplayedReason() || notification.getSkippedReason());
          }
        });
      } else {
        console.warn("Google Identity Services script not loaded.");
      }
    } catch (err) {
      console.error("Google Login Error:", err);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setView('login_error');
      return;
    }
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('pujoUser', JSON.stringify(data.user));
          setView('verify_success');
      } else {
        setView('login_error');
      }
    } catch (err) {
      console.error(err);
      setView('login_error');
    }
  };

  
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    const fullCode = codeDigits.join('');
    if (fullCode.length < 5) {
      alert('Please enter all 5 digits.');
      return;
    }
    
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, code: fullCode })
      });
      const data = await response.json();
      if (data.success || data.error === 'User is already verified.') {
          setView('verify_success');
        } else {
          setView('verify_error');
        }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    }
  };
  

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (regEmail !== regConfirmEmail || regPassword !== regConfirmPassword) {
      alert("Please ensure email and password match their confirmations.");
      return;
    }
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstname: regFirstname,
          lastname: regLastname,
          email: regEmail,
          password: regPassword,
          dob: regDob,
          gender: regGender
        })
      });
      const data = await response.json();
        if (data.rateLimited) return;
        if (data.success) {
            console.log('%c[DEVELOPER FALLBACK]', 'color: #ffb366; font-size: 16px; font-weight: bold;');
          console.log('%cGenerated 5-Digit Verification Code: ' + data.devCode, 'color: #34A853; font-size: 14px; font-weight: bold;');
          navigateView('confirm_email');
        } else {
          alert(data.error || 'Registration failed');
        }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    }
  };

  const calculateAge = (dobString) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };
  const userAge = calculateAge(regDob);
  const isUnderage = userAge !== null && userAge < 17;

  const isFirstnameTaken = regFirstname && reservedNames.includes(regFirstname.toLowerCase().trim());
  const isLastnameTaken = regLastname && reservedNames.includes(regLastname.toLowerCase().trim());
  const isEmailTaken = regEmail && reservedEmails.includes(regEmail.toLowerCase().trim());
  const isConfirmEmailTaken = regConfirmEmail && reservedEmails.includes(regConfirmEmail.toLowerCase().trim());

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: '#1f130e', // Dark background to match app
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999999,
      fontFamily: "'Outfit', sans-serif",
      overflowY: 'auto',
      padding: '20px 0'
    }}>
      <style>
        {`
          @keyframes zoomInLogo2 {
            0% { transform: scale(0.2); opacity: 0; }
            70% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: transparent; margin: 25px 0; }
          ::-webkit-scrollbar-thumb { background: #4a2f22; border-radius: 10px; }
        `}
      </style>
      
      <div style={{
        width: '90%',
        maxWidth: '400px',
        background: 'linear-gradient(135deg, #381f14, #1a0f0a)',
        borderRadius: '32px',
        padding: '3px',
        position: 'relative',
        boxShadow: '0 24px 50px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 107, 0, 0.15)',
        margin: 'auto'
      }}>
        {/* Gradient Border Wrapper */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(135deg, #ff8a00, #e52e71, #ff8a00)',
          borderRadius: '32px',
          zIndex: 0
        }}></div>
        
        {/* Inner Card */}
        <div style={{
          backgroundColor: '#26160f',
          borderRadius: '30px',
          padding: '19px 20px',
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxHeight: '85vh',
          overflowY: 'auto'
        }}>
          {view === 'login' && (
            <>
              {/* LOGIN VIEW */}
              <img src="/log-in-logo2.png" alt="Welcome" style={{ height: '18px', marginBottom: '-24px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))', position: 'relative', zIndex: 2, animation: 'zoomInLogo2 0.8s ease-out forwards' }} />
              <img src="/log-in-logo1.png" alt="Pujo Porikroma" style={{ width: '200px', height: 'auto', marginBottom: '-1px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))' }} />
              <h2 style={{
                color: '#ffffff',
                fontSize: '32px',
                fontWeight: '700',
                margin: '0 0 6px 0',
                textAlign: 'center'
              }}>Login</h2>

              <form onSubmit={handleLoginSubmit} style={{ width: '100%' }}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', color: '#ffb366', fontSize: '15px', fontWeight: '500', marginBottom: '4px' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                      <circle cx="12" cy="12" r="4"></circle>
                      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path>
                    </svg>
                    Username <span style={{ color: '#8c7366', marginLeft: '4px', fontWeight: '400' }}>/ Email</span>
                  </label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={inputStyle} 
                  />
                </div>

                <div style={{ marginBottom: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', color: '#ffb366', fontSize: '15px', fontWeight: '500', marginBottom: '4px' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Password
                  </label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle} 
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                  <button type="button" onClick={() => navigateView('reset_password')} style={{ color: '#ffffff', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
                    Forgot Password ?
                  </button>
                </div>

                <button type="submit" style={{
                  width: '100%',
                  backgroundColor: '#ff6b00',
                  background: 'linear-gradient(to right, #ff8a00, #ff5e00)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '12px',
                  boxShadow: '0 4px 16px rgba(255, 107, 0, 0.4)'
                }}>
                  Sign in
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '12px' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#4a2f22' }}></div>
                <div style={{ color: '#8c7366', padding: '0 12px', fontSize: '14px' }}>Login with social accounts</div>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#4a2f22' }}></div>
              </div>

              <button type="button" onClick={handleGoogleLogin} style={{
                width: '100%',
                backgroundColor: '#ffffff',
                color: '#000000',
                border: 'none',
                borderRadius: '12px',
                padding: '10px',
                fontSize: '15px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginBottom: '6px'
              }}>
                <svg viewBox="0 0 24 24" width="20" height="20" style={{ marginRight: '10px' }}>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div style={{ color: '#8c7366', fontSize: '15px' }}>
                Don't have an account? <button type="button" onClick={() => navigateView('register')} style={{ color: '#ffffff', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', padding: 0 }}>Sign up</button> <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: '400' }}>or as a </span><button type="button" onClick={() => { localStorage.removeItem('pujoUser'); onLogin(); }} style={{ color: '#ffffff', fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', padding: 0 }}>Guest</button>
              </div>
            </>
          )}

          {view === 'register' && (
            <>
              {/* REGISTER VIEW */}
              <h2 style={{
                color: '#ffffff',
                fontSize: '28px',
                fontWeight: '700',
                margin: '-2px 0 6px 0',
                      textAlign: 'center'
                    }}>Register</h2>
              
              <div style={{ color: '#8c7366', fontSize: '14px', marginBottom: '5px', textAlign: 'center' }}>
                      Signup now and get full access to our site.
              </div>

              <form onSubmit={handleRegisterSubmit} style={{ width: '100%' }}>
                
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'flex', color: '#ffb366', fontSize: '13px', fontWeight: '500', marginBottom: '4px', justifyContent: 'space-between', alignItems: 'center' }}>Firstname {isFirstnameTaken && <span style={{ color: '#ff3333', fontSize: '11px', marginLeft: '5px' }}>Already taken</span>}</label>
                    <input type="text" value={regFirstname} onChange={(e) => setRegFirstname(e.target.value)} required style={{...inputStyle, borderColor: isFirstnameTaken ? '#ff3333' : inputStyle.borderColor}} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'flex', color: '#ffb366', fontSize: '13px', fontWeight: '500', marginBottom: '4px', justifyContent: 'space-between', alignItems: 'center' }}>Lastname {isLastnameTaken && <span style={{ color: '#ff3333', fontSize: '11px', marginLeft: '5px' }}>Already taken</span>}</label>
                    <input type="text" value={regLastname} onChange={(e) => setRegLastname(e.target.value)} required style={{...inputStyle, borderColor: isLastnameTaken ? '#ff3333' : inputStyle.borderColor}} />
                  </div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'flex', color: '#ffb366', fontSize: '13px', fontWeight: '500', marginBottom: '4px', justifyContent: 'space-between', alignItems: 'center' }}><span>Email address</span> {isEmailTaken && <span style={{ color: '#ff3333', fontSize: '11px', marginLeft: '5px' }}>Email exist</span>}</label>
                  <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required style={{...inputStyle, borderColor: isEmailTaken ? '#ff3333' : inputStyle.borderColor}} />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', color: '#ffb366', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
                        Confirm Email address
                        {regConfirmEmail && regEmail !== regConfirmEmail && (
                          <span style={{ color: '#ff4d4d', fontSize: '12px', marginLeft: '8px' }}>not matched</span>
                        )}
                      </label>
                    <input type="email" value={regConfirmEmail} onChange={(e) => setRegConfirmEmail(e.target.value)} required style={{...inputStyle, borderColor: isConfirmEmailTaken ? '#ff3333' : inputStyle.borderColor}} />
                </div>

                                  <div style={{ marginBottom: '10px', position: 'relative' }}>
                      <label style={{ display: 'flex', alignItems: 'center', color: '#ffb366', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
                        Password
                        {regPassword.length > 0 && regPassword.length < 8 && (
                          <span style={{ color: '#ff4d4d', fontSize: '12px', marginLeft: '8px' }}>minimum 8 characters</span>
                        )}
                      </label>
                    <input type={showRegPassword ? "text" : "password"} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required style={{...inputStyle, paddingRight: '40px'}} />
                    <button type="button" onClick={() => {
                      if (!showRegPassword) {
                        setShowRegPassword(true);
                        setTimeout(() => setShowRegPassword(false), 10000);
                      } else {
                        setShowRegPassword(false);
                      }
                    }} style={{ position: 'absolute', right: '12px', top: '28px', background: 'none', border: 'none', color: '#8c7366', cursor: 'pointer', padding: 0 }}>
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        {showRegPassword ? (
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        ) : (
                          <>
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                          </>
                        )}
                        {showRegPassword && <circle cx="12" cy="12" r="3"></circle>}
                      </svg>
                    </button>
                  </div>
                
                                  <div style={{ marginBottom: '10px', position: 'relative' }}>
                      <label style={{ display: 'flex', alignItems: 'center', color: '#ffb366', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
                        Confirm password
                        {regConfirmPassword.length > 0 && regConfirmPassword.length < 8 && (
                          <span style={{ color: '#ff4d4d', fontSize: '12px', marginLeft: '8px' }}>minimum 8 characters</span>
                        )}
                        {regConfirmPassword.length > 0 && regPassword !== regConfirmPassword && (
                          <span style={{ color: '#ff4d4d', fontSize: '12px', marginLeft: '8px' }}>not matched</span>
                        )}
                      </label>
                    <input type={showRegConfirmPassword ? "text" : "password"} value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} required style={{...inputStyle, paddingRight: '40px'}} />
                    <button type="button" onClick={() => {
                      if (!showRegConfirmPassword) {
                        setShowRegConfirmPassword(true);
                        setTimeout(() => setShowRegConfirmPassword(false), 10000);
                      } else {
                        setShowRegConfirmPassword(false);
                      }
                    }} style={{ position: 'absolute', right: '12px', top: '28px', background: 'none', border: 'none', color: '#8c7366', cursor: 'pointer', padding: 0 }}>
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        {showRegConfirmPassword ? (
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        ) : (
                          <>
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                          </>
                        )}
                        {showRegConfirmPassword && <circle cx="12" cy="12" r="3"></circle>}
                      </svg>
                    </button>
                  </div>

                <div style={{ marginBottom: '11px' }}>
                    <label style={{ display: 'flex', color: '#ffb366', fontSize: '13px', fontWeight: '500', marginBottom: '4px', justifyContent: 'space-between', alignItems: 'center' }}>Date of Birth {isUnderage && <span style={{ color: '#ff3333', fontSize: '11px', marginLeft: '5px' }}>Not applicable</span>}</label>
                  <input type="date" value={regDob} onChange={(e) => setRegDob(e.target.value)} required style={{...inputStyle, colorScheme: 'dark', borderColor: isUnderage ? '#ff3333' : inputStyle.borderColor}} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', gap: '16px' }}>
                  <span style={{ color: '#ffb366', fontSize: '14px', fontWeight: '500' }}>Gender:</span>
                  <label style={{ color: '#ffffff', fontSize: '14px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input type="radio" name="gender" value="male" required checked={regGender === 'male'} onChange={(e) => setRegGender(e.target.value)} style={{ marginRight: '6px' }} />
                    Male
                  </label>
                  <label style={{ color: '#ffffff', fontSize: '14px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input type="radio" name="gender" value="female" required checked={regGender === 'female'} onChange={(e) => setRegGender(e.target.value)} style={{ marginRight: '6px' }} />
                    Female
                  </label>
                </div>

                <button type="submit" style={{
                  width: '100%',
                  backgroundColor: '#ff6b00',
                  background: 'linear-gradient(to right, #ff8a00, #ff5e00)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                      marginBottom: '9px',
                      boxShadow: '0 4px 16px rgba(255, 107, 0, 0.4)'
                    }}>
                      Submit
                    </button>
              </form>

              <div style={{ color: '#8c7366', fontSize: '14px', marginBottom: '-1px' }}>
                  Already have an acount ? <button type="button" onClick={() => navigateView('login')} style={{ color: '#ffffff', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', padding: 0 }}>Signin</button>
              </div>
            </>
          )}

          {view === 'confirm_email' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0' }}>
              {/* CONFIRM EMAIL VIEW */}
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.4)',
                border: '2px solid #ff8a00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '2px',
                  marginTop: '-3px',
                boxShadow: '0 0 20px rgba(255, 107, 0, 0.2)'
              }}>
                <svg viewBox="0 0 24 24" width="36" height="36" stroke="#ffb366" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>

              <h2 style={{
                color: '#ffffff',
                fontSize: '28px',
                fontWeight: '700',
                margin: '0 0 3px 0',
                  textAlign: 'center'
                }}>Check your email</h2>

              <p style={{
                color: '#8c7366',
                fontSize: '15px',
                textAlign: 'center',
                lineHeight: '1.5',
                margin: '0 0 3px 0',
                  padding: '0 10px'
                }}>
                  Your unique code has been sent. Please check your email now.
              </p>

              <button type="button" onClick={() => navigateView('verify_code')} style={{
                width: '100%',
                backgroundColor: '#ff6b00',
                background: 'linear-gradient(to right, #ff8a00, #ff5e00)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '24px',
                padding: '12px',
                  fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(255, 107, 0, 0.4)'
              }}>
                Enter Code
              </button>
            </div>
          )}

          {view === 'verify_code' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0', width: '100%' }}>
              <h2 style={{
                color: '#ffffff',
                fontSize: '28px',
                fontWeight: '700',
                margin: '-1px 0 0 0',
                  textAlign: 'center'
                }}>Verify your account</h2>

              <p style={{
                color: '#8c7366',
                fontSize: '14px',
                textAlign: 'center',
                lineHeight: '1.5',
                margin: '0 0 7px 0',
                  padding: '0 10px'
                }}>
                  Please enter the 5-digit verification code we sent to your registered email to proceed securely.
              </p>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', width: '100%', marginBottom: '8px' }}>
                {[...Array(5)].map((_, i) => (
                  <input 
                    key={i}
                    type="text"
                    maxLength="1"
                    value={codeDigits[i]}
                    onChange={(e) => {
                      const newDigits = [...codeDigits];
                      newDigits[i] = e.target.value;
                      setCodeDigits(newDigits);
                      if (e.target.value && i < 4) {
                        const nextInput = e.target.parentElement.children[i + 1];
                        if (nextInput) nextInput.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !codeDigits[i] && i > 0) {
                        const prevInput = e.target.parentElement.children[i - 1];
                        if (prevInput) prevInput.focus();
                      }
                    }}
                    style={{
                      width: '45px',
                      height: '55px',
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      border: '1px solid #4a2f22',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '24px',
                      fontWeight: '600',
                      textAlign: 'center',
                      outline: 'none',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  />
                ))}
              </div>

              <button type="button" onClick={view === 'verify_code' ? handleVerifySubmit : onLogin} style={{
                  width: '100%',
                  backgroundColor: '#ff6b00',
                background: 'linear-gradient(to right, #ff8a00, #ff5e00)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '24px',
                padding: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '12px',
                  boxShadow: '0 4px 16px rgba(255, 107, 0, 0.4)'
                }}>
                  Verification
              </button>

              <div style={{ color: '#8c7366', fontSize: '14px' }}>
                Don't received code? <button type="button" onClick={(e) => { e.preventDefault(); handleRegisterSubmit(e); alert('A new verification code has been sent to your email!'); }} style={{ color: '#ffffff', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', padding: 0 }}>Resend Now</button> <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: '400' }}>or </span><button type="button" onClick={() => navigateView('login')} style={{ color: '#ffffff', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', padding: 0 }}>Log In</button>
              </div>
            </div>
          )}

          {view === 'reset_password' && (
              <div style={{ display: 'flex', flexDirection: 'column', padding: '0 0 3px 0', width: '100%' }}>
              <h2 style={{
                color: '#ffffff',
                fontSize: '28px',
                fontWeight: '700',
                margin: '0 0 4px 0',
                  textAlign: 'center'
                }}>Reset Your Password</h2>

              <p style={{
                color: '#8c7366',
                fontSize: '14px',
                textAlign: 'left',
                lineHeight: '1.5',
                margin: '0 0 7px 0'
                      }}>
                        Enter your email or phone to reset your password easily.
                      </p>

              <div style={{ marginBottom: '11px' }}>
                  <label style={{ display: 'flex', color: '#ffb366', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Email</label>
                <input type="text" placeholder="wadewarren@gmail.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required style={{...inputStyle, padding: '14px 16px', fontSize: '15px'}} />
              </div>

              <div style={{ marginBottom: '11px', position: 'relative' }}>
                  <label style={{ display: 'flex', alignItems: 'center', color: '#ffb366', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Password {resetPassword.length > 0 && resetPassword.length < 8 && <span style={{ color: '#ff4d4d', fontSize: '12px', marginLeft: '8px' }}>minimum 8 characters</span>}</label>
                <input type={showResetPassword ? "text" : "password"} placeholder="Enter your new password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} required style={{...inputStyle, padding: '14px 16px', paddingRight: '40px', fontSize: '15px'}} />
                <button type="button" onClick={() => setShowResetPassword(!showResetPassword)} style={{ position: 'absolute', right: '12px', top: '35px', background: 'none', border: 'none', color: '#8c7366', cursor: 'pointer', padding: 0 }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    {showResetPassword ? (
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    ) : (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </>
                    )}
                    {showResetPassword && <circle cx="12" cy="12" r="3"></circle>}
                  </svg>
                </button>
              </div>
              
              <div style={{ marginBottom: '17px', position: 'relative' }}>
                  <label style={{ display: 'flex', alignItems: 'center', color: '#ffb366', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Confirm Password {resetConfirmPassword && resetPassword !== resetConfirmPassword && <span style={{ color: '#ff4d4d', fontSize: '12px', marginLeft: '8px' }}>not matched</span>}</label>
                <input type={showResetConfirm ? "text" : "password"} placeholder="Confirm your new password" value={resetConfirmPassword} onChange={(e) => setResetConfirmPassword(e.target.value)} required style={{...inputStyle, padding: '14px 16px', paddingRight: '40px', fontSize: '15px'}} />
                <button type="button" onClick={() => setShowResetConfirm(!showResetConfirm)} style={{ position: 'absolute', right: '12px', top: '35px', background: 'none', border: 'none', color: '#8c7366', cursor: 'pointer', padding: 0 }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    {showResetConfirm ? (
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    ) : (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </>
                    )}
                    {showResetConfirm && <circle cx="12" cy="12" r="3"></circle>}
                  </svg>
                                </button>
              </div>

              <button type="button" onClick={handleResetRequestSubmit} style={{
                width: '100%',
                backgroundColor: '#ff6b00',
                background: 'linear-gradient(to right, #ff8a00, #ff5e00)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '24px',
                padding: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '10px',
                boxShadow: '0 4px 16px rgba(255, 107, 0, 0.4)'
              }}>
                Submit
              </button>

              <div style={{ color: '#8c7366', fontSize: '14px', marginBottom: '-1px', textAlign: 'center' }}>
                Already have an acount ? <button type="button" onClick={() => navigateView('login')} style={{ color: '#ffffff', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', padding: 0 }}>Signin</button>
              </div>
            </div>
          )}

          {view === 'verify_reset_code' && (
              <div style={{ display: 'flex', flexDirection: 'column', padding: '0', width: '100%' }}>
              <h2 style={{
                color: '#ffffff',
                fontSize: '28px',
                fontWeight: '700',
                margin: '-2px 0 0 0',
                  textAlign: 'center'
                }}>Verify Your Code</h2>

              <p style={{
                color: '#8c7366',
                fontSize: '14px',
                textAlign: 'left',
                lineHeight: '1.5',
                margin: '0 0 10px 0'
                  }}>
                    Please enter the 5-digit verification code we sent to your registered email to proceed securely.
                  </p>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', width: '100%', marginBottom: '10px' }}>
                {codeDigits.map((digit, index) => (
                  <input 
                    key={index}
                    id={`verify-reset-code-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => {
                      if (/[^0-9]/.test(e.target.value)) return;
                      const newDigits = [...codeDigits];
                      newDigits[index] = e.target.value;
                      setCodeDigits(newDigits);
                      if (e.target.value && index < 4) {
                        const nextInput = document.getElementById(`verify-reset-code-${index + 1}`);
                        if (nextInput) nextInput.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
                        const prevInput = document.getElementById(`verify-reset-code-${index - 1}`);
                        if (prevInput) prevInput.focus();
                      }
                    }}
                    style={{
                      width: '45px',
                      height: '55px',
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      border: '1px solid #4a2f22',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '24px',
                      fontWeight: '600',
                      textAlign: 'center',
                      outline: 'none',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#ff8a00'}
                    onBlur={(e) => e.target.style.borderColor = '#4a2f22'}
                  />
                ))}
              </div>

              <button type="button" onClick={handleResetVerifySubmit} style={{
                  width: '100%',
                  backgroundColor: '#ff6b00',
                  background: 'linear-gradient(to right, #ff8a00, #ff5e00)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '10px',
                  boxShadow: '0 4px 16px rgba(255, 107, 0, 0.4)'
              }}>
                Enter Code
              </button>

              <div style={{ color: '#8c7366', fontSize: '14px', textAlign: 'center', marginBottom: '-2px' }}>
                Don't received code? <button type="button" onClick={(e) => { e.preventDefault(); handleResetRequestSubmit(e); alert('A new password reset code has been sent to your email!'); }} style={{ color: '#ffffff', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', padding: 0 }}>Resend Now</button> <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: '400' }}>or </span><button type="button" onClick={() => navigateView('login')} style={{ color: '#ffffff', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', padding: 0 }}>Log In</button>
              </div>
  

          </div>
          )}


            {view === 'reset_success' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0px 0', width: '100%' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '2px solid #ff8a00', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '4px', boxShadow: '0 0 20px rgba(255, 107, 0, 0.2)'
                }}>
                  <svg viewBox="0 0 24 24" width="36" height="36" stroke="#ffb366" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h2 style={{ color: '#ffffff', fontSize: '28px', fontWeight: '700', margin: '2px 0 7px 0', textAlign: 'center', lineHeight: '1.2', padding: '0 10px' }}>
                  Your password is successfully reset
                </h2>
                <button type="button" onClick={() => setView('login')} style={{
                  width: '100%', backgroundColor: '#33221c',
                  color: '#ffb366', border: '1px solid #ff8a00', borderRadius: '24px', padding: '12px', fontSize: '16px', fontWeight: '600',
                  cursor: 'pointer', marginTop: '10px'
                }}>Go Back</button>
              </div>
            )}

            {view === 'verify_success' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0px 0', width: '100%' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '2px solid #ff8a00', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '4px', boxShadow: '0 0 20px rgba(255, 107, 0, 0.2)'
                }}>
                  <svg viewBox="0 0 24 24" width="36" height="36" stroke="#ffb366" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h2 style={{ color: '#ffffff', fontSize: '28px', fontWeight: '700', margin: '0 0 0px 0', textAlign: 'center' }}>
                  Welcome to Pujo Porikroma
                </h2>
                <p style={{ color: '#8c7366', fontSize: '15px', textAlign: 'center', lineHeight: '1.5', margin: '0 0 -7px 0' }}>
                  Your account has been successfully created and verified!
                </p>
                
              </div>
            )}

            {view === 'verify_error' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3px 0', width: '100%' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '2px solid #ff3333', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '5px', boxShadow: '0 0 20px rgba(255, 51, 51, 0.2)'
                }}>
                  <svg viewBox="0 0 24 24" width="36" height="36" stroke="#ff5555" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </div>
                <h2 style={{ color: '#ffffff', fontSize: '28px', fontWeight: '700', margin: '0 0 1px 0', textAlign: 'center' }}>
                  Incorrect Code
                </h2>
                <p style={{ color: '#8c7366', fontSize: '15px', textAlign: 'center', lineHeight: '1.5', margin: '0 0 10px 0' }}>
                  The 5-digit verification code you entered does not match. Please check your email and try again.
                </p>
                <button type="button" onClick={() => setView('verify_code')} style={{
                  width: '100%', backgroundColor: '#33221c',
                  color: '#ffb366', border: '1px solid #ff8a00', borderRadius: '24px', padding: '12px', fontSize: '16px', fontWeight: '600',
                  cursor: 'pointer'
                }}>Go Back</button>
              </div>
            )}

            {view === 'reset_error' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3px 0', width: '100%' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '2px solid #ff3333', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '5px', boxShadow: '0 0 20px rgba(255, 51, 51, 0.2)'
                }}>
                  <svg viewBox="0 0 24 24" width="36" height="36" stroke="#ff5555" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </div>
                <h2 style={{ color: '#ffffff', fontSize: '28px', fontWeight: '700', margin: '0 0 1px 0', textAlign: 'center' }}>
                  Email not found
                </h2>
                <p style={{ color: '#8c7366', fontSize: '15px', textAlign: 'center', lineHeight: '1.5', margin: '0 0 10px 0' }}>
                  We couldn't find an account associated with this email address.
                </p>
                <button type="button" onClick={() => setView('reset_password')} style={{
                  width: '100%', backgroundColor: '#33221c',
                  color: '#ffb366', border: '1px solid #ff8a00', borderRadius: '24px', padding: '12px', fontSize: '16px', fontWeight: '600',
                  cursor: 'pointer'
                }}>Go Back</button>
              </div>
            )}
            {view === 'login_error' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3px 0', width: '100%' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '2px solid #ff3333', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '5px', boxShadow: '0 0 20px rgba(255, 51, 51, 0.2)'
                }}>
                  <svg viewBox="0 0 24 24" width="36" height="36" stroke="#ff5555" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </div>
                <h2 style={{ color: '#ffffff', fontSize: '28px', fontWeight: '700', margin: '0 0 1px 0', textAlign: 'center' }}>
                  Wrong Credential
                </h2>
                <p style={{ color: '#8c7366', fontSize: '15px', textAlign: 'center', lineHeight: '1.5', margin: '0 0 10px 0' }}>
                  Invalid username or password
                </p>
                <button type="button" onClick={() => setView('login')} style={{
                  width: '100%', backgroundColor: '#33221c',
                  color: '#ffb366', border: '1px solid #ff8a00', borderRadius: '24px', padding: '12px', fontSize: '16px', fontWeight: '600',
                  cursor: 'pointer'
                }}>OK</button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  border: '1px solid #4a2f22',
  borderRadius: '12px',
  padding: '12px 14px',
  color: '#ffffff',
  fontSize: '15px',
  outline: 'none',
  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
  boxSizing: 'border-box'
};

export default LoginModal;
