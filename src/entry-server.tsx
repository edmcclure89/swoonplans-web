/**
 * Server-render entry point, used only at build time by scripts/prerender.mjs,
 * scripts/prerender-pages.mjs and scripts/prerender-blog.mjs.
 *
 * WHY THIS EXISTS
 * ---------------
 * This site is a client-rendered Vite SPA. Before this file existed, the server
 * returned an empty <div id="root"></div> and every word of content was painted
 * in by JavaScript after load.
 *
 * AI crawlers do not execute JavaScript. GPTBot, ClaudeBot, PerplexityBot and
 * OAI-SearchBot all read the raw HTML response only. That meant ChatGPT, Claude
 * and Perplexity saw a completely blank page at makeherswoon.com and had nothing
 * to index, quote, or cite.
 *
 * This renders <App /> to a static HTML string at build time so the real content
 * ships inside index.html. The browser still boots the full React app on top of
 * it exactly as before, so runtime behaviour is unchanged.
 *
 * Code-split screens: callers MUST `await preloadAll()` once before render(),
 * otherwise lazily loaded routes (blog, legal, quizzes) render empty.
 */

import { renderToString } from 'react-dom/server';
import App from './App';
import { preloadAll } from './lib/lazyModules';

export { preloadAll };

export function render(path: string = '/'): string {
  return renderToString(<App ssrPath={path} />);
}
