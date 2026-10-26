import { useState, useEffect } from 'react';

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

export interface BackendHealthReport {
  online: boolean;
  service?: string;
  uptime?: number;
  latencyMs?: number;
  database?: {
    status: string;
    type: string;
    project_count?: number;
    url?: string;
  };
  backend_url: string;
  timestamp?: string;
  error?: string;
}

/**
 * Checks backend connectivity and health with latency measurement
 */
export const checkBackendHealth = async (): Promise<BackendHealthReport> => {
  const start = performance.now();
  try {
    // Try full status first
    const res = await fetch(getApiUrl('/api/status'), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    const latencyMs = Math.round(performance.now() - start);

    if (res.ok) {
      const data = await res.json();
      return {
        online: true,
        service: data.service || 'innovexa-backend',
        uptime: data.uptime,
        latencyMs,
        database: data.database || { status: 'connected', type: 'Supabase PostgreSQL' },
        backend_url: BACKEND_URL,
        timestamp: data.timestamp
      };
    }

    // Fallback to /health endpoint
    const healthRes = await fetch(getApiUrl('/health'));
    const healthLatency = Math.round(performance.now() - start);
    if (healthRes.ok) {
      const data = await healthRes.json();
      return {
        online: true,
        service: data.service || 'innovexa-backend',
        uptime: data.uptime,
        latencyMs: healthLatency,
        backend_url: BACKEND_URL,
        database: { status: 'connected', type: 'Supabase PostgreSQL' },
        timestamp: data.timestamp
      };
    }

    return {
      online: false,
      backend_url: BACKEND_URL,
      error: `HTTP ${res.status}`
    };
  } catch (err: any) {
    return {
      online: false,
      backend_url: BACKEND_URL,
      error: err.message || 'Render backend is starting or network unreachable'
    };
  }
};

/**
 * React hook to observe live backend connection status in components
 */
export const useBackendStatus = (pollIntervalMs = 60000) => {
  const [report, setReport] = useState<BackendHealthReport>({
    online: false,
    backend_url: BACKEND_URL
  });
  const [loading, setLoading] = useState(true);

  const check = async () => {
    setLoading(true);
    const res = await checkBackendHealth();
    setReport(res);
    setLoading(false);
  };

  useEffect(() => {
    check();
    if (pollIntervalMs > 0) {
      const timer = setInterval(check, pollIntervalMs);
      return () => clearInterval(timer);
    }
  }, [pollIntervalMs]);

  return { report, loading, recheck: check };
};
