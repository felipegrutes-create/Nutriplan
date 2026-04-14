export default async function handler(req, res) {
  // Allow POST only
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const APPS_SCRIPT_URL =
    'https://script.google.com/macros/s/AKfycbyctvZ2IGeIb6eybcfpOSahPROAuCa3Z6wk_HXYCTZOr3bZKSE6MGYDLzuhkAezAAXcCw/exec';

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      redirect: 'follow',
    });

    const text = await response.text();
    res.status(200).json({ status: 'ok', response: text });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}
