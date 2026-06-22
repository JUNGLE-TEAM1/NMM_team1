const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

export async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, options);
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.detail || `HTTP ${response.status}`);
  }
  return payload;
}

export function getApiBaseUrl() {
  return apiBaseUrl;
}
