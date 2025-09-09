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
  
  // Apply scroll lock with !important to override any conflicting styles
  document.body.style.setProperty('position', 'fixed', 'important');
  document.body.style.setProperty('top', `-${scrollPosition}px`, 'important');
  document.body.style.setProperty('width', '100%', 'important');
  document.body.style.setProperty('height', '100%', 'important');
  document.body.style.setProperty('overflow', 'hidden', 'important');
  document.body.style.setProperty('touch-action', 'none', 'important');
  
  // Add class for additional styling
  document.body.classList.add('modal-open');
  
  isLocked = true;
};

export const unlockScroll = () => {
  if (!isLocked) return;
  
  // Remove scroll lock by clearing all the properties
  document.body.style.removeProperty('position');
  document.body.style.removeProperty('top');
  document.body.style.removeProperty('width');
  document.body.style.removeProperty('height');
  document.body.style.removeProperty('overflow');
  document.body.style.removeProperty('touch-action');
  
  // Remove class
  document.body.classList.remove('modal-open');
  
  // Restore scroll position
  window.scrollTo(0, scrollPosition);
  
  isLocked = false;
};

// Cleanup on page unload
window.addEventListener('beforeunload', unlockScroll);
