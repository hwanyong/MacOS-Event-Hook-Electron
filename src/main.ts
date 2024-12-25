import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { systemPreferences } from 'electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow: BrowserWindow | null = null;

// 권한 확인
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

// 키보드 이벤트 처리
ipcMain.on('keyboard-event', (event, data) => {
  console.log('메인 프로세스 키보드 이벤트 수신:', data);
  if (mainWindow) {
    mainWindow.webContents.send('keyboard-event', data);
  }
});

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
});

// 추적 관련 에러 처리
ipcMain.on('tracking-error', (event, message) => {
  console.error('추적 오류 발생:', message);
  if (mainWindow) {
    dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: '추적 오류',
      message: '키보드 입력 추적 중 오류가 발생했습니다.',
      detail: message,
      buttons: ['확인']
    });
  }
});

// 윈도우 컨트롤 이벤트 핸들러
ipcMain.on('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

// 권한 관련 핸들러
ipcMain.handle('request-permission', async () => {
  return true;
});

ipcMain.handle('check-permission', async () => {
  return true;
});

// 설정 관련 핸들러
const settings = new Map<string, any>();

ipcMain.handle('get-setting', async (_, key: string) => {
  return settings.get(key);
});

ipcMain.handle('set-setting', async (_, key: string, value: any) => {
  settings.set(key, value);
  return true;
});

// 정리 핸들러
ipcMain.on('cleanup', () => {
  console.log('리소스 정리 요청 받음');
});

const createWindow = () => {
  console.log('윈도우 생성 시작');
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    return;
  }

  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: fileURLToPath(new URL('./preload.mjs', import.meta.url))
    }
  });

  // 윈도우 로드 이벤트
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('윈도우 로드 완료');
    mainWindow?.webContents.openDevTools();
  });

  // 에러 이벤트
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('윈도우 로드 실패:', errorCode, errorDescription);
  });

  // HTML 파일 로드
  const indexPath = join(__dirname, '..', 'index.html');
  console.log('로드할 HTML 경로:', indexPath);
  console.log('현재 디렉토리:', process.cwd());
  console.log('__dirname:', __dirname);

  mainWindow.loadFile(indexPath).catch((error) => {
    console.error('HTML 로드 에러:', error);
  });

  // 윈도우가 로드된 후 권한 확인
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('윈도우 로드 완료, 권한 확인 중...');
    if (!mainWindow) return;

    const hasPermission = checkInputMonitoringPermission();
    console.log('권한 상태:', hasPermission);
    mainWindow.webContents.send('permission-status', hasPermission);
  });

  // 윈도우 종료 전 정리
  mainWindow.on('close', () => {
    console.log('윈도우 종료 전, 리소스 정리 중...');
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('cleanup');
    }
  });

  // 윈도우 종료 후 처리
  mainWindow.on('closed', () => {
    console.log('윈도우 종료됨');
    mainWindow = null;
  });
};

// 앱 종료 시 정리
app.on('before-quit', () => {
  console.log('앱 종료, 리소스 정리 중...');
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('cleanup');
  }
});

app.whenReady().then(() => {
  console.log('앱 준비 완료');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
