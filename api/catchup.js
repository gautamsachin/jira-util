import { applyCors, isPreflight } from '../src/cors.js';
import { processRequest } from '../src/handler.js';
import { getConfig } from '../src/config.js';
import { HttpError } from '../src/http.js';

export default async function handler(req, res) {
  let extensionOrigin = '*';

  try {
    extensionOrigin = getConfig().extensionOrigin;
  } catch {
    // no-op: keep restrictive behavior in failed config state
  }

  applyCors(req, res, extensionOrigin);

  if (isPreflight(req)) {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const data = await processRequest(req);
    res.status(200).json({ ok: true, data });
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.status).json({ ok: false, error: error.message, details: error.details });
      return;
    }

    res.status(500).json({ ok: false, error: 'Unexpected server error' });
  }
}
