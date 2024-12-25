# 키보드 이벤트 훅 가이드

## 개요
이 문서는 Electron 앱에서 전역 키보드 이벤트 훅의 구현, 시작, 종료 및 관련 고려사항을 설명합니다.

## 구현 방식
### 사용 라이브러리
- `@futpib/node-global-key-listener`: 전역 키보드 이벤트 캡처
  ```bash
  pnpm add @futpib/node-global-key-listener
  ```

### MacOS 권한 설정
1. `entitlements.mac.plist` 파일 생성
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>com.apple.security.automation.apple-events</key>
    <true/>
    <key>com.apple.security.temporary-exception.apple-events</key>
    <array>
      <string>com.apple.systemevents</string>
    </array>
  </dict>
</plist>
```

2. `package.json`에 electron-builder 설정 추가
```json
{
  "build": {
    "mac": {
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist",
      "extendInfo": {
        "NSAppleEventsUsageDescription": "키보드 입력을 감지하기 위해 접근 권한이 필요합니다.",
        "com.apple.security.automation.apple-events": true,
        "NSInputMonitoringUsageDescription": "키보드 입력을 감지하기 위해 Input Monitoring 권한이 필요합니다."
      }
    }
  }
}
```

## 이벤트 훅 구현
### 1. 타입 정의
```typescript
// preload.ts
interface KeyboardEventData {
  key: string;
  type: 'keydown' | 'keyup';
  timeStamp: number;
}

interface ElectronAPI {
  onKeyboardEvent: (callback: (data: KeyboardEventData) => void) => void;
  cleanup: () => void;
}
```

### 2. 키보드 리스너 구현
```typescript
// preload.ts
let isTrackingEnabled = false;
let keyboardListener: GlobalKeyboardListener | null = null;

const startKeyboardTracking = () => {
  if (!isTrackingEnabled || keyboardListener) return;

  try {
    console.log('키보드 리스너 초기화 시작');
    keyboardListener = new GlobalKeyboardListener();
    console.log('키보드 리스너 생성됨');
    
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
```

### 3. 권한 확인 및 처리
```typescript
// main.ts
const checkInputMonitoringPermission = () => {
  console.log('Input Monitoring 권한 확인 중...');
  try {
    const hasPermission = systemPreferences.isTrustedAccessibilityClient(false);
    console.log('Input Monitoring 권한 상태:', hasPermission);
    return hasPermission;
  } catch (error) {
    console.error('권한 확인 중 오류:', error);
    return false;
  }
};

// 권한 관련 에러 처리
ipcMain.on('permission-error', (event, message) => {
  console.log('권한 오류 발생:', message);
  if (mainWindow) {
    dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: '권한 오류',
      message: '키보드 입력을 감지하기 위해 접근성 권한이 필요합니다.',
      detail: message,
      buttons: ['확인', '시스템 설정 열기'],
      defaultId: 1
    }).then(result => {
      if (result.response === 1) {
        shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility');
      }
    });
  }
};
```

## 리소스 정리
### 1. 정리 함수 구현
```typescript
// preload.ts
const cleanup = () => {
  console.log('리소스 정리 시작');
  stopKeyboardTracking();
  isTrackingEnabled = false;
  console.log('리소스 정리 완료');
};

const stopKeyboardTracking = () => {
  if (keyboardListener) {
    keyboardListener.kill();
    keyboardListener = null;
  }
};

// IPC 이벤트 리스너
ipcRenderer.on('cleanup', () => {
  cleanup();
});

// 앱 종료 시 정리
window.addEventListener('unload', cleanup);
```

### 2. 윈도우 종료 처리
```typescript
// main.ts
// 윈도우 종료 전 정리
mainWindow.on('close', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    console.log('윈도우 종료 전, 리소스 정리 중...');
    mainWindow.webContents.send('cleanup');
  }
});

// 윈도우 종료 후 처리
mainWindow.on('closed', () => {
  console.log('윈도우 종료됨');
  mainWindow = null;
});

// 앱 종료 시 정리
app.on('before-quit', () => {
  console.log('앱 종료, 리소스 정리 중...');
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('cleanup');
  }
});
```

## 문제 해결 가이드
### 1. 객체 파괴 에러
#### 증상
```
TypeError: Object has been destroyed
at BrowserWindow.<anonymous> (file:///app.asar/dist/main.js:98:24)
```

#### 해결 방법
1. `isDestroyed()` 체크 추가
```typescript
if (mainWindow && !mainWindow.isDestroyed()) {
  mainWindow.webContents.send('cleanup');
}
```

2. 이벤트 순서 조정
- `closed` 대신 `close` 이벤트에서 cleanup 실행
- `mainWindow = null` 처리는 `closed` 이벤트에서 수행

### 2. 권한 문제
#### 증상
- 키보드 이벤트가 캡처되지 않음
- 권한 요청 다이얼로그가 반복해서 표시됨

#### 해결 방법
1. 프로세스 확인
```bash
# Activity Monitor에서 Electron 프로세스 확인
ps aux | grep Electron
```

2. 권한 재설정
- 시스템 설정 > 개인정보 보호 및 보안 > 입력 모니터링
- 앱 권한 해제 후 재설정

3. 앱 재설치
```bash
# 앱 완전 제거
rm -rf /Applications/YourApp.app
rm -rf ~/Library/Application\ Support/YourApp

# 새로 설치
pnpm run dist
```

### 3. 디버깅
#### 로그 활성화
```typescript
// preload.ts
const startKeyboardTracking = () => {
  console.log('키보드 리스너 초기화 시작');
  // ...
};

// main.ts
mainWindow.webContents.openDevTools();
```

#### 로그 확인
1. DevTools 콘솔
- 앱 실행 > 우클릭 > 검사
- Console 탭에서 로그 확인

2. 시스템 로그
```bash
# 콘솔 앱에서 확인
console.app > 시스템 로그
```

## 모범 사례
### 1. 권한 관리
```typescript
// 최소 권한 원칙
const checkInputMonitoringPermission = () => {
  const hasPermission = systemPreferences.isTrustedAccessibilityClient(false);
  if (!hasPermission) {
    // 사용자에게 명확한 권한 사용 목적 설명
    showPermissionDialog();
  }
  return hasPermission;
};
```

### 2. 리소스 관리
```typescript
// 메모리 누수 방지
const cleanup = () => {
  // 이벤트 리스너 해제
  keyboardListener?.removeAllListeners();
  // 리소스 정리
  keyboardListener?.kill();
  keyboardListener = null;
};
```

### 3. 에러 처리
```typescript
// 사용자 친화적인 에러 메시지
const handleError = (error: Error) => {
  dialog.showMessageBox({
    type: 'error',
    title: '오류 발생',
    message: '키보드 입력 감지 중 문제가 발생했습니다.',
    detail: error.message,
    buttons: ['다시 시도', '설정 열기'],
  });
};
```

## 테스트
### 1. 기본 기능 테스트
```typescript
// 키보드 이벤트 테스트
const testKeyboardEvents = () => {
  window.electronAPI.onKeyboardEvent((data) => {
    console.log('키보드 이벤트:', data);
  });
};
```

### 2. 종료 시나리오 테스트
- 정상 종료
- 강제 종료
- 권한 변경
- 시스템 종료

### 3. 에러 시나리오 테스트
- 권한 거부
- 리소스 해제 실패
- 비정상 종료
