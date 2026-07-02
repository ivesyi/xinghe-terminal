# SkillHub 本地可用 + Release 方案(已拍板,2026-07-02)

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
- [ ] GitHub 公开仓 + README(截图、安装、和 skillctl 的关系)
- [ ] 讲完把链接留群里(呼应收尾"清单留群里"+ OPC 生态共建者身份)

## 风险台账

| 风险 | 检查点 | 降级动作 |
|---|---|---|
| starrail 接数据超时 | 周四晚 | 砍视觉细节保功能 |
| Pi 配装不稳 | 周五晚 | 成品态录屏,讲稿零改动 |
| 全部翻车 | 周六 | 演示走兜底录屏,讲稿附 A 已覆盖 |
