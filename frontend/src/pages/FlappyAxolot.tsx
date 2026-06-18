import { GoogleGate } from '../components/GoogleGate';
import { FlappyGame } from '../components/FlappyGame';

export function FlappyAxolot() {
  return (
    <GoogleGate>
      {(user) => (
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 p-6 py-16">
          <FlappyGame name={user.name} />
        </div>
      )}
    </GoogleGate>
  );
}
