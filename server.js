import express from 'express';
import crypto from 'crypto';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { checkPandalDuplicate } from './src/data/pandals.js';

// Load .env if present
if (fs.existsSync('.env') && process.loadEnvFile) {
  try {
    process.loadEnvFile('.env');
  } catch (e) {
    console.error("Error loading .env file:", e.message);
  }
}

const app = express();
app.use(cors());
app.use(express.json());

// --- EMAIL LIMITS DB ---
const EMAIL_LIMITS_FILE = path.join(process.cwd(), 'email_limits.json');
let emailLimits = {};

function loadEmailLimits() {
  try {
    if (fs.existsSync(EMAIL_LIMITS_FILE)) {
      emailLimits = JSON.parse(fs.readFileSync(EMAIL_LIMITS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error("Error loading email limits:", e);
  }
}
function saveEmailLimits() {
  fs.writeFileSync(EMAIL_LIMITS_FILE, JSON.stringify(emailLimits, null, 2));
}
loadEmailLimits();

function canGenerateEmail(email, type) {
  if (!emailLimits[email]) emailLimits[email] = { register: [], reset: [] };
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  
  // Clean up entries older than 24h
  emailLimits[email][type] = emailLimits[email][type].filter(t => now - t < twentyFourHours);
  
  return emailLimits[email][type].length < 2;
}

function recordEmailGeneration(email, type) {
  if (!emailLimits[email]) emailLimits[email] = { register: [], reset: [] };
  emailLimits[email][type].push(Date.now());
  saveEmailLimits();
}

// --- USER AUTHENTICATION DB ---
const USERS_FILE = path.join(process.cwd(), 'users.json');
let users = [];

function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      users = JSON.parse(data);
    }
  } catch (err) {
    console.error("Error loading users:", err);
  }
}
function saveUsers() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("Error saving users:", err);
  }
}
loadUsers();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}


