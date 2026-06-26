'use strict';
const { app, BrowserWindow, ipcMain, dialog, shell, nativeTheme } = require('electron');
const path = require('path');
const E = require('./engine');

ipcMain.handle('getData', () => E.getData());
ipcMain.handle('setTier', (_e, name, tier) => E.setTier(name, tier));
ipcMain.handle('useInProject', (_e, name, proj, on) => E.useInProject(name, proj, on));
ipcMain.handle('projectInfo', (_e, proj) => E.projectInfo(proj));
ipcMain.handle('recentProjects', () => E.recentProjects());
ipcMain.handle('readSkillMd', (_e, name) => E.readSkillMd(name));
ipcMain.handle('gitPush', () => E.gitPush());
ipcMain.handle('pickProject', async () => {
  const r = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle('openRepo', (_e, repo) => shell.openExternal('https://' + repo));
ipcMain.handle('setTheme', (_e, t) => { nativeTheme.themeSource = t; return t; });

function createWindow() {
  const win = new BrowserWindow({
    width: 1200, height: 800, minWidth: 940, minHeight: 600,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#08090A',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true },
  });
  win.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
