'use strict';
const { app, BrowserWindow, ipcMain, dialog, shell, nativeTheme } = require('electron');
const path = require('path');
const E = require('./engine');

ipcMain.handle('getData', () => E.getData());
ipcMain.handle('setTier', (_e, name, tier) => E.setTier(name, tier));
ipcMain.handle('setUpdatePrompt', (_e, name, text) => E.setUpdatePrompt(name, text));
ipcMain.handle('useInProject', (_e, name, proj, on) => E.useInProject(name, proj, on));
ipcMain.handle('applyLoadout', (_e, lo, proj) => E.applyLoadout(lo, proj));
ipcMain.handle('projectInfo', (_e, proj) => E.projectInfo(proj));
ipcMain.handle('recentProjects', () => E.recentProjects());
ipcMain.handle('readSkillMd', (_e, name) => E.readSkillMd(name));
ipcMain.handle('deleteSkill', (_e, name) => E.deleteSkill(name));
ipcMain.handle('createLoadout', (_e, name, members) => E.createLoadout(name, members));
ipcMain.handle('deleteLoadout', (_e, name) => E.deleteLoadout(name));
ipcMain.handle('checkUpdates', () => E.checkUpdates());
ipcMain.handle('getConfig', () => E.getConfig());
ipcMain.handle('setHubPath', (_e, p) => E.setHubPath(p));
ipcMain.handle('cloneHub', (_e, url, dest) => E.cloneHub(url, dest));
ipcMain.handle('initHub', (_e, dest) => E.initHub(dest));
ipcMain.handle('getRemote', () => E.getRemote());
ipcMain.handle('setRemote', (_e, url) => E.setRemote(url));
ipcMain.handle('validateRemote', () => E.validateRemote());
ipcMain.handle('gitPull', () => E.gitPull());
ipcMain.handle('gitPush', () => E.gitPush());
ipcMain.handle('gitSyncStatus', () => E.gitSyncStatus());
ipcMain.handle('pickProject', async () => {
  const r = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle('openRepo', (_e, repo) => shell.openExternal('https://' + repo));
ipcMain.handle('setTheme', (_e, t) => { nativeTheme.themeSource = t; return t; });

// ---- 应用自更新(手动一键):启动查 GitHub latest → 右上角提示 → 点击自替换重启 ----
// 未签名 app 用不了 electron-updater(mac 强制要求签名),走 dmg 自替换;失败由渲染层兜底开 release 页
const UPDATE_REPO = 'ivesyi/xinghe-terminal';
const cmpVer = (a, b) => {
  const pa = String(a).replace(/^v/, '').split('.').map(Number), pb = String(b).replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < 3; i++) { const d = (pa[i] || 0) - (pb[i] || 0); if (d) return d; }
  return 0;
};
ipcMain.handle('checkAppUpdate', async () => {
  try {
    const r = await fetch(`https://api.github.com/repos/${UPDATE_REPO}/releases/latest`, { headers: { 'user-agent': 'xinghe-terminal' } });
    if (!r.ok) return { hasUpdate: false };
    const j = await r.json();
    const latest = (j.tag_name || '').replace(/^v/, '');
    const arch = process.arch === 'arm64' ? 'arm64' : 'x64';
    const asset = (j.assets || []).find(a => a.name.endsWith(`-${arch}.dmg`));
    return { hasUpdate: cmpVer(latest, app.getVersion()) > 0, current: app.getVersion(), latest,
      dmgUrl: asset ? asset.browser_download_url : null, pageUrl: j.html_url };
  } catch { return { hasUpdate: false }; }
});
ipcMain.handle('applyAppUpdate', async (_e, dmgUrl) => {
  if (process.platform !== 'darwin' || !dmgUrl) return { ok: false, err: '此平台请到 release 页手动下载' };
  const { execFileSync } = require('child_process'), fs = require('fs'), os = require('os');
  let mnt;
  try {
    const buf = Buffer.from(await (await fetch(dmgUrl)).arrayBuffer());
    const dmg = path.join(os.tmpdir(), 'xinghe-update.dmg');
    fs.writeFileSync(dmg, buf);
    const out = execFileSync('hdiutil', ['attach', dmg, '-nobrowse', '-readonly'], { encoding: 'utf8' });
    mnt = (out.match(/\/Volumes\/[^\n]+/) || [])[0];
    if (!mnt) throw new Error('dmg 挂载失败');
    mnt = mnt.trim();
    const appName = fs.readdirSync(mnt).find(n => n.endsWith('.app'));
    if (!appName) throw new Error('dmg 内未找到 .app');
    const dest = '/Applications/' + appName;
    fs.rmSync(dest, { recursive: true, force: true }); // mac 允许删除运行中的 bundle,文件句柄仍有效
    execFileSync('ditto', [path.join(mnt, appName), dest]);
    try { execFileSync('xattr', ['-dr', 'com.apple.quarantine', dest]); } catch {}
    try { execFileSync('hdiutil', ['detach', mnt, '-force']); } catch {}
    app.relaunch();
    app.exit(0);
    return { ok: true };
  } catch (err) {
    if (mnt) try { execFileSync('hdiutil', ['detach', mnt, '-force']); } catch {}
    return { ok: false, err: err.message || String(err) };
  }
});

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
    const x = process.argv.indexOf('--exec'); // TEMP: 验收用,截图前执行 JS
    win.webContents.on('did-finish-load', () => setTimeout(async () => {
      if (x > -1 && process.argv[x + 1]) { try { const rr = await win.webContents.executeJavaScript(process.argv[x + 1]); console.log('exec ok:', rr); } catch (e) { console.error('exec err:', e.message); } await new Promise(r => setTimeout(r, 800)); }
      const img = await win.webContents.capturePage();
      require('fs').writeFileSync(process.argv[i + 1], img.toPNG());
      app.quit();
    }, 1500));
  }
}
// registry 变更 → 通知渲染层刷新(启动取一次 + 变更刷新,不轮询)
// ponytail: 原生 fs.watch 够用;hub 路径运行时切换后需重启才重挂 watcher
let watchT;
try {
  require('fs').watch(path.join(E.getConfig().hubPath, 'registry.json'), () => {
    clearTimeout(watchT);
    watchT = setTimeout(() => BrowserWindow.getAllWindows().forEach(w => w.webContents.send('hubChanged')), 400);
  });
} catch {}

app.whenReady().then(() => {
  // dev/运行态 dock 也用星核图标(打包版走 icns,这里让 `npm run dev` 也换掉 Electron 默认图标)
  if (process.platform === 'darwin' && app.dock) {
    try { app.dock.setIcon(path.join(__dirname, '..', '..', 'build', 'icon.png')); } catch {}
  }
  createWindow();
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
