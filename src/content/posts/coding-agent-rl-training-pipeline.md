---
title: "Coding Agent RL：数据来源、轨迹采集与奖励设计"
pubDatetime: 2026-09-15T12:00:00+08:00
featured: false
draft: false
tags:
  - Agentic RL
  - GRPO
  - slime
  - 训练数据
  - 奖励设计
description: "从软件工程任务构造、双沙箱验收到长轨迹切分，梳理 Coding Agent RL 的训练数据流，结合数值反例说明分段奖励、GRPO 优势与轨迹等权 loss 的适用条件。"
---

> 本文是 Coding Agent RL 的学习与实现笔记，结合 slime 官方文档整理，源码口径固定为 `4c193f1f3750`。轨迹 A～H、轮次数和 token 数均为教学示例，不是本文重新训练得到的实验结果。与 [CodeAgent-RL 项目实践](/Blog/posts/codeagent-rl/)配合阅读，可以分别了解一般训练机制与具体项目的工程选择。

Coding Agent RL 用强化学习训练代码模型完成软件工程任务。最直观的闭环是：模型在代码仓库中读写文件、调用工具并生成补丁；系统把补丁放进干净环境运行测试；测试通过得到正奖励，有效但失败或预算耗尽的尝试得到零奖励，平台故障另行标记；训练端再根据奖励更新模型参数。

它比普通单轮 RLHF 多出两个关键难题：一是 agent rollout 是由多轮模型生成、工具 observation、子 agent 和上下文压缩共同构成的长轨迹；二是长轨迹会被切成多个训练 segment，但这种工程切分不能改变每条原始轨迹在训练中的统计权重。

完整数据流可以压缩为：

```text
prompt
  → 多轮 Coding Agent + 工具调用 + 子 agent + auto-compact
  → git diff
  → 干净 eval sandbox 运行测试并给 reward
  → 同一 prompt 的完整轨迹奖励归一化得到 advantage
  → 轨迹切为 Token Segment（共享 trajectory_id 与轨迹 advantage）
  → 当前模型 forward 得到 new_logprob
  → PPO clip 逐 token 计算 loss，并乘 loss_mask
  → trajectory_mask_sums 按原始轨迹聚合
  → 各轨迹 loss 平均
  → backward + optimizer.step()
```

## 01. 什么是 Coding RL

Coding RL 把“能否通过程序测试”作为客观奖励信号。与需要人工偏好或 Reward Model 的通用 RLHF 相比，代码任务天然拥有可执行的 verifier：补丁要么让测试通过，要么不通过。

关键理解：测试只能说明补丁是否满足给定判定条件，不自动保证任务定义、测试覆盖率或评测环境本身没有问题。因此高质量数据和隔离的评测环境仍然非常重要。

## 02. 训练数据从哪来

一种常见路线是从 GitHub PR 构造训练任务：选择带有完整 CI 的开源 Python 项目，收集 merged PR，再通过严格筛选和容器复现，把一个真实修复转换为“问题描述 + 基础版本仓库 + 隐藏评测测试”。

筛选条件包括：

1. PR 的 CI 跑过 pytest 且通过；
2. PR 中包含测试文件变更；
3. 变更前后测试环境都能工作，避免把基础环境损坏误判为修复能力；
4. CI 结果可以在干净 Docker 环境复现。

候选 PR 还需要经过环境复现、测试有效性和任务可评测性筛选，最终可用样本往往少于原始候选。原材料列出的“约 3000 个项目、12 万个 PR、2300 个任务、500 个 Verified 任务及不到 2%”未给出统一统计来源，不能据此推导可复现的数据漏斗，因此本文不将这些数值作为实验事实。

### PR 如何转换为任务

以下示意 PR 修复了 `get_queryset` 遗漏过滤条件的问题：模型看到 issue 描述和 base commit 代码，需要生成 diff；隐藏测试在模型完成后判分。训练提示中可以放入一部分测试帮助理解需求，而评测测试必须对模型隐藏，避免模型直接针对测试代码投机。

