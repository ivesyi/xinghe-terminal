'use strict';
// 纯 Node 引擎:读写 <hub>/registry.json + 软链。无 electron 依赖,可独立自测。
// hub 路径可配置(~/.skillhub.json),为团队/学员多人使用设计:克隆团队 hub、同步、推送。
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');

const CFG = path.join(os.homedir(), '.skillhub.json');
const exp = p => p.replace(/^~(?=$|\/)/, os.homedir());
const readCfg = () => { try { return JSON.parse(fs.readFileSync(CFG, 'utf8')); } catch { return {}; } };
const writeCfg = c => fs.writeFileSync(CFG, JSON.stringify(c, null, 2));

let HUB, REG, SK, USAGE, STATE;
function setPaths(h) { HUB = h; REG = path.join(h, 'registry.json'); SK = path.join(h, 'skills'); USAGE = path.join(h, '.usage.log'); STATE = path.join(h, '.desktop-state.json'); }
setPaths(readCfg().hubPath || process.env.SKILL_HUB || path.join(os.homedir(), 'skills'));

const readReg = () => JSON.parse(fs.readFileSync(REG, 'utf8'));
const writeReg = r => fs.writeFileSync(REG, JSON.stringify(r, null, 2));

// 文件锁:防 GUI 与 skillctl / 其他实例并发写 registry+软链(PRD: proper-lockfile)。
// ponytail: 锁粒度=整个 registry,一把锁包一次操作;单人桌面场景足够。
let lockfile = null; try { lockfile = require('proper-lockfile'); } catch {}
async function withLock(fn) {
  if (!lockfile || !fs.existsSync(REG)) return fn();
  const release = await lockfile.lock(REG, { stale: 30000, retries: { retries: 20, minTimeout: 50, maxTimeout: 250 } });
  try { return fn(); } finally { await release(); }
}
const readState = () => { try { return JSON.parse(fs.readFileSync(STATE, 'utf8')); } catch { return { recent: [] }; } };
const writeState = s => fs.writeFileSync(STATE, JSON.stringify(s, null, 2));
const hasHub = () => fs.existsSync(REG);

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

