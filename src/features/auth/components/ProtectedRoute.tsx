import {
  Navigate,
  Outlet,
} from 'react-router-dom';

import {
  Loader2,
  RefreshCw,
} from 'lucide-react';

import {
  useAuth,
} from '../context/AuthContext';

export default function ProtectedRoute() {
  const {
    authStatus,
    sessionError,
    refreshSession,
  } = useAuth();

  if (authStatus === 'checking') {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            'var(--background)',

          color:
            'var(--foreground)',
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={24}
            className="animate-spin"
            style={{
              color: 'var(--gold)',
            }}
          />

          <span className="text-sm">
            Restaurando sesión...
          </span>
        </div>
      </div>
    );
  }

  if (
    authStatus ===
    'unauthenticated'
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (authStatus === 'error') {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          background:
            'var(--background)',

          color:
            'var(--foreground)',
        }}
      >
        <div
          className="w-full max-w-md rounded-xl p-6 text-center"
          style={{
            background:
              'var(--card)',

            border:
              '1px solid var(--border)',
          }}
        >
          <h2
            className="text-lg font-semibold"
            style={{
              color:
                'var(--gold)',
            }}
          >
            No fue posible validar la sesión
          </h2>

          <p
            className="text-sm mt-2"
            style={{
              color:
                'var(--muted-foreground)',
            }}
          >
            {sessionError ??
              'Verifica la conexión con el servidor.'}
          </p>

          <button
            type="button"
            onClick={() => {
              void refreshSession();
            }}
            className="mt-5 px-4 py-2 rounded text-sm inline-flex items-center gap-2"
            style={{
              background:
                'var(--gold)',

              color:
                'var(--primary-foreground)',
            }}
          >
            <RefreshCw size={15} />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}