下面只展示修改位置与测试意图，省略 Django 模型、视图类和测试数据库夹具；不直接作为完整测试文件运行。

```python
# base commit 中的演示代码
def get_queryset(self):
    return super().get_queryset()  # 漏了 filter

# PR 中加入的修复与测试
def get_queryset(self):
    return super().get_queryset().filter(is_active=True)

def test_queryset_filter():
    qs = MyListView().get_queryset()  # 视图实例；夹具需同时含活动与非活动记录
    assert qs.exists()
    assert all(o.is_active for o in qs)
```

一个 PR 如果包含 `test_a`～`test_e` 五个测试，可以把一部分测试放进 prompt 帮助模型理解需求，把其余测试留作模型不可见的评测项。这里的关键不是固定的拆分比例，而是训练上下文与最终 verifier 不能完全重合。

除 SWE-bench PR 外，还可以使用以下数据来源：

| 来源                    | 测试方式                     | 例子                          |
| ----------------------- | ---------------------------- | ----------------------------- |
| SWE-bench PR            | PR 自带的 pytest             | Django、scikit-learn          |
| GitHub 公开 PR / commit | 构建 Docker 跑 CI 测试       | 各类开源项目                  |
| 竞赛题                  | 题目自带测试用例             | LeetCode、Codeforces          |
| 合成任务                | 自动生成测试                 | 函数签名 + 规范 → 代码 + 测试 |
| 前端任务                | 专家定义 + Agent-as-Verifier | 执行、交互、视觉三层验证      |

## 03. Black-box Agent RL 范式

“Black-box”表示训练系统把 Claude Code 一类 agent harness 当作外部工具链：底层开源模型通过兼容接口为 agent 提供推理，agent 负责多轮规划、读写文件、执行命令和派发子任务。训练端最终接收轨迹、补丁和测试奖励。

| 对比项   | 普通 RLHF         | Coding Agent RL                |
| -------- | ----------------- | ------------------------------ |
| 轨迹形态 | 一轮 LLM 输出     | N 轮 LLM × 工具调用 × 子 agent |
| Reward   | 标量 Reward Model | 运行测试：通过为 1，失败为 0   |
| 训练数据 | 连续的单轮响应    | 可能切成多个 Token Segment     |

训练管线是：

```text
prompt
  → [N 轮 LLM × 工具调用 × 子 agent × 文件副作用 × auto-compact]
  → git diff
  → 跑测试
  → reward
```

### 双沙箱防作弊

| 环境         | 职责                                                   |
| ------------ | ------------------------------------------------------ |
| work sandbox | 让 agent 自由读写代码、执行工具，结束时只抽取 git diff |
| eval sandbox | 从干净 image 启动，应用 diff，运行隐藏测试并给 reward  |

从 work 环境流向 eval 环境的产物可以限制为 diff，从而隔离进程状态、临时文件和预先写好的报告。但 **diff 本身也可能包含测试或评测入口变更**；仅使用两个沙箱，不能自动阻止这类作弊。

可信验收还需要定义可接受补丁的路径与内容，保护隐藏测试和执行入口，从可信位置加载验收资产，并核对实际执行的测试范围。具体采用过滤还是拒绝越界补丁，要由任务协议明确。工作区中的“测试通过”只用于反馈，最终奖励由独立验收生成。

## 04. 从一个例子说起：一条轨迹长什么样

下面用一条 12 轮轨迹解释问题。对应的演示配置为：Qwen3.5-4B 部署在 SGLang 上，Claude Code 运行在 E2B sandbox 中，同时采样 8 条轨迹。这里的模型型号、issue 编号和数量只用于讲解。

```text
Turn 1   prompt：issue 描述 + 仓库结构
         模型输出：先读代码 → 调 Read 工具
         工具返回：models.py 内容（不是模型生成的）

Turn 2   prompt：之前的对话 + 工具结果
         模型输出：定位 get_queryset → 调 Edit 工具

Turn 5   主链派发子 agent 搜索测试用例

Turn 8   上下文超过约 80k token，触发 auto-compact
         旧历史被压缩为摘要

Turn 12  模型宣布完成
         抽取 git diff → 干净 sandbox 跑 pytest → 通过 → reward=1
```

