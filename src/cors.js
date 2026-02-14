export function applyCors(req, res, extensionOrigin) {
  const origin = req.headers.origin;
  if (origin && origin === extensionOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export function isPreflight(req) {
  return req.method === 'OPTIONS';
}
