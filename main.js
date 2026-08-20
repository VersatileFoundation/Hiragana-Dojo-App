const { app, BrowserWindow, dialog, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');

let mainWindow;

// ============================================================
// BUILD MODE
// ============================================================

// The GitHub Actions portable build sets this environment variable
// before packaging the application.
//
// Installed version:
//   updater enabled
//
// Portable version:
//   updater disabled
//
const isPortable = process.env.HIRAGANA_PORTABLE === '1';

// ============================================================
// AUTO UPDATER
// ============================================================

if (!isPortable) {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
}

// ============================================================
// APP READY
// ============================================================

app.whenReady().then(() => {

  // ==========================================================
  // MENU
  // ==========================================================

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

  // ==========================================================
  // CREATE WINDOW
  // ==========================================================

  mainWindow = new BrowserWindow({

    title: 'Hiragana Dojo App',

    // ========================================================
    // FULLSCREEN / KIOSK
    // ========================================================

    fullscreen: true,
    kiosk: true,

    // ========================================================
    // WINDOW RESTRICTIONS
    // ========================================================

    minimizable: false,
    maximizable: false,
    closable: false,
    resizable: false,
    movable: false,
    fullscreenable: false,

    // Keep window frame because the File menu is required.
    frame: true,

    // Keep application above normal windows.
    alwaysOnTop: true,

    // ========================================================
    // WEB PREFERENCES
    // ========================================================

    webPreferences: {
      partition: 'persist:hiraganadojo',

      nodeIntegration: false,

      contextIsolation: true,

      webSecurity: true
    }
  });

  // ==========================================================
  // FORCE KIOSK MODE
  // ==========================================================

  mainWindow.setKiosk(true);

  // ==========================================================
  // FORCE FULLSCREEN
  // ==========================================================

  mainWindow.setFullScreen(true);

  // ==========================================================
  // ALWAYS ON TOP
  // ==========================================================

  mainWindow.setAlwaysOnTop(true);

  // ==========================================================
  // MENU BAR
  // ==========================================================

  mainWindow.setAutoHideMenuBar(false);

  mainWindow.setMenuBarVisibility(true);

  // ==========================================================
  // LOAD WEBSITE
  // ==========================================================

  mainWindow.loadURL(
    'https://hiragana-practice.replit.app/'
  );

  // ==========================================================
  // PREVENT MINIMIZING
  // ==========================================================

  mainWindow.on('minimize', (event) => {

    event.preventDefault();

    if (!mainWindow.isDestroyed()) {
      mainWindow.restore();

      mainWindow.focus();
    }
  });

  // ==========================================================
  // PREVENT LEAVING FULLSCREEN
  // ==========================================================

  mainWindow.on('leave-full-screen', () => {

    if (!mainWindow.isDestroyed()) {

      mainWindow.setKiosk(true);

      mainWindow.setFullScreen(true);

      mainWindow.focus();
    }
  });

  // ==========================================================
  // PREVENT LEAVING HTML FULLSCREEN
  // ==========================================================

  mainWindow.on('leave-html-full-screen', () => {

    if (!mainWindow.isDestroyed()) {

      mainWindow.setKiosk(true);

      mainWindow.setFullScreen(true);

      mainWindow.focus();
    }
  });

  // ==========================================================
  // ENSURE FULLSCREEN AFTER WINDOW IS READY
  // ==========================================================

  mainWindow.once('ready-to-show', () => {

    if (!mainWindow.isDestroyed()) {

      mainWindow.setKiosk(true);

      mainWindow.setFullScreen(true);

      mainWindow.setAlwaysOnTop(true);

      mainWindow.focus();
    }
  });

  // ==========================================================
  // WINDOW FOCUS
  // ==========================================================

  mainWindow.on('blur', () => {

    if (!mainWindow.isDestroyed()) {

      // Reassert kiosk/fullscreen state when focus is lost.
      mainWindow.setKiosk(true);

      mainWindow.setFullScreen(true);
    }
  });

  // ==========================================================
  // AUTO UPDATE
  // ==========================================================

  if (!isPortable) {

    autoUpdater.checkForUpdatesAndNotify();
  }
});

// ============================================================
// UPDATE DOWNLOADED
// ============================================================

autoUpdater.on('update-downloaded', () => {

  // Portable builds never update automatically.
  if (isPortable) {
    return;
  }

  dialog.showMessageBox({

    type: 'info',

    title: 'Update Ready',

    message:
      'A new version of Hiragana Dojo is ready. Restart now to apply?',

    buttons: [
      'Restart',
      'Later'
    ]

  }).then((result) => {

    if (result.response === 0) {

      autoUpdater.quitAndInstall();
    }
  });
});

// ============================================================
// AUTO UPDATE LOGGING
// ============================================================

autoUpdater.on('error', (err) => {

  console.error(
    'AutoUpdater Error:',
    err
  );
});

autoUpdater.on('checking-for-update', () => {

  console.log(
    'Checking for updates...'
  );
});

autoUpdater.on('update-available', () => {

  console.log(
    'Update available.'
  );
});

autoUpdater.on('update-not-available', () => {

  console.log(
    'No updates available.'
  );
});

// ============================================================
// APP CLOSE
// ============================================================

app.on('window-all-closed', () => {

  app.quit();
});