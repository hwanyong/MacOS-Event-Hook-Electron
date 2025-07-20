import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let mainWindow: BrowserWindow | null = null
let iohook: any = null
let permissionCheckInterval: NodeJS.Timeout | null = null

// Create Electron window
function createWindow(): void {
    console.log('🖼️  Electron window created')
    
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        title: 'iohook-macos Electron Test (Polling Mode)'
    })

    const indexPath = join(__dirname, '..', 'index.html')
    mainWindow.loadFile(indexPath)
    mainWindow.webContents.openDevTools()
    
    // 윈도우 로드 완료 후 권한 체크
    mainWindow.webContents.on('did-finish-load', () => {
        checkAndHandlePermissions()
    })
}

// Check accessibility permissions and handle accordingly
async function checkAndHandlePermissions(): Promise<void> {
    if (!iohook) {
        console.log('⚠️  iohook not initialized yet')
        return
    }
    
    try {
        const permissions = iohook.checkAccessibilityPermissions()
        const hasPermission = permissions.hasPermissions
        
        console.log('🔐 Accessibility permissions:', hasPermission ? 'GRANTED' : 'DENIED')
        
        // Send permission status to renderer
        if (mainWindow) {
            mainWindow.webContents.send('permission-status', hasPermission)
        }
        
        if (!hasPermission) {
            await showPermissionDialog()
            startPermissionMonitoring()
        } else {
            console.log('✅ Accessibility permissions already granted')
            stopPermissionMonitoring()
        }
    } catch (error) {
        console.error('❌ Error checking permissions:', error)
        if (mainWindow) {
            mainWindow.webContents.send('permission-status', false)
        }
    }
}

// Show permission dialog to user
async function showPermissionDialog(): Promise<void> {
    if (!mainWindow) return
    
    const result = await dialog.showMessageBox(mainWindow, {
        type: 'warning',
        title: '접근성 권한 필요',
        message: 'iohook-macos가 키보드 및 마우스 이벤트를 감지하려면 접근성 권한이 필요합니다.',
        detail: [
            '• 시스템 설정 > 개인정보 보호 및 보안 > 접근성으로 이동',
            '• "iohook-macos Test" 앱을 찾아 체크박스 활성화',
            '• 권한 설정 완료 후 앱이 자동으로 재시작됩니다'
        ].join('\n'),
        buttons: ['시스템 설정 열기', '나중에', '앱 종료'],
        defaultId: 0,
        cancelId: 1
    })
    
    switch (result.response) {
        case 0: // 시스템 설정 열기
            await openAccessibilitySettings()
            break
        case 1: // 나중에
            console.log('사용자가 권한 설정을 나중에 하기로 선택')
            break
        case 2: // 앱 종료
            app.quit()
            break
    }
}

// Open macOS Accessibility settings
async function openAccessibilitySettings(): Promise<void> {
    try {
        console.log('🔧 Opening macOS Accessibility settings...')
        await shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility')
        console.log('✅ System settings opened')
    } catch (error) {
        console.error('❌ Failed to open system settings:', error)
        
        // Fallback: show manual instructions
        if (mainWindow) {
            dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: '수동 설정 안내',
                message: '시스템 설정을 수동으로 열어주세요',
                detail: [
                    '1. Apple 메뉴 > 시스템 설정',
                    '2. 개인정보 보호 및 보안',
                    '3. 접근성',
                    '4. "iohook-macos Test" 체크박스 활성화'
                ].join('\n'),
                buttons: ['확인']
            })
        }
    }
}

// Start monitoring for permission changes
function startPermissionMonitoring(): void {
    if (permissionCheckInterval) {
        clearInterval(permissionCheckInterval)
    }
    
    console.log('🔍 Starting permission monitoring...')
    
    permissionCheckInterval = setInterval(async () => {
        if (!iohook) return
        
        try {
            const permissions = iohook.checkAccessibilityPermissions()
            const hasPermission = permissions.hasPermissions
            
            if (hasPermission) {
                console.log('🎉 Accessibility permission granted! Restarting app...')
                stopPermissionMonitoring()
                
                // Send permission status update
                if (mainWindow) {
                    mainWindow.webContents.send('permission-status', true)
                    mainWindow.webContents.send('permission-granted')
                }
                
                // Show success dialog and restart
                await showPermissionGrantedDialog()
            }
        } catch (error) {
            console.error('❌ Error during permission monitoring:', error)
        }
    }, 2000) // Check every 2 seconds
}

// Stop permission monitoring
function stopPermissionMonitoring(): void {
    if (permissionCheckInterval) {
        clearInterval(permissionCheckInterval)
        permissionCheckInterval = null
        console.log('🛑 Permission monitoring stopped')
    }
}

// Show permission granted dialog and restart app
async function showPermissionGrantedDialog(): Promise<void> {
    if (!mainWindow) return
    
    const result = await dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: '권한 설정 완료',
        message: '접근성 권한이 성공적으로 설정되었습니다!',
        detail: '모든 기능을 사용하려면 앱을 재시작해야 합니다.',
        buttons: ['지금 재시작', '나중에 재시작'],
        defaultId: 0
    })
    
    if (result.response === 0) {
        console.log('🔄 Restarting application...')
        app.relaunch()
        app.quit()
    }
}

