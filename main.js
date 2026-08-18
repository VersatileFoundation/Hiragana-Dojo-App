const { app, BrowserWindow, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');

let mainWindow;

// Configure updater
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    title: "Hiragana Dojo App",
    frame: true,
    minimizable: false,
    fullscreenable: false,
    alwaysOnTop: true,

    webPreferences: {
      partition: "persist:hiraganadojo",
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  });

  // Maximize the window
  mainWindow.maximize();

  // Load the website
  mainWindow.loadURL('https://hiragana-practice.replit.app/');

  // Prevent minimizing
  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.restore();
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

// Optional logging
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

// Quit when all windows are closed
app.on('window-all-closed', () => {
  app.quit();
});