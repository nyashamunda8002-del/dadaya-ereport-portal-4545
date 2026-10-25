import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker immediately for offline enrollment
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(<App />);
