const { app, BrowserWindow, dialog } = require('electron');
const { autoUpdater } = require('electron-updater'); // Manages background updates
let mainWindow;

// Configure updater options 
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
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  });

  mainWindow.maximize();
  mainWindow.loadURL('https://hiragana-practice.replit.app/');

  // Block native minimisation attempts
  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.restore();
  });

  // Check for wrapper updates immediately upon launching
  autoUpdater.checkForUpdatesAndNotify();
});

// Trigger a popup when the new update finishes downloading
autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Ready',
    message: 'A new version of Hiragana Dojo is ready. Restart now to apply?',
    buttons: ['Restart', 'Later']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall(); // Restarts and applies update
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
