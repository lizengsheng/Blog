---
title: "大模型面试手写实现：Transformer、微调与强化学习"
pubDatetime: 2026-09-14T09:00:00+08:00
featured: false
draft: false
tags:
  - 大模型
  - Transformer
  - PyTorch
  - 强化学习
description: "从注意力、归一化和位置编码，到 LoRA、SFT、常见损失与 PPO/DPO/GRPO，用公式、张量维度和 PyTorch 示例串联手写实现。"
---

这篇笔记按 Transformer、微调、损失函数、强化学习四条主线组织手写实现。每个模块保留关键公式、张量维度、实现步骤和示例，适合逐段运行、对照框架算子并检查输入输出。

> 实现边界：以下代码是教学示例，各代码块独立使用，需要 Python 与 PyTorch 环境。注意力示例未覆盖全屏蔽行等所有边界；KV Cache、MoE 和 MLA 用于理解计算过程，不等同于完整模型的生产实现。训练损失示例省略分布式训练、数据流水线和完整 rollout 管理；示例输出不代表模型训练效果。

## Transformer

![1](https://raw.githubusercontent.com/1910853272/image/master/img/202603121816735.png)

### 注意力机制

#### Self-Attention

第一步：把输入映射成 Q、K、V

$$
Q = XW_Q,\quad K = XW_K,\quad V = XW_V
$$

第二步：计算注意力分数

$$
\text{Scores} = \frac{QK^T}{\sqrt{d}}
$$

- `query` 形状是 `[batch, seq_len, hidden_size]`
- `key.transpose(-1, -2)` 形状是 `[batch, hidden_size, seq_len]`

两者相乘后：[batch, seq_len, seq_len]

第三步：为什么要除以 $\sqrt{d}$

hidden size 很大，`QK^T` 的数值会变得很大，softmax 容易进入饱和区，导致梯度不稳定

第四步：加 attention mask

把不允许看到的位置分数设成负无穷

第五步：softmax 变成注意力权重

$$
\text{softmax}\left(\frac{QK^T}{\sqrt{d}}\right)
$$

第六步：对 Value 做加权求和

$$
\text{Attention}(Q,K,V)=\text{softmax}\left(\frac{QK^T}{\sqrt{d}}\right)V
$$

第七步：输出映射

$$
\text{Output} = \text{Attention}(Q,K,V)W_O
$$

```python
import math
import torch
from torch import nn

class SelfAttention(torch.nn.Module):
    def __init__(self, hidden_size):
        super().__init__()

        # 定义 Q K V 的线性映射层
        self.q_linear = nn.Linear(hidden_size, hidden_size)
        self.k_linear = nn.Linear(hidden_size, hidden_size)
        self.v_linear = nn.Linear(hidden_size, hidden_size)

        # 输出层将结果映射回 hidden_size
        self.o_linear = nn.Linear(hidden_size, hidden_size)

        # 保存隐藏层维度 计算缩放因子时使用
        self.hidden_size = hidden_size

    def forward(self, hidden_state, attention_mask=None):
        # hidden_state 形状: [batch_size, seq_len, hidden_size]
        query = self.q_linear(hidden_state)
        key = self.k_linear(hidden_state)
        value = self.v_linear(hidden_state)

        # 计算缩放点积注意力分数
        # attention_scores 形状: [batch_size, seq_len, seq_len]
        attention_scores = torch.matmul(query, key.transpose(-1, -2)) / math.sqrt(self.hidden_size)

        # 如果传入 mask 则将不可见位置置为负无穷
        if attention_mask is not None:
            attention_scores = attention_scores.masked_fill(attention_mask == 0, float("-inf"))

        # 对最后一维做 softmax 得到注意力权重
        attention_probs = torch.softmax(attention_scores, dim=-1)

        # 注意力权重与 value 相乘得到输出
        output = torch.matmul(attention_probs, value)

        # 再经过一层线性映射得到最终结果
        output = self.o_linear(output)
        return output


if __name__ == "__main__":
    # 构造测试输入
    # batch_size = 2 seq_len = 3 hidden_size = 8
    hidden_state = torch.randn(2, 3, 8)

    # 构造因果掩码
    # 1 表示可见 0 表示被屏蔽
    # 形状: [1, seq_len, seq_len]
    attention_mask = torch.tril(torch.ones(3, 3)).view(1, 3, 3)

    model = SelfAttention(hidden_size=8)
    output = model(hidden_state, attention_mask)

    print("输入张量形状:", hidden_state.shape)
    print("Mask 张量形状:", attention_mask.shape)
    print("输出张量形状:", output.shape)
    print("第一个 batch 的输出结果:")
    print(output[0])
```

#### Cross-Attention

```python
import math
import torch
from torch import nn

class CrossAttention(nn.Module):
    def __init__(self, d_model, num_heads):
        super().__init__()
        if d_model % num_heads != 0:
            raise ValueError("d_model 必须能够被 num_heads 整除。")

        # 保存头数，以及每个注意力头对应的特征维度
        self.num_heads = num_heads
        self.head_dim = d_model // num_heads

        # Query 来自解码器输入，Key 和 Value 来自编码器输出
        self.q_linear = nn.Linear(d_model, d_model)
        self.k_linear = nn.Linear(d_model, d_model)
        self.v_linear = nn.Linear(d_model, d_model)

        # 多头结果拼接后，再映射回原始隐藏维度
        self.o_linear = nn.Linear(d_model, d_model)

    def forward(self, x, encoder_output, attention_mask=None):
        # x 形状: [batch_size, target_seq_len, d_model]
        # encoder_output 形状: [batch_size, source_seq_len, d_model]
        batch_size = x.size(0)

        # Query 由解码器输入生成，Key 和 Value 由编码器输出生成
        query = self.q_linear(x)
        key = self.k_linear(encoder_output)
        value = self.v_linear(encoder_output)

        # 将 query、key、value 拆成多头
        query = query.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)
        key = key.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)
        value = value.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)

        # 计算缩放点积注意力分数
        attention_scores = torch.matmul(query, key.transpose(-1, -2)) / math.sqrt(self.head_dim)

        # 如果传入 mask，则把被屏蔽的位置置为负无穷
        if attention_mask is not None:
            attention_scores = attention_scores.masked_fill(attention_mask == 0, float("-inf"))

        # 对最后一维做 softmax，得到注意力权重
        attention_probs = torch.softmax(attention_scores, dim=-1)

        # 注意力权重与 value 相乘，得到交叉注意力输出
        output = torch.matmul(attention_probs, value)

        # 将多个头重新拼接回原始隐藏维度
        output = output.transpose(1, 2).contiguous().view(
            batch_size, -1, self.head_dim * self.num_heads
        )

        # 通过输出层得到最终结果
        output = self.o_linear(output)
        return output


if __name__ == "__main__":
    # 构造测试输入:
    # batch_size = 2, target_seq_len = 4, source_seq_len = 5, d_model = 8
    x = torch.randn(2, 4, 8)
    encoder_output = torch.randn(2, 5, 8)

    # 构造一个全可见的交叉注意力 mask
    # 形状: [batch_size, 1, target_seq_len, source_seq_len]
    attention_mask = torch.ones(1, 1, 4, 5)

    model = CrossAttention(d_model=8, num_heads=2)
    output = model(x, encoder_output, attention_mask)
    same_shape = output.shape == x.shape

    print("解码器输入张量形状:", x.shape)
    print("编码器输出张量形状:", encoder_output.shape)
    print("Mask 张量形状:", attention_mask.shape)
    print("输出张量形状:", output.shape)
    print("输出形状是否与解码器输入一致:", same_shape)
    print("第一个 batch 的输出结果:")
    print(output[0])
```

#### MHA

第一步：把输入映射成 Q、K、V

$$
Q = XW_Q,\quad K = XW_K,\quad V = XW_V
$$

输入 `hidden_state` 的形状是：

$$
[batch\_size,\ seq\_len,\ hidden\_size]
$$

映射后形状不变，仍然是：

$$
[batch\_size,\ seq\_len,\ hidden\_size]
$$

第二步：拆成多个头

形状变化为：

$$
[batch,\ seq\_len,\ hidden\_size]
\rightarrow
[batch,\ num\_heads,\ seq\_len,\ head\_dim]
$$

第四步：加 mask：因果 mask只能看自己和过去位置，不能看未来位置

第五步：softmax 得到注意力权重

$$
\text{softmax}\left(\frac{Q_h K_h^T}{\sqrt{d_h}}\right)
$$

第六步：对每个头的 Value 做加权求和

$$
\text{head}_h = \text{softmax}\left(\frac{Q_h K_h^T}{\sqrt{d_h}}\right)V_h
$$

第七步：拼接所有头

$$
[batch,\ num\_heads,\ seq\_len,\ head\_dim]\rightarrow[batch,\ seq\_len,\ hidden\_size]
$$

第八步：输出投影

$$
\text{MHA}(Q,K,V) = \text{Concat}(\text{head}_1,\dots,\text{head}_H)W_O
$$

```python
import math
import torch
from torch import nn

class MutiHeadAttention(torch.nn.Module):
    def __init__(self, hidden_size, num_heads):
        super(MutiHeadAttention, self).__init__()
        if hidden_size % num_heads != 0:
            raise ValueError("hidden_size 必须能够被 num_heads 整除。")

        # 保存头数，以及每个注意力头分到的特征维度。
        self.num_heads = num_heads
        self.head_dim = hidden_size // num_heads

        # 分别定义 Q、K、V 的线性映射层。
        self.q_linear = nn.Linear(hidden_size, hidden_size)
        self.k_linear = nn.Linear(hidden_size, hidden_size)
        self.v_linear = nn.Linear(hidden_size, hidden_size)

        # 多头结果拼接后，再通过输出层映射回 hidden_size。
        self.o_linear = nn.Linear(hidden_size, hidden_size)

    def forward(self, hidden_state, attention_mask=None):
        # hidden_state 的形状为 [batch_size, seq_len, hidden_size]。
        batch_size = hidden_state.size(0)

        # 把输入投影为 query、key、value。
        query = self.q_linear(hidden_state)
        key = self.k_linear(hidden_state)
        value = self.v_linear(hidden_state)

        # 将每个张量拆成多头，形状变为 [batch_size, num_heads, seq_len, head_dim]。
        # 把 hidden_size 拆成 num_heads 和 head_dim 两部分，并交换维度方便计算。
        query = query.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)
        key = key.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)
        value = value.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)

        # 计算缩放点积注意力分数。
        attention_scores = torch.matmul(query, key.transpose(-1, -2)) / math.sqrt(self.head_dim)

        # 如果传入 mask，则把不需要关注的位置置为负无穷。
        if attention_mask is not None:
            attention_scores = attention_scores.masked_fill(attention_mask == 0, float("-inf"))

        # 对最后一维做 softmax，得到注意力权重。
        attention_probs = torch.softmax(attention_scores, dim=-1)

        # 注意力权重与 value 相乘，得到每个头的输出。
        output = torch.matmul(attention_probs, value)

        # 把多个头重新拼接回原始隐藏维度。
        output = output.transpose(1, 2).contiguous().view(
            batch_size, -1, self.head_dim * self.num_heads
        )

        # 输出层做一次线性变换，得到最终结果。
        output = self.o_linear(output)
        return output


if __name__ == "__main__":
    # 构造一个用于验证的输入:
    # batch_size = 2, seq_len = 3, hidden_size = 8, num_heads = 2
    hidden_state = torch.randn(2, 3, 8)

    # attention_mask 形状为 [batch_size, 1, seq_len, seq_len]，
    # 其中 1 表示当前位置可见，0 表示当前位置被屏蔽。
    # attention_mask = torch.tensor(
    #     [
    #         [[[1, 1, 1], [1, 1, 0], [1, 0, 0]]],
    #         [[[1, 1, 1], [1, 1, 1], [1, 1, 1]]],
    #     ],
    #     dtype=torch.int64,
    # )

    # 因果掩码
    # shape: (seq_len, seq_len), 上三角为 0, 下三角为 1
    # causal_mask = torch.tril(torch.ones(seq_len, seq_len)).view(1, 1, seq_len, seq_len)
    attention_mask = torch.tril(torch.ones(3, 3)).view(1, 1, 3, 3)

    model = MutiHeadAttention(hidden_size=8, num_heads=2)
    output = model(hidden_state, attention_mask)

    print("输入张量形状:", hidden_state.shape)
    print("Mask 张量形状:", attention_mask.shape)
    print("输出张量形状:", output.shape)
    print("第一个 batch 的输出结果:")
    print(output[0])
```

##### MHA：KV Cache

```python
import math
import torch
from torch import nn

class MutiHeadAttention(torch.nn.Module):
    def __init__(self, hidden_size, num_heads):
        super(MutiHeadAttention, self).__init__()
        if hidden_size % num_heads != 0:
            raise ValueError("hidden_size 必须能够被 num_heads 整除。")

        # 保存头数，以及每个注意力头分到的特征维度。
        self.num_heads = num_heads
        self.head_dim = hidden_size // num_heads

        # 分别定义 Q、K、V 的线性映射层。
        self.q_linear = nn.Linear(hidden_size, hidden_size)
        self.k_linear = nn.Linear(hidden_size, hidden_size)
        self.v_linear = nn.Linear(hidden_size, hidden_size)

        # 多头结果拼接后，再通过输出层映射回 hidden_size。
        self.o_linear = nn.Linear(hidden_size, hidden_size)

    def forward(self, hidden_state, attention_mask=None, past_key_value=None, use_cache=False):
        # hidden_state 的形状为 [batch_size, seq_len, hidden_size]。
        batch_size = hidden_state.size(0)

        # 把输入投影为 query、key、value。
        query = self.q_linear(hidden_state)
        key = self.k_linear(hidden_state)
        value = self.v_linear(hidden_state)

        # 将每个张量拆成多头，形状变为 [batch_size, num_heads, seq_len, head_dim]。
        # 把 hidden_size 拆成 num_heads 和 head_dim 两部分，并交换维度方便计算。
        query = query.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)
        key = key.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)
        value = value.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)

        # 如果传入 past_key_value，就把历史的 key 和 value
        # 与当前时刻的 key 和 value 在序列维度上拼接起来。
        if past_key_value is not None:
            past_key, past_value = past_key_value
            key = torch.cat([past_key, key], dim=2)
            value = torch.cat([past_value, value], dim=2)

        # 如果需要使用 KV Cache，就把当前累计的 key 和 value 保存下来。
        present_key_value = (key, value) if use_cache else None

        # 计算缩放点积注意力分数。
        attention_scores = torch.matmul(query, key.transpose(-1, -2)) / math.sqrt(self.head_dim)

        # 如果传入 mask，则把不需要关注的位置置为负无穷。
        if attention_mask is not None:
            attention_scores = attention_scores.masked_fill(attention_mask == 0, float("-inf"))

        # 对最后一维做 softmax，得到注意力权重。
        attention_probs = torch.softmax(attention_scores, dim=-1)

        # 注意力权重与 value 相乘，得到每个头的输出。
        output = torch.matmul(attention_probs, value)

        # 把多个头重新拼接回原始隐藏维度。
        output = output.transpose(1, 2).contiguous().view(
            batch_size, -1, self.head_dim * self.num_heads
        )

        # 输出层做一次线性变换，得到最终结果。
        output = self.o_linear(output)
        return output, present_key_value


if __name__ == "__main__":
    # 构造一个用于验证的输入:
    # batch_size = 2, seq_len = 3, hidden_size = 8, num_heads = 2
    hidden_state = torch.randn(2, 3, 8)

    # attention_mask 形状为 [batch_size, 1, seq_len, seq_len]，
    # 这里使用标准因果 mask，保证当前位置只能看到自己和之前的位置。
    attention_mask = torch.tensor(
        [
            [[[1, 0, 0], [1, 1, 0], [1, 1, 1]]],
            [[[1, 0, 0], [1, 1, 0], [1, 1, 1]]],
        ],
        dtype=torch.int64,
    )

    model = MutiHeadAttention(hidden_size=8, num_heads=2)

    # 方式一：一次性输入完整序列，并配合因果 mask 计算输出。
    full_output, _ = model(hidden_state, attention_mask)

    # 方式二：逐个 token 解码，并通过 KV Cache 复用历史的 key 和 value。
    past_key_value = None
    step_outputs = []
    for step in range(hidden_state.size(1)):
        current_hidden_state = hidden_state[:, step : step + 1, :]
        step_output, past_key_value = model(
            current_hidden_state,
            past_key_value=past_key_value,
            use_cache=True,
        )
        step_outputs.append(step_output)

    cache_output = torch.cat(step_outputs, dim=1)

    # 比较全量计算和 KV Cache 增量解码的结果是否一致。
    max_diff = (full_output - cache_output).abs().max().item()
    is_same = torch.allclose(full_output, cache_output, atol=1e-6)

    print("输入张量形状:", hidden_state.shape)
    print("Mask 张量形状:", attention_mask.shape)
    print("全量计算输出形状:", full_output.shape)
    print("KV Cache 输出形状:", cache_output.shape)
    print("最终 Key Cache 形状:", past_key_value[0].shape)
    print("最终 Value Cache 形状:", past_key_value[1].shape)
    print("最大误差:", max_diff)
    print("两种方式输出是否一致:", is_same)
    print("第一个 batch 的全量计算输出结果:")
    print(full_output[0])
    print("第一个 batch 的 KV Cache 输出结果:")
    print(cache_output[0])
```

##### MHA：RoPE

```python
import math
import torch
from torch import nn

class MutiHeadAttention(torch.nn.Module):
    def __init__(self, hidden_size, num_heads):
        super(MutiHeadAttention, self).__init__()
        if hidden_size % num_heads != 0:
            raise ValueError("hidden_size 必须能够被 num_heads 整除。")

        # 保存头数，以及每个注意力头分到的特征维度。
        self.num_heads = num_heads
        self.head_dim = hidden_size // num_heads

        # RoPE 需要对每两个维度做一次旋转，因此 head_dim 必须是偶数。
        if self.head_dim % 2 != 0:
            raise ValueError("使用 RoPE 时，head_dim 必须是偶数。")

        # 分别定义 Q、K、V 的线性映射层。
        self.q_linear = nn.Linear(hidden_size, hidden_size)
        self.k_linear = nn.Linear(hidden_size, hidden_size)
        self.v_linear = nn.Linear(hidden_size, hidden_size)

        # 多头结果拼接后，再通过输出层映射回 hidden_size。
        self.o_linear = nn.Linear(hidden_size, hidden_size)

    def rotate_half(self, x):
        # 把最后一维按两个元素一组做旋转：
        # [x1, x2] -> [-x2, x1]
        x1 = x[..., ::2]
        x2 = x[..., 1::2]
        return torch.stack((-x2, x1), dim=-1).flatten(-2)

    def apply_rope(self, x):
        # 根据序列位置构造 cos 和 sin，并对张量加入 RoPE。
        seq_len = x.size(2)
        inv_freq = 1.0 / (
            10000
            ** (
                torch.arange(0, self.head_dim, 2, device=x.device, dtype=torch.float32)
                / self.head_dim
            )
        )
        position_ids = torch.arange(seq_len, device=x.device, dtype=torch.float32)
        freqs = torch.outer(position_ids, inv_freq)
        cos = freqs.cos().repeat_interleave(2, dim=-1).unsqueeze(0).unsqueeze(0).to(x.dtype)
        sin = freqs.sin().repeat_interleave(2, dim=-1).unsqueeze(0).unsqueeze(0).to(x.dtype)
        return x * cos + self.rotate_half(x) * sin

    def forward(self, hidden_state, attention_mask=None):
        # hidden_state 的形状为 [batch_size, seq_len, hidden_size]。
        batch_size = hidden_state.size(0)

        # 把输入投影为 query、key、value。
        query = self.q_linear(hidden_state)
        key = self.k_linear(hidden_state)
        value = self.v_linear(hidden_state)

        # 将每个张量拆成多头，形状变为 [batch_size, num_heads, seq_len, head_dim]。
        # 把 hidden_size 拆成 num_heads 和 head_dim 两部分，并交换维度方便计算。
        query = query.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)
        key = key.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)
        value = value.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)

        # 对 query 和 key 加入 RoPE 旋转位置编码。
        query = self.apply_rope(query)
        key = self.apply_rope(key)

        # 计算缩放点积注意力分数。
        attention_scores = torch.matmul(query, key.transpose(-1, -2)) / math.sqrt(self.head_dim)

        # 如果传入 mask，则把不需要关注的位置置为负无穷。
        if attention_mask is not None:
            attention_scores = attention_scores.masked_fill(attention_mask == 0, float("-inf"))

        # 对最后一维做 softmax，得到注意力权重。
        attention_probs = torch.softmax(attention_scores, dim=-1)

        # 注意力权重与 value 相乘，得到每个头的输出。
        output = torch.matmul(attention_probs, value)

        # 把多个头重新拼接回原始隐藏维度。
        output = output.transpose(1, 2).contiguous().view(
            batch_size, -1, self.head_dim * self.num_heads
        )

        # 输出层做一次线性变换，得到最终结果。
        output = self.o_linear(output)
        return output


if __name__ == "__main__":
    # 构造一个用于验证的输入:
    # batch_size = 2, seq_len = 3, hidden_size = 8, num_heads = 2
    hidden_state = torch.randn(2, 3, 8)

    # attention_mask 形状为 [batch_size, 1, seq_len, seq_len]，
    # 其中 1 表示当前位置可见，0 表示当前位置被屏蔽。
    attention_mask = torch.tensor(
        [
            [[[1, 1, 1], [1, 1, 0], [1, 0, 0]]],
            [[[1, 1, 1], [1, 1, 1], [1, 1, 1]]],
        ],
        dtype=torch.int64,
    )

    model = MutiHeadAttention(hidden_size=8, num_heads=2)
    output = model(hidden_state, attention_mask)

    # 额外验证：位置 0 时 cos = 1、sin = 0，
    # 因此 query 和 key 经过 RoPE 后应保持不变。
    query = model.q_linear(hidden_state)
    key = model.k_linear(hidden_state)

    query = query.view(2, -1, model.num_heads, model.head_dim).transpose(1, 2)
    key = key.view(2, -1, model.num_heads, model.head_dim).transpose(1, 2)

    rope_query = model.apply_rope(query)
    rope_key = model.apply_rope(key)

    q_pos0_diff = (query[:, :, 0, :] - rope_query[:, :, 0, :]).abs().max().item()
    k_pos0_diff = (key[:, :, 0, :] - rope_key[:, :, 0, :]).abs().max().item()
    q_pos0_same = torch.allclose(query[:, :, 0, :], rope_query[:, :, 0, :], atol=1e-6)
    k_pos0_same = torch.allclose(key[:, :, 0, :], rope_key[:, :, 0, :], atol=1e-6)

    print("输入张量形状:", hidden_state.shape)
    print("Mask 张量形状:", attention_mask.shape)
    print("输出张量形状:", output.shape)
    print("位置 0 的 Query 最大误差:", q_pos0_diff)
    print("位置 0 的 Key 最大误差:", k_pos0_diff)
    print("位置 0 的 Query 是否保持不变:", q_pos0_same)
    print("位置 0 的 Key 是否保持不变:", k_pos0_same)
    print("第一个 batch 的输出结果:")
    print(output[0])
```

##### MHA：KV Cache 与 RoPE

```python
import math
import torch
from torch import nn

class MutiHeadAttention(torch.nn.Module):
    def __init__(self, hidden_size, num_heads):
        super(MutiHeadAttention, self).__init__()
        if hidden_size % num_heads != 0:
            raise ValueError("hidden_size 必须能够被 num_heads 整除。")

        # 保存头数，以及每个注意力头分到的特征维度。
        self.num_heads = num_heads
        self.head_dim = hidden_size // num_heads

        # RoPE 需要把每两个维度作为一组做旋转，因此 head_dim 必须是偶数。
        if self.head_dim % 2 != 0:
            raise ValueError("使用 RoPE 时，head_dim 必须是偶数。")

        # 分别定义 Q、K、V 的线性映射层。
        self.q_linear = nn.Linear(hidden_size, hidden_size)
        self.k_linear = nn.Linear(hidden_size, hidden_size)
        self.v_linear = nn.Linear(hidden_size, hidden_size)

        # 多头结果拼接后，再通过输出层映射回 hidden_size。
        self.o_linear = nn.Linear(hidden_size, hidden_size)

    def rotate_half(self, x):
        # 把最后一维两两分组后做旋转：
        # [x1, x2] -> [-x2, x1]
        x1 = x[..., ::2]
        x2 = x[..., 1::2]
        return torch.stack((-x2, x1), dim=-1).flatten(-2)

    def apply_rope(self, x, position_ids):
        # 根据位置下标构造 cos 和 sin，并对 query 或 key 做旋转位置编码。
        inv_freq = 1.0 / (
            10000
            ** (
                torch.arange(0, self.head_dim, 2, device=x.device, dtype=torch.float32)
                / self.head_dim
            )
        )

        freqs = torch.outer(position_ids.to(torch.float32), inv_freq)
        cos = freqs.cos().repeat_interleave(2, dim=-1).unsqueeze(0).unsqueeze(0).to(x.dtype)
        sin = freqs.sin().repeat_interleave(2, dim=-1).unsqueeze(0).unsqueeze(0).to(x.dtype)

        return x * cos + self.rotate_half(x) * sin

    def forward(self, hidden_state, attention_mask=None, past_key_value=None, use_cache=False):
        # hidden_state 的形状为 [batch_size, seq_len, hidden_size]。
        batch_size = hidden_state.size(0)
        seq_len = hidden_state.size(1)

        # 把输入投影为 query、key、value。
        query = self.q_linear(hidden_state)
        key = self.k_linear(hidden_state)
        value = self.v_linear(hidden_state)

        # 将每个张量拆成多头，形状变为 [batch_size, num_heads, seq_len, head_dim]。
        # 把 hidden_size 拆成 num_heads 和 head_dim 两部分，并交换维度方便计算。
        query = query.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)
        key = key.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)
        value = value.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)

        # 当前 token 的位置需要接在历史 cache 之后。
        past_seq_len = 0 if past_key_value is None else past_key_value[0].size(2)
        position_ids = torch.arange(
            past_seq_len, past_seq_len + seq_len, device=hidden_state.device
        )

        # 对当前时刻的 query 和 key 加入 RoPE 旋转位置编码。
        query = self.apply_rope(query, position_ids)
        key = self.apply_rope(key, position_ids)

        # 如果传入 past_key_value，就把历史的 key 和 value
        # 与当前时刻的 key 和 value 在序列维度上拼接起来。
        if past_key_value is not None:
            past_key, past_value = past_key_value
            key = torch.cat([past_key, key], dim=2)
            value = torch.cat([past_value, value], dim=2)

        # 如果需要使用 KV Cache，就把当前累计的 key 和 value 保存下来。
        present_key_value = (key, value) if use_cache else None

        # 计算缩放点积注意力分数。
        attention_scores = torch.matmul(query, key.transpose(-1, -2)) / math.sqrt(self.head_dim)

        # 如果传入 mask，则把不需要关注的位置置为负无穷。
        if attention_mask is not None:
            attention_scores = attention_scores.masked_fill(attention_mask == 0, float("-inf"))

        # 对最后一维做 softmax，得到注意力权重。
        attention_probs = torch.softmax(attention_scores, dim=-1)

        # 注意力权重与 value 相乘，得到每个头的输出。
        output = torch.matmul(attention_probs, value)

        # 把多个头重新拼接回原始隐藏维度。
        output = output.transpose(1, 2).contiguous().view(
            batch_size, -1, self.head_dim * self.num_heads
        )

        # 输出层做一次线性变换，得到最终结果。
        output = self.o_linear(output)
        return output, present_key_value


if __name__ == "__main__":
    # 构造一个用于验证的输入:
    # batch_size = 2, seq_len = 3, hidden_size = 8, num_heads = 2
    hidden_state = torch.randn(2, 3, 8)

    # attention_mask 形状为 [batch_size, 1, seq_len, seq_len]，
    # 这里使用标准因果 mask，保证当前位置只能看到自己和之前的位置。
    attention_mask = torch.tensor(
        [
            [[[1, 0, 0], [1, 1, 0], [1, 1, 1]]],
            [[[1, 0, 0], [1, 1, 0], [1, 1, 1]]],
        ],
        dtype=torch.int64,
    )

    model = MutiHeadAttention(hidden_size=8, num_heads=2)

    # 方式一：一次性输入完整序列，并配合因果 mask 和 RoPE 计算输出。
    full_output, _ = model(hidden_state, attention_mask)

    # 方式二：逐个 token 解码，并通过 KV Cache 复用历史的 key 和 value。
    # 由于每一步都会按真实位置加入 RoPE，因此结果应与全量计算一致。
    past_key_value = None
    step_outputs = []
    for step in range(hidden_state.size(1)):
        current_hidden_state = hidden_state[:, step : step + 1, :]
        step_output, past_key_value = model(
            current_hidden_state,
            past_key_value=past_key_value,
            use_cache=True,
        )
        step_outputs.append(step_output)

    cache_output = torch.cat(step_outputs, dim=1)

    # 比较全量计算和 KV Cache 增量解码的结果是否一致。
    max_diff = (full_output - cache_output).abs().max().item()
    is_same = torch.allclose(full_output, cache_output, atol=1e-6)

    print("输入张量形状:", hidden_state.shape)
    print("Mask 张量形状:", attention_mask.shape)
    print("全量计算输出形状:", full_output.shape)
    print("KV Cache 输出形状:", cache_output.shape)
    print("最终 Key Cache 形状:", past_key_value[0].shape)
    print("最终 Value Cache 形状:", past_key_value[1].shape)
    print("最大误差:", max_diff)
    print("两种方式输出是否一致:", is_same)
    print("第一个 batch 的全量计算输出结果:")
    print(full_output[0])
    print("第一个 batch 的 KV Cache 输出结果:")
    print(cache_output[0])
```

#### MQA

```python
import math
import torch
from torch import nn

class MutiQueryAttention(torch.nn.Module):
    def __init__(self, hidden_size, num_heads):
        super(MutiQueryAttention, self).__init__()
        if hidden_size % num_heads != 0:
            raise ValueError("hidden_size 必须能够被 num_heads 整除。")

        # 保存查询头数，以及每个头对应的特征维度。
        self.num_heads = num_heads
        self.head_dim = hidden_size // num_heads

        # Query 仍然保留多头投影，而 Key 和 Value 只保留一组共享投影。
        self.q_linear = nn.Linear(hidden_size, hidden_size)
        self.k_linear = nn.Linear(hidden_size, self.head_dim)
        self.v_linear = nn.Linear(hidden_size, self.head_dim)

        # 多个查询头的结果拼接后，再映射回原始隐藏维度。
        self.o_linear = nn.Linear(hidden_size, hidden_size)

    def forward(self, hidden_state, attention_mask=None):
        # hidden_state 形状: [batch_size, seq_len, hidden_size]
        batch_size = hidden_state.size(0)

        # 先得到 Q、K、V 的线性投影结果。
        query = self.q_linear(hidden_state)
        key = self.k_linear(hidden_state)
        value = self.v_linear(hidden_state)

        # Query 按 num_heads 拆分；Key 和 Value 只拆成 1 组共享头。
        query = query.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)
        key = key.view(batch_size, -1, 1, self.head_dim).transpose(1, 2)
        value = value.view(batch_size, -1, 1, self.head_dim).transpose(1, 2)

        # 把共享的 K、V 扩展到每个查询头上，体现 MQA 的核心思想。
        key = key.expand(-1, self.num_heads, -1, -1)
        value = value.expand(-1, self.num_heads, -1, -1)

        # 计算缩放点积注意力分数。
        attention_scores = torch.matmul(query, key.transpose(-1, -2)) / math.sqrt(self.head_dim)

        # 如果提供 mask，就将被屏蔽的位置置为负无穷。
        if attention_mask is not None:
            attention_scores = attention_scores.masked_fill(attention_mask == 0, float("-inf"))

        # 在最后一维做 softmax，得到注意力权重。
        attention_probs = torch.softmax(attention_scores, dim=-1)

        # 用注意力权重对 Value 做加权求和。
        output = torch.matmul(attention_probs, value)

        # 将多个头拼接回 [batch_size, seq_len, hidden_size]。
        output = output.transpose(1, 2).contiguous().view(
            batch_size, -1, self.head_dim * self.num_heads
        )

        # 通过输出层得到最终结果。
        output = self.o_linear(output)
        return output


if __name__ == "__main__":
    # 构造一个简单样例:
    # batch_size = 2, seq_len = 4, hidden_size = 8, num_heads = 2
    hidden_state = torch.randn(2, 4, 8)

    # attention_mask 形状为 [batch_size, 1, seq_len, seq_len]，
    # 1 表示该位置可见，0 表示该位置被屏蔽。
    # attention_mask = torch.tensor(
    #     [
    #         [[[1, 1, 1, 1], [1, 1, 1, 0], [1, 1, 0, 0], [1, 0, 0, 0]]],
    #         [[[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]]],
    #     ],
    #     dtype=torch.int64,
    # )

    # 因果掩码
    # shape: (seq_len, seq_len), 上三角为 0, 下三角为 1
    # causal_mask = torch.tril(torch.ones(seq_len, seq_len)).view(1, 1, seq_len, seq_len)
    attention_mask = torch.tril(torch.ones(4, 4)).view(1, 1, 4, 4)

    model = MutiQueryAttention(hidden_size=8, num_heads=2)
    output = model(hidden_state, attention_mask)

    print("输入张量形状:", hidden_state.shape)
    print("Mask 张量形状:", attention_mask.shape)
    print("输出张量形状:", output.shape)
    print("第一个 batch 的输出结果:")
    print(output[0])
```

#### GQA

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class GroupQueryAttention(nn.Module):
    def __init__(self, embed_dim=512, num_heads=8, groups=2):
        super().__init__()
        if embed_dim % num_heads != 0:
            raise ValueError("embed_dim 必须能够被 num_heads 整除。")
        if num_heads % groups != 0:
            raise ValueError("num_heads 必须能够被 groups 整除。")

        # 保存隐藏维度、头数和分组数。
        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.groups = groups
        self.head_dim = embed_dim // num_heads
        self.group_heads = num_heads // groups

        # Query 仍然保持 num_heads 个头，
        # 而 Key 和 Value 只投影出 groups 组共享表示。
        self.q_proj = nn.Linear(embed_dim, embed_dim)
        self.k_proj = nn.Linear(embed_dim, self.groups * self.head_dim)
        self.v_proj = nn.Linear(embed_dim, self.groups * self.head_dim)

        # 多头结果拼接后，再通过输出层映射回 embed_dim。
        self.out_proj = nn.Linear(embed_dim, embed_dim)

    def forward(self, x, attention_mask=None):
        # x 的形状为 [batch_size, seq_len, embed_dim]。
        batch_size, seq_len, _ = x.size()

        # 把输入投影为 query、key、value。
        q = self.q_proj(x)
        k = self.k_proj(x)
        v = self.v_proj(x)

        # Query 拆成 num_heads 个头。
        # 形状变为 [batch_size, num_heads, seq_len, head_dim]。
        q = q.view(batch_size, seq_len, self.num_heads, self.head_dim).transpose(1, 2)

        # Key 和 Value 只拆成 groups 组共享表示。
        # Key 调整为 [batch_size, groups, head_dim, seq_len]，
        # Value 调整为 [batch_size, groups, seq_len, head_dim]。
        k = k.view(batch_size, seq_len, self.groups, self.head_dim).permute(0, 2, 3, 1)
        v = v.view(batch_size, seq_len, self.groups, self.head_dim).transpose(1, 2)

        # 将每组共享的 K、V 扩展到该组内的多个 Query 头上。
        k = k.unsqueeze(2).expand(-1, -1, self.group_heads, -1, -1).contiguous()
        k = k.view(batch_size, self.num_heads, self.head_dim, seq_len)

        v = v.unsqueeze(2).expand(-1, -1, self.group_heads, -1, -1).contiguous()
        v = v.view(batch_size, self.num_heads, seq_len, self.head_dim)

        # 计算缩放点积注意力分数。
        attn_scores = torch.matmul(q, k) / (self.head_dim ** 0.5)

        # 如果传入 attention_mask，则把不需要关注的位置置为负无穷。
        # attention_mask 的形状为 [batch_size, 1, seq_len, seq_len]。
        if attention_mask is not None:
            attn_scores = attn_scores.masked_fill(attention_mask == 0, float("-inf"))

        # 对最后一维做 softmax，得到注意力权重。
        attn_weights = F.softmax(attn_scores, dim=-1)

        # 注意力权重与 value 相乘，得到每个头的输出。
        output = torch.matmul(attn_weights, v)

        # 把多个头重新拼接回原始隐藏维度。
        output = output.transpose(1, 2).contiguous().view(batch_size, seq_len, -1)

        # 输出层做一次线性变换，得到最终结果。
        return self.out_proj(output)


if __name__ == "__main__":
    # 构造一个用于验证的输入：
    # batch_size = 2, seq_len = 4, embed_dim = 8, num_heads = 4, groups = 2
    hidden_state = torch.randn(2, 4, 8)

    # attention_mask 形状为 [batch_size, 1, seq_len, seq_len]，
    # 其中 1 表示当前位置可见，0 表示当前位置被屏蔽。
    # attention_mask = torch.tensor(
    #     [
    #         [[[1, 1, 1, 1], [1, 1, 1, 0], [1, 1, 0, 0], [1, 0, 0, 0]]],
    #         [[[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]]],
    #     ],
    #     dtype=torch.int64,
    # )

    # 因果掩码
    # shape: (seq_len, seq_len), 上三角为 0, 下三角为 1
    # causal_mask = torch.tril(torch.ones(seq_len, seq_len)).view(1, 1, seq_len, seq_len)
    attention_mask = torch.tril(torch.ones(4, 4)).view(1, 1, 4, 4)

    model = GroupQueryAttention(embed_dim=8, num_heads=4, groups=2)
    output = model(hidden_state, attention_mask)

    print("输入张量形状:", hidden_state.shape)
    print("Attention Mask 形状:", attention_mask.shape)
    print("输出张量形状:", output.shape)
    print("第一个 batch 的输出结果:")
    print(output[0])
```

#### MLA

```python
import math
import torch
from torch import nn

class MultiLatentAttention(torch.nn.Module):
    def __init__(self, hidden_size, num_heads, latent_size):
        super(MultiLatentAttention, self).__init__()
        if hidden_size % num_heads != 0:
            raise ValueError("hidden_size 必须能够被 num_heads 整除。")

        # 保存头数，以及每个注意力头分到的特征维度。
        self.num_heads = num_heads
        self.head_dim = hidden_size // num_heads
        self.latent_size = latent_size

        # RoPE 需要把每两个维度作为一组做旋转，因此 head_dim 必须是偶数。
        if self.head_dim % 2 != 0:
            raise ValueError("使用 RoPE 时，head_dim 必须是偶数。")

        # Query 仍然直接从 hidden_state 投影得到。
        self.q_linear = nn.Linear(hidden_size, hidden_size)

        # MLA 的核心：先把 K/V 相关信息压缩到低维潜空间，
        # 推理时缓存这个低维 latent，而不是缓存完整的 K/V。
        self.kv_down = nn.Linear(hidden_size, latent_size)

        # 需要参与注意力计算时，再从低维 latent 恢复出 K 和 V。
        self.k_up = nn.Linear(latent_size, hidden_size)
        self.v_up = nn.Linear(latent_size, hidden_size)

        # 多头结果拼接后，再通过输出层映射回 hidden_size。
        self.o_linear = nn.Linear(hidden_size, hidden_size)

    def rotate_half(self, x):
        # 把最后一维两两分组后做旋转：
        # [x1, x2] -> [-x2, x1]
        x1 = x[..., ::2]
        x2 = x[..., 1::2]
        return torch.stack((-x2, x1), dim=-1).flatten(-2)

    def apply_rope(self, x, position_ids):
        # 根据位置下标构造 cos 和 sin，并对 query 或 key 做旋转位置编码。
        inv_freq = 1.0 / (
            10000
            ** (
                torch.arange(0, self.head_dim, 2, device=x.device, dtype=torch.float32)
                / self.head_dim
            )
        )

        freqs = torch.outer(position_ids.to(torch.float32), inv_freq)
        cos = freqs.cos().repeat_interleave(2, dim=-1).unsqueeze(0).unsqueeze(0).to(x.dtype)
        sin = freqs.sin().repeat_interleave(2, dim=-1).unsqueeze(0).unsqueeze(0).to(x.dtype)

        return x * cos + self.rotate_half(x) * sin

    def forward(self, hidden_state, attention_mask=None, past_key_value=None, use_cache=False):
        # hidden_state 的形状为 [batch_size, seq_len, hidden_size]。
        batch_size = hidden_state.size(0)
        seq_len = hidden_state.size(1)

        # 把输入投影为 query。
        query = self.q_linear(hidden_state)

        # MLA 不直接缓存完整的 K/V，而是先压缩成低维潜表示。
        current_latent = self.kv_down(hidden_state)

        # 如果传入 past_key_value，就把历史的 latent
        # 与当前时刻的 latent 在序列维度上拼接起来。
        if past_key_value is not None:
            latent_cache = torch.cat([past_key_value, current_latent], dim=1)
        else:
            latent_cache = current_latent

        # 需要参与注意力计算时，再从 latent 中恢复出完整的 key 和 value。
        key = self.k_up(latent_cache)
        value = self.v_up(latent_cache)

        # 将 query、key、value 拆成多头，
        # 形状变为 [batch_size, num_heads, seq_len, head_dim]。
        query = query.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)
        key = key.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)
        value = value.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)

        # 当前 query 的位置需要接在历史 cache 之后。
        past_seq_len = 0 if past_key_value is None else past_key_value.size(1)
        query_position_ids = torch.arange(
            past_seq_len, past_seq_len + seq_len, device=hidden_state.device
        )

        # 所有 key 的位置则覆盖完整的历史长度。
        key_position_ids = torch.arange(latent_cache.size(1), device=hidden_state.device)

        # 对 query 和 key 加入 RoPE 旋转位置编码。
        query = self.apply_rope(query, query_position_ids)
        key = self.apply_rope(key, key_position_ids)

        # 如果需要使用 MLA Cache，就把当前累计的 latent 保存下来。
        present_key_value = latent_cache if use_cache else None

        # 计算缩放点积注意力分数。
        attention_scores = torch.matmul(query, key.transpose(-1, -2)) / math.sqrt(self.head_dim)

        # 如果传入 mask，则把不需要关注的位置置为负无穷。
        if attention_mask is not None:
            attention_scores = attention_scores.masked_fill(attention_mask == 0, float("-inf"))

        # 对最后一维做 softmax，得到注意力权重。
        attention_probs = torch.softmax(attention_scores, dim=-1)

        # 注意力权重与 value 相乘，得到每个头的输出。
        output = torch.matmul(attention_probs, value)

        # 把多个头重新拼接回原始隐藏维度。
        output = output.transpose(1, 2).contiguous().view(
            batch_size, -1, self.head_dim * self.num_heads
        )

        # 输出层做一次线性变换，得到最终结果。
        output = self.o_linear(output)
        return output, present_key_value


