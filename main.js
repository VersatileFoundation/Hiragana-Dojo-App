const { app, BrowserWindow, dialog, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');

let mainWindow;

// ============================================================
// APP CONFIGURATION
// ============================================================

app.commandLine.appendSwitch('disable-features', 'msWindowsTaskbar');

// ============================================================
// AUTO UPDATER
// ============================================================
//
// The portable edition produced by Electron Packager does not
// have an installer/updater mechanism. The application therefore
// only attempts automatic updates when an installed version is
// explicitly configured to allow them.
//
// Set HIRAGANA_DOJO_DISABLE_UPDATES=1 to disable updates.
//
// ============================================================

const disableUpdates =
  process.env.HIRAGANA_DOJO_DISABLE_UPDATES === '1';

if (!disableUpdates) {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
}

// ============================================================
// CREATE WINDOW
// ============================================================

function createWindow() {

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
  // BROWSER WINDOW
  // ==========================================================

  mainWindow = new BrowserWindow({

    title: 'Hiragana Dojo App',

    // ========================================================
    // FULLSCREEN
    // ========================================================

    fullscreen: true,

    // ========================================================
    // KIOSK
    // ========================================================

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

    // Keep frame so File menu remains available.
    frame: true,

    // Keep the application above normal windows.
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
  // FORCE FULLSCREEN
  // ==========================================================

  mainWindow.setFullScreen(true);

  // ==========================================================
  // FORCE KIOSK
  // ==========================================================

  mainWindow.setKiosk(true);

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

      mainWindow.setKiosk(true);

      mainWindow.setFullScreen(true);

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
  // READY
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

  mainWindow.on('focus', () => {

    if (!mainWindow.isDestroyed()) {

      mainWindow.setKiosk(true);

      mainWindow.setFullScreen(true);
    }
  });

  // ==========================================================
  // UPDATE CHECK
  // ==========================================================

  if (!disableUpdates) {

    try {

      autoUpdater.checkForUpdatesAndNotify();

    } catch (error) {

      console.error(
        'Unable to check for updates:',
        error
      );
    }
  }
}

// ============================================================
// ELECTRON READY
// ============================================================

app.whenReady().then(() => {

  createWindow();

});

// ============================================================
// UPDATE DOWNLOADED
// ============================================================

autoUpdater.on('update-downloaded', () => {

  if (disableUpdates) {
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
// AUTO UPDATE EVENTS
// ============================================================

autoUpdater.on('error', (error) => {

  console.error(
    'AutoUpdater Error:',
    error
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
// APP EVENTS
// ============================================================

app.on('window-all-closed', () => {

  app.quit();
});