RL 训练需要知道哪些 token 真的是 rollout 模型采样出来的，并能在训练时重新计算这些 token 的概率。长轨迹有三个断裂点：

- 子 agent 有独立上下文，它的生成不能简单接到主链 token 后面；
- auto-compact 会用摘要改写历史，新 prompt 不再是旧 token 序列的连续延伸；
- 工具 observation 是环境输入，不是模型动作，不能作为训练目标。

解决办法是把一条逻辑轨迹拆成若干个 token 级自洽的 Token Segment。演示中的轨迹 A 被切为：子 agent 独立对话形成的 `subagent` 段、compact 前冻结的 `wipe` 段，以及 compact 后主链尾部形成的 `final` 段。

```text
轨迹 A（12 轮，reward=1）
├─ A1（subagent）：子 agent 的独立对话
├─ A2（wipe）：compact 之前的旧对话（冻结）
└─ A3（final）：compact 之后到结束的主链
```

## 05. Segment 的几种情况

一个 segment 可以同时包含 prompt、模型输出和工具 observation，但只有模型自己生成的 token 进入 loss：

```text
[prompt_ids]                     loss_mask = 0
[模型生成 tokens]                loss_mask = 1
[工具 observation tokens]        loss_mask = 0
[模型生成 tokens]                loss_mask = 1
```

三类 segment：

| 类型       | 触发条件                  | 处理方式                                      |
| ---------- | ------------------------- | --------------------------------------------- |
| `final`    | 正常多轮主链              | 前缀连续的轮次保留在同一段                    |
| `subagent` | 主链派发子 agent          | 子 agent 独立对话单独成段                     |
| `wipe`     | auto-compact 改写历史前缀 | compact 前的旧 turns 冻结成段，压缩后另开新段 |

### token 级前缀匹配

设第一轮 prompt 为 `[A B C D]`，输出为 `[E F G]`；第二轮 prompt 为 `[A B C D E F G H I]`，其中 `[H I]` 是工具结果。系统用最长公共前缀确认 `[E F G]` 确实是之前采样的模型 token，因此保留其 `loss_mask=1`；`[H I]` 是 observation，mask 为 0；第二轮新输出 `[J K L]` 的 mask 为 1。

如果新 prompt 只保留了旧 output 的一部分，无法证明采样来源的部分必须置零。核心原则是：宁可少训，也不能对来源不确定的 token 反向传播。

## 06. 分段奖励：实现约定与统计目标

奖励首先属于一次完整尝试。读取源码、调用子 agent 和上下文压缩不会凭空创造新的独立解题尝试；切成 K 段只是为了表达采样上下文和训练序列。

固定版本的 slime Coding-Agent README 记录了一种 fan-out 约定：每条 chain 分配 `reward / K`，并共享 `rollout_id`。这是一项实现约定，需要与该版本的奖励预处理、优势计算和 loss reducer 一起理解，不能单凭它推出“任意分段都保持统计等价”。

下面将三个容易混淆的概念分开：

| 概念         | 本文教学命名           | 含义                                             |
| ------------ | ---------------------- | ------------------------------------------------ |
| 同题采样组   | `prompt_trajectory_id` | 同一个 prompt 下的多次独立尝试，用于相对奖励比较 |
| 一次完整尝试 | `trajectory_id`        | 一条逻辑轨迹，可能包含主链和子 agent             |
| 训练片段     | `segment_id`           | 一段 token 来源和上下文连续性可以核对的训练序列  |

原笔记把第二项记为 `trajectory_id`，容易与第一项混淆。所核对版本在样本与训练聚合代码中使用 `rollout_id`、`rollout_ids` 和 `rollout_mask_sums`；本文后面的 `trajectory_*` 名称用于表达原理，不声称是可直接粘贴的框架 API。

