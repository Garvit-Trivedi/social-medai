export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('token');
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(isForm ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const body = options.body && !isForm && typeof options.body !== 'string'
    ? JSON.stringify(options.body)
    : options.body;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers, body });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;
  if (!res.ok) {
    const message = data?.message || `Request failed with ${res.status}`;
    throw new Error(message);
  }
  return data;
}
