require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const admin = require('firebase-admin');

// Initialize Firebase Admin (Hackathon fallback allows implicit ADC or empty initialization)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
} else {
  admin.initializeApp();
}
const db = admin.firestore();

// ─── Config ───────────────────────────────────────────────────────────────────
const VONAGE_API_KEY    = process.env.VONAGE_API_KEY;
const VONAGE_API_SECRET = process.env.VONAGE_API_SECRET;
const VONAGE_FROM       = process.env.VONAGE_FROM || 'SafeSphere';

const TWILIO_SID    = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN  = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM   = process.env.TWILIO_PHONE_NUMBER;

const FAST2SMS_KEY  = process.env.FAST2SMS_API_KEY;

// HACKATHON MODE: No auth
const verifyToken = (req, res, next) => {
  req.user = { uid: 'hackathon_demo_user' };
  next();
};

app.post('/api/guardians/accept', verifyToken, async (req, res) => {
  try {
    const { request } = req.body;
    if (!request || !request.id || !request.fromUserId || !request.toUserId) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    console.log(`\n🛡️ Processing Guardian Accept Request: ${request.id}`);

    // 1. Update the request status
    const requestRef = db.collection('guardian_requests').doc(request.id);
    await requestRef.update({ status: 'accepted' });

    // 2. Fetch both profiles
    const fromRef = db.collection('users').doc(request.fromUserId);
    const toRef = db.collection('users').doc(request.toUserId);

    const [fromDoc, toDoc] = await Promise.all([fromRef.get(), toRef.get()]);

    if (!fromDoc.exists || !toDoc.exists) {
      return res.status(404).json({ error: 'One or both users not found' });
    }

    const fromProfile = fromDoc.data();
    const toProfile = toDoc.data();

    // 3. Create bidirectional contact entries
    const fromContacts = fromProfile.trustedContacts || [];
    const toContacts = toProfile.trustedContacts || [];

    if (!fromContacts.some(c => c.safeSphereId === toProfile.safeSphereId)) {
      fromContacts.push({
        name: toProfile.fullName || "SafeSphere User",
        phone: toProfile.phone || "",
        relation: "Guardian",
        safeSphereId: toProfile.safeSphereId
      });
      await fromRef.update({ trustedContacts: fromContacts });
    }

    if (!toContacts.some(c => c.safeSphereId === fromProfile.safeSphereId)) {
      toContacts.push({
        name: fromProfile.fullName || "SafeSphere User",
        phone: fromProfile.phone || "",
        relation: "Guardian",
        safeSphereId: fromProfile.safeSphereId
      });
      await toRef.update({ trustedContacts: toContacts });
    }

    res.status(200).json({ success: true, message: 'Guardian request accepted securely' });
  } catch (error) {
    console.error('❌ Error processing guardian accept:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/** Provider: CallMeBot (Free WhatsApp) */
async function sendCallMeBotWhatsApp(phone, message) {
  const apikey = process.env.CALLMEBOT_API_KEY;
  if (!apikey) throw new Error('CallMeBot API key not configured');

  const toClean = phone.replace(/[^0-9]/g, '');
  const toCleanInternational = toClean.startsWith('91') ? toClean : '91' + toClean.slice(-10);

  const resp = await axios.get('https://api.callmebot.com/whatsapp.php', {
    params: {
      phone: toCleanInternational,
      text: message,
      apikey: apikey
    }
  });

  console.log(`[CallMeBot] Response for ${toCleanInternational}:`, resp.data);
  return resp.data;
}

/** Provider: Telegram Bot (100% Free and Instant) */
async function sendTelegramAlerts(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIdsStr = process.env.TELEGRAM_CHAT_IDS;
  if (!token || !chatIdsStr) {
    console.log('[Telegram] Bot token or chat IDs not configured, skipping Telegram broadcast.');
    return;
  }

  const chatIds = chatIdsStr.split(',').map(id => id.trim());
  for (const chatId of chatIds) {
    try {
      await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: chatId,
        text: message
      });
      console.log(`[Telegram] ✅ Alert sent to chatId: ${chatId}`);
    } catch (e) {
      console.log(`[Telegram] ❌ Failed to send to chatId: ${chatId}:`, e.message);
    }
  }
}

// ─── SMS Providers ────────────────────────────────────────────────────────────

/** Provider 1: Vonage (free €2 credit on signup) */
async function sendVonageSMS(to, message) {
  if (!VONAGE_API_KEY || !VONAGE_API_SECRET) throw new Error('Vonage not configured');

  const toClean = to.replace(/[^0-9]/g, '');
  const toE164 = toClean.startsWith('91') ? toClean : '91' + toClean.slice(-10);

  const resp = await axios.post('https://rest.nexmo.com/sms/json', {
    api_key: VONAGE_API_KEY,
    api_secret: VONAGE_API_SECRET,
    to: toE164,
    from: VONAGE_FROM,
    text: message,
  });

  const result = resp.data.messages?.[0];
  if (result?.status !== '0') {
    throw new Error(`Vonage error: ${result?.['error-text'] || JSON.stringify(result)}`);
  }
  console.log(`[Vonage] ✅ SMS sent to ${toE164}. ID: ${result['message-id']}`);
  return result;
}

/** Provider 2: Fast2SMS (India, ₹100 min transaction for API) */
async function sendFast2SMS(phones, message) {
  if (!FAST2SMS_KEY) throw new Error('Fast2SMS not configured');
  const numbers = phones.map(p => p.replace(/[^0-9]/g, '').slice(-10)).join(',');
  const resp = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
    route: 'q', message, language: 'english', flash: 0, numbers,
  }, { headers: { authorization: FAST2SMS_KEY, 'Content-Type': 'application/json' } });
  if (!resp.data.return) throw new Error('Fast2SMS failed: ' + JSON.stringify(resp.data));
  console.log('[Fast2SMS] ✅ SMS sent!');
  return resp.data;
}