### 6.1 reward/K 的教学伪代码

```python
# 仅描述 README 中的分配约定；Sample、segment 字段由实际框架定义。
def fan_out_sample_segments(sample, segments, reward):
    if not segments:
        return []
    k = len(segments)
    return [
        Sample(
            prompt_ids=segment.prompt_ids,
            response_ids=segment.response_ids,
            loss_mask=segment.loss_mask,
            old_logprobs=segment.old_logprobs,
            reward=reward / k,
            rollout_id=sample.rollout_id,
        )
        for segment in segments
    ]
```

以 8 条轨迹为例：A、C、E、G 通过测试且各切成 3 段；B、D、H 测试失败且各切成 2 段；F 代表一次有效执行但因预算耗尽而未形成补丁的失败尝试，也切成 2 段。共得到 `4×3 + 4×2 = 20` 个片段。平台启动失败等无效运行应单独标记，不与有效失败混在一起。

| 轨迹/段 | 类型     | 轨迹 reward | 按 reward/K 分配 | 可训练 token 数 |
| ------- | -------- | ----------: | ---------------: | --------------: |
| A1      | subagent |           1 |              1/3 |             412 |
| A2      | wipe     |           1 |              1/3 |             412 |
| A3      | final    |           1 |              1/3 |             731 |
| B1      | final    |           0 |                0 |             589 |
| B2      | subagent |           0 |                0 |             445 |

## 07. GRPO 优势：先确定归一化的单位

同一 prompt 的原始轨迹奖励可以按下式计算相对优势，随后广播到该轨迹每个片段的可训练 token：

$$
A_i = \frac{R_i - \operatorname{mean}_{j}(R_j)}{\operatorname{std}_{j}(R_j) + 10^{-6}}
$$

这里的 $i,j$ 指完整尝试，不是分段。本文数值演示统一采用总体标准差；实际训练应明确框架采用的标准差修正、零方差处理和额外归一化配置。

### 7.1 为什么“除以段数”仍可能改变优势

如果把上一节的 20 个片段直接视作 20 个独立样本归一化，会得到 12 个 `1/3` 和 8 个 `0`：均值为 `0.2`，总体标准差约为 `0.1633`，优势约为 `+0.8165`、`-1.2247`。这只是该分段奖励数组的计算结果，不是与原始 8 条轨迹等价的证明。对原始四正四负的轨迹直接归一化，优势则接近 `+1`、`-1`。

更直观的反例是两个成功轨迹和两个失败轨迹：奖励为 `[1, 1, 0, 0]`，段数为 `[1, 3, 1, 1]`。先除以段数再展开，数组变为 `[1, 1/3, 1/3, 1/3, 0, 0]`，归一化后约为 `[2, 0, 0, 0, -1, -1]`。两个奖励相同的成功轨迹，仅因分段数量不同，一个获得正优势，另一个得到零优势。

```python
from statistics import mean, pstdev

rewards = [1.0, 1.0, 0.0, 0.0]
segment_counts = [1, 3, 1, 1]

def normalize(values):
    center, scale = mean(values), pstdev(values)
    return [(value - center) / (scale + 1e-6) for value in values]

expanded = [r / k for r, k in zip(rewards, segment_counts) for _ in range(k)]
print([round(x, 3) for x in normalize(expanded)])
# [2.0, 0.0, 0.0, 0.0, -1.0, -1.0]

trajectory_advantages = normalize(rewards)
segment_advantages = [a for a, k in zip(trajectory_advantages, segment_counts)
                      for _ in range(k)]
print([round(x, 3) for x in segment_advantages])
# [1.0, 1.0, 1.0, 1.0, -1.0, -1.0]
```

### 7.2 本文采用的等权教学目标

后续原理按“先用完整轨迹奖励算优势，再把同一优势分配给所属片段，最后按原始轨迹聚合 loss”说明。如果需要回顾上一节的 segment 归一化例子，可以将对应的 `+0.8165` 代入 PPO 公式演算，但不能与这里的等权目标混为一谈。