if __name__ == "__main__":
    # 构造一个用于验证的输入:
    # batch_size = 2, seq_len = 3, hidden_size = 8, num_heads = 2, latent_size = 4
    hidden_state = torch.randn(2, 3, 8)

    # attention_mask 形状为 [batch_size, 1, seq_len, seq_len]，
    # 这里使用标准因果 mask，保证当前位置只能看到自己和之前的位置。
    attention_mask = torch.tril(torch.ones(3, 3)).view(1, 1, 3, 3)

    model = MultiLatentAttention(hidden_size=8, num_heads=2, latent_size=4)

    # 方式一：一次性输入完整序列，并配合因果 mask 和 RoPE 计算输出。
    full_output, _ = model(hidden_state, attention_mask)

    # 方式二：逐个 token 解码，并通过 MLA Cache 复用历史的低维 latent。
    # 由于每一步都会按真实位置加入 RoPE，因此结果应与全量计算一致。
    past_key_value = None
    step_outputs = []
    for step in range(hidden_state.size(1)):
        current_hidden_state = hidden_state[:, step : step + 1, :]
        step_output, past_key_value = model(
            current_hidden_state,
            past_key_value=past_key_value,
            use_cache=True,
        )
        step_outputs.append(step_output)

    cache_output = torch.cat(step_outputs, dim=1)

    # 比较全量计算和 MLA Cache 增量解码的结果是否一致。
    max_diff = (full_output - cache_output).abs().max().item()
    is_same = torch.allclose(full_output, cache_output, atol=1e-6)

    # 对比标准 MHA 的 K/V Cache 和 MLA 的 latent cache 大小。
    full_kv_cache_elements = (
        hidden_state.size(0) * model.num_heads * hidden_state.size(1) * model.head_dim * 2
    )
    mla_cache_elements = past_key_value.numel()
    compression_ratio = mla_cache_elements / full_kv_cache_elements

    print("输入张量形状:", hidden_state.shape)
    print("Mask 张量形状:", attention_mask.shape)
    print("全量计算输出形状:", full_output.shape)
    print("MLA Cache 输出形状:", cache_output.shape)
    print("最终 MLA Cache 形状:", past_key_value.shape)
    print("标准 MHA KV Cache 元素个数:", full_kv_cache_elements)
    print("MLA Cache 元素个数:", mla_cache_elements)
    print("MLA Cache / MHA KV Cache:", compression_ratio)
    print("最大误差:", max_diff)
    print("两种方式输出是否一致:", is_same)
    print("第一个 batch 的全量计算输出结果:")
    print(full_output[0])
    print("第一个 batch 的 MLA Cache 输出结果:")
    print(cache_output[0])