/** Provider 3: Twilio fallback */
async function sendTwilioSMS(to, message) {
  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) throw new Error('Twilio not configured');
  const twilio = require('twilio')(TWILIO_SID, TWILIO_TOKEN);
  const toE164 = to.startsWith('+') ? to : '+91' + to.replace(/[^0-9]/g, '').slice(-10);
  const msg = await twilio.messages.create({ body: message, from: TWILIO_FROM, to: toE164 });
  console.log(`[Twilio] ✅ SMS sent. SID: ${msg.sid}`);
  return msg;
}

// ─── Main dispatch with provider fallback chain ───────────────────────────────
async function dispatchSMS(phones, message) {
  const results = [];

  for (const phone of phones) {
    let sent = false;

    // 1️⃣ Try Vonage first (free credits, works globally)
    if (VONAGE_API_KEY) {
      try {
        await sendVonageSMS(phone, message);
        results.push({ phone, status: 'vonage_success' });
        sent = true;
      } catch (e) {
        console.log(`[Vonage] Failed for ${phone}:`, e.message);
      }
    }

    // 2️⃣ Try Fast2SMS (India)
    if (!sent && FAST2SMS_KEY) {
      try {
        await sendFast2SMS([phone], message);
        results.push({ phone, status: 'fast2sms_success' });
        sent = true;
      } catch (e) {
        console.log(`[Fast2SMS] Failed for ${phone}:`, e.message);
      }
    }

    // 3️⃣ Try Twilio (fallback)
    if (!sent) {
      try {
        await sendTwilioSMS(phone, message);
        results.push({ phone, status: 'twilio_success' });
        sent = true;
      } catch (e) {
        console.log(`[Twilio] Failed for ${phone}:`, e.message);
        results.push({ phone, status: 'failed', error: e.message });
      }
    }
  }

  return results;
}

