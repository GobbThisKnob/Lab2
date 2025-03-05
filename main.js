const net = require('net');
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs'); // Import the fs module


let mainWindow; // Declare mainWindow globally

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 1000,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,  // Ensure DevTools is enabled
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile('index.html');

  // mainWindow.webContents.openDevTools();
}


app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});


app.on('window-all-closed', function () {
  app.quit();
});