```

### 归一化层

#### LayerNorm

**第一步：计算最后一维上的均值**

$$
\mu = \frac{1}{d}\sum_{i=1}^{d} x_i
$$

**第二步：计算最后一维上的方差**

$$
\sigma^2 = \frac{1}{d}\sum_{i=1}^{d}(x_i-\mu)^2
$$

**第三步：做标准化**

$$
 \hat x_i = \frac{x_i-\mu}{\sqrt{\sigma^2+\epsilon}}
$$

**第四步：可学习仿射变换**

$$
 y_i = \gamma_i \hat x_i + \beta_i
$$

```python
import torch
from torch import nn

class LayerNorm(nn.Module):
    def __init__(self, d_model, eps=1e-5):
        super(LayerNorm, self).__init__()

        # 保存特征维度以及数值稳定项
        self.d_model = d_model
        self.eps = eps

        # 可学习的缩放参数和偏移参数
        self.gamma = nn.Parameter(torch.ones(d_model))
        self.beta = nn.Parameter(torch.zeros(d_model))

    def forward(self, x):
        # x 的形状为 [batch_size, seq_len, d_model]

        # 第一步：计算最后一维上的均值
        # mean 的形状为 [batch_size, seq_len, 1]
        mean = x.mean(dim=-1, keepdim=True)

        # 第二步：计算每个样本在最后一维上的方差
        # LayerNorm 通常使用 unbiased=False
        # var 的形状为 [batch_size, seq_len, 1]
        var = x.var(dim=-1, keepdim=True, unbiased=False)

        # 第三步：做标准化，使最后一维变为零均值、单位方差
        x_norm = (x - mean) / torch.sqrt(var + self.eps)

        # 第四步：应用可学习的仿射变换
        return x_norm * self.gamma + self.beta


