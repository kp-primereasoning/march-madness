// Centralized fetch wrapper — always sends cookies
const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }

  if (!res.ok) throw Object.assign(new Error(data?.error || res.statusText), { status: res.status, data });
  return data;
}

export const api = {
  get:    (path)         => request(path),
  post:   (path, body)   => request(path, { method: 'POST', body }),
  put:    (path, body)   => request(path, { method: 'PUT', body }),
  patch:  (path, body)   => request(path, { method: 'PATCH', body }),
  delete: (path)         => request(path, { method: 'DELETE' }),
};
