export const API_URL = (
  import.meta.env.VITE_API_URL ??
  'http://localhost:3000'
).replace(/\/$/, '');

interface NestErrorResponse {
  statusCode?: number;
  error?: string;
  message?: string | string[];
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly response?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getAccessToken(): string | null {
  return (
    localStorage.getItem('accessToken') ??
    localStorage.getItem('access_token') ??
    localStorage.getItem('token')
  );
}

function extractErrorMessage(
  payload: unknown,
  fallback: string,
): string {
  if (
    payload &&
    typeof payload === 'object'
  ) {
    const error = payload as NestErrorResponse;

    if (Array.isArray(error.message)) {
      return error.message.join(' ');
    }

    if (
      typeof error.message === 'string' &&
      error.message.trim()
    ) {
      return error.message;
    }

    if (
      typeof error.error === 'string' &&
      error.error.trim()
    ) {
      return error.error;
    }
  }

  return fallback;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(
    options.headers,
  );

  const token = getAccessToken();

  if (token) {
    headers.set(
      'Authorization',
      `Bearer ${token}`,
    );
  }

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set(
      'Content-Type',
      'application/json',
    );
  }

  headers.set('Accept', 'application/json');

  let response: Response;

  try {
    response = await fetch(
      `${API_URL}${path}`,
      {
        ...options,
        headers,
      },
    );
  } catch {
    throw new ApiError(
      'No fue posible conectar con el servidor.',
      0,
    );
  }

  const contentType =
    response.headers.get('content-type') ??
    '';

  let payload: unknown = null;

  if (
    response.status !== 204 &&
    contentType.includes('application/json')
  ) {
    payload = await response.json();
  } else if (response.status !== 204) {
    const text = await response.text();
    payload = text || null;
  }

  if (!response.ok) {
    const fallback =
      response.status === 401
        ? 'La sesión expiró o no es válida.'
        : `La solicitud falló con estado ${response.status}.`;

    throw new ApiError(
      extractErrorMessage(
        payload,
        fallback,
      ),
      response.status,
      payload,
    );
  }

  return payload as T;
}
