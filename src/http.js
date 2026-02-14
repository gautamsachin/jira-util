export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function fetchJson(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const text = await response.text();
    const body = text ? safeJsonParse(text) : {};

    if (!response.ok) {
      const msg = body?.error_description || body?.message || response.statusText;
      throw new HttpError(response.status, msg, body);
    }

    return body;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new HttpError(504, 'Upstream request timed out');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}