async function sendVerificationEmail(email, code, name, type = 'register') {
  const smtpUser = process.env.EMAIL_USER || process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.GMAIL_PASS;

  // Development Fallback Log Option
  console.log(`\n=========================================`);
  console.log(`[GENERATED VERIFICATION CODE] ${code}`);
  console.log(`[TARGET EMAIL] ${email}`);
  console.log(`=========================================\n`);

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: smtpUser, pass: smtpPass }
      });

      console.log(`[VERIFICATION EMAIL] Attempting to send email via SMTP (${smtpUser})...`);

      await transporter.sendMail({
        from: '"Pujo Porikroma" <' + smtpUser + '>',
        to: email,
        subject: type === 'reset' ? `Your Pujo Porikroma Password Reset Code: ${code}` : `Your Pujo Porikroma Verification Code: ${code}`,
          text: type === 'reset' ? `Hello ${name}, your Pujo Porikroma password reset code is: ${code}. Please do not share this code with anyone.` : `Hello ${name}, your Pujo Porikroma verification code is: ${code}. Please do not share this code with anyone.`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1a100c; color: #ffffff; padding: 40px 20px; text-align: center; border-radius: 12px; max-width: 600px; margin: 0 auto;">
            <img src="cid:pujologo" alt="Pujo Porikroma" style="width: 200px; height: auto; margin-bottom: 20px; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.6));" />
            
            <h1 style="color: #ffb366; margin-bottom: 10px; font-size: 24px;">Welcome to Pujo Porikroma</h1>
            <p style="font-size: 16px; color: #d9c3b8; margin-bottom: 30px;">
              Hello ${name}, ${type === 'reset' ? 'Please verify your unique code to complete your password reset process.' : 'please verify your email address to complete your registration.'}
            </p>
            
            <div style="background-color: #2a1a14; border: 1px solid #4a2f22; border-radius: 12px; padding: 20px; display: inline-block; margin-bottom: 30px;">
              <p style="margin: 0; font-size: 14px; color: #ffb366; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Your Unique Code</p>
              <h2 style="margin: 0; font-size: 48px; color: #ffffff; letter-spacing: 6px;">${code}</h2>
            </div>
            
            <div style="background-color: rgba(255, 107, 0, 0.1); border-left: 4px solid #ff6b00; padding: 15px; margin-bottom: 20px; text-align: left; border-radius: 4px;">
              <p style="margin: 0; font-size: 15px; color: #ffb366; font-weight: bold; margin-bottom: 8px;">⚠️ Security Precautions:</p>
              <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #a68a7c; line-height: 1.6;">
                <li>Do not share this unique code with anyone.</li>
                <li>Pujo Porikroma support will never ask you for your password or code.</li>
                <li>This code is valid for exactly 15 minutes.</li>
              </ul>
            </div>
            
            <p style="font-size: 12px; color: #735c52; margin-top: 30px;">
              &copy; ${new Date().getFullYear()} Pujo Porikroma. All rights reserved.
            </p>
          </div>
        `,
        attachments: [
          {
            filename: 'log-in-logo1.png',
            path: path.join(process.cwd(), 'public', 'log-in-logo1.png'),
            cid: 'pujologo',
              contentDisposition: 'inline'
          }
        ]
      });
      console.log(`[VERIFICATION EMAIL] Successfully sent to ${email}`);
    } catch (err) {
      console.error('\n[SMTP ERROR] Failed to send verification email. Details:');
      console.error(err);
      console.error('Please check your EMAIL_USER and EMAIL_PASS environment variables.\n');
    }
  } else {
    console.log(`[VERIFICATION EMAIL] No SMTP credentials (EMAIL_USER / EMAIL_PASS) configured in .env. Email skipped.`);
  }
}



app.get('/api/auth/reserved-names', (req, res) => {
  try {
    const reserved = new Set();
    const emails = new Set();
    users.forEach(u => {
      if (u.isVerified) {
        if (u.firstname) reserved.add(u.firstname.toLowerCase().trim());
        if (u.lastname) reserved.add(u.lastname.toLowerCase().trim());
        if (u.email) emails.add(u.email.toLowerCase().trim());
      }
    });
    res.json({ success: true, reservedNames: Array.from(reserved), reservedEmails: Array.from(emails) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
    try {
      const { firstname, lastname, email, password, dob, gender } = req.body;
    
    // Check age restriction (must be 17+)
    if (dob) {
      const dobDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - dobDate.getFullYear();
      const m = today.getMonth() - dobDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
        age--;
      }
      if (age < 17) {
        return res.status(400).json({ success: false, error: 'User must be at least 17 years old.' });
      }
    }

    // Check global name uniqueness
    const fnLower = firstname ? firstname.toLowerCase().trim() : '';
    const lnLower = lastname ? lastname.toLowerCase().trim() : '';
    
    const isNameTaken = users.some(u => 
      u.isVerified && (
        (u.firstname && u.firstname.toLowerCase().trim() === fnLower) ||
        (u.lastname && u.lastname.toLowerCase().trim() === fnLower) ||
        (u.firstname && u.firstname.toLowerCase().trim() === lnLower) ||
        (u.lastname && u.lastname.toLowerCase().trim() === lnLower)
      )
    );

    if (isNameTaken) {
      return res.status(409).json({ success: false, error: 'Firstname or Lastname is already taken by another user.' });
    }

      
      if (!firstname || !lastname || !email || !password || !dob || !gender) {
        return res.status(400).json({ success: false, error: 'All fields are strictly mandatory.' });
      }
  
      if (!canGenerateEmail(email, 'register')) {
      return res.status(429).json({ success: false, rateLimited: true, error: 'Registration email limit reached for this email.' });
    }

    const existingUserIndex = users.findIndex(u => u.email === email);
      if (existingUserIndex !== -1) {
        if (users[existingUserIndex].isVerified) {
          return res.status(409).json({ success: false, error: 'Email is already registered and verified. Please log in.' });
        } else {
          // If unverified, remove the old pending record so they can try again with a fresh code
          users.splice(existingUserIndex, 1);
        }
      }
  
      const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();
      const codeExpiresAt = new Date(Date.now() + 15 * 60000).toISOString();

      const newUser = {
        id: Date.now().toString(),
        firstname,
        lastname,
        email,
        password: hashPassword(password),
        dob,
        gender,
        createdAt: new Date().toISOString(),
        isVerified: false,
        verificationCode,
        codeExpiresAt
      };
  
      users.push(newUser);
      saveUsers();
      
      recordEmailGeneration(email, 'register');
    sendVerificationEmail(email, verificationCode, firstname); // non-blocking
  
      return res.status(200).json({ success: true, message: 'User registered successfully. Verification email sent.', devCode: verificationCode });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ success: false, error: 'Internal server error.' });
    }
  });


app.post('/api/auth/verify', (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ success: false, error: 'Email and code are required.' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, error: 'User is already verified.' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ success: false, error: 'Invalid verification code.' });
    }

    if (new Date() > new Date(user.codeExpiresAt)) {
      return res.status(400).json({ success: false, error: 'Verification code has expired.' });
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationCode = null;
    user.codeExpiresAt = null;
    saveUsers();

    return res.status(200).json({ 
      success: true, 
      message: 'Email verified successfully.',
      user: { firstname: user.firstname, lastname: user.lastname, email: user.email }
    });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});



app.post('/api/auth/reset-request', (req, res) => {
  try {
    const { email } = req.body;
    const user = users.find(u => u.email === email && u.isVerified);
    
    if (user && !canGenerateEmail(email, 'reset')) {
      return res.status(429).json({ success: false, rateLimited: true, error: 'Reset password email limit reached for this email.' });
    }
    if (!user) {
      return res.status(404).json({ success: false, error: 'Email not found.' });
    }

    const code = Math.floor(10000 + Math.random() * 90000).toString();
    user.resetCode = code;
    saveUsers();

    console.log('=========================================');
    console.log('[GENERATED PASSWORD RESET CODE] ' + code);
    console.log('[TARGET EMAIL] ' + email);
    console.log('=========================================');

    recordEmailGeneration(email, 'reset');
    sendVerificationEmail(email, code, user.firstname, 'reset');
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = users.find(u => u.email === email && u.isVerified);
    
    if (!user || user.resetCode !== code) {
      return res.status(400).json({ success: false, error: 'Incorrect code' });
    }

    user.password = hashPassword(newPassword);
    delete user.resetCode;
    saveUsers();
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required.' });
    }
    
    // Check against email for now
    const user = users.find(u => 
        u.email === username || 
        (u.firstname && u.firstname.toLowerCase() === username.toLowerCase().trim()) || 
        (u.lastname && u.lastname.toLowerCase() === username.toLowerCase().trim())
      );
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    if (user.password !== hashPassword(password)) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    return res.status(200).json({ success: true, message: 'Login successful.', user: { firstname: user.firstname, lastname: user.lastname, email: user.email, gender: user.gender } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});
// -----------------------------



const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

let onlineUsers = 0;
let userCounter = 0;
let messages = [];
let groups = [];

// Helper to calculate the current 3-hour block index
function getCurrentTimeBlock() {
  const currentHour = new Date().getHours();
  // 3-hour blocks: 00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00
  return Math.floor(currentHour / 3);
}

let currentBlock = getCurrentTimeBlock();
let lastHourReported = new Date().getHours();

function getBengaliHourString(date) {
  const hours = date.getHours();
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
  
  const bengaliNumbers = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  
  const strHours = String(displayHours).split('').map(d => bengaliNumbers[d]).join('');
  return `${strHours}:০০ ${timePrefix}`;
}



// Add the initial hourly reminder immediately upon server startup
messages.push({
  id: Date.now() + Math.random().toString(36).substr(2, 9),
  isSystemMessage: true,
  text: getBengaliHourString(new Date()),
  timestamp: new Date().toISOString()
});

// Check every minute if the 3-hour block or hour has changed
setInterval(() => {
  const now = new Date();
  
  // 1. Check for 3-hour boundary (clear chat)
  const newBlock = getCurrentTimeBlock();
  if (newBlock !== currentBlock) {
    currentBlock = newBlock;
    messages = []; // Clear chat history
    
    // Instantly add the current hour's reminder to the clean chat
    const initialTimeMessage = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      isSystemMessage: true,
      text: getBengaliHourString(now),
      timestamp: now.toISOString()
    };
    messages.push(initialTimeMessage);
    
    io.emit('chatCleared'); // Notify all clients
    console.log(`[System] 3-hour boundary crossed. Cleared chat history.`);
  }

  // 2. Check for hour boundary (add time reminder)
  if (now.getHours() !== lastHourReported) {
    lastHourReported = now.getHours();
    
    const timeMessage = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      isSystemMessage: true,
      text: getBengaliHourString(now),
      timestamp: now.toISOString()
    };
    messages.push(timeMessage);
    io.emit('newMessage', timeMessage);
  }
}, 60000);

let idleTimeout = null;

io.on('connection', (socket) => {
  onlineUsers++;
  userCounter++;
  
  // Assign a sequential ID and avatar (1 to 7)
  const myUserId = userCounter;
  const myAvatar = `/user logo${((myUserId - 1) % 7) + 1}.png`;
  const myUsername = `User ${myUserId}`;
  
  console.log(`User connected: ${myUsername}. Total online: ${onlineUsers}`);
  
  // Send the initial state to the newly connected user
  socket.emit('initChat', {
    myUserId,
    myUsername,
    myAvatar,
    messages
  });

  // Handle explicit requests for initChat (e.g., when ChatPopup mounts after connection)
  socket.on('requestInitChat', () => {
    socket.emit('initChat', {
      myUserId,
      myUsername,
      myAvatar,
      messages
    });
    socket.emit('initGroups', groups);
  });
  
  // Handle creating a new group
  socket.on('createGroup', (groupName) => {
    if (!groupName || typeof groupName !== 'string') return;
    
    // Enforce max 3 groups per user
    const userGroupCount = groups.filter(g => g.creatorId === myUserId).length;
    if (userGroupCount >= 3) {
      socket.emit('chatError', 'You can only create up to 3 groups at a time.');
      return;
    }

    const shortCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    const newGroup = {
      id: shortCode,
      name: groupName.trim(),
      creatorId: myUserId,
      creatorName: myUsername,
      creatorAvatar: myAvatar,
      members: [myUserId],
      membersCount: 1, // Start with 1 (the creator)
      messages: [],
      timestamp: new Date().toISOString()
    };
    groups.push(newGroup);
    io.emit('newGroup', newGroup);
  });
  
  // Handle joining a group via code
  socket.on('joinGroup', (code) => {
    if (!code || typeof code !== 'string') return;
    
    // Check if group exists
    const group = groups.find(g => g.id === code.toUpperCase());
    if (!group) {
      socket.emit('chatError', 'Group not found with this code.');
      return;
    }

    // Check if already a member
    if (group.members.includes(myUserId)) {
      socket.emit('chatError', 'You are already in this group.');
      return;
    }

    // Check max joined groups limit
    const joinedGroupsCount = groups.filter(g => g.creatorId !== myUserId && g.members.includes(myUserId)).length;
    if (joinedGroupsCount >= 3) {
      socket.emit('chatError', 'You can only join up to 3 groups created by others.');
      return;
    }

    // Check max members per group (the UI says "holds up to 3 members")
    if (group.members.length >= 3) {
      socket.emit('chatError', 'This group is already full (max 3 members).');
      return;
    }

    // Join the group
    group.members.push(myUserId);
    group.membersCount = group.members.length;
    
    io.emit('groupUpdated', group);
  });

  // Handle deleting a group
  socket.on('deleteGroup', (groupId) => {
    const groupIndex = groups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) return;
    if (groups[groupIndex].creatorId !== myUserId) return; // Only creator can delete
    
    groups.splice(groupIndex, 1);
    io.emit('groupDeleted', groupId);
  });

  // Handle leaving a group
  socket.on('leaveGroup', (groupId) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    const memberIndex = group.members.indexOf(myUserId);
    if (memberIndex === -1) return;
    
    group.members.splice(memberIndex, 1);
    group.membersCount = group.members.length;
    io.emit('groupUpdated', group);
  });

  // Handle kicking a user from a group
  socket.on('kickUser', ({ targetUserId, groupId }) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    // Only creator can kick
    if (group.creatorId !== myUserId) return;
    // Cannot kick yourself this way
    if (targetUserId === myUserId) return;

    const memberIndex = group.members.indexOf(targetUserId);
    if (memberIndex === -1) return;
    
    group.members.splice(memberIndex, 1);
    group.membersCount = group.members.length;
    io.emit('groupUpdated', group);
  });

  // Handle sending a message in a group
  socket.on('sendGroupMessage', ({ groupId, text }) => {
    if (!text || typeof text !== 'string') return;
    
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    // Verify membership
    if (!group.members.includes(myUserId)) return;

    const newMessage = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      userId: myUserId,
      username: myUsername,
      avatar: myAvatar,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      isSystemMessage: false
    };

    if (!group.messages) group.messages = [];
    group.messages.push(newMessage);
    
    io.emit('newGroupMessage', { groupId, message: newMessage });
  });

  socket.on('sendGroupInvite', ({ targetUserId, groupId }) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    // Send the invite directly to everyone, but clients will filter by targetUserId
    // In a real app, this should only emit to the specific targetUserId's socket room
    io.emit('receiveGroupInvite', {
      targetUserId,
      groupId: group.id,
      groupName: group.name,
      fromUserName: myUsername,
      timestamp: new Date().toISOString()
    });
  });

  // Broadcast the new online count
  io.emit('onlineUsersUpdate', onlineUsers);

  // Handle incoming messages
  socket.on('sendMessage', (text) => {
    if (!text || typeof text !== 'string') return;
    
    // Validate 50 words limit
    const words = text.trim().split(/\s+/);
    if (words.length > 50) {
      socket.emit('chatError', 'Message exceeds 50 words.');
      return;
    }

    const newMessage = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      userId: myUserId,
      username: myUsername,
      avatar: myAvatar,
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    messages.push(newMessage);
    io.emit('newMessage', newMessage);
    
    // Set exactly 5-minute relative timeout for inactivity
    if (idleTimeout) clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => {
      const reminder = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        isSystemMessage: true,
        isTimeReminder: true,
        text: "৫ মিনিট আগে",
        timestamp: new Date().toISOString()
      };
      messages.push(reminder);
      io.emit('newMessage', reminder);
    }, 5 * 60 * 1000);
  });

  socket.on('disconnect', () => {
    onlineUsers--;
    console.log(`${myUsername} disconnected. Total online: ${onlineUsers}`);
    io.emit('onlineUsersUpdate', onlineUsers);
  });
});

// ==========================================
// REPORT A PROBLEM & RATE LIMITING BACKEND
// ==========================================
const REPORT_MAX_PER_WINDOW = 10;
const REPORT_WINDOW_MS = 4 * 60 * 60 * 1000; // 4 hours
let reportEmailTimestamps = [];
const REPORTS_FILE = path.resolve('reports.json');

function loadReports() {
  try {
    if (fs.existsSync(REPORTS_FILE)) {
      return JSON.parse(fs.readFileSync(REPORTS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error("Error reading reports file:", e);
  }
  return [];
}

function saveReport(report) {
  try {
    const list = loadReports();
    list.push(report);
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e) {
    console.error("Error saving report to file:", e);
  }
}

// Nodemailer transporter setup
let mailTransporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function forwardReportEmail(report) {
  const { topic, description, contact, timestamp } = report;
  const targetEmail = 'saikatsom234@gmail.com';

  console.log(`[REPORT SUBMISSION] Dispatching real email to ${targetEmail}`);
  console.log(`  Topic: ${topic}`);
  console.log(`  Contact: ${contact}`);
  console.log(`  Description: ${description}`);
  console.log(`  Time: ${timestamp}`);

  // 1. Direct Gmail / SMTP delivery if credentials provided in environment
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_PASS;

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: smtpUser, pass: smtpPass }
      });

      await transporter.sendMail({
        from: `"Pujo Porikroma Reports" <${smtpUser}>`,
        to: targetEmail,
        replyTo: contact.includes('@') ? contact : undefined,
        subject: `[Pujo Porikroma Problem Report] ${topic} - ${contact}`,
        text: `New Problem Report Received:\n\nTopic: ${topic}\nContact: ${contact}\nTime: ${timestamp}\n\nDescription:\n${description}`,
        html: `
          <div style="font-family: Arial, sans-serif; background: #181210; color: #f5e6d3; padding: 24px; border-radius: 12px; max-width: 600px;">
            <h2 style="color: #ffaa44; margin-top: 0;">Pujo Porikroma - New Problem Report</h2>
            <p><strong>Topic:</strong> <span style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 6px;">${topic}</span></p>
            <p><strong>Contact:</strong> ${contact}</p>
            <p><strong>Submitted At:</strong> ${timestamp}</p>
            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.2); margin: 16px 0;" />
            <h3 style="color: #ffffff;">Description:</h3>
            <div style="background: #241c19; padding: 16px; border-radius: 8px; white-space: pre-wrap; color: #ffffff;">${description}</div>
          </div>
        `
      });
      console.log(`[REPORT EMAIL] Successfully dispatched via Gmail SMTP to ${targetEmail}`);
      return { success: true, service: 'smtp' };
    } catch (smtpErr) {
      console.error("[REPORT EMAIL] SMTP error, falling back to transactional email service:", smtpErr.message);
    }
  }

  // 2. Transactional email gateway connected directly to saikatsom234@gmail.com
  const response = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Origin': 'http://localhost:5173',
      'Referer': 'http://localhost:5173/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    body: JSON.stringify({
      name: "Pujo Porikroma User",
      topic: topic,
      contact: contact,
      description: description,
      message: `[Topic: ${topic}]\nContact: ${contact}\nTime: ${timestamp}\n\nDescription:\n${description}`,
      _subject: `[Pujo Porikroma Problem Report] ${topic} (${contact})`,
      _replyto: contact.includes('@') ? contact : undefined,
      _captcha: "false",
      _template: "table"
    })
  });

  const resData = await response.json();
  console.log(`[REPORT EMAIL] Transactional email service response:`, resData);

  if (!response.ok) {
    throw new Error(resData.message || 'Email transactional service returned an error');
  }

  return { success: true, service: 'formsubmit', details: resData };
}

app.post('/api/report', async (req, res) => {
  try {
    const { topic, description, contact } = req.body;

    // Validate inputs
    if (!topic || !description || !description.trim() || !contact || !contact.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Topic, description, and contact info are all required.' 
      });
    }

    const now = Date.now();
    const windowStart = now - REPORT_WINDOW_MS;

    // Purge timestamps older than 4 hours
    reportEmailTimestamps = reportEmailTimestamps.filter(ts => ts > windowStart);

    // Rate limit check: max 10 emails per 4-hour window
    if (reportEmailTimestamps.length >= REPORT_MAX_PER_WINDOW) {
      const oldestInWindow = reportEmailTimestamps[0];
      const remainingMs = (oldestInWindow + REPORT_WINDOW_MS) - now;
      const remainingMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));
      
      console.warn(`[REPORT RATE LIMIT] 10 reports reached in 4h window. Blocked until ${remainingMinutes}m.`);
      return res.status(429).json({
        success: false,
        rateLimited: true,
        error: `Rate limit reached. A maximum of 10 report emails can be sent per 4-hour window. Please try again in ${remainingMinutes} minutes.`
      });
    }

    const reportData = {
      id: Date.now() + Math.random().toString(36).substr(2, 7),
      topic: topic.trim(),
      description: description.trim(),
      contact: contact.trim(),
      timestamp: new Date().toISOString()
    };

    // Forward email via transactional email service (throws if delivery fails)
    await forwardReportEmail(reportData);

    // Register timestamp for rate limiting ONLY after successful email trigger
    reportEmailTimestamps.push(now);

    // Save to persistent storage
    saveReport(reportData);

    return res.status(200).json({
      success: true,
      message: 'Report sent successfully! We will review it shortly.'
    });
  } catch (err) {
    console.error('Error processing report:', err);
    return res.status(502).json({ 
      success: false, 
      error: err.message || 'Failed to deliver report email. Please check your internet connection and try again.' 
    });
  }
});

// ==========================================
// CONTACT US & RATE LIMITING BACKEND
// ==========================================
const CONTACT_MAX_PER_WINDOW = 10;
const CONTACT_WINDOW_MS = 4 * 60 * 60 * 1000; // 4 hours
let contactEmailTimestamps = [];
const CONTACTS_FILE = path.resolve('contacts.json');

function loadContacts() {
  try {
    if (fs.existsSync(CONTACTS_FILE)) {
      return JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error("Error reading contacts file:", e);
  }
  return [];
}

function saveContact(contactItem) {
  try {
    const list = loadContacts();
    list.push(contactItem);
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e) {
    console.error("Error saving contact message to file:", e);
  }
}

async function forwardContactEmail(contactData) {
  const { name, contact, message, timestamp } = contactData;
  const targetEmail = 'saikatsom234@gmail.com';
  const senderDisplayName = name || 'User';

  console.log(`[CONTACT SUBMISSION] Dispatching real email to ${targetEmail}`);
  console.log(`  Name: ${senderDisplayName}`);
  console.log(`  Contact: ${contact}`);
  console.log(`  Message: ${message}`);
  console.log(`  Time: ${timestamp}`);

  // 1. Direct Gmail / SMTP delivery if credentials provided in environment
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_PASS;

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: smtpUser, pass: smtpPass }
      });

      await transporter.sendMail({
        from: `"Pujo Porikroma Help & Support" <${smtpUser}>`,
        to: targetEmail,
        replyTo: contact.includes('@') ? contact : undefined,
        subject: `[Pujo Porikroma Help & Support] ${senderDisplayName} (${contact})`,
        text: `New Help & Support Message Received:\n\nFrom: ${senderDisplayName}\nContact: ${contact}\nTime: ${timestamp}\n\nMessage:\n${message}`,
        html: `
          <div style="font-family: Arial, sans-serif; background: #181210; color: #f5e6d3; padding: 24px; border-radius: 12px; max-width: 600px;">
            <h2 style="color: #ffaa44; margin-top: 0;">Pujo Porikroma - Help &amp; Support Contact</h2>
            <p><strong>Name:</strong> ${senderDisplayName}</p>
            <p><strong>Contact:</strong> ${contact}</p>
            <p><strong>Submitted At:</strong> ${timestamp}</p>
            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.2); margin: 16px 0;" />
            <h3 style="color: #ffffff;">Message:</h3>
            <div style="background: #241c19; padding: 16px; border-radius: 8px; white-space: pre-wrap; color: #ffffff;">${message}</div>
          </div>
        `
      });
      console.log(`[CONTACT EMAIL] Successfully dispatched via Gmail SMTP to ${targetEmail}`);
      return { success: true, service: 'smtp' };
    } catch (smtpErr) {
      console.error("[CONTACT EMAIL] SMTP error, falling back to transactional email service:", smtpErr.message);
    }
  }

  // 2. Transactional email gateway connected directly to saikatsom234@gmail.com
  const response = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Origin': 'http://localhost:5173',
      'Referer': 'http://localhost:5173/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    body: JSON.stringify({
      name: senderDisplayName,
      contact: contact,
      message: `[From: ${senderDisplayName}]\nContact: ${contact}\nTime: ${timestamp}\n\nMessage:\n${message}`,
      _subject: `[Pujo Porikroma Help & Support] ${senderDisplayName} (${contact})`,
      _replyto: contact.includes('@') ? contact : undefined,
      _captcha: "false",
      _template: "table"
    })
  });

  const resData = await response.json();
  console.log(`[CONTACT EMAIL] Transactional email service response:`, resData);

  if (!response.ok) {
    throw new Error(resData.message || 'Email transactional service returned an error');
  }

  return { success: true, service: 'formsubmit', details: resData };
}

app.post('/api/contact', async (req, res) => {
  try {
    const { name, contact, message } = req.body;

    // Validate inputs (contact and message are required)
    if (!contact || !contact.trim() || !message || !message.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email or phone contact info and a message description are required.' 
      });
    }

    const now = Date.now();
    const windowStart = now - CONTACT_WINDOW_MS;

    // Purge timestamps older than 4 hours
    contactEmailTimestamps = contactEmailTimestamps.filter(ts => ts > windowStart);

    // Rate limit check: max 10 emails per 4-hour window
    if (contactEmailTimestamps.length >= CONTACT_MAX_PER_WINDOW) {
      const oldestInWindow = contactEmailTimestamps[0];
      const remainingMs = (oldestInWindow + CONTACT_WINDOW_MS) - now;
      const remainingMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));
      
      console.warn(`[CONTACT RATE LIMIT] 10 messages reached in 4h window. Blocked until ${remainingMinutes}m.`);
      return res.status(429).json({
        success: false,
        rateLimited: true,
        error: `Rate limit reached. A maximum of 10 messages can be sent per 4-hour window. Please try again in ${remainingMinutes} minutes.`
      });
    }

    const contactData = {
      id: Date.now() + Math.random().toString(36).substr(2, 7),
      name: (name || '').trim(),
      contact: contact.trim(),
      message: message.trim(),
      timestamp: new Date().toISOString()
    };

    // Forward email via transactional email service (throws if delivery fails)
    await forwardContactEmail(contactData);

    // Register timestamp for rate limiting ONLY after successful email trigger
    contactEmailTimestamps.push(now);

    // Save to persistent storage
    saveContact(contactData);

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.'
    });
  } catch (err) {
    console.error('Error processing contact submission:', err);
    return res.status(502).json({ 
      success: false, 
      error: err.message || 'Failed to deliver message. Please check your internet connection and try again.' 
    });
  }
});

// ==========================================
// REQUEST A PANDAL & RATE LIMITING BACKEND
// ==========================================
const PANDAL_REQ_MAX_PER_WINDOW = 10;
const PANDAL_REQ_WINDOW_MS = 4 * 60 * 60 * 1000; // 4 hours
let pandalRequestTimestamps = [];
const PANDAL_REQS_FILE = path.resolve('pandal_requests.json');

function loadPandalRequests() {
  try {
    if (fs.existsSync(PANDAL_REQS_FILE)) {
      return JSON.parse(fs.readFileSync(PANDAL_REQS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error("Error reading pandal requests file:", e);
  }
  return [];
}

function savePandalRequest(requestItem) {
  try {
    const list = loadPandalRequests();
    list.push(requestItem);
    fs.writeFileSync(PANDAL_REQS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e) {
    console.error("Error saving pandal request to file:", e);
  }
}

async function forwardPandalRequestEmail(pandalData) {
  const { pandalName, area, location, notes, coords, timestamp } = pandalData;
  const targetEmail = 'saikatsom234@gmail.com';
  const coordsStr = coords && coords.lat && coords.lng ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : 'Not provided';
  const locationStr = location || 'Not provided';
  const notesStr = notes || 'None';

  console.log(`[PANDAL REQUEST SUBMISSION] Dispatching real email to ${targetEmail}`);
  console.log(`  Pandal: ${pandalName}`);
  console.log(`  Area: ${area}`);
  console.log(`  Location: ${locationStr}`);
  console.log(`  GPS Coords: ${coordsStr}`);
  console.log(`  Notes: ${notesStr}`);
  console.log(`  Time: ${timestamp}`);

  // 1. Direct Gmail / SMTP delivery if credentials provided in environment
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_PASS;

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: smtpUser, pass: smtpPass }
      });

      await transporter.sendMail({
        from: `"Pujo Porikroma Pandal Requests" <${smtpUser}>`,
        to: targetEmail,
        subject: `[Pujo Porikroma Pandal Request] ${pandalName} (${area})`,
        text: `New Pandal Request Received:\n\nPandal Name: ${pandalName}\nArea: ${area}\nLocation Link/Text: ${locationStr}\nGPS Coordinates: ${coordsStr}\nAdditional Notes: ${notesStr}\nTime: ${timestamp}`,
        html: `
          <div style="font-family: Arial, sans-serif; background: #181210; color: #f5e6d3; padding: 24px; border-radius: 12px; max-width: 600px;">
            <h2 style="color: #ffaa44; margin-top: 0;">Pujo Porikroma - New Pandal Request</h2>
            <p><strong>Pandal Name:</strong> <span style="font-size: 16px; font-weight: bold; color: #ffffff;">${pandalName}</span></p>
            <p><strong>Area:</strong> ${area}</p>
            <p><strong>Location:</strong> ${locationStr}</p>
            <p><strong>GPS Coordinates:</strong> ${coordsStr}</p>
            <p><strong>Submitted At:</strong> ${timestamp}</p>
            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.2); margin: 16px 0;" />
            <h3 style="color: #ffffff;">Additional Notes:</h3>
            <div style="background: #241c19; padding: 16px; border-radius: 8px; white-space: pre-wrap; color: #ffffff;">${notesStr}</div>
          </div>
        `
      });
      console.log(`[PANDAL REQUEST EMAIL] Successfully dispatched via Gmail SMTP to ${targetEmail}`);
      return { success: true, service: 'smtp' };
    } catch (smtpErr) {
      console.error("[PANDAL REQUEST EMAIL] SMTP error, falling back to transactional email service:", smtpErr.message);
    }
  }

  // 2. Transactional email gateway connected directly to saikatsom234@gmail.com
  const response = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Origin': 'http://localhost:5173',
      'Referer': 'http://localhost:5173/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    body: JSON.stringify({
      name: "Pujo Porikroma Contributor",
      pandalName: pandalName,
      area: area,
      location: locationStr,
      gpsCoords: coordsStr,
      notes: notesStr,
      message: `[New Pandal Request]\nPandal Name: ${pandalName}\nArea: ${area}\nLocation: ${locationStr}\nGPS: ${coordsStr}\nNotes: ${notesStr}\nTime: ${timestamp}`,
      _subject: `[Pujo Porikroma Pandal Request] ${pandalName} (${area})`,
      _captcha: "false",
      _template: "table"
    })
  });

  const resData = await response.json();
  console.log(`[PANDAL REQUEST EMAIL] Transactional email service response:`, resData);

  if (!response.ok) {
    throw new Error(resData.message || 'Email transactional service returned an error');
  }

  return { success: true, service: 'formsubmit', details: resData };
}

app.post('/api/request-pandal', async (req, res) => {
  try {
    const { pandalName, area, location, notes, coords } = req.body;

    // 1. Mandatory field validation
    if (!pandalName || !pandalName.trim() || !area || !area.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Pandal name and Area are strictly required.'
      });
    }

    const trimmedName = pandalName.trim();
    const trimmedArea = area.trim();
    const trimmedLocation = (location || '').trim();
    const trimmedNotes = (notes || '').trim();

    // 2. Duplicate checking against existing database of 274+ pandals
    const duplicateResult = checkPandalDuplicate(trimmedName, trimmedArea, trimmedLocation, coords);
    if (duplicateResult.isDuplicate) {
      const existingName = duplicateResult.matchedPandal?.name || trimmedName;
      console.warn(`[PANDAL DUPLICATE BLOCKED] Request for "${trimmedName}" matched existing pandal "${existingName}" (${duplicateResult.reason})`);
      return res.status(409).json({
        success: false,
        duplicate: true,
        matchedPandal: duplicateResult.matchedPandal,
        error: `"${existingName}" is already listed on the map.`
      });
    }

    // Check against pending requests
    const existingRequests = loadPandalRequests();
    const lowerName = trimmedName.toLowerCase();
    const alreadyRequested = existingRequests.find(r => r.pandalName && r.pandalName.toLowerCase() === lowerName);
    if (alreadyRequested) {
      console.warn(`[PANDAL REQUEST DUPLICATE] "${trimmedName}" was already requested previously.`);
      return res.status(409).json({
        success: false,
        duplicate: true,
        error: `A request for "${trimmedName}" has already been submitted and is currently being reviewed.`
      });
    }

    // 3. Sliding-window rate limiting: max 10 requests per 4-hour window
    const now = Date.now();
    const windowStart = now - PANDAL_REQ_WINDOW_MS;
    pandalRequestTimestamps = pandalRequestTimestamps.filter(ts => ts > windowStart);

    if (pandalRequestTimestamps.length >= PANDAL_REQ_MAX_PER_WINDOW) {
      const oldestInWindow = pandalRequestTimestamps[0];
      const remainingMs = (oldestInWindow + PANDAL_REQ_WINDOW_MS) - now;
      const remainingMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));

      console.warn(`[PANDAL REQ RATE LIMIT] 10 requests reached in 4h window. Blocked until ${remainingMinutes}m.`);
      return res.status(429).json({
        success: false,
        rateLimited: true,
        error: `Rate limit reached. A maximum of 10 pandal requests can be sent per 4-hour window. Please try again in ${remainingMinutes} minutes.`
      });
    }

    const requestData = {
      id: Date.now() + Math.random().toString(36).substr(2, 7),
      pandalName: trimmedName,
      area: trimmedArea,
      location: trimmedLocation,
      notes: trimmedNotes,
      coords: coords || null,
      timestamp: new Date().toISOString()
    };

    // Forward email via transactional email service (throws if delivery fails)
    await forwardPandalRequestEmail(requestData);

    // Register timestamp for rate limiting ONLY after successful email dispatch
    pandalRequestTimestamps.push(now);

    // Save to persistent storage
    savePandalRequest(requestData);

    return res.status(200).json({
      success: true,
      message: 'Pandal request sent successfully! We will review and add it to the map soon.'
    });
  } catch (err) {
    console.error('Error processing pandal request:', err);
    return res.status(502).json({
      success: false,
      error: err.message || 'Failed to deliver pandal request. Please check your internet connection and try again.'
    });
  }
});

const distPath = path.join(process.cwd(), 'dist');
const publicPath = path.join(process.cwd(), 'public');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Socket.IO backend server running on http://0.0.0.0:${PORT}`);
});
