/**
 * Server-render entry point, used only at build time by scripts/prerender.mjs.
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
 */

import { renderToString } from 'react-dom/server';
import App from './App';

export function render(): string {
  return renderToString(<App />);
}
