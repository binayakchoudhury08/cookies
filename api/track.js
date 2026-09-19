export default async function handler(req, res) {
  // Handle CORS preflight requests if needed (Vercel usually handles this, but just in case)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Accept both GET and POST
  const awb = req.query.awb || (req.body && req.body.awb);

  if (!awb) {
    return res.status(400).json({ error: 'AWB number is required' });
  }

  const SHIPROCKET_TOKEN = 'iWW@zzkIqBzE$C3XH*$tS93DNXx9xaLd';

  try {
    const response = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SHIPROCKET_TOKEN}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Tracking data not found or invalid AWB', data });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch tracking data', details: error.message });
  }
}
