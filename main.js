const { app, BrowserWindow, globalShortcut } = require('electron');

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    title: "Hiragana Dojo App",
    kiosk: true,                 // Mac native kiosk mode hides dock and menu bar
    alwaysOnTop: true,
    fullscreen: true,
    simpleFullscreen: true,      // Prevents native macOS full-screen animation delays
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true         
    }
  });

  mainWindow.loadURL('https://hiragana-practice.replit.app/');

  // Block default Escape and Function keys from dropping full-screen
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11' || input.key === 'Escape') {
      event.preventDefault();
    }
  });
});

// Ensures Mac behaves normally when quitting
app.on('window-all-closed', () => {
  app.quit();
});
