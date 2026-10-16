import { useCallback, useEffect, useRef, useState } from 'react';

/** Reloj compartido: un solo intervalo de 1 s para todas las cuentas regresivas. */
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

export function useNow(): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const fn = () => setNow(Date.now());
    listeners.add(fn);
    if (!timer) timer = setInterval(() => listeners.forEach((l) => l()), 1000);
    return () => {
      listeners.delete(fn);
      if (!listeners.size && timer) { clearInterval(timer); timer = undefined; }
    };
  }, []);
  return now;
}

/** Carga asíncrona con estado; `reload` reintenta. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<{ data?: T; error?: string; loading: boolean }>({ loading: true });
  const [tick, setTick] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps);
  useEffect(() => {
    let alive = true;
    setState((s) => ({ data: s.data, loading: true }));
    run().then(
      (data) => alive && setState({ data, loading: false }),
      (e: unknown) => alive && setState({ error: e instanceof Error ? e.message : 'Error', loading: false })
    );
    return () => { alive = false; };
  }, [run, tick]);
  return { ...state, reload: () => setTick((t) => t + 1) };
}

/** Marca `visible` cuando el elemento entra en pantalla (una sola vez). */
export function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { setVisible(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);
  return [ref, visible] as const;
}

/** Cuenta de 0 a `target` cuando `active`. Respeta prefers-reduced-motion. */
export function useCountUp(target: number, active: boolean, ms = 1400): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setV(target); return; }
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, active, ms]);
  return v;
}

/** Ruta por hash: `#/rankings` -> `rankings`. */
export function useRoute(): string {
  const read = () => (window.location.hash.replace(/^#\/?/, '').split('?')[0] || '');
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const fn = () => { setRoute(read()); window.scrollTo({ top: 0 }); };
    window.addEventListener('hashchange', fn);
    return () => window.removeEventListener('hashchange', fn);
  }, []);
  return route;
}
