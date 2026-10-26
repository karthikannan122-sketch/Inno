/**
 * INNOVEXA Central API & Backend Configuration
 * Seamlessly connects frontend client to the remote Render backend (or custom deployed backend)
 */

export const BACKEND_URL = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) ||
  'https://inno-backend-0pfj.onrender.com'
).replace(/\/$/, '');

/**
 * Resolves full API URL for a given endpoint path.
 * Examples:
 *   getApiUrl('/api/ai-research') -> 'https://inno-backend-0pfj.onrender.com/api/ai-research'
 *   getApiUrl('/health') -> 'https://inno-backend-0pfj.onrender.com/health'
 */
export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${BACKEND_URL}${cleanEndpoint}`;
};

/**
 * Checks backend connectivity and health
 */
export const checkBackendHealth = async (): Promise<{
  online: boolean;
  service?: string;
  uptime?: number;
  error?: string;
}> => {
  try {
    const res = await fetch(getApiUrl('/health'), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      return { online: true, service: data.service, uptime: data.uptime };
    }
    return { online: false, error: `HTTP ${res.status}` };
  } catch (err: any) {
    return { online: false, error: err.message || 'Network unreachable' };
  }
};
