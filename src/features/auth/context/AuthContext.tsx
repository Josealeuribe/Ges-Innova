import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  AuthApiError,
  login as loginRequest,
  obtenerUsuarioActual,
} from '../services/auth.service';

import {
  clearAuthSession,
  getAccessToken,
  getStoredAuthUser,
  saveAuthUser,
} from '../services/auth-token';

import type {
  AuthUser,
} from '../types/auth.types';

type AuthStatus =
  | 'checking'
  | 'authenticated'
  | 'unauthenticated'
  | 'error';

interface AuthContextValue {
  usuario: AuthUser | null;

  authStatus: AuthStatus;

  isAuthenticated: boolean;
  isLoading: boolean;

  sessionError: string | null;

  login: (
    correo: string,
    contrasena: string,
  ) => Promise<void>;

  logout: () => void;

  refreshSession: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext =
  createContext<AuthContextValue | null>(
    null,
  );

function getInitialStatus(): AuthStatus {
  const token = getAccessToken();
  const storedUser =
    getStoredAuthUser();

  if (!token) {
    return 'unauthenticated';
  }

  if (storedUser) {
    return 'authenticated';
  }

  return 'checking';
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  /*
   * El usuario se restaura inmediatamente
   * desde localStorage, antes de consultar /me.
   */
  const [
    usuario,
    setUsuario,
  ] = useState<AuthUser | null>(
    () => getStoredAuthUser(),
  );

  const [
    authStatus,
    setAuthStatus,
  ] = useState<AuthStatus>(
    () => getInitialStatus(),
  );

  const [
    sessionError,
    setSessionError,
  ] = useState<string | null>(
    null,
  );

  const sessionInitializedRef =
    useRef(false);

  const refreshSession =
    useCallback(async (): Promise<void> => {
      const token = getAccessToken();
      const cachedUser =
        getStoredAuthUser();

      if (!token) {
        clearAuthSession();
        setUsuario(null);
        setAuthStatus(
          'unauthenticated',
        );
        setSessionError(null);

        return;
      }

      /*
       * Si hay usuario almacenado, la interfaz
       * puede continuar abierta mientras /me
       * valida la sesión en segundo plano.
       */
      if (cachedUser) {
        setUsuario(cachedUser);
        setAuthStatus(
          'authenticated',
        );
      } else {
        setAuthStatus('checking');
      }

      setSessionError(null);

      try {
        const currentUser =
          await obtenerUsuarioActual();

        saveAuthUser(currentUser);
        setUsuario(currentUser);

        setAuthStatus(
          'authenticated',
        );
      } catch (error) {
        /*
         * Solo un 401 debe cerrar realmente
         * la sesión y enviar al login.
         */
        if (
          error instanceof AuthApiError &&
          error.status === 401
        ) {
          clearAuthSession();
          setUsuario(null);

          setAuthStatus(
            'unauthenticated',
          );

          setSessionError(null);

          return;
        }

        console.error(
          'No fue posible validar la sesión:',
          error,
        );

        /*
         * En errores de red, 404 o 500:
         * conserva la sesión almacenada.
         */
        if (cachedUser) {
          setUsuario(cachedUser);

          setAuthStatus(
            'authenticated',
          );

          setSessionError(
            'No fue posible validar la sesión con el servidor.',
          );

          return;
        }

        /*
         * Existe token, pero no hay usuario
         * almacenado. No redirige al login:
         * muestra una pantalla para reintentar.
         */
        setUsuario(null);
        setAuthStatus('error');

        setSessionError(
          error instanceof Error
            ? error.message
            : 'No fue posible validar la sesión.',
        );
      }
    }, []);

  useEffect(() => {
    if (
      sessionInitializedRef.current
    ) {
      return;
    }

    sessionInitializedRef.current =
      true;

    void refreshSession();
  }, [refreshSession]);

  const login = useCallback(
    async (
      correo: string,
      contrasena: string,
    ): Promise<void> => {
      setSessionError(null);

      const response =
        await loginRequest({
          correo,
          contrasena,
        });

      setUsuario(
        response.usuario,
      );

      setAuthStatus(
        'authenticated',
      );
    },
    [],
  );

  const logout = useCallback((): void => {
    clearAuthSession();

    setUsuario(null);

    setAuthStatus(
      'unauthenticated',
    );

    setSessionError(null);
  }, []);

  const isAuthenticated =
    authStatus ===
    'authenticated';

  const isLoading =
    authStatus === 'checking';

  const value =
    useMemo<AuthContextValue>(
      () => ({
        usuario,
        authStatus,
        isAuthenticated,
        isLoading,
        sessionError,
        login,
        logout,
        refreshSession,
      }),
      [
        usuario,
        authStatus,
        isAuthenticated,
        isLoading,
        sessionError,
        login,
        logout,
        refreshSession,
      ],
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth debe utilizarse dentro de AuthProvider.',
    );
  }

  return context;
}