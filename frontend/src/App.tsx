import { Routes, Route } from 'react-router-dom';
import { GoogleGate } from './components/GoogleGate';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Capsula } from './pages/Capsula';
import { JuegoHost } from './pages/JuegoHost';
import { JuegoJoin } from './pages/JuegoJoin';
import { JuegoMenu } from './pages/JuegoMenu';
import { FlappyAxolot } from './pages/FlappyAxolot';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route
          path="/capsula"
          element={
            <GoogleGate requireCapsuleOwner>
              {(user, idToken) => <Capsula user={user} idToken={idToken} />}
            </GoogleGate>
          }
        />
        <Route path="/juego" element={<JuegoMenu />} />
        <Route path="/juego/kahoot" element={<JuegoJoin />} />
        <Route path="/juego/host" element={<JuegoHost />} />
        <Route path="/juego/flappy" element={<FlappyAxolot />} />
      </Route>
    </Routes>
  );
}

export default App;
