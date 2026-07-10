import { useEffect, useState } from 'react';
import HostApp from './host/HostApp.jsx';
import LocalScreen from './host/LocalScreen.jsx';
import ControllerApp from './controller/ControllerApp.jsx';

// Routing po hashu (działa ze statycznym hostingiem w podkatalogu):
//   #/          → host (tryb imprezowy: lobby + QR)
//   #/local     → tryb lokalny na klawiaturze
//   #/pad/KOD   → pad na telefonie
function parseRoute() {
  const hash = window.location.hash || '#/';
  const pad = hash.match(/^#\/pad\/([A-Z0-9]{4})/i);
  if (pad) return { view: 'pad', code: pad[1].toUpperCase() };
  if (hash.startsWith('#/local')) return { view: 'local' };
  return { view: 'host' };
}

export default function App() {
  const [route, setRoute] = useState(parseRoute);
  useEffect(() => {
    const onHash = () => setRoute(parseRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (route.view === 'pad') return <ControllerApp code={route.code} />;
  if (route.view === 'local') return <LocalScreen />;
  return <HostApp />;
}
