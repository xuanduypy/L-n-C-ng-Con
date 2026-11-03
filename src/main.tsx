import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Provide safe non-blocking toast notification replacement for window.alert in iframe environments
if (typeof window !== 'undefined') {
  window.alert = (message?: any) => {
    console.log('[Notice]', message);
    const containerId = 'aistudio-toast-container';
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.style.cssText =
        'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none;max-width:92vw;width:420px;';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.style.cssText =
      'background:rgba(24,24,27,0.95);color:#ffffff;border:1px solid #3f3f46;padding:12px 18px;border-radius:12px;font-size:13.5px;font-weight:500;box-shadow:0 10px 30px rgba(0,0,0,0.7);pointer-events:auto;backdrop-filter:blur(10px);transition:all 0.25s ease;text-align:center;';
    toast.textContent = String(message ?? '');
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-8px)';
      setTimeout(() => toast.remove(), 250);
    }, 3800);
  };

  window.addEventListener(
    'error',
    (event) => {
      const target = event.target as HTMLElement | null;
      if (
        (target && (target.tagName === 'AUDIO' || target.tagName === 'VIDEO' || target.tagName === 'SOURCE')) ||
        (event.message && typeof event.message === 'string' && event.message.toLowerCase().includes('supported sources'))
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    true
  );
}

createRoot(document.getElementById('root')!).render(<App />);
