// Vercel serverless CORS proxy.
// Called as: /api/proxy?url=<encoded target URL>
// Forwards the request to the target URL and returns the response with
// permissive CORS headers so the browser accepts it.

export default async function handler(req, res) {
  // Let the browser's CORS preflight (OPTIONS) succeed immediately.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const target = req.query.url;
  if (!target || (!target.startsWith('http://') && !target.startsWith('https://'))) {
    res.status(400).send('Missing or invalid "url" query parameter.');
    return;
  }

  // Don't forward headers that only make sense for this proxy request itself.
  const skip = new Set(['host', 'origin', 'referer', 'connection', 'content-length']);
  const forwardHeaders = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (!skip.has(key.toLowerCase())) forwardHeaders[key] = value;
  }

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: forwardHeaders,
    });

    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      if (!['content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.send(buffer);
  } catch (e) {
    res.status(502).send('Proxy error: ' + e.message);
  }
}
