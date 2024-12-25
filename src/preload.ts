import { contextBridge, ipcRenderer } from 'electron';

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

// API 정의
const api = {
  // 여기에 필요한 IPC 통신 메서드들을 추가할 수 있습니다
  send: (channel: string, data: any) => {
    ipcRenderer.send(channel, data);
  },
  receive: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  }
};

// API를 window 객체에 노출
contextBridge.exposeInMainWorld('electronAPI', api);
