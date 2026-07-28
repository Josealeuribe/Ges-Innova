import type {
  AuthUser,
} from '../types/auth.types';

export const AUTH_TOKEN_KEY =
  'accessToken';

export const AUTH_USER_KEY =
  'authUser';

export function getAccessToken():
  | string
  | null {
  const token = localStorage.getItem(
    AUTH_TOKEN_KEY,
  );

  if (
    !token ||
    token === 'null' ||
    token === 'undefined'
  ) {
    return null;
  }

  const normalizedToken = token
    .trim()
    .replace(/^Bearer\s+/i, '');

  return normalizedToken || null;
}

export function getStoredAuthUser():
  | AuthUser
  | null {
  const storedUser =
    localStorage.getItem(
      AUTH_USER_KEY,
    );

  if (!storedUser) {
    return null;
  }

  try {
    const parsed: unknown =
      JSON.parse(storedUser);

    if (
      typeof parsed !== 'object' ||
      parsed === null
    ) {
      localStorage.removeItem(
        AUTH_USER_KEY,
      );

      return null;
    }

    return parsed as AuthUser;
  } catch {
    localStorage.removeItem(
      AUTH_USER_KEY,
    );

    return null;
  }
}

export function saveAccessToken(
  token: string,
): void {
  const normalizedToken = token
    .trim()
    .replace(/^Bearer\s+/i, '');

  if (!normalizedToken) {
    throw new Error(
      'No se puede almacenar un token vacío.',
    );
  }

  localStorage.setItem(
    AUTH_TOKEN_KEY,
    normalizedToken,
  );
}

export function saveAuthUser(
  usuario: AuthUser,
): void {
  localStorage.setItem(
    AUTH_USER_KEY,
    JSON.stringify(usuario),
  );
}

export function saveAuthSession(
  token: string,
  usuario: AuthUser,
): void {
  saveAccessToken(token);
  saveAuthUser(usuario);
}

export function removeAccessToken(): void {
  localStorage.removeItem(
    AUTH_TOKEN_KEY,
  );
}

export function clearAuthSession(): void {
  localStorage.removeItem(
    AUTH_TOKEN_KEY,
  );

  localStorage.removeItem(
    AUTH_USER_KEY,
  );
}

export function getAuthHeader(): Record<
  string,
  string
> {
  const token = getAccessToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}