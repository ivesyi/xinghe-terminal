# 星核 · xinghe-terminal

把散落在 Claude Code / Codex / Cursor 里的 AI skill 收进一面墙，像游戏卡牌一样管理：查看、搜索、装卸、成套配装、同步、更新。

一个人 + 几个 agent 的小作坊，需要一个管技能的桌面终端——这就是星核。

<!-- TODO: screenshot -->

## 核心概念

- **技能库（hub）**：所有 skill 的唯一真源，一个 git 仓库（默认 `~/skills`），`registry.json` 登记每个 skill 的分组、星级、来源渠道。
- **软链分发**：skill 不复制，按需软链进各工具的全局层（`~/.claude/skills` 等）或项目层（`<project>/.claude/skills`）。删链即卸载，真源永远只有一份。
- **星级**：★★★★★ 常驻（所有项目自带）/ ★★★★ 按需（装入项目才生效），详情页一键切换。
- **套装（loadout）**：一组 skill 一键装进项目。
- **更新渠道**：每个 skill 一个渠道——`GitHub`（对比上游自动更新）、`自制`（直接改文件）、`提示词`（录一条更新提示词，agent 执行即更新）、`移植`（手工搬运）。渠道、文案、界面行为 1:1 映射。

## 功能

- 卡牌墙：分组（阵营）、星级、熟练度（来自真实调用日志）、来源标签
- 搜索 + 阵营/来源筛选，星级+等级排序
- 详情页：技能文档阅读（Markdown 渲染）、装卸、常驻开关、更新提示词录入、GitHub 一键跳原仓、复制技能名
- 项目装配：选目录 → 装/卸/整套 loadout，与 CLI（skillctl）同源逻辑、文件锁防并发
- GitHub 同步：hub 仓 push/pull，新技能到位自动重挂软链
- 首次运行引导：克隆已有技能库 / 指向本地 hub / 新建空库

## 安装（macOS，Apple Silicon）

1. 下载 Release 里的 `星核-x.y.z-arm64.dmg`，拖进 Applications。
2. 首次打开被 Gatekeeper 拦（未签名）：右键 → 打开 → 确认；或系统设置 → 隐私与安全性 → 仍要打开。
3. 按引导选择：克隆你的技能库 / 指向本地已有 hub / 新建空库。

## 从源码跑

```bash
npm install
npm run dev        # 本地运行
npm run dist:mac   # 打包 dmg(--win 打 Windows 包)
```

零框架：主进程一个 Node 引擎（`src/main/engine.js`，直接读写 registry + 软链，`proper-lockfile` 防并发），渲染层一个 HTML。push `v*` tag 触发 GitHub Actions 自动构建 macOS + Windows 包。

## 生态

- **skillctl**：hub 自带的同源 CLI（`~/skills/bin/skillctl`），终端用它，图形界面用星核，写的是同一份 registry。
- **星核管家**：跑在 Claude Code `/loop` 里的值守 agent，定时巡检——发现绕过 hub 装进来的游离 skill 就收编，按渠道执行更新。

---

模型能力是租来的，沉淀上下文才是复利。skill 就是你的复利，星核帮你把它攒成系统。