if __name__ == "__main__":
    # 构造测试输入
    # batch_size = 2, seq_len = 3, d_model = 4
    x = torch.randn(2, 3, 4)

    model = LayerNorm(d_model=4)
    output = model(x)

    # 使用 PyTorch 官方 LayerNorm 做对照验证
    official_model = nn.LayerNorm(normalized_shape=4, eps=1e-5)
    official_output = official_model(x)

    # 默认初始化下，两者都应等价
    max_diff = (output - official_output).abs().max().item()
    same_as_official = torch.allclose(output, official_output, atol=1e-6)

    # 额外验证：归一化后最后一维的均值应接近 0，方差应接近 1
    output_mean = output.mean(dim=-1)
    output_var = output.var(dim=-1, unbiased=False)

    print("输入张量形状:", x.shape)
    print("输出张量形状:", output.shape)
    print("与官方 LayerNorm 的最大误差:", max_diff)
    print("是否与官方 LayerNorm 一致:", same_as_official)
    print("归一化后每个位置的均值:")
    print(output_mean)
    print("归一化后每个位置的方差:")
    print(output_var)
    print("第一个 batch 的输出:")
    print(output[0])
```

#### RMSNorm

**第一步：计算最后一维的均方值**

$$
\frac{1}{d}\sum_{i=1}^{d} x_i^2
$$

**第二步：计算 RMS 的倒数**

$$
\frac{1}{\sqrt{\frac{1}{d}\sum_i x_i^2 + \epsilon}}
$$

**第三步：做 RMS 缩放归一化**

$$
\hat x = x \cdot \frac{1}{\sqrt{\frac{1}{d}\sum_i x_i^2 + \epsilon}}
$$

**第四步：乘可学习参数 gamma**

$$
y_i = \gamma_i \hat x_i
$$

```python
import torch
from torch import nn

class RMSNorm(nn.Module):
    def __init__(self, d_model, eps=1e-8):
        super(RMSNorm, self).__init__()

        # 保存特征维度以及数值稳定项
        self.d_model = d_model
        self.eps = eps

        # 可学习的缩放参数
        self.gamma = nn.Parameter(torch.ones(d_model))

    def rms_norm(self, x):
        # x 的形状为 [batch_size, seq_len, d_model]

        # 第一步：计算每个样本在最后一维上的均方值
        # mean_square 的形状为 [batch_size, seq_len, 1]
        mean_square = x.float().pow(2).mean(dim=-1, keepdim=True)

        # 第二步：计算 RMS 的倒数
        # rsqrt 的形状为 [batch_size, seq_len, 1]
        rsqrt = torch.rsqrt(mean_square + self.eps)

        # 第三步：只做缩放归一化，不做均值中心化
        return x.float() * rsqrt

    def forward(self, x):
        # x 的形状为 [batch_size, seq_len, d_model]
        x_norm = self.rms_norm(x)

        # 第四步：恢复输入数据类型并应用可学习的缩放参数
        return x_norm.type_as(x) * self.gamma.type_as(x)


if __name__ == "__main__":
    # 构造测试输入
    # batch_size = 2, seq_len = 3, d_model = 4
    x = torch.randn(2, 3, 4)

    model = RMSNorm(d_model=4)
    output = model(x)

    # 额外验证：默认 gamma=1 时，输出最后一维的 RMS 应接近 1
    output_rms = torch.sqrt(output.float().pow(2).mean(dim=-1))
    max_rms_diff = (output_rms - 1.0).abs().max().item()
    rms_is_one = torch.allclose(output_rms, torch.ones_like(output_rms), atol=1e-5)

    print("输入张量形状:", x.shape)
    print("输出张量形状:", output.shape)
    print("归一化后每个位置的 RMS:")
    print(output_rms)
    print("RMS 与 1 的最大误差:", max_rms_diff)
    print("RMS 是否接近 1:", rms_is_one)
    print("第一个 batch 的输出:")
    print(output[0])
```

#### 各种Norm示例

```python
# BatchNorm2d
import torch

x = torch.randn((2, 3, 4, 4)).float()  # 随机生成形状为 (2, 3, 4, 4) 的浮点数张量  N C W H
# 生成一个 4D 张量，形状为 (2, 3, 4, 4)，表示一个批次包含 2 个样本，每个样本有 3 个通道，每个通道的尺寸为 4x4
mean = x.mean(dim=(0, 2, 3), keepdim=True)  # 对 (0, 2, 3) 维度进行均值计算，得到均值张量，保持维度
std = x.std(dim=(0, 2, 3), keepdim=True, unbiased=False)  # 对 (0, 2, 3) 维度计算标准差，设置 unbiased=False 即使用 N 计算方差

# 创建一个 BatchNorm2d 层，affine=False 说明不使用可训练的缩放因子和偏置
bn = torch.nn.BatchNorm2d(3, affine=False, track_running_stats=True)
bn.running_mean = torch.ones(3)  # 设置 running_mean 为全 1
bn.running_var = torch.ones(3)  # 设置 running_var 为全 1
bn.training = True  # 设置模型为训练模式
y1 = bn(x)  # 使用 BatchNorm2d 进行标准化
y2 = (x - mean) / std  # 手动计算标准化过程
print(torch.allclose(y1, y2))  # 检查两者是否相等

# BatchNorm1d
import torch

x = torch.randn((2, 3, 4)).double()  # 随机生成一个形状为 (2, 3, 4) 的双精度浮点数张量
mean = x.mean(dim=(0, 2), keepdim=True)  # 对 (0, 2) 维度计算均值
std = x.std(dim=(0, 2), keepdim=True, unbiased=False)  # 对 (0, 2) 维度计算标准差

# 创建一个 BatchNorm1d 层
bn = torch.nn.BatchNorm1d(3, affine=False, track_running_stats=True)
bn.running_mean = torch.ones(3).double()  # 设置 running_mean 为全 1
bn.running_var = torch.ones(3).double()  # 设置 running_var 为全 1
bn.training = True  # 设置模型为训练模式
y1 = bn(x)  # 使用 BatchNorm1d 进行标准化
y2 = (x - mean) / std  # 手动计算标准化过程
print(torch.allclose(y1, y2, atol=1e-5))  # 检查两者是否相等，允许误差为 1e-5
torch.sum(torch.abs(y1 - y2))  # 计算两者的差异，便于调试

# 批量测试 BatchNorm1d
x = torch.randn((100, 4)).double()  # 随机生成一个形状为 (100, 4) 的双精度浮点数张量
mean = x.mean(dim=(0,), keepdim=True)  # 对第 0 维（batch 维度）计算均值
std = x.std(dim=(0,), keepdim=True, unbiased=False)  # 对第 0 维计算标准差
bn = torch.nn.BatchNorm1d(4, affine=False, track_running_stats=True).double()  # 创建一个 BatchNorm1d 层
bn.training = True  # 设置模型为训练模式
y1 = bn(x)  # 使用 BatchNorm1d 进行标准化
y2 = (x - mean) / std  # 手动计算标准化过程
print(torch.allclose(y1, y2))  # 检查两者是否相等

# GroupNorm
import torch

x = torch.randn((100, 64, 16, 16)).double()  # 随机生成一个形状为 (100, 64, 16, 16) 的双精度浮点数张量
alpha = torch.randn(64).double()  # 随机生成一个形状为 (64) 的张量，作为缩放因子
beta = torch.randn(64).double()  # 随机生成一个形状为 (64) 的张量，作为偏移量
norm = torch.nn.GroupNorm(num_groups=2, num_channels=64, affine=True).double()  # 创建一个 GroupNorm 层，num_groups=2
print(norm.weight.shape, norm.bias.shape, norm.weight.data.dtype)  # 打印缩放因子和偏移量的形状及数据类型
norm.weight.data = alpha  # 手动设置缩放因子
norm.bias.data = beta  # 手动设置偏移量
y1 = norm(x)  # 使用 GroupNorm 进行标准化
x = x.view(100, 2, 32, 16, 16)  # 调整输入张量形状，以适应 GroupNorm 的要求
mean = x.mean(dim=(2, 3, 4), keepdim=True)  # 对 (2, 3, 4) 维度计算均值
vars = x.var(dim=(2, 3, 4), keepdim=True, unbiased=False) + 1e-5  # 对 (2, 3, 4) 维度计算标准差
y2 = (x - mean) / vars.sqrt()  # 手动计算标准化
y2 = y2.view(100, 64, 16, 16) * alpha.view(1, 64, 1, 1) + beta.view(1, 64, 1, 1)  # 应用缩放因子和偏移量
print(torch.allclose(y1, y2))  # 检查两者是否相等

# LayerNorm
import torch

x = torch.randn((100, 4, 256)).double()  # 随机生成一个形状为 (100, 4, 256) 的双精度浮点数张量
mean = x.mean(dim=-1, keepdim=True)  # 对最后一个维度计算均值
std = x.std(dim=(-1), keepdim=True, unbiased=False)  # 对最后一个维度计算标准差
norm = torch.nn.LayerNorm(256, elementwise_affine=True).double()  # 创建一个 LayerNorm 层
print(norm.weight.shape, norm.bias.shape)  # 打印缩放因子和偏移量的形状
y1 = norm(x)  # 使用 LayerNorm 进行标准化
y2 = (x - mean) / std  # 手动计算标准化过程
print(torch.allclose(y1, y2))  # 检查两者是否相等

# RMSNorm
import torch

x = torch.randn((100, 4, 256)).double()  # 随机生成一个形状为 (100, 4, 256) 的双精度浮点数张量
rms = torch.sqrt(torch.mean(x.pow(2), dim=-1, keepdim=True))  # 计算 RMS（均方根）值
norm = torch.nn.RMSNorm(256, elementwise_affine=True).double()  # 创建一个 RMSNorm 层
print(norm.weight.shape)  # 打印缩放因子的形状
y1 = norm(x)  # 使用 RMSNorm 进行标准化
y2 = x / rms  # 手动计算标准化过程
print(torch.allclose(y1, y2))  # 检查两者是否相等
```

### 前馈网络

#### FFN

```python
import torch
from torch import nn

class FFN(nn.Module):
    def __init__(self, d_model, hidden, dropout=0.1):
        super().__init__()

        # 第一个线性层: d_model -> hidden
        self.fc1 = nn.Linear(d_model, hidden)
        # 第二个线性层: hidden -> d_model
        self.fc2 = nn.Linear(hidden, d_model)
        # Dropout 层用于缓解过拟合
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        # x 形状: [batch_size, seq_len, d_model]
        output = self.fc1(x)
        output = torch.relu(output)
        output = self.dropout(output)
        output = self.fc2(output)
        return output


if __name__ == "__main__":
    # 构造测试输入:
    # batch_size = 2, seq_len = 4, d_model = 8
    x = torch.randn(2, 4, 8)

    model = FFN(d_model=8, hidden=16, dropout=0.1)
    output = model(x)
    same_shape = x.shape == output.shape

    print("输入张量形状:", x.shape)
    print("输出张量形状:", output.shape)
    print("输入输出形状是否一致:", same_shape)
    print("第一个 batch 的输出结果:")
    print(output[0])
```

#### SwiGLUFFN

```python
import torch
from torch import nn

class SwiGLU(nn.Module):
    def __init__(self, d_model, hidden):
        super().__init__()

        # 门控分支: d_model -> hidden
        self.w_gate = nn.Linear(d_model, hidden, bias=False)
        # 上投影分支: d_model -> hidden
        self.w_up = nn.Linear(d_model, hidden, bias=False)
        # 下投影分支: hidden -> d_model
        self.w_down = nn.Linear(hidden, d_model, bias=False)

    def forward(self, x):
        # x 形状: [batch_size, seq_len, d_model]

        # 门控分支先经过 SiLU 激活
        gate = torch.nn.functional.silu(self.w_gate(x))
        # 上投影分支不加激活
        up = self.w_up(x)

        # 两个分支逐元素相乘后，再映射回原始维度
        output = self.w_down(gate * up)
        return output


if __name__ == "__main__":
    # 构造测试输入:
    # batch_size = 2, seq_len = 4, d_model = 8
    x = torch.randn(2, 4, 8)

    model = SwiGLU(d_model=8, hidden=16)
    output = model(x)
    same_shape = x.shape == output.shape

    # 额外验证: 手动拆分公式计算，结果应与 forward 一致
    gate = torch.nn.functional.silu(model.w_gate(x))
    up = model.w_up(x)
    manual_output = model.w_down(gate * up)
    same_as_manual = torch.allclose(output, manual_output, atol=1e-6)

    print("输入张量形状:", x.shape)
    print("输出张量形状:", output.shape)
    print("输入输出形状是否一致:", same_shape)
    print("是否与手动计算结果一致:", same_as_manual)
    print("第一个 batch 的输出结果:")
    print(output[0])
