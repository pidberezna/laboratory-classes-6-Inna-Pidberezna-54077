const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

let mainWindow;

const waitForServer = (url) => {
  return new Promise((resolve, reject) => {
    const interval = 100;
    const timeout = 10000;
    let elapsed = 0;

    const checkServer = () => {
      http
        .get(url, (res) => {
          if (
            res.statusCode === 200 ||
            res.statusCode === 302 ||
            res.statusCode === 304
          ) {
            console.log('Server is running');
            resolve();
          } else {
            setTimeout(checkServer, interval);
          }
        })
        .on('error', (err) => {
          elapsed += interval;
          if (elapsed < timeout) {
            setTimeout(checkServer, interval);
          } else {
            reject(
              new Error(
                `Server did not start within ${timeout}ms: ${err.message}`
              )
            );
          }
        });
    };

    checkServer();
  });
};

const startExpressServer = () => {
  const server = spawn('npm', ['start'], {
    shell: true,
    stdio: 'inherit',
  });

  server.on('error', (error) => {
    console.error('Failed to start Express server:', error);
  });

  app.on('quit', () => {
    server.kill('SIGINT');
  });

  return server;
};

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  try {
    await waitForServer('http://localhost:3000');
    await mainWindow.loadURL('http://localhost:3000');
  } catch (error) {
    console.error('Error loading Express app:', error);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.whenReady().then(() => {
  startExpressServer();

  setTimeout(() => createWindow(), 1000);

  app.on('activate', () => {
    if (mainWindow === null) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
