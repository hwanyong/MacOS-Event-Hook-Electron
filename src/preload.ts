import { contextBridge, ipcRenderer } from 'electron';
import { GlobalKeyboardListener } from "@futpib/node-global-key-listener";
import { mouse } from '@nut-tree-fork/nut-js';

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
  cleanup: () => void;
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
let keyboardListener: GlobalKeyboardListener | null = null;

const startKeyboardTracking = () => {
  if (!isTrackingEnabled || keyboardListener) return;

  try {
    console.log('키보드 리스너 초기화 시작');
    keyboardListener = new GlobalKeyboardListener();
    console.log('키보드 리스너 생성됨');
    
    // 키 눌림 이벤트
    keyboardListener.addListener((e, down) => {
      console.log('키보드 이벤트 감지:', { key: e.name, down, raw: e });
      if (!isTrackingEnabled) return;
      
      ipcRenderer.send('keyboard-event', {
        key: e.name,
        type: down ? 'keydown' : 'keyup',
        timeStamp: Date.now()
      });
    });

    console.log('키보드 리스너 설정 완료');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    console.error('키보드 추적 시작 실패:', errorMessage);
    ipcRenderer.send('tracking-error', errorMessage);
  }
};

// 정리 함수
const stopKeyboardTracking = () => {
  if (keyboardListener) {
    keyboardListener.kill();
    keyboardListener = null;
  }
};

const startMouseTracking = async () => {
  if (!isTrackingEnabled) return;

  let lastPosition = { x: 0, y: 0 };
  let lastUpdateTime = 0;
  const THROTTLE_MS = 16;

  while (isTrackingEnabled) {
    try {
      const currentPosition = await mouse.getPosition();
      const now = Date.now();

      if (
        now - lastUpdateTime >= THROTTLE_MS &&
        (currentPosition.x !== lastPosition.x || currentPosition.y !== lastPosition.y)
      ) {
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
      }

      await new Promise(resolve => setTimeout(resolve, 1));
    } catch (error: unknown) {
      console.error('마우스 위치 추적 실패:', error);
      break;
    }
  }
};

// 정리 함수
const cleanup = () => {
  console.log('리소스 정리 시작');
  stopKeyboardTracking();
  isTrackingEnabled = false;
  console.log('리소스 정리 완료');
};

// 권한 상태 수신
ipcRenderer.on('permission-status', (_event, isGranted: boolean) => {
  isTrackingEnabled = isGranted;
  if (!isGranted) {
    stopKeyboardTracking();
    return;
  }
  startKeyboardTracking();
});

// IPC 이벤트 리스너
ipcRenderer.on('cleanup', () => {
  cleanup();
});

// API 정의 및 노출
contextBridge.exposeInMainWorld('electronAPI', {
  onKeyboardEvent: (callback: (data: KeyboardEventData) => void) => {
    ipcRenderer.on('keyboard-event', (_event, data: KeyboardEventData) => {
      callback(data);
    });
  },
  onMouseEvent: (callback: (data: MouseEventData) => void) => {
    window.addEventListener('message', (event) => {
      if (event.data.type !== 'mouse-event') return;
      callback(event.data.data);
    });
  },
  cleanup: () => {
    cleanup();
  }
});

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// 앱 종료 시 정리
window.addEventListener('unload', cleanup);
