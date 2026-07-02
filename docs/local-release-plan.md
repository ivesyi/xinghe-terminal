# SkillHub 本地可用 + Release 方案(草案,待 Yihu 拍板)

> 目标:① 周日论坛演示(原则二环节,约 2 分钟真操作)稳定可用;② 之后发正式 release。
> 时间:今天周三(07-02)→ 周日上场。原则:演示可用优先,发布其次。

## 现状盘点

- 分支 `feat/game-ui`;`design/` 下 7 套游戏视觉稿(arsenal/cardex/codex/eggy/genshin/refined/starrail,均未接真数据)。
- 真数据源 `~/skills/registry.json` 刚完成 yiqiai 迁移:**51 个 skill**(14 改名、9 删除),App 必须读新 registry,不能有旧名硬编码。
- 演示只需要 P0 三件事:卡墙渲染真数据、搜索/分组、项目装卸(软链)。agent 层(agent-layer.md 的魔法按钮)**讲稿已不依赖**,可后置。

## 四阶段流程(按 Yihu 提的路径)

### A. Claude design 设计定稿(周三晚)
- 从 7 套 design/*.html 里选一套(或决定不换皮、先用现有 UI),冻结:配色 token、卡片规格、布局。
- 产出:`design/FINAL.md` 一页纸(选型 + token 表),之后不再改视觉——时间不够两轮返工。

### B. 同步本地实现(周四)
- 把定稿视觉接进 Electron 真数据。P0 清单:
  - [ ] 读 `~/skills/registry.json` 渲染 51 张卡(分组=阵营,tier 区分 global/on-demand)
  - [ ] 搜索 + 分组筛选
  - [ ] 项目装配:选目录 → 装/卸 skill → 真建/删软链(逻辑与 skillctl 同源,文件锁防并发,PRD 已有设计)
  - [ ] loadout 一键装整套
- 明确不做(本轮):更新管理 UI、用量统计、agent 魔法按钮、跨设备同步。

### C. 本地验证(周五)
- Smoke 清单:卡数=51、无旧 skill 名残留、装卸后 `skillctl status` 与 GUI 一致、global 层软链不被误动、CLI/GUI 并发写不坏 registry。
- 跑通后打 `demo-checkpoint` tag;录一遍完整操作当兜底录屏(放桌面)。
- 周六:配合讲稿整体彩排。

### D. 发布 Release(讲后,不赶周日)
- electron-builder 打 dmg(mac 优先),tag `v0.1.0`,GitHub release + README 截图。
- 发布范围(公开/私有)待定——见决策 ②。

## 风险与兜底

- **最大风险**:B 阶段视觉接真数据的工作量被低估 → 兜底:周四晚检查点,若 P0 没过半,砍视觉(退回现有 UI 只保功能),演示以"能用"为准。
- 演示现场兜底已写进讲稿附 A(成品录屏在桌面)。

## 待拍板

1. 视觉选型(A 阶段入口)
2. release 公开还是私有
3. agent 魔法按钮要不要塞进周日(默认不塞)
