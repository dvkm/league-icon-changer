

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 */
import { app, BrowserWindow, ipcMain } from 'electron';
// import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import LCUConnector from 'better-lcu-connector';
import MenuBuilder from './menu';

// export default class AppUpdater {
//   constructor() {
//     log.transports.file.level = 'info';
//     autoUpdater.logger = log;
//     autoUpdater.checkForUpdatesAndNotify();
//   }
// }

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
    mainWindow.webContents.openDevTools();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();

  let connector = new LCUConnector();
  console.log(connector);

  ipcMain.on('loaded', (event, arg) => {
    console.log('Client loaded', arg); // prints "ping"
    connector
      .makeRequest('GET', '/lol-summoner/v1/current-summoner')
      .then(summoner => {
        mainWindow.webContents.send('current-summoner', summoner);
        connector
          .makeRequest(
            'GET',
            `/lol-collections/v2/inventories/${summoner.summonerId}/summoner-icons`
          )
          .then(icons => {
            mainWindow.webContents.send('summoner-icon', icons);
            connector
              .makeRequest('GET', '/lol-gameflow/v1/gameflow-phase')
              .then(data => {
                mainWindow.webContents.send('gameflow-phase', data);
                console.log("sent gamephase: ", data)
                return data;
              })
              .catch((err, err2) => {console.log(err, err2)});
            return icons;
          })
          + full + ".png"
        console.log("summoner: ", summoner);
        return summoner;
      })
      .catch((err, err2) => {console.log(err, err2)});
  });

  ipcMain.on('change-icon', (event, arg) => {
    const data = {
      profileIconId: arg
    };
    connector
      .makeRequest(
        'PUT',
        '/lol-summoner/v1/current-summoner/icon',
        JSON.stringify(data)
      )
      .then(summoner => {
        event.reply('current-summoner', summoner);
        return summoner;
      })
      .catch((err, err2) => {console.log(err, err2)});
  });

  connector.addHandler(
    '/lol-gameflow/v1/gameflow-phase',
    'UPDATE',
    (uri, method, data) => {
      // manage UPDATE events
      console.log(uri, data);
      mainWindow.webContents.send('gameflow-phase', data);
    }
  );

  connector.addHandler(
    '/lol-summoner/v1/current-summoner',
    '*',
    (uri, method, data) => {
      console.log(uri, data);
      mainWindow.webContents.send('current-summoner', data, method);
    }
  );

  connector.listen();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', createWindow);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
