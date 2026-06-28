import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Import global styles — this file contains Tailwind v4 directives,
// custom CSS variables, aurora background, glassmorphism, and scrollbar styles.
import './index.css';

// React 19 uses createRoot (not ReactDOM.render) for concurrent features.
// The "!" after getElementById tells TypeScript we're certain #root exists.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
