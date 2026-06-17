import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { verifyGoogleToken, type VerifiedUser } from '../lib/api';
import { useDarkMode } from '../hooks/useDarkMode';

type Props = {
  requireCapsuleOwner?: boolean;
  children: (user: VerifiedUser) => React.ReactNode;
};

export function GoogleGate({ requireCapsuleOwner, children }: Props) {
  const [user, setUser] = useState<VerifiedUser | null>(null);
  const [denied, setDenied] = useState(false);
  const [error, setError] = useState(false);
  const { isDark } = useDarkMode();

  if (user) return <>{children(user)}</>;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl border-2 border-brand-pink/30 bg-white p-8 shadow-2xl shadow-pink-200/40 dark:border-white/15 dark:bg-white/10 dark:shadow-purple-950/40">
        {denied ? (
          <p className="text-lg text-rose-500 dark:text-rose-300">
            Este enlace es solo para una persona muy especial. Si crees que es
            un error, habla con quien te lo mandó 💜
          </p>
        ) : (
          <>
            <span className="text-4xl">🔐</span>
            <p className="text-balance text-black/70 dark:text-white/80">
              Inicia sesión con Google para continuar
            </p>
            <GoogleLogin
              theme={isDark ? 'filled_black' : 'outline'}
              shape="pill"
              onSuccess={async (credential) => {
                if (!credential.credential) return;
                try {
                  const { user, isCapsuleOwner } = await verifyGoogleToken(
                    credential.credential,
                  );
                  if (requireCapsuleOwner && !isCapsuleOwner) {
                    setDenied(true);
                    return;
                  }
                  setUser(user);
                } catch {
                  setError(true);
                }
              }}
              onError={() => setError(true)}
            />
            {error && (
              <p className="text-sm text-rose-500 dark:text-rose-300">
                Algo falló verificando tu sesión, inténtalo de nuevo.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
