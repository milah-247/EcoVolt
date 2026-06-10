const BASE = '/api';

export function api(token) {
  const headers = { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) };
  return {
    get: (path) => fetch(`${BASE}${path}`, { headers }).then(r => r.json()),
    post: (path, body) => fetch(`${BASE}${path}`, { method: 'POST', headers, body: JSON.stringify(body) }).then(r => r.json()),
    del: (path) => fetch(`${BASE}${path}`, { method: 'DELETE', headers }).then(r => r.json()),
  };
}