```

#### MoE

```python
import torch
from torch import nn

class FFN(nn.Module):
    def __init__(self, d_model, hidden, dropout=0.0):
        super().__init__()

        # 第一个线性层: d_model -> hidden
        self.fc1 = nn.Linear(d_model, hidden)
        # 第二个线性层: hidden -> d_model
        self.fc2 = nn.Linear(hidden, d_model)
        # 专家内部默认不使用 Dropout，这里保留接口便于扩展
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        # x 形状: [num_tokens, d_model]
        output = self.fc1(x)
        output = torch.relu(output)
        output = self.dropout(output)
        output = self.fc2(output)
        return output


class MoE(nn.Module):
    def __init__(self, d_model, num_experts, top_k):
        super().__init__()
        if top_k <= 0:
            raise ValueError("top_k 必须大于 0。")
        if top_k > num_experts:
            raise ValueError("top_k 必须小于等于 num_experts。")

        hidden = d_model * 4
        self.top_k = top_k

        # 路由层: 计算每个 token 对每个专家的打分
        self.router = nn.Linear(d_model, num_experts, bias=False)

        # 专家列表: 每个专家都是一个和 1.FFN.py 一致的 FFN
        self.experts = nn.ModuleList(
            [FFN(d_model=d_model, hidden=hidden, dropout=0.0) for _ in range(num_experts)]
        )

    def forward(self, x):
        # x 形状: [batch_size, seq_len, d_model]
        batch_size, seq_len, d_model = x.shape

        # 展平后按 token 进行路由
        x_flat = x.view(-1, d_model)

        # 计算每个 token 对所有专家的路由分数
        router_logits = self.router(x_flat)

        # 选择得分最高的 top_k 个专家
        top_k_logits, top_k_indices = torch.topk(router_logits, self.top_k, dim=-1)

        # 对 top_k 分数做 softmax，得到归一化后的专家权重
        top_k_weight = torch.softmax(top_k_logits, dim=-1)

        # 初始化输出张量
        output = torch.zeros_like(x_flat)

        # 遍历每个专家，只处理被路由到该专家的 token
        for i, expert in enumerate(self.experts):
            # expert_mask 形状: [batch_size * seq_len, top_k]
            expert_mask = top_k_indices == i

            # token_indices 表示 token 下标，top_k_pos 表示该专家在 top_k 中的位置
            token_indices, top_k_pos = torch.where(expert_mask)

            if token_indices.numel() == 0:
                continue

            # 取出当前专家需要处理的 token
            expert_input = x_flat[token_indices]

            # 计算当前专家的输出
            expert_output = expert(expert_input)

            # 取出这些 token 分配给当前专家的权重
            expert_weight = top_k_weight[token_indices, top_k_pos]

            # 按权重对专家输出进行缩放
            weighted_expert_output = expert_output * expert_weight.unsqueeze(-1)

            # 将当前专家的结果累加回最终输出
            output.index_add_(0, token_indices, weighted_expert_output)

        # 恢复原始形状: [batch_size, seq_len, d_model]
        return output.view(batch_size, seq_len, d_model)


if __name__ == "__main__":
    # 构造测试输入:
    # batch_size = 2, seq_len = 4, d_model = 8
    x = torch.randn(2, 4, 8)

    model = MoE(d_model=8, num_experts=4, top_k=2)
    output = model(x)
    same_shape = x.shape == output.shape

    # 额外验证: top_k 专家的权重经过 softmax 后，每个 token 的权重和应接近 1
    x_flat = x.view(-1, 8)
    router_logits = model.router(x_flat)
    top_k_logits, _ = torch.topk(router_logits, model.top_k, dim=-1)
    top_k_weight = torch.softmax(top_k_logits, dim=-1)
    weight_sum = top_k_weight.sum(dim=-1)
    weight_sum_is_one = torch.allclose(weight_sum, torch.ones_like(weight_sum), atol=1e-6)

    print("输入张量形状:", x.shape)
    print("输出张量形状:", output.shape)
    print("输入输出形状是否一致:", same_shape)
    print("每个 token 的 top_k 权重和是否为 1:", weight_sum_is_one)
    print("第一个 batch 的输出结果:")
    print(output[0])
```

### 位置编码

#### 旋转位置编码RoPE

**第一步：预先计算不同位置的角频率**

$$
\theta_i = \frac{1}{\theta^{2i/d}}
$$

位置为 $m$ 时，对应角度就是：

$$
m \cdot \theta_i
$$

所以 `freqs` 的形状是：

$$
[max\_seq\_len,\ head\_dim]
$$

每一行代表一个位置，每两维共享同一个旋转角度。

**第二步：`rotate_half` 实现二维旋转里的交换项**

$$
[x_1, x_2] \rightarrow [-x_2, x_1]
$$

**第三步：应用 RoPE**

这一步对应二维旋转公式：

$$
\begin{pmatrix}
x_1' \\
x_2'
\end{pmatrix}
=
\begin{pmatrix}
x_1 \cos\phi - x_2 \sin\phi \\
x_2 \cos\phi + x_1 \sin\phi
\end{pmatrix}
$$

代码写法等价于：

$$
x' = x \odot \cos\phi + \text{rotate\_half}(x) \odot \sin\phi
$$

其中：

- `x * cos` 对应旋转里的 $\cos$ 项
- `rotate_half(x) * sin` 对应旋转里的 $\sin$ 项

所以这一步就是把每个位置的 `Q/K` 做旋转。

**第四步：为只对 Query 和 Key 加 RoPE**

attention 分数是由 `QK^T` 决定的

```python
import torch
from torch import nn

class RoPE(torch.nn.Module):
    def __init__(self, head_dim, max_seq_len=2048, theta=10000.0):
        super(RoPE, self).__init__()
        if head_dim % 2 != 0:
            raise ValueError("使用 RoPE 时，head_dim 必须是偶数。")

        # 保存每个注意力头的维度、最大序列长度以及 RoPE 的基数
        self.head_dim = head_dim
        self.max_seq_len = max_seq_len
        self.theta = theta

        # 预先计算不同位置对应的 cos 和 sin，避免前向重复计算
        cos, sin = self.precompute_freqs(head_dim, max_seq_len, theta)
        self.register_buffer("cos", cos, persistent=False)
        self.register_buffer("sin", sin, persistent=False)

    def precompute_freqs(self, head_dim, max_seq_len, theta):
        # 第一步：预先计算不同位置的角频率
        # 计算逆频率，形状为 [head_dim / 2]
        inv_freq = 1.0 / (theta ** (torch.arange(0, head_dim, 2).float() / head_dim))

        # 构造位置下标，形状为 [max_seq_len]
        position_ids = torch.arange(max_seq_len, device=inv_freq.device, dtype=torch.float32)

        # 计算每个位置与每个频率对应的旋转角度，形状为 [max_seq_len, head_dim / 2]
        freqs = torch.outer(position_ids, inv_freq)

        # 将每组角度复制一份，扩展到完整的 head_dim
        freqs = freqs.repeat_interleave(2, dim=-1)

        return freqs.cos(), freqs.sin()

    # 第二步：`rotate_half` 实现二维旋转里的交换项
    def rotate_half(self, x):
        # 将最后一维按两个元素一组做旋转
        # [x1, x2] -> [-x2, x1]
        x1 = x[..., ::2]
        x2 = x[..., 1::2]
        return torch.stack((-x2, x1), dim=-1).flatten(-2)

    # 第三步：应用 RoPE
    def apply_rope(self, x):
        # x 的形状为 [batch_size, num_heads, seq_len, head_dim]
        seq_len = x.size(2)

        # 取出当前序列长度对应的 cos 和 sin
        # 形状变为 [1, 1, seq_len, head_dim]，便于广播
        cos = self.cos[:seq_len].unsqueeze(0).unsqueeze(0).to(x.dtype)
        sin = self.sin[:seq_len].unsqueeze(0).unsqueeze(0).to(x.dtype)

        # 应用旋转位置编码
        return x * cos + self.rotate_half(x) * sin

    # 第四步：为只对 Query 和 Key 加 RoPE
    def forward(self, query, key):
        # 对 query 和 key 加入 RoPE
        rope_query = self.apply_rope(query)
        rope_key = self.apply_rope(key)
        return rope_query, rope_key


if __name__ == "__main__":
    # 构造测试输入
    # batch_size = 2, num_heads = 2, seq_len = 3, head_dim = 4
    query = torch.randn(2, 2, 3, 4)
    key = torch.randn(2, 2, 3, 4)

    model = RoPE(head_dim=4, max_seq_len=8)
    rope_query, rope_key = model(query, key)

    # 额外验证：位置 0 时 cos = 1、sin = 0
    # 因此第 0 个位置经过 RoPE 后应保持不变
    q_pos0_diff = (query[:, :, 0, :] - rope_query[:, :, 0, :]).abs().max().item()
    k_pos0_diff = (key[:, :, 0, :] - rope_key[:, :, 0, :]).abs().max().item()
    q_pos0_same = torch.allclose(query[:, :, 0, :], rope_query[:, :, 0, :], atol=1e-6)
    k_pos0_same = torch.allclose(key[:, :, 0, :], rope_key[:, :, 0, :], atol=1e-6)

    print("输入 Query 张量形状:", query.shape)
    print("输入 Key 张量形状:", key.shape)
    print("输出 Query 张量形状:", rope_query.shape)
    print("输出 Key 张量形状:", rope_key.shape)
    print("位置 0 的 Query 最大误差:", q_pos0_diff)
    print("位置 0 的 Key 最大误差:", k_pos0_diff)
    print("位置 0 的 Query 是否保持不变:", q_pos0_same)
    print("位置 0 的 Key 是否保持不变:", k_pos0_same)
    print("第一个 batch 第一个头旋转后的 Query:")
    print(rope_query[0, 0])
```

#### 绝对位置编码PE

```python
import math
import torch

class PositionalEncoding(torch.nn.Module):
    def __init__(self, d_model, max_seq_len=5000, base=10000.0):
        super(PositionalEncoding, self).__init__()
        if d_model % 2 != 0:
            raise ValueError("使用正弦位置编码时，d_model 必须是偶数。")

        # 保存嵌入维度、最大序列长度以及位置编码的基数
        self.d_model = d_model
        self.max_seq_len = max_seq_len
        self.base = base

        # 预先计算位置编码矩阵，避免前向传播时重复计算
        position_encoding = self.precompute_pe(d_model, max_seq_len, base)
        self.register_buffer("position_encoding", position_encoding, persistent=False)

    def precompute_pe(self, d_model, max_seq_len, base):
        # 初始化位置编码矩阵，形状为 [max_seq_len, d_model]
        position_encoding = torch.zeros(max_seq_len, d_model)

        # 构造位置下标，形状为 [max_seq_len, 1]
        position_ids = torch.arange(max_seq_len, dtype=torch.float32).unsqueeze(1)

        # 计算不同维度对应的缩放项，形状为 [d_model / 2]
        div_term = torch.exp(
            torch.arange(0, d_model, 2, dtype=torch.float32) * -(math.log(base) / d_model)
        )

        # 偶数维使用 sin，奇数维使用 cos
        position_encoding[:, 0::2] = torch.sin(position_ids * div_term)
        position_encoding[:, 1::2] = torch.cos(position_ids * div_term)

        # 扩展 batch 维，方便与输入张量对齐
        return position_encoding.unsqueeze(0)

    def forward(self, x):
        # x 的形状为 [batch_size, seq_len, d_model]
        seq_len = x.size(1)
        if seq_len > self.max_seq_len:
            raise ValueError(f"序列长度 {seq_len} 超过最大长度 {self.max_seq_len}。")

        return self.position_encoding[:, :seq_len].to(x.dtype)


if __name__ == "__main__":
    # 构造测试输入
    # batch_size = 2, seq_len = 4, d_model = 6
    x = torch.randn(2, 4, 6)

    model = PositionalEncoding(d_model=6, max_seq_len=8)
    position_encoding = model(x)
    output = x + position_encoding

    # 额外验证：位置 0 时，sin(0)=0、cos(0)=1
    expected_pos0 = torch.tensor([0.0, 1.0, 0.0, 1.0, 0.0, 1.0], dtype=position_encoding.dtype)
    pos0_diff = (position_encoding[0, 0] - expected_pos0).abs().max().item()
    pos0_same = torch.allclose(position_encoding[0, 0], expected_pos0, atol=1e-6)

    print("输入张量形状:", x.shape)
    print("位置编码形状:", position_encoding.shape)
    print("输出张量形状:", output.shape)
    print("位置 0 的位置编码:", position_encoding[0, 0])
    print("位置 0 的最大误差:", pos0_diff)
    print("位置 0 是否符合预期:", pos0_same)
    print("第一个 batch 加上位置编码后的输出:")
    print(output[0])
```

### Encoder Block

```python
import math
import torch
from torch import nn

class MutiHeadAttention(nn.Module):
    def __init__(self, hidden_size, num_heads):
        super().__init__()
        if hidden_size % num_heads != 0:
            raise ValueError("hidden_size 必须能够被 num_heads 整除。")

        # 保存头数，以及每个注意力头对应的特征维度
        self.num_heads = num_heads
        self.head_dim = hidden_size // num_heads

        # 分别定义 Q、K、V 的线性映射层
        self.q_linear = nn.Linear(hidden_size, hidden_size)
        self.k_linear = nn.Linear(hidden_size, hidden_size)
        self.v_linear = nn.Linear(hidden_size, hidden_size)

        # 多头结果拼接后，再映射回原始隐藏维度
        self.o_linear = nn.Linear(hidden_size, hidden_size)

    def forward(self, hidden_state, attention_mask=None):
        # hidden_state 形状: [batch_size, seq_len, hidden_size]
        batch_size = hidden_state.size(0)

        # 将输入映射为 query、key、value
        query = self.q_linear(hidden_state)
        key = self.k_linear(hidden_state)
        value = self.v_linear(hidden_state)

        # 将每个张量拆成多头，形状变为 [batch_size, num_heads, seq_len, head_dim]
        query = query.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)
        key = key.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)
        value = value.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)

        # 计算缩放点积注意力分数
        attention_scores = torch.matmul(query, key.transpose(-1, -2)) / math.sqrt(self.head_dim)

        # 如果传入 mask，则把被屏蔽的位置置为负无穷
        if attention_mask is not None:
            attention_scores = attention_scores.masked_fill(attention_mask == 0, float("-inf"))

        # 对最后一维做 softmax，得到注意力权重
        attention_probs = torch.softmax(attention_scores, dim=-1)

        # 注意力权重与 value 相乘，得到每个头的输出
        output = torch.matmul(attention_probs, value)

        # 将多个头重新拼接回原始隐藏维度
        output = output.transpose(1, 2).contiguous().view(
            batch_size, -1, self.head_dim * self.num_heads
        )

        # 通过输出层得到最终结果
        output = self.o_linear(output)
        return output


