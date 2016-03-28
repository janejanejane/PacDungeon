'use strict';

// require( './lib/pixi.js' );
// require( './lib/phaser.js' );
// require( './main.js' );

const appRootDir = require( 'app-root-dir' );
const electron = require( 'electron' );
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

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

    mainWindow = new BrowserWindow({ width: 800, height: 600 });
    mainWindow.loadURL( file );
//    mainWindow.webContents.openDevTools();
    mainWindow.setMenu( null );
    mainWindow.on( 'close', function() {
        // multi windows are in an array, dereference when closing each one
        mainWindow = null;
    });
});
