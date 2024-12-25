import { contextBridge, ipcRenderer } from 'electron';
import { keyboard, mouse, Key } from '@nut-tree-fork/nut-js';

// 타입 정의
interface KeyboardEventData {
  key: string;
  type: 'keydown' | 'keyup';
  timeStamp: number;
}

interface MouseEventData {
  x: number;
  y: number;
  type: 'move' | 'click' | 'rightClick';
  timeStamp: number;
}

interface ElectronAPI {
  onKeyboardEvent: (callback: (data: KeyboardEventData) => void) => void;
  onMouseEvent: (callback: (data: MouseEventData) => void) => void;
}

// Hide traffic lights as early as possible
document.addEventListener('DOMContentLoaded', () => {
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

let isTrackingEnabled = false;

const startMouseTracking = async () => {
  if (!isTrackingEnabled) return;

  let lastPosition = { x: 0, y: 0 };
  let lastUpdateTime = 0;
  const THROTTLE_MS = 16;

  while (isTrackingEnabled) {
    const currentPosition = await mouse.getPosition();
    const now = Date.now();

    if (now - lastUpdateTime < THROTTLE_MS) {
      await new Promise(resolve => setTimeout(resolve, 1));
      continue;
    }

    if (currentPosition.x === lastPosition.x && currentPosition.y === lastPosition.y) {
      await new Promise(resolve => setTimeout(resolve, 1));
      continue;
    }

    window.postMessage({
      type: 'mouse-event',
      data: {
        x: currentPosition.x,
        y: currentPosition.y,
        type: 'move',
        timeStamp: now
      }
    });

    lastPosition = currentPosition;
    lastUpdateTime = now;
    await new Promise(resolve => setTimeout(resolve, 1));
  }
};

const startKeyboardTracking = async () => {
  if (!isTrackingEnabled) return;
  
  keyboard.config.autoDelayMs = 0;
  const keyStates = new Map<Key, boolean>();
  const keys = Object.values(Key).filter(key => typeof key !== 'string') as Key[];

  while (isTrackingEnabled) {
    for (const key of keys) {
      try {
        // 키 누름 시도
        await keyboard.pressKey(key);
        if (!keyStates.get(key)) {
          keyStates.set(key, true);
          window.postMessage({
            type: 'keyboard-event',
            data: {
              key: key.toString(),
              type: 'keydown',
              timeStamp: Date.now()
            }
          });
        }
      } catch {
        // 키를 누를 수 없다면 (이미 눌려있지 않다면)
        if (keyStates.get(key)) {
          keyStates.set(key, false);
          window.postMessage({
            type: 'keyboard-event',
            data: {
              key: key.toString(),
              type: 'keyup',
              timeStamp: Date.now()
            }
          });
        }
      } finally {
        try {
          await keyboard.releaseKey(key);
        } catch {}
      }
    }
    await new Promise(resolve => setTimeout(resolve, 1));
  }
};

// 권한 상태 수신
ipcRenderer.on('permission-status', (_event, isGranted: boolean) => {
  isTrackingEnabled = isGranted;
  if (!isGranted) return;
  
  startMouseTracking();
  startKeyboardTracking();
});

// API 정의 및 노출
contextBridge.exposeInMainWorld('electronAPI', {
  onKeyboardEvent: (callback: (data: KeyboardEventData) => void) => {
    window.addEventListener('message', (event) => {
      if (event.data.type !== 'keyboard-event') return;
      console.log('키보드 이벤트 수신:', event.data.data);
      callback(event.data.data);
    });
  },
  onMouseEvent: (callback: (data: MouseEventData) => void) => {
    window.addEventListener('message', (event) => {
      if (event.data.type !== 'mouse-event') return;
      console.log('마우스 이벤트 수신:', event.data.data);
      callback(event.data.data);
    });
  }
});

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
