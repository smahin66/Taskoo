import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './contexts/LanguageContext';
import { TimerProvider } from './contexts/TimerContext';
import './index.css';

// Enable React concurrent features
const root = createRoot(document.getElementById('root')!);

// Lazy load the app
const renderApp = () => {
  root.render(
    <StrictMode>
      <LanguageProvider>
        <TimerProvider>
          <App />
        </TimerProvider>
      </LanguageProvider>
    </StrictMode>
  );
};

// Defer non-critical initialization
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}