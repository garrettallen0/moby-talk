import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import './styles/global.css'

// Debug: Log scroll events to identify the issue
if (typeof window !== 'undefined') {
  let scrollTimeout: NodeJS.Timeout;
  
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      console.log('🔍 Scroll position:', window.pageYOffset);
    }, 100);
  }, { passive: true });
  
  // Log when page jumps to top
  let lastScrollY = window.pageYOffset;
  window.addEventListener('scroll', () => {
    if (window.pageYOffset === 0 && lastScrollY > 100) {
      console.log('🚨 SCROLL JUMPED TO TOP! Previous position:', lastScrollY);
    }
    lastScrollY = window.pageYOffset;
  }, { passive: true });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
