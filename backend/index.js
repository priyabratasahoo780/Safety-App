require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin (requires serviceAccountKey.json or GOOGLE_APPLICATION_CREDENTIALS)
// For local hackathon dev, if no credential is provided, we can mock verification or require a downloaded key.
// Since we don't have the key file, we will set up a placeholder that verifies if a key exists.
let authVerified = false;
try {
  // Try initializing with default credentials (if GOOGLE_APPLICATION_CREDENTIALS is set)
  admin.initializeApp();
  authVerified = true;
} catch (e) {
  console.warn("Firebase Admin failed to initialize. Auth verification will be mocked for hackathon.");
}

// Initialize Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID || 'AC_mock',
  process.env.TWILIO_AUTH_TOKEN || 'mock_token'
);

const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER || '+1234567890';
const TWILIO_WHATSAPP = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

// Middleware to verify Firebase Auth Token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  
  if (authVerified) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  } else {
    // Hackathon Fallback: If no service account key is available, bypass
    req.user = { uid: 'hackathon_mock_user' };
    next();
  }
};

app.post('/api/emergency/dispatch', verifyToken, async (req, res) => {
  try {
    const { phones, payload, customMessage, type } = req.body;

    if (!phones || !phones.length) {
      return res.status(400).json({ error: 'No phone numbers provided' });
    }

    console.log(`[Emergency Dispatch] Received ${type || 'mixed'} request for ${phones.length} guardians from user ${req.user.uid}`);
    
    const results = [];

    for (const phone of phones) {
      const to = phone.startsWith('+') ? phone : `+91${phone.replace(/[^0-9]/g, '')}`;
      if (!to || to === '+91') continue;

      if (type === 'sms') {
         // Force SMS Only mode (WhatsApp bypassed)
         try {
           console.log(`[Twilio] Attempting to send SMS to ${to}...`);
           const smsMessage = await twilioClient.messages.create({
             body: customMessage || JSON.stringify(payload, null, 2),
             from: TWILIO_PHONE,
             to: to
           });
           console.log(`[Twilio] SMS sent successfully. SID: ${smsMessage.sid}`);
           results.push({ phone: to, status: 'sms_success', sid: smsMessage.sid });
         } catch (smsError) {
           console.error(`[Twilio] SMS failed for ${to}:`, smsError.message);
           results.push({ phone: to, status: 'failed', error: smsError.message });
         }
      } else {
         // Default Mode: WhatsApp First, Fallback to SMS
         try {
           console.log(`[Twilio] Attempting to send WhatsApp to ${to}...`);
           const waMessage = await twilioClient.messages.create({
             body: customMessage || JSON.stringify(payload, null, 2),
             from: TWILIO_WHATSAPP,
             to: `whatsapp:${to}`
           });
           console.log(`[Twilio] WhatsApp sent successfully. SID: ${waMessage.sid}`);
           results.push({ phone: to, status: 'whatsapp_success', sid: waMessage.sid });
         } catch (waError) {
           console.error(`[Twilio] WhatsApp failed for ${to}:`, waError.message);
           console.log(`[Twilio] Falling back to SMS for ${to}...`);
           
           try {
             const smsMessage = await twilioClient.messages.create({
               body: customMessage || JSON.stringify(payload, null, 2),
               from: TWILIO_PHONE,
               to: to
             });
             console.log(`[Twilio] SMS sent successfully. SID: ${smsMessage.sid}`);
             results.push({ phone: to, status: 'sms_success', sid: smsMessage.sid });
           } catch (smsError) {
             console.error(`[Twilio] SMS fallback also failed for ${to}:`, smsError.message);
             results.push({ phone: to, status: 'failed', error: smsError.message });
           }
         }
      }
    }

    res.status(200).json({ success: true, results });

  } catch (error) {
    console.error("[Emergency Dispatch] Fatal Server Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/emergency/call', verifyToken, async (req, res) => {
  try {
    const { phones, message } = req.body;

    if (!phones || !phones.length) {
      return res.status(400).json({ error: 'No phone numbers provided' });
    }

    console.log(`[Emergency Call] Received call request for ${phones.length} guardians from user ${req.user.uid}`);
    
    const results = [];

    for (const phone of phones) {
      const to = phone.startsWith('+') ? phone : `+91${phone.replace(/[^0-9]/g, '')}`;
      if (!to || to === '+91') continue;

      try {
        console.log(`[Twilio] Attempting to call ${to}...`);
        
        // Use TwiML to speak the message
        const twiml = `<Response><Say voice="alice" language="en-IN">${message || 'Emergency alert triggered. Please check the dashboard.'}</Say></Response>`;

        const call = await twilioClient.calls.create({
          twiml: twiml,
          from: TWILIO_PHONE,
          to: to
        });
        
        console.log(`[Twilio] Call initiated successfully. SID: ${call.sid}`);
        results.push({ phone: to, status: 'call_success', sid: call.sid });
      } catch (callError) {
        console.error(`[Twilio] Call failed for ${to}:`, callError.message);
        results.push({ phone: to, status: 'failed', error: callError.message });
      }
    }

    res.status(200).json({ success: true, results });

  } catch (error) {
    console.error("[Emergency Call] Fatal Server Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Secure Twilio Backend running on port ${PORT}`);
});
