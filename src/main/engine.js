'use strict';
// 纯 Node 引擎:读写 ~/skills/registry.json + 软链。无 electron 依赖,可独立自测。
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');

const HUB = process.env.SKILL_HUB || path.join(os.homedir(), 'skills');
const REG = path.join(HUB, 'registry.json');
const SK = path.join(HUB, 'skills');
const USAGE = path.join(HUB, '.usage.log');
const STATE = path.join(HUB, '.desktop-state.json');

const exp = p => p.replace(/^~(?=$|\/)/, os.homedir());
const readReg = () => JSON.parse(fs.readFileSync(REG, 'utf8'));
const writeReg = r => fs.writeFileSync(REG, JSON.stringify(r, null, 2));
const readState = () => { try { return JSON.parse(fs.readFileSync(STATE, 'utf8')); } catch { return { recent: [] }; } };
const writeState = s => fs.writeFileSync(STATE, JSON.stringify(s, null, 2));

function link(name, dir) {
  fs.mkdirSync(dir, { recursive: true });
  const lnk = path.join(dir, name), tgt = path.join(SK, name);
  if (!fs.existsSync(tgt)) return;
  try { const st = fs.lstatSync(lnk); if (st.isSymbolicLink()) fs.rmSync(lnk); else return; } catch {}
  fs.symlinkSync(tgt, lnk);
}
function unlink(name, dir) {
  const lnk = path.join(dir, name);
  try { if (fs.lstatSync(lnk).isSymbolicLink() && fs.readlinkSync(lnk).startsWith(SK)) fs.rmSync(lnk); } catch {}
}

function lastUsedMap() {
  const m = {};
  try { for (const ln of fs.readFileSync(USAGE, 'utf8').split('\n')) { const p = ln.split('\t'); if (p.length >= 3) m[p[2]] = p[0]; } } catch {}
  const out = {};
  for (const [n, ts] of Object.entries(m)) { const d = Math.floor((Date.now() - new Date(ts.replace(' ', 'T')).getTime()) / 86400000); out[n] = isNaN(d) ? null : d; }
  return out;
}

function getData() {
  const r = readReg(), last = lastUsedMap(), skills = [];
  for (const [name, e] of Object.entries(r.skills)) {
    const up = e.upstream || {};
    skills.push({ name, tier: e.tier, group: e.group, oss: !!e.upstream, repo: up.repo || '', desc: e.description || '', agents: e.agents || [], lastUsed: last[name] ?? null });
  }
  const groups = [...new Set(skills.map(s => s.group))].sort();
  return { skills, loadouts: r.loadouts || {}, stats: { total: skills.length, global: skills.filter(s => s.tier === 'global').length, oss: skills.filter(s => s.oss).length, groups } };
}

function setTier(name, tier) {
  const r = readReg();
  if (!r.skills[name]) throw new Error('unknown skill ' + name);
  r.skills[name].tier = tier; writeReg(r);
  for (const dir of Object.values(r.global_dirs || {})) tier === 'global' ? link(name, exp(dir)) : unlink(name, exp(dir));
  return true;
}

const projectDirs = (r, root) => Object.values(r.project_dirs || {}).map(rel => path.join(root, rel));
function logUse(name, proj) { try { fs.appendFileSync(USAGE, `${new Date().toISOString().slice(0, 19).replace('T', ' ')}\tuse\t${name}\t${proj}\n`); } catch {} }

function useInProject(name, proj, on) {
  const r = readReg();
  for (const dir of projectDirs(r, proj)) on ? link(name, dir) : unlink(name, dir);
  if (on) { logUse(name, proj); const s = readState(); s.recent = [proj, ...(s.recent || []).filter(p => p !== proj)].slice(0, 8); writeState(s); }
  return true;
}

function projectInfo(proj) {
  const r = readReg(), installed = new Set();
  for (const dir of projectDirs(r, proj)) {
    try { for (const f of fs.readdirSync(dir)) { try { const l = path.join(dir, f); if (fs.lstatSync(l).isSymbolicLink() && fs.readlinkSync(l).startsWith(SK)) installed.add(f); } catch {} } } catch {}
  }
  return [...installed];
}

const recentProjects = () => readState().recent || [];
const readSkillMd = name => { try { return fs.readFileSync(path.join(SK, name, 'SKILL.md'), 'utf8'); } catch { return '(无 SKILL.md)'; } };

function gitPush() {
  return new Promise(res => {
    execFile('git', ['-C', HUB, 'add', '-A'], () =>
      execFile('git', ['-C', HUB, 'commit', '-q', '-m', 'desktop: update'], () =>
        execFile('git', ['-C', HUB, 'push'], (e, o, er) => res({ ok: !e, msg: (er || o || '').toString().slice(-200) }))));
  });
}

module.exports = { HUB, SK, getData, setTier, useInProject, projectInfo, recentProjects, readSkillMd, gitPush };

// ponytail: 自测 — `node engine.js --check`(只读,不改任何东西)
if (require.main === module && process.argv.includes('--check')) {
  const d = getData();
  console.assert(d.skills.length > 0, 'skills empty');
  console.assert(d.stats.groups.length > 0, 'no groups');
  console.assert(d.skills.every(s => s.name && s.tier), 'bad skill shape');
  console.log('OK', d.skills.length, 'skills /', d.stats.global, 'global /', d.stats.oss, 'oss /', d.stats.groups.length, 'groups');
}
