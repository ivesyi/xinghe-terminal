# 星核 本地可用 + Release 方案(已拍板,2026-07-02)

> 目标:① 周日论坛演示(原则二环节)稳定可用;② 讲后发公开 release。
> **三个决策(Yihu 拍板)**:视觉接 `game-starrail` / release 公开 GitHub / agent 魔法按钮**真做**。
> 进取路线,风险靠硬检查点管:每天晚上验收,不过就降级,演示以"能用"为底线。

## 现状

- 分支 `feat/game-ui`;`design/game-starrail.html` 为定稿视觉(其余 6 套封存)。
- 真数据源 `~/skills/registry.json`:**51 个 skill**(yiqiai 迁移后)。App 不得硬编码旧名。
- 演示底线 P0:卡墙渲染真数据、搜索/分组、项目装卸(软链)。进取项:AI 一键配装(Pi)。

## 排期(周三 07-02 → 周日)

### 周三晚–周四 | B1:starrail 视觉接真数据(P0)
- [ ] 以 `design/game-starrail.html` 为视觉基准,接进 Electron 应用
- [ ] 读 `~/skills/registry.json` 渲染 51 张卡(group=阵营,tier 区分 global/on-demand)
- [ ] 搜索 + 分组筛选
- [ ] 项目装配:选目录 → 装/卸 → 真建/删软链(与 skillctl 同源逻辑,文件锁防并发)
- [ ] loadout 一键装整套
- **周四晚检查点**:P0 没过半 → 砍 starrail 细节,保功能(视觉降级到"能看",不返工)

### 周五 | B2:agent 魔法按钮(真做)
- [ ] 项目装配界面 ✨ 按钮:调 Pi(或直接调 Claude CLI)读项目目录 → 输出推荐 loadout(含理由)→ 一键装
- [ ] 边界:只读授权目录、只写 `~/skills` 装卸路径、推荐结果需用户点头才装
- **周五晚检查点**:跑不稳 → 降级成品态(录一段成功运行的屏,演示时播),讲稿不用改——它本来就不依赖这个环节,能真跑就是加分项
- 若真跑稳定:讲稿原则二加一句 20 秒的"而且该配哪些,我也让 agent 替我想"(只加这一句,不动结构)

### 周六 | C:验证 + 彩排
- [ ] Smoke:卡数=51、无旧名、装卸后 `skillctl status` 与 GUI 一致、global 层软链不被误动、CLI/GUI 并发不坏 registry
- [ ] 装卸测试用**临时测试项目目录**,不拿真项目练手
- [ ] 打 `demo-checkpoint` tag;录完整操作兜底录屏(放桌面)
- [ ] 配合讲稿全流程彩排(掐表)

### 讲后 | D:公开 Release
- [ ] electron-builder 打 dmg(mac 优先),tag `v0.1.0`
- [ ] GitHub 公开仓 + README(截图、安装、和 skillctl 的关系)。本地目录暂名 skillhub-desktop,release 时仓库改名 xinghe-terminal
- [ ] 讲完把链接留群里(呼应收尾"清单留群里"+ OPC 生态共建者身份)

## 风险台账

| 风险 | 检查点 | 降级动作 |
|---|---|---|
| starrail 接数据超时 | 周四晚 | 砍视觉细节保功能 |
| Pi 配装不稳 | 周五晚 | 成品态录屏,讲稿零改动 |
| 全部翻车 | 周六 | 演示走兜底录屏,讲稿附 A 已覆盖 |

## ✅ 完成情况(2026-07-04:Release 目标全部达成)

五项目标逐条实测通过:
- **① Release 包**:`npm run dist:mac` 打出 `release/星核-0.1.0-arm64.dmg`(~101MB,arm64)。标准拖装布局(星核.app + Applications 快捷方式)。跳过签名(`mac.identity:null`)。
- **② 本地全功能跑通**:卡墙/搜索/装卸/loadout/新建套装/详情弹窗(左右+阅读原文)/状态面板 全部实现并测过;`npm run dev` 与打包版均正常启动无崩。
- **③ 新设备可装可用**:打包版拷到任意位置可启动;`SKILL_HUB` 指向不存在目录时不崩、进首次运行引导(克隆 `ivesyi/skill-hub` / 选本地目录 / 新建空库 三选一)。
- **④ 自定义 skill 同步 GitHub**:主进程 git push/pull 到 hub 仓(~/skills → ivesyi/skill-hub),明确中文反馈,只作用 hub 仓不碰桌面端仓。
- **⑤ 星核 app 图标**:AI 生成的星核晶体图标,按 macOS 网格留白,`build/icon.png`+`icon.icns` 已接入打包与 dev dock,替换 Electron 默认。

### 新设备安装步骤(给用户)
1. 把 `星核-0.1.0-arm64.dmg` 拷到新 Mac(arm64)。
2. 双击 → 拖「星核」到 Applications。
3. **首次打开被 Gatekeeper 拦**(未签名):右键点星核 → 打开 → 确认;或系统设置 → 隐私与安全性 → 仍要打开。之后正常双击。
4. 首次运行按引导「克隆已有技能库」→ 默认 URL 就是 `ivesyi/skill-hub` → 拉下来即用。
   - ⚠️ 前提:本机的 `~/skills` 已推到 GitHub(点星核「同步到 GitHub」或命令行 push)。**当前 `~/skills` 有未推送改动,新设备要拿到最新技能库需先同步一次**——是否推送由 Yihu 定。

### 待 Yihu 定
- 公开 release(GitHub v0.1.0 + README):讲后做,dmg 已就绪。
- 签名/公证:要免 Gatekeeper 提示需 Apple 开发者账号,暂缓。

## 讲后路线:吸附模式(Dock Mode,Yihu 2026-07-02 提出)

**需求原意**:星核应能"吸附"在正在用的工具(如 Warp 终端)旁边,窄条置顶随手可用,
而不是一个要专门切换过去的大窗口——skill 管理是工作流的伴随动作,不是目的地。

- **v1 吸附条**:全局快捷键切换普通窗口 ↔ 吸附条;吸附时窗口收成 ~360px 窄条、
  置顶、吸屏幕右缘(Electron `setAlwaysOnTop` + `screen.workArea` 定位)。半天量级。
- **v2 跟随吸附**:macOS Accessibility API 跟踪前台窗口 frame,自动贴其边缘跟随移动/缩放。
  需辅助功能权限 + native 模块(量级明显大于 v1)。
- **v3 情境吸附**:吸附时感知前台终端 cwd → 卡墙自动切到该项目的出战槽,
  agent 魔法按钮按当前项目推荐——与 agent 层(B2)天然一体。

**排期**:全部讲后(v1 起步),不挤周日冲刺。
