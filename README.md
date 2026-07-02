# 星核(技能终端)

> 产品名「星核」,原名 SkillHub(GitHub 上 `skillhub-club/skillhub-desktop` 同名已占用,遂扶正星核)。本地目录暂名 skillhub-desktop,release 时仓库改名 `xinghe-terminal`。

跨 AI Agent(Claude Code / Codex / Cursor)的 **Skill 管理桌面应用**。是命令行 skill hub(`~/skills` + `registry.json` + `skillctl`)的图形界面 —— 读写同一份 `registry.json`,与 CLI 完全互通。

## 功能
- **技能目录**:卡片浏览 / 即时搜索 / 按分层(常驻·按需)与分组过滤 / 看 SKILL.md
- **项目装配**:选项目目录 → 逐个把 skill 软链进项目(或用 loadout 套装快捷装)
- **更新管理**:开源 skill 的 upstream 跟踪(绿/黄/红 策略)
- **用量统计**:久未使用排最前,找出可删的冷门 skill
- **设置**:hub 路径 / agent 目录 / 自动更新 / 一键 git 同步
- 白天/黑夜双主题

## 技术
Electron + 原生 Node 引擎(`src/main/engine.js` 直接读写 `registry.json` 并做软链)。无重型依赖。

## 开发
```bash
npm install
npm start            # 本地运行
npm run dist:mac     # 打 mac dmg
npm run dist:win     # 打 win exe
```
跨平台 release 由 GitHub Actions(`.github/workflows/release.yml`,push tag `v*` 触发)自动构建 macOS + Windows 包。

设计稿见 `design/prototype.html`,产品需求见 `docs/PRD.md`。
