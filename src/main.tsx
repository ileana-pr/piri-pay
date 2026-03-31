import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Buffer } from 'buffer';
import './index.css';
import { applyThemeToDocument, readStoredPreference } from './lib/theme';

applyThemeToDocument(readStoredPreference());

window.Buffer = Buffer;

function showBootError(err: unknown, rootEl: HTMLElement) {
  const dark = document.documentElement.classList.contains('dark');
  const message = err instanceof Error ? err.message : String(err);
  const detail =
    err instanceof Error && err.stack
      ? `${message}\n\n--- stack ---\n${err.stack}`
      : message;
  rootEl.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.style.cssText = dark
    ? 'min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,sans-serif;background:#161311;color:#faf6f0'
    : 'min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,sans-serif;background:#FFFBF2;color:#2D0A00';
  const card = document.createElement('div');
  card.style.cssText = dark
    ? 'max-width:36rem;border-radius:16px;border:2px solid rgba(250,246,240,0.14);background:#221e1a;padding:24px'
    : 'max-width:36rem;border-radius:16px;border:2px solid rgba(45,10,0,0.15);background:#fff;padding:24px';
  const h1 = document.createElement('h1');
  h1.style.cssText = 'margin:0 0 12px;font-size:1.25rem;font-weight:800';
  h1.textContent = "Couldn't load app";
  const pre = document.createElement('pre');
  pre.style.cssText = dark
    ? 'white-space:pre-wrap;word-break:break-word;font-size:13px;background:rgba(255,255,255,0.06);padding:12px;border-radius:8px;margin:0 0 16px'
    : 'white-space:pre-wrap;word-break:break-word;font-size:13px;background:rgba(45,10,0,0.06);padding:12px;border-radius:8px;margin:0 0 16px';
  pre.textContent = detail;
  const hint = document.createElement('p');
  hint.style.cssText = dark
    ? 'margin:0;font-size:14px;color:rgba(250,246,240,0.68)'
    : 'margin:0;font-size:14px;color:rgba(45,10,0,0.65)';
  hint.textContent =
    'Common on deploy: missing VITE_WALLETCONNECT_PROJECT_ID (RainbowKit throws at startup) or a bad env var name — Vite only inlines VITE_* at build time; redeploy after changing env. Open DevTools → Console for the stack. On mobile, add ?debug=1 for vConsole.';
  card.appendChild(h1);
  card.appendChild(pre);
  card.appendChild(hint);
  wrap.appendChild(card);
  rootEl.appendChild(wrap);
  console.error(err);
}

async function boot() {
  const rootEl = document.getElementById('root');
  if (!rootEl) {
    console.error('missing #root');
    return;
  }
  try {
    const [{ default: App }, { ThemeProvider }] = await Promise.all([
      import('./App.tsx'),
      import('./lib/ThemeContext.tsx'),
    ]);
    createRoot(rootEl).render(
      <StrictMode>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </StrictMode>
    );
  } catch (e) {
    showBootError(e, rootEl);
  }
}

void boot();
