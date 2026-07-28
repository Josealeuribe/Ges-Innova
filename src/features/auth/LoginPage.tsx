import {
  useState,
  type FormEvent,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import logoImg from '@/imports/logo.png';

import {
  AuthApiError,
} from './services/auth.service';

import {
  useAuth,
} from './context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();

  const {
    login,
  } = useAuth();

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setError('');

    const normalizedEmail =
      email.trim().toLowerCase();

    if (
      !normalizedEmail ||
      !password
    ) {
      setError(
        'Por favor completa todos los campos.',
      );

      return;
    }

    setLoading(true);

    try {
      await login(
        normalizedEmail,
        password,
      );

      navigate('/', {
        replace: true,
      });
    } catch (
      requestError: unknown
    ) {
      if (
        requestError instanceof
        AuthApiError
      ) {
        setError(
          requestError.message,
        );
      } else if (
        requestError instanceof Error
      ) {
        setError(
          requestError.message,
        );
      } else {
        setError(
          'Ocurrió un error inesperado al iniciar sesión.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        background:
          'var(--background)',
      }}
    >
      {/* Panel izquierdo decorativo */}
      <div
        className="
          hidden
          lg:flex
          lg:w-1/2
          flex-col
          items-center
          justify-center
          relative
          overflow-hidden
        "
        style={{
          background:
            'linear-gradient(160deg, #0e0e1a 0%, #07070f 100%)',
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at center, rgba(200,168,75,0.4) 1px, transparent 1px)',

            backgroundSize:
              '32px 32px',
          }}
        />

        <div
          className="
            absolute
            top-1/4
            left-1/3
            w-96
            h-96
            rounded-full
            opacity-10
            blur-3xl
          "
          style={{
            background:
              'var(--gold)',
          }}
        />

        <div className="relative z-10 text-center px-12">
          <img
            src={logoImg}
            alt="Innova Club"
            className="
              w-44
              h-44
              mx-auto
              mb-10
              object-contain
            "
          />

          <h1
            className="
              font-display
              text-5xl
              font-semibold
              mb-4
              tracking-widest
            "
            style={{
              color:
                'var(--gold)',
            }}
          >
            INNOVA CLUB
          </h1>

          <p
            className="text-lg tracking-wider"
            style={{
              color:
                'var(--muted-foreground)',
            }}
          >
            Sistema de Gestión Administrativa
          </p>

          <div className="mt-10 flex items-center gap-4 justify-center">
            <div
              className="h-px w-16"
              style={{
                background:
                  'var(--gold-dim)',
              }}
            />

            <span
              className="text-xs tracking-widest"
              style={{
                color:
                  'var(--gold-dim)',
              }}
            >
              GES · INNOVA
            </span>

            <div
              className="h-px w-16"
              style={{
                background:
                  'var(--gold-dim)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Panel derecho */}
      <div
        className="
          flex-1
          flex
          items-center
          justify-center
          p-8
        "
        style={{
          background:
            'var(--card)',
        }}
      >
        <div className="w-full max-w-md">
          <div className="flex lg:hidden justify-center mb-8">
            <img
              src={logoImg}
              alt="Innova Club"
              className="
                w-20
                h-20
                object-contain
              "
            />
          </div>

          <div className="mb-10">
            <h2
              className="
                font-display
                text-3xl
                font-semibold
                tracking-wider
                mb-2
              "
              style={{
                color:
                  'var(--gold)',
              }}
            >
              Bienvenido
            </h2>

            <p
              className="text-sm"
              style={{
                color:
                  'var(--muted-foreground)',
              }}
            >
              Inicia sesión para acceder
              al panel administrativo
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="login-email"
                className="
                  block
                  text-xs
                  font-medium
                  tracking-widest
                  uppercase
                  mb-2
                "
                style={{
                  color:
                    'var(--muted-foreground)',
                }}
              >
                Correo
              </label>

              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
                placeholder="admin@innovaclub.co"
                autoComplete="email"
                disabled={loading}
                className="
                  w-full
                  px-4
                  py-3
                  rounded
                  text-sm
                  outline-none
                  transition-all
                  disabled:opacity-60
                "
                style={{
                  background:
                    'var(--muted)',

                  border:
                    '1px solid var(--border)',

                  color:
                    'var(--foreground)',
                }}
                onFocus={(event) => {
                  event.currentTarget.style.borderColor =
                    'var(--gold)';
                }}
                onBlur={(event) => {
                  event.currentTarget.style.borderColor =
                    'var(--border)';
                }}
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="
                  block
                  text-xs
                  font-medium
                  tracking-widest
                  uppercase
                  mb-2
                "
                style={{
                  color:
                    'var(--muted-foreground)',
                }}
              >
                Contraseña
              </label>

              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                className="
                  w-full
                  px-4
                  py-3
                  rounded
                  text-sm
                  outline-none
                  transition-all
                  disabled:opacity-60
                "
                style={{
                  background:
                    'var(--muted)',

                  border:
                    '1px solid var(--border)',

                  color:
                    'var(--foreground)',
                }}
                onFocus={(event) => {
                  event.currentTarget.style.borderColor =
                    'var(--gold)';
                }}
                onBlur={(event) => {
                  event.currentTarget.style.borderColor =
                    'var(--border)';
                }}
              />
            </div>

            {error && (
              <div
                role="alert"
                className="
                  text-xs
                  px-3
                  py-3
                  rounded
                "
                style={{
                  background:
                    '#2a0a0a',

                  color:
                    '#f87171',

                  border:
                    '1px solid rgba(248, 113, 113, 0.25)',
                }}
              >
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                className="
                  text-xs
                  transition-colors
                "
                style={{
                  color:
                    'var(--gold-dim)',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.color =
                    'var(--gold)';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.color =
                    'var(--gold-dim)';
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                py-3
                rounded
                font-display
                text-sm
                font-semibold
                tracking-widest
                uppercase
                transition-all
                mt-2
                disabled:cursor-not-allowed
              "
              style={{
                background: loading
                  ? 'var(--gold-dim)'
                  : 'var(--gold)',

                color:
                  'var(--primary-foreground)',

                opacity:
                  loading
                    ? 0.8
                    : 1,
              }}
            >
              {loading
                ? 'Verificando...'
                : 'Ingresar'}
            </button>
          </form>

          <p
            className="text-center text-xs mt-10"
            style={{
              color:
                'var(--muted-foreground)',
            }}
          >
            GES-INNOVA © 2026 · Todos
            los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
}