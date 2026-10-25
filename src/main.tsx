import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent unhandled DOM media source errors (MEDIA_ERR_SRC_NOT_SUPPORTED) from throwing to top level
if (typeof window !== 'undefined') {
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