class LayerNorm(nn.Module):
    def __init__(self, d_model, eps=1e-5):
        super().__init__()

        # 保存特征维度以及数值稳定项
        self.d_model = d_model
        self.eps = eps

        # 可学习的缩放参数和偏移参数
        self.gamma = nn.Parameter(torch.ones(d_model))
        self.beta = nn.Parameter(torch.zeros(d_model))

    def forward(self, x):
        # x 形状: [batch_size, seq_len, d_model]
        mean = x.mean(dim=-1, keepdim=True)
        var = x.var(dim=-1, keepdim=True, unbiased=False)
        x_norm = (x - mean) / torch.sqrt(var + self.eps)
        return x_norm * self.gamma + self.beta


class FFN(nn.Module):
    def __init__(self, d_model, hidden, dropout=0.1):
        super().__init__()

        # 第一个线性层: d_model -> hidden
        self.fc1 = nn.Linear(d_model, hidden)
        # 第二个线性层: hidden -> d_model
        self.fc2 = nn.Linear(hidden, d_model)
        # Dropout 层用于缓解过拟合
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        # x 形状: [batch_size, seq_len, d_model]
        output = self.fc1(x)
        output = torch.relu(output)
        output = self.dropout(output)
        output = self.fc2(output)
        return output


class EncoderBlock(nn.Module):
    def __init__(self, d_model, num_heads, hidden, dropout=0.1):
        super().__init__()

        # 多头自注意力层
        self.self_attention = MutiHeadAttention(hidden_size=d_model, num_heads=num_heads)
        # 两个 LayerNorm，分别用于注意力子层和 FFN 子层之后
        self.ln1 = LayerNorm(d_model=d_model)
        self.ln2 = LayerNorm(d_model=d_model)
        # 前馈网络
        self.ffn = FFN(d_model=d_model, hidden=hidden, dropout=dropout)
        # 残差连接后的 Dropout
        self.dropout = nn.Dropout(dropout)

    def forward(self, x, attention_mask=None):
        # x 形状: [batch_size, seq_len, d_model]

        # 自注意力子层: Attention -> Dropout -> Residual -> LayerNorm
        attention_output = self.self_attention(x, attention_mask)
        x = x + self.dropout(attention_output)
        x = self.ln1(x)

        # 前馈网络子层: FFN -> Dropout -> Residual -> LayerNorm
        ffn_output = self.ffn(x)
        x = x + self.dropout(ffn_output)
        x = self.ln2(x)
        return x


if __name__ == "__main__":
    # 构造测试输入:
    # batch_size = 2, seq_len = 4, d_model = 8
    x = torch.randn(2, 4, 8)

    # 构造一个全可见的 attention_mask
    attention_mask = torch.ones(1, 1, 4, 4)

    model = EncoderBlock(d_model=8, num_heads=2, hidden=16, dropout=0.1)
    output = model(x, attention_mask)
    same_shape = x.shape == output.shape

    print("输入张量形状:", x.shape)
    print("Mask 张量形状:", attention_mask.shape)
    print("输出张量形状:", output.shape)
    print("输入输出形状是否一致:", same_shape)
    print("第一个 batch 的输出结果:")
    print(output[0])
```

### Decoder Block

```python
import math
import torch
from torch import nn

class MutiHeadAttention(nn.Module):
    def __init__(self, hidden_size, num_heads):
        super().__init__()
        if hidden_size % num_heads != 0:
            raise ValueError("hidden_size 必须能够被 num_heads 整除。")

        # 保存头数，以及每个注意力头对应的特征维度
        self.num_heads = num_heads
        self.head_dim = hidden_size // num_heads

        # 分别定义 Q、K、V 的线性映射层
        self.q_linear = nn.Linear(hidden_size, hidden_size)
        self.k_linear = nn.Linear(hidden_size, hidden_size)
        self.v_linear = nn.Linear(hidden_size, hidden_size)

        # 多头结果拼接后，再映射回原始隐藏维度
        self.o_linear = nn.Linear(hidden_size, hidden_size)

    def forward(self, hidden_state, attention_mask=None):
        # hidden_state 形状: [batch_size, seq_len, hidden_size]
        batch_size = hidden_state.size(0)

        # 将输入映射为 query、key、value
        query = self.q_linear(hidden_state)
        key = self.k_linear(hidden_state)
        value = self.v_linear(hidden_state)

        # 将每个张量拆成多头，形状变为 [batch_size, num_heads, seq_len, head_dim]
        query = query.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)
        key = key.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)
        value = value.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)

        # 计算缩放点积注意力分数
        attention_scores = torch.matmul(query, key.transpose(-1, -2)) / math.sqrt(self.head_dim)

        # 如果传入 mask，则把被屏蔽的位置置为负无穷
        if attention_mask is not None:
            attention_scores = attention_scores.masked_fill(attention_mask == 0, float("-inf"))

        # 对最后一维做 softmax，得到注意力权重
        attention_probs = torch.softmax(attention_scores, dim=-1)

        # 注意力权重与 value 相乘，得到每个头的输出
        output = torch.matmul(attention_probs, value)

        # 将多个头重新拼接回原始隐藏维度
        output = output.transpose(1, 2).contiguous().view(
            batch_size, -1, self.head_dim * self.num_heads
        )

        # 通过输出层得到最终结果
        output = self.o_linear(output)
        return output


class CrossAttention(nn.Module):
    def __init__(self, d_model, num_heads):
        super().__init__()
        if d_model % num_heads != 0:
            raise ValueError("d_model 必须能够被 num_heads 整除。")

        # 保存头数，以及每个注意力头对应的特征维度
        self.num_heads = num_heads
        self.head_dim = d_model // num_heads

        # Query 来自解码器输入，Key 和 Value 来自编码器输出
        self.q_linear = nn.Linear(d_model, d_model)
        self.k_linear = nn.Linear(d_model, d_model)
        self.v_linear = nn.Linear(d_model, d_model)

        # 多头结果拼接后，再映射回原始隐藏维度
        self.o_linear = nn.Linear(d_model, d_model)

    def forward(self, x, encoder_output, attention_mask=None):
        # x 形状: [batch_size, target_seq_len, d_model]
        # encoder_output 形状: [batch_size, source_seq_len, d_model]
        batch_size = x.size(0)

        # Query 由解码器输入生成，Key 和 Value 由编码器输出生成
        query = self.q_linear(x)
        key = self.k_linear(encoder_output)
        value = self.v_linear(encoder_output)

        # 将 query、key、value 拆成多头
        query = query.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)
        key = key.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)
        value = value.view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)

        # 计算缩放点积注意力分数
        attention_scores = torch.matmul(query, key.transpose(-1, -2)) / math.sqrt(self.head_dim)

        # 如果传入 mask，则把被屏蔽的位置置为负无穷
        if attention_mask is not None:
            attention_scores = attention_scores.masked_fill(attention_mask == 0, float("-inf"))

        # 对最后一维做 softmax，得到注意力权重
        attention_probs = torch.softmax(attention_scores, dim=-1)

        # 注意力权重与 value 相乘，得到交叉注意力输出
        output = torch.matmul(attention_probs, value)

        # 将多个头重新拼接回原始隐藏维度
        output = output.transpose(1, 2).contiguous().view(
            batch_size, -1, self.head_dim * self.num_heads
        )

        # 通过输出层得到最终结果
        output = self.o_linear(output)
        return output


class LayerNorm(nn.Module):
    def __init__(self, d_model, eps=1e-5):
        super().__init__()

        # 保存特征维度以及数值稳定项
        self.d_model = d_model
        self.eps = eps

        # 可学习的缩放参数和偏移参数
        self.gamma = nn.Parameter(torch.ones(d_model))
        self.beta = nn.Parameter(torch.zeros(d_model))

    def forward(self, x):
        # x 形状: [batch_size, seq_len, d_model]
        mean = x.mean(dim=-1, keepdim=True)
        var = x.var(dim=-1, keepdim=True, unbiased=False)
        x_norm = (x - mean) / torch.sqrt(var + self.eps)
        return x_norm * self.gamma + self.beta


class FFN(nn.Module):
    def __init__(self, d_model, hidden, dropout=0.1):
        super().__init__()

        # 第一个线性层: d_model -> hidden
        self.fc1 = nn.Linear(d_model, hidden)
        # 第二个线性层: hidden -> d_model
        self.fc2 = nn.Linear(hidden, d_model)
        # Dropout 层用于缓解过拟合
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        # x 形状: [batch_size, seq_len, d_model]
        output = self.fc1(x)
        output = torch.relu(output)
        output = self.dropout(output)
        output = self.fc2(output)
        return output


class DecoderBlock(nn.Module):
    def __init__(self, d_model, num_heads, hidden, dropout=0.1):
        super().__init__()

        # 掩码自注意力层
        self.self_attention = MutiHeadAttention(hidden_size=d_model, num_heads=num_heads)
        # 编码器-解码器交叉注意力层
        self.cross_attention = CrossAttention(
            d_model=d_model, num_heads=num_heads
        )
        # 三个 LayerNorm，分别用于三个子层之后
        self.ln1 = LayerNorm(d_model=d_model)
        self.ln2 = LayerNorm(d_model=d_model)
        self.ln3 = LayerNorm(d_model=d_model)
        # 前馈网络
        self.ffn = FFN(d_model=d_model, hidden=hidden, dropout=dropout)
        # 残差连接后的 Dropout
        self.dropout = nn.Dropout(dropout)

    def forward(self, x, encoder_output, self_attention_mask=None, cross_attention_mask=None):
        # x 形状: [batch_size, target_seq_len, d_model]
        # encoder_output 形状: [batch_size, source_seq_len, d_model]

        # 掩码自注意力子层: Attention -> Dropout -> Residual -> LayerNorm
        self_attention_output = self.self_attention(x, self_attention_mask)
        x = x + self.dropout(self_attention_output)
        x = self.ln1(x)

        # 编码器-解码器交叉注意力子层: Attention -> Dropout -> Residual -> LayerNorm
        encoder_decoder_output = self.cross_attention(
            x, encoder_output, cross_attention_mask
        )
        x = x + self.dropout(encoder_decoder_output)
        x = self.ln2(x)

        # 前馈网络子层: FFN -> Dropout -> Residual -> LayerNorm
        ffn_output = self.ffn(x)
        x = x + self.dropout(ffn_output)
        x = self.ln3(x)
        return x


if __name__ == "__main__":
    # 构造测试输入:
    # batch_size = 2, target_seq_len = 4, source_seq_len = 5, d_model = 8
    x = torch.randn(2, 4, 8)
    encoder_output = torch.randn(2, 5, 8)

    # 构造解码器自注意力掩码
    self_attention_mask = torch.tril(torch.ones(4, 4)).view(1, 1, 4, 4)
    # 构造交叉注意力掩码，这里设为全可见
    cross_attention_mask = torch.ones(1, 1, 4, 5)

    model = DecoderBlock(d_model=8, num_heads=2, hidden=16, dropout=0.1)
    output = model(x, encoder_output, self_attention_mask, cross_attention_mask)
    same_shape = x.shape == output.shape

    print("解码器输入张量形状:", x.shape)
    print("编码器输出张量形状:", encoder_output.shape)
    print("自注意力 Mask 张量形状:", self_attention_mask.shape)
    print("交叉注意力 Mask 张量形状:", cross_attention_mask.shape)
    print("输出张量形状:", output.shape)
    print("输入输出形状是否一致:", same_shape)
    print("第一个 batch 的输出结果:")
    print(output[0])
```

## 微调

### LoRA

第一步：冻结原始线性层

第二步：增加低秩分支

第三步：加缩放因子

$$
\frac{\alpha}{r}
$$

第四步：初始化方式

- `A` 用普通初始化
- `B` 初始化为 0

$$
\Delta W = BA = 0
$$

第五步：前向传播

$$
\text{output} = \text{原始线性层输出} + \text{LoRA增量输出}
$$

$$
y = Wx + \frac{\alpha}{r}BAx
$$

```python
import math
import torch
from torch import nn

class LoRALinear(nn.Module):
    def __init__(self, in_features, out_features, rank=8, alpha=1.0, dropout=0.0):
        super().__init__()
        if rank <= 0:
            raise ValueError("rank 必须大于 0。")

        self.rank = rank
        self.alpha = alpha

        # 原始线性层，训练时冻结
        self.linear = nn.Linear(in_features, out_features, bias=False)
        self.linear.weight.requires_grad = False

        # LoRA 的低秩矩阵:
        # A: in_features -> rank
        # B: rank -> out_features
        self.lora_a = nn.Linear(in_features, rank, bias=False)
        self.lora_b = nn.Linear(rank, out_features, bias=False)

        # 缩放因子: alpha / rank
        self.scaling = alpha / rank
        self.dropout = nn.Dropout(dropout)

        self.reset_parameters()

    def reset_parameters(self):
        # A 使用 Kaiming 均匀初始化
        nn.init.kaiming_uniform_(self.lora_a.weight, a=math.sqrt(5))

        # B 初始化为 0，保证初始时 LoRA 分支输出为 0
        nn.init.zeros_(self.lora_b.weight)

    def forward(self, x):
        # x 形状: [batch_size, seq_len, in_features]

        # 原始线性层输出
        linear_output = self.linear(x)

        # LoRA 分支输出: x -> dropout -> A -> B -> scaling
        lora_output = self.lora_b(self.lora_a(self.dropout(x))) * self.scaling

        # 合并原始输出和 LoRA 增量输出
        output = linear_output + lora_output
        return output


if __name__ == "__main__":
    # 构造测试输入:
    # batch_size = 2, seq_len = 5, in_features = 10
    x = torch.randn(2, 5, 10)

    model = LoRALinear(in_features=10, out_features=20, rank=4, alpha=4.0, dropout=0.0)
    output = model(x)
    expected_shape = (2, 5, 20)
    same_shape = output.shape == expected_shape

    # 额外验证: 初始状态下 lora_b 为 0，因此整体输出应与原始线性层输出一致
    linear_output = model.linear(x)
    max_diff = (output - linear_output).abs().max().item()
    same_as_linear = torch.allclose(output, linear_output, atol=1e-6)

    print("输入张量形状:", x.shape)
    print("输出张量形状:", output.shape)
    print("输出形状是否符合预期:", same_shape)
    print("原始线性层权重是否冻结:", not model.linear.weight.requires_grad)
    print("初始状态是否与原始线性层输出一致:", same_as_linear)
    print("初始状态的最大误差:", max_diff)
    print("第一个 batch 的输出结果:")
    print(output[0])
```

### SFT

此处按下一个 token 预测对齐 logits 与标签，只对回答部分计算损失。调用者需将 padding 标签设为 `-100`，并保证整个批次至少有一个有效目标 token；全部忽略的批次不应参与这一步均值损失计算。

```python
import torch
import torch.nn.functional as F
from torch import nn

