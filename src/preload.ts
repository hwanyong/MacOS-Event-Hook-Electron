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
      addEventToLog('keyboard', { key: e.name, type: down ? 'keydown' : 'keyup' });
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
        addEventToLog('mouse', { x: currentPosition.x, y: currentPosition.y, type: 'move' });

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
const electronAPI = {
  // 윈도우 컨트롤
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),

  // 이벤트 리스너
  onKeyboardEvent: (callback: (data: any) => void) => {
    ipcRenderer.on('keyboard-event', (_, data) => callback(data));
  },
  onMouseEvent: (callback: (data: any) => void) => {
    ipcRenderer.on('mouse-event', (_, data) => callback(data));
  },

  // 권한 관련
  requestPermission: () => ipcRenderer.invoke('request-permission'),
  checkPermission: () => ipcRenderer.invoke('check-permission'),

  // 설정 관련
  getSetting: (key: string) => ipcRenderer.invoke('get-setting', key),
  setSetting: (key: string, value: any) => ipcRenderer.invoke('set-setting', key, value),

  // 리소스 정리
  cleanup: () => {
    cleanup();
    ipcRenderer.send('cleanup');
  },

  // 미사용 이벤트 (향후 확장성)
  onWindowResize: () => {},
  onWindowMove: () => {},
  onWindowFocus: () => {},
  onWindowBlur: () => {},
  onThemeChange: () => {},
  onNetworkChange: () => {},
  onBatteryChange: () => {},
  onDeviceChange: () => {},
  onIdle: () => {},
  onResume: () => {},
  onError: () => {},
  onWarning: () => {},
  onUpdate: () => {},
  onRestart: () => {},
  onQuit: () => {}
};

function addEventToLog(eventType: string, eventData: any) {
  const eventLog = document.getElementById('eventLog');
  if (!eventLog) return;

  const eventItem = document.createElement('div');
  eventItem.className = `event-item ${eventType}-event`;

  const timestamp = document.createElement('span');
  timestamp.className = 'timestamp';
  timestamp.textContent = new Date().toLocaleTimeString();

  const details = document.createElement('div');
  details.className = 'details';

  const key = document.createElement('span');
  key.className = 'key';
  key.textContent = eventData.key || '';

  const type = document.createElement('span');
  type.className = 'type';
  type.textContent = eventData.type || '';

  details.appendChild(key);
  details.appendChild(type);

  eventItem.appendChild(timestamp);
  eventItem.appendChild(details);

  eventLog.insertBefore(eventItem, eventLog.firstChild);

  // 최대 100개의 이벤트만 유지
  while (eventLog.children.length > 100) {
    eventLog.removeChild(eventLog.lastChild!);
  }
}

contextBridge.exposeInMainWorld('electron', electronAPI);

declare global {
  interface Window {
    electron: typeof electronAPI;
  }
}

// 앱 종료 시 정리
window.addEventListener('unload', cleanup);
