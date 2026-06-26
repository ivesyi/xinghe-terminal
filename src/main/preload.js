'use strict';
const { contextBridge, ipcRenderer } = require('electron');
const call = (ch, ...a) => ipcRenderer.invoke(ch, ...a);
contextBridge.exposeInMainWorld('api', {
  getData: () => call('getData'),
  setTier: (n, t) => call('setTier', n, t),
  useInProject: (n, p, on) => call('useInProject', n, p, on),
  projectInfo: p => call('projectInfo', p),
  recentProjects: () => call('recentProjects'),
  readSkillMd: n => call('readSkillMd', n),
  gitPush: () => call('gitPush'),
  pickProject: () => call('pickProject'),
  openRepo: r => call('openRepo', r),
  setTheme: t => call('setTheme', t),
});
