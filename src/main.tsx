import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {RegisterPage} from './components/RegisterPage.tsx';
import './index.css';

// Lightweight path-based routing. This is a Vite SPA with no router, and the
// pre-registration flow is a standalone page, so a single pathname check keeps
// the rest of the app untouched. vercel.json rewrites /register -> index.html
// so a direct visit (and referral links like /register?ref=CODE) load here too.
const path = window.location.pathname.replace(/\/+$/, '') || '/';
const isRegister = path === '/register';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isRegister ? <RegisterPage /> : <App />}
  </StrictMode>,
);
