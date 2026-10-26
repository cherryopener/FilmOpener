const { app, BrowserWindow, protocol, net, shell, ipcMain, Menu } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

// Register custom protocol 'app' as privileged
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      allowServiceWorkers: true,
      corsEnabled: true,
    },
  },
]);

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function getOutDir() {
  if (app.isPackaged) {
    // When packaged with electron-builder
    const asarOut = path.join(__dirname, '..', 'out');
    if (fs.existsSync(asarOut)) return asarOut;
    return path.join(process.resourcesPath, 'out');
  }
  return path.join(__dirname, '..', 'out');
}

function setupAppProtocol() {
  const outDir = getOutDir();

  protocol.handle('app', (request) => {
    try {
      const parsedUrl = new URL(request.url);
      let pathname = decodeURIComponent(parsedUrl.pathname);

      if (pathname === '/' || pathname === '') {
        pathname = '/index.html';
      }

      let filePath = path.join(outDir, pathname);

      // Check if file exists, if not check for directory/index.html or fallback to root index.html
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          const indexSub = path.join(filePath, 'index.html');
          if (fs.existsSync(indexSub)) {
            filePath = indexSub;
          } else {
            filePath = path.join(outDir, 'index.html');
          }
        }
      } else {
        // Fallback for HTML5 SPA routing
        filePath = path.join(outDir, 'index.html');
      }

      return net.fetch(url.pathToFileURL(filePath).toString());
    } catch (err) {
      console.error('Error handling protocol request:', err);
      return net.fetch(url.pathToFileURL(path.join(outDir, 'index.html')).toString());
    }
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1300,
    height: 880,
    minWidth: 1000,
    minHeight: 650,
    title: 'FilmOpener',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  });

  // Handle external links (open in default OS browser)
  mainWindow.webContents.setWindowOpenHandler(({ url: linkUrl }) => {
    if (linkUrl.startsWith('http:') || linkUrl.startsWith('https:')) {
      shell.openExternal(linkUrl);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  if (isDev) {
    const devUrl = process.env.ELECTRON_START_URL || 'http://localhost:3000';
    mainWindow.loadURL(devUrl).catch(() => {
      // If dev server not ready, fallback to app protocol
      mainWindow.loadURL('app://filmopener/index.html');
    });
    // Open DevTools in dev mode
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL('app://filmopener/index.html');
  }

  // Create clean menu supporting shortcuts (Copy, Paste, Undo, etc.)
  createApplicationMenu();
}

function createApplicationMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ]
      : []),
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [{ type: 'separator' }, { role: 'front' }]
          : [{ role: 'close' }]),
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers
ipcMain.handle('get-app-version', () => app.getVersion());

app.whenReady().then(() => {
  setupAppProtocol();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
