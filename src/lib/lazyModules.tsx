import React, { useEffect, useState } from 'react';

/**
 * Code-split screens.
 *
 * WHY THIS EXISTS
 * ---------------
 * Everything used to ship in one ~700 kB script, so the homepage paid for
 * Supabase, the venue catalogue, every quiz and every blog post before it
 * could respond to a tap. Each screen below now lives in its own chunk and
 * loads only when needed:
 *
 *  - Route pages (/terms, /blog/:slug, /kid-plans ...): src/main.tsx loads
 *    the chunk for the current URL BEFORE the first render, so the
 *    prerendered HTML stays on screen until React can paint the same page.
 *    No blank flash.
 *  - Quiz modals (Swoon Her, Self Care, Kid Plans): load on first open, and
 *    are prefetched as soon as the visitor first interacts with the page.
 *  - Build-time SSR: src/entry-server.tsx calls preloadAll() before
 *    rendering, so prerendered pages still contain their full content.
 *
 * Adding a screen: add a loader here, render it with <Lazy k="..."/>, and if
 * it owns a URL, map that URL in keysForLocation().
 */
const LOADERS = {
  date: () => import('../components/DateConciergeApp').then((m) => m.DateConciergeApp),
  selfCare: () => import('../components/SelfCareConciergeApp').then((m) => m.SelfCareConciergeApp),
  kidPlans: () => import('../components/KidPlansConciergeApp').then((m) => m.KidPlansConciergeApp),
  swoonType: () => import('../components/SwoonTypeFlow').then((m) => m.SwoonTypeFlow),
  register: () => import('../components/RegisterPage').then((m) => m.RegisterPage),
  welcome: () => import('../components/WelcomePage').then((m) => m.WelcomePage),
  terms: () => import('../components/TermsPage').then((m) => m.TermsPage),
  privacy: () => import('../components/PrivacyPage').then((m) => m.PrivacyPage),
  blogPost: () => import('../components/BlogPostPage').then((m) => m.BlogPostPage),
  blogIndex: () => import('../components/BlogSection').then((m) => m.BlogSection),
  itineraries: () => import('../components/ItinerariesSection').then((m) => m.ItinerariesSection),
};

export type LazyKey = keyof typeof LOADERS;
type Loaded<K extends LazyKey> = Awaited<ReturnType<(typeof LOADERS)[K]>>;

const cache: Partial<Record<LazyKey, React.ComponentType<any>>> = {};
const inflight: Partial<Record<LazyKey, Promise<React.ComponentType<any>>>> = {};

export function loadLazy<K extends LazyKey>(key: K): Promise<Loaded<K>> {
  const hit = cache[key];
  if (hit) return Promise.resolve(hit as Loaded<K>);
  if (!inflight[key]) {
    inflight[key] = LOADERS[key]()
      .then((Comp) => {
        cache[key] = Comp as React.ComponentType<any>;
        return Comp as React.ComponentType<any>;
      })
      .catch((err) => {
        // Let a later attempt retry (e.g. after a flaky mobile connection).
        delete inflight[key];
        throw err;
      });
  }
  return inflight[key] as Promise<Loaded<K>>;
}

/** Build-time only: load every chunk so renderToString can render any route. */
export function preloadAll(): Promise<unknown> {
  return Promise.all((Object.keys(LOADERS) as LazyKey[]).map((k) => loadLazy(k)));
}

/** The chunks a URL needs for its very first render. */
export function keysForLocation(pathname: string, search: string): LazyKey[] {
  const path = pathname.replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(search);
  if (/^\/blog\/[^/]+$/.test(path)) return ['blogPost'];
  const byPath: Partial<Record<string, LazyKey>> = {
    '/blog': 'blogIndex',
    '/terms': 'terms',
    '/privacy': 'privacy',
    '/welcome': 'welcome',
    '/register': 'register',
    '/swoon-type': 'swoonType',
    '/kid-plans': 'kidPlans',
  };
  const keys: LazyKey[] = [];
  const routeKey = byPath[path];
  if (routeKey) keys.push(routeKey);
  if (path === '/') {
    // Deep links that open a flow straight away (magic links, ?tab=blog).
    if (params.get('tab') === 'blog') keys.push('blogIndex');
    if (params.get('app') === '1') keys.push('date');
    if (params.get('selfcare') === '1') keys.push('selfCare');
    if (params.get('kidplans') === '1') keys.push('kidPlans');
  }
  return keys;
}

