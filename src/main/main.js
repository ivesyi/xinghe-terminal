'use strict';
const { app, BrowserWindow, ipcMain, dialog, shell, nativeTheme } = require('electron');
const path = require('path');
const E = require('./engine');

ipcMain.handle('getData', () => E.getData());
ipcMain.handle('setTier', (_e, name, tier) => E.setTier(name, tier));
ipcMain.handle('useInProject', (_e, name, proj, on) => E.useInProject(name, proj, on));
ipcMain.handle('applyLoadout', (_e, lo, proj) => E.applyLoadout(lo, proj));
ipcMain.handle('projectInfo', (_e, proj) => E.projectInfo(proj));
ipcMain.handle('recentProjects', () => E.recentProjects());
ipcMain.handle('readSkillMd', (_e, name) => E.readSkillMd(name));
ipcMain.handle('deleteSkill', (_e, name) => E.deleteSkill(name));
ipcMain.handle('checkUpdates', () => E.checkUpdates());
ipcMain.handle('getConfig', () => E.getConfig());
ipcMain.handle('setHubPath', (_e, p) => E.setHubPath(p));
ipcMain.handle('cloneHub', (_e, url, dest) => E.cloneHub(url, dest));
ipcMain.handle('getRemote', () => E.getRemote());
ipcMain.handle('setRemote', (_e, url) => E.setRemote(url));
ipcMain.handle('validateRemote', () => E.validateRemote());
ipcMain.handle('gitPull', () => E.gitPull());
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
  // 自检截图:`electron . --screenshot /path/out.png` 渲染 1.5s 后截图退出(headless 验收用)
  const i = process.argv.indexOf('--screenshot');
  if (i > -1 && process.argv[i + 1]) {
    win.webContents.on('did-finish-load', () => setTimeout(async () => {
      const img = await win.webContents.capturePage();
      require('fs').writeFileSync(process.argv[i + 1], img.toPNG());
      app.quit();
    }, 1500));
  }
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