// ─── Endpoints ────────────────────────────────────────────────────────────────
app.post('/api/emergency/dispatch', verifyToken, async (req, res) => {
  try {
    const { phones, customMessage } = req.body;
    if (!phones?.length) return res.status(400).json({ error: 'No phone numbers' });

    const msg = customMessage || 'SafeSphere Emergency Alert!';
    console.log(`\n🚨 Emergency dispatch → ${phones.join(', ')}`);
    console.log(`📝 Message: ${msg.substring(0, 100)}...`);
    console.log(`📡 Type: ${req.body.type}`);

    // Broadcast to Telegram as a 100% free and instant channel if configured
    sendTelegramAlerts(msg).catch(e => console.log('[Telegram] dispatch error:', e.message));

    let results = [];

    if (req.body.type === 'whatsapp') {
      for (const phone of phones) {
        let sent = false;

        // Try CallMeBot free WhatsApp first
        if (process.env.CALLMEBOT_API_KEY) {
          try {
            await sendCallMeBotWhatsApp(phone, msg);
            results.push({ phone, status: 'whatsapp_callmebot_success' });
            sent = true;
          } catch (e) {
            console.log(`[CallMeBot] Failed for ${phone}:`, e.message);
          }
        }

        // Try Twilio WhatsApp if CallMeBot not configured or failed
        if (!sent && TWILIO_SID && TWILIO_TOKEN) {
          const twilio = require('twilio')(TWILIO_SID, TWILIO_TOKEN);
          const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
          const toClean = phone.replace(/[^0-9]/g, '');
          const toE164 = toClean.startsWith('91') ? '+' + toClean : '+91' + toClean.slice(-10);
          try {
            const resp = await twilio.messages.create({
              body: msg,
              from: TWILIO_WHATSAPP_NUMBER,
              to: `whatsapp:${toE164}`
            });
            console.log(`[WhatsApp] ✅ Sent to ${toE164}. SID: ${resp.sid}`);
            results.push({ phone, status: 'whatsapp_success' });
            sent = true;
          } catch (e) {
            console.log(`[WhatsApp] ❌ Failed for ${toE164}:`, e.message);
            results.push({ phone, status: 'failed', error: e.message });
          }
        }

        if (!sent) {
          results.push({ phone, status: 'failed', error: 'No WhatsApp provider available or succeeded' });
        }
      }
    } else {
      // 🔵 SMS DISPATCH (Twilio/Vonage/Fast2SMS)
      results = await dispatchSMS(phones, msg);
    }

    const anySuccess = results.some(r => r.status.includes('success'));

    console.log(`${anySuccess ? '✅' : '❌'} Results:`, JSON.stringify(results));
    res.status(200).json({ success: anySuccess, results });

  } catch (e) {
    console.error('Fatal dispatch error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/emergency/call', verifyToken, async (req, res) => {
  res.json({ success: true, message: 'Call not implemented in hackathon mode' });
});

app.post('/api/notifications/send', verifyToken, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !messages.length) {
      return res.status(400).json({ error: 'No messages provided' });
    }

    console.log(`\n🚨 Sending ${messages.length} Expo Push Notifications via secure backend...`);

    const response = await axios.post('https://exp.host/--/api/v2/push/send', messages, {
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      }
    });

    console.log(`✅ Push Response:`, JSON.stringify(response.data));
    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error('❌ Error sending push notification via backend:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    providers: {
      vonage: !!VONAGE_API_KEY,
      fast2sms: !!FAST2SMS_KEY,
      twilio: !!TWILIO_FROM,
    }
  });
});

const PORT = process.env.PORT || 3000;

// ─── Socket.io Handlers ───────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.id}`);

  socket.on('join_room', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`[Socket] User ${socket.id} joined room ${userId}`);
    }
  });

  socket.on('trigger_emergency', (data) => {
    console.log(`[Socket] 🚨 Emergency triggered by ${data.victimName} (${data.victimId})`);
    if (data.guardianIds && Array.isArray(data.guardianIds)) {
      data.guardianIds.forEach(guardianId => {
        io.to(guardianId).emit('emergency_alert', {
          incidentUserId: data.victimId,
          victimName: data.victimName,
          location: data.location,
          battery: data.battery,
          videoUrl: data.videoUrl,
          type: 'emergency_alert',
          timestamp: new Date().toISOString()
        });
        console.log(`[Socket] Alert forwarded to room ${guardianId}`);
      });
    }
  });

  socket.on('cancel_emergency', (data) => {
    console.log(`[Socket] 🛑 Emergency CANCELLED by ${data.victimName} (${data.victimId})`);
    if (data.guardianIds && Array.isArray(data.guardianIds)) {
      data.guardianIds.forEach(guardianId => {
        io.to(guardianId).emit('emergency_cancelled', {
          incidentUserId: data.victimId,
          victimName: data.victimName,
          type: 'emergency_cancelled',
          timestamp: new Date().toISOString()
        });
        console.log(`[Socket] Cancel forwarded to room ${guardianId}`);
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 SafeSphere Backend on port ${PORT}`);
  console.log(`Providers: Vonage=${!!VONAGE_API_KEY} | Fast2SMS=${!!FAST2SMS_KEY} | Twilio=${!!TWILIO_FROM}`);
  console.log(`Health: http://localhost:${PORT}/health\n`);
});
