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

let isTrackingEnabled = false;

// 마우스 이벤트 감지 함수
const startMouseTracking = async () => {
  if (!isTrackingEnabled) return;
  
  let lastPosition = await mouse.getPosition();

  while (true) {
    try {
      const currentPosition = await mouse.getPosition();
      
      // 위치가 변경되었을 때만 이벤트 발생
      if (currentPosition.x !== lastPosition.x || currentPosition.y !== lastPosition.y) {
        window.postMessage({
          type: 'mouse-event',
          data: {
            x: currentPosition.x,
            y: currentPosition.y,
            type: 'move',
            timeStamp: Date.now()
          }
        });
        lastPosition = currentPosition;
      }

      await new Promise(resolve => setTimeout(resolve, 10)); // 10ms 딜레이
    } catch (error) {
      console.error('마우스 이벤트 에러:', error);
    }
  }
};

// 키보드 이벤트 감지 함수
const startKeyboardTracking = async () => {
  if (!isTrackingEnabled) return;
  
  keyboard.config.autoDelayMs = 0;
  
  // 모든 키에 대해 이벤트 리스너 설정
  const keys = Object.values(Key).filter(key => typeof key !== 'string') as Key[];
  
  while (true) {
    try {
      for (const key of keys) {
        try {
          await keyboard.pressKey(key);
          window.postMessage({
            type: 'keyboard-event',
            data: {
              key: key.toString(),
              type: 'keydown',
              timeStamp: Date.now()
            }
          });
          await keyboard.releaseKey(key);
        } catch {}
      }
      await new Promise(resolve => setTimeout(resolve, 10)); // 10ms 딜레이
    } catch (error) {
      console.error('키보드 이벤트 에러:', error);
    }
  }
};

// 권한 상태 수신
ipcRenderer.on('permission-status', (_event, isGranted: boolean) => {
  isTrackingEnabled = isGranted;
  if (isGranted) {
    startMouseTracking();
    startKeyboardTracking();
  }
});

// API 정의 및 노출
contextBridge.exposeInMainWorld('electronAPI', {
  onKeyboardEvent: (callback: (data: KeyboardEventData) => void) => {
    window.addEventListener('message', (event) => {
      if (event.data.type === 'keyboard-event') {
        console.log('키보드 이벤트 수신:', event.data.data);
        callback(event.data.data);
      }
    });
  },
  onMouseEvent: (callback: (data: MouseEventData) => void) => {
    window.addEventListener('message', (event) => {
      if (event.data.type === 'mouse-event') {
        console.log('마우스 이벤트 수신:', event.data.data);
        callback(event.data.data);
      }
    });
  }
});

// 이벤트 트래킹은 권한 확인 후 시작되므로 여기서는 자동 시작하지 않음

// window 객체에 타입 추가
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
