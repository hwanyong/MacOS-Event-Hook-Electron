import { contextBridge } from 'electron';

// Hide traffic lights as early as possible
document.addEventListener('DOMContentLoaded', () => {
  // Force style override
  const style = document.createElement('style');
  style.innerHTML = `
    .titlebar-controls,
    :root {
      opacity: 0 !important;
      pointer-events: none !important;
      display: none !important;
    }
    .toolbar-button,
    .traffic-lights {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
    }
  `;
  document.head.appendChild(style);
});

// Expose any APIs to renderer if needed
contextBridge.exposeInMainWorld('electron', {
  // Add any required APIs here
});
