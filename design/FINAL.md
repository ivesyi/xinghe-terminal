# 视觉定稿 FINAL(2026-07-02 冻结)

**选型 = `game-starrail.html`(星穹铁道风·星核终端)。** 其余 6 套封存,不再比稿。
本页是 B1 实现的唯一视觉基准;实现与本表冲突时,以本表为准。

## 概念映射(真数据 → 游戏语言)

| registry 真数据 | 游戏概念 | 视觉表达 |
|---|---|---|
| skill(hub 内) | 藏品/技能卡 | 卡墙(切角卡片,左侧 3px 光条=分组色) |
| `group` | 阵营 | 无徽记:卡片左侧 3px 分组色光条 + 筛选 chip(分组色小色块+中文名)即分组的全部视觉表达;弹窗内用「分组:媒体 · media」文字行 |
| `tier: global`(6 个) | 常驻出战·高稀有度 | ★★★★★ 金 + 「常驻」徽章,全项目自带 |
| `tier: on-demand`(46 个) | 背包待命·普通稀有度 | ★★★★ 紫,可装入项目 |
| 项目装配(软链) | 出战槽位 | 六边形 hex 槽,装/卸 = 入槽/出槽动画 |
| `loadouts` | 队伍预设 | 套装卡「一键出战」(纯文字按钮) |
| 外部托管(lark-cli 等) | 官方外挂·只读 | 虚线卡 + 文字「只读」标签,独立货架,不可装卸 |
| 使用日志(.usage.log) | 熟练度 | Lv 条(未用 Lv.0 / 偶用 Lv.1 / 活跃 Lv.3) |

**硬规则:装备/卸下只动项目软链,绝不改 registry 的 skills/loadouts/tier。**

**设计红线 · 低噪禁 emoji:界面图标用单色 monogram/极简 SVG,不用 emoji——emoji 堆砌是 AI 生成感的标志。**
星级 ★ 与 ◈ ✦ ⌖ ✓ ✗ 一类单色文本符号不在此列;分组识别主要靠分组色光条,不靠图标。

**设计红线 · 界面文案全中文:不做中英双语装饰(「背包 BACKPACK」这类对照一律禁止);
英文只出现在数据本身(skill 名、命令、路径、tier 值如 `global`/`on-demand`、平台名如 GitHub)。**

**设计红线 · 同一信息不做第二遍视觉编码:已有颜色表达的,不再加图标/徽章——重复编码即噪音。**
(2026-07-02 实例:分组已由分组色光条表达,单字徽记属重复编码,整体撤掉,卡片重心让给 skill 名。)

## Token 表

### 配色
```
--bg0:#05060e  --bg1:#0a0e1f  --bg2:#0f1530          底色三层
--cyan:#5ff7ff --cyan-d:#1aa6c7 --azure:#3a9bff       主 accent(选中/主按钮)
--violet:#a88bff --violet-d:#7a5cff --magenta:#ff6fd8  副 accent
--gold:#ffd27a --gold-d:#f5a623                        稀有/loadout 主按钮
--ok:#7cffb2   --warn:#ffd27a  --lock:#8b95c9          状态色(装上/警示/只读)
--ink:#eaf2ff  --ink-dim:#9fb0d8 --ink-faint:#5d6da0   文字三级
--line:rgba(120,160,255,.16)  --line-bright:rgba(120,200,255,.4)
--src-github:#6fe3ff --src-self:#ffb85c --src-web:#9b8bff  来源分类色(平级,非优劣)
```

### 分组色(阵营 accent)
tools `#6fe3ff` · utils `#7cffb2` · web-creative `#ff6fd8` · media `#ffa94d` ·
jarvis `#a88bff` · xhs `#ff7a8a` · contracts `#ffd27a` · yiqiai `#ffd27a` ·
lark/external `#8b95c9`。未知分组 fallback `#6fe3ff`(代码里必须留 fallback,禁止假设分组全集)。

### 字体
- 展示/数字:`Orbitron`(logo、统计数字、槽位编号)
- UI 英文/标签:`Rajdhani`(tab、chip、按钮,letter-spacing 1–3px)
- 正文中文:`Noto Sans SC`,回退 system-ui(**演示现场可能断网,必须能无 webfont 正常显示**)

### 卡片规格
- 卡墙:`grid minmax(176px,1fr)`,gap 14px;卡 min-height 144px,padding 15/14/13;首行 = skill 名(15px 白)+ 来源 tag,无图标位
- 切角:`clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px))`
- 左光条 3px = 分组色;hover:`translateY(-6px) scale(1.015)` + 分组色泛光
- hex 槽:128×148,`polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)`;装上时 `equippop` 弹入 + ring 扩散
- loadout 卡:`minmax(248px,1fr)`,顶部 3px 光条

### 布局/氛围
- 布局:顶部 header(logo+统计 chip+指挥官)→ 斜切 tab 导航 → 全屏滚动 screen
- tab:`polygon(12px 0,100% 0,calc(100% - 12px) 100%,0 100%)`;激活=青色渐变填充
- 背景四层:径向渐变漂移 26s + 46px 网格 40s 平移 + 扫描线 + 上升粒子;`.vig` 暗角
- 反馈:toast 底部弹入(青/金/警三色);装备时 sparkle 爆点
- 交互均 `.2–.4s cubic-bezier(.2,.8,.2,1)` 级缓动
