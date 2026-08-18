const { app, BrowserWindow } = require('electron');
let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    title: "Hiragana Dojo App",
    
    // Keeps the standard top title bar visible
    frame: true, 
    
    // Disables the minimize functionality completely
    minimizable: false, 
    
    // Disables standard full-screen to keep the top bar visible
    fullscreenable: false, 
    
    // Forces the window to stay on top of other applications
    alwaysOnTop: true, 
    
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  });

  // Automatically expands the window to take up the whole screen on launch
  mainWindow.maximize();

  mainWindow.loadURL('https://hiragana-practice.replit.app/');

  // Optional: Catches OS-level minimize requests (like Windows Key + D) and restores it instantly
  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.restore();
  });
});

// Ensures Mac behaves normally when quitting
app.on('window-all-closed', () => {
  app.quit();
});
