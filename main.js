const { app, BrowserWindow, dialog, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');

let mainWindow;

// Configure updater
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

app.whenReady().then(() => {
  // Create a menu with ONLY File
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'Alt+F4',
          click: () => {
            app.quit();
          }
        }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);

  mainWindow = new BrowserWindow({
    title: 'Hiragana Dojo App',

    // Fullscreen kiosk
    fullscreen: true,
    kiosk: true,

    // Window restrictions
    minimizable: false,
    maximizable: false,
    closable: false,
    resizable: false,
    movable: false,
    fullscreenable: false,

    // Keep frame so menu bar can exist
    frame: true,

    // Always on top
    alwaysOnTop: true,

    // Data persistence
    webPreferences: {
      partition: 'persist:hiraganadojo',
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  });

  // Force fullscreen kiosk mode
  mainWindow.setKiosk(true);
  mainWindow.setFullScreen(true);

  // Ensure menu bar remains visible
  mainWindow.setAutoHideMenuBar(false);
  mainWindow.setMenuBarVisibility(true);

  // Load website
  mainWindow.loadURL('https://hiragana-practice.replit.app/');

  // Block minimizing
  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.restore();
  });

  // Block attempts to leave fullscreen
  mainWindow.on('leave-full-screen', () => {
    mainWindow.setFullScreen(true);
  });

  // Block attempts to exit kiosk mode
  mainWindow.on('leave-html-full-screen', () => {
    mainWindow.setKiosk(true);
  });

  // Check for updates
  autoUpdater.checkForUpdatesAndNotify();
});

// Update downloaded notification
autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Ready',
    message: 'A new version of Hiragana Dojo is ready. Restart now to apply?',
    buttons: ['Restart', 'Later']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

// Logging
autoUpdater.on('error', (err) => {
  console.error('AutoUpdater Error:', err);
});

autoUpdater.on('checking-for-update', () => {
  console.log('Checking for updates...');
});

autoUpdater.on('update-available', () => {
  console.log('Update available.');
});

autoUpdater.on('update-not-available', () => {
  console.log('No updates available.');
});

// Quit only through File > Exit or update installer
app.on('window-all-closed', () => {
  app.quit();
});