class SFTLoss(nn.Module):
    def __init__(self):
        super().__init__()

    def forward(self, logits, labels, prompt_lengths):
        # 复制一份标签，避免直接修改原始输入
        masked_labels = labels.clone()

        # 将每条样本中 prompt 对应的位置屏蔽掉，不参与损失计算
        for batch_idx, prompt_length in enumerate(prompt_lengths):
            if isinstance(prompt_length, torch.Tensor):
                prompt_length = prompt_length.item()
            masked_labels[batch_idx, :prompt_length] = -100

        # 语言模型做下一个 token 预测：
        # 当前时刻的 logits 对齐下一个时刻的 labels
        shift_logits = logits[:, :-1, :].contiguous()
        shift_labels = masked_labels[:, 1:].contiguous()

        # 交叉熵要求输入形状为 [N, C]，标签形状为 [N]
        vocab_size = shift_logits.size(-1)
        loss = F.cross_entropy(
            shift_logits.view(-1, vocab_size),
            shift_labels.view(-1),
            ignore_index=-100,
        )
        return loss


if __name__ == "__main__":
    # 固定随机种子，保证每次运行输出一致，便于验证
    torch.manual_seed(42)

    # 构造测试输入
    # batch_size = 2, seq_len = 6, vocab_size = 8
    logits = torch.randn(2, 6, 8)
    labels = torch.tensor(
        [
            [1, 2, 3, 4, 5, 6],
            [0, 1, 2, 3, 4, 5],
        ]
    )
    prompt_lengths = torch.tensor([2, 3])

    criterion = SFTLoss()
    loss = criterion(logits, labels, prompt_lengths)

    # 手动构造一份屏蔽后的标签，用来展示哪些位置参与了损失计算
    masked_labels = labels.clone()
    for batch_idx, prompt_length in enumerate(prompt_lengths):
        if isinstance(prompt_length, torch.Tensor):
            prompt_length = prompt_length.item()
        masked_labels[batch_idx, :prompt_length] = -100

    shift_labels = masked_labels[:, 1:]
    valid_token_count = (shift_labels != -100).sum().item()
    is_scalar = loss.ndim == 0
    is_finite = torch.isfinite(loss).item()

    print("logits 形状:", logits.shape)
    print("labels 形状:", labels.shape)
    print("prompt_lengths:", prompt_lengths)
    print("屏蔽后的 labels:")
    print(masked_labels)
    print("参与损失计算的 token 数量:", valid_token_count)
    print("loss 是否为标量:", is_scalar)
    print("loss 是否为有限值:", is_finite)
    print("SFT loss:", loss.item())
```

## 损失函数

### 交叉熵

- 二分类交叉熵： $$L_{BCE}=-\frac{1}{N}\sum_{i=1}^N[y_ilog(\hat{y_i})+(1−y_i)log(1−\hat{y_i})]$$
- 多分类交叉熵： $$L_{CCE}=-\frac{1}{N}\sum_{i=1}^N\sum_{c=1}^Cy_{i,c}log(\hat{y}_{i,c})$$

第一步：先做 `log_softmax`：原始 `logits` 变成每个类别的对数概率

$$
\log p_{i,c}
$$

第二步：取出真实类别对应的对数概率

$$
-\log(\hat y_{i,t_i})
$$

第三步：对 batch 求平均

```python
import torch
import torch.nn.functional as F

def cross_entropy_loss(logits, targets):
    # 第一步：计算 log softmax
    # log_probs 形状: [batch_size, num_classes]
    log_probs = F.log_softmax(logits, dim=-1)

    # 第二步：取出每个样本真实类别对应的对数概率
    batch_size = logits.size(0)
    batch_indices = torch.arange(batch_size, device=logits.device)

    # loss 形状: [batch_size]
    loss = -log_probs[batch_indices, targets]

    # 第三步：对 batch 内所有样本求平均
    return loss.mean()


if __name__ == "__main__":
    # 构造测试输入
    logits = torch.tensor(
        [
            [2.0, 1.0, 0.1],
            [0.5, 1.5, 2.5],
            [3.0, 0.2, 0.1],
        ]
    )
    targets = torch.tensor([0, 2, 1])

    loss = cross_entropy_loss(logits, targets)

    # 用 PyTorch 自带实现做对照，验证结果是否一致
    torch_loss = F.cross_entropy(logits, targets)
    same_as_torch = torch.allclose(loss, torch_loss, atol=1e-6)

    print("logits 形状:", logits.shape)
    print("targets 形状:", targets.shape)
    print("logits:")
    print(logits)
    print("targets:", targets)
    print("手写交叉熵损失:", loss.item())
    print("PyTorch 交叉熵损失:", torch_loss.item())
    print("两者是否一致:", same_as_torch)
```

### 均方误差MSE

$$
L_{\mathrm{MSE}} = \frac{1}{N} \sum_{i=1}^{N}(\hat{y}_i-y_i)^2
$$

```python
import torch
import torch.nn.functional as F

def mse_loss(preds, targets):
    # 第一步：计算预测值与真实值的差
    # diff 形状: [batch_size, ...]
    diff = preds - targets

    # 第二步：对差值逐元素平方
    # squared_diff 形状: [batch_size, ...]
    squared_diff = diff ** 2

    # 第三步：对所有元素求平均
    return squared_diff.mean()


if __name__ == "__main__":
    # 构造测试输入
    preds = torch.tensor(
        [
            [2.5, 0.0, 2.0],
            [1.0, 2.0, 3.0],
        ]
    )
    targets = torch.tensor(
        [
            [3.0, -0.5, 2.0],
            [1.0, 1.0, 4.0],
        ]
    )

    loss = mse_loss(preds, targets)

    # 用 PyTorch 自带实现做对照，验证结果是否一致
    torch_loss = F.mse_loss(preds, targets)
    same_as_torch = torch.allclose(loss, torch_loss, atol=1e-6)

    print("preds 形状:", preds.shape)
    print("targets 形状:", targets.shape)
    print("preds:")
    print(preds)
    print("targets:")
    print(targets)
    print("手写 MSE 损失:", loss.item())
    print("PyTorch MSE 损失:", torch_loss.item())
    print("两者是否一致:", same_as_torch)
```

### KL散度

衡量真实分布P和近似分布Q之间的差异

$$
D_{KL}(P \| Q) = \sum_i P(i) \left(\log P(i) - \log Q(i)\right)
$$

第一步：把 logits 变成对数概率

$$
 \log P(i), \quad \log Q(i)
$$

第二步：把 `p_logits` 变成概率分布

$$
P(i)
$$

第三步：按定义逐项求和

$$
D_{KL}(P \| Q) = \sum_i P(i)(\log P(i) - \log Q(i))
$$

第四步：对 batch 求平均

```python
import torch
import torch.nn.functional as F

def kl_divergence(p_logits, q_logits):
    # 第一步：计算两个分布的 log softmax
    # p_log_probs 形状: [batch_size, num_classes]
    # q_log_probs 形状: [batch_size, num_classes]
    p_log_probs = F.log_softmax(p_logits, dim=-1)
    q_log_probs = F.log_softmax(q_logits, dim=-1)

    # 第二步：计算分布 P 的概率分布
    # p_probs 形状: [batch_size, num_classes]
    p_probs = F.softmax(p_logits, dim=-1)

    # 第三步：根据公式 KL(P || Q) = sum(P * (logP - logQ)) 计算 KL 散度
    # kl_loss 形状: [batch_size]
    kl_loss = torch.sum(p_probs * (p_log_probs - q_log_probs), dim=-1)

    # 对 batch 内所有样本求平均
    return kl_loss.mean()


if __name__ == "__main__":
    # 构造测试输入
    p_logits = torch.tensor(
        [
            [2.0, 1.0, 0.1],
            [0.5, 1.5, 2.5],
        ]
    )
    q_logits = torch.tensor(
        [
            [1.5, 0.5, 0.3],
            [0.2, 1.0, 1.8],
        ]
    )

    loss = kl_divergence(p_logits, q_logits)

    # 用 PyTorch 自带实现做对照，验证结果是否一致
    p_probs = F.softmax(p_logits, dim=-1)
    q_log_probs = F.log_softmax(q_logits, dim=-1)
    torch_loss = F.kl_div(q_log_probs, p_probs, reduction="batchmean")
    same_as_torch = torch.allclose(loss, torch_loss, atol=1e-6)

    print("p_logits 形状:", p_logits.shape)
    print("q_logits 形状:", q_logits.shape)
    print("p_logits:")
    print(p_logits)
    print("q_logits:")
    print(q_logits)
    print("手写 KL 散度:", loss.item())
    print("PyTorch KL 散度:", torch_loss.item())
    print("两者是否一致:", same_as_torch)
```

### softmax激活函数

$$
\operatorname{softmax}(x)_i = \frac{e^{x_i}}{\sum_{j=1}^{N}e^{x_j}}
$$

```python
import torch
import torch.nn.functional as F

def softmax(logits):
    # 第一步：计算每个样本的最大值，提升数值稳定性
    # max_logits 形状: [batch_size, 1]
    max_logits, _ = torch.max(logits, dim=-1, keepdim=True)

    # 第二步：减去最大值后再计算指数，避免 exp 溢出
    # exp_shifted 形状: [batch_size, num_classes]
    exp_shifted = torch.exp(logits - max_logits)

    # 第三步：计算 softmax 的分母
    # sum_exp 形状: [batch_size, 1]
    sum_exp = torch.sum(exp_shifted, dim=-1, keepdim=True)

    # 第四步：归一化，得到概率分布
    return exp_shifted / sum_exp


if __name__ == "__main__":
    # 构造测试输入
    logits = torch.tensor(
        [
            [2.0, 1.0, 0.1],
            [0.5, 1.5, 2.5],
            [1000.0, 1001.0, 999.0],
        ]
    )

    probs = softmax(logits)

    # 用 PyTorch 自带实现做对照，验证结果是否一致
    torch_probs = F.softmax(logits, dim=-1)
    same_as_torch = torch.allclose(probs, torch_probs, atol=1e-6)

    # 额外验证每一行概率和是否为 1
    row_sums = probs.sum(dim=-1)

    print("logits 形状:", logits.shape)
    print("logits:")
    print(logits)
    print("手写 softmax:")
    print(probs)
    print("PyTorch softmax:")
    print(torch_probs)
    print("每一行概率和:")
    print(row_sums)
    print("两者是否一致:", same_as_torch)
```

### log_softmax

```python
import torch
import torch.nn.functional as F

def log_softmax(logits):
    # 第一步：计算每个样本的最大值，提升数值稳定性
    # max_logits 形状: [batch_size, 1]
    max_logits, _ = torch.max(logits, dim=-1, keepdim=True)

    # 第二步：使用 Log-Sum-Exp 技巧计算分母的对数
    # exp_shifted 形状: [batch_size, num_classes]
    exp_shifted = torch.exp(logits - max_logits)

    # log_sum_exp 形状: [batch_size, 1]
    log_sum_exp = max_logits + torch.log(torch.sum(exp_shifted, dim=-1, keepdim=True))

    # 第三步：计算 log softmax
    return logits - log_sum_exp


if __name__ == "__main__":
    # 构造测试输入
    logits = torch.tensor(
        [
            [2.0, 1.0, 0.1],
            [0.5, 1.5, 2.5],
            [1000.0, 1001.0, 999.0],
        ]
    )

    log_probs = log_softmax(logits)

    # 用 PyTorch 自带实现做对照，验证结果是否一致
    torch_log_probs = F.log_softmax(logits, dim=-1)
    same_as_torch = torch.allclose(log_probs, torch_log_probs, atol=1e-6)

    # 额外验证 exp(log_softmax) 后是否仍为有效概率分布
    probs = torch.exp(log_probs)
    row_sums = probs.sum(dim=-1)

    print("logits 形状:", logits.shape)
    print("logits:")
    print(logits)
    print("手写 log_softmax:")
    print(log_probs)
    print("PyTorch log_softmax:")
    print(torch_log_probs)
    print("exp(log_softmax) 后的概率和:")
    print(row_sums)
    print("两者是否一致:", same_as_torch)
```

## 强化学习

### PPO

目标函数：

$$ \arg \max_{\theta} \mathbb{E}_{s \sim \nu^{\beta}, a \sim \pi_{\theta_k}(\cdot \mid s)} \left[ \min \left( \frac{\pi_{\theta}(a \mid s)}{\pi_{\theta_k}(a \mid s)} A^{\pi_{\theta_k}}(s, a), \text{clip} \left( \frac{\pi_{\theta}(a \mid s)}{\pi_{\theta_k}(a \mid s)}, 1 - \epsilon, 1 + \epsilon \right) A^{\pi_{\theta_k}}(s, a) \right) \right]$$

在提高策略收益的同时，用clip裁剪限制新策略的更新范围。

GAE 估计：

对非终止状态定义 TD 残差，并把不同步长的估计加权：

$$
\begin{aligned}
\delta_t &= r_t + \gamma V(s_{t+1}) - V(s_t), \\
A_t^{(1)} &= \delta_t, \\
A_t^{(2)} &= \delta_t + \gamma\delta_{t+1}, \\
A_t^{(3)} &= \delta_t + \gamma\delta_{t+1} + \gamma^2\delta_{t+2}, \\
A_t^{(k)} &= \sum_{i=0}^{k-1}\gamma^i\delta_{t+i} \\
&= -V(s_t) + \sum_{i=0}^{k-1}\gamma^i r_{t+i} + \gamma^k V(s_{t+k}).
\end{aligned}
$$

在无限时域且 $0\le\lambda<1$ 的推导下：

$$
\begin{aligned}
A_t^{\mathrm{GAE}}
&= (1-\lambda)\sum_{k=1}^{\infty}\lambda^{k-1}A_t^{(k)} \\
&= (1-\lambda)\sum_{i=0}^{\infty}\gamma^i\delta_{t+i}
   \sum_{k=i+1}^{\infty}\lambda^{k-1} \\
&= \sum_{i=0}^{\infty}(\gamma\lambda)^i\delta_{t+i}.
\end{aligned}
$$

有限轨迹使用反向递推；终止状态不自举，截断轨迹则需要另行提供末状态价值。下例假设每条有效轨迹都以真实终止状态结束，右侧 padding 不进入优势递推。

代码分三部分：`advantage_estimate`、`policy_loss`、`value_loss`

**1.`advantage_estimate`：计算 GAE 和 returns**

第一步：定义 TD error

$$
\delta_t = r_t + \gamma V(s_{t+1}) - V(s_t)
$$

第二步：递推 GAE

对应公式：

$$
A_t^{GAE} = \sum_{l=0}^{\infty} (\gamma \lambda)^l \delta_{t+l}
$$

递推写法就是：

$$
A_t^{GAE} = \delta_t + \gamma \lambda A_{t+1}^{GAE}
$$

第三步：计算 returns

$$
\text{return}_t = A_t + V(s_t)
$$

`advantages` 用来更新 Actor，`returns` 用来训练 Critic。实际训练中，旧策略对数概率、优势和目标回报应作为固定目标（在 `torch.no_grad()` 中构造或先 `detach()`），避免梯度回传到目标估计过程。

**2.`policy_loss`：计算 Actor 的 policy loss**

第一步：算新旧策略概率比值

$$
ratio = \frac{\pi_\theta(a_t|s_t)}{\pi_{\theta_k}(a_t|s_t)}
$$

第二步：算未裁剪目标

$$
surr1 = \frac{\pi_\theta(a_t|s_t)}{\pi_{\theta_k}(a_t|s_t)} A_t
$$

第三步：算裁剪后的目标：限制 ratio 不要偏离 1 太远

$$
surr2 =\text{clip}\left(\frac{\pi_\theta(a_t|s_t)}{\pi_{\theta_k}(a_t|s_t)},1-\epsilon,1+\epsilon\right) A_t
$$

第四步：取两者更保守的那个

$$
L_{actor}=-\min(surr1, surr2)
$$

第五步：只对有效 token 求平均

$$
\text{masked\_mean}(x) = \frac{\sum x_t \cdot m_t}{\sum m_t}
$$

**3.`value_loss`：计算 Critic 的 value loss**

第一步：计算 value 和目标回报的 MSE

$$
L_{critic} = (V_\phi(s_t) - \text{return}_t)^2
$$

第二步：对有效位置求平均：只对有效 token 求平均，忽略 padding。

```python
import torch