export function preloadForLocation(pathname: string, search: string): Promise<unknown> {
  // Never block the first render on a failed chunk: <Lazy> retries on mount.
  return Promise.all(keysForLocation(pathname, search).map((k) => loadLazy(k))).catch(() => undefined);
}

/**
 * Warm the quiz chunks the first time the visitor interacts with the page,
 * so tapping "Begin" opens instantly without costing anything up front.
 */
export function prefetchOnIntent(): void {
  if (typeof window === 'undefined') return;
  const events = ['pointerdown', 'touchstart', 'keydown', 'scroll', 'mousemove'] as const;
  const go = () => {
    events.forEach((e) => window.removeEventListener(e, go));
    (['date', 'selfCare', 'kidPlans'] as LazyKey[]).forEach((k) => {
      loadLazy(k).catch(() => undefined);
    });
  };
  events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
}

type LazyProps<K extends LazyKey> = {
  k: K;
  /** false: fetch and render nothing until it flips true. Once loaded, the component stays mounted. */
  load?: boolean;
  /** Shown while the chunk downloads (only when load is true). */
  fallback?: React.ReactNode;
} & React.ComponentProps<Loaded<K>>;

const RELOAD_KEY = 'sp-chunk-reload-at';

/**
 * Every push to main redeploys the site (the daily growth-engine log commit
 * included), and chunk files from the previous build stop existing. A visitor
 * who loaded the page before a deploy would then fail to open a quiz. One
 * page reload fetches the new HTML and chunk names. Guarded so a real outage
 * can never cause a reload loop.
 */
export function reloadForNewDeploy(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const last = Number(window.sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < 60_000) return false;
    window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

export function Lazy<K extends LazyKey>({ k, load = true, fallback = null, ...props }: LazyProps<K>) {
  const [Comp, setComp] = useState<React.ComponentType<any> | null>(() => cache[k] ?? null);
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (Comp || !load || failed) return;
    let alive = true;
    loadLazy(k)
      .then((C) => {
        if (alive) setComp(() => C as React.ComponentType<any>);
      })
      .catch(() => {
        if (!alive) return;
        // One quiet retry covers a dropped connection mid-download; after
        // that, assume a new deploy replaced the chunk and reload once.
        if (attempt < 1) setTimeout(() => alive && setAttempt((a) => a + 1), 1500);
        else if (!reloadForNewDeploy()) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [k, load, Comp, attempt, failed]);

  if (!Comp) {
    if (!load) return null;
    // Modals pass isOpen; a closed modal shows nothing even after a failure.
    const wanted = (props as { isOpen?: boolean }).isOpen ?? true;
    if (failed) {
      return wanted ? (
        <LoadError
          onRetry={() => {
            setAttempt(0);
            setFailed(false);
          }}
          onClose={(props as { onClose?: () => void }).onClose}
        />
      ) : null;
    }
    return <>{fallback}</>;
  }
  return <Comp {...props} />;
}

function LoadError({ onRetry, onClose }: { onRetry: () => void; onClose?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1816]/60 backdrop-blur-sm px-6">
      <div role="alertdialog" aria-label="Could not load" className="w-full max-w-sm rounded-lg bg-[#FAF8F5] p-6 text-center font-sans shadow-xl">
        <p className="text-sm text-[#1A1816]">We couldn't load this just now. Check your connection and try again.</p>
        <div className="mt-5 flex justify-center gap-3">
          <button
            onClick={onRetry}
            className="rounded bg-[#1A1816] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-[#D5C29F] cursor-pointer"
          >
            Try again
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded border border-[#E8E2D9] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-[#1A1816] cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Full-screen spinner shown for the split second a quiz chunk is still downloading. */
export function ModalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1816]/40 backdrop-blur-sm">
      <div
        role="status"
        aria-label="Loading"
        className="h-9 w-9 animate-spin rounded-full border-2 border-white/40 border-t-white"
      />
    </div>
  );
}
