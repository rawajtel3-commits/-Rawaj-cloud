import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Register Service Worker for offline metadata & cached files support
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onOfflineReady() {
      window.dispatchEvent(new CustomEvent('rawaj:sw-offline-ready'));
    },
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        window.dispatchEvent(new CustomEvent('rawaj:sw-registered'));
      }
    },
  });
}

createRoot(document.getElementById('root')!).render(<App />);
