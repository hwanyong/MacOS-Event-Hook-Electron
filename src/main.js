const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let iohook;

// Create Electron window
function createWindow() {
    console.log('🖼️  Electron window created');
    
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        title: 'iohook-macos Electron Test (Polling Mode)'
    });

    mainWindow.loadFile('index.html');
    mainWindow.webContents.openDevTools();
}

// Initialize iohook with polling mode
function initializeIOHook() {
    try {
        console.log('🔧 Loading iohook-macos library...');
        iohook = require('iohook-macos');
        console.log('✅ iohook-macos loaded successfully in Electron!');
        
        // EventEmitter 기반으로 이벤트 리스너 설정
        iohook.on('keydown', (data) => {
            console.log(`📝 Key Down:`, data);
            mainWindow.webContents.send('event-data', data);
        });
        
        iohook.on('keyup', (data) => {
            console.log(`📝 Key Up:`, data);
            mainWindow.webContents.send('event-data', data);
        });
        
        iohook.on('mousedown', (data) => {
            console.log(`🖱️ Mouse Down:`, data);
            mainWindow.webContents.send('event-data', data);
        });
        
        iohook.on('mouseup', (data) => {
            console.log(`🖱️ Mouse Up:`, data);
            mainWindow.webContents.send('event-data', data);
        });
        
        iohook.on('mousemove', (data) => {
            console.log(`📍 Mouse Move:`, data);
            mainWindow.webContents.send('event-data', data);
        });
        
        iohook.on('scroll', (data) => {
            console.log(`🌀 Scroll:`, data);
            mainWindow.webContents.send('event-data', data);
        });
        
        // Check accessibility permissions
        console.log('🔐 Checking accessibility permissions...');
        const permissions = iohook.checkAccessibilityPermissions();
        console.log('🔐 Accessibility permissions:', permissions ? 'GRANTED' : 'DENIED');
        
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize iohook:', error);
        return false;
    }
}

// IPC Handlers for polling mode
ipcMain.on('start-monitoring', (event) => {
    try {
        console.log('🎯 Starting iohook monitoring in Electron...');
        iohook.startMonitoring();
        console.log('✅ iohook monitoring started successfully in Electron!');
    } catch (error) {
        console.error('❌ Failed to start monitoring:', error);
    }
});

ipcMain.on('stop-monitoring', (event) => {
    try {
        console.log('🛑 Stopping iohook monitoring...');
        iohook.stopMonitoring();
        console.log('✅ iohook monitoring stopped successfully');
    } catch (error) {
        console.error('❌ Failed to stop monitoring:', error);
    }
});

ipcMain.on('get-queue-size', (event) => {
    try {
        const size = iohook.getQueueSize();
        event.reply('queue-size', size);
    } catch (error) {
        console.error('❌ Failed to get queue size:', error);
        event.reply('queue-size', 0);
    }
});

ipcMain.on('clear-queue', (event) => {
    try {
        iohook.clearQueue();
        console.log('🗑️ Event queue cleared');
    } catch (error) {
        console.error('❌ Failed to clear queue:', error);
    }
});

ipcMain.on('set-polling-rate', (event, rate) => {
    try {
        iohook.setPollingRate(rate);
        console.log(`⚡ Polling rate set to ${rate}ms`);
    } catch (error) {
        console.error('❌ Failed to set polling rate:', error);
    }
});

ipcMain.on('enable-performance-mode', (event) => {
    try {
        iohook.enablePerformanceMode();
        console.log('🚀 Performance mode enabled');
    } catch (error) {
        console.error('❌ Failed to enable performance mode:', error);
    }
});

ipcMain.on('disable-performance-mode', (event) => {
    try {
        iohook.disablePerformanceMode();
        console.log('🐌 Performance mode disabled');
    } catch (error) {
        console.error('❌ Failed to disable performance mode:', error);
    }
});

ipcMain.on('set-verbose-logging', (event, enable) => {
    try {
        iohook.setVerboseLogging(enable);
        console.log(`📝 Verbose logging ${enable ? 'enabled' : 'disabled'}`);
    } catch (error) {
        console.error('❌ Failed to set verbose logging:', error);
    }
});

// Electron app events
app.whenReady().then(() => {
    console.log('🚀 Electron main process started');
    console.log('⚡ Electron app ready');
    
    createWindow();
    
    // Initialize iohook after window is created
    if (initializeIOHook()) {
        console.log('🎉 iohook-macos initialization completed');
    } else {
        console.error('💥 iohook-macos initialization failed');
    }
});

app.on('window-all-closed', () => {
    console.log('🔚 All windows closed');
    
    // Stop monitoring before quitting
    if (iohook) {
        try {
            iohook.stopMonitoring();
            console.log('✅ iohook monitoring stopped on quit');
        } catch (error) {
            console.error('❌ Error stopping monitoring on quit:', error);
        }
    }
    
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('📋 Electron main process script loaded'); 