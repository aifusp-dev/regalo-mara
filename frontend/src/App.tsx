import { Routes, Route } from 'react-router-dom';
import { GoogleGate } from './components/GoogleGate';
import { Capsula } from './pages/Capsula';
import { JuegoHost } from './pages/JuegoHost';
import { JuegoJoin } from './pages/JuegoJoin';

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <GoogleGate requireCapsuleOwner>
            {(user) => <Capsula user={user} />}
          </GoogleGate>
        }
      />
      <Route path="/juego/host" element={<JuegoHost />} />
      <Route path="/juego" element={<JuegoJoin />} />
    </Routes>
  );
}

export default App;
