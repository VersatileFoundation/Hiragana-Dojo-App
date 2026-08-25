const { app, BrowserWindow, dialog, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');

let mainWindow;

// Set to true once the user has actually chosen to exit (via the
// File > Exit menu / Alt+F4, or an update is about to install).
// The window is created with closable:false so the OS-level close
// (and therefore app.quit()) is normally blocked; this flag is how
// we tell the 'close' handler below "no really, let it go".
let isQuitting = false;

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
// QUIT
// ============================================================
//
// closable:false / minimizable:false / kiosk mode all fight a
// plain app.quit(), because app.quit() still tries to close each
// BrowserWindow first, and closable:false blocks that. This is
// what made "File > Exit" appear to do nothing. quitApp() marks
// intent to quit, destroys the window directly (bypassing the
// blocked close path), then force-exits the app.
//
// ============================================================

function quitApp() {
  isQuitting = true;

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.destroy();
  }

  app.exit(0);
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
            quitApp();
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
    //
    // NOTE: We deliberately do NOT use kiosk:true here. Electron's
    // kiosk mode forces the frame/menu bar to hide on Windows even
    // when frame:true is set - that contradiction is what made the
    // File menu (and therefore File > Exit) unreachable once the
    // window went fullscreen. Plain fullscreen + the restrictions
    // below gets the same locked-down feel while keeping the menu
    // usable. fullscreenable is left true (default) since setting
    // it false while also setting fullscreen:true is contradictory
    // and can stop setFullScreen() from taking effect reliably.
    // ========================================================

    fullscreen: true,

    // ========================================================
    // WINDOW RESTRICTIONS
    // ========================================================

    minimizable: false,

    maximizable: false,

    closable: false,

    resizable: false,

    movable: false,

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
  // READY
  // ==========================================================

  mainWindow.once('ready-to-show', () => {

    if (!mainWindow.isDestroyed()) {

      mainWindow.setFullScreen(true);

      mainWindow.setAlwaysOnTop(true);

      mainWindow.focus();
    }
  });

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
  // RE-ASSERT LOCKDOWN (only when actually needed)
  // ==========================================================
  //
  // Previously this was also triggered on every 'focus' event,
  // which fired setKiosk()/setFullScreen() constantly - even when
  // the window was already fullscreen - and caused visible
  // flicker/stutter on Windows as it fought the OS window manager.
  // Now it only fires from the specific "we actually left that
  // state" events below, and only calls the setters when the
  // window isn't already in the desired state.
  //
  // ==========================================================

  function reassertLockdown() {

    if (isQuitting || mainWindow.isDestroyed()) {
      return;
    }

    if (!mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(true);
    }

    mainWindow.focus();
  }

  // ==========================================================
  // PREVENT MINIMIZING
  // ==========================================================

  mainWindow.on('minimize', (event) => {

    if (isQuitting) {
      return;
    }

    event.preventDefault();

    if (!mainWindow.isDestroyed()) {
      mainWindow.restore();
      reassertLockdown();
    }
  });

  // ==========================================================
  // PREVENT LEAVING FULLSCREEN
  // ==========================================================

  mainWindow.on('leave-full-screen', reassertLockdown);

  // ==========================================================
  // PREVENT LEAVING HTML FULLSCREEN
  // ==========================================================

  mainWindow.on('leave-html-full-screen', reassertLockdown);

  // ==========================================================
  // BLOCK NATIVE CLOSE UNLESS WE'RE ACTUALLY QUITTING
  // ==========================================================
  //
  // closable:false already hides/disables the native close button
  // on most platforms, but this is the belt-and-suspenders version:
  // if anything ever fires a close (Alt+F4 caught by the OS before
  // our accelerator, an updater path, etc.) and we did NOT set
  // isQuitting via quitApp(), swallow it so kiosk lockdown holds.
  //
  // ==========================================================

  mainWindow.on('close', (event) => {

    if (!isQuitting) {
      event.preventDefault();
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

      isQuitting = true;

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
