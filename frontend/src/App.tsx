import { Routes, Route } from 'react-router-dom';
import { GoogleGate } from './components/GoogleGate';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Capsula } from './pages/Capsula';
import { JuegoHost } from './pages/JuegoHost';
import { JuegoJoin } from './pages/JuegoJoin';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route
          path="/capsula"
          element={
            <GoogleGate requireCapsuleOwner>
              {(user) => <Capsula user={user} />}
            </GoogleGate>
          }
        />
        <Route path="/juego/host" element={<JuegoHost />} />
        <Route path="/juego" element={<JuegoJoin />} />
      </Route>
    </Routes>
  );
}

export default App;