这里不训练 critic，也不估计逐状态 value。完整尝试的优劣来自同题多次采样的相对奖励，而同一轨迹内哪些具体工具动作真正起作用，仍是未解决的信用分配问题。

## 08. Forward 得到 probs，算出 RL loss

每个 segment 保存 rollout 时的 `old_logprob`。训练时把 `prompt_ids + response_ids` 输入当前模型，得到带梯度的 `new_logprob`：

$$
\operatorname{ratio}_t = \exp\bigl(\log \pi_{\text{new}}(a_t)-\log \pi_{\text{old}}(a_t)\bigr)
$$

$$
s_1 = \operatorname{ratio}_t A_t,\qquad
s_2 = \operatorname{clip}(\operatorname{ratio}_t,0.8,1.2)A_t
$$

$$
L_t = -\min(s_1,s_2)\cdot \operatorname{loss\_mask}_t
$$

下面用三个 token 展示数值计算：

| token          | mask | old_logprob | new_logprob |             ratio | advantage | token_loss |
| -------------- | ---: | ----------: | ----------: | ----------------: | --------: | ---------: |
| t1             |    1 |       -2.10 |       -1.95 |              1.16 |   +0.8165 |    -0.9486 |
| t2             |    1 |       -0.80 |       -0.55 | 1.28，clip 到 1.2 |   +0.8165 |    -0.9798 |
| t3（工具返回） |    0 |           — |           — |                 — |         — |          0 |

| 概率          | 来源                     | 用途                  | 是否带梯度 |
| ------------- | ------------------------ | --------------------- | ---------- |
| `old_logprob` | rollout 时、更新前的模型 | importance ratio 分母 | 否         |
| `new_logprob` | 当前训练中的模型         | importance ratio 分子 | 是         |
| `ref_logprob` | 冻结 reference model     | KL 惩罚               | 否         |

正 advantage 会推动模型提高对应 token 的概率，负 advantage 会降低概率。PPO clip 限制过大概率比值对目标函数的贡献，但不保证实际参数更新或 KL 距离具有严格上界；工具 observation 因 `loss_mask=0` 而不产生梯度。还需要区分：若每批 rollout 只训练一次，ratio 尚未明显偏离 1；复用同一批数据训练多轮时，clip 才真正发挥保护作用。

## 09. 轨迹内的 loss：跨片段聚合

不能让每个 segment 分别除以自己的 token 数。若 A 被切成 3 段、B 被切成 2 段，逐段求平均会使 A 多出一项；短 segment 的单 token 权重也会高于长 segment。

在本文选定的轨迹等权目标下，同一轨迹的所有段共享整条轨迹的 mask token 总数；每段还必须使用同一条轨迹的优势，且被优化 token 不重复计数：

```text
group A 分母 = 412 + 412 + 731 = 1555
group B 分母 = 589 + 445       = 1034

loss(A1) = sum(A1 token_loss) / 1555
loss(A2) = sum(A2 token_loss) / 1555
loss(A3) = sum(A3 token_loss) / 1555
```

因此，在 token、优势和概率比值保持一致且没有重复 token 的前提下，A1、A2、A3 相加，等于未切分轨迹 A 的 token loss 之和除以 1555。共享上下文不应使已训练的生成前缀重复贡献 loss；空 mask 片段或无有效 token 的轨迹还应按明确规则跳过。

`trajectory_mask_sums` 的构造逻辑是按共享的 `trajectory_id` 累加各段 `loss_mask` 中的 1，再把同一个公共分母写回该轨迹的每个 segment。

```python
trajectory_id_list = train_data["trajectory_ids"]
mask_sums_per_sample = [sum(mask) for mask in loss_masks]

trajectory_total_mask = {}
for trajectory_id, mask_sum in zip(trajectory_id_list, mask_sums_per_sample):
    trajectory_total_mask[trajectory_id] = trajectory_total_mask.get(trajectory_id, 0) + mask_sum

train_data["trajectory_mask_sums"] = [
    trajectory_total_mask[trajectory_id] for trajectory_id in trajectory_id_list
]
```

