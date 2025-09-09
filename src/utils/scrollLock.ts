/**
 * Better modal scroll prevention utility
 * Handles scroll locking for modals without arbitrary breakpoints
 */

let scrollPosition = 0;
let isLocked = false;

export const lockScroll = () => {
  if (isLocked) return;
  
  // Store current scroll position
  scrollPosition = window.pageYOffset;
  
  // Apply scroll lock
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollPosition}px`;
  document.body.style.width = '100%';
  document.body.style.overflow = 'hidden';
  
  // Add class for additional styling
  document.body.classList.add('modal-open');
  
  isLocked = true;
};

export const unlockScroll = () => {
  if (!isLocked) return;
  
  // Remove scroll lock
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.overflow = '';
  
  // Remove class
  document.body.classList.remove('modal-open');
  
  // Restore scroll position
  window.scrollTo(0, scrollPosition);
  
  isLocked = false;
};

// Cleanup on page unload
window.addEventListener('beforeunload', unlockScroll);
