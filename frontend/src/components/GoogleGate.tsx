import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import {
  verifyGoogleToken,
  loadStoredSession,
  saveStoredSession,
  type VerifiedUser,
} from '../lib/api';
import { useDarkMode } from '../hooks/useDarkMode';
import ajoloteAzul from '../assets/ajoloteazul.png';

type Props = {
  requireCapsuleOwner?: boolean;
  children: (user: VerifiedUser, idToken: string) => React.ReactNode;
};

export function GoogleGate({ requireCapsuleOwner, children }: Props) {
  const stored = loadStoredSession();
  const usableStored = stored && (!requireCapsuleOwner || stored.isCapsuleOwner) ? stored : null;

  const [user, setUser] = useState<VerifiedUser | null>(usableStored?.user ?? null);
  const [idToken, setIdToken] = useState<string | null>(usableStored?.sessionToken ?? null);
  const [denied, setDenied] = useState(
    !!(stored && requireCapsuleOwner && !stored.isCapsuleOwner),
  );
  const [error, setError] = useState(false);
  const { isDark } = useDarkMode();

  if (user && idToken) return <>{children(user, idToken)}</>;

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
            <img
              src={ajoloteAzul}
              alt="Ajolote azul"
              className="animate-float w-20 [image-rendering:pixelated]"
            />
            <p className="text-balance text-black/70 dark:text-white/80">
              Inicia sesión con Google para continuar
            </p>
            <GoogleLogin
              theme={isDark ? 'filled_black' : 'outline'}
              shape="pill"
              onSuccess={async (credential) => {
                if (!credential.credential) return;
                try {
                  const { user, isCapsuleOwner, sessionToken } = await verifyGoogleToken(
                    credential.credential,
                  );
                  if (requireCapsuleOwner && !isCapsuleOwner) {
                    setDenied(true);
                    return;
                  }
                  saveStoredSession({ user, isCapsuleOwner, sessionToken });
                  setIdToken(sessionToken);
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
