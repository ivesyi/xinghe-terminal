# HANDOFF — 星核 / xinghe-terminal

> 交接快照：2026-07-08。跨会话/跨设备恢复看这里。
> 本地目录 `skillhub-desktop`，GitHub 仓已改名 **`ivesyi/xinghe-terminal`**（公开）。目录名暂未跟改。

## 一句话

星核 = 跨 AI Agent（Claude Code / Codex / Cursor）的 **skill 管理桌面端**。
唯一真源是 hub 仓 `~/skills`（`registry.json` + `skills/`），靠**软链**分发到各工具的
全局层或项目层。星核是这套体系的 GUI，与 CLI `skillctl` 读写同一份 registry。

## 当前状态（2026-07-08）

| 项 | 值 |
|---|---|
| 版本 | `0.3.1`（package.json） |
| 分支 | `main`，与 origin 同步，工作区干净 |
| 远端 | `git@github.com:ivesyi/xinghe-terminal.git`（公开） |
| 已发布 | v0.2.0 / v0.3.0 / **v0.3.1**（latest） |
| ⚠️ 未发布 | `089bdcd`（管家值守卡）在 main 上但**没打 tag** → 下次发版 v0.3.2 带上 |
| 本地安装 | `/Applications/星核.app`（从 `release/mac-arm64/` 拷入，非 dmg 拖装） |

## 代码结构（零框架，共 ~1.6k 行）

```
src/main/engine.js      366行  全部业务逻辑:registry 读写 / 软链装卸 / git 同步 /
                               externalSkills(外部托管+plugin通道扫描) / stewardState
src/main/main.js        122行  Electron 壳 + IPC 接线 + fs.watch + 应用自更新(下载dmg自替换)
src/main/preload.js      33行  contextBridge → window.skapi
src/renderer/index.html 1096行 整个 UI(vanilla JS,无 React/构建步骤)
```

- 不依赖 `skillctl`，直接操作 registry + 软链；`proper-lockfile` 防并发（与 CLI 互通安全）
- 打包 `npm run dist:mac`（`--win` 打 Windows）；push `v*` tag 触发 GitHub Actions 出双平台包

## 核心概念（改代码前必须理解）

- **星级** = tier：★★★★★ `global` 常驻（软链进三个工具全局层，所有项目自带）／★★★★ `on-demand` 按需（装入项目才生效）
- **收编默认 `on-demand`，绝不默认常驻**（2026-07-05 Yihu 拍板，推翻过「保持原行为」）
- **更新渠道**（channel）1:1 映射 UI 文案与行为，**只有四类**：
  | channel | pill | 行为 | 提示词框 |
  |---|---|---|---|
  | `github` | GitHub 图标(可跳仓) | 管家比对上游 sha 自动更新 | 折叠 |
  | `local` | 自制 | 直接改文件 | 不显示 |
  | `prompt` | 提示词 | 管家执行 `update.prompt` | 展开可编辑 |
  | 外部托管 | 外部 | lark-cli / plugin 自管 | 不显示 |
- **「移植」渠道已废除**（2026-07-06）。硬原则：**任何标签/状态必须映射到用户可操作或系统可执行的功能**，禁止调试注释式分类。加新枚举前先问：这个值对应什么动作？答不上就别加。

## 生态三件套

1. **hub 仓** `~/skills`（GitHub `ivesyi/skill-hub`）：64 个 skill 的唯一真源 + `skillctl` CLI + `skill-update-bot`（现降级为管家的工具脚本）
2. **管家 skill** `~/skills/skills/yiqiai-xinghe-steward`：巡检 spec（扫描→判断→收编/上报→验证→报告）+ 安全约定
3. **值守 project** `~/zero/WorkSpace/xinghe-agent`：跑 `/loop 6h` 的 Claude Code 会话（tmux `xinghe-steward`），每 6 小时巡检；结果写 `~/skills/.steward-state.json` → 星核数据页读它渲染值守卡

## 已知待办

- [ ] **发 v0.3.2**：把管家值守卡（`089bdcd`）发出去
- [ ] **吸附模式 v1**（Yihu 2026-07-02 提出，讲后做）：全局快捷键切换普通窗口 ↔ 右缘置顶窄条（~360px），`setAlwaysOnTop` + `screen.workArea`。半天量级。v2 跟随前台窗口（需 Accessibility + native 模块）、v3 情境吸附（感知终端 cwd 自动切项目）
- [ ] 本地目录名 `skillhub-desktop` → 考虑改成 `xinghe-terminal` 对齐仓名
- [ ] README 截图位还是 `<!-- TODO: screenshot -->`
- [ ] 签名/公证（免 Gatekeeper 提示）需 Apple 开发者账号，暂缓

## 管家侧待 Yihu 拍板（不在本仓）

- 飞书通知发不出：mini 无人值守会话拿不到 macOS Keychain → 在 tmux 会话执行 `lark-cli config keychain-downgrade`（密钥落本地文件）
- 4 条 prompt 渠道更新提示词待确认基线：对管家会话说「星核 prompt 基线确认」

## 硬规则（踩过的坑）

- **hub 提交只 `git add` 自己动过的路径，禁 `git add -A`**——hub 里常有别的会话的半成品（管家 auto-update 误扫过嵌入 gitlink）
- **vendor 第三方 skill 前剥 `.git`**，ref 记进 `registry.upstream`
- **clone 里的 untracked 文件要查**（xhs 的根 SKILL.md 是本地拷的，走自动 revendor 会被冲掉 → 判 prompt 渠道）
- **未签名 mac app 用不了 electron-updater**（强制要签名）→ 自更新走 dmg 自替换（下载→hdiutil 挂载→ditto 替换→xattr 清隔离→relaunch），失败兜底开 release 页
- **GitHub 会剥中文资产名** → `build.artifactName` 已固定 ASCII 模板
- 改 `chapters/registry` 类持久化结构后记得 bump 相关 STORAGE_KEY（渲染层游标）

## 常用命令

```bash
npm run dev                    # 本地跑
npm run dist:mac               # 打包 dmg → release/
open release/mac-arm64/星核.app # 跑打包版
git tag vX.Y.Z && git push origin main vX.Y.Z   # 触发 CI 发版

~/skills/bin/skillctl status   # CLI 侧对账
tmux attach -t xinghe-steward  # 看管家值守会话
```

## 自检（改完必跑）

```bash
node --check src/main/engine.js src/main/main.js src/main/preload.js
# 渲染层内联脚本:抽出 <script> 再 node --check
npx electron . --screenshot /tmp/x.png --exec "<js>"   # headless 截图自检
```