class PPO:
    def __init__(self, clip=0.2, gamma=1.0, lam=0.95):
        self.clip = clip
        self.gamma = gamma
        self.lam = lam

    def mask_mean(self, loss, mask, dim=-1):
        # 只对有效位置求平均，常用于忽略 padding 位置
        return (loss * mask).sum(dim=dim) / mask.sum(dim=dim).clamp_min(1)

    def advantage_estimate(self, rewards, values, action_mask):
        # 使用 GAE（广义优势估计）计算 advantage 和 return
        batch_size, seq_len = values.shape
        advantages = torch.zeros_like(rewards)
        gae = torch.zeros(batch_size, device=values.device, dtype=values.dtype)

        # 从后往前递推计算每个时间步的优势
        for step in range(seq_len - 1, -1, -1):
            next_mask = action_mask[:, step + 1] if step < seq_len - 1 else 0.0
            next_value = values[:, step + 1] * next_mask if step < seq_len - 1 else 0.0
            # 第一步：定义 TD error
            delta = rewards[:, step] + self.gamma * next_value - values[:, step]
            # 第二步：递推 GAE
            gae = (delta + self.lam * self.gamma * gae * next_mask) * action_mask[:, step]
            advantages[:, step] = gae
        # 第三步：计算 returns
        returns = (advantages + values) * action_mask
        return advantages, returns

    def policy_loss(self, new_log_probs, old_log_probs, advantages, action_mask):
        # PPO 策略损失使用概率比值做裁剪
        # 第一步：算新旧策略概率比值
        ratio = torch.exp(new_log_probs - old_log_probs)
        # 第二步：算未裁剪目标
        surr1 = ratio * advantages
        # 第三步：算裁剪后的目标
        surr2 = torch.clamp(ratio, 1 - self.clip, 1 + self.clip) * advantages
        # 第四步：取两者更保守的那个
        loss = -torch.min(surr1, surr2)
        # 第五步：只对有效 token 求平均
        return self.mask_mean(loss, action_mask).mean()

    def value_loss(self, new_values, returns, action_mask):
        # 值函数损失通常使用均方误差
        # 第一步：计算 value 和目标回报的 MSE
        loss = (new_values - returns) ** 2
        # 第二步：对有效位置求平均
        return self.mask_mean(loss, action_mask).mean()


if __name__ == "__main__":
    # 构造测试输入
    rewards = torch.tensor(
        [
            [1.0, 0.5, -0.2, 0.8],
            [0.3, 1.2, 0.0, -0.5],
        ]
    )
    values = torch.tensor(
        [
            [0.6, 0.4, 0.1, 0.2],
            [0.2, 0.8, 0.3, -0.1],
        ]
    )
    new_log_probs = torch.tensor(
        [
            [-0.2, -0.4, -0.8, -0.3],
            [-0.5, -0.1, -0.6, -0.9],
        ]
    )
    old_log_probs = torch.tensor(
        [
            [-0.3, -0.5, -0.7, -0.4],
            [-0.6, -0.2, -0.5, -1.0],
        ]
    )
    action_mask = torch.tensor(
        [
            [1.0, 1.0, 1.0, 0.0],
            [1.0, 1.0, 0.0, 0.0],
        ]
    )

    ppo = PPO(clip=0.2, gamma=1.0, lam=0.95)
    advantages, returns = ppo.advantage_estimate(rewards, values, action_mask)
    policy_loss = ppo.policy_loss(new_log_probs, old_log_probs, advantages, action_mask)
    value_loss = ppo.value_loss(values, returns, action_mask)

    print("rewards 形状:", rewards.shape)
    print("values 形状:", values.shape)
    print("advantages:")
    print(advantages)
    print("returns:")
    print(returns)
    print("policy loss:", policy_loss.item())
    print("value loss:", value_loss.item())
```

### DPO

损失函数

$$\mathcal{L}_{\text{DPO}}(\pi_{\theta}, \pi_{\text{ref}}) = - \mathbb{E}_{(x, y_w, y_l) \sim \mathcal{D}} \left[ \log \sigma \left( \beta \log \frac{\pi_{\theta}(y_w | x)}{\pi_{\text{ref}}(y_w | x)} - \beta \log \frac{\pi_{\theta}(y_l | x)}{\pi_{\text{ref}}(y_l | x)} \right) \right]$$

DPO 将 KL 正则化奖励优化中的奖励表达代入 Bradley–Terry 偏好模型，得到仅依赖策略和参考策略对数概率的目标。下例实现 DPO 损失，不包含单独的奖励模型或 Critic。输入为回答有效 token 的对数概率之和。

**第一步：先算策略、参考策略内部 chosen 和 rejected 的差**

$$
\log \pi_\theta(y_w|x) - \log \pi_\theta(y_l|x)=\log \frac{\pi_\theta(y_w|x)}{\pi_\theta(y_l|x)}
$$

$$
\log \pi_{\text{ref}}(y_w|x) - \log \pi_{\text{ref}}(y_l|x)=\log \frac{\pi_{\text{ref}}(y_w|x)}{\pi_{\text{ref}}(y_l|x)}
$$

**第二步：两者做差，得到DPO的 logits**

$$
\operatorname{logits}=\left(\log \pi_\theta(y_w|x) - \log \pi_\theta(y_l|x)\right)-\left(\log \pi_{\text{ref}}(y_w|x) - \log \pi_{\text{ref}}(y_l|x)\right)
$$

整理后等价于：

$$
\operatorname{logits}=\log \frac{\pi_\theta(y_w|x)}{\pi_{\text{ref}}(y_w|x)}-\log \frac{\pi_\theta(y_l|x)}{\pi_{\text{ref}}(y_l|x)}
$$

**第三步：用 `-logsigmoid` 做偏好损失**

$$
-\log \sigma(\beta \cdot \operatorname{logits})
$$

**第四步：计算 chosen 和 rejected 对应的奖励信号**

$$
r_\theta(x,y) \propto \beta \left(\log \pi_\theta(y|x) - \log \pi_{\text{ref}}(y|x)\right)
$$

```python
import torch
import torch.nn.functional as F
from torch import nn

class DPOLoss(nn.Module):
    def __init__(self, beta, label_smoothing=0.0):
        super().__init__()
        self.beta = beta
        self.label_smoothing = label_smoothing

    def forward(
        self,
        policy_chosen_logps,
        policy_rejected_logps,
        reference_chosen_logps,
        reference_rejected_logps,
    ):
        # 第一步：分别计算策略模型和参考模型的对数概率差
        policy_logratios = policy_chosen_logps - policy_rejected_logps
        reference_logratios = reference_chosen_logps - reference_rejected_logps

        # 第二步：构造 DPO 的 logits
        logits = policy_logratios - reference_logratios

        # 第三步：根据 DPO 公式计算损失
        losses = (
            -F.logsigmoid(self.beta * logits) * (1 - self.label_smoothing)
            - F.logsigmoid(-self.beta * logits) * self.label_smoothing
        )
        loss = losses.mean()

        # 第四步：计算 chosen 和 rejected 对应的奖励信号
        chosen_rewards = self.beta * (policy_chosen_logps - reference_chosen_logps).detach()
        rejected_rewards = self.beta * (policy_rejected_logps - reference_rejected_logps).detach()

        return loss, chosen_rewards, rejected_rewards


if __name__ == "__main__":
    # 构造测试输入
    policy_chosen_logps = torch.tensor([-0.8, -1.2, -0.5, -1.1])
    policy_rejected_logps = torch.tensor([-1.4, -1.5, -1.1, -1.6])
    reference_chosen_logps = torch.tensor([-1.0, -1.3, -0.7, -1.2])
    reference_rejected_logps = torch.tensor([-1.3, -1.4, -1.0, -1.5])

    criterion = DPOLoss(beta=0.1, label_smoothing=0.0)
    loss, chosen_rewards, rejected_rewards = criterion(
        policy_chosen_logps,
        policy_rejected_logps,
        reference_chosen_logps,
        reference_rejected_logps,
    )

    # 验证输出是否符合预期
    chosen_shape_ok = chosen_rewards.shape == policy_chosen_logps.shape
    rejected_shape_ok = rejected_rewards.shape == policy_rejected_logps.shape
    is_scalar = loss.ndim == 0
    is_finite = torch.isfinite(loss).item()

    print("policy_chosen_logps 形状:", policy_chosen_logps.shape)
    print("policy_rejected_logps 形状:", policy_rejected_logps.shape)
    print("reference_chosen_logps 形状:", reference_chosen_logps.shape)
    print("reference_rejected_logps 形状:", reference_rejected_logps.shape)
    print("loss 是否为标量:", is_scalar)
    print("loss 是否为有限值:", is_finite)
    print("chosen_rewards 形状是否正确:", chosen_shape_ok)
    print("rejected_rewards 形状是否正确:", rejected_shape_ok)
    print("DPO loss:", loss.item())
    print("chosen_rewards:")
    print(chosen_rewards)
    print("rejected_rewards:")
    print(rejected_rewards)
```

### GRPO

这里的 GRPO 示例用同一提示下多个回答的组内奖励标准化估计优势，无需 Critic；KL 惩罚直接加入策略目标。PPO 的 KL 处理方式随实现而异。示例中的组包含两个回答，每个回答一个序列奖励；该优势广播到回答的有效 token。多个提示应分别按组计算，不能把全批次或 token 奖励混为一组。

![2026-03-13_112349](https://raw.githubusercontent.com/1910853272/image/master/img/202603131124603.png)

先进行组内标准化奖励，得到 advantage

$$
\hat A_i = \frac{r_i - \text{mean}(\mathbf r)}{\text{std}(\mathbf r)+\epsilon}
$$

**第一步：计算新旧策略概率比值**

$$
ratio = \frac{\pi_\theta(a_t|s_t)}{\pi_{\theta_{old}}(a_t|s_t)}
$$

**第二步：计算相对参考策略的 KL 项**

代码使用逐 token 的非负估计量。令 $u=\log\pi_{\mathrm{ref}}(a\mid s)-\log\pi_\theta(a\mid s)$，则 $k_3=\exp(u)-u-1$；在动作来自当前策略的期望下，它等于 $D_{\mathrm{KL}}(\pi_\theta\Vert\pi_{\mathrm{ref}})$。下例只演示该估计量；复用旧策略采样的数据时，其期望不再严格等于当前策略 KL，需要结合实际采样与更新方案理解。

$$
\beta D_{KL}[\pi_\theta || \pi_{ref}]
$$

**第三步：构造 clipped surrogate objective**

$$
surr1 = ratio \cdot \hat A
$$

$$
surr2 = \text{clip}(ratio,1-\epsilon,1+\epsilon)\cdot \hat A
$$

**第四步：加入 KL 惩罚项，并只对有效位置求平均**

$$
\min(surr1,surr2)-\beta D_{KL}
$$

```python
import torch

class GRPO:
    def __init__(self, eps=1e-8, clip=0.2, beta=0.1):
        self.eps = eps
        self.clip = clip
        self.beta = beta

    def mask_mean(self, loss, mask, dim=-1):
        # 只对有效位置求平均，常用于忽略 padding 位置
        return (loss * mask).sum(dim=dim) / mask.sum(dim=dim).clamp_min(1)

    def group_advantage(self, rewards):
        # GRPO 常对同组奖励做标准化，得到归一化后的优势
        mean = torch.mean(rewards)
        std = torch.std(rewards, unbiased=False)
        advantages = (rewards - mean) / (std + self.eps)
        return advantages.detach()

    def grpo_loss(self, old_log_probs, new_log_probs, ref_log_probs, advantages, action_mask):
        # 第一步：计算当前策略与旧策略之间的概率比值
        ratio = torch.exp(new_log_probs - old_log_probs)

        # 第二步：计算当前策略相对参考策略的 KL 约束项
        ref_log_ratio = ref_log_probs - new_log_probs
        kl_score = (torch.exp(ref_log_ratio) - ref_log_ratio - 1) * self.beta

        # 第三步：构造裁剪前后的 surrogate objective
        surr1 = ratio * advantages
        surr2 = torch.clamp(ratio, 1 - self.clip, 1 + self.clip) * advantages

        # 第四步：加入 KL 惩罚项，并只对有效位置求平均
        loss = -(torch.min(surr1, surr2) - kl_score)
        return self.mask_mean(loss, action_mask).mean()


if __name__ == "__main__":
    # 构造测试输入
    rewards = torch.tensor([1.2, 0.5])  # 同一提示下两个回答的序列奖励
    old_log_probs = torch.tensor(
        [
            [-0.4, -0.5, -0.7, -0.6],
            [-0.6, -0.2, -0.8, -0.4],
        ]
    )
    new_log_probs = torch.tensor(
        [
            [-0.3, -0.4, -0.6, -0.5],
            [-0.5, -0.1, -0.7, -0.3],
        ]
    )
    ref_log_probs = torch.tensor(
        [
            [-0.35, -0.45, -0.65, -0.55],
            [-0.55, -0.15, -0.75, -0.35],
        ]
    )
    action_mask = torch.tensor(
        [
            [1.0, 1.0, 1.0, 0.0],
            [1.0, 1.0, 0.0, 0.0],
        ]
    )

    grpo = GRPO(eps=1e-8, clip=0.2, beta=0.1)
    advantages = grpo.group_advantage(rewards).unsqueeze(-1)
    loss = grpo.grpo_loss(old_log_probs, new_log_probs, ref_log_probs, advantages, action_mask)

    # 验证输出是否符合预期
    valid_token_count = action_mask.sum().item()
    advantage_mean = advantages.mean().item()
    advantage_std = advantages.std(unbiased=False).item()
    is_scalar = loss.ndim == 0
    is_finite = torch.isfinite(loss).item()

    print("rewards 形状:", rewards.shape)
    print("old_log_probs 形状:", old_log_probs.shape)
    print("new_log_probs 形状:", new_log_probs.shape)
    print("ref_log_probs 形状:", ref_log_probs.shape)
    print("advantages:")
    print(advantages)
    print("有效位置数量:", valid_token_count)
    print("advantages 的均值:", advantage_mean)
    print("advantages 的标准差:", advantage_std)
    print("loss 是否为标量:", is_scalar)
    print("loss 是否为有限值:", is_finite)
    print("GRPO loss:", loss.item())
```