// 外部托管的常驻 skill:扫全局 agent 目录里"不指向 hub"的软链(npx skills / lark-cli 装的)。
// 只读展示,让用户看到全部在用的常驻 skill,但不纳入 hub 管理(避免与上游托管冲突/陈旧)。
function externalSkills() {
  const r = readReg(), dirs = Object.values(r.global_dirs || {}).map(exp), seen = {};
  for (const dir of dirs) {
    let names = []; try { names = fs.readdirSync(dir); } catch {}
    for (const name of names) {
      if (seen[name]) continue;
      const lnk = path.join(dir, name);
      let tgt; try { if (!fs.lstatSync(lnk).isSymbolicLink()) continue; tgt = fs.readlinkSync(lnk); } catch { continue; }
      if (tgt.startsWith(SK)) continue; // hub 管的,已在 registry 里
      const viaAgents = tgt.includes('/.agents/skills/');
      const isLark = /^(lark|feishu)/.test(name);
      const channel = isLark ? 'lark-cli' : (viaAgents ? 'npx-skills' : 'external');
      const how = isLark ? 'npx skills add larksuite/cli -g -y(随 lark-cli 升级)' : (viaAgents ? 'npx skills update' : '外部托管,见来源目录');
      let desc = '';
      try { const m = fs.readFileSync(path.join(tgt, 'SKILL.md'), 'utf8').match(/description:\s*["'>|]*\s*(.+)/i); if (m) desc = m[1].replace(/["']/g, '').trim().slice(0, 160); } catch {}
      seen[name] = { name, tier: 'global', group: isLark ? 'lark' : 'external', oss: false, repo: '', desc, agents: [], lastUsed: null, external: true, source: tgt.replace(os.homedir(), '~'), update: { channel, source: tgt.replace(os.homedir(), '~'), how } };
    }
  }
  return Object.values(seen);
}

function getData() {
  const r = readReg(), last = lastUsedMap(), skills = [];
  for (const [name, e] of Object.entries(r.skills)) {
    const up = e.upstream || {};
    skills.push({ name, tier: e.tier, group: e.group, oss: !!e.upstream, repo: up.repo || '', desc: e.description || '', agents: e.agents || [], lastUsed: last[name] ?? null, update: e.update || null, external: false });
  }
  const ext = externalSkills();
  for (const s of ext) skills.push(s);
  const groups = [...new Set(skills.map(s => s.group))].sort();
  return { skills, loadouts: r.loadouts || {}, stats: { total: skills.length, global: skills.filter(s => s.tier === 'global').length, oss: skills.filter(s => s.oss).length, external: ext.length, groups } };
}

function setTier(name, tier) {
  return withLock(() => {
    const r = readReg();
    if (!r.skills[name]) throw new Error('unknown skill ' + name);
    r.skills[name].tier = tier; writeReg(r);
    for (const dir of Object.values(r.global_dirs || {})) tier === 'global' ? link(name, exp(dir)) : unlink(name, exp(dir));
    return true;
  });
}

const projectDirs = (r, root) => Object.values(r.project_dirs || {}).map(rel => path.join(root, rel));
function logUse(name, proj) { try { fs.appendFileSync(USAGE, `${new Date().toISOString().slice(0, 19).replace('T', ' ')}\tuse\t${name}\t${proj}\n`); } catch {} }

const touchRecent = proj => { const s = readState(); s.recent = [proj, ...(s.recent || []).filter(p => p !== proj)].slice(0, 8); writeState(s); };

function useInProject(name, proj, on) {
  return withLock(() => {
    const r = readReg();
    for (const dir of projectDirs(r, proj)) on ? link(name, dir) : unlink(name, dir);
    if (on) { logUse(name, proj); touchRecent(proj); }
    return true;
  });
}

// loadout 整套装入项目:一把锁内批量软链(与 skillctl load 同源行为)
function applyLoadout(loName, proj) {
  return withLock(() => {
    const r = readReg(), members = (r.loadouts || {})[loName] || [];
    if (!members.length) throw new Error('空 loadout: ' + loName);
    const done = [];
    for (const name of members) {
      if (!r.skills[name]) continue; // registry 里没有的成员跳过,不硬编码任何名字
      for (const dir of projectDirs(r, proj)) link(name, dir);
      logUse(name, proj); done.push(name);
    }
    touchRecent(proj);
    return done;
  });
}

function projectInfo(proj) {
  const r = readReg(), installed = new Set();
  for (const dir of projectDirs(r, proj)) {
    try { for (const f of fs.readdirSync(dir)) { try { const l = path.join(dir, f); if (fs.lstatSync(l).isSymbolicLink() && fs.readlinkSync(l).startsWith(SK)) installed.add(f); } catch {} } } catch {}
  }
  return [...installed];
}

const recentProjects = () => (readState().recent || []).filter(p => fs.existsSync(p)); // 已删目录不再展示
const readSkillMd = name => { try { return fs.readFileSync(path.join(SK, name, 'SKILL.md'), 'utf8'); } catch { return '(无 SKILL.md)'; } };

// 删除 skill:撤掉全局+近期项目的软链,删 skill 目录,移出 registry/loadouts。不可撤销。
function deleteSkill(name) {
  return withLock(() => {
    const r = readReg();
    if (!r.skills[name]) throw new Error('unknown skill ' + name);
    for (const dir of Object.values(r.global_dirs || {})) unlink(name, exp(dir));
    for (const proj of recentProjects()) for (const dir of projectDirs(r, proj)) unlink(name, dir);
    for (const k of Object.keys(r.loadouts || {})) r.loadouts[k] = (r.loadouts[k] || []).filter(x => x !== name);
    delete r.skills[name]; writeReg(r);
    try { fs.rmSync(path.join(SK, name), { recursive: true, force: true }); } catch {}
    return true;
  });
}

// ---- 多人使用:配置 / 远端 / 同步 ----
const sh = (cmd, args) => new Promise(res => execFile(cmd, args, (e, o, er) => res({ ok: !e, out: (o || '').toString().trim(), err: (er || '').toString().trim() })));
const git = args => sh('git', ['-C', HUB, ...args]);

function getConfig() { return { hubPath: HUB, hasRegistry: hasHub() }; }
function setHubPath(p) {
  p = exp(p);
  if (!fs.existsSync(path.join(p, 'registry.json'))) throw new Error('该目录没有 registry.json,不是有效 hub');
  const c = readCfg(); c.hubPath = p; writeCfg(c); setPaths(p);
  return getConfig();
}
async function cloneHub(url, dest) {
  dest = exp(dest);
  const r = await sh('git', ['clone', url, dest]);
  if (r.ok) { try { setHubPath(dest); } catch (e) { return { ok: false, err: String(e.message || e) }; } }
  return { ok: r.ok, err: r.err.slice(-300) };
}
async function getRemote() { const r = await git(['remote', 'get-url', 'origin']); return r.ok ? r.out : ''; }
async function setRemote(url) { const has = await getRemote(); const r = await git(['remote', has ? 'set-url' : 'add', 'origin', url]); return { ok: r.ok, err: r.err.slice(-200) }; }
async function validateRemote() { const r = await git(['ls-remote', '--exit-code', 'origin', 'HEAD']); return { ok: r.ok, err: (r.err || 'no access').slice(-200) }; }

// 同步:拉团队最新 + 重新分发常驻(让新增 global skill 立即在 claude/codex/cursor 生效)
function relinkGlobals() {
  const r = readReg();
  for (const [n, e] of Object.entries(r.skills)) if (e.tier === 'global') for (const dir of Object.values(r.global_dirs || {})) link(n, exp(dir));
  return true;
}
async function gitPull() {
  const r = await git(['pull', '--ff-only']);
  if (r.ok) relinkGlobals();
  return { ok: r.ok, msg: (r.err || r.out || '已是最新').slice(-200) };
}
function gitPush() {
  return new Promise(res =>
    execFile('git', ['-C', HUB, 'add', '-A'], () =>
      execFile('git', ['-C', HUB, 'commit', '-q', '-m', 'desktop: update'], () =>
        execFile('git', ['-C', HUB, 'push'], (e, o, er) => res({ ok: !e, msg: (er || o || '').toString().slice(-200) })))));
}

// 立即检查 OSS skill 上游:比对已记录 ref 与远端最新 sha(轻量,不跑 claude 判定)
async function checkUpdates() {
  const r = readReg(), out = [];
  for (const [name, e] of Object.entries(r.skills)) {
    const u = e.upstream; if (!u) continue;
    const repo = (u.repo || '').replace(/^github\.com\//, ''), br = u.branch || 'main';
    const g = await sh('gh', ['api', `repos/${repo}/commits/${br}`, '--jq', '.sha']);
    if (!g.ok) { out.push({ name, repo, error: g.err.slice(-80) || 'gh 失败' }); continue; }
    const latest = g.out.slice(0, 12), recorded = (u.ref || '').slice(0, 12);
    out.push({ name, repo, recorded, latest, hasUpdate: latest !== recorded, last: u.last_reviewed || '' });
  }
  return out;
}

module.exports = {
  getData, setTier, useInProject, applyLoadout, projectInfo, recentProjects, readSkillMd, deleteSkill,
  getConfig, setHubPath, cloneHub, getRemote, setRemote, validateRemote, gitPull, gitPush, checkUpdates,
};

// ponytail: 自测 — `node engine.js --check`(只读,不改任何东西)
if (require.main === module && process.argv.includes('--check')) {
  const d = getData();
  console.assert(d.skills.length > 0, 'skills empty');
  console.assert(d.stats.groups.length > 0, 'no groups');
  console.assert(d.skills.every(s => s.name && s.tier), 'bad skill shape');
  console.log('OK', d.skills.length, 'skills /', d.stats.global, 'global /', d.stats.oss, 'oss /', d.stats.groups.length, 'groups; hub=', HUB);
}

// 装卸自测 — `node engine.js --selftest <临时项目目录>`:只在传入的临时目录里建/删软链,
// 不碰 registry 内容、不碰全局层。目录必须在 /tmp 或 /private/tmp 下,防误伤真实项目。
if (require.main === module && process.argv.includes('--selftest')) {
  (async () => {
    const proj = process.argv[process.argv.indexOf('--selftest') + 1];
    if (!proj || !/^(\/private)?\/tmp\//.test(proj)) throw new Error('selftest 需要 /tmp 下的临时项目目录');
    fs.mkdirSync(proj, { recursive: true });
    const regBefore = fs.readFileSync(REG, 'utf8');
    const d = getData();
    const pick = d.skills.find(s => !s.external && s.tier === 'on-demand').name;
    const lo = Object.keys(d.loadouts)[0];

    await useInProject(pick, proj, true);
    console.assert(projectInfo(proj).includes(pick), 'use 后应已装: ' + pick);
    await useInProject(pick, proj, false);
    console.assert(!projectInfo(proj).includes(pick), 'unuse 后应已卸: ' + pick);

    const done = await applyLoadout(lo, proj);
    const inst = new Set(projectInfo(proj));
    console.assert(done.length > 0 && done.every(n => inst.has(n)), 'loadout 成员应全部装上');

    // 清理:卸掉 loadout,项目恢复干净
    for (const n of done) await useInProject(n, proj, false);
    console.assert(projectInfo(proj).length === 0, '清理后应无残留软链');
    console.assert(fs.readFileSync(REG, 'utf8') === regBefore, 'registry 内容不得被改动');
    console.log(`SELFTEST OK: use/unuse(${pick}) + loadout(${lo}: ${done.length} 个) @ ${proj}; registry 未变`);
  })().catch(e => { console.error('SELFTEST FAIL:', e.message); process.exit(1); });
}
