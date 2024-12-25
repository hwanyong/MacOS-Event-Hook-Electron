import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    transparent: true,
    hasShadow: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: fileURLToPath(new URL('./preload.mjs', import.meta.url))
    }
  });

  mainWindow.loadFile(join(__dirname, '../index.html'));
  mainWindow.setWindowButtonVisibility(false);
  mainWindow.webContents.openDevTools();

  // 키보드 이벤트 처리
  ipcMain.on('keyboard-event', (event, data) => {
    console.log('메인 프로세스 키보드 이벤트 수신:', data);
    mainWindow.webContents.send('keyboard-event', data);
  });
};

app.whenReady().then(() => {
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
