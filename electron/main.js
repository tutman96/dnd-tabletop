const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

function main() {	
	const startUrl = process.env.ELECTRON_START_URL || url.format({
		pathname: path.join(__dirname, '../index.html'),
		protocol: 'file:',
		slashes: true,
	});
	const startOptions = {
		width: 800,
		height: 600,
		backgroundColor: '#212529',
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
		},
	};
	
	const mainWindow = new BrowserWindow({
		...startOptions,
		minWidth: 600,
		minHeight: 400,
	});

	const otherWindows = {
		'table': new BrowserWindow({
			...startOptions,
			minimizable: false,
			closable: false
		})
	}

	for (const windowName in otherWindows) {
		const otherWindow = otherWindows[windowName];
		otherWindow.loadURL(startUrl + '#' + windowName)

		mainWindow.webContents.on('ipc-message', (e, c, ...args) => {
			otherWindow.webContents.send(c, ...args);
		});
		otherWindow.webContents.on('ipc-message', (e, c, ...args) => {
			mainWindow.webContents.send(c, ...args);
		})
		
		mainWindow.on('closed', () => {
			otherWindow.setClosable(true);
			otherWindow.close();
		})
	}
	
	mainWindow.loadURL(startUrl + '#main');
	mainWindow.on('closed', () => {
		app.quit();
	})
}

app.on('ready', () => {
	app.removeListener('activate', main)
	main()
});
app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
app.on('activate', main);