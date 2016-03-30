'use strict';

const appRootDir = require( 'app-root-dir' );
const electron = require( 'electron' );
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const WIDTH = 670;
const HEIGHT = 720;

// global reference to avoid auto quit when object is garbage collected
var mainWindow = null;

// quit when all windows are closed
app.on( 'window-all-closed', function() {
    if ( process.platform != 'darwin' ) {
        app.quit();
    }
});

// Electron is initialized and ready to create windows
app.on( 'ready', function() {
    var file = 'file://' + appRootDir.get() + '/index.html';

    mainWindow = new BrowserWindow({ width: WIDTH, height: HEIGHT });
    mainWindow.setMinimumSize( WIDTH, HEIGHT );
    mainWindow.loadURL( file );
//    mainWindow.webContents.openDevTools();
    mainWindow.setMenu( null );
    mainWindow.on( 'close', function() {
        // multi windows are in an array, dereference when closing each one
        mainWindow = null;
    });
});