`trajectory_mask_sums[i]` 表示第 i 个 sample 所属原始轨迹的全部可训练 token 数，而不是当前 segment 自己的 token 数。

## 10. 全局 loss：原始轨迹等权汇总

组内聚合得到每条原始轨迹的 loss 后，8 条原始轨迹等权平均：

$$
L_{\text{total}}=\frac{L_A+L_B+\cdots+L_H}{8}
$$

随后执行 `total_loss.backward()` 和 `optimizer.step()`。最终权重原则是：轨迹之间等权；一条轨迹内部按可训练 token 数聚合；轨迹切成多少段不改变其总贡献。

```text
8 条完整尝试 → 独立评测得到轨迹奖励
  → 同一 prompt 的轨迹奖励归一化得到 advantage
  → 按上下文连续性切段，保留 trajectory_id 与同一轨迹 advantage
  → forward → probability ratio → PPO clip → token_loss × loss_mask
  → 用整条轨迹的有效 token 总数聚合各段 loss
  → 原始轨迹等权平均 → backward → optimizer.step()
```

这是一种明确的教学目标，不代表所有 GRPO 变体都采用轨迹等权。选择 token 等权、轨迹等权或其他归约方式，应当与研究目标一致；工程切分的正确性需要在已选定的目标下检验。

## 11. 实现检查与局限

- 核对 prompt、工具结果和模板的 `loss_mask=0`；只训练真实采样且来源可核对的模型 token。
- 区分同题采样组、原始轨迹和训练片段，避免复用含义不同的分组字段。
- 对不同段数、不同片段长度、共享前缀、空 mask、全零奖励和平台故障分别检查。
- `old_logprob` 来自 rollout，`new_logprob` 来自当前带梯度的 forward；不能用重新生成的另一组 token 替换原动作。
- 若要声称切分不改变目标，应比较相同 token 与相同优势下的未切分 loss、切分后聚合 loss，以及必要时的梯度。
- 干净沙箱负责隔离环境副作用，受保护测试与补丁准入负责约束评测内容；测试奖励仍受到任务定义和测试覆盖率限制。

本篇解释训练数据如何流动；[CodeAgent-RL 项目文章](/Blog/posts/codeagent-rl/)进一步说明受控工具、独立验收、动作 SFT 与固定开发集结果，两篇中的教学例子和项目实验应分别理解。

## 参考来源

核对日期：2026-09-15。以下官方链接固定到 commit `4c193f1f37509cca70f0e88807a9305b70f63f4e`，避免后续源码更新使字段与本文口径混淆。

- [slime：Coding-Agent RL 说明与 fan-out 约定](https://github.com/THUDM/slime/blob/4c193f1f37509cca70f0e88807a9305b70f63f4e/examples/coding_agent_rl/README.md)
- [slime：轨迹与 token 连续性管理](https://github.com/THUDM/slime/blob/4c193f1f37509cca70f0e88807a9305b70f63f4e/slime/agent/trajectory.py)
- [slime：rollout_id 校验与 rollout_mask_sums 聚合](https://github.com/THUDM/slime/blob/4c193f1f37509cca70f0e88807a9305b70f63f4e/slime/ray/rollout.py)
- [slime：策略损失与优势计算](https://github.com/THUDM/slime/blob/4c193f1f37509cca70f0e88807a9305b70f63f4e/slime/backends/megatron_utils/loss.py)
- [slime：Agentic RL 官方导航](https://github.com/THUDM/slime/blob/4c193f1f37509cca70f0e88807a9305b70f63f4e/docs/zh/get_started/agent.md)

原学习材料还列出 [源码精读上篇](https://zhuanlan.zhihu.com/p/2044560885205796027)及[下篇](https://zhuanlan.zhihu.com/p/2046986566422229718)，作为延伸阅读保留；本文的实现字段以以上固定版本官方源码为准。
