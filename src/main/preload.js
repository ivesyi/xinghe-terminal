'use strict';
const { contextBridge, ipcRenderer } = require('electron');
const call = (ch, ...a) => ipcRenderer.invoke(ch, ...a);
contextBridge.exposeInMainWorld('skapi', {
  getData: () => call('getData'),
  setTier: (n, t) => call('setTier', n, t),
  useInProject: (n, p, on) => call('useInProject', n, p, on),
  projectInfo: p => call('projectInfo', p),
  recentProjects: () => call('recentProjects'),
  readSkillMd: n => call('readSkillMd', n),
  deleteSkill: n => call('deleteSkill', n),
  checkUpdates: () => call('checkUpdates'),
  getConfig: () => call('getConfig'),
  setHubPath: p => call('setHubPath', p),
  cloneHub: (u, d) => call('cloneHub', u, d),
  getRemote: () => call('getRemote'),
  setRemote: u => call('setRemote', u),
  validateRemote: () => call('validateRemote'),
  gitPull: () => call('gitPull'),
  gitPush: () => call('gitPush'),
  pickProject: () => call('pickProject'),
  openRepo: r => call('openRepo', r),
  setTheme: t => call('setTheme', t),
});
