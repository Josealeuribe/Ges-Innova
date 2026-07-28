import {
  clearAuthSession,
  getAccessToken,
  getAuthHeader,
  getStoredAuthUser,
  saveAuthSession,
  saveAuthUser,
} from './auth-token';

import type {
  ApiValidationError,
  AuthRole,
  AuthUser,
  LoginRequest,
  LoginResponse,
} from '../types/auth.types';

export type {
  AuthRole,
  AuthUser,
  LoginRequest,
  LoginResponse,
} from '../types/auth.types';

const API_URL = (
  import.meta.env.VITE_API_URL ??
  'http://localhost:3000/api'
).replace(/\/$/, '');

export class AuthApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(
    message: string,
    status: number,
    details?: unknown,
  ) {
    super(message);

    this.name = 'AuthApiError';
    this.status = status;
    this.details = details;

    Object.setPrototypeOf(
      this,
      AuthApiError.prototype,
    );
  }
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null
  );
}

function readString(
  record: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = record[key];

    if (
      typeof value === 'string' &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return undefined;
}

function readNumber(
  record: Record<string, unknown>,
  keys: string[],
): number | undefined {
  for (const key of keys) {
    const value = record[key];

    if (
      typeof value === 'number' &&
      Number.isFinite(value)
    ) {
      return value;
    }

    if (
      typeof value === 'string' &&
      value.trim()
    ) {
      const numericValue =
        Number(value);

      if (
        Number.isFinite(numericValue)
      ) {
        return numericValue;
      }
    }
  }

  return undefined;
}

function getErrorMessage(
  body: unknown,
  fallback: string,
): string {
  if (!isRecord(body)) {
    return fallback;
  }

  const message = body.message;

  if (
    Array.isArray(message) &&
    message.every(
      (item) =>
        typeof item === 'string',
    )
  ) {
    return message.join(', ');
  }

  if (typeof message === 'string') {
    return message;
  }

  if (typeof body.error === 'string') {
    return body.error;
  }

  return fallback;
}

async function readJson(
  response: Response,
): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function extractUserPayload(
  body: unknown,
): unknown {
  if (!isRecord(body)) {
    return body;
  }

  if (body.usuario) {
    return body.usuario;
  }

  if (body.user) {
    return body.user;
  }

  if (isRecord(body.data)) {
    if (body.data.usuario) {
      return body.data.usuario;
    }

    if (body.data.user) {
      return body.data.user;
    }

    return body.data;
  }

  return body;
}

function normalizeRole(
  source: Record<string, unknown>,
  fallback?: AuthRole,
): AuthRole {
  const nestedRole =
    isRecord(source.rol)
      ? source.rol
      : isRecord(source.role)
        ? source.role
        : null;

  const idRol =
    nestedRole
      ? readNumber(
          nestedRole,
          [
            'idRol',
            'id_rol',
            'id',
          ],
        )
      : undefined;

  const nombreRol =
    nestedRole
      ? readString(
          nestedRole,
          [
            'nombreRol',
            'nombre_rol',
            'nombre',
            'role',
          ],
        )
      : undefined;

  return {
    idRol:
      idRol ??
      readNumber(
        source,
        [
          'idRol',
          'id_rol',
          'rolId',
        ],
      ) ??
      fallback?.idRol ??
      0,

    nombreRol:
      nombreRol ??
      readString(
        source,
        [
          'nombreRol',
          'rolNombre',
          'role',
        ],
      ) ??
      fallback?.nombreRol ??
      'Usuario',
  };
}

function normalizeAuthUser(
  value: unknown,
  fallback?: AuthUser,
): AuthUser {
  if (!isRecord(value)) {
    if (fallback) {
      return fallback;
    }

    throw new AuthApiError(
      'El backend devolvió un usuario inválido.',
      500,
      value,
    );
  }

  const id =
    readNumber(
      value,
      [
        'id',
        'idUsuario',
        'id_usuario',
        'userId',
        'sub',
      ],
    ) ??
    fallback?.id;

  const correo =
    readString(
      value,
      [
        'correo',
        'email',
      ],
    ) ??
    fallback?.correo;

  /*
   * Para validar una sesión son esenciales
   * el identificador y el correo.
   *
   * Nombre, apellido y rol pueden venir
   * del usuario almacenado por el login.
   */
  if (
    typeof id !== 'number' ||
    !correo
  ) {
    console.error(
      'Respuesta de usuario no reconocida:',
      value,
    );

    throw new AuthApiError(
      'El backend no devolvió el identificador o correo del usuario.',
      500,
      value,
    );
  }

  return {
    id,

    nombre:
      readString(
        value,
        [
          'nombre',
          'nombres',
          'name',
        ],
      ) ??
      fallback?.nombre ??
      '',

    apellido:
      readString(
        value,
        [
          'apellido',
          'apellidos',
          'lastName',
        ],
      ) ??
      fallback?.apellido ??
      '',

    correo,

    estado:
      readString(
        value,
        ['estado'],
      ) ??
      fallback?.estado,

    rol: normalizeRole(
      value,
      fallback?.rol,
    ),
  };
}

export async function login(
  credentials: LoginRequest,
): Promise<LoginResponse> {
  let response: Response;

  try {
    response = await fetch(
      `${API_URL}/auth/login`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',

          Accept:
            'application/json',
        },

        body: JSON.stringify({
          correo: credentials.correo
            .trim()
            .toLowerCase(),

          contrasena:
            credentials.contrasena,
        }),
      },
    );
  } catch (error) {
    throw new AuthApiError(
      'No fue posible conectar con el servidor.',
      0,
      error,
    );
  }

  const body = await readJson(
    response,
  );

  if (!response.ok) {
    throw new AuthApiError(
      getErrorMessage(
        body,
        response.status === 401
          ? 'Correo o contraseña incorrectos.'
          : 'No fue posible iniciar sesión.',
      ),
      response.status,
      body,
    );
  }

  if (
    !isRecord(body) ||
    typeof body.accessToken !== 'string'
  ) {
    throw new AuthApiError(
      'El backend no devolvió el token de acceso.',
      response.status,
      body,
    );
  }

  const rawUser =
    extractUserPayload(body);

  const usuario =
    normalizeAuthUser(rawUser);

  /*
   * Esta es la corrección del error:
   *
   * No se llama saveAccessToken directamente.
   * Se guarda token y usuario conjuntamente.
   */
  saveAuthSession(
    body.accessToken,
    usuario,
  );

  return {
    accessToken:
      body.accessToken,

    tokenType:
      body.tokenType === 'Bearer'
        ? 'Bearer'
        : 'Bearer',

    expiresIn:
      typeof body.expiresIn === 'number'
        ? body.expiresIn
        : undefined,

    usuario,
  };
}

