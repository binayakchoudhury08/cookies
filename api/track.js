export default async function handler(req, res) {
  // Handle CORS preflight requests if needed
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Accept both GET and POST
  const awb = req.query.awb || (req.body && req.body.awb);

  if (!awb) {
    return res.status(400).json({ error: 'AWB number is required' });
  }

  const SHIPROCKET_EMAIL = 'crumblyblr@gmail.com';
  const SHIPROCKET_PASSWORD = 'Crumbly123@';

  try {
    // 1. Authenticate with Shiprocket to get a fresh JWT token
    const authResponse = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: SHIPROCKET_EMAIL,
        password: SHIPROCKET_PASSWORD
      })
    });

    const authData = await authResponse.json();

    if (!authResponse.ok || !authData.token) {
      console.error('Shiprocket Auth Error:', authData);
      return res.status(500).json({ error: 'Failed to authenticate with Shiprocket shipping partner.' });
    }

    const token = authData.token;

    // 2. Fetch the tracking data using the fresh token
    const trackingResponse = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const trackingData = await trackingResponse.json();

    if (!trackingResponse.ok) {
      return res.status(trackingResponse.status).json({ error: 'Tracking data not found or invalid AWB', trackingData });
    }

    return res.status(200).json(trackingData);

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch tracking data', details: error.message });
  }
}
