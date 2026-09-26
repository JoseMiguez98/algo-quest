interface Hit {
  path: string;
  title?: string;
  event?: boolean;
}

interface GoatCounter {
  no_onload?: boolean;
  count?: (hit: Hit) => void;
}

declare global {
  interface Window {
    goatcounter?: GoatCounter;
  }
}

const endpoint = import.meta.env.VITE_GOATCOUNTER as string | undefined;

export const isDevEnvironment = import.meta.env.VITE_ENV === 'dev';

const enabled = (): boolean =>
  Boolean(endpoint) &&
  import.meta.env.PROD &&
  !isDevEnvironment &&
  navigator.doNotTrack !== '1' &&
  !/^(localhost|127\.0\.0\.1|\[::1\])$|\.(localhost|test)$/.test(location.hostname);

const sent = new Set<string>();
let queue: Hit[] = [];
let loading = false;

function load(): void {
  if (loading) return;
  loading = true;
  window.goatcounter = { ...window.goatcounter, no_onload: true };
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://gc.zgo.at/count.js';
  script.dataset.goatcounter = endpoint;
  script.addEventListener('load', () => {
    queue.forEach((hit) => window.goatcounter?.count?.(hit));
    queue = [];
  });
  document.head.append(script);
}

function send(hit: Hit): void {
  if (!enabled() || sent.has(hit.path)) return;
  sent.add(hit.path);
  if (window.goatcounter?.count) window.goatcounter.count(hit);
  else {
    queue.push(hit);
    load();
  }
}

/** Page view with a base-less clean path, so dev and prod builds report the same routes. */
export function trackPage(path: string, title = document.title): void {
  send({ path, title });
}

/** Engagement event, counted once per page load. */
export function track(event: string): void {
  send({ path: event, title: event, event: true });
}