export async function obtenerUsuarioActual(): Promise<AuthUser> {
  const token = getAccessToken();

  if (!token) {
    throw new AuthApiError(
      'No existe una sesión almacenada.',
      401,
    );
  }

  const cachedUser =
    getStoredAuthUser() ??
    undefined;

  let response: Response;

  try {
    response = await fetch(
      `${API_URL}/auth/me`,
      {
        method: 'GET',

        headers: {
          Accept:
            'application/json',

          ...getAuthHeader(),
        },
      },
    );
  } catch (error) {
    throw new AuthApiError(
      'No fue posible conectar con el servidor.',
      0,
      error,
    );
  }

  const body = await readJson(
    response,
  );

  if (response.status === 401) {
    clearAuthSession();

    throw new AuthApiError(
      'La sesión venció. Inicia sesión nuevamente.',
      401,
      body,
    );
  }

  if (!response.ok) {
    throw new AuthApiError(
      getErrorMessage(
        body,
        'No fue posible recuperar la sesión.',
      ),
      response.status,
      body,
    );
  }

  const rawUser =
    extractUserPayload(body);

  /*
   * Mezcla la respuesta de /me con el
   * usuario almacenado por el login.
   *
   * Esto permite que /me devuelva solamente:
   * sub, correo y rol.
   */
  const usuario =
    normalizeAuthUser(
      rawUser,
      cachedUser,
    );

  saveAuthUser(usuario);

  return usuario;
}

export function logout(): void {
  clearAuthSession();
}