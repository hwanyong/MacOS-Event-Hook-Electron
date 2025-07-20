import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let mainWindow: BrowserWindow | null = null
let iohook: any = null

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
        
        // Check accessibility permissions
        console.log('🔐 Checking accessibility permissions...')
        const permissions = iohook.checkAccessibilityPermissions()
        console.log('🔐 Accessibility permissions:', permissions.hasPermissions ? 'GRANTED' : 'DENIED')
        
        return true
    } catch (error) {
        console.error('❌ Failed to initialize iohook:', error)
        return false
    }
}

// IPC Handlers for polling mode
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
    } else {
        console.error('💥 iohook-macos initialization failed')
    }
})

app.on('window-all-closed', () => {
    console.log('🔚 All windows closed')
    
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

process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason)
})

console.log('📋 Electron main process script loaded')
