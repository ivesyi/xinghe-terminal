# SkillHub Desktop — 跨 AI Agent 的 Skill 统一管理桌面应用 · PRD

> 由 ChatPRD(Claude Opus 4.6)生成,2026-06-25。技术栈 Electron + React,共用 ~/skills/registry.json。

I'll research some relevant references to ensure the PRD is thorough and well-informed, particularly around Electron desktop app patterns and the cc-switch project mentioned.

Web Search
SEARCH
cc-switch skill management Claude Code Codex Cursor open source
Top 5 results
GitHub - farion1231/cc-switch: A cross-platform desktop All-in-One ...
github.com
https://github.com/farion1231/cc-switch
3.3 Skills Management - CC Switch Docs
ccswitch.co
https://ccswitch.co/docs/extensions-skills.html
farion1231/cc-switch
github.com
https://github.com/farion1231/cc-switch?tab=readme-ov-file
CC Switch Official Website - AI Coding Tool Control Surface
ccswitch.io
https://ccswitch.io/en/
docs/user-manual/en/3-extensions/3.3-skills.md at main · farion1231/cc-switch
github.com
https://github.com/farion1231/cc-switch/blob/main/docs/user-manual/en/3-extensions/3.3-skills.md
Web Search
SEARCH
Claude Code skills directory structure .claude/skills
Top 5 results
Extend Claude with skills - Claude Code Docs
code.claude.com
https://code.claude.com/docs/en/skills
Explore the .claude directory
code.claude.com
https://code.claude.com/docs/en/claude-directory?_rsc=1tg4o
Agent Skills in the SDK - Claude Code Docs
code.claude.com
https://code.claude.com/docs/en/agent-sdk/skills
Skills | Claude Code Internals
claude-code-explain.helmcode.com
https://claude-code-explain.helmcode.com/skills/
Extend Claude with skills - Claude Code Docs
code.claude.com
https://code.claude.com/docs/en/skills?target=_blank
Web Search
SEARCH
Codex CLI skills directory .codex/skills structure
Top 5 results
docs/skills.md at 2c6995ca4dfc23b93db311b59c1b4ead464658b1 · openai/codex
github.com
https://github.com/openai/codex/blob/2c6995ca4dfc23b93db311b59c1b4ead464658b1/docs/skills.md
Agent Skills – Codex | OpenAI Developers
developers.openai.com
https://developers.openai.com/codex/skills
Skills - Codex CLI
openai-codex.mintlify.app
https://openai-codex.mintlify.app/features/skills
skill-creator: default new skills to ~/.codex/skills (#14837) · 59533a2 · openai/codex
github.com
https://github.com/openai/codex/commit/59533a2c26e349c59417e4773b930c26211d7bdd
codex-rs/skills/src/assets/samples/skill-creator/SKILL.md at main · openai/codex
github.com
https://github.com/openai/codex/blob/main/codex-rs/skills/src/assets/samples/skill-creator/SKILL.md
Web Search
SEARCH
Cursor IDE skills directory .cursor/skills configuration
Top 5 results
Skills | Cursor Docs
cursor.com
https://cursor.com/help/customization/skills
Agent Skills | Cursor Docs
trycursor.com
https://www.trycursor.com/docs/context/skills
Where Cursor Stores Skills: File Paths for Mac, Linux & W... - Agensi
agensi.io
https://www.agensi.io/learn/where-are-cursor-skills-stored
How to use Agent Skills in Cursor IDE? - Help - Cursor - Community Forum
forum.cursor.com
https://forum.cursor.com/t/how-to-use-agent-skills-in-cursor-ide/149860/1
Agent Skills | Cursor Docs
cursor.com
https://cursor.com/docs/skills

Now I have comprehensive understanding of the ecosystem. Let me create the full PRD document.

Create Document

PRD 已生成，文档现在已在右侧编辑器中展示。以下是这份 PRD 的要点概览：

文档概要

这份 PRD 覆盖了你提出的全部需求，核心结构包括：

功能优先级划分
P0（必须有）：技能目录、分层管理、项目装配/Loadout、多 Agent 分发——这四个模块构成日常使用的核心闭环。
P1（重要）：安装新 Skill、更新管理、用量统计、备份与安全、跨设备同步——增强运维效率的关键能力。
P2（锦上添花）：设置页面全部配置项（含飞书通知、自动探测、主题/语言等）。
技术架构亮点
GUI 直接操作 registry.json + 软链，不通过 spawn 调用 skillctl，避免 CLI 版本耦合。
通过 proper-lockfile 文件锁解决 GUI 与 CLI 并发写入的安全问题。
chokidar 监听外部修改，确保 CLI 操作后 GUI 自动刷新。
Windows 使用 junction 替代 symlink 规避权限问题。
里程碑规划

4 个 Phase，各约 1.5 周，1–2 人团队，总计 4–6 周交付 MVP。

值得注意的设计决策
数据模型中我扩展了 registry.json，新增了 projects 字段记录项目装配状态、settings 字段整合应用配置，以及为每个 Skill 增加了 tags/path/createdAt/updatedAt 等 GUI 所需的元数据。
验收标准按 P0/P1/P2 分层，并单独列出跨平台和性能验收条目，方便逐阶段对照验收。

如有需要调整的细节（如某些功能的优先级、数据模型字段、阶段划分等），随时告诉我。

Writing
ON
Claude Opus 4.6
Auto
GPT-4.1
GPT-5.4
GPT-5.5
Claude Sonnet 4.6
Claude Opus 4.6
SkillHub Desktop — 跨 AI Agent 的 Skill 统一管理桌面应用 PRD
v1
Save
Export
Related
Improve
2,417 words·20,544 chars
Body
SkillHub Desktop — 跨 AI Agent 的 Skill 统一管理桌面应用
TL;DR

SkillHub Desktop 是一款基于 Electron + React 的跨平台桌面应用，为重度使用多个 AI coding agent（Claude Code / Codex / Cursor）的开发者提供可视化的 Skill 统一管理体验。它以本地 git 仓库 ~/skills 为唯一数据源，通过"单一源 + 软链分发"机制，让用户像游戏配技能一样按项目装卸 Skill，跨 agent 一处管理、开源 Skill 自动追踪更新、用量统计识别冷门、跨设备一键同步——彻底告别命令行手动维护的低效与混乱。

背景与目标
背景

当前已有一套成熟的命令行 Skill 管理体系：

唯一数据源：本地 git 仓库 ~/skills，核心注册表为 registry.json（记录每个 Skill 的 name / description / tier / group / agents / upstream，以及 loadouts 预设）。

命令行工具 skillctl：执行所有增删改查与分发操作。

分发机制："单一源 + 软链分发"——global 层 Skill 自动软链进各 agent 的 Skill 目录（~/.claude/skills、~/.codex/skills、~/.cursor/skills）；其余 Skill 按需软链进具体项目的 .claude/skills、.codex/skills、.cursor/skills。

自动化运维：每周更新机器人（检测开源 Skill 的 upstream 新 commit，按 green 自动更新 / red 拒绝 / yellow 人工定夺策略处理，飞书通知）、用量统计（记录调用、识别冷门可删）。

这套体系功能完整，但日常操作完全依赖终端，存在以下痛点：

Skill 太多太乱，无法快速总览与搜索。

各 agent 的 Skill 目录各管各的，看不清全局。

换设备需要重新搭建环境。

部分 Skill 项目用不到却一直占上下文。

开源 Skill 更新难以跟进。

不知道哪些 Skill 常年不用，可以清理。

目标

为现有 CLI 体系配备一个桌面 GUI，实现日常管理的可视化与零门槛操作。

Business Goals

将日常 Skill 管理操作（浏览、搜索、装卸、更新）的操作耗时降低 80% 以上。

将新 Skill 的安装流程从"记命令 + 手动操作"缩短至 3 次点击以内。

通过冷门统计，将 Skill 总量精简 20%，减少 agent 上下文噪声。

新设备环境搭建从"参照文档手动操作 30 分钟"缩短至"一键 clone + 复刻 < 2 分钟"。

为后续扩展到更多 agent（如 Gemini CLI、OpenCode）预留架构能力。

User Goals

一目了然地查看自己全部 Skill 的状态、分组、层级和分发情况。

像游戏配技能一样，按项目快速装卸 Skill（loadout），只让当前项目需要的 Skill 生效。

一键管理开源 Skill 的更新，看到变更摘要后再决定是否合入。

通过用量统计快速识别冷门 Skill，保持 Skill 库精简高效。

换设备时无缝迁移，无需记忆任何手动步骤。

Non-Goals

不做 SKILL.md 在线编辑器——Skill 内容的编写应在 IDE 中完成。

不做云账号体系——同步完全依赖 git，不引入额外的账号/服务。

不接管由工具自身管理的 Skill——例如飞书官方 lark-cli Skill 由 lark-cli 自行更新，本应用仅只读展示，不接管其生命周期。

用户画像与典型场景
用户画像

角色：重度 AI coding agent 用户（即产品作者本人）。

工具栈：日常同时使用 Claude Code、Codex、Cursor 三个 agent。

Skill 规模：手头有 50–100+ 个 Skill，涵盖代码规范、部署流程、代码审查、测试生成、文档撰写等多个领域。

技术水平：熟练使用终端，但更希望日常管理有 GUI 辅助，降低认知负担。

环境：macOS 为主力开发机，Windows 为辅助机，需跨设备同步。

典型场景

场景一：总览与搜索 开发者打开 SkillHub Desktop，在技能目录页面快速浏览按 group 分组的 Skill 卡片，输入关键词"deploy"即时过滤，找到目标 Skill 后点击查看其 SKILL.md 内容与 references。

场景二：项目装配 开发者新开了一个 Next.js 项目，进入"项目装配"页面，选择项目目录，从 loadout 预设"web-frontend"一键加载 8 个相关 Skill（react 规范、tailwind 指南、测试模板等），它们以软链形式出现在项目的 .claude/skills、.cursor/skills 中。项目交付后一键 unload，上下文恢复干净。

场景三：更新管理 SkillHub 检测到 3 个开源 Skill 有 upstream 新 commit：1 个标为 green（自动合入完成）、1 个标为 yellow（展示 diff 等人工定夺）、1 个标为 red（自动跳过并记录）。开发者审阅 yellow 的变更摘要后点击"合入"或"跳过"。

场景四：冷门清理 月底查看用量统计页面，发现 12 个 Skill 过去 30 天零调用，标记为冷门。开发者批量选中 8 个确认删除，剩余 4 个标记保留。

场景五：换设备 新 MacBook 上 clone ~/skills 仓库，打开 SkillHub Desktop，点击"一键复刻"，应用自动读取 registry.json 并重建所有软链，5 秒内恢复与旧机器完全一致的 Skill 配置。

User Stories
开发者（日常管理）

As a 开发者, I want to 在一个界面中浏览全部 Skill 并按 group/tier 分组查看, so that 我能快速了解自己的 Skill 资产全貌。

As a 开发者, I want to 用关键词搜索 Skill（名称+描述）, so that 我能在上百个 Skill 中秒级定位目标。

As a 开发者, I want to 查看单个 Skill 的 SKILL.md 内容和 references, so that 我能理解其用途和使用方式。

As a 开发者, I want to 一键切换 Skill 的 tier（global / on-demand）, so that 我能控制哪些 Skill 常驻全局、哪些按需加载。

As a 开发者, I want to 选择 Skill 要分发到哪些 agent（claude / codex / cursor）, so that 我能精确控制每个 agent 的 Skill 配置。

开发者（项目装配）

As a 开发者, I want to 选择一个项目目录后看到该项目当前已装配的 Skill 列表, so that 我能清晰了解项目的 Skill 上下文。

As a 开发者, I want to 对单个项目执行 use/unuse 单个 Skill, so that 我能按需精细调整。

As a 开发者, I want to 用一个 loadout 预设一键为项目加载/卸载一组 Skill, so that 我能像游戏配技能一样高效切换。

As a 开发者, I want to 创建/编辑/删除 loadout 预设, so that 我能维护适合不同项目类型的 Skill 套装。

开发者（安装与更新）

As a 开发者, I want to 通过粘贴 GitHub URL 安装新的开源 Skill, so that 我能快速引入社区优质 Skill。

As a 开发者, I want to 从本地目录导入已有的 Skill, so that 我能把散落的本地 Skill 纳入统一管理。

As a 开发者, I want to 看到各开源 Skill 是否有 upstream 更新及变更摘要, so that 我能及时掌握更新动态。

As a 开发者, I want to 按 green/yellow/red 策略逐个处理更新, so that 我能安全可控地升级 Skill。

As a 开发者, I want to 在更新出问题时一键回退到上一版本, so that 我能快速恢复稳定状态。

开发者（统计与维护）

As a 开发者, I want to 查看每个 Skill 的最近使用时间和累计调用次数, so that 我能量化 Skill 的价值。

As a 开发者, I want to 看到"N 天未使用"的冷门清单, so that 我能识别可删除的 Skill。

As a 开发者, I want to 在危险操作前系统自动备份并支持恢复, so that 我不会因误操作丢失数据。

As a 开发者, I want to 一键 git push 同步 Skill 仓库, so that 我能跨设备保持一致。

As a 开发者, I want to 在新设备上 clone 后一键复刻所有软链, so that 我能快速恢复工作环境。

Functional Requirements
1. 技能目录（Priority: P0）

卡片/列表视图切换：支持卡片网格与紧凑列表两种浏览模式，用户可自由切换。

分组与筛选：按 group（如 code-quality、deployment、testing）和 tier（global / on-demand）分组展示；支持多维筛选（group、tier、agent、标签）。

即时搜索：全局搜索框，支持按 name 和 description 模糊匹配，输入即筛选，无需回车。

标签体系：自动标注 global 常驻 / on-demand 按需 / OSS 开源 / 冷门（基于用量统计阈值）。

Skill 详情面板：点击 Skill 卡片展开侧边详情，展示 SKILL.md 渲染内容、references 文件列表、所属 group/tier/agents、upstream 来源、最近使用时间、调用次数。

2. 分层管理（Priority: P0）

Tier 切换：一键将 Skill 在 global 与 on-demand 之间切换。

设为 global 时：自动在 registry.json 中更新 tier 字段，并为该 Skill 在所有已选 agent 的全局 Skill 目录（如 ~/.claude/skills）创建软链。

设为 on-demand 时：移除全局目录中的软链，Skill 仅在被项目显式装配时生效。

批量操作：支持多选 Skill 后批量切换 tier。

3. 项目装配 / Loadout（Priority: P0）

项目选择器：通过文件夹选择对话框或最近项目列表选择目标项目目录。

当前装配视图：展示选中项目已装配的全部 Skill，按 agent 分列展示软链状态。

单 Skill 操作：

use：将 Skill 软链进项目的 .claude/skills、.codex/skills、.cursor/skills（根据该 Skill 的 agents 配置）。

unuse：移除项目中该 Skill 的软链。

Loadout 操作：

load：选择一个 loadout 预设，一键将其包含的全部 Skill 软链进项目。

unload：一键移除该 loadout 下所有 Skill 的项目软链。

Loadout 预设管理：新建、编辑（增删 Skill 成员）、删除 loadout 预设；修改立即持久化到 registry.json 的 loadouts 字段。

最近项目记录：记住最近 10 个操作过的项目目录，方便快速切换。

4. 多 Agent 分发（Priority: P0）

Agent 选择器：每个 Skill 可配置分发目标 agent 列表（claude / codex / cursor），以 checkbox 形式呈现。

修改即生效：变更 agent 列表后，立即更新 registry.json，并同步调整软链（global Skill 的全局目录软链、已装配项目的项目目录软链）。

Agent 目录自动探测：首次启动时自动探测系统中已安装的 agent 及其 Skill 目录位置，用户也可在设置中手动指定。

5. 安装新 Skill（Priority: P1）

从 GitHub URL 安装：

粘贴 GitHub 仓库 URL，应用自动 clone 到 ~/skills/vendor/ 目录。

智能识别仓库结构：单 Skill 仓库直接导入；多 Skill 仓库（一个仓库含多个 Skill / Skill 在子目录）展示列表供用户勾选。

自动登记 upstream 字段（记录源仓库 URL 和当前 commit hash），纳入更新追踪。

自动在 registry.json 中新增条目。

从本地目录导入：

选择本地目录，应用扫描目录结构识别 SKILL.md，导入到 ~/skills 并在 registry 中登记。

去重检测：安装前检查 name 是否已存在，如存在则提示用户是覆盖还是跳过。

6. 更新管理（Priority: P1）

更新检查：遍历所有标记了 upstream 的 Skill，执行 git fetch 比较本地与远程 commit。

更新列表展示：

每个有更新的 Skill 显示：Skill 名称、upstream 仓库、本地 commit vs 远程最新 commit、提交摘要、新增/变更文件数。

可展开查看 diff 预览。

更新策略处理：

green（自动合入）：后台自动 pull 并更新本地文件，标记完成。

red（自动拒绝）：跳过并记录，不展示在待处理列表。

yellow（人工定夺）：高亮展示，用户审阅后手动点击"合入"或"跳过"。

一键全部更新：对所有 green 和已审核的 yellow 执行批量更新。

回退能力：每次更新前自动创建 git tag 或 stash，支持一键回退到更新前状态。

定时检查：可配置定时任务（如每周一 9:00），自动执行检查并按策略处理 green，yellow 项通过飞书通知用户。

7. 用量统计（Priority: P1）

数据源：读取现有的用量统计数据文件（由 skillctl 记录的调用日志）。

展示维度：

每个 Skill 的最近使用时间（相对时间，如"3 天前"）。

累计调用次数。

趋势图（过去 30 天每日调用次数折线图）。

冷门清单：可配置阈值（默认 30 天未用），自动生成冷门 Skill 列表。

操作：从冷门清单中可直接执行"删除"或"标记保留"。

排序：技能目录页面支持按"最近使用"和"调用次数"排序。

8. 备份与安全（Priority: P1）

自动备份：在以下危险操作前自动创建 registry.json 的快照备份（存储在 ~/skills/.backups/）：

删除 Skill

批量操作（批量删除、批量 tier 切换）

更新合入

备份恢复：在设置中展示备份列表（时间戳 + 操作描述），支持一键恢复到任意备份点。

自动清理：仅保留最近 20 个备份，超出自动清理最旧的。

二次确认：删除 Skill、批量操作、清空项目装配等危险操作均需弹窗二次确认。

密钥审计扫描：在 git push 前扫描 ~/skills 目录下的文件，检测是否包含常见密钥模式（API key、token、password 等），发现则阻止推送并提示用户。

9. 跨设备同步（Priority: P1）

Git 操作面板：

显示当前仓库状态（是否有未提交变更、本地领先/落后远程几个 commit）。

一键 commit + push（自动生成 commit message，如 "sync: update registry at 2025-07-14T10:30"）。

一键 pull（拉取远程最新）。

一键复刻：新设备 clone 仓库后，点击"复刻环境"按钮，应用读取 registry.json 并自动重建所有软链（global Skill 到全局目录、已记录的项目装配到对应项目目录）。

冲突处理：pull 时如遇 git 冲突，展示冲突文件列表并引导用户到终端解决（不在 GUI 内做 merge 编辑器）。

10. 设置（Priority: P2）

Hub 路径配置：Skill 仓库根目录路径（默认 ~/skills），可自定义。

Agent Skill 目录配置：每个 agent 的全局 Skill 目录路径（默认 ~/.claude/skills、~/.codex/skills、~/.cursor/skills），可自定义；支持自动探测。

飞书通知配置：飞书 Webhook URL，用于更新通知和异常告警。

自动更新计划：cron 表达式或简化的"每周X 几点"选择器，配置定时更新检查任务。

冷门阈值：设置"N 天未使用"的冷门判定天数（默认 30）。

外观设置：深色/浅色主题切换（默认深色）。

语言设置：支持中文/英文切换（初版默认中文，预留 i18n 框架）。

信息架构与主要界面描述
整体布局

采用经典的"左侧导航栏 + 右侧主内容区"布局：

左侧导航栏（固定宽度 220px，深色背景）：

应用 Logo + 名称

导航菜单：技能目录、项目装配、更新管理、用量统计、设置

底部：Git 同步状态指示器 + 一键同步按钮

右侧主内容区：根据导航选中项展示对应页面

页面一：技能目录

顶部工具栏：

搜索框（左侧，占据主要宽度）

视图切换按钮（卡片 / 列表）

分组方式下拉（按 group / 按 tier / 按 agent / 平铺）

筛选下拉（tier 多选、agent 多选、标签多选）

"安装新 Skill"按钮（右侧，主色调）

主区域（卡片视图）：

按选定分组方式展示分组标题 + Skill 卡片网格

每张卡片展示：Skill 名称、描述（截断两行）、tier 标签（global/on-demand）、agent 图标（小圆点表示 claude/codex/cursor）、OSS/冷门标签

卡片右上角：快捷操作按钮（tier 切换、删除）

点击卡片：右侧滑出详情面板

详情面板（右侧滑出，占 40% 宽度）：

Skill 名称、完整描述

Tier 切换开关

Agent 分发 checkbox 组

Group 标签

Upstream 来源（如有）

SKILL.md 内容渲染（Markdown 渲染）

References 文件列表

用量信息（最近使用、累计次数）

操作按钮：编辑元数据、删除

页面二：项目装配

左侧子面板（项目选择）：

"选择项目目录"按钮

最近项目列表（最近 10 个）

当前选中项目路径展示

右侧主区域：

上方：当前项目已装配的 Skill 列表（表格形式：名称、agent、操作-unuse 按钮）

下方分为两个标签页：

"单个装配"：可搜索的全部 Skill 列表，每个 Skill 后有 use/unuse 切换按钮

"Loadout 预设"：loadout 卡片列表，每个卡片显示预设名称和包含的 Skill 数量，操作按钮（load / unload / 编辑 / 删除）；右上角"新建 Loadout"按钮

Loadout 编辑弹窗：

预设名称输入

左右双栏：左栏"可选 Skill"列表（可搜索）、右栏"已选 Skill"列表

支持拖拽或点击箭头在左右栏之间移动 Skill

保存 / 取消按钮

页面三：更新管理

顶部：

"检查更新"按钮

上次检查时间

"一键更新全部"按钮（仅对 green + 已批准的 yellow 生效）

主区域（更新列表）：

按策略分组展示：yellow（待定夺）、green（已自动处理 / 待处理）、red（已跳过）

每条更新项：Skill 名称、upstream 仓库、commit 摘要（最近 3 条提交信息）、变更文件数、策略标签

展开后：diff 预览（语法高亮）

操作按钮：合入 / 跳过 / 回退（已合入的可回退）

底部：更新历史记录（最近 20 条，含时间戳、操作、结果）

页面四：用量统计

顶部摘要卡片：

总 Skill 数量

本月活跃 Skill 数量

冷门 Skill 数量

最常用 Top 5 Skill（名称 + 次数）

主区域：

Skill 用量表格（可排序）：名称、累计调用次数、最近使用时间、状态（活跃/冷门）

冷门 Skill 高亮行，支持批量选中后执行"删除"或"标记保留"

趋势图区域：选中单个 Skill 后展示过去 30 天的每日调用折线图

页面五：设置

分组展示各配置项（表单布局）：

Hub 配置：仓库路径、Git 远程地址

Agent 配置：每个 agent 的 Skill 目录路径 + 自动探测按钮

通知配置：飞书 Webhook URL + 测试按钮

自动更新：定时计划配置

统计配置：冷门阈值天数

外观：主题切换、语言切换

备份管理：备份列表 + 恢复按钮

User Experience
Entry Point & First-Time User Experience

用户从 GitHub Releases 下载对应平台安装包（macOS .dmg / Windows .exe），安装后首次启动。

首次启动引导流程：

检测 ~/skills 目录是否存在 → 存在则自动加载；不存在则引导用户输入 hub 路径或 clone 远程仓库。

检测 registry.json 是否有效 → 有效则解析并展示 Skill 总览；无效则提示并引导修复。

自动探测系统中已安装的 agent 及其 Skill 目录路径 → 展示探测结果，用户确认或手动修正。

引导完成后进入技能目录主页面，展示全部 Skill。

Core Experience

Step 1：进入技能目录，浏览全部 Skill

默认按 group 分组的卡片视图展示全部 Skill。

顶部搜索框支持即时搜索，输入字符即过滤。

支持切换视图模式和分组方式。

卡片信息密度合理：一眼看清名称、描述、tier、agent、标签。

Step 2：查看 Skill 详情

点击任一 Skill 卡片，右侧滑出详情面板。

面板中展示 SKILL.md 渲染内容、元数据、用量信息。

可直接在面板中修改 tier、agent 配置，修改即时生效（更新 registry + 软链）。

Step 3：为项目装配 Skill

导航到"项目装配"页面。

选择目标项目目录（文件选择器或最近列表）。

查看当前项目已装配的 Skill。

通过"单个装配"标签逐个 use/unuse，或通过"Loadout 预设"标签一键 load/unload。

操作立即执行（创建/移除软链），无需额外确认（非危险操作）。

Step 4：安装新 Skill

点击技能目录页面的"安装新 Skill"按钮。

弹出安装弹窗，提供两种方式：

GitHub URL：粘贴 URL → 应用自动 clone → 识别 Skill 结构 → 展示可导入的 Skill 列表 → 用户勾选确认 → 导入完成。

本地目录：选择目录 → 扫描 SKILL.md → 导入。

安装成功后，新 Skill 出现在技能目录中，默认 tier 为 on-demand。

Step 5：处理开源 Skill 更新

导航到"更新管理"页面。

点击"检查更新"，等待完成。

浏览更新列表，展开 diff 预览。

对 yellow 项目逐个决策（合入/跳过）。

或点击"一键更新全部"批量处理。

Step 6：查看用量统计，清理冷门

导航到"用量统计"页面。

查看摘要卡片和用量表格。

筛选冷门 Skill，批量选中后删除或标记保留。

删除操作需二次确认，且操作前自动备份。

Step 7：跨设备同步

左侧导航底部查看 Git 同步状态。

点击"同步"按钮 → 自动 commit + push。

新设备 clone 后，进入设置 → 点击"复刻环境" → 自动重建所有软链。

Advanced Features & Edge Cases

单仓库多 Skill 识别：从 GitHub 安装时，若仓库根目录无 SKILL.md 但子目录有多个，展示树形结构供用户选择性导入。

软链冲突处理：若目标目录已存在同名文件/目录（非软链），提示用户选择覆盖或跳过。

Agent 未安装：若用户勾选了某 agent 但系统中未检测到该 agent，给出警告提示但不阻止操作（用户可能稍后安装）。

离线模式：网络不可用时，更新检查功能降级（提示网络不可用），其余本地功能正常使用。

大量 Skill 性能：Skill 数量超过 200 时，卡片视图采用虚拟滚动，避免 DOM 节点过多。

registry.json 外部修改：监听 registry.json 文件变更（fs.watch），外部修改（如通过 skillctl 命令行）后自动刷新 UI。

并发操作保护：GUI 与 CLI 同时操作 registry.json 时，采用文件锁（flock / lockfile）防止写冲突。

UI/UX Highlights

深色主题为默认：与开发者 IDE 环境视觉一致，减少视觉切换疲劳。

响应式卡片网格：根据窗口宽度自适应列数（2-5 列）。

即时搜索反馈：搜索输入即过滤，200ms debounce，无加载延迟感。

操作即时反馈：tier 切换、use/unuse 等操作执行后，卡片/列表立即更新状态，配合微动画（如 checkmark 弹出）。

拖拽装配：Loadout 编辑弹窗中支持拖拽 Skill 在"可选"和"已选"栏之间移动。

快捷键支持：Cmd/Ctrl+F 聚焦搜索框、Cmd/Ctrl+S 同步、Esc 关闭面板。

无障碍：所有交互元素支持键盘导航（Tab/Enter）、适当的 ARIA 标签。

状态持久化：记住用户上次的视图模式、分组方式、窗口大小位置。

Narrative

小明是一位全栈开发者，日常同时使用 Claude Code、Codex 和 Cursor 三个 AI 编程助手。半年下来，他积累了 87 个 Skill，涵盖代码审查、测试生成、部署脚本、文档撰写等各个方面。然而管理这些 Skill 成了噩梦——它们散落在不同 agent 的目录里，新项目开工时要翻文档回忆该装哪些，开源 Skill 的更新全靠手动 git pull，有些 Skill 半年没用过却一直挤占上下文 token。

某天小明打开 SkillHub Desktop，技能目录页面清晰展示了按"代码规范""部署""测试""文档"分组的 87 张卡片。他搜索"deploy"，两个相关 Skill 瞬间过滤出来。接着他打开新项目"payment-service"，在项目装配页面一键加载了"backend-java"这个 loadout 预设——12 个 Java 后端相关 Skill 瞬间以软链形式出现在项目的三个 agent 目录中。

更新管理页面提示有 5 个开源 Skill 有新版本：3 个 green 已自动合入，1 个 yellow 等他审阅 diff——他看了下变更摘要，确认是 bug 修复，点击"合入"。1 个 red 因为破坏性变更被自动跳过。

月底他查看用量统计，发现 14 个 Skill 过去 30 天零调用。他快速浏览后批量删除了 10 个——操作前系统自动备份了 registry.json。最后一键 git push，所有变更同步到远程仓库。第二天在公司新发的 MacBook 上 clone 仓库、打开 SkillHub Desktop、点击"复刻环境"，5 秒钟后一切如初。

小明终于从 Skill 管理的泥潭中解脱出来，把时间花在了真正重要的编码工作上。

Success Metrics
User-Centric Metrics

日常管理效率：Skill 搜索到定位的平均耗时小于 3 秒（对比 CLI 的 10 秒以上）。

项目装配效率：从选择项目到完成 loadout 加载的操作步骤小于等于 3 步。

用户满意度：作为唯一用户，主观满意度评估——日常是否自愿优先使用 GUI 而非 CLI。

环境复刻时间：新设备从 clone 到完成复刻小于 2 分钟。

Business Metrics

Skill 库精简率：通过冷门统计功能，半年内 Skill 总量精简 20% 以上。

更新及时性：开源 Skill upstream 有更新后，7 天内完成处理（合入/跳过决策）的比例大于等于 95%。

GUI vs CLI 使用比：日常管理操作中 GUI 占比超过 80%。

Technical Metrics

启动速度：冷启动到主界面可交互小于 3 秒。

搜索响应：即时搜索从输入到结果展示小于 200ms。

软链操作：单个 Skill 的 use/unuse 操作完成时间小于 500ms。

内存占用：常驻内存小于 200MB（管理 200 个 Skill 的场景）。

崩溃率：月度崩溃次数为 0。

Tracking Plan

app_launched：应用启动事件，记录启动耗时。

skill_searched：搜索事件，记录搜索关键词、结果数量。

skill_detail_viewed：Skill 详情查看事件，记录 Skill 名称。

tier_changed：Tier 切换事件，记录 Skill 名称、from/to tier。

agent_changed：Agent 分发变更事件，记录 Skill 名称、变更内容。

skill_used：项目装配 use 事件，记录 Skill 名称、项目路径。

skill_unused：项目装配 unuse 事件，记录 Skill 名称、项目路径。

loadout_loaded：Loadout 加载事件，记录 loadout 名称、项目路径、包含 Skill 数量。

loadout_unloaded：Loadout 卸载事件。

skill_installed：新 Skill 安装事件，记录来源（github/local）、Skill 名称。

update_checked：更新检查事件，记录发现更新数量。

update_applied：更新合入事件，记录 Skill 名称、策略（green/yellow）。

update_rolled_back：更新回退事件。

cold_skill_deleted：冷门 Skill 删除事件，记录 Skill 名称、未使用天数。

git_synced：Git 同步事件，记录操作类型（push/pull）。

environment_replicated：环境复刻事件，记录重建软链数量、耗时。

数据模型
registry.json 字段结构
{
  "version": "1.0.0",
  "skills": [
    {
      "name": "code-review",
      "description": "代码审查规范与最佳实践指导",
      "tier": "global",
      "group": "code-quality",
      "agents": ["claude", "codex", "cursor"],
      "upstream": {
        "url": "https://github.com/example/code-review-skill",
        "branch": "main",
        "commit": "a1b2c3d",
        "updatePolicy": "green"
      },
      "tags": ["oss"],
      "path": "vendor/code-review-skill",
      "createdAt": "2025-01-15T08:00:00Z",
      "updatedAt": "2025-07-10T14:30:00Z"
    }
  ],
  "loadouts": {
    "web-frontend": {
      "description": "Web 前端项目通用 Skill 套装",
      "skills": ["react-conventions", "tailwind-guide", "jest-testing", "a11y-checker"]
    },
    "backend-java": {
      "description": "Java 后端项目通用 Skill 套装",
      "skills": ["spring-boot-guide", "junit-testing", "api-design", "db-migration"]
    }
  },
  "projects": {
    "/Users/kual/projects/payment-service": {
      "skills": ["spring-boot-guide", "junit-testing", "api-design"],
      "lastAccessed": "2025-07-14T09:00:00Z"
    }
  },
  "settings": {
    "hubPath": "~/skills",
    "agentDirs": {
      "claude": "~/.claude/skills",
      "codex": "~/.codex/skills",
      "cursor": "~/.cursor/skills"
    },
    "feishuWebhook": "https://open.feishu.cn/open-apis/bot/v2/hook/xxx",
    "updateSchedule": "0 9 * * 1",
    "coldThresholdDays": 30
  }
}


usage.json 字段结构（用量统计数据）
{
  "skills": {
    "code-review": {
      "totalCalls": 142,
      "lastUsed": "2025-07-13T16:45:00Z",
      "dailyCalls": {
        "2025-07-13": 5,
        "2025-07-12": 3,
        "2025-07-11": 8
      }
    }
  }
}


应用本地配置（存储在 Electron userData 目录）
{
  "window": {
    "width": 1400,
    "height": 900,
    "x": 100,
    "y": 100
  },
  "ui": {
    "theme": "dark",
    "language": "zh-CN",
    "viewMode": "card",
    "groupBy": "group"
  },
  "recentProjects": [
    "/Users/kual/projects/payment-service",
    "/Users/kual/projects/web-app"
  ]
}


Technical Considerations
技术架构

Electron 主进程职责

文件系统操作：registry.json 读写、软链创建/移除、目录扫描、备份管理。

Git 操作：clone、fetch、pull、push、diff、tag 操作（通过 simple-git 或 isomorphic-git 库）。

系统集成：文件选择对话框、系统通知、托盘图标。

定时任务：基于 node-cron 或 node-schedule 实现定时更新检查。

IPC 通信：通过 Electron IPC（contextBridge + preload）向渲染进程暴露安全的 API。

文件监听：使用 chokidar 监听 registry.json 和 usage.json 的外部变更，通过 IPC 通知渲染进程刷新。

文件锁：使用 proper-lockfile 对 registry.json 的写操作加锁，防止与 skillctl CLI 的并发冲突。

Electron 渲染进程职责

UI 渲染：React 18 + TypeScript，组件化开发。

状态管理：Zustand（轻量、适合中小型应用）。

样式方案：Tailwind CSS（与深色主题契合、开发效率高）。

Markdown 渲染：react-markdown + rehype-highlight（用于 SKILL.md 内容和 diff 展示）。

虚拟滚动：@tanstack/react-virtual（应对大量 Skill 卡片的性能）。

路由：React Router（页面间导航）。

与 registry.json / 软链 / git 的交互流程

启动时：主进程读取 registry.json 解析为内存对象，通过 IPC 发送至渲染进程。

用户操作（如 tier 切换）：渲染进程通过 IPC 调用主进程 API → 主进程加锁写入 registry.json → 执行对应软链操作 → 返回结果 → 渲染进程更新 UI。

外部修改：chokidar 检测到 registry.json 变更 → 主进程重新读取 → 通过 IPC 推送新数据 → 渲染进程刷新。

Git 同步：主进程调用 simple-git API 执行 git 命令 → 返回结果 → 渲染进程更新状态。

与 skillctl 的兼容方式

共享数据源：GUI 与 CLI 读写同一份 ~/skills/registry.json，使用相同的软链路径规则。

操作等价：GUI 的每个操作在逻辑上等价于对应的 skillctl 命令（如 GUI 的 tier 切换 = skillctl tier set <name> global）。

不调用 skillctl：GUI 不通过 spawn/exec 调用 skillctl 二进制，而是直接操作文件系统和 registry.json（避免 CLI 依赖和版本耦合）。

并发安全：通过文件锁确保 GUI 和 CLI 不会同时写入 registry.json。

格式兼容：GUI 写入 registry.json 时保持与 skillctl 一致的 JSON 格式化风格（2 空格缩进、字段顺序一致），避免 git diff 噪声。

Integration Points

Git（核心）：所有同步、更新、回退操作依赖 git。用户需预先配置好 git 和 SSH key。

飞书 Bot（可选）：通过 Webhook URL 推送更新通知和异常告警。

GitHub API（可选）：安装新 Skill 时，可通过 GitHub API 获取仓库元信息（描述、star 数等），但非必须——降级方案为纯 git clone。

文件系统：大量的软链操作依赖 OS 文件系统。macOS 使用 ln -s，Windows 使用 junction（由 Node.js fs.symlink 抽象）。

Data Storage & Privacy

所有数据本地存储：registry.json、usage.json、备份文件均存储在 ~/skills 目录下。

应用配置存储在 Electron 标准的 userData 目录（macOS: ~/Library/Application Support/SkillHub Desktop/）。

无远程服务：不向任何第三方服务上传数据（飞书通知仅推送摘要文本，不含文件内容）。

密钥审计：git push 前扫描文件内容，正则匹配常见密钥模式，发现则阻止推送。

git 仓库本身可设为 private，用户自行管控访问权限。

Scalability & Performance

目标规模：200 个 Skill、20 个项目、50 个 loadout 的场景。

registry.json 大小：上述规模下预计不超过 100KB，内存解析无压力。

卡片渲染：超过 100 个 Skill 时启用虚拟滚动。

Git 操作：fetch/pull/push 为异步操作，不阻塞 UI，展示进度条。

软链操作：批量操作（如 loadout load 含 20 个 Skill × 3 个 agent = 60 个软链）使用 Promise.all 并行执行，预计耗时小于 1 秒。

Potential Challenges

Windows 软链权限：Windows 上创建 symlink 需要管理员权限或开启开发者模式。解决方案：首次启动时检测权限，引导用户开启开发者模式或使用 junction（目录级别软链，无需特殊权限）。

文件锁跨进程：proper-lockfile 在极端情况下（进程崩溃）可能留下残余锁文件。解决方案：启动时检测并清理过期锁文件（超过 30 秒的锁视为过期）。

Git 冲突：多设备同时修改 registry.json 后同步可能产生冲突。解决方案：GUI 不做 merge 编辑器，检测到冲突后引导用户到终端手动解决。

Agent 目录变更：agent 工具更新后 Skill 目录路径可能变化。解决方案：设置中允许手动修正路径；自动探测功能随时可重新执行。

Electron 安装包体积：Electron 应用天然较大（约 150–200MB）。解决方案：使用 electron-builder 的 ASAR 打包优化，接受此权衡。

跨平台与发布方案
构建工具

使用 electron-builder 进行打包和分发。

macOS：输出 .dmg 安装包（含 Universal Binary 支持 Intel + Apple Silicon）。

Windows：输出 .exe 安装包（NSIS 安装器）。

GitHub Actions CI/CD
# .github/workflows/release.yml 核心流程
触发条件: 推送 tag (v*)
Jobs:
  - build-macos:
      runner: macos-latest
      steps: checkout → setup-node → install → build → electron-builder (dmg)
  - build-windows:
      runner: windows-latest
      steps: checkout → setup-node → install → build → electron-builder (exe)
  - create-release:
      needs: [build-macos, build-windows]
      steps: 创建 GitHub Release → 上传 dmg 和 exe 作为 release assets


版本策略

语义化版本号（SemVer）。

自动更新：集成 electron-updater，应用启动时检查 GitHub Releases 是否有新版本，提示用户下载安装。

代码签名（后续可选）

macOS：使用 Apple Developer Certificate 签名（避免 Gatekeeper 阻止）。

Windows：使用代码签名证书（避免 SmartScreen 警告）。

初版可暂不签名，用户手动信任即可。

Milestones & Sequencing
Project Estimate

中型项目：预计 4–6 周完成 MVP（P0 功能）。

Team Size & Composition

小型团队：1–2 人。

1 名全栈开发者：负责 Electron 主进程、React 渲染进程、CI/CD 全部实现。

可选 1 名辅助：负责 UI 细节打磨和测试。

Suggested Phases

Phase 1：基础框架 + 技能目录（1.5 周）

Key Deliverables:

Electron + React 项目脚手架搭建（含 IPC 通信框架、Tailwind CSS、路由）

registry.json 读取解析与内存状态管理

技能目录页面（卡片/列表视图、分组、搜索、筛选）

Skill 详情面板（SKILL.md 渲染、元数据展示）

分层管理（tier 切换、软链操作）

Agent 分发配置

Dependencies: 需已有 ~/skills 仓库和有效的 registry.json。

Phase 2：项目装配 + 多 Agent 分发（1.5 周）

Key Deliverables:

项目选择器与最近项目记录

当前装配视图

单 Skill use/unuse 操作

Loadout load/unload 操作

Loadout 预设管理（增删改）

多 Agent 软链分发完整实现

Dependencies: Phase 1 的 registry 读写和软链操作基础。

Phase 3：安装 + 更新 + 同步（1.5 周）

Key Deliverables:

从 GitHub URL 安装新 Skill（clone + vendor + 登记）

从本地目录导入

更新检查与展示（diff 预览）

Green/Yellow/Red 策略处理

一键更新与回退

Git 同步面板（commit/push/pull）

一键复刻

Dependencies: Phase 1/2 的基础架构。

Phase 4：统计 + 安全 + 设置 + 发布（1.5 周）

Key Deliverables:

用量统计页面（表格、冷门清单、趋势图）

自动备份与恢复

密钥审计扫描

二次确认机制

设置页面全部配置项

GitHub Actions CI/CD 流水线

macOS / Windows 双平台打包

electron-updater 自动更新集成

首次启动引导流程

Dependencies: Phase 1/2/3 全部完成。

风险与对策

风险

	

影响

	

概率

	

对策




Windows 软链权限问题

	

Windows 用户无法正常使用

	

中

	

使用 junction 替代 symlink；首次启动检测并引导开启开发者模式




GUI 与 CLI 并发写入冲突

	

registry.json 数据损坏

	

低

	

文件锁机制 + 启动时锁文件过期清理 + 自动备份




Agent 更新后目录路径变更

	

软链失效

	

低

	

自动探测功能 + 设置中手动修正 + 启动时软链健康检查




Electron 包体积过大

	

用户安装意愿降低

	

低

	

可接受权衡，100-200MB 在桌面应用中属正常范围




开源 Skill 仓库被删除/迁移

	

更新检查失败

	

低

	

fetch 失败时标记为 unreachable 并通知用户，不影响本地已有文件




Git 冲突导致同步失败

	

跨设备同步中断

	

低

	

检测冲突后引导到终端解决；日常只有单人使用，冲突概率极低




registry.json 格式版本升级

	

新旧版本不兼容

	

低

	

增加 version 字段；应用启动时执行 migration 逻辑，向前兼容

验收标准
P0 功能验收（Phase 1 + Phase 2 完成后）

启动应用后，能正确读取并展示 registry.json 中全部 Skill。

卡片视图和列表视图均能正常切换、展示。

按 group/tier 分组正确、搜索即时过滤准确。

点击 Skill 卡片能展开详情面板，正确渲染 SKILL.md。

Tier 切换操作后，registry.json 正确更新，对应软链正确创建/移除。

Agent 分发修改后，registry.json 和对应目录的软链状态正确。

选择项目目录后，正确展示该项目已装配的 Skill。

use/unuse 单个 Skill 后，项目目录中软链正确创建/移除。

Loadout load 后，预设中全部 Skill 的软链正确创建在项目目录中。

Loadout unload 后，对应软链全部移除。

Loadout 预设的增删改操作正确持久化到 registry.json。

在终端通过 skillctl 修改 registry.json 后，GUI 界面在 5 秒内自动刷新。

P1 功能验收（Phase 3 + Phase 4 完成后）

通过 GitHub URL 成功安装新 Skill（clone、vendor、registry 登记完整）。

从本地目录成功导入 Skill。

多 Skill 仓库能正确识别并展示选择列表。

更新检查能正确发现有 upstream 更新的 Skill 及其 commit 信息。

Green 策略自动合入正确。

Yellow 策略展示 diff，手动合入/跳过操作正确。

Red 策略自动跳过并记录。

更新回退能恢复到更新前状态。

用量统计页面正确展示各 Skill 的调用数据。

冷门清单按阈值正确生成。

危险操作前自动备份、操作前有二次确认弹窗。

备份恢复功能正常。

Git push 前密钥审计扫描能正确检测并阻止含密钥的文件。

一键 commit + push 操作正确。

一键复刻能正确重建所有软链。

P2 功能验收

设置页面全部配置项可修改并持久化。

自动探测 agent 目录路径正确。

飞书通知测试发送成功。

深色/浅色主题切换正常。

中文/英文切换正常（初版至少中文完整）。

跨平台验收

macOS 上 .dmg 安装包能正确安装和启动。

Windows 上 .exe 安装包能正确安装和启动。

两个平台上全部功能表现一致。

GitHub Actions 能自动构建并发布 Release。

性能验收

冷启动到界面可交互小于 3 秒。

搜索响应小于 200ms。

200 个 Skill 场景下卡片视图滚动流畅（60fps）。

内存占用小于 200MB。


