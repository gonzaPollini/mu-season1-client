import { Layout } from './components/Layout';
import { useRoute } from './lib/hooks';
import { Login, Panel } from './pages/Account';
import { Coins } from './pages/Coins';
import { Home } from './pages/Home';
import { Info } from './pages/Info';
import { Rankings } from './pages/Rankings';
import { Register } from './pages/Register';
import { Terms } from './pages/Terms';

/** Router por hash, sin librerías: `#/rankings`, `#/info`, etc. */
const PAGES: Record<string, () => JSX.Element> = {
  '': Home,
  registro: Register,
  login: Login,
  panel: Panel,
  rankings: Rankings,
  recargar: Coins,
  info: Info,
  terminos: Terms,
};

export function App() {
  const route = useRoute();
  const Page = PAGES[route] ?? Home;
  return <Layout route={route}><Page /></Layout>;
}