// Initialize iohook with polling mode
function initializeIOHook(): boolean {
    try {
        console.log('🔧 Loading iohook-macos library...')
        iohook = require('iohook-macos')
        console.log('✅ iohook-macos loaded successfully in Electron!')
        
        // Demonstrate both string and int event type usage
        console.log('📋 Available CGEventTypes mapping:', iohook.CGEventTypes)
        
        // Set up event listeners using string names (backward compatible)
        iohook.on('keyDown', (data: any) => {
            console.log(`📝 String event: keyDown (type: ${data.type})`)
            if (mainWindow) {
                mainWindow.webContents.send('event-data', data)
            }
        })
        
        iohook.on('keyUp', (data: any) => {
            if (mainWindow) {
                mainWindow.webContents.send('event-data', data)
            }
        })
        
        // Set up event listeners using int values (new feature)
        iohook.on(1, (data: any) => {  // kCGEventLeftMouseDown = 1
            console.log(`🔢 Int event: leftMouseDown (CGEventType: ${data.type})`)
            if (mainWindow) {
                mainWindow.webContents.send('event-data', data)
            }
        })
        
        iohook.on(2, (data: any) => {  // kCGEventLeftMouseUp = 2
            console.log(`🔢 Int event: leftMouseUp (CGEventType: ${data.type})`)
            if (mainWindow) {
                mainWindow.webContents.send('event-data', data)
            }
        })
        
        // Mix of string and int for demonstration
        iohook.on('rightMouseDown', (data: any) => {
            if (mainWindow) {
                mainWindow.webContents.send('event-data', data)
            }
        })
        
        iohook.on('rightMouseUp', (data: any) => {
            if (mainWindow) {
                mainWindow.webContents.send('event-data', data)
            }
        })
        
        iohook.on('mouseMoved', (data: any) => {
            if (mainWindow) {
                mainWindow.webContents.send('event-data', data)
            }
        })
        
        iohook.on(22, (data: any) => {  // kCGEventScrollWheel = 22
            console.log(`🔢 Int event: scrollWheel (CGEventType: ${data.type})`)
            if (mainWindow) {
                mainWindow.webContents.send('event-data', data)
            }
        })
        
        return true
    } catch (error) {
        console.error('❌ Failed to initialize iohook:', error)
        return false
    }
}

// IPC Handlers
ipcMain.on('check-permissions', async (event) => {
    await checkAndHandlePermissions()
})

ipcMain.on('open-accessibility-settings', async () => {
    await openAccessibilitySettings()
})

ipcMain.on('start-monitoring', () => {
    if (!iohook) return
    
    try {
        console.log('🎯 Starting iohook monitoring in Electron...')
        iohook.startMonitoring()
        console.log('✅ iohook monitoring started successfully in Electron!')
    } catch (error) {
        console.error('❌ Failed to start monitoring:', error)
    }
})

ipcMain.on('stop-monitoring', () => {
    if (!iohook) return
    
    try {
        console.log('🛑 Stopping iohook monitoring...')
        iohook.stopMonitoring()
        console.log('✅ iohook monitoring stopped successfully')
    } catch (error) {
        console.error('❌ Failed to stop monitoring:', error)
    }
})

ipcMain.on('get-queue-size', (event) => {
    if (!iohook) {
        event.reply('queue-size', 0)
        return
    }
    
    try {
        const size = iohook.getQueueSize()
        event.reply('queue-size', size)
    } catch (error) {
        console.error('❌ Failed to get queue size:', error)
        event.reply('queue-size', 0)
    }
})

ipcMain.on('clear-queue', () => {
    if (!iohook) return
    
    try {
        iohook.clearQueue()
        console.log('🗑️ Event queue cleared')
    } catch (error) {
        console.error('❌ Failed to clear queue:', error)
    }
})

ipcMain.on('set-polling-rate', (_, rate: number) => {
    if (!iohook) return
    
    try {
        iohook.setPollingRate(rate)
        console.log(`⚡ Polling rate set to ${rate}ms`)
    } catch (error) {
        console.error('❌ Failed to set polling rate:', error)
    }
})

ipcMain.on('enable-performance-mode', () => {
    if (!iohook) return
    
    try {
        iohook.enablePerformanceMode()
        console.log('🚀 Performance mode enabled')
    } catch (error) {
        console.error('❌ Failed to enable performance mode:', error)
    }
})

ipcMain.on('disable-performance-mode', () => {
    if (!iohook) return
    
    try {
        iohook.disablePerformanceMode()
        console.log('🐌 Performance mode disabled')
    } catch (error) {
        console.error('❌ Failed to disable performance mode:', error)
    }
})

ipcMain.on('set-verbose-logging', (_, enable: boolean) => {
    if (!iohook) return
    
    try {
        iohook.setVerboseLogging(enable)
        console.log(`📝 Verbose logging ${enable ? 'enabled' : 'disabled'}`)
    } catch (error) {
        console.error('❌ Failed to set verbose logging:', error)
    }
})

// Electron app events
app.whenReady().then(() => {
    console.log('🚀 Electron main process started')
    console.log('⚡ Electron app ready')
    
    createWindow()
    
    // Initialize iohook after window is created
    if (initializeIOHook()) {
        console.log('🎉 iohook-macos initialization completed')
        // Don't auto-check permissions here, let the window load event handle it
    } else {
        console.error('💥 iohook-macos initialization failed')
    }
})

app.on('window-all-closed', () => {
    console.log('🔚 All windows closed')
    
    // Stop permission monitoring
    stopPermissionMonitoring()
    
    // Stop monitoring before quitting
    if (iohook) {
        try {
            iohook.stopMonitoring()
            console.log('✅ iohook monitoring stopped on quit')
        } catch (error) {
            console.error('❌ Error stopping monitoring on quit:', error)
        }
    }
    
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

app.on('before-quit', () => {
    stopPermissionMonitoring()
})

process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason)
})

console.log('📋 Electron main process script loaded')
