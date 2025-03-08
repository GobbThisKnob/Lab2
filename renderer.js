// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

// const { ipcRenderer } = require('electron');

// console.log("[Renderer] Renderer process started");

// ipcRenderer.on('frame', (event, frameData) => {
//     console.log("[Renderer] Received frame event, length:", frameData.length);
//     console.log("[Renderer] Frame data (first 50 chars):", frameData.substring(0, 50));
//     document.getElementById('video-feed').src = 'data:image/jpeg;base64,' + frameData;

// });