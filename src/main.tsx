import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {preloadForLocation, prefetchOnIntent, reloadForNewDeploy} from './lib/lazyModules';
import './index.css';

// Vite fires this when a code-split chunk fails to preload, which almost
// always means a deploy replaced it. Reload once rather than break the screen.
window.addEventListener('vite:preloadError', (event) => {
  if (reloadForNewDeploy()) event.preventDefault();
});

// Most screens are code-split (src/lib/lazyModules.tsx). Fetch the chunk this
// URL needs BEFORE the first render: until React renders, the prerendered
// HTML stays on screen, so there is no blank flash on /terms, /blog/... etc.
preloadForLocation(window.location.pathname, window.location.search).finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});

// Warm the quiz chunks on the visitor's first interaction.
prefetchOnIntent();
