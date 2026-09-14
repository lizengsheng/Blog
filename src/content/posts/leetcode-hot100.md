---
title: "LeetCode Hot100：Python 题解与 ACM 输入输出笔记"
pubDatetime: 2026-09-14T09:00:00+08:00
featured: false
draft: false
tags:
  - 算法
  - LeetCode
  - Python
description: "按数据结构与算法分类整理 Hot100 题解、扩展练习和 Python ACM 输入输出示例，保留完整代码与解题思路。"
---

本文把 Hot100 题解与补充练习整理在同一篇笔记中，从 ACM 输入输出开始，依次覆盖常见数据结构、搜索与动态规划。可通过目录按分类和题目定位，题目标题保留原题链接。

> 使用说明：题目接口版代码依赖在线评测提供的类型与节点定义；带主函数的代码展示本笔记约定的 ACM 输入输出格式，两者按需选用，不应拼接为一个程序。示例采用 Python 3，`Counter` 的包含比较需要 Python 3.10 或更新版本。题解用于学习，未声称所有实现均已通过在线评测。

## 目录

## ACM输入输出

### 单数据输入输出

```python
# input() 等待用户输入，并返回字符串
# sys.stdin.readline() 可用于快速读取一行
# 字符串：输入为1 2，输出为‘1 2’
s = input()
print(s)

# 整数：输入为3，输出为3
n = int(input())
print(n)

# 浮点数：输入为4，输出为4.0
f = float(input())
print(f)

# print()默认以空格为输出，sep=','是以','为分隔符，假设输入s=‘1 2’,n=3,f=4.0
print(s,n,f)    # 输出‘1 2’ 3 4.0
print(s,n,f,sep=',') #输出1 2’,3,4.0
```

### 一维数组输入

```python
# split() 切割后返回一个列表

# 空字符为分隔符：输入1 2 3 4，输出['1','2','3','4']
nums = input().split()

# ','为为分隔符：输入1,2,3,4，输出['1','2','3','4']
nums = input().split(',')

# 列表进行批量转换：输入1 2 3 4，输出[1,2,3,4]
nums = [int(i) for i in input().split()]

# map迭代器进行并行转换：输入1 2 3 4，输出[1,2,3,4]
nums = list(map(int,input().split()))
```

### 一维数组输出

```python
# 最终结果数组 ans = [1,2,3]

# 1.直接输出数组
print(ans)

# 2.输出列表，每个元素单独输出
for i in range(len(ans)):
  print(ans[i])
# output:1
#                2
#                3

# 3.输出列表，每个元素单独输出在同一行，以空格分隔
for i in range(len(ans)):
  print(ans[i],end=' ')
# output:1 2 3
```

```python
# 最终结果数组 ans = ['a','b','c']
# join()将字符串数组中的元素连成字符串

# 1.输出为一个字符串
print(''.join(ans)) # 输出为字符串abc

# 2.输出为一个字符串，用,分隔
print(','.join(ans)) # 输出为字符串a,b,c


# 最终结果数组 ans = [1,2,3]
# 1.输出为一个字符串
print(''.join(map(str,ans))) # 输出为字符串123

# 2.输出为一个字符串，用空格分隔
print(' '.join(map(str,ans))) #输出为字符串1 2 3
```

### 二维数组输入输出

```python
# 输入:
# 3 3    <-矩阵大小
# 1 2 3  <-第一行
# 4 5 6  <-第二行
# 7 8 9  <-第三行

n,m = map(int,input().split()) #读取矩阵大小
matrix = []

for _ in range(n):
    row = list(map(int, input().split()))
    matrix.append(row)
# 进阶写法(一行搞定)
matrix = [list(map(int, input().split())) for _ in range(n)]

matrix= [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
# 逐行输出
for row in matrix:
    print(' '.join(map(str,row)))

# 输出:
# 1 2 3
# 4 5 6
# 7 8 9
```

### 混合类型输入输出

```python
# 输入:1 apple 3.14 True

mixed = input().split()
result = []

for item in mixed:
    if item.isdigit():
        result.append(int(item))
    elif '.' in item and item.replace('.', '').isdigit():
        result.append(float(item))
    elif item.lower() in ['true', 'false']:
        result.append(item. lower() == 'true')
    else:
        result.append(item)

print(result)  # 输出：[1, 'apple', 3.14, True]
```

### 结构体定义

```python

```

### 练习题

```python
# 单向链表
class ListNode:
    def __init__(self, x):
        self.val = x
        self.next = None

# 二叉树
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
```

## 哈希

### [1. 两数之和](https://leetcode.cn/problems/two-sum/?envType=study-plan-v2&envId=top-100-liked)

给定一个整数数组 `nums` 和一个整数目标值 `target`，请你在该数组中找出 **和为目标值** _`target`_ 的那 **两个** 整数，并返回它们的数组下标。

你可以假设每种输入只会对应一个答案，并且你不能使用两次相同的元素。

你可以按任意顺序返回答案。

```python
import sys
from typing import List

class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        idx = {}  # 创建一个空哈希表（字典）
        for j, x in enumerate(nums):  # x=nums[j]
            if target - x in idx:  # 在左边找 nums[i]，满足 nums[i]+x=target
                return [idx[target - x], j]  # 返回两个数的下标
            idx[x] = j  # 保存 nums[j] 和 j

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    n, target = map(int, input().split())  # 读取数组长度和目标值
    nums = list(map(int, input().split()))  # 读取数组的元素

    # 创建 Solution 实例并调用 twoSum 方法
    solution = Solution()
    result = solution.twoSum(nums, target)

    # 输出结果
    print(result[0], result[1])

# 输入输出示例：
# 输入：
# 4 9
# 2 7 11 15
# 输出：
# 0 1
#
# 解释：
# 数组为 [2, 7, 11, 15]，目标值为 9。
# 2 + 7 = 9， 所以输出下标 [0, 1]。
```

### [49. 字母异位词分组](https://leetcode.cn/problems/group-anagrams/?envType=study-plan-v2&envId=top-100-liked)

给你一个字符串数组，请你将 字母异位词 组合在一起。可以按任意顺序返回结果列表。

**示例 1:**

**输入:** strs = ["eat", "tea", "tan", "ate", "nat", "bat"]

**输出:** [["bat"],["nat","tan"],["ate","eat","tea"]]

**解释：**

- 在 strs 中没有字符串可以通过重新排列来形成 `"bat"`。
- 字符串 `"nat"` 和 `"tan"` 是字母异位词，因为它们可以重新排列以形成彼此。
- 字符串 `"ate"` ，`"eat"` 和 `"tea"` 是字母异位词，因为它们可以重新排列以形成彼此。

排序：互为字母异位词的两个字符串排序之后得到的字符串一定是相同的。

- sorted(s)：将字符串 s 按字母顺序排序，返回一个字符的列表。例如，"eat" 排序后是 ['a', 'e', 't']
- "".join(sorted(s))：将排序后的字符列表连接成一个新的字符串。例如，"eat" 排序后会变成 "aet"
- groups["aet"].append(s)：通过排序后的字符串作为字典的键，将原始字符串 s 添加到该键对应的列表中

```python
import collections
from typing import List

class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        # 创建一个默认值为 list 的字典 groups，用于存储各组字母异位词
        groups = collections.defaultdict(list)

        for s in strs:
            groups["".join(sorted(s))].append(s)

        return list(groups.values())

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    n = int(input())  # 输入字符串的个数
    strs = [input().strip() for _ in range(n)]  # 读取所有字符串

    # 创建 Solution 实例并调用 groupAnagrams 方法
    solution = Solution()
    result = solution.groupAnagrams(strs)

    # 输出结果
    for group in result:
        print(" ".join(group))

# 输入输出示例：
# 输入：
# 6
# eat
# tea
# tan
# ate
# nat
# bat
# 输出：
# eat tea ate
# tan nat
# bat
#
# 解释：
# 字符串中 "eat", "tea", "ate" 是字母异位词，属于一组；
# "tan", "nat" 是字母异位词，属于一组；
# "bat" 是一个单独的组。
```

计数：互为字母异位词的两个字符串中的相同字母出现的次数一定是相同的。

```python
class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        # 使用 defaultdict 来自动创建列表，用于存储同字母异序词组
        groups = collections.defaultdict(list)

        for s in strs:
            # 创建一个长度为 26 的计数器数组，用于统计字母出现的次数
            count = [0] * 26

            for ch in s:
                # ord(ch) - ord('a') 计算字符 ch 对应的字母在字母表中的位置
                # 例如 'a' 的位置是 0，'b' 的位置是 1，依此类推
                count[ord(ch) - ord('a')] += 1  # 更新该字符的计数

            # 字典的键必须可哈希，并支持相等性比较
            # 将字母的频率计数（tuple 类型）作为键，字符串 s 作为值，加入字典
            groups[tuple(count)].append(s)

        return list(groups.values())
```

### [128. 最长连续序列](https://leetcode.cn/problems/longest-consecutive-sequence/description/?envType=study-plan-v2&envId=top-100-liked)

给定一个未排序的整数数组 `nums` ，找出数字连续的最长序列（不要求序列元素在原数组中连续）的长度。

请你设计并实现时间复杂度为 `O(n)` 的算法解决此问题。

![iShot_2025-12-30_10.55.11](https://raw.githubusercontent.com/1910853272/image/master/img/202512301055590.png)

```python
class Solution:
    def longestConsecutive(self, nums):
        st = set(nums)  # 把 nums 转成哈希集合
        ans = 0
        for x in st:  # 遍历哈希集合 st 中的每个元素 x
            if x - 1 in st:  # 如果 x 不是序列的起点，直接跳过
                continue
            # x 是序列的起点
            y = x + 1
            while y in st:  # 不断查找下一个数是否在哈希集合中
                y += 1
            # 循环结束后，y-1 是最后一个在哈希集合中的数
            ans = max(ans, y - x)  # 从 x 到 y-1 一共 y-x 个数
        return ans

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    n = int(input())  # 输入数组元素的个数
    nums = list(map(int, input().split()))  # 读取所有的数字并转换为整数列表

    # 创建 Solution 实例并调用 longestConsecutive 方法
    solution = Solution()
    result = solution.longestConsecutive(nums)

    # 输出结果
    print(result)

# 输入输出示例：
# 输入：
# 7
# 100 4 200 1 3 2 5
# 输出：
# 5
#
# 解释：
# 数字 1, 2, 3, 4, 5 构成了一个连续的序列，最长的连续序列长度是 5。
```

## 双指针

### [283. 移动零](https://leetcode.cn/problems/move-zeroes/description/?envType=study-plan-v2&envId=top-100-liked)

给定一个数组 `nums`，编写一个函数将所有 `0` 移动到数组的末尾，同时保持非零元素的相对顺序。

**请注意** ，必须在不复制数组的情况下原地对数组进行操作。

使用双指针，左指针指向当前已经处理好的序列的尾部，右指针指向待处理序列的头部。

右指针不断向右移动，每次右指针指向非零数，则将左右指针对应的数交换，同时左指针右移。

```python
class Solution:
    def moveZeroes(self, nums):
        n = len(nums)
        left = right = 0
        while right < n:
            if nums[right] != 0:
                nums[left], nums[right] = nums[right], nums[left]
                left += 1
            right += 1

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    n = int(input())  # 输入数组的长度
    nums = list(map(int, input().split()))  # 读取数组的元素并转换为整数列表

    # 创建 Solution 实例并调用 moveZeroes 方法
    solution = Solution()
    solution.moveZeroes(nums)

    # 输出结果
    print(" ".join(map(str, nums)))

# 输入输出示例：
# 输入：
# 5
# 0 1 0 3 12
# 输出：
# 1 3 12 0 0
#
# 解释：
# 数字 0 被移动到数组的末尾，其他数字保持原顺序。
```

### [11. 盛最多水的容器](https://leetcode.cn/problems/container-with-most-water/?envType=study-plan-v2&envId=top-100-liked)

给定一个长度为 `n` 的整数数组 `height` 。有 `n` 条垂线，第 `i` 条线的两个端点是 `(i, 0)` 和 `(i, height[i])` 。找出其中的两条线，使得它们与 `x` 轴共同构成的容器可以容纳最多的水。返回容器可以储存的最大水量。

![img](https://aliyun-lc-upload.oss-cn-hangzhou.aliyuncs.com/aliyun-lc-upload/uploads/2018/07/25/question_11.jpg)

1. 左指针放在最左，右指针放在最右。
2. 计算当前容量并更新最大值。
3. 移动较小高度的指针。
4. 循环直到两个指针相遇。

```python
class Solution:
    def maxArea(self, height):
        ans = left = 0
        right = len(height) - 1
        while left < right:
            area = (right - left) * min(height[left], height[right])
            ans = max(ans, area)
            # 每次都要移动数字较小的那个指针，去尝试找到更高的柱子
            if height[left] < height[right]:
                left += 1
            else:
                right -= 1
        return ans

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    n = int(input())  # 输入数组的长度
    height = list(map(int, input().split()))  # 读取数组的元素并转换为整数列表

    # 创建 Solution 实例并调用 maxArea 方法
    solution = Solution()
    result = solution.maxArea(height)

    # 输出结果
    print(result)

# 输入输出示例：
# 输入：
# 5
# 1 8 6 2 5
# 输出：
# 49
#
# 解释：
# 数组 height = [1, 8, 6, 2, 5]，最大的容器面积为 49，选取柱子 1 和柱子 8 形成的容器。
```

### [15. 三数之和](https://leetcode.cn/problems/3sum/description/?envType=study-plan-v2&envId=top-100-liked)

给你一个整数数组 `nums` ，判断是否存在三元组 `[nums[i], nums[j], nums[k]]` 满足 `i != j`、`i != k` 且 `j != k` ，同时还满足 `nums[i] + nums[j] + nums[k] == 0` 。请你返回所有和为 `0` 且不重复的三元组。

**注意：**答案中不可以包含重复的三元组。

**示例 1：**

```text
输入：nums = [-1,0,1,2,-1,-4]
输出：[[-1,-1,2],[-1,0,1]]
解释：
nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0 。
nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0 。
nums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0 。
不同的三元组是 [-1,0,1] 和 [-1,-1,2] 。
注意，输出的顺序和三元组的顺序并不重要。
```

```python
class Solution:
    def threeSum(self, nums):
        nums.sort()
        res = []
        for k in range(len(nums) - 2):
            if nums[k] > 0: break  # 当前数字大于0无需继续，因为后面数都更大，无法形成和为0的三元组
            if k > 0 and nums[k] == nums[k - 1]: continue  # 当前数字与前一个相同，跳过避免重复
            i, j = k + 1, len(nums) - 1  # 双指针i和j分别指向k后面和数组的最后一个元素
            while i < j:
                s = nums[k] + nums[i] + nums[j]
                if s < 0:
                    i += 1  # 如果和小于0，移动i指针，增大和
                    while i < j and nums[i] == nums[i - 1]: i += 1  # 跳过重复数字
                elif s > 0:
                    j -= 1  # 如果和大于0，移动j指针，减小和
                    while i < j and nums[j] == nums[j + 1]: j -= 1  # 跳过重复数字
                else:
                    res.append([nums[k], nums[i], nums[j]])  # 找到符合条件的三元组
                    i += 1  # 移动i，继续查找
                    j -= 1  # 移动j，继续查找
                    while i < j and nums[i] == nums[i - 1]: i += 1  # 跳过重复数字
                    while i < j and nums[j] == nums[j + 1]: j -= 1  # 跳过重复数字
        return res

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    n = int(input())  # 输入数组的长度
    nums = list(map(int, input().split()))  # 读取数组元素并转换为整数列表

    # 创建 Solution 实例并调用 threeSum 方法
    solution = Solution()
    result = solution.threeSum(nums)

    # 输出结果
    for triplet in result:
        print(" ".join(map(str, triplet)))

# 输入输出示例：
# 输入：
# 6
# -1 0 1 2 -1 -4
# 输出：
# -1 -1 2
# -1 0 1
#
# 解释：
# 给定数组 [-1, 0, 1, 2, -1, -4]，存在两个三元组的和为 0：
# (-1, -1, 2) 和 (-1, 0, 1)。
```

### [42. 接雨水](https://leetcode.cn/problems/trapping-rain-water/description/?envType=study-plan-v2&envId=top-100-liked)

给定 `n` 个非负整数表示每个宽度为 `1` 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。

**示例 1：**

![img](https://assets.leetcode.cn/aliyun-lc-upload/uploads/2018/10/22/rainwatertrap.png)

```text
输入：height = [0,1,0,2,1,0,1,3,2,1,2,1]
输出：6
解释：上面是由数组 [0,1,0,2,1,0,1,3,2,1,2,1] 表示的高度图，在这种情况下，可以接 6 个单位的雨水（蓝色部分表示雨水）。
```

```python
class Solution:
    def trap(self, height):
        ans = l_max = r_max = 0  # 初始化接水量和左右最大高度为 0
        left, right = 0, len(height) - 1

        while left < right:
            l_max = max(l_max, height[left])  # 更新左边的最大高度 l_max
            r_max = max(r_max, height[right])  # 更新右边的最大高度 r_max

            if l_max < r_max:
                # 当前位置可以接的水量是 left 位置的最大高度减去当前位置的高度
                ans += l_max - height[left]
                left += 1  # 左指针右移，继续计算下一个位置的接水量
            else:
                # 当前位置可以接的水量是 right 位置的最大高度减去当前位置的高度
                ans += r_max - height[right]
                right -= 1  # 右指针左移，继续计算下一个位置的接水量

        return ans

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    n = int(input())  # 输入数组的长度
    height = list(map(int, input().split()))  # 读取数组元素并转换为整数列表

    # 创建 Solution 实例并调用 trap 方法
    solution = Solution()
    result = solution.trap(height)

    # 输出结果
    print(result)

# 输入输出示例：
# 输入：
# 6
# 0 1 0 2 1 0 1 3 2 1 2 1
# 输出：
# 6
#
# 解释：
# 给定数组 height = [0,1,0,2,1,0,1,3,2,1,2,1]，接到的水量是 6。
```

## 滑动窗口

### [3. 无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/description/?envType=study-plan-v2&envId=top-100-liked)

给定一个字符串 `s` ，请你找出其中不含有重复字符的 **最长子串** 的长度。

**示例 1:**

```text
输入: s = "abcabcbb"
输出: 3
解释: 因为无重复字符的最长子串是 "abc"，所以其长度为 3。注意 "bca" 和 "cab" 也是正确答案。
```

```python
from collections import defaultdict

class Solution:
    def lengthOfLongestSubstring(self, s):
        ans = left = 0
        # 字符及其出现次数
        cnt = defaultdict(int)
        # right是当前字符的下标，c是当前字符
        for right, c in enumerate(s):
            cnt[c] += 1
            while cnt[c] > 1:  # 窗口内有重复字母
                cnt[s[left]] -= 1  # 将窗口左端点的字符 s[left] 的计数减 1
                left += 1  # 窗口左端点右移缩小窗口
            ans = max(ans, right - left + 1)  # 更新窗口长度最大值
        return ans

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    s = input().strip()  # 输入字符串

    # 创建 Solution 实例并调用 lengthOfLongestSubstring 方法
    solution = Solution()
    result = solution.lengthOfLongestSubstring(s)

    # 输出结果
    print(result)

# 输入输出示例：
# 输入：
# abcabcbb
# 输出：
# 3
#
# 解释：
# 字符串 "abcabcbb" 中，最长的无重复字符子串是 "abc"，长度为 3。
```

#### 类似[209. 长度最小的子数组](https://leetcode.cn/problems/minimum-size-subarray-sum/description/)

给定一个含有 `n` 个正整数的数组和一个正整数 `target` **。**

找出该数组中满足其总和大于等于 `target` 的长度最小的 **子数组** `[numsl, numsl+1, ..., numsr-1, numsr]` ，并返回其长度**。**如果不存在符合条件的子数组，返回 `0` 。

**示例 1：**

```text
输入：target = 7, nums = [2,3,1,2,4,3]
输出：2
解释：子数组 [4,3] 是该条件下的长度最小的子数组。
```

```python
class Solution:
    def minSubArrayLen(self, target, nums):
        n = len(nums)
        ans = n + 1  # 初始化最小子数组长度为 n+1，表示一个无效的值，也可以写 inf
        s = left = 0  # 初始化子数组的和为 0，左端点也为 0

        for right, x in enumerate(nums):
            # 将当前右端点的值加到子数组和 s 中
            s += x
            # 缩小窗口
            while s - nums[left] >= target:
                s -= nums[left]  # 从子数组和中移除左端点的值
                left += 1  # 左端点右移，缩小子数组

            # 如果当前子数组和大于等于 target，更新最小子数组长度
            if s >= target:
                ans = min(ans, right - left + 1)

        return ans if ans <= n else 0

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    target = int(input())  # 输入目标值
    nums = list(map(int, input().split()))  # 输入整数数组

    # 创建 Solution 实例并调用 minSubArrayLen 方法
    solution = Solution()
    result = solution.minSubArrayLen(target, nums)

    # 输出结果
    print(result)

# 输入输出示例：
# 输入：
# 7
# 2 3 1 2 4 3
# 输出：
# 2
#
# 解释：
# 最小子数组长度是 2，子数组是 [4, 3]，其和为 7。
```

#### 类似[713. 乘积小于 K 的子数组](https://leetcode.cn/problems/subarray-product-less-than-k/description/)

给你一个整数数组 `nums` 和一个整数 `k` ，请你返回子数组内所有元素的乘积严格小于 `k` 的连续子数组的数目。

**示例 1：**

```text
输入：nums = [10,5,2,6], k = 100
输出：8
解释：8 个乘积小于 100 的子数组分别为：[10]、[5]、[2]、[6]、[10,5]、[5,2]、[2,6]、[5,2,6]。
需要注意的是 [10,5,2] 并不是乘积小于 100 的子数组。
```

```python
class Solution:
    def numSubarrayProductLessThanK(self, nums, k):
        # 如果 k 小于等于 1，则所有的子数组乘积都无法满足条件，直接返回 0
        if k <= 1:
            return 0

        # 初始化结果为 0，左端点为 0，乘积为 1
        ans = left = 0
        prod = 1  # 当前窗口的乘积

        # 遍历数组 nums，每个元素都作为右端点
        for right, x in enumerate(nums):
            # 将当前右端点的元素 x 乘到当前子数组的乘积 prod 上
            prod *= x

            # 当子数组的乘积 prod 大于等于 k 时，缩小窗口（通过移动左端点）
            while prod >= k:
                # 移除左端点 nums[left] 的影响，除去它的值
                prod //= nums[left]
                # 左端点右移，缩小窗口
                left += 1

            # 对于每一个固定的右端点 `right`，当前的有效子数组个数是 `right - left + 1`
            # 因为左端点可以从 `left` 到 `right` 之间的任何位置，所以有 `right - left + 1` 种子数组
            ans += right - left + 1

        # 返回最终满足条件的子数组的个数
        return ans

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    n, k = map(int, input().split())  # 输入数组的长度和目标值 k
    nums = list(map(int, input().split()))  # 读取整数数组

    # 创建 Solution 实例并调用 numSubarrayProductLessThanK 方法
    solution = Solution()
    result = solution.numSubarrayProductLessThanK(nums, k)

    # 输出结果
    print(result)

# 输入输出示例：
# 输入：
# 6 100
# 10 5 2 6
# 输出：
# 8
#
# 解释：
# 给定数组 nums = [10, 5, 2, 6]，并且 k = 100。
# 满足条件的子数组数量是 8。
```

### [438. 找到字符串中所有字母异位词](https://leetcode.cn/problems/find-all-anagrams-in-a-string/description/?envType=study-plan-v2&envId=top-100-liked)

给定两个字符串 `s` 和 `p`，找到 `s` 中所有 `p` 的 **异位词** 的子串，返回这些子串的起始索引。不考虑答案输出的顺序。

**示例 1:**

```text
输入: s = "cbaebabacd", p = "abc"
输出: [0,6]
解释:
起始索引等于 0 的子串是 "cba", 它是 "abc" 的异位词。
起始索引等于 6 的子串是 "bac", 它是 "abc" 的异位词。
```

```python
class Solution:
    def findAnagrams(self, s, p):
        s_len, p_len = len(s), len(p)  # 获取字符串 s 和 p 的长度

        # 边界情况：当 s 的长度比 p 小时，肯定没有字母异序词
        if s_len < p_len:
            return []

        ans = []  # 用来存储答案，即所有字母异序词的起始索引
        s_count = [0] * 26  # 用来统计 s 中当前窗口字符频率的数组，大小为 26（对应26个字母）
        p_count = [0] * 26  # 用来统计 p 中每个字符频率的数组

        # 初始化窗口：统计字符串 p 和字符串 s 中前 p_len 长度的子串的字符频率
        for i in range(p_len):
            s_count[ord(s[i]) - ord("a")] += 1  # 统计 s 中前 p_len 个字符的频率
            p_count[ord(p[i]) - ord("a")] += 1  # 统计 p 中前 p_len 个字符的频率

        # 边界情况：如果初始的窗口和 p 的字符频率相同，说明第一个子串是一个字母异序词
        if s_count == p_count:
            ans.append(0)  # 将第一个符合条件的子串的起始索引 0 加入答案

        # 滑动窗口，右进一位，左出一位
        for i in range(p_len, s_len):  # 从 s[p_len] 开始遍历到 s 的结尾
            s_count[ord(s[i]) - ord("a")] += 1  # 右端点字符进入窗口，更新窗口字符频率
            s_count[ord(s[i - p_len]) - ord("a")] -= 1  # 左端点字符离开窗口，更新窗口字符频率

            # 如果窗口内字符频率与 p 的频率一致，则说明当前子串是一个字母异序词
            if s_count == p_count:
                ans.append(i - p_len + 1)  # 将当前字母异序词的起始索引加入答案

        return ans

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    s, p = input().split()  # 输入字符串 s 和 p

    # 创建 Solution 实例并调用 findAnagrams 方法
    solution = Solution()
    result = solution.findAnagrams(s, p)

    # 输出结果
    print(" ".join(map(str, result)))

# 输入输出示例：
# 输入：
# cbaebabacd abc
# 输出：
# 0 6
#
# 解释：
# 字符串 "cbaebabacd" 中，字母异序词 "abc" 出现的起始索引分别是 0 和 6。
```

## 子串

### [560. 和为 K 的子数组 ](https://leetcode.cn/problems/subarray-sum-equals-k/description/?envType=study-plan-v2&envId=top-100-liked)[前缀和]

给你一个整数数组 `nums` 和一个整数 `k` ，请你统计并返回该数组中和为 `k` 的子数组的个数 。

子数组是数组中元素的连续非空序列。

**示例 1：**

```text
输入：nums = [1,1,1], k = 2
输出：2
```

```python
import collections
from typing import List

class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        # count 字典用来统计“某个前缀和出现了多少次”
        count = collections.defaultdict(int)
        # 初始化：前缀和为 0 出现 1 次（在数组开始前的位置）
        count[0] = 1
        ans = 0
        # pre 表示当前遍历到位置 i 时，nums[0..i] 的前缀和
        pre = 0

        for x in nums:
            # 更新当前前缀和：pre = nums[0] + nums[1] + ... + 当前元素 x
            pre += x

            # 若某个子数组 nums[l..r] 的和为 k，则：
            # prefix[r] - prefix[l-1] = k
            # 统计nums[0]到 nums[l-1] 中有多少个前缀和等于prefix[r] - k

            # count[pre - k]：表示“前缀和与目标k的差值pre - k出现的历史次数”
            ans += count[pre - k]
            # 将当前前缀和 pre 计入哈希表（出现次数 +1）
            count[pre] += 1

        return ans

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    n, k = map(int, input().split())  # 输入数组的长度 n 和目标值 k
    nums = list(map(int, input().split()))  # 输入整数数组 nums

    # 创建 Solution 实例并调用 subarraySum 方法
    solution = Solution()
    result = solution.subarraySum(nums, k)

    # 输出结果
    print(result)

# 输入输出示例：
# 输入：
# 5 2
# 1 1 1 1 1
# 输出：
# 4
#
# 解释：
# 给定数组 nums = [1, 1, 1, 1, 1]，目标和 k = 2，符合条件的子数组有 4 个：
# [1, 1], [1, 1], [1, 1], [1, 1]。
```

### [239. 滑动窗口最大值](https://leetcode.cn/problems/sliding-window-maximum/description/?envType=study-plan-v2&envId=top-100-liked) [单调队列]

给你一个整数数组 `nums`，有一个大小为 `k` 的滑动窗口从数组的最左侧移动到数组的最右侧。你只可以看到在滑动窗口内的 `k` 个数字。滑动窗口每次只向右移动一位。

返回 _滑动窗口中的最大值_ 。

**示例 1：**

```text
输入：nums = [1,3,-1,-3,5,3,6,7], k = 3
输出：[3,3,5,5,6,7]
解释：
滑动窗口的位置                最大值
---------------               -----
[1  3  -1] -3  5  3  6  7       3
 1 [3  -1  -3] 5  3  6  7       3
 1  3 [-1  -3  5] 3  6  7       5
 1  3  -1 [-3  5  3] 6  7       5
 1  3  -1  -3 [5  3  6] 7       6
 1  3  -1  -3  5 [3  6  7]      7
```

单调队列套路

1. 右边入（元素进入**队尾**，同时维护队列**单调性**）
2. 左边出（元素离开**队首**）
3. 记录/维护答案（根据**队首**）

q = deque([2, 3, 5]) q[0] 是队列头部，值为 2; q[-1] 是队列尾部，值为 5。

q.pop()：从队列的**尾部**（右侧）移除一个元素。

q.popleft()：从队列的**头部**（左侧）移除一个元素。

```python
from collections import deque
from typing import List

class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        ans = [0] * (len(nums) - k + 1)  # 窗口个数
        q = deque()  # 双端队列

        for i, x in enumerate(nums):
            # 1. 右边入
            while q and nums[q[-1]] <= x: # 每当新元素 x 要进入队列时，就不断检查队尾元素
                q.pop()  # 如果队尾元素小于或等于新元素 x，就把队尾删除
            q.append(i)  # 直到队尾元素比 x 大，再把当前下标加入队尾。注意保存的是下标。

            # 2. 左边出
            left = i - k + 1  # 窗口左端点
            if q[0] < left:  # 队首离开窗口
                q.popleft()

            # 3. 在窗口左端点处记录答案
            if left >= 0:
                # 由于队首到队尾单调递减，所以窗口最大值就在队首
                ans[left] = nums[q[0]]

        return ans

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    n, k = map(int, input().split())  # 输入数组长度 n 和窗口大小 k
    nums = list(map(int, input().split()))  # 输入整数数组 nums

    # 创建 Solution 实例并调用 maxSlidingWindow 方法
    solution = Solution()
    result = solution.maxSlidingWindow(nums, k)

    # 输出结果
    print(" ".join(map(str, result)))

# 输入输出示例：
# 输入：
# 8 3
# 1 3 -1 -3 5 3 6 7
# 输出：
# 3 3 5 5 6 7
#
# 解释：
# 对于每个滑动窗口，返回窗口的最大值：
# 第一个窗口 [1, 3, -1] 最大值是 3
# 第二个窗口 [3, -1, -3] 最大值是 3
# 第三个窗口 [-1, -3, 5] 最大值是 5
# 第四个窗口 [-3, 5, 3] 最大值是 5
# 第五个窗口 [5, 3, 6] 最大值是 6
# 第六个窗口 [3, 6, 7] 最大值是 7
```

### [76. 最小覆盖子串](https://leetcode.cn/problems/minimum-window-substring/description/?envType=study-plan-v2&envId=top-100-liked) [滑动窗口]

给定两个字符串 `s` 和 `t`，长度分别是 `m` 和 `n`，返回 s 中的 **最短窗口子串**，使得该子串包含 `t` 中的每一个字符（**包括重复字符**）。如果没有这样的子串，返回空字符串 `""`。

测试用例保证答案唯一。

**示例 1：**

```text
输入：s = "ADOBECODEBANC", t = "ABC"
输出："BANC"
解释：最小覆盖子串 "BANC" 包含来自字符串 t 的 'A'、'B' 和 'C'。
```

```python
from collections import Counter

class Solution:
    def minWindow(self, s, t):
        cnt_s = Counter()  # s 子串字母的出现次数
        cnt_t = Counter(t)  # t 中字母的出现次数

        ans_left, ans_right = -1, len(s) # -1 在这里表示“尚未找到”
        left = 0
        for right, c in enumerate(s):  # 移动子串右端点
            cnt_s[c] += 1  # 右端点字母移入子串
            while cnt_s >= cnt_t:  # s子串涵盖t
                if right - left < ans_right - ans_left:  # 找到更短的子串
                    ans_left, ans_right = left, right  # 记录此时的左右端点
                cnt_s[s[left]] -= 1  # 左端点字母移出子串
                left += 1

        if ans_left < 0:
            return ""
        else:
            return s[ans_left:ans_right + 1]

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    s = input().strip()  # 输入字符串 s
    t = input().strip()  # 输入字符串 t

    # 创建 Solution 实例并调用 minWindow 方法
    solution = Solution()
    result = solution.minWindow(s, t)

    # 输出结果
    print(result)

# 输入输出示例：
# 输入：
# ADOBECODEBANC
# ABC
# 输出：
# BANC
#
# 解释：
# 最小覆盖子串是 "BANC"，包含 t 中的所有字符 "ABC"。
```

## 普通数组

### [53. 最大子数组和](https://leetcode.cn/problems/maximum-subarray/description/?envType=study-plan-v2&envId=top-100-liked)[动态规划]

给你一个整数数组 `nums` ，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。

**子数组**是数组中的一个连续部分。

**示例 1：**

```text
输入：nums = [-2,1,-3,4,-1,2,1,-5,4]
输出：6
解释：连续子数组 [4,-1,2,1] 的和最大，为 6 。
```

```python
class Solution:
    def maxSubArray(self, nums):
        # f[i] 表示以 nums[i] 为结尾的子数组的最大和
        f = [0] * len(nums)
        # 第一个元素的最大子数组和就是 nums[0]，因为只有一个元素时，其本身就是最大子数组
        f[0] = nums[0]

        # 从第二个元素开始，遍历整个数组，计算每个位置的最大子数组和
        for i in range(1, len(nums)):
            # 若前面的和为负数，则从当前位置重新开始
            f[i] = max(f[i - 1], 0) + nums[i]

        # max(f) 选取所有计算出的子数组和中的最大值
        return max(f)

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    n = int(input())  # 输入数组的长度
    nums = list(map(int, input().split()))  # 输入整数数组 nums

    # 创建 Solution 实例并调用 maxSubArray 方法
    solution = Solution()
    result = solution.maxSubArray(nums)

    # 输出结果
    print(result)

# 输入输出示例：
# 输入：
# 5
# -2 1 -3 4 -1 2 1 -5 4
# 输出：
# 6
#
# 解释：
# 给定数组 nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]，最大子数组和为 6，子数组为 [4, -1, 2, 1]。
```

### [56. 合并区间](https://leetcode.cn/problems/merge-intervals/description/?envType=study-plan-v2&envId=top-100-liked) [数组排序]

以数组 `intervals` 表示若干个区间的集合，其中单个区间为 `intervals[i] = [starti, endi]` 。请你合并所有重叠的区间，并返回 一个不重叠的区间数组，该数组需恰好覆盖输入中的所有区间。

**示例 1：**

```text
输入：intervals = [[1,3],[2,6],[8,10],[15,18]]
输出：[[1,6],[8,10],[15,18]]
解释：区间 [1,3] 和 [2,6] 重叠, 将它们合并为 [1,6].
```

`key=lambda p: p[0]`：接受一个参数 `p`，并返回 `p[0]`，即每个子列表的第一个元素（左端点）

`list.sort(key=None, reverse=False)` `key`: 用于指定排序规则的函数，默认是 `None`，即根据元素的自然顺序进行排序。`reverse`: 一个布尔值，控制排序顺序。如果是 `True`，则是降序排序；如果是 `False`（默认），则是升序排序。

`intervals` 是一个二维列表

```python
class Solution:
    def merge(self, intervals):
        intervals.sort(key=lambda p: p[0])  # 按照每个区间的第一个数字从小到大排序
        ans = []
        for p in intervals:
            # 如果结果列表 ans 不为空，且当前区间的左端点 <= ans 列表中最后一个区间的右端点，可以合并
            if ans and p[0] <= ans[-1][1]:
                ans[-1][1] = max(ans[-1][1], p[1])  # 更新右端点最大值
            else:  # 不相交，无法合并
                ans.append(p)
        return ans

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    n = int(input())  # 输入区间个数
    intervals = []
    for _ in range(n): # 输入所有区间
        interval = list(map(int, input().split()))
        intervals.append(interval)

    # 创建 Solution 实例并调用 merge 方法
    solution = Solution()
    result = solution.merge(intervals)

    # 输出结果
    for interval in result:
        print(interval)

# 输入输出示例：
# 输入：
# 4
# 1 3
# 2 4
# 5 7
# 6 8
# 输出：
# [1, 4]
# [5, 8]
#
# 解释：
# 给定区间 [[1,3],[2,4],[5,7],[6,8]]，合并后的区间为 [[1,4],[5,8]]。
```

### [189. 轮转数组](https://leetcode.cn/problems/rotate-array/?envType=study-plan-v2&envId=top-100-liked) [数组反转]

给定一个整数数组 `nums`，将数组中的元素向右轮转 `k` 个位置，其中 `k` 是非负数。

**示例 1:**

```text
输入: nums = [1,2,3,4,5,6,7], k = 3
输出: [5,6,7,1,2,3,4]
解释:
向右轮转 1 步: [7,1,2,3,4,5,6]
向右轮转 2 步: [6,7,1,2,3,4,5]
向右轮转 3 步: [5,6,7,1,2,3,4]
```

```python
class Solution:
    def rotate(self, nums, k):
        # 原地翻转 nums[i..j]（双指针交换，不申请额外数组）
        def reverse(i, j):
            # i 从左往右，j 从右往左，直到相遇
            while i < j:
                # 交换两端元素
                nums[i], nums[j] = nums[j], nums[i]
                i += 1
                j -= 1

        n = len(nums)          # 数组长度
        k %= n                 # 防止 k 大于 n：右旋 k 次等价于右旋 k % n 次

        # 三次翻转实现“向右旋转 k 步”
        reverse(0, n - 1)      # 1) 翻转整个数组
        reverse(0, k - 1)      # 2) 翻转前 k 个元素（原本的后 k 个被翻到前面后，需要再翻正）
        reverse(k, n - 1)      # 3) 翻转剩余的 n-k 个元素（把后半部分翻正）

        return nums
# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    n, k = map(int, input().split())  # 输入数组长度 n 和旋转步数 k
    nums = list(map(int, input().split()))  # 输入数组 nums

    # 创建 Solution 实例并调用 rotate 方法
    solution = Solution()
    solution.rotate(nums, k)

    # 输出结果
    print(" ".join(map(str, nums)))

# 输入输出示例：
# 输入：
# 7 3
# 1 2 3 4 5 6 7
# 输出：
# 5 6 7 1 2 3 4
#
# 解释：
# 给定数组 nums = [1, 2, 3, 4, 5, 6, 7]，旋转 3 步后的数组是 [5, 6, 7, 1, 2, 3, 4]。
```

### [238. 除自身以外数组的乘积](https://leetcode.cn/problems/product-of-array-except-self/?envType=study-plan-v2&envId=top-100-liked)

给你一个整数数组 `nums`，返回 数组 `answer` ，其中 `answer[i]` 等于 `nums` 中除了 `nums[i]` 之外其余各元素的乘积 。

题目数据 **保证** 数组 `nums`之中任意元素的全部前缀元素和后缀的乘积都在 **32 位** 整数范围内。

请 **不要使用除法，**且在 `O(n)` 时间复杂度内完成此题。

**示例 1:**

```text
输入: nums = [1,2,3,4]
输出: [24,12,8,6]
```

`range(n - 2, -1, -1)` 中：

- `n - 2`: 这是循环的起始索引，意味着从倒数第二个元素开始（因为 `nums[n-1]` 是最后一个元素，我们不需要计算它的右侧积）。
- `-1`: 这是循环的结束索引，表示要循环到索引 `0`，包含 `0`。
- `-1`: 步长为 `-1`，表示每次递减 1，从右往左遍历。

```python
class Solution:
    def productExceptSelf(self, nums):
        n = len(nums)

        # 辅助数组left 和 right，分别用来存储每个位置左侧和右侧的积
        left = [1] * n
        right = [1] * n

        # 填充 left 数组，left[i] 存储 nums[0] 到 nums[i-1] 的积
        for i in range(1, n):
            left[i] = left[i - 1] * nums[i - 1]

        # 填充 right 数组，right[i] 存储 nums[i+1] 到 nums[n-1] 的积
        # 从右向左遍历数组 nums，即从 n-2 开始，到 0 结束（包括 0）
        for i in range(n - 2, -1, -1):
            right[i] = right[i + 1] * nums[i + 1]

        # 创建结果数组 ans，用于存储最终的结果
        ans = []
        for i in range(n):
            # 对于每个元素，结果是它左侧的积和右侧的积的乘积
            ans.append(left[i] * right[i])

        return ans

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    n = int(input())  # 输入数组的长度
    nums = list(map(int, input().split()))  # 输入整数数组 nums

    # 创建 Solution 实例并调用 productExceptSelf 方法
    solution = Solution()
    result = solution.productExceptSelf(nums)

    # 输出结果
    print(" ".join(map(str, result)))

# 输入输出示例：
# 输入：
# 5
# 1 2 3 4 5
# 输出：
# 120 60 40 30 24
#
# 解释：
# 对于数组 [1, 2, 3, 4, 5]，结果数组是 [120, 60, 40, 30, 24]，
# 因为每个位置的值是去掉该位置的元素后的乘积。
```

### [41. 缺失的第一个正数](https://leetcode.cn/problems/first-missing-positive/?envType=study-plan-v2&envId=top-100-liked) [原地哈希]

给你一个未排序的整数数组 `nums` ，请你找出其中没有出现的最小的正整数。

请你实现时间复杂度为 `O(n)` 并且只使用常数级别额外空间的解决方案。

**示例 1：**

```text
输入：nums = [1,2,0]
输出：3
解释：范围 [1,2] 中的数字都在数组中。
```

```python
class Solution:
    def firstMissingPositive(self, nums):
        n = len(nums)

        for i in range(n):
            # 对于合法的 nums[i]，它应该在 nums[i] - 1 这个下标位置
            while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
                # 交换 nums[i] 和 nums[nums[i] - 1]，把当前数字放到正确的位置
                nums[nums[i] - 1], nums[i] = nums[i], nums[nums[i] - 1]

        # 遍历数组，检查哪个位置的数字不符合 nums[i] = i + 1
        for i in range(n):
            if nums[i] != i + 1:
                # 如果 nums[i] != i + 1，说明 i + 1 是缺失的数字
                return i + 1

        # 如果数组中的数字都符合 nums[i] = i + 1，则缺失的数字是 n + 1
        return n + 1

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    n = int(input())  # 输入数组的长度
    nums = list(map(int, input().split()))  # 输入整数数组 nums

    # 创建 Solution 实例并调用 firstMissingPositive 方法
    solution = Solution()
    result = solution.firstMissingPositive(nums)

    # 输出结果
    print(result)

# 输入输出示例：
# 输入：
# 5
# 1 2 0
# 输出：
# 3
#
# 解释：
# 给定数组 nums = [1, 2, 0]，缺失的最小正整数是 3。
```

## 矩阵

### [73. 矩阵置零](https://leetcode.cn/problems/set-matrix-zeroes/?envType=study-plan-v2&envId=top-100-liked)

给定一个 `m x n` 的矩阵，如果一个元素为 **0** ，则将其所在行和列的所有元素都设为 **0** 。请使用 **[原地](http://baike.baidu.com/item/原地算法)** 算法**。**

**示例 1：**

![img](https://assets.leetcode.com/uploads/2020/08/17/mat1.jpg)

```text
输入：matrix = [[1,1,1],[1,0,1],[1,1,1]]
输出：[[1,0,1],[0,0,0],[1,0,1]]
```

```python
class Solution:
    def setZeroes(self, matrix):
        # 获取矩阵的行数和列数
        m, n = len(matrix), len(matrix[0])
        # 初始化两个布尔列表，记录每一行和每一列是否包含零
        row, col = [False] * m, [False] * n

        # 遍历矩阵，查找零的位置，并记录对应的行和列
        for i in range(m):
            for j in range(n):
                if matrix[i][j] == 0:
                    row[i] = col[j] = True

        # 遍历矩阵，如果该行或该列包含零，将对应位置的元素置为零
        for i in range(m):
            for j in range(n):
                if row[i] or col[j]:
                    matrix[i][j] = 0
        return matrix

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    m, n = map(int, input().split())  # 输入矩阵的行数 m 和列数 n
    matrix = [list(map(int, input().split())) for _ in range(m)]  # 输入矩阵

    # 创建 Solution 实例并调用 setZeroes 方法
    solution = Solution()
    solution.setZeroes(matrix)

    # 输出结果
    for row in matrix:
        print(" ".join(map(str, row)))

# 输入输出示例：
# 输入：
# 3 3
# 1 2 3
# 4 0 6
# 7 8 9
# 输出：
# 1 0 3
# 0 0 0
# 7 0 9
#
# 解释：
# 给定矩阵：
# [1 2 3]
# [4 0 6]
# [7 8 9]
# 第二行第二列的零影响到其所在的行和列，结果矩阵的第二行和第二列的所有元素都变为零。
```

### [54. 螺旋矩阵](https://leetcode.cn/problems/spiral-matrix/description/?envType=study-plan-v2&envId=top-100-liked)

给你一个 `m` 行 `n` 列的矩阵 `matrix` ，请按照 **顺时针螺旋顺序** ，返回矩阵中的所有元素。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2020/11/13/spiral1.jpg)

```text
输入：matrix = [[1,2,3],[4,5,6],[7,8,9]]
输出：[1,2,3,6,9,8,7,4,5]
```

```python
class Solution:
    def spiralOrder(self, matrix):
        m, n = len(matrix), len(matrix[0])
        ans = []
        # 创建一个矩阵，用来标记每个位置是否被访问过
        visited = [[False] * n for _ in range(m)]
        # 定义四个方向（右，下，左，上）的变化，顺时针旋转
        di = [[0, 1], [1, 0], [0, -1], [-1, 0]]
        # 初始位置为矩阵的左上角
        i, j, current_di = 0, 0, 0

        for _ in range(m * n):
            # 将当前元素添加到结果列表
            ans.append(matrix[i][j])
            # 标记当前元素已访问
            visited[i][j] = True
            # 计算下一个要访问的位置
            next_i, next_j = i + di[current_di][0], j + di[current_di][1]

            # 如果下一个位置在矩阵内且没有被访问过，更新位置
            if 0 <= next_i < m and 0 <= next_j < n and not visited[next_i][next_j]:
                i, j = next_i, next_j
            else:
                # 否则，改变方向，顺时针旋转
                current_di = (current_di + 1) % 4
                # 更新位置
                i, j = i + di[current_di][0], j + di[current_di][1]

        return ans

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    m, n = map(int, input().split())  # 输入矩阵的行数 m 和列数 n
    matrix = [list(map(int, input().split())) for _ in range(m)]  # 输入矩阵

    # 创建 Solution 实例并调用 spiralOrder 方法
    solution = Solution()
    result = solution.spiralOrder(matrix)

    # 输出结果
    print(" ".join(map(str, result)))

# 输入输出示例：
# 输入：
# 3 3
# 1 2 3
# 4 5 6
# 7 8 9
# 输出：
# 1 2 3 6 9 8 7 4 5
#
# 解释：
# 给定矩阵：
# [1 2 3]
# [4 5 6]
# [7 8 9]
# 按顺时针方向遍历矩阵，结果为 [1, 2, 3, 6, 9, 8, 7, 4, 5]。
```

### [48. 旋转图像](https://leetcode.cn/problems/rotate-image/?envType=study-plan-v2&envId=top-100-liked)

给定一个 n × n 的二维矩阵 `matrix` 表示一个图像。请你将图像顺时针旋转 90 度。

你必须在**[ 原地](https://baike.baidu.com/item/原地算法)** 旋转图像，这意味着你需要直接修改输入的二维矩阵。**请不要** 使用另一个矩阵来旋转图像。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2020/08/28/mat1.jpg)

```text
输入：matrix = [[1,2,3],[4,5,6],[7,8,9]]
输出：[[7,4,1],[8,5,2],[9,6,3]]
```

第 j 列的元素去到第 j 行，第 i 行的元素去到第 n−1−i 列，所以位于 i 行 j 列的元素，去到 j 行n−1−i列，即 (i,j)→(j,n-1-j)

![2026-01-12_204524](https://raw.githubusercontent.com/1910853272/image/master/img/202601122045210.png)

```python
class Solution:
    def rotate(self, matrix):
        n = len(matrix)

        # 第一步：转置矩阵
        for i in range(n):
            for j in range(i):  # 遍历对角线下方的元素
                # 交换矩阵[i][j] 和 [j][i]，实现转置
                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]

        # 第二步：对每一行进行翻转
        for row in matrix:
            row.reverse()  # 直接将每一行反转

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    n = int(input())  # 输入矩阵的维度 n
    matrix = [list(map(int, input().split())) for _ in range(n)]  # 输入 n x n 的矩阵

    # 创建 Solution 实例并调用 rotate 方法
    solution = Solution()
    solution.rotate(matrix)

    # 输出结果
    for row in matrix:
        print(" ".join(map(str, row)))

# 输入输出示例：
# 输入：
# 3
# 1 2 3
# 4 5 6
# 7 8 9
# 输出：
# 7 4 1
# 8 5 2
# 9 6 3
#
# 解释：
# 给定矩阵：
# [1 2 3]
# [4 5 6]
# [7 8 9]
# 经过顺时针旋转 90 度后的矩阵是：
# [7 4 1]
# [8 5 2]
# [9 6 3]
```

### [240. 搜索二维矩阵 II](https://leetcode.cn/problems/search-a-2d-matrix-ii/?envType=study-plan-v2&envId=top-100-liked)

编写一个高效的算法来搜索 `m x n` 矩阵 `matrix` 中的一个目标值 `target` 。该矩阵具有以下特性：

- 每行的元素从左到右升序排列。
- 每列的元素从上到下升序排列。

**示例 1：**

![img](https://assets.leetcode.cn/aliyun-lc-upload/uploads/2020/11/25/searchgrid2.jpg)

```text
输入：matrix = [[1,4,7,11,15],[2,5,8,12,19],[3,6,9,16,22],[10,13,14,17,24],[18,21,23,26,30]], target = 5
输出：true
```

```python
class Solution:
    def searchMatrix(self, matrix, target):
        m, n = len(matrix), len(matrix[0])
        i, j = 0, n - 1  # 从右上角开始
        while i < m and j >= 0:  # 还有剩余元素
            if matrix[i][j] == target:
                return True  # 找到 target
            if matrix[i][j] < target:
                i += 1  # 这一行剩余元素全部小于 target，排除
            else:
                j -= 1  # 这一列剩余元素全部大于 target，排除
        return False

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    m, n = map(int, input().split())  # 输入矩阵的行数 m 和列数 n
    matrix = [list(map(int, input().split())) for _ in range(m)]  # 输入 m x n 的矩阵
    target = int(input())  # 输入目标值 target

    # 创建 Solution 实例并调用 searchMatrix 方法
    solution = Solution()
    result = solution.searchMatrix(matrix, target)

    # 输出结果
    print("True" if result else "False")

# 输入输出示例：
# 输入：
# 3 3
# 1 4 7
# 2 5 8
# 3 6 9
# 5
# 输出：
# True
#
# 解释：
# 给定矩阵：
# [1 4 7]
# [2 5 8]
# [3 6 9]
# 查找目标值 5，矩阵中包含 5，因此输出 True。
```

## 链表

### [160. 相交链表](https://leetcode.cn/problems/intersection-of-two-linked-lists/?envType=study-plan-v2&envId=top-100-liked)

给你两个单链表的头节点 `headA` 和 `headB` ，请你找出并返回两个单链表相交的起始节点。如果两个链表不存在相交节点，返回 `null` 。

图示两个链表在节点 `c1` 开始相交**：**

[![img](https://assets.leetcode.cn/aliyun-lc-upload/uploads/2018/12/14/160_statement.png)](https://assets.leetcode.cn/aliyun-lc-upload/uploads/2018/12/14/160_statement.png)

题目数据 **保证** 整个链式结构中不存在环。

**注意**，函数返回结果后，链表必须 **保持其原始结构** 。

**自定义评测：**

**评测系统** 的输入如下（你设计的程序 **不适用** 此输入）：

- `intersectVal` - 相交的起始节点的值。如果不存在相交节点，这一值为 `0`
- `listA` - 第一个链表
- `listB` - 第二个链表
- `skipA` - 在 `listA` 中（从头节点开始）跳到交叉节点的节点数
- `skipB` - 在 `listB` 中（从头节点开始）跳到交叉节点的节点数

评测系统将根据这些输入创建链式数据结构，并将两个头节点 `headA` 和 `headB` 传递给你的程序。如果程序能够正确返回相交节点，那么你的解决方案将被 **视作正确答案** 。

**示例 1：**

[![img](https://assets.leetcode.com/uploads/2021/03/05/160_example_1_1.png)](https://assets.leetcode.com/uploads/2018/12/13/160_example_1.png)

```text
输入：intersectVal = 8, listA = [4,1,8,4,5], listB = [5,6,1,8,4,5], skipA = 2, skipB = 3
输出：Intersected at '8'
解释：相交节点的值为 8 （注意，如果两个链表相交则不能为 0）。
从各自的表头开始算起，链表 A 为 [4,1,8,4,5]，链表 B 为 [5,6,1,8,4,5]。
在 A 中，相交节点前有 2 个节点；在 B 中，相交节点前有 3 个节点。
— 请注意相交节点的值不为 1，因为在链表 A 和链表 B 之中值为 1 的节点 (A 中第二个节点和 B 中第三个节点) 是不同的节点。换句话说，它们在内存中指向两个不同的位置，而链表 A 和链表 B 中值为 8 的节点 (A 中第三个节点，B 中第四个节点) 在内存中指向相同的位置。
```

循环结束时，如果两条链表相交，那么此时 p 和 q 都在相交的起始节点处，返回 p；如果两条链表不相交，那么 p 和 q 都走到空节点，所以也可以返回 p，即空节点。

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def getIntersectionNode(self, headA, headB):
        # 初始化两个指针 p 和 q，分别指向链表 A 和链表 B 的头节点
        p, q = headA, headB

        # p 和 q 是不是指向同一个 ListNode 对象
        while p is not q:
            # 如果 p 为空，则将 p 移动到链表 B 的头节点
            if p:
                p = p.next
            else:
                p = headB
            # 如果 q 为空，则将 q 移动到链表 A 的头节点
            if q:
                q = q.next
            else:
                q = headA

        # 返回相交的节点，如果没有相交，则返回 None
        return p

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    # 假设链表节点的输入为列表的形式
    listA = list(map(int, input().split()))  # 输入链表A的值
    listB = list(map(int, input().split()))  # 输入链表B的值
    intersection_index = int(input())  # 输入相交节点的位置（如果没有相交则为 -1）

    # 构建链表A
    headA = ListNode(listA[0]) if listA else None
    current = headA
    for val in listA[1:]:
        current.next = ListNode(val)
        current = current.next

    # 构建链表B
    headB = ListNode(listB[0]) if listB else None
    current = headB
    for val in listB[1:]:
        current.next = ListNode(val)
        current = current.next

    # 如果有交点，连接交点
    if intersection_index != -1:
        intersection_node = headA
        for _ in range(intersection_index):
            intersection_node = intersection_node.next
        current.next = intersection_node

    # 创建 Solution 实例并调用 getIntersectionNode 方法
    solution = Solution()
    intersection = solution.getIntersectionNode(headA, headB)

    # 输出结果
    if intersection:
        print(intersection.val)
    else:
        print("None")

# 输入输出示例：
# 输入：
# 4 1 8 4 5
# 5 0 1 8 4 5
# 2
# 输出：
# 8
#
# 解释：
# 链表A：[4, 1, 8, 4, 5]，链表B：[5, 0, 1, 8, 4, 5]，它们在节点值为 8 的地方相交。
```

### [206. 反转链表](https://leetcode.cn/problems/reverse-linked-list/description/?envType=study-plan-v2&envId=top-100-liked)[头插法]

给你单链表的头节点 `head` ，请你反转链表，并返回反转后的链表。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2021/02/19/rev1ex1.jpg)

```text
输入：head = [1,2,3,4,5]
输出：[5,4,3,2,1]
```

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def reverseList(self, head):
        # 初始化两个指针，current 指向链表的头节点，prev 初始化为 None
        cur, pre = head, None

        # 遍历链表直到 cur 为空
        while cur:
            # 暂存当前节点的 next 指针，以便后续操作
            old_next = cur.next
            # 将当前节点的 next 指向 pre（即反转链表的方向）
            cur.next = pre
            # 将 prev 更新为当前节点，以便下次反转时使用
            pre = cur
            # 处理下一个节点，cur 移动到下一个节点
            cur = old_next

        # 返回新的头节点，即原链表的最后一个节点（现在是反转后的链表头）
        return pre

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    vals = list(map(int, input().split()))  # 输入链表节点值，用空格分隔

    # 创建链表
    head = ListNode(vals[0]) if vals else None
    current = head
    for val in vals[1:]:
        current.next = ListNode(val)
        current = current.next

    # 创建 Solution 实例并调用 reverseList 方法
    solution = Solution()
    reversed_head = solution.reverseList(head)

    # 输出结果
    result = []
    while reversed_head:
        result.append(str(reversed_head.val))
        reversed_head = reversed_head.next
    print(" ".join(result))

# 输入输出示例：
# 输入：
# 1 2 3 4 5
# 输出：
# 5 4 3 2 1
#
# 解释：
# 给定链表 [1, 2, 3, 4, 5]，反转后的链表为 [5, 4, 3, 2, 1]。
```

#### [92. 反转链表 II](https://leetcode.cn/problems/reverse-linked-list-ii/description/)

给你单链表的头指针 `head` 和两个整数 `left` 和 `right` ，其中 `left <= right` 。请你反转从位置 `left` 到位置 `right` 的链表节点，返回 **反转后的链表** 。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2021/02/19/rev2ex2.jpg)

```text
输入：head = [1,2,3,4,5], left = 2, right = 4
输出：[1,4,3,2,5]
```

![2026-01-13_204918(1)](https://raw.githubusercontent.com/1910853272/image/master/img/202601132050478.png)

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def reverseBetween(self, head, left, right):
        # 创建一个虚拟头节点 dummy，方便处理边界情况（例如 left 为 1 时）
        p0 = dummy = ListNode(next=head)

        # 找到反转区间的前一个节点 p0, 使其指向反转区间的开始位置
        for _ in range(left - 1):
            p0 = p0.next

        # 反转区间的开始节点 cur 和前一个节点 pre 初始化为 None
        pre = None
        cur = p0.next

        # 反转区间的节点，反转从 left 到 right
        for _ in range(right - left + 1):
            # 暂存 cur 的下一个节点
            nxt = cur.next
            # 反转当前节点的 next 指针
            cur.next = pre
            # 更新 pre 为当前节点
            pre = cur
            # 更新 cur 为下一个节点
            cur = nxt

        # p0 最终指向反转区间的前一个节点
        # pre 最终指向反转后区间的头节点
        # cur 最终指向反转后区间的尾节点
        # p0.next 最终指向反转后区间的尾节点
        p0.next.next = cur  # 连接反转后的尾节点与后续部分
        p0.next = pre  # 将反转后的部分的头节点连接到前一部分

        # 返回修改后的链表，跳过虚拟头节点
        return dummy.next

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    vals = list(map(int, input().split()))  # 输入链表节点值，用空格分隔
    left, right = map(int, input().split())  # 输入反转区间的左右位置

    # 创建链表
    head = ListNode(vals[0]) if vals else None
    current = head
    for val in vals[1:]:
        current.next = ListNode(val)
        current = current.next

    # 创建 Solution 实例并调用 reverseBetween 方法
    solution = Solution()
    reversed_head = solution.reverseBetween(head, left, right)

    # 输出结果
    result = []
    while reversed_head:
        result.append(str(reversed_head.val))
        reversed_head = reversed_head.next
    print(" ".join(result))

# 输入输出示例：
# 输入：
# 1 2 3 4 5
# 2 4
# 输出：
# 1 4 3 2 5
#
# 解释：
# 给定链表 [1, 2, 3, 4, 5] 和反转区间 [2, 4]，反转后的链表是 [1, 4, 3, 2, 5]。
```

### [234. 回文链表](https://leetcode.cn/problems/palindrome-linked-list/description/?envType=study-plan-v2&envId=top-100-liked) [快慢指针]

给你一个单链表的头节点 `head` ，请你判断该链表是否为回文链表。如果是，返回 `true` ；否则，返回 `false` 。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2021/03/03/pal1linked-list.jpg)

```text
输入：head = [1,2,2,1]
输出：true
```

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def isPalindrome(self, head):
        # 初始化一个空列表 vals，用来存储链表中的所有节点值
        vals = []
        # 设置一个当前节点指针，遍历链表
        current = head

        # 遍历整个链表，将每个节点的值添加到 vals 列表中
        while current:
            vals.append(current.val)  # 将当前节点的值添加到列表中
            current = current.next  # 移动到下一个节点

        # 判断列表是否等于它的反转列表，若相等则说明链表是回文
        return vals == vals[::-1]  # 返回判断结果

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    vals = list(map(int, input().split()))  # 输入链表节点值，用空格分隔

    # 创建链表
    head = ListNode(vals[0]) if vals else None
    current = head
    for val in vals[1:]:
        current.next = ListNode(val)
        current = current.next

    # 创建 Solution 实例并调用 isPalindrome 方法
    solution = Solution()
    result = solution.isPalindrome(head)

    # 输出结果
    print("True" if result else "False")

# 输入输出示例：
# 输入：
# 1 2 2 1
# 输出：
# True
#
# 解释：
# 给定链表 [1, 2, 2, 1]，该链表是回文链表，因此输出 True。
```

### [141. 环形链表](https://leetcode.cn/problems/linked-list-cycle/?envType=study-plan-v2&envId=top-100-liked) [快慢指针]

给你一个链表的头节点 `head` ，判断链表中是否有环。

如果链表中有某个节点，可以通过连续跟踪 `next` 指针再次到达，则链表中存在环。 为了表示给定链表中的环，评测系统内部使用整数 `pos` 来表示链表尾连接到链表中的位置（索引从 0 开始）。**注意：`pos` 不作为参数进行传递** 。仅仅是为了标识链表的实际情况。

_如果链表中存在环_ ，则返回 `true` 。 否则，返回 `false` 。

**示例 1：**

![img](https://assets.leetcode.cn/aliyun-lc-upload/uploads/2018/12/07/circularlinkedlist.png)

```text
输入：head = [3,2,0,-4], pos = 1
输出：true
解释：链表中有一个环，其尾部连接到第二个节点。
```

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def hasCycle(self, head):
        # 初始化慢指针和快指针为链表头节点
        slow = fast = head

        while fast and fast.next:  # 快指针和快指针的下一个节点都存在时继续循环
            slow = slow.next  # 慢指针走一步
            fast = fast.next.next  # 快指针走两步

            if fast is slow:  # 快指针追上了慢指针（即两者相遇），说明链表中有环
                return True

        return False  # 快指针遇到链表末尾（None），说明没有环

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    vals = list(map(int, input().split()))  # 输入链表节点值，用空格分隔
    pos = int(input())  # 输入链表中环的起始位置（若无环则为 -1）

    # 创建链表
    head = ListNode(vals[0]) if vals else None
    current = head
    nodes = [head]
    for val in vals[1:]:
        node = ListNode(val)
        current.next = node
        nodes.append(node)
        current = current.next

    # 如果有环，连接环的位置
    if pos != -1:
        current.next = nodes[pos]

    # 创建 Solution 实例并调用 hasCycle 方法
    solution = Solution()
    result = solution.hasCycle(head)

    # 输出结果
    print("True" if result else "False")

# 输入输出示例：
# 输入：
# 3 2 0 -4
# 1
# 输出：
# True
#
# 解释：
# 给定链表 [3, 2, 0, -4]，并且环从位置 1 开始，形成一个环。
# 所以输出 True。
```

### [142. 环形链表 II](https://leetcode.cn/problems/linked-list-cycle-ii/description/?envType=study-plan-v2&envId=top-100-liked) [快慢指针]

给定一个链表的头节点 `head` ，返回链表开始入环的第一个节点。 _如果链表无环，则返回 `null`。_

如果链表中有某个节点，可以通过连续跟踪 `next` 指针再次到达，则链表中存在环。 为了表示给定链表中的环，评测系统内部使用整数 `pos` 来表示链表尾连接到链表中的位置（**索引从 0 开始**）。如果 `pos` 是 `-1`，则在该链表中没有环。**注意：`pos` 不作为参数进行传递**，仅仅是为了标识链表的实际情况。

**不允许修改** 链表。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2018/12/07/circularlinkedlist.png)

```text
输入：head = [3,2,0,-4], pos = 1
输出：返回索引为 1 的链表节点
解释：链表中有一个环，其尾部连接到第二个节点。
```

![1741414978-wPTZwJ-lc142-3-c](https://raw.githubusercontent.com/1910853272/image/master/img/202601141518483.png)

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def detectCycle(self, head):
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if fast is slow:  # 相遇
                while slow is not head:  # 再走 a 步
                    slow = slow.next
                    head = head.next
                return slow
        return None

if __name__ == "__main__":
    vals = [3, 2, 0, -4]
    head = ListNode(vals[0]) if vals else None
    current = head
    nodes = [head]
    for val in vals[1:]:
        current.next = ListNode(val)
        current = current.next
        nodes.append(current)
    nodes[-1].next = nodes[1]
    result = Solution().solve(head)
    if result:
        print(result.val)
    else:
        print(None)

# 输入输出示例：
# 输入：
# 3 2 0 -4
# 1
# 输出：
# 2
#
# 解释：
# 给定链表 [3, 2, 0, -4]，并且环从位置 1 开始，形成一个环。输出环的起始节点值 2。
```

### [21. 合并两个有序链表](https://leetcode.cn/problems/merge-two-sorted-lists/description/?envType=study-plan-v2&envId=top-100-liked) [尾插法]

将两个升序链表合并为一个新的 **升序** 链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2020/10/03/merge_ex1.jpg)

```text
输入：l1 = [1,2,4], l2 = [1,3,4]
输出：[1,1,2,3,4,4]
```

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def mergeTwoLists(self, list1, list2):
        cur = dummy = ListNode()  # 用哨兵节点简化代码逻辑
        while list1 and list2:
            if list1.val < list2.val:
                cur.next = list1  # 把 list1 加到新链表中
                list1 = list1.next
            else:  # 注：相等的情况加哪个节点都是可以的
                cur.next = list2  # 把 list2 加到新链表中
                list2 = list2.next
            cur = cur.next # 移动到新链表尾部
        cur.next = list1 or list2  # 拼接剩余链表
        return dummy.next

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    list1_vals = list(map(int, input().split()))  # 输入链表1的节点值，用空格分隔
    list2_vals = list(map(int, input().split()))  # 输入链表2的节点值，用空格分隔

    # 创建链表1
    head1 = ListNode(list1_vals[0]) if list1_vals else None
    current = head1
    for val in list1_vals[1:]:
        current.next = ListNode(val)
        current = current.next

    # 创建链表2
    head2 = ListNode(list2_vals[0]) if list2_vals else None
    current = head2
    for val in list2_vals[1:]:
        current.next = ListNode(val)
        current = current.next

    # 创建 Solution 实例并调用 mergeTwoLists 方法
    solution = Solution()
    merged_head = solution.mergeTwoLists(head1, head2)

    # 输出结果
    result = []
    while merged_head:
        result.append(str(merged_head.val))
        merged_head = merged_head.next
    print(" ".join(result))

# 输入输出示例：
# 输入：
# 1 2 4
# 1 3 4
# 输出：
# 1 1 2 3 4 4
#
# 解释：
# 给定链表 [1, 2, 4] 和 [1, 3, 4]，合并后的链表是 [1, 1, 2, 3, 4, 4]。
```

### [2. 两数相加](https://leetcode.cn/problems/add-two-numbers/description/?envType=study-plan-v2&envId=top-100-liked)

给你两个 **非空** 的链表，表示两个非负的整数。它们每位数字都是按照 **逆序** 的方式存储的，并且每个节点只能存储 **一位** 数字。

请你将两个数相加，并以相同形式返回一个表示和的链表。

你可以假设除了数字 0 之外，这两个数都不会以 0 开头。

**示例 1：**

![img](https://assets.leetcode.cn/aliyun-lc-upload/uploads/2021/01/02/addtwonumber1.jpg)

```text
输入：l1 = [2,4,3], l2 = [5,6,4]
输出：[7,0,8]
解释：342 + 465 = 807.
```

![2026-01-15_200004](https://raw.githubusercontent.com/1910853272/image/master/img/202601152000848.png)

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def addTwoNumbers(self, l1, l2):
        cur = dummy = ListNode()  # 哨兵节点，
        carry = 0  # 进位
        while l1 or l2 or carry:  # 有一个不是空节点，或者还有进位，就继续迭代
            if l1:
                carry += l1.val  # 节点值和进位加在一起
                l1 = l1.next  # 下一个节点
            if l2:
                carry += l2.val  # 节点值和进位加在一起
                l2 = l2.next  # 下一个节点
            cur.next = ListNode(carry % 10)  # 每个节点保存一个数位
            carry //= 10  # 新的进位
            cur = cur.next  # 下一个节点
        return dummy.next  # 哨兵节点的下一个节点就是头节点

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    l1_vals = list(map(int, input().split()))  # 输入链表1的节点值，用空格分隔
    l2_vals = list(map(int, input().split()))  # 输入链表2的节点值，用空格分隔

    # 创建链表1
    head1 = ListNode(l1_vals[0]) if l1_vals else None
    current = head1
    for val in l1_vals[1:]:
        current.next = ListNode(val)
        current = current.next

    # 创建链表2
    head2 = ListNode(l2_vals[0]) if l2_vals else None
    current = head2
    for val in l2_vals[1:]:
        current.next = ListNode(val)
        current = current.next

    # 创建 Solution 实例并调用 addTwoNumbers 方法
    solution = Solution()
    result_head = solution.addTwoNumbers(head1, head2)

    # 输出结果
    result = []
    while result_head:
        result.append(str(result_head.val))
        result_head = result_head.next
    print(" ".join(result))

# 输入输出示例：
# 输入：
# 2 4 3
# 5 6 4
# 输出：
# 7 0 8
#
# 解释：
# 给定两个链表 (2 -> 4 -> 3) 和 (5 -> 6 -> 4)，
# 它们代表的数字是 342 和 465，求和后得到 807，
# 对应的链表是 (7 -> 0 -> 8)。
```

### [19. 删除链表的倒数第 N 个结点](https://leetcode.cn/problems/remove-nth-node-from-end-of-list/description/?envType=study-plan-v2&envId=top-100-liked) [双指针]

给你一个链表，删除链表的倒数第 `n` 个结点，并且返回链表的头结点。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2020/10/03/remove_ex1.jpg)

```text
输入：head = [1,2,3,4,5], n = 2
输出：[1,2,3,5]
```

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def removeNthFromEnd(self, head, n):
        # 由于可能会删除链表头部，用哨兵节点简化代码
        left = right = dummy = ListNode(next=head) # 把 dummy 接到已有链表前面
        for _ in range(n):
            right = right.next  # 右指针先向右走 n 步
        while right.next:
            left = left.next
            right = right.next  # 左右指针一起走
        left.next = left.next.next  # 左指针的下一个节点就是倒数第 n 个节点
        return dummy.next

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    vals = list(map(int, input().split()))  # 输入链表节点值，用空格分隔
    n = int(input())  # 输入需要删除的节点的位置（从后往前数）

    # 创建链表
    head = ListNode(vals[0]) if vals else None
    current = head
    for val in vals[1:]:
        current.next = ListNode(val)
        current = current.next

    # 创建 Solution 实例并调用 removeNthFromEnd 方法
    solution = Solution()
    new_head = solution.removeNthFromEnd(head, n)

    # 输出结果
    result = []
    while new_head:
        result.append(str(new_head.val))
        new_head = new_head.next
    print(" ".join(result))

# 输入输出示例：
# 输入：
# 1 2 3 4 5
# 2
# 输出：
# 1 2 3 5
#
# 解释：
# 给定链表 [1, 2, 3, 4, 5] 和 n = 2，删除倒数第 2 个节点后，链表变为 [1, 2, 3, 5]。
```

### [24. 两两交换链表中的节点](https://leetcode.cn/problems/swap-nodes-in-pairs/description/?envType=study-plan-v2&envId=top-100-liked)

给你一个链表，两两交换其中相邻的节点，并返回交换后链表的头节点。你必须在不修改节点内部的值的情况下完成本题（即，只能进行节点交换）。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2020/10/03/swap_ex1.jpg)

```text
输入：head = [1,2,3,4]
输出：[2,1,4,3]
```

![1691121590-SWAYuj-lc24-c](https://raw.githubusercontent.com/1910853272/image/master/img/202601161447867.png)

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def swapPairs(self, head):
        node0 = dummy = ListNode(next=head)  # 用哨兵节点简化代码逻辑
        node1 = head  # 头节点是1号节点
        while node1 and node1.next:  # 至少有两个节点
            node2 = node1.next  # 2号节点
            node3 = node2.next  # 3号节点

            node0.next = node2  # 0 -> 2
            node2.next = node1  # 2 -> 1
            node1.next = node3  # 1 -> 3

            node0 = node1  # 下一轮交换，0 是 1
            node1 = node3  # 下一轮交换，1 是 3
        return dummy.next  # 返回新链表的头节点

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    vals = list(map(int, input().split()))  # 输入链表节点值，用空格分隔

    # 创建链表
    head = ListNode(vals[0]) if vals else None
    current = head
    for val in vals[1:]:
        current.next = ListNode(val)
        current = current.next

    # 创建 Solution 实例并调用 swapPairs 方法
    solution = Solution()
    new_head = solution.swapPairs(head)

    # 输出结果
    result = []
    while new_head:
        result.append(str(new_head.val))
        new_head = new_head.next
    print(" ".join(result))

# 输入输出示例：
# 输入：
# 1 2 3 4 5
# 输出：
# 2 1 4 3 5
#
# 解释：
# 给定链表 [1, 2, 3, 4, 5]，每两个相邻节点交换后，链表变为 [2, 1, 4, 3, 5]。
```

### [25. K 个一组翻转链表](https://leetcode.cn/problems/reverse-nodes-in-k-group/?envType=study-plan-v2&envId=top-100-liked)

给你链表的头节点 `head` ，每 `k` 个节点一组进行翻转，请你返回修改后的链表。

`k` 是一个正整数，它的值小于或等于链表的长度。如果节点总数不是 `k` 的整数倍，那么请将最后剩余的节点保持原有顺序。

你不能只是单纯的改变节点内部的值，而是需要实际进行节点交换。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2020/10/03/reverse_ex1.jpg)

```text
输入：head = [1,2,3,4,5], k = 2
输出：[2,1,4,3,5]
```

**初始化链表**

![1](https://raw.githubusercontent.com/1910853272/image/master/img/202601161548283.png)

**k = 2, 进入反转**

![2](https://raw.githubusercontent.com/1910853272/image/master/img/202601161548527.png)

![3](https://raw.githubusercontent.com/1910853272/image/master/img/202601161549714.png)

![4](https://raw.githubusercontent.com/1910853272/image/master/img/202601161549462.png)

**跳出反转逻辑，进行交换**

![5](https://raw.githubusercontent.com/1910853272/image/master/img/202601161549656.png)

![6](https://raw.githubusercontent.com/1910853272/image/master/img/202601161549607.png)

![7](https://raw.githubusercontent.com/1910853272/image/master/img/202601161550489.png)

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def reverseKGroup(self, head, k):
        # 统计链表节点个数
        n = 0
        cur = head
        while cur:
            n += 1  # 每遍历一个节点，n 增加 1
            cur = cur.next  # 移动到下一个节点

        # 使用哨兵节点 p0 以简化链表操作
        p0 = dummy = ListNode(next=head)
        pre = None  # 记录反转区间的前一个节点
        cur = head  # 从链表头开始

        # 按照 k 个节点为一组进行反转处理
        while n >= k:
            n -= k  # 每处理完一组，剩余节点数减少 k 个
            for _ in range(k):  # 对当前组的 k 个节点进行反转
                nxt = cur.next  # 记录当前节点的下一个节点
                cur.next = pre  # 将当前节点的 next 指向前一个节点，进行反转
                pre = cur  # 更新 pre 为当前节点
                cur = nxt  # 更新当前节点为下一个节点

            # 处理完一组后，跳出反转逻辑，进行交换：调整连接：p0.next 连接到新头节点，p0 继续指向新尾节点
            nxt = p0.next  # 记录当前组反转后的头节点
            nxt.next = cur  # 将当前组的尾节点的 next 指向下一个组的头节点
            p0.next = pre  # 将当前组的头节点连接到 p0
            p0 = nxt  # p0 更新为当前组的尾节点，为下一组的操作做准备

        # 返回反转后的链表头
        return dummy.next

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    vals = list(map(int, input().split()))  # 输入链表节点值，用空格分隔
    k = int(input())  # 输入需要反转的组大小 k

    # 创建链表
    head = ListNode(vals[0]) if vals else None
    current = head
    for val in vals[1:]:
        current.next = ListNode(val)
        current = current.next

    # 创建 Solution 实例并调用 reverseKGroup 方法
    solution = Solution()
    new_head = solution.reverseKGroup(head, k)

    # 输出结果
    result = []
    while new_head:
        result.append(str(new_head.val))
        new_head = new_head.next
    print(" ".join(result))

# 输入输出示例：
# 输入：
# 1 2 3 4 5
# 3
# 输出：
# 3 2 1 4 5
#
# 解释：
# 给定链表 [1, 2, 3, 4, 5] 和 k = 3，反转链表的前 3 个节点后，链表变为 [3, 2, 1, 4, 5]。
```

### [138. 随机链表的复制](https://leetcode.cn/problems/copy-list-with-random-pointer/?envType=study-plan-v2&envId=top-100-liked) [哈希表]

给你一个长度为 `n` 的链表，每个节点包含一个额外增加的随机指针 `random` ，该指针可以指向链表中的任何节点或空节点。

构造这个链表的 **[深拷贝](https://baike.baidu.com/item/深拷贝/22785317?fr=aladdin)**。 深拷贝应该正好由 `n` 个 **全新** 节点组成，其中每个新节点的值都设为其对应的原节点的值。新节点的 `next` 指针和 `random` 指针也都应指向复制链表中的新节点，并使原链表和复制链表中的这些指针能够表示相同的链表状态。**复制链表中的指针都不应指向原链表中的节点** 。

例如，如果原链表中有 `X` 和 `Y` 两个节点，其中 `X.random --> Y` 。那么在复制链表中对应的两个节点 `x` 和 `y` ，同样有 `x.random --> y` 。

返回复制链表的头节点。

用一个由 `n` 个节点组成的链表来表示输入/输出中的链表。每个节点用一个 `[val, random_index]` 表示：

- `val`：一个表示 `Node.val` 的整数。
- `random_index`：随机指针指向的节点索引（范围从 `0` 到 `n-1`）；如果不指向任何节点，则为 `null` 。

你的代码只接受原链表的头节点 `head` 作为传入参数。

**示例 1：**

![img](https://assets.leetcode.cn/aliyun-lc-upload/uploads/2020/01/09/e1.png)

```text
输入：head = [[7,null],[13,0],[11,4],[10,2],[1,0]]
输出：[[7,null],[13,0],[11,4],[10,2],[1,0]]
```

```python
class Node:
    def __init__(self, val=0, next=None, random=None):
        self.val = val
        self.next = next
        self.random = random

class Solution:
    def copyRandomList(self, head):
        # 1. 如果头节点为空，直接返回 None
        if not head:
            return None

        # 2. 创建一个字典用于存储原链表节点与新链表节点的映射关系
        dic = {}

        # 3. 复制每个节点，并建立“原节点 -> 新节点”的映射
        cur = head  # 从头节点开始遍历
        while cur:
            dic[cur] = Node(cur.val)  # 为每个原节点创建新节点并存入字典
            cur = cur.next  # 继续遍历下一个节点

        # 4. 构建新节点的 next 和 random 指针
        cur = head  # 重新从头节点开始遍历
        while cur:
            dic[cur].next = dic.get(cur.next)  # 将新节点的 next 指针指向原节点 next 对应的新节点
            dic[cur].random = dic.get(cur.random)  # 将新节点的 random 指针指向原节点 random 对应的新节点
            cur = cur.next  # 继续遍历下一个节点

        # 5. 返回新链表的头节点
        return dic[head]  # 返回新链表的头节点，它是字典中原链表头节点对应的值

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    vals = list(map(int, input().split()))  # 输入链表节点值，用空格分隔
    random_indices = list(map(int, input().split()))  # 输入链表的 random 指针索引（-1 表示没有 random 指针）

    # 创建链表
    head = Node(vals[0]) if vals else None
    nodes = [head]
    current = head
    for val in vals[1:]:
        node = Node(val)
        current.next = node
        current = current.next
        nodes.append(node)

    # 设置 random 指针
    for i, random_index in enumerate(random_indices):
        if random_index != -1:
            nodes[i].random = nodes[random_index]

    # 创建 Solution 实例并调用 copyRandomList 方法
    solution = Solution()
    copied_head = solution.copyRandomList(head)

    # 输出结果
    result = []
    current = copied_head
    while current:
        random_val = current.random.val if current.random else None
        result.append(f"{current.val}({random_val})")
        current = current.next
    print(" -> ".join(result))

# 输入输出示例：
# 输入：
# 7 13 11 10 1
# -1 0 4 2 -1
# 输出：
# 7(None) -> 13(7) -> 11(1) -> 10(11) -> 1(None)
#
# 解释：
# 给定链表 [7, 13, 11, 10, 1]，其中每个节点的 random 指针指向其它节点或 None。
# 新链表的节点值以及对应的 random 指针值（如有）被正确复制，并按顺序输出。
```

### [148. 排序链表](https://leetcode.cn/problems/sort-list/description/?envType=study-plan-v2&envId=top-100-liked)

给你链表的头结点 `head` ，请将其按 **升序** 排列并返回 **排序后的链表** 。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2020/09/14/sort_list_1.jpg)

```text
输入：head = [4,2,1,3]
输出：[1,2,3,4]
```

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def sortList(self, head):
        vals = []
        while head:
            vals.append(head.val)  # 将当前节点的值加入到列表 vals
            head = head.next  # 移动到下一个节点
        # 对列表 vals 进行排序
        vals.sort()
        # 创建一个新的链表 dummy 作为头节点，current 用来遍历新链表
        current = dummy = ListNode()

        # 遍历排序后的列表 vals，构建新的链表
        for v in vals:
            current.next = ListNode(v)  # 为每个排序后的值创建一个新的节点
            current = current.next  # 更新 current 为当前新节点

        # 返回排序后的链表头节点（去掉 dummy 节点）
        return dummy.next

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    vals = list(map(int, input().split()))  # 输入链表节点值，用空格分隔

    # 创建链表
    head = ListNode(vals[0]) if vals else None
    current = head
    for val in vals[1:]:
        current.next = ListNode(val)
        current = current.next

    # 创建 Solution 实例并调用 sortList 方法
    solution = Solution()
    sorted_head = solution.sortList(head)

    # 输出结果
    result = []
    while sorted_head:
        result.append(str(sorted_head.val))
        sorted_head = sorted_head.next
    print(" ".join(result))

# 输入输出示例：
# 输入：
# 4 2 1 3
# 输出：
# 1 2 3 4
#
# 解释：
# 给定链表 [4, 2, 1, 3]，经过排序后链表变为 [1, 2, 3, 4]。
```

#### [147. 对链表进行插入排序](https://leetcode.cn/problems/insertion-sort-list/description/)

给定单个链表的头 `head` ，使用 **插入排序** 对链表进行排序，并返回 _排序后链表的头_ 。

**插入排序** 算法的步骤:

1. 插入排序是迭代的，每次只移动一个元素，直到所有元素可以形成一个有序的输出列表。
2. 每次迭代中，插入排序只从输入数据中移除一个待排序的元素，找到它在序列中适当的位置，并将其插入。
3. 重复直到所有输入数据插入完为止。

下面是插入排序算法的一个图形示例。部分排序的列表(黑色)最初只包含列表中的第一个元素。每次迭代时，从输入数据中删除一个元素(红色)，并就地插入已排序的列表中。

对链表进行插入排序。

![img](https://pic.leetcode.cn/1724130387-qxfMwx-Insertion-sort-example-300px.gif)

**示例 1：**

![img](https://pic.leetcode.cn/1724130414-QbPAjl-image.png)

```text
输入: head = [4,2,1,3]
输出: [1,2,3,4]
```

本题使用插入排序时会显示超时，因此采用链表转数组进行快排再转回链表

```python
class Solution:
    def insertionSortList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode()

        while head:
            prev = dummy
            # 寻找合适的插入位置
            while prev.next and prev.next.val < head.val:
                prev = prev.next
            # 当前数 head 值小于 prev.next 的值，插入到 prev 和 prev.next 之间
            # 这里在插入的同时更新了 head，这样在写法上可以不用临时变量
            prev.next, head.next, head = head, prev.next, head.next

        return dummy.next
```

### [23. 合并 K 个升序链表](https://leetcode.cn/problems/merge-k-sorted-lists/?envType=study-plan-v2&envId=top-100-liked) [最小堆]

给你一个链表数组，每个链表都已经按升序排列。请你将所有链表合并到一个升序链表中，返回合并后的链表。

**示例 1：**

```text
输入：lists = [[1,4,5],[1,3,4],[2,6]]
输出：[1,1,2,3,4,4,5,6]
解释：链表数组如下：
[
  1->4->5,
  1->3->4,
  2->6
]
将它们合并到一个有序链表中得到。
1->1->2->3->4->4->5->6
```

```python
from heapq import heapify, heappop, heappush
from typing import List, Optional

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

    # 让堆可以比较节点大小
    def __lt__(self, other):
        return self.val < other.val

class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        cur = dummy = ListNode()  # 哨兵节点，作为合并后链表头节点的前一个节点
        h = []
        for head in lists: # 把所有非空链表的头节点入堆
            if head:
                h.append(head)
        heapify(h)  # 最小堆化

        while h:  # 循环直到堆为空
            node = heappop(h)  # 剩余节点中的最小节点
            if node.next:  # 下一个节点不为空
                heappush(h, node.next)  # 下一个节点有可能是最小节点，入堆
            cur.next = node  # 把 node 添加到新链表的末尾
            cur = cur.next  # 准备合并下一个节点

        return dummy.next  # 哨兵节点的下一个节点就是新链表的头节点

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    k = int(input())  # 输入链表的个数
    lists = []

    # 输入 k 个链表
    for _ in range(k):
        vals = list(map(int, input().split()))  # 输入一个链表的节点值
        head = ListNode(vals[0]) if vals else None
        current = head
        for val in vals[1:]:
            current.next = ListNode(val)
            current = current.next
        lists.append(head)

    # 创建 Solution 实例并调用 mergeKLists 方法
    solution = Solution()
    merged_head = solution.mergeKLists(lists)

    # 输出结果
    result = []
    while merged_head:
        result.append(str(merged_head.val))
        merged_head = merged_head.next
    print(" ".join(result))

# 输入输出示例：
# 输入：
# 3
# 1 4 5 7
# 1 3 4 6
# 2 6
# 输出：
# 1 1 2 3 4 4 5 6 6 7
#
# 解释：
# 给定链表：
# [1 -> 4 -> 5 -> 7]
# [1 -> 3 -> 4 -> 6]
# [2 -> 6]
# 合并后的链表为 [1 -> 1 -> 2 -> 3 -> 4 -> 4 -> 5 -> 6 -> 6 -> 7]。
```

### [146. LRU 缓存](https://leetcode.cn/problems/lru-cache/?envType=study-plan-v2&envId=top-100-liked) [双向链表/哈希表]

请你设计并实现一个满足 [LRU (最近最少使用) 缓存](https://baike.baidu.com/item/LRU) 约束的数据结构。

实现 `LRUCache` 类：

- `LRUCache(int capacity)` 以 **正整数** 作为容量 `capacity` 初始化 LRU 缓存
- `int get(int key)` 如果关键字 `key` 存在于缓存中，则返回关键字的值，否则返回 `-1` 。
- `void put(int key, int value)` 如果关键字 `key` 已经存在，则变更其数据值 `value` ；如果不存在，则向缓存中插入该组 `key-value` 。如果插入操作导致关键字数量超过 `capacity` ，则应该 **逐出** 最久未使用的关键字。

函数 `get` 和 `put` 必须以 `O(1)` 的平均时间复杂度运行。

**示例：**

```text
输入
["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]
[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]
输出
[null, null, null, 1, null, -1, null, -1, 3, 4]

解释
LRUCache lRUCache = new LRUCache(2);
lRUCache.put(1, 1); // 缓存是 {1=1}
lRUCache.put(2, 2); // 缓存是 {1=1, 2=2}
lRUCache.get(1);    // 返回 1
lRUCache.put(3, 3); // 该操作会使得关键字 2 作废，缓存是 {1=1, 3=3}
lRUCache.get(2);    // 返回 -1 (未找到)
lRUCache.put(4, 4); // 该操作会使得关键字 1 作废，缓存是 {4=4, 3=3}
lRUCache.get(1);    // 返回 -1 (未找到)
lRUCache.get(3);    // 返回 3
lRUCache.get(4);    // 返回 4
```

![1696039105-PSyHej-146-3-c](https://raw.githubusercontent.com/1910853272/image/master/img/202601191701084.png)

```python
class ListNode:
    def __init__(self, key=0, value=0):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.dummy = ListNode()  # 哨兵节点
        self.dummy.prev = self.dummy
        self.dummy.next = self.dummy
        self.cache = {}

    def get(self, key: int) -> int:
        node = self.get_node(key)  # get_node 会把对应节点移到链表头部
        return node.value if node else -1

    def put(self, key: int, value: int) -> None:
        node = self.get_node(key)  # get_node 会把对应节点移到链表头部
        if node:  # 有这本书
            node.value = value  # 更新 value
            return
        self.cache[key] = node = ListNode(key, value)  # 新书
        self.push_front(node)  # 放到最上面
        if len(self.cache) > self.capacity:  # 书太多了
            back_node = self.dummy.prev
            del self.cache[back_node.key]
            self.remove(back_node)  # 去掉最后一本书

    # 获取 key 对应的节点，同时把该节点移到链表头部
    def get_node(self, key: int) -> ListNode:
        if key not in self.cache:  # 没有这本书
            return None
        node = self.cache[key]  # 有这本书
        self.remove(node)  # 把这本书抽出来
        self.push_front(node)  # 放到最上面
        return node

    # 删除一个节点（抽出一本书）
    def remove(self, x: ListNode) -> None:
        x.prev.next = x.next
        x.next.prev = x.prev

    # 在链表头添加一个节点（把一本书放到最上面）
    def push_front(self, x: ListNode) -> None:
        x.prev = self.dummy
        x.next = self.dummy.next
        x.prev.next = x
        x.next.prev = x

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    capacity = int(input())  # 输入缓存的容量
    n = int(input())  # 输入操作的数量
    cache = LRUCache(capacity)  # 创建 LRUCache 实例

    for _ in range(n):
        operation = input().split()  # 读取操作
        if operation[0] == "get":
            key = int(operation[1])
            print(cache.get(key))
        elif operation[0] == "put":
            key, value = map(int, operation[1:])
            cache.put(key, value)

# 输入输出示例：
# 输入：
# 2
# 4
# put 1 1
# put 2 2
# get 1
# put 3 3
# 输出：
# 1
# 输入：
# 2
# 6
# put 1 1
# put 2 2
# get 1
# put 3 3
# get 2
# put 4 4
# 输出：
# 1
# -1
#
# 解释：
# 1. 执行 put 1 1，缓存是 {1=1}
# 2. 执行 put 2 2，缓存是 {1=1, 2=2}
# 3. 执行 get 1，返回 1
# 4. 执行 put 3 3，缓存是 {1=1, 2=2, 3=3}，2 被移除
# 5. 执行 get 2，返回 -1
# 6. 执行 put 4 4，缓存是 {1=1, 3=3, 4=4}，1 被移除
```

## 二叉树

### [94. 二叉树的中序遍历](https://leetcode.cn/problems/binary-tree-inorder-traversal/description/?envType=study-plan-v2&envId=top-100-liked)

给定一个二叉树的根节点 `root` ，返回 _它的 **中序** 遍历_ 。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2020/09/15/inorder_1.jpg)

```text
输入：root = [1,null,2,3]
输出：[1,3,2]
```

递归写法：

```python
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def inorderTraversal(self, root):
        def dfs(node):
            if node is None:
                return
            dfs(node.left)       # 左
            ans.append(node.val) # 根（这行代码移到前面就是前序，移到后面就是后序）
            dfs(node.right)      # 右

        ans = []
        dfs(root)
        return ans

# 主函数用来处理输入输出
if __name__ == "__main__":
    vals = list(map(int,input().split()))
    if not vals:
        root=None
    else:
        root=TreeNode(vals[0])
        queue=deque([root])
        i=1
        while queue:
            parent=queue.popleft()
            if i<len(vals):
                parent.left=TreeNode(vals[i])
                queue.append(parent.left)
                i+=1
            if i<len(vals):
                parent.right=TreeNode(vals[i])
                queue.append(parent.right)
                i+=1

    result=Solution().inorderTraversal(root)
    print(" ".join(map(str,result)))

# 输入输出示例：
# 输入：
# 1 2 3
# 输出：
# 2 1 3
#
# 解释：
# 对于二叉树：
#     1
#    / \
#   2   3
# 中序遍历结果为 [2, 1, 3]。
```

显式栈写法：

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def inorderTraversal(self, root):
        ans = []
        stack = []
        current = root

        # 循环直到当前节点为空且栈为空
        while current or stack:
            while current:
                stack.append(current)  # 将当前节点入栈
                current = current.left  # 继续向左遍历

            # 弹出栈顶元素，将其值加入结果列表
            current = stack.pop()
            ans.append(current.val)

            # 处理右子树
            current = current.right

        return ans

# 主函数用来处理输入输出
if __name__ == "__main__":
    vals = list(map(int,input().split()))
    if not vals:
        root=None
    else:
        root=TreeNode(vals[0])
        queue=deque([root])
        i=1
        while queue:
            parent=queue.popleft()
            if i<len(vals):
                parent.left=TreeNode(vals[i])
                queue.append(parent.left)
                i+=1
            if i<len(vals):
                parent.right=TreeNode(vals[i])
                queue.append(parent.right)
                i+=1

    result=Solution().inorderTraversal(root)
    print(" ".join(map(str,result)))

# 输入输出示例：
# 输入：
# 1 2 3
# 输出：
# 2 1 3
#
# 解释：
# 对于二叉树：
#     1
#    / \
#   2   3
# 中序遍历结果为 [2, 1, 3]。
```

#### [144. 二叉树的前序遍历](https://leetcode.cn/problems/binary-tree-preorder-traversal/description/)

给你二叉树的根节点 `root` ，返回它节点值的 **前序** 遍历。

**示例 1：**

**输入：**root = [1,null,2,3]

**输出：**[1,2,3]

**解释：**

![img](https://assets.leetcode.com/uploads/2024/08/29/screenshot-2024-08-29-202743.png)

递归写法：

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def preorderTraversal(self, root):
        def dfs(node):
            if node is None:
                return
            ans.append(node.val)  # 根
            dfs(node.left)         # 左
            dfs(node.right)        # 右

        ans = []
        dfs(root)
        return ans

# 主函数用来处理输入输出
if __name__ == "__main__":
    vals = list(map(int,input().split()))
    if not vals:
        root=None
    else:
        root=TreeNode(vals[0])
        queue=deque([root])
        i=1
        while queue:
            parent=queue.popleft()
            if i<len(vals):
                parent.left=TreeNode(vals[i])
                queue.append(parent.left)
                i+=1
            if i<len(vals):
                parent.right=TreeNode(vals[i])
                queue.append(parent.right)
                i+=1

    result=Solution().inorderTraversal(root)
    print(" ".join(map(str,result)))

# 输入输出示例：
# 输入：
# 1 2 3
# 输出：
# 1 2 3
#
# 解释：
# 对于二叉树：
#     1
#    / \
#   2   3
# 前序遍历结果为 [1, 2, 3]。
```

显式栈写法：

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def preorderTraversal(self, root):
        ans = []
        stack = []
        current = root

        # 循环直到栈为空且当前节点为 None
        while stack or current:
            # 先遍历当前节点的值，并将其压入栈
            while current:
                ans.append(current.val)  # 访问当前节点并将其值加入结果列表
                stack.append(current)     # 将当前节点压入栈
                current = current.left   # 移动到左子节点

            # 弹出栈顶节点并访问其右子节点
            current = stack.pop()
            current = current.right

        # 返回前序遍历的结果
        return ans

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    vals = list(map(int, input().split()))  # 输入二叉树节点值，用空格分隔

    # 创建二叉树
    if not vals:
        root = None
    else:
        root = TreeNode(vals[0])
        nodes = [root]
        for val in vals[1:]:
            node = TreeNode(val)
            nodes.append(node)
            if nodes:
                parent = nodes.pop(0)
                if not parent.left:
                    parent.left = node
                else:
                    parent.right = node

    # 创建 Solution 实例并调用 preorderTraversal 方法
    solution = Solution()
    result = solution.preorderTraversal(root)

    # 输出结果
    print(" ".join(map(str, result)))

# 输入输出示例：
# 输入：
# 1 2 3
# 输出：
# 1 2 3
#
# 解释：
# 对于二叉树：
#     1
#    / \
#   2   3
# 前序遍历结果为 [1, 2, 3]。
```

#### [145. 二叉树的后序遍历](https://leetcode.cn/problems/binary-tree-postorder-traversal/)

给你一棵二叉树的根节点 `root` ，返回其节点值的 **后序遍历** 。

**示例 1：**

**输入：**root = [1,null,2,3]

**输出：**[3,2,1]

**解释：**

![img](https://assets.leetcode.com/uploads/2024/08/29/screenshot-2024-08-29-202743.png)

递归写法：

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def postorderTraversal(self, root):
        def dfs(root):
            if not root:
                return
            dfs(root.left)
            dfs(root.right)
            ans.append(root.val)

        ans = []
        dfs(root)
        return ans

# 主函数用来处理输入输出
if __name__ == "__main__":
    vals = list(map(int,input().split()))
    if not vals:
        root=None
    else:
        root=TreeNode(vals[0])
        queue=deque([root])
        i=1
        while queue:
            parent=queue.popleft()
            if i<len(vals):
                parent.left=TreeNode(vals[i])
                queue.append(parent.left)
                i+=1
            if i<len(vals):
                parent.right=TreeNode(vals[i])
                queue.append(parent.right)
                i+=1

    result=Solution().inorderTraversal(root)
    print(" ".join(map(str,result)))

# 输入输出示例：
# 输入：
# 1 2 3
# 输出：
# 2 3 1
#
# 解释：
# 对于二叉树：
#     1
#    / \
#   2   3
# 后序遍历结果为 [2, 3, 1]。
```

显式栈写法：

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def postorderTraversal(self, root):
        ans = []
        stack = []
        pre = None  # 记录上一个访问的节点，用于判断是否访问右子树
        cur = root

        while cur or stack:  # 当当前节点不为空或栈不为空时继续遍历
            while cur:  # 遍历到最左侧的叶子节点
                stack.append(cur)  # 将当前节点入栈
                cur = cur.left  # 继续向左子树遍历

            cur = stack.pop()  # 弹出栈顶节点

            if not cur.right or cur.right == pre:  # 如果当前节点没有右子树，或者右子树已经被访问
                ans.append(cur.val)  # 访问当前节点
                pre = cur  # 更新上一个访问的节点
                cur = None  # 将当前节点置为 None，表示当前节点已经访问完
            else:
                stack.append(cur)  # 如果当前节点有右子树且右子树未被访问，将当前节点重新入栈
                cur = cur.right  # 转向右子树进行遍历

        return ans

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    vals = list(map(int, input().split()))  # 输入二叉树节点值，用空格分隔

    # 创建二叉树
    if not vals:
        root = None
    else:
        root = TreeNode(vals[0])
        nodes = [root]
        for val in vals[1:]:
            node = TreeNode(val)
            nodes.append(node)
            if nodes:
                parent = nodes.pop(0)
                if not parent.left:
                    parent.left = node
                else:
                    parent.right = node

    # 创建 Solution 实例并调用 postorderTraversal 方法
    solution = Solution()
    result = solution.postorderTraversal(root)

    # 输出结果
    print(" ".join(map(str, result)))

# 输入输出示例：
# 输入：
# 1 2 3
# 输出：
# 2 3 1
#
# 解释：
# 对于二叉树：
#     1
#    / \
#   2   3
# 后序遍历结果为 [2, 3, 1]。
```

### [104. 二叉树的最大深度](https://leetcode.cn/problems/maximum-depth-of-binary-tree/description/?envType=study-plan-v2&envId=top-100-liked)

给定一个二叉树 `root` ，返回其最大深度。

二叉树的 **最大深度** 是指从根节点到最远叶子节点的最长路径上的节点数。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2020/11/26/tmp-tree.jpg)

```text
输入：root = [3,9,20,null,null,15,7]
输出：3
```

```python
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def maxDepth(self, root):
        def dfs(root):
            if not root:
                return 0
            return max(dfs(root.left), dfs(root.right)) + 1

        return dfs(root)

# 主函数用来处理输入输出
if __name__ == "__main__":
    vals = input().split()
    if not vals:
        root=None
    else:
        root=TreeNode(vals[0])
        queue=deque([root])
        i=1
        while queue:
            parent=queue.popleft()
            if i<len(vals):
                parent.left=TreeNode(vals[i])
                queue.append(parent.left)
                i+=1
            if i<len(vals):
                parent.right=TreeNode(vals[i])
                queue.append(parent.right)
                i+=1

    result=Solution().solve(root)
    print(result)

# 输入输出示例：
# 输入：
# 3 9 20 None None 15 7
# 输出：
# 3
#
# 解释：
# 对于二叉树：
#     3
#    / \
#   9  20
#      /  \
#     15   7
# 最大深度为 3。
```

### [226. 翻转二叉树](https://leetcode.cn/problems/invert-binary-tree/description/?envType=study-plan-v2&envId=top-100-liked)

给你一棵二叉树的根节点 `root` ，翻转这棵二叉树，并返回其根节点。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2021/03/14/invert1-tree.jpg)

```text
输入：root = [4,2,7,1,3,6,9]
输出：[4,7,2,9,6,3,1]
```

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def invertTree(self, root):
        def dfs(root):
            if not root:
                return
            root.left, root.right = root.right, root.left
            dfs(root.left)
            dfs(root.right)

        dfs(root)
        return root

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    vals = list(map(int, input().split()))  # 输入二叉树节点值，用空格分隔

    # 创建二叉树
    if not vals:
        root = None
    else:
        root = TreeNode(vals[0])
        nodes = [root]
        for val in vals[1:]:
            node = TreeNode(val)
            nodes.append(node)
            if nodes:
                parent = nodes.pop(0)
                if not parent.left:
                    parent.left = node
                else:
                    parent.right = node

    # 创建 Solution 实例并调用 invertTree 方法
    solution = Solution()
    inverted_root = solution.invertTree(root)

    # 输出结果
    result = []
    def inorder(node):
        if not node:
            return
        inorder(node.left)
        result.append(str(node.val))
        inorder(node.right)

    inorder(inverted_root)
    print(" ".join(result))

# 输入输出示例：
# 输入：
# 4 2 7 1 3 6 9
# 输出：
# 9 7 6 3 1 2 4
#
# 解释：
# 对于二叉树：
#     4
#    / \
#   2   7
#  / \ / \
# 1  3 6  9
#
# 反转后的二叉树为：
#     4
#    / \
#   7   2
#  / \ / \
# 9  6 3  1
#
# 经过中序遍历后输出：[9, 7, 6, 3, 1, 2, 4]
```

### [101. 对称二叉树](https://leetcode.cn/problems/symmetric-tree/description/?envType=study-plan-v2&envId=top-100-liked)

给你一个二叉树的根节点 `root` ， 检查它是否轴对称。

**示例 1：**

![img](https://pic.leetcode.cn/1698026966-JDYPDU-image.png)

```text
输入：root = [1,2,2,3,4,4,3]
输出：true
```

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def isSymmetric(self, root):
        def dfs(a, b):
            # 如果a和b都为None，表示对称，返回True
            if not a and not b:
                return True
            # 如果a和b有一个为None，表示不对称，返回False
            if not a or not b:
                return False
            # 如果a和b的值不同，表示不对称，返回False
            if a.val != b.val:
                return False
            # a的左子树和b的右子树是否对称，并且a的右子树和b的左子树是否对称
            return dfs(a.left, b.right) and dfs(a.right, b.left)

        # 从根节点的左右子树开始判断是否对称
        return dfs(root.left, root.right)

# 主函数用来处理输入输出
if __name__ == "__main__":
    vals = list(map(int,input().split()))
    if not vals:
        root=None
    else:
        root=TreeNode(vals[0])
        queue=deque([root])
        i=1
        while queue:
            parent=queue.popleft()
            if i<len(vals):
                parent.left=TreeNode(vals[i])
                queue.append(parent.left)
                i+=1
            if i<len(vals):
                parent.right=TreeNode(vals[i])
                queue.append(parent.right)
                i+=1

    result=Solution().inorderTraversal(root)
    print(" ".join(map(str,result)))

# 输入输出示例：
# 输入：
# 1 2 2 3 4 4 3
# 输出：
# True
#
# 解释：
# 对于二叉树：
#       1
#      / \
#     2   2
#    / \ / \
#   3  4 4  3
# 该二叉树是对称的，输出 True。
```

### [543. 二叉树的直径](https://leetcode.cn/problems/diameter-of-binary-tree/?envType=study-plan-v2&envId=top-100-liked)

给你一棵二叉树的根节点，返回该树的 **直径** 。

二叉树的 **直径** 是指树中任意两个节点之间最长路径的 **长度** 。这条路径可能经过也可能不经过根节点 `root` 。

两节点之间路径的 **长度** 由它们之间边数表示。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2021/03/06/diamtree.jpg)

```text
输入：root = [1,2,3,4,5]
输出：3
解释：3 ，取路径 [4,2,1,3] 或 [5,2,1,3] 的长度。
```

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def diameterOfBinaryTree(self, root):
        def dfs(root):
            nonlocal ans  # 使用外部变量ans来保存树的直径
            if not root:
                return 0  # 如果节点为空，返回深度0
            # 递归计算左子树和右子树的深度
            left = dfs(root.left)
            right = dfs(root.right)
            # 更新树的直径，左子树深度 + 右子树深度 可能是当前直径的最大值
            ans = max(ans, left + right)
            # 返回当前节点的最大深度，作为递归的返回值
            return max(left, right) + 1

        ans = 0  # 初始化树的直径为0
        dfs(root)  # 从根节点开始进行DFS遍历
        return ans  # 返回树的直径

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    vals = list(map(int, input().split()))  # 输入二叉树节点值，用空格分隔

    # 创建二叉树
    if not vals:
        root = None
    else:
        root = TreeNode(vals[0])
        nodes = [root]
        for val in vals[1:]:
            node = TreeNode(val)
            nodes.append(node)
            if nodes:
                parent = nodes.pop(0)
                if not parent.left:
                    parent.left = node
                else:
                    parent.right = node

    # 创建 Solution 实例并调用 diameterOfBinaryTree 方法
    solution = Solution()
    result = solution.diameterOfBinaryTree(root)

    # 输出结果
    print(result)

# 输入输出示例：
# 输入：
# 1 2 3 4 5
# 输出：
# 3
#
# 解释：
# 对于二叉树：
#     1
#    / \
#   2   3
#  / \
# 4   5
# 该树的直径为 3（路径 4 -> 2 -> 1 -> 3）。
```

### [102. 二叉树的层序遍历](https://leetcode.cn/problems/binary-tree-level-order-traversal/?envType=study-plan-v2&envId=top-100-liked)

给你二叉树的根节点 `root` ，返回其节点值的 **层序遍历** 。 （即逐层地，从左到右访问所有节点）。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2021/02/19/tree1.jpg)

```text
输入：root = [3,9,20,null,null,15,7]
输出：[[3],[9,20],[15,7]]
```

```python
from collections import deque
from typing import List, Optional

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        queue = deque([root])
        ans = []

        # 当队列不为空且根节点存在时，循环遍历每一层
        while root and queue:
            # 临时列表，用于存储当前层的节点值
            tmp = []

            # 遍历当前层的所有节点
            for _ in range(len(queue)):
                # 弹出队列中的第一个节点
                node = queue.popleft()
                # 如果当前节点有左子节点，将左子节点加入队列
                if node.left:
                    queue.append(node.left)
                # 如果当前节点有右子节点，将右子节点加入队列
                if node.right:
                    queue.append(node.right)
                # 将当前节点的值加入临时列表
                tmp.append(node.val)

            # 将当前层的结果加入答案列表
            ans.append(tmp)

        return ans

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    vals = list(map(int, input().split()))  # 输入二叉树节点值，用空格分隔

    # 创建二叉树
    if not vals:
        root = None
    else:
        root = TreeNode(vals[0])
        nodes = [root]
        for val in vals[1:]:
            node = TreeNode(val)
            nodes.append(node)
            if nodes:
                parent = nodes.pop(0)
                if not parent.left:
                    parent.left = node
                else:
                    parent.right = node

    # 创建 Solution 实例并调用 levelOrder 方法
    solution = Solution()
    result = solution.levelOrder(root)

    # 输出结果
    for level in result:
        print(" ".join(map(str, level)))

# 输入输出示例：
# 输入：
# 3 9 20 None None 15 7
# 输出：
# 3
# 9 20
# 15 7
#
# 解释：
# 对于二叉树：
#     3
#    / \
#   9  20
#      /  \
#     15   7
# 按层级遍历的结果是：
# 第一层：[3]
# 第二层：[9, 20]
# 第三层：[15, 7]
```

### [108. 将有序数组转换为二叉搜索树](https://leetcode.cn/problems/convert-sorted-array-to-binary-search-tree/description/?envType=study-plan-v2&envId=top-100-liked)

给你一个整数数组 `nums` ，其中元素已经按 **升序** 排列，请你将其转换为一棵 平衡 二叉搜索树。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2021/02/18/btree1.jpg)

```text
输入：nums = [-10,-3,0,5,9]
输出：[0,-3,9,-10,null,5]
解释：[0,-10,5,null,-3,null,9] 也将被视为正确答案：
```

二叉搜索树BST：每个节点左子树中所有节点的值都小于该节点的值，右子树中所有节点的值都大于该节点的值

平衡二叉树：左右子树的高度差不能大于 1。

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def sortedArrayToBST(self, nums):
        def dfs(left, right) -> Optional[TreeNode]:
            # 如果左索引大于右索引，说明当前区间无效，返回空
            if left > right:
                return None

            # 计算当前区间的中间位置
            mid = (left + right) // 2
            # 创建一个新的节点，值为当前区间中间位置的元素
            root = TreeNode(val=nums[mid])
            # 递归地构建左子树，范围是当前区间的左半部分
            root.left = dfs(left, mid - 1)
            # 递归地构建右子树，范围是当前区间的右半部分
            root.right = dfs(mid + 1, right)

            # 返回当前根节点
            return root

        return dfs(0, len(nums) - 1)

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    nums = list(map(int, input().split()))  # 输入已排序的整数数组，用空格分隔

    # 创建 Solution 实例并调用 sortedArrayToBST 方法
    solution = Solution()
    root = solution.sortedArrayToBST(nums)

    # 输出结果
    def inorder(node):
        if not node:
            return []
        return inorder(node.left) + [node.val] + inorder(node.right)

    result = inorder(root)
    print(" ".join(map(str, result)))

# 输入输出示例：
# 输入：
# -10 -3 0 5 9
# 输出：
# -10 -3 0 5 9
#
# 解释：
# 给定数组 [-10, -3, 0, 5, 9]，构建的平衡二叉搜索树的中序遍历结果为 [-10, -3, 0, 5, 9]。
```

### [98. 验证二叉搜索树](https://leetcode.cn/problems/validate-binary-search-tree/description/?envType=study-plan-v2&envId=top-100-liked)[中序遍历]

给你一个二叉树的根节点 `root` ，判断其是否是一个有效的二叉搜索树。

**有效** 二叉搜索树定义如下：

- 节点的左子树只包含 **严格小于** 当前节点的数。
- 节点的右子树只包含 **严格大于** 当前节点的数。
- 所有左子树和右子树自身必须也是二叉搜索树。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2020/12/01/tree1.jpg)

```text
输入：root = [2,1,3]
输出：true
```

理论：二叉搜索树中序遍历的结果一定是升序的

简单思路：先进行中序遍历，然后判断得到的数组是否是升序的。

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def isValidBST(self, root):
        # 定义一个 dfs 函数用于中序遍历树的所有节点
        def dfs(root):
            if not root:
                return
            dfs(root.left)
            nums.append(root.val)
            dfs(root.right)

        # 创建一个空的 nums 列表，用于存储树的所有节点值
        nums = []
        dfs(root)

        # 遍历 nums 列表，检查是否是递增的，如果发现不是递增的，说明不是一个有效的二叉搜索树
        for i in range(len(nums) - 1):
            if nums[i] >= nums[i + 1]:
                return False

        return True

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    vals = list(map(int, input().split()))  # 输入二叉树节点值，用空格分隔

    # 创建二叉树
    if not vals:
        root = None
    else:
        root = TreeNode(vals[0])
        nodes = [root]
        for val in vals[1:]:
            node = TreeNode(val)
            nodes.append(node)
            if nodes:
                parent = nodes.pop(0)
                if not parent.left:
                    parent.left = node
                else:
                    parent.right = node

    # 创建 Solution 实例并调用 isValidBST 方法
    solution = Solution()
    result = solution.isValidBST(root)

    # 输出结果
    print("True" if result else "False")

# 输入输出示例：
# 输入：
# 2 1 3
# 输出：
# True
#
# 解释：
# 对于二叉树：
#     2
#    / \
#   1   3
# 该二叉树是一个有效的二叉搜索树，因此输出 True。
```

### [230. 二叉搜索树中第 K 小的元素](https://leetcode.cn/problems/kth-smallest-element-in-a-bst/?envType=study-plan-v2&envId=top-100-liked)[中序遍历]

给定一个二叉搜索树的根节点 `root` ，和一个整数 `k` ，请你设计一个算法查找其中第 `k` 小的元素（`k` 从 1 开始计数）。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2021/01/28/kthtree1.jpg)

```text
输入：root = [3,1,4,null,2], k = 1
输出：1
```

二叉搜索树中序遍历的结果一定是升序的，因此在中序遍历结果中寻找第 K 小的元素

递归写法：

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def kthSmallest(self, root, k):
        def dfs(root):
            if not root:
                return
            # 先遍历左子树
            dfs(root.left)
            # 将当前节点的值加入 nums 列表
            nums.append(root.val)
            # 再遍历右子树
            dfs(root.right)

        # 空的 nums 列表存储中序遍历的所有节点值
        nums = []
        # 调用 dfs 函数进行树的中序遍历
        dfs(root)

        # 返回 nums 列表中的第 k 小的元素，注意 k 是从 1 开始的，所以返回 nums[k-1]
        return nums[k-1]

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    vals = list(map(int, input().split()))  # 输入二叉树节点值，用空格分隔
    k = int(input())  # 输入要找的第 k 小的元素

    # 创建二叉树
    if not vals:
        root = None
    else:
        root = TreeNode(vals[0])
        nodes = [root]
        for val in vals[1:]:
            node = TreeNode(val)
            nodes.append(node)
            if nodes:
                parent = nodes.pop(0)
                if not parent.left:
                    parent.left = node
                else:
                    parent.right = node

    # 创建 Solution 实例并调用 kthSmallest 方法
    solution = Solution()
    result = solution.kthSmallest(root, k)

    # 输出结果
    print(result)

# 输入输出示例：
# 输入：
# 3 1 4 None None 2
# 1
# 输出：
# 1
#
# 解释：
# 对于二叉树：
#       3
#      / \
#     1   4
#        /
#       2
# 第 1 小的元素是 1，因此输出 1。
```

迭代写法：

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def kthSmallest(self, root, k):
        order = []
        # 用栈来模拟递归进行中序遍历
        stack = []
        current = root

        # 栈不为空或者当前节点不为空时，继续遍历
        while stack or current:
            # 一直遍历到最左边的节点
            while current:
                stack.append(current)  # 将当前节点压入栈中
                current = current.left  # 继续向左子树遍历

            # 弹出栈顶节点，访问该节点
            current = stack.pop()
            order.append(current.val)  # 将节点值加入 order 列表

            # 遍历右子树
            current = current.right

        # 返回中序遍历后的第 k 小元素，注意 k 从 1 开始，所以是 order[k - 1]
        return order[k - 1]

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    vals = list(map(int, input().split()))  # 输入二叉树节点值，用空格分隔
    k = int(input())  # 输入要查找的第 k 小的元素

    # 创建二叉树
    if not vals:
        root = None
    else:
        root = TreeNode(vals[0])
        nodes = [root]
        for val in vals[1:]:
            node = TreeNode(val)
            nodes.append(node)
            if nodes:
                parent = nodes.pop(0)
                if not parent.left:
                    parent.left = node
                else:
                    parent.right = node

    # 创建 Solution 实例并调用 kthSmallest 方法
    solution = Solution()
    result = solution.kthSmallest(root, k)

    # 输出结果
    print(result)

# 输入输出示例：
# 输入：
# 3 1 4 None None 2
# 1
# 输出：
# 1
#
# 解释：
# 对于二叉树：
#       3
#      / \
#     1   4
#        /
#       2
# 第 1 小的元素是 1，因此输出 1。
```

### [199. 二叉树的右视图](https://leetcode.cn/problems/binary-tree-right-side-view/?envType=study-plan-v2&envId=top-100-liked)[层序遍历]

给定一个二叉树的 **根节点** `root`，想象自己站在它的右侧，按照从顶部到底部的顺序，返回从右侧所能看到的节点值。

**示例 1：**

**输入：**root = [1,2,3,null,5,null,4]

**输出：**[1,3,4]

**解释：**

![img](https://assets.leetcode.com/uploads/2024/11/24/tmpd5jn43fs-1.png)

层序遍历取每层最后一个节点即为二叉树的右视图

```python
from collections import deque
from typing import List, Optional

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
        # 使用队列进行层次遍历，初始时将根节点加入队列
        queue = deque([root])
        ans = []

        while root and queue:
            for _ in range(len(queue)):
                node = queue.popleft()
                # 如果当前节点有左子节点，将左子节点加入队列
                if node.left:
                    queue.append(node.left)
                # 如果当前节点有右子节点，将右子节点加入队列
                if node.right:
                    queue.append(node.right)

            # 当前层的最后一个节点值会被添加到 ans 列表中
            ans.append(node.val)

        return ans

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    vals = list(map(int, input().split()))  # 输入二叉树节点值，用空格分隔

    # 创建二叉树
    if not vals:
        root = None
    else:
        root = TreeNode(vals[0])
        nodes = [root]
        for val in vals[1:]:
            node = TreeNode(val)
            nodes.append(node)
            if nodes:
                parent = nodes.pop(0)
                if not parent.left:
                    parent.left = node
                else:
                    parent.right = node

    # 创建 Solution 实例并调用 rightSideView 方法
    solution = Solution()
    result = solution.rightSideView(root)

    # 输出结果
    print(" ".join(map(str, result)))

# 输入输出示例：
# 输入：
# 1 2 3 None 5 None 4
# 输出：
# 1 3 4
#
# 解释：
# 给定二叉树：
#       1
#      / \
#     2   3
#      \   \
#       5   4
# 从右侧看二叉树的节点依次是 1, 3, 4，因此输出 1 3 4。
```

### [114. 二叉树展开为链表](https://leetcode.cn/problems/flatten-binary-tree-to-linked-list/description/?envType=study-plan-v2&envId=top-100-liked)[前序遍历]

给你二叉树的根结点 `root` ，请你将它展开为一个单链表：

- 展开后的单链表应该同样使用 `TreeNode` ，其中 `right` 子指针指向链表中下一个结点，而左子指针始终为 `null` 。
- 展开后的单链表应该与二叉树 [**先序遍历**](https://baike.baidu.com/item/先序遍历/6442839?fr=aladdin) 顺序相同。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2021/01/14/flaten.jpg)

```text
输入：root = [1,2,5,3,4,null,6]
输出：[1,null,2,null,3,null,4,null,5,null,6]
```

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def flatten(self, root):
        nodes = []

        # 前序遍历
        def dfs(root):
            if not root:
                return None
            nodes.append(root)
            dfs(root.left)
            dfs(root.right)

        dfs(root)

        # 把nodes中前序遍历排好的节点串起来
        for i in range(len(nodes)-1):
            nodes[i].left = None
            nodes[i].right = nodes[i+1]

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    vals = list(map(int, input().split()))  # 输入二叉树节点值，用空格分隔

    # 创建二叉树
    if not vals:
        root = None
    else:
        root = TreeNode(vals[0])
        nodes = [root]
        for val in vals[1:]:
            node = TreeNode(val)
            nodes.append(node)
            if nodes:
                parent = nodes.pop(0)
                if not parent.left:
                    parent.left = node
                else:
                    parent.right = node

    # 创建 Solution 实例并调用 flatten 方法
    solution = Solution()
    solution.flatten(root)

    # 输出结果
    result = []
    current = root
    while current:
        result.append(str(current.val))
        current = current.right
    print(" ".join(result))

# 输入输出示例：
# 输入：
# 1 2 5 3 4 None 6
# 输出：
# 1 2 3 4 5 6
#
# 解释：
# 对于二叉树：
#       1
#      / \
#     2   5
#    / \   \
#   3   4   6
# 扁平化后链表为：
# 1 -> 2 -> 3 -> 4 -> 5 -> 6
```

### [105. 从前序与中序遍历序列构造二叉树](https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/description/?envType=study-plan-v2&envId=top-100-liked)

给定两个整数数组 `preorder` 和 `inorder` ，其中 `preorder` 是二叉树的**先序遍历**， `inorder` 是同一棵树的**中序遍历**，请构造二叉树并返回其根节点。

**示例 1:**

![img](https://assets.leetcode.com/uploads/2021/02/19/tree.jpg)

```text
输入: preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]
输出: [3,9,20,null,null,15,7]
```

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def buildTree(self, preorder, inorder):
        # 使用字典建立中序遍历中每个值的索引位置，以便快速查找根节点在中序遍历中的位置
        index = {v:i for i,v in enumerate(inorder)}
        # 下一颗需要构建的子树的根节点在前序序列中的位置
        next_index_order = 0

        def dfs(left, right):
            nonlocal next_index_order
            if left > right:
                return None
            # 取出当前前序遍历中的节点值作为根节点
            root = TreeNode(val=preorder[next_index_order])
            next_index_order += 1
            # 获取根节点在中序遍历中的位置
            mid = index[root.val]
            root.left = dfs(left, mid - 1)
            root.right = dfs(mid + 1, right)
            return root

        return dfs(0, len(inorder) - 1)

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    preorder = list(map(int, input().split()))  # 输入前序遍历序列
    inorder = list(map(int, input().split()))   # 输入中序遍历序列

    # 创建 Solution 实例并调用 buildTree 方法
    solution = Solution()
    root = solution.buildTree(preorder, inorder)

    # 输出结果（先序遍历结果，验证构建的树是否正确）
    def preorder_traversal(node):
        if not node:
            return []
        return [node.val] + preorder_traversal(node.left) + preorder_traversal(node.right)

    result = preorder_traversal(root)
    print(" ".join(map(str, result)))

# 输入输出示例：
# 输入：
# 3 9 20 15 7
# 9 3 15 20 7
# 输出：
# 3 9 20 15 7
#
# 解释：
# 给定前序遍历 [3, 9, 20, 15, 7] 和中序遍历 [9, 3, 15, 20, 7]，构建的树是：
#       3
#      / \
#     9   20
#        /  \
#       15   7
# 再次进行前序遍历，结果是 [3, 9, 20, 15, 7]，与输入的前序遍历一致。
```

### [437. 路径总和 III](https://leetcode.cn/problems/path-sum-iii/description/?envType=study-plan-v2&envId=top-100-liked)[前缀和]

给定一个二叉树的根节点 `root` ，和一个整数 `targetSum` ，求该二叉树里节点值之和等于 `targetSum` 的 **路径** 的数目。

**路径** 不需要从根节点开始，也不需要在叶子节点结束，但是路径方向必须是向下的（只能从父节点到子节点）。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2021/04/09/pathsum3-1-tree.jpg)

```text
输入：root = [10,5,-3,3,2,null,11,3,-2,null,1], targetSum = 8
输出：3
解释：和等于 8 的路径有 3 条，如图所示。
```

二叉树子路径的和等于当前节点的前缀和减去某个祖先节点的前缀和

类似[560. 和为 K 的子数组](https://leetcode.cn/problems/subarray-sum-equals-k/)

```python
import collections
from typing import Optional

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> int:
        # count 字典用来统计“某个前缀和出现了多少次”
        count = collections.defaultdict(int)
        # 初始化：进入根之前，前缀和为 0 出现 1 次
        count[0] = 1
        ans = 0

        def dfs(root: Optional[TreeNode], current: int):
            nonlocal ans
            if not root:
                return
            # 更新当前前缀和
            current += root.val
            # 如果当前路径和减去目标和（current - targetSum）曾经出现过，说明有路径和为 targetSum
            ans += count[current - targetSum]
            # 将当前前缀和加入 count 字典，表示当前路径的前缀和出现一次
            count[current] += 1

            # 继续递归遍历左子树和右子树
            dfs(root.left, current)
            dfs(root.right, current)
            # 离开当前节点后，撤销当前前缀和的贡献，确保它只作用于当前路径
            count[current] -= 1

        dfs(root, 0)
        return ans

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    vals = list(map(int, input().split()))  # 输入二叉树节点值，用空格分隔
    targetSum = int(input())  # 输入目标和

    # 创建二叉树
    if not vals:
        root = None
    else:
        root = TreeNode(vals[0])
        nodes = [root]
        for val in vals[1:]:
            node = TreeNode(val)
            nodes.append(node)
            if nodes:
                parent = nodes.pop(0)
                if not parent.left:
                    parent.left = node
                else:
                    parent.right = node

    # 创建 Solution 实例并调用 pathSum 方法
    solution = Solution()
    result = solution.pathSum(root, targetSum)

    # 输出结果
    print(result)

# 输入输出示例：
# 输入：
# 10 5 -3 3 2 None 11 3 -2 None None 1
# 8
# 输出：
# 3
#
# 解释：
# 对于二叉树：
#       10
#      /  \
#     5   -3
#    / \    \
#   3   2   11
#  /  \   \
# 3   -2   1
# 从根节点到叶子节点路径和为 8 的路径有 3 条：
# 10 -> -3 -> 11
# 5 -> 3 -> 2 -> 3
# 5 -> 3 -> 1
```

### [236. 二叉树的最近公共祖先](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/?envType=study-plan-v2&envId=top-100-liked)

给定一个二叉树, 找到该树中两个指定节点的最近公共祖先。

[百度百科](https://baike.baidu.com/item/最近公共祖先/8918834?fr=aladdin)中最近公共祖先的定义为：“对于有根树 T 的两个节点 p、q，最近公共祖先表示为一个节点 x，满足 x 是 p、q 的祖先且 x 的深度尽可能大（**一个节点也可以是它自己的祖先**）。”

**示例 1：**

![img](https://assets.leetcode.com/uploads/2018/12/14/binarytree.png)

```text
输入：root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1
输出：3
解释：节点 5 和节点 1 的最近公共祖先是节点 3 。
```

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        # 找到 p 或 q 就不往下递归了，当前节点就是最近公共祖先，直接返回当前节点。
        if root in (None, p, q):
            return root

        left = self.lowestCommonAncestor(root.left, p, q)
        right = self.lowestCommonAncestor(root.right, p, q)

        if left and right:  # 左右都找到
            return root  # 当前节点是最近公共祖先

        # 如果只有左子树找到，就返回左子树的返回值
        # 如果只有右子树找到，就返回右子树的返回值
        # 如果左右子树都没有找到，就返回 None（注意此时 right = None）
        return left or right

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    vals = list(map(int, input().split()))  # 输入二叉树节点值，用空格分隔
    p_val = int(input())  # 输入 p 的节点值
    q_val = int(input())  # 输入 q 的节点值

    # 创建二叉树
    if not vals:
        root = None
    else:
        root = TreeNode(vals[0])
        nodes = [root]
        for val in vals[1:]:
            node = TreeNode(val)
            nodes.append(node)
            if nodes:
                parent = nodes.pop(0)
                if not parent.left:
                    parent.left = node
                else:
                    parent.right = node

    # 寻找 p 和 q 节点
    p = None
    q = None
    def find_node(root, val):
        if not root:
            return None
        if root.val == val:
            return root
        left = find_node(root.left, val)
        if left:
            return left
        return find_node(root.right, val)

    p = find_node(root, p_val)
    q = find_node(root, q_val)

    # 创建 Solution 实例并调用 lowestCommonAncestor 方法
    solution = Solution()
    result = solution.lowestCommonAncestor(root, p, q)

    # 输出结果
    print(result.val)

# 输入输出示例：
# 输入：
# 3 5 1 6 2 0 8 None None 7 4
# 5
# 1
# 输出：
# 3
#
# 解释：
# 对于二叉树：
#        3
#       / \
#      5   1
#     / \ / \
#    6  2 0  8
#      / \
#     7   4
# 节点 5 和 1 的最近公共祖先是节点 3，因此输出 3。
```

#### [235. 二叉搜索树的最近公共祖先](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-search-tree/)

给定一个二叉搜索树, 找到该树中两个指定节点的最近公共祖先。

[百度百科](https://baike.baidu.com/item/最近公共祖先/8918834?fr=aladdin)中最近公共祖先的定义为：“对于有根树 T 的两个结点 p、q，最近公共祖先表示为一个结点 x，满足 x 是 p、q 的祖先且 x 的深度尽可能大（**一个节点也可以是它自己的祖先**）。”

例如，给定如下二叉搜索树: root = [6,2,8,0,4,7,9,null,null,3,5]

![img](https://assets.leetcode.cn/aliyun-lc-upload/uploads/2018/12/14/binarysearchtree_improved.png)

**示例 1:**

```text
输入: root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8
输出: 6
解释: 节点 2 和节点 8 的最近公共祖先是 6。
```

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        x = root.val
        if p.val < x and q.val < x:  # p 和 q 都在左子树
            return self.lowestCommonAncestor(root.left, p, q)
        if p.val > x and q.val > x:  # p 和 q 都在右子树
            return self.lowestCommonAncestor(root.right, p, q)
        return root  # 其它

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    vals = list(map(int, input().split()))  # 输入二叉树节点值，用空格分隔
    p_val = int(input())  # 输入 p 的节点值
    q_val = int(input())  # 输入 q 的节点值

    # 创建二叉树
    if not vals:
        root = None
    else:
        root = TreeNode(vals[0])
        nodes = [root]
        for val in vals[1:]:
            node = TreeNode(val)
            nodes.append(node)
            if nodes:
                parent = nodes.pop(0)
                if not parent.left:
                    parent.left = node
                else:
                    parent.right = node

    # 寻找 p 和 q 节点
    p = None
    q = None
    def find_node(root, val):
        if not root:
            return None
        if root.val == val:
            return root
        left = find_node(root.left, val)
        if left:
            return left
        return find_node(root.right, val)

    p = find_node(root, p_val)
    q = find_node(root, q_val)

    # 创建 Solution 实例并调用 lowestCommonAncestor 方法
    solution = Solution()
    result = solution.lowestCommonAncestor(root, p, q)

    # 输出结果
    print(result.val)

# 输入输出示例：
# 输入：
# 6 2 8 0 4 7 9 None None 3 5
# 2
# 8
# 输出：
# 6
#
# 解释：
# 对于二叉树：
#        6
#       / \
#      2   8
#     / \   / \
#    0   4 7   9
#       / \
#      3   5
# 节点 2 和 8 的最近公共祖先是节点 6，因此输出 6。
```

### [124. 二叉树中的最大路径和](https://leetcode.cn/problems/binary-tree-maximum-path-sum/description/?envType=study-plan-v2&envId=top-100-liked)

二叉树中的 **路径** 被定义为一条节点序列，序列中每对相邻节点之间都存在一条边。同一个节点在一条路径序列中 **至多出现一次** 。该路径 **至少包含一个** 节点，且不一定经过根节点。

**路径和** 是路径中各节点值的总和。

给你一个二叉树的根节点 `root` ，返回其 **最大路径和** 。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2020/10/13/exx1.jpg)

```text
输入：root = [1,2,3]
输出：6
解释：最优路径是 2 -> 1 -> 3 ，路径和为 2 + 1 + 3 = 6
```

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def maxPathSum(self, root):
        ans = float("-inf")  # 初始化最大路径和为负无穷，因为最大路径和有可能是负数

        def dfs(root):
            nonlocal ans
            if not root:
                return 0
            # 递归计算左右子树的最大路径和（如果子树为空，则贡献为 0）
            left = max(0, dfs(root.left))  # 左子树对父节点的最大单边贡献（负值路径不贡献）
            right = max(0, dfs(root.right))  # 右子树对父节点的最大单边贡献（负值路径不贡献）
            # 更新最大路径和：根节点值 + 左右子树的贡献值
            ans = max(ans, root.val + left + right)
            # 返回当前节点及其子树的最大路径和，但只能选择一边（左或右）继续传递给父节点
            return root.val + max(left, right)

        dfs(root)
        return ans

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    vals = list(map(int, input().split()))  # 输入二叉树节点值，用空格分隔

    # 创建二叉树
    if not vals:
        root = None
    else:
        root = TreeNode(vals[0])
        nodes = [root]
        for val in vals[1:]:
            node = TreeNode(val)
            nodes.append(node)
            if nodes:
                parent = nodes.pop(0)
                if not parent.left:
                    parent.left = node
                else:
                    parent.right = node

    # 创建 Solution 实例并调用 maxPathSum 方法
    solution = Solution()
    result = solution.maxPathSum(root)

    # 输出结果
    print(result)

# 输入输出示例：
# 输入：
# 1 2 3
# 输出：
# 6
#
# 解释：
# 对于二叉树：
#      1
#     / \
#    2   3
# 最大路径和为 6（路径为 2 -> 1 -> 3）。
```

## 图论

### [200. 岛屿数量](https://leetcode.cn/problems/number-of-islands/?envType=study-plan-v2&envId=top-100-liked) [深搜]

给你一个由 `'1'`（陆地）和 `'0'`（水）组成的的二维网格，请你计算网格中岛屿的数量。

岛屿总是被水包围，并且每座岛屿只能由水平方向和/或竖直方向上相邻的陆地连接形成。

此外，你可以假设该网格的四条边均被水包围。

**示例 1：**

```text
输入：grid = [
  ['1','1','1','1','0'],
  ['1','1','0','1','0'],
  ['1','1','0','0','0'],
  ['0','0','0','0','0']
]
输出：1
```

```python
from typing import List

class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        m, n = len(grid), len(grid[0])  # 获取网格的行数 m 和列数 n
        ans = 0  # 用于存储岛屿的数量

        # 定义深度优先搜索（DFS）函数，遍历岛屿并标记已访问过的陆地
        def dfs(i: int, j: int):
            # 检查当前坐标是否在网格内，并且是陆地（'1'）
            if 0 <= i < m and 0 <= j < n and grid[i][j] == "1":
                grid[i][j] = "2"  # 将当前陆地标记为访问过（'2'）
                # 递归调用四个方向（左、右、上、下）遍历所有相连的陆地
                dfs(i, j - 1)  # 向左走
                dfs(i, j + 1)  # 向右走
                dfs(i - 1, j)  # 向上走
                dfs(i + 1, j)  # 向下走

        # 遍历网格中的每个元素
        for i in range(m):  # 遍历每一行
            for j in range(n):  # 遍历每一列
                # 如果当前元素是陆地（'1'），则表示找到一个新的岛屿
                if grid[i][j] == "1":
                    dfs(i, j)  # 对该岛屿执行DFS，标记该岛屿的所有陆地
                    ans += 1  # 增加岛屿计数

        return ans

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    m, n = map(int, input().split())  # 输入网格的行数和列数
    grid = [input().split() for _ in range(m)]  # 输入网格，按行读入

    # 创建 Solution 实例并调用 numIslands 方法
    solution = Solution()
    result = solution.numIslands(grid)

    # 输出结果
    print(result)

# 输入输出示例：
# 输入：
# 3 3
# 1 1 0
# 1 1 0
# 0 0 1
# 输出：
# 2
#
# 解释：
# 给定网格：
# 1 1 0
# 1 1 0
# 0 0 1
# 该网格有 2 个岛屿，因此输出 2。
```

### [994. 腐烂的橘子](https://leetcode.cn/problems/rotting-oranges/description/?envType=study-plan-v2&envId=top-100-liked) [广搜]

在给定的 `m x n` 网格 `grid` 中，每个单元格可以有以下三个值之一：

- 值 `0` 代表空单元格；
- 值 `1` 代表新鲜橘子；
- 值 `2` 代表腐烂的橘子。

每分钟，腐烂的橘子 **周围 4 个方向上相邻** 的新鲜橘子都会腐烂。

返回 _直到单元格中没有新鲜橘子为止所必须经过的最小分钟数。如果不可能，返回 `-1`_ 。

**示例 1：**

**![img](https://assets.leetcode.cn/aliyun-lc-upload/uploads/2019/02/16/oranges.png)**

```text
输入：grid = [[2,1,1],[1,1,0],[0,1,1]]
输出：4
```

```python
from collections import deque
from typing import List

class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        queue = deque()  # 用来存储腐烂橘子的位置
        fresh_count = 0  # 统计新鲜橘子的数量
        ans = 0

        # 遍历网格，初始化新鲜橘子的数量和腐烂橘子的位置
        for i in range(m):
            for j in range(n):
                if grid[i][j] == 1:
                    fresh_count += 1
                elif grid[i][j] == 2:
                    queue.append((i, j))

        # 当队列不为空且还有新鲜橘子时，开始腐烂过程
        while queue and fresh_count > 0:
            # 处理当前队列中所有的腐烂橘子
            for _ in range(len(queue)):
                x, y = queue.popleft()
                # 遍历四个方向，把相邻的新鲜橘子变成腐烂橘子
                for i, j in (x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1):
                    if 0 <= i < m and 0 <= j < n and grid[i][j] == 1:
                        grid[i][j] = 2  # 将新鲜橘子变成腐烂橘子
                        fresh_count -= 1
                        queue.append((i, j))  # 将新腐烂的橘子加入队列
            ans += 1

        return ans if fresh_count == 0 else -1

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    m, n = map(int, input().split())  # 输入网格的行数和列数
    grid = [list(map(int, input().split())) for _ in range(m)]  # 输入网格

    # 创建 Solution 实例并调用 orangesRotting 方法
    solution = Solution()
    result = solution.orangesRotting(grid)

    # 输出结果
    print(result)

# 输入输出示例：
# 输入：
# 3 3
# 2 1 1
# 1 1 0
# 0 1 2
# 输出：
# 4
#
# 解释：
# 给定网格：
# 2 1 1
# 1 1 0
# 0 1 2
# 在 4 分钟内，所有的新鲜橘子都会腐烂，因此输出 4。
```

### [207. 课程表](https://leetcode.cn/problems/course-schedule/?envType=study-plan-v2&envId=top-100-liked) [拓扑排序]

你这个学期必须选修 `numCourses` 门课程，记为 `0` 到 `numCourses - 1` 。

在选修某些课程之前需要一些先修课程。 先修课程按数组 `prerequisites` 给出，其中 `prerequisites[i] = [ai, bi]` ，表示如果要学习课程 `ai` 则 **必须** 先学习课程 `bi` 。

- 例如，先修课程对 `[0, 1]` 表示：想要学习课程 `0` ，你需要先完成课程 `1` 。

请你判断是否可能完成所有课程的学习？如果可以，返回 `true` ；否则，返回 `false` 。

**示例 1：**

```text
输入：numCourses = 2, prerequisites = [[1,0]]
输出：true
解释：总共有 2 门课程。学习课程 1 之前，你需要完成课程 0 。这是可能的。
```

DFS 三色标记法：

对于每个节点 x，都定义三种颜色值（状态值）：

- 0：节点 x 尚未被访问到。
- 1：节点 x 正在访问中，dfs(x) 尚未结束。
- 2：节点 x 已经完全访问完毕。注意这还说明从 x 出发无法找到环。所以当我们遇到状态值为 2 的节点 x 时，无需递归 x。

![2026-01-22_193634](https://raw.githubusercontent.com/1910853272/image/master/img/202601221937535.png)

![2026-01-22_152133](https://raw.githubusercontent.com/1910853272/image/master/img/202601221533023.png)

```python
from typing import List

class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        # g[b] 存储所有 “依赖 b 的课程 a”，也就是边 b -> a（学完 b 才能学 a）
        g = [[] for _ in range(numCourses)]
        for a, b in prerequisites:
            g[b].append(a)
        # colors[i] 表示课程 i 的访问状态：
        # 0 -> 未访问
        # 1 -> 访问中（在递归栈中）
        # 2 -> 访问完成
        colors = [0] * numCourses

        # 返回 True 表示找到了环
        def dfs(x: int) -> bool:
            colors[x] = 1  # 标记 x 为“访问中”（进入递归栈）
            # 学完 x 才能学 y
            for y in g[x]:
                # colors[y] == 1：y 也在当前递归栈中，说明存在环
                # colors[y] == 0：y 未访问过，需要继续 DFS 探测 y 的后续是否能形成环
                # colors[y] == 2：y 已完成，之前已经证明从 y 出发不会形成环，此时无需再 DFS y
                if colors[y] == 1 or (colors[y] == 0 and dfs(y)):
                    return True  # 找到了环，直接向上返回

            colors[x] = 2  # x 的所有后继都检查完毕，确认从 x 出发“无环”
            return False    # 没有找到环

        for i, c in enumerate(colors):
            # 只对未访问的节点启动 DFS
            if c == 0 and dfs(i):
                return False  # 一旦任意起点找到环 => 不能完成所有课程

        return True

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    numCourses = int(input())  # 输入课程数量
    prerequisites = []
    m = int(input())  # 输入先修课程的数量
    for _ in range(m):
        prerequisites.append(list(map(int, input().split())))  # 输入每一对课程依赖关系

    # 创建 Solution 实例并调用 canFinish 方法
    solution = Solution()
    result = solution.canFinish(numCourses, prerequisites)

    # 输出结果
    print("True" if result else "False")

# 输入输出示例：
# 输入：
# 2
# 2
# 1 0
# 0 1
# 输出：
# False
#
# 解释：
# 课程 0 和 课程 1 互相依赖，形成了一个环，因此无法完成所有课程，输出 False。
```

### [208. 实现 Trie](https://leetcode.cn/problems/implement-trie-prefix-tree/?envType=study-plan-v2&envId=top-100-liked) [前缀树]

**[Trie](https://baike.baidu.com/item/字典树/9825209?fr=aladdin)**（发音类似 "try"）或者说 **前缀树** 是一种树形数据结构，用于高效地存储和检索字符串数据集中的键。这一数据结构有相当多的应用情景，例如自动补全和拼写检查。

请你实现 Trie 类：

- `Trie()` 初始化前缀树对象。
- `void insert(String word)` 向前缀树中插入字符串 `word` 。
- `boolean search(String word)` 如果字符串 `word` 在前缀树中，返回 `true`（即，在检索之前已经插入）；否则，返回 `false` 。
- `boolean startsWith(String prefix)` 如果之前已经插入的字符串 `word` 的前缀之一为 `prefix` ，返回 `true` ；否则，返回 `false` 。

**示例：**

```text
输入
["Trie", "insert", "search", "search", "startsWith", "insert", "search"]
[[], ["apple"], ["apple"], ["app"], ["app"], ["app"], ["app"]]
输出
[null, null, true, false, true, null, true]

解释
Trie trie = new Trie();
trie.insert("apple");
trie.search("apple");   // 返回 True
trie.search("app");     // 返回 False
trie.startsWith("app"); // 返回 True
trie.insert("app");
trie.search("app");     // 返回 True
```

```python
class Trie:
    def __init__(self):
        self.children = [None] * 26  # 固定长度数组，表示 26 个小写字母的子节点（a~z）
        self.isEnd = False          # 标记：是否有单词在当前节点结束

    def searchPrefix(self, prefix: str) -> "Trie":
        """
        在 Trie 中查找前缀 prefix 对应的“最后一个节点”：
        - 若前缀路径存在：返回最后节点
        - 若不存在：返回 None
        """
        node = self  # 从根节点开始（这里 Trie 本身就充当根）
        for ch in prefix:
            idx = ord(ch) - ord("a")          # 将字符映射到下标：'a'->0, 'b'->1, ..., 'z'->25
            if not node.children[idx]:        # 若对应分支不存在，说明前缀不存在
                return None
            node = node.children[idx]         # 沿着该字符分支向下走
        return node                            # 走完所有字符，返回最后所在节点

    def insert(self, word: str) -> None:
        """
        插入单词 word：
        逐字符向下走，不存在就创建子节点，最后标记 isEnd=True
        """
        node = self  # 从根节点开始插入
        for ch in word:
            idx = ord(ch) - ord("a")          # 字符转下标
            if not node.children[idx]:        # 如果该分支不存在
                node.children[idx] = Trie()   # 创建新节点（造路）
            node = node.children[idx]         # 移动到子节点
        node.isEnd = True                     # 单词结束位置标记为 True

    def search(self, word: str) -> bool:
        """
        查找 Trie 中是否存在“完整单词 word”：
        必须路径存在，且最后节点 isEnd=True
        """
        node = self.searchPrefix(word)        # 找到 word 对应的最后节点
        return node is not None and node.isEnd

    def startsWith(self, prefix: str) -> bool:
        """
        查找 Trie 中是否存在以 prefix 为前缀的单词：
        只要 prefix 的路径存在即可（不要求 isEnd=True）
        """
        return self.searchPrefix(prefix) is not None

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 创建 Trie 实例
    trie = Trie()

    # 读取输入
    n = int(input())  # 输入操作的数量
    for _ in range(n):
        operation = input().split()  # 每一行输入一个操作和相应的参数
        if operation[0] == "insert":
            trie.insert(operation[1])  # 插入操作
        elif operation[0] == "search":
            result = trie.search(operation[1])  # 查找操作
            print("True" if result else "False")
        elif operation[0] == "startsWith":
            result = trie.startsWith(operation[1])  # 前缀查找操作
            print("True" if result else "False")

# 输入输出示例：
# 输入：
# 4
# insert apple
# search apple
# search app
# startsWith app
# 输出：
# True
# False
# True
#
# 解释：
# 执行的操作：
# 1. 插入单词 "apple"。
# 2. 查找单词 "apple" -> 存在。
# 3. 查找单词 "app" -> 不存在（"app" 没有插入过）。
# 4. 查找以 "app" 为前缀的单词 -> 存在（"apple" 是以 "app" 为前缀的）。
```

## 回溯

### 回溯模板

```python
result = [] # 结果集
path=[] # 路径
def backtracking(选择列表):
    # 2.递归结束条件
    if 满足结束条件:
        # 2.1 存放结果
        result.add(满足条件的路径)
        # 2.2 返回
        return
        # 1.选择：在本层集合中遍历元素
    for 选择 in 选择列表:
        # 1.1 处理节点：做出选择
        做选择
        # 1.2 递归（缩小数据范围。数据范围缩小到一定程度，会触发递归终止条件）
        backtracking(选择列表)
        # 1.3 回溯，撤销选择
        撤销选择
```

### [46.全排列](https://leetcode.cn/problems/permutations/description/?envType=study-plan-v2&envId=top-100-liked)

给定一个不含重复数字的数组 `nums` ，返回其 _所有可能的全排列_ 。你可以 **按任意顺序** 返回答案。

**示例 1：**

```text
输入：nums = [1,2,3]
输出：[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
```

```python
from typing import List

class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        n = len(nums)
        ans = []  # 结果集
        path = []  # 路径
        used = [False] * len(nums)  # 标记数组

        def dfs():
            # 递归结束条件：路径长度等于数组长度
            if len(path) == n:
                ans.append(path.copy())
                return
            # 遍历所有数字
            for i in range(n):
                if used[i]:  # 如果已经使用过，跳过
                    continue
                # 做选择
                path.append(nums[i])
                used[i] = True
                # 递归
                dfs()
                # 撤销选择
                path.pop()
                used[i] = False

        dfs()
        return ans

# 主函数用来处理输入输出
if __name__ == "__main__":
    # 读取输入
    nums = list(map(int, input().split()))  # 输入数字，空格分隔

    # 创建 Solution 实例并调用 permute 方法
    solution = Solution()
    result = solution.permute(nums)

    # 输出结果
    for perm in result:
        print(" ".join(map(str, perm)))

# 输入输出示例：
# 输入：
# 1 2 3
# 输出：
# 1 2 3
# 1 3 2
# 2 1 3
# 2 3 1
# 3 1 2
# 3 2 1
#
# 解释：
# 给定输入 [1, 2, 3]，所有可能的排列输出为：
# [1, 2, 3]
# [1, 3, 2]
# [2, 1, 3]
# [2, 3, 1]
# [3, 1, 2]
# [3, 2, 1]
```

### [78. 子集](https://leetcode.cn/problems/subsets/description/?envType=study-plan-v2&envId=top-100-liked)

给你一个整数数组 `nums` ，数组中的元素 **互不相同** 。返回该数组所有可能的子集（幂集）。

解集 **不能** 包含重复的子集。你可以按 **任意顺序** 返回解集。

**示例 1：**

```text
输入：nums = [1,2,3]
输出：[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]
```

```python
class Solution:
    def subsets(self, nums):
        result = []  # 存放所有子集的结果
        path = []  # 当前子集的路径

        def dfs(index):
            if index == len(nums):  # 递归终止条件，遍历完所有元素
                result.append(path.copy())  # 将当前路径（子集）添加到结果中
                return

            # 选当前元素
            path.append(nums[index])  # 将当前元素加入子集
            dfs(index + 1)  # 递归遍历下一个元素
            path.pop()  # 回溯，移除当前元素

            # 不选当前元素
            dfs(index + 1)  # 递归遍历下一个元素

        dfs(0)  # 从第一个元素开始递归
        return result  # 返回所有子集的结果


# 主函数：处理 ACM 模式输入输出
if __name__ == "__main__":
    nums = list(map(int, input().split()))  # 输入数组元素

    solution = Solution()
    ans = solution.subsets(nums)

    # 输出所有子集
    for subset in ans:
        if subset:
            print(" ".join(map(str, subset)))
        else:
            print("[]")


# 输入输出示例：
# 输入：
# 1 2 3
# 输出：
# 1 2 3
# 1 2
# 1 3
# 1
# 2 3
# 2
# 3
# []
#
# 解释：
# 对于数组 [1, 2, 3]，其所有子集共有 2^3 = 8 个。
# 输出顺序由 DFS 的“先选后不选”决定。
# 只要子集内容正确，顺序不同通常也是可以接受的。
```

### [17. 电话号码的字母组合](https://leetcode.cn/problems/letter-combinations-of-a-phone-number/description/?envType=study-plan-v2&envId=top-100-liked)

给定一个仅包含数字 `2-9` 的字符串，返回所有它能表示的字母组合。答案可以按 **任意顺序** 返回。

给出数字到字母的映射如下（与电话按键相同）。注意 1 不对应任何字母。

![img](https://pic.leetcode.cn/1752723054-mfIHZs-image.png)

**示例 1：**

```text
输入：digits = "23"
输出：["ad","ae","af","bd","be","bf","cd","ce","cf"]
```

```python
class Solution:
    def letterCombinations(self, digits):
        MAPPING = "", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"  # 数字与字母的映射
        if not digits:  # 如果输入为空，直接返回空列表
            return []

        result = []  # 存储最终的所有字母组合
        path = []  # 存储当前的字母组合

        def dfs(index):
            if index == len(digits):  # 如果已经处理完所有的数字
                result.append("".join(path))  # 将当前路径转换为字符串并加入结果
                return

            # 对当前数字对应的每一个字母进行处理
            for c in MAPPING[int(digits[index])]:
                path.append(c)  # 将字母添加到当前路径中
                dfs(index + 1)  # 递归处理下一个数字
                path.pop()  # 回溯，移除当前字母

        dfs(0)  # 从第一个数字开始深度优先搜索
        return result  # 返回所有字母组合


# 主函数：处理 ACM 模式输入输出
if __name__ == "__main__":
    digits = input().strip()  # 输入数字字符串

    solution = Solution()
    ans = solution.letterCombinations(digits)

    # 输出结果
    for s in ans:
        print(s)


# 输入输出示例：
# 输入：
# 23
# 输出：
# ad
# ae
# af
# bd
# be
# bf
# cd
# ce
# cf
#
# 解释：
# 数字 2 对应 "abc"，数字 3 对应 "def"。
# 所有可能的字母组合为：
# ad, ae, af, bd, be, bf, cd, ce, cf
```

### [39. 组合总和](https://leetcode.cn/problems/combination-sum/description/?envType=study-plan-v2&envId=top-100-liked)

给你一个 **无重复元素** 的整数数组 `candidates` 和一个目标整数 `target` ，找出 `candidates` 中可以使数字和为目标数 `target` 的 所有 **不同组合** ，并以列表形式返回。你可以按 **任意顺序** 返回这些组合。

`candidates` 中的 **同一个** 数字可以 **无限制重复被选取** 。如果至少一个数字的被选数量不同，则两种组合是不同的。

对于给定的输入，保证和为 `target` 的不同组合数少于 `150` 个。

**示例 1：**

```text
输入：candidates = [2,3,6,7], target = 7
输出：[[2,2,3],[7]]
解释：
2 和 3 可以形成一组候选，2 + 2 + 3 = 7 。注意 2 可以使用多次。
7 也是一个候选， 7 = 7 。
仅有这两种组合。
```

dfs 中加入一个参数，指示当前数组从哪一个下标开始。每次递归只会考虑「当前位置及之后」的元素，排除重复的组合，比如 [2,3] 和 [3,2]。

```python
class Solution:
    def combinationSum(self, candidates, target):
        result = []  # 存储所有满足条件的组合
        path = []  # 存储当前的组合

        def dfs(index):
            if sum(path) == target:  # 如果当前组合的和等于目标值
                result.append(path.copy())  # 将当前组合加入结果
                return
            if sum(path) > target:  # 如果当前组合的和大于目标值，剪枝
                return
            # 遍历候选数，从当前索引开始，以便允许重复选择相同的数字
            for i in range(index, len(candidates)):
                path.append(candidates[i])  # 选择当前数字
                dfs(i)  # 继续递归，允许重复选择当前数字
                path.pop()  # 回溯，移除当前数字

        dfs(0)  # 从第一个候选数字开始递归
        return result  # 返回所有符合条件的组合


# 主函数：处理 ACM 模式输入输出
if __name__ == "__main__":
    candidates = list(map(int, input().split()))  # 输入候选数组
    target = int(input())  # 输入目标值

    solution = Solution()
    ans = solution.combinationSum(candidates, target)

    # 输出所有组合
    for comb in ans:
        print(" ".join(map(str, comb)))


# 输入输出示例：
# 输入：
# 2 3 6 7
# 7
# 输出：
# 2 2 3
# 7
#
# 解释：
# candidates = [2, 3, 6, 7], target = 7
# 满足条件的组合有：
# [2, 2, 3]
# [7]
#
# 注意：
# 输出顺序不唯一，只要组合内容正确即可。
```

### [22. 括号生成](https://leetcode.cn/problems/generate-parentheses/description/?envType=study-plan-v2&envId=top-100-liked)

数字 `n` 代表生成括号的对数，请你设计一个函数，用于能够生成所有可能的并且 **有效的** 括号组合。

**示例 1：**

```text
输入：n = 3
输出：["((()))","(()())","(())()","()(())","()()()"]
```

括号字符串（长度为 n）有效的充分必要条件：

- 左括号 ‘(’ 的数量不能超过 n
- 在任何位置，右括号 ‘)’ 的数量不能超过左括号 ‘(’
- 最终左右括号数量都要等于 n

```python
class Solution:
    def generateParenthesis(self, n):
        result = []  # 存储所有合法的括号组合
        path = []  # 存储当前的括号组合

        def dfs(left, right):
            # 如果路径的长度达到了 2*n，说明当前路径是一个完整的括号组合
            if len(path) == 2 * n:
                result.append("".join(path))  # 将当前组合添加到结果中
                return

            # 如果左括号的数量小于n，可以添加一个左括号
            if left < n:
                path.append('(')  # 添加左括号
                dfs(left + 1, right)  # 递归调用，增加左括号的数量
                path.pop()  # 回溯，移除当前的左括号

            # 如果右括号的数量小于左括号的数量，可以添加一个右括号
            if right < left:
                path.append(')')  # 添加右括号
                dfs(left, right + 1)  # 递归调用，增加右括号的数量
                path.pop()  # 回溯，移除当前的右括号

        dfs(0, 0)  # 从初始状态开始递归，左括号和右括号都为0
        return result  # 返回所有生成的合法括号组合


# 主函数：处理 ACM 模式输入输出
if __name__ == "__main__":
    n = int(input())  # 输入括号对数

    solution = Solution()
    ans = solution.generateParenthesis(n)

    # 输出所有合法括号组合
    for s in ans:
        print(s)


# 输入输出示例：
# 输入：
# 3
# 输出：
# ((()))
# (()())
# (())()
# ()(())
# ()()()
#
# 解释：
# n = 3 时，共有 5 种合法括号组合。
# 输出顺序由 DFS 搜索顺序决定。
```

### [79. 单词搜索](https://leetcode.cn/problems/word-search/?envType=study-plan-v2&envId=top-100-liked)

给定一个 `m x n` 二维字符网格 `board` 和一个字符串单词 `word` 。如果 `word` 存在于网格中，返回 `true` ；否则，返回 `false` 。

单词必须按照字母顺序，通过相邻的单元格内的字母构成，其中“相邻”单元格是那些水平相邻或垂直相邻的单元格。同一个单元格内的字母不允许被重复使用。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2020/11/04/word2.jpg)

```text
输入：board = [['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], word = "ABCCED"
输出：true
```

```python
class Solution:
    def exist(self, board, word):
        m, n = len(board), len(board[0])  # 获取棋盘的行数 m 和列数 n

        def dfs(i, j, index):
            # 如果越界或当前位置的字符不匹配当前索引的字符，返回 False
            if i < 0 or i >= m or j < 0 or j >= n or board[i][j] != word[index]:
                return False
            # 如果已经匹配到单词的最后一个字符，返回 True
            if index == len(word) - 1:
                return True

            temp = board[i][j]  # 保存当前字符
            board[i][j] = '#'  # 标记当前位置已访问，避免重复访问

            # 尝试向四个方向（右、左、下、上）递归查找
            for x, y in (i, j + 1), (i, j - 1), (i + 1, j), (i - 1, j):
                if dfs(x, y, index + 1):  # 递归查找下一个字符
                    return True

            board[i][j] = temp  # 回溯，将当前位置恢复为原字符
            return False

        # 遍历棋盘每个位置，如果找到第一个字符匹配，则调用 dfs 函数开始搜索
        for i in range(m):
            for j in range(n):
                if board[i][j] == word[0]:  # 找到匹配的第一个字符
                    if dfs(i, j, 0):  # 从当前位置开始查找
                        return True
        return False  # 如果遍历完所有位置都没有找到匹配，返回 False


# 主函数：处理 ACM 模式输入输出
if __name__ == "__main__":
    m, n = map(int, input().split())  # 输入行数和列数
    board = [input().split() for _ in range(m)]  # 输入字符矩阵
    word = input().strip()  # 输入目标单词

    solution = Solution()
    ans = solution.exist(board, word)

    print("True" if ans else "False")


# 输入输出示例：
# 输入：
# 3 4
# A B C E
# S F C S
# A D E E
# ABCCED
# 输出：
# True
#
# 解释：
# 给定字符矩阵：
# A B C E
# S F C S
# A D E E
# 单词 "ABCCED" 可以在矩阵中找到，因此输出 True。
#
# 再例如：
# 输入：
# 3 4
# A B C E
# S F C S
# A D E E
# ABCB
# 输出：
# False
#
# 解释：
# 单词 "ABCB" 不能在矩阵中找到，因此输出 False。
```

#### 类似 [200. 岛屿数量](https://leetcode.cn/problems/number-of-islands/?envType=study-plan-v2&envId=top-100-liked)

```python
class Solution:
    def numIslands(self, grid):
        m, n = len(grid), len(grid[0])  # 获取网格的行数 m 和列数 n
        ans = 0  # 用于存储岛屿的数量

        # 定义深度优先搜索（DFS）函数，遍历岛屿并标记已访问过的陆地
        def dfs(i, j):
            # 检查当前坐标是否在网格内，并且是陆地（'1'）
            if 0 <= i < m and 0 <= j < n and grid[i][j] == "1":
                grid[i][j] = "2"  # 将当前陆地标记为访问过（'2'）
                # 递归调用四个方向（左、右、上、下）遍历所有相连的陆地
                dfs(i, j - 1)  # 向左走
                dfs(i, j + 1)  # 向右走
                dfs(i - 1, j)  # 向上走
                dfs(i + 1, j)  # 向下走

        # 遍历网格中的每个元素
        for i in range(m):  # 遍历每一行
            for j in range(n):  # 遍历每一列
                # 如果当前元素是陆地（'1'），则表示找到一个新的岛屿
                if grid[i][j] == "1":
                    dfs(i, j)  # 对该岛屿执行DFS，标记该岛屿的所有陆地
                    ans += 1  # 增加岛屿计数

        return ans


# 主函数：处理 ACM 模式输入输出
if __name__ == "__main__":
    m, n = map(int, input().split())  # 输入网格的行数和列数
    grid = [input().split() for _ in range(m)]  # 输入网格

    solution = Solution()
    ans = solution.numIslands(grid)

    print(ans)


# 输入输出示例：
# 输入：
# 4 5
# 1 1 1 1 0
# 1 1 0 1 0
# 1 1 0 0 0
# 0 0 0 0 0
# 输出：
# 1
#
# 解释：
# 这个网格中只有 1 个岛屿。
#
# 输入：
# 4 5
# 1 1 0 0 0
# 1 1 0 0 0
# 0 0 1 0 0
# 0 0 0 1 1
# 输出：
# 3
#
# 解释：
# 这个网格中有 3 个岛屿。
```

#### 类似 [994.腐烂的橘子](https://leetcode.cn/problems/rotting-oranges/description/)

- 初始化新鲜橘子和腐烂橘子
- 当队列不空且还有新鲜橘子BFS遍历当前队列橘子坐标的四个方向

```python
class Solution:
    def orangesRotting(self, grid):
        m, n = len(grid), len(grid[0])  # 获取网格的大小
        fresh = 0  # 记录新鲜橘子的数量
        q = []  # 存储腐烂橘子的队列

        # 遍历网格，初始化 fresh 和 q
        for i, row in enumerate(grid):
            for j, x in enumerate(row):
                if x == 1:  # 如果是新鲜橘子
                    fresh += 1  # 增加新鲜橘子的数量
                elif x == 2:  # 如果是腐烂橘子
                    q.append((i, j))  # 将腐烂橘子的坐标加入队列

        ans = 0  # 记录腐烂过程经过的时间
        while q and fresh:  # 当队列不为空且还有新鲜橘子
            ans += 1  # 每轮迭代代表腐烂过程经过了一分钟
            tmp = q  # 暂存当前队列
            q = []  # 清空队列，准备下一轮扩散
            for x, y in tmp:  # 遍历当前腐烂橘子的坐标
                for i, j in (x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1):  # 四个方向扩散
                    if 0 <= i < m and 0 <= j < n and grid[i][j] == 1:  # 如果新鲜橘子
                        fresh -= 1  # 新鲜橘子数量减一
                        grid[i][j] = 2  # 变成腐烂橘子
                        q.append((i, j))  # 将新腐烂的橘子加入队列

        return -1 if fresh else ans  # 如果还有新鲜橘子无法腐烂，返回-1，否则返回腐烂的时间


# 主函数：处理 ACM 模式输入输出
if __name__ == "__main__":
    m, n = map(int, input().split())  # 输入网格的行数和列数
    grid = [list(map(int, input().split())) for _ in range(m)]  # 输入网格

    solution = Solution()
    ans = solution.orangesRotting(grid)

    print(ans)


# 输入输出示例：
# 输入：
# 3 3
# 2 1 1
# 1 1 0
# 0 1 1
# 输出：
# 4
#
# 解释：
# 第 1 分钟后：
# 2 2 1
# 2 1 0
# 0 1 1
#
# 第 2 分钟后：
# 2 2 2
# 2 2 0
# 0 1 1
#
# 第 3 分钟后：
# 2 2 2
# 2 2 0
# 0 2 1
#
# 第 4 分钟后：
# 2 2 2
# 2 2 0
# 0 2 2
#
# 所有橘子都腐烂，共需要 4 分钟。
```

### [131. 分割回文串](https://leetcode.cn/problems/palindrome-partitioning/description/?envType=study-plan-v2&envId=top-100-liked)

给你一个字符串 `s`，请你将 `s` 分割成一些 子串，使每个子串都是 **回文串** 。返回 `s` 所有可能的分割方案。

**示例 1：**

```text
输入：s = "aab"
输出：[["a","a","b"],["aa","b"]]
```

```python
class Solution:
    def partition(self, s):
        n = len(s)  # 字符串的长度
        result = []  # 存储所有回文分割的结果
        path = []  # 存储当前分割的回文子串

        def dfs(start):
            # 如果起始位置等于字符串的长度，说明已经完成了所有的分割
            if start == n:
                result.append(path.copy())  # 将当前路径（分割结果）加入结果
                return
            # 遍历从 start 到字符串结尾的所有可能的分割点
            for end in range(start + 1, n + 1):
                part = s[start:end]  # 当前分割的子串
                if part == part[::-1]:  # 如果子串是回文
                    path.append(part)  # 将回文子串加入当前路径
                    dfs(end)  # 递归调用，从下一个位置开始继续分割
                    path.pop()  # 回溯，移除最后一个回文子串

        dfs(0)  # 从字符串的第一个字符开始进行回溯搜索
        return result  # 返回所有可能的回文分割结果


# 主函数：处理 ACM 模式输入输出
if __name__ == "__main__":
    s = input().strip()  # 输入字符串

    solution = Solution()
    ans = solution.partition(s)

    # 输出所有分割方案
    for group in ans:
        print(" ".join(group))


# 输入输出示例：
# 输入：
# aab
# 输出：
# a a b
# aa b
#
# 解释：
# 字符串 "aab" 的所有回文分割方案有：
# 1. ["a", "a", "b"]
# 2. ["aa", "b"]
#
# 注意：
# 输出顺序由 DFS 搜索顺序决定。
```

### [51. N 皇后](https://leetcode.cn/problems/n-queens/description/?envType=study-plan-v2&envId=top-100-liked)

按照国际象棋的规则，皇后可以攻击与之处在同一行或同一列或同一斜线上的棋子。

**n 皇后问题** 研究的是如何将 `n` 个皇后放置在 `n×n` 的棋盘上，并且使皇后彼此之间不能相互攻击。

给你一个整数 `n` ，返回所有不同的 **n 皇后问题** 的解决方案。

每一种解法包含一个不同的 **n 皇后问题** 的棋子放置方案，该方案中 `'Q'` 和 `'.'` 分别代表了皇后和空位。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2020/11/13/queens.jpg)

```text
输入：n = 4
输出：[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]
解释：如上图所示，4 皇后问题存在两个不同的解法。
```

逐行放置皇后，每行尝试所有可能的列，如果合法就放置，然后递归处理下一行。到最后一行放完，就得到一个完整的解

- 列集合 cols：记录哪些列已经有皇后，因为同一列最多只能放一个皇后。
- 主对角线集合 diag1：主对角线的特征是行号 - 列号相等，因此使用 row - col 来表示一条主对角线
- 副对角线集合 diag2：副对角线的特征是行号 + 列号相等，因此使用 row + col 来表示一条主对角线

```python
class Solution:
    def solveNQueens(self, n):
        # 用于记录已经占用的列、对角线
        cols = set()   # 存储已经被占用的列
        diag1 = set()  # 存储已经被占用的主对角线（row - col）
        diag2 = set()  # 存储已经被占用的副对角线（row + col）

        # 初始化棋盘，所有位置初始化为 "."
        board = [["."] * n for _ in range(n)]

        ans = []  # 存储所有合法解

        def dfs(row):
            if row == n:  # 如果所有行都放置了皇后，表示找到一个解
                ans.append(["".join(row) for row in board])  # 将棋盘当前状态添加到答案
                return

            # 遍历当前行的每一列，尝试放置皇后
            for col in range(n):
                # 如果当前列或对角线已经有皇后，跳过
                if col in cols or (row - col) in diag1 or (row + col) in diag2:
                    continue

                # 放置皇后
                board[row][col] = "Q"
                cols.add(col)            # 标记当前列已经有皇后
                diag1.add(row - col)     # 标记当前主对角线已经有皇后
                diag2.add(row + col)     # 标记当前副对角线已经有皇后

                # 递归放置下一行的皇后
                dfs(row + 1)

                # 回溯，移除当前皇后
                board[row][col] = "."
                cols.remove(col)
                diag1.remove(row - col)
                diag2.remove(row + col)

        # 从第一行开始尝试放置皇后
        dfs(0)
        return ans


# 主函数：处理 ACM 模式输入输出
if __name__ == "__main__":
    n = int(input().strip())  # 输入皇后个数

    solution = Solution()
    ans = solution.solveNQueens(n)

    # 输出所有解
    for board in ans:
        for row in board:
            print(row)
        print()  # 每个解之间空一行


# 输入输出示例：
# 输入：
# 4
# 输出：
# .Q..
# ...Q
# Q...
# ..Q.
#
# ..Q.
# Q...
# ...Q
# .Q..
#
# 解释：
# n = 4 时，一共有 2 个不同的解。
# 每个解输出为一个 n 行字符串组成的棋盘，'Q' 表示皇后，'.' 表示空位。
# 不同解之间用一个空行分隔。
```

## 二分查找

### 开区间二分模板

[二分查找 开区间](https://www.bilibili.com/video/BV1AP41137w7/?vd_source=e32e3f0b13da6fe4bc644a52d012df41)

#### 区分语法

初始条件：left = -1, right = n

循环条件：left + 1 < right

向左查找：right = mid

向右查找：left = mid

mid指针计算：左右指针和折半向下取整

#### 模板口诀

左开右开，向下取整，左定右定，相邻终止。

```python
def binarySearch(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: int
    """
    if len(nums) == 0:
        return -1

    left, right = -1, len(nums)
    while left + 1 < right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid
        else:
            right = mid

    # Post-processing:
    # End Condition: left + 1 == right
    return -1
```

### [35. 搜索插入位置](https://leetcode.cn/problems/search-insert-position/description/?envType=study-plan-v2&envId=top-100-liked)

给定一个排序数组和一个目标值，在数组中找到目标值，并返回其索引。如果目标值不存在于数组中，返回它将会被按顺序插入的位置。

请必须使用时间复杂度为 `O(log n)` 的算法。

**示例 1:**

```text
输入: nums = [1,3,5,6], target = 5
输出: 2
```

```python
# 开区间二分法
class Solution:
    def searchInsert(self, nums, target):
        left = -1
        right = len(nums)
        while left + 1 < right:
            mid = (left + right) // 2
            if nums[mid] < target:
                left = mid
            else:
                right = mid
        return right

# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    nums = list(map(int, input().split()))  # 输入有序数组
    target = int(input())  # 输入目标值

    solution = Solution()
    ans = solution.searchInsert(nums, target)  # 直接调用 searchInsert 方法

    print(ans)  # 输出结果


# 输入输出示例：
# 输入：
# 1 3 5 6
# 5
# 输出：
# 2
#
# 解释：
# 目标值 5 在数组中的下标是 2，因此输出 2。
#
# 输入：
# 1 3 5 6
# 2
# 输出：
# 1
#
# 解释：
# 目标值 2 不在数组中，按顺序应插入到下标 1 的位置，因此输出 1。
```

### [74.搜索二维矩阵](https://leetcode.cn/problems/search-a-2d-matrix/description/?envType=study-plan-v2&envId=top-100-liked)

给你一个满足下述两条属性的 `m x n` 整数矩阵：

- 每行中的整数从左到右按非严格递增顺序排列。
- 每行的第一个整数大于前一行的最后一个整数。

给你一个整数 `target` ，如果 `target` 在矩阵中，返回 `true` ；否则，返回 `false` 。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2020/10/05/mat.jpg)

```text
输入：matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3
输出：true
```

```python
class Solution:
    def searchMatrix(self, matrix, target):
        m = len(matrix)  # 矩阵的行数
        n = len(matrix[0])  # 矩阵的列数
        left = -1  # 左边界初始化
        right = m * n  # 右边界初始化，矩阵总元素个数

        # 二分查找，直到左边界和右边界相邻
        while left + 1 < right:
            mid = (left + right) // 2  # 计算中间位置
            x = matrix[mid // n][mid % n]  # 将一维的索引转化为二维矩阵的坐标
            if x == target:  # 如果找到目标值
                return True
            if x < target:  # 如果中间元素小于目标值
                left = mid  # 将左边界移动到当前中间位置
            else:  # 如果中间元素大于目标值
                right = mid  # 将右边界移动到当前中间位置

        return False  # 如果遍历完矩阵仍未找到目标值，返回 False


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    m, n = map(int, input().split())  # 输入矩阵的行数和列数
    matrix = [list(map(int, input().split())) for _ in range(m)]  # 输入矩阵
    target = int(input())  # 输入目标值

    solution = Solution()
    ans = solution.searchMatrix(matrix, target)

    print("True" if ans else "False")


# 输入输出示例：
# 输入：
# 3 4
# 1 3 5 7
# 10 11 16 20
# 23 30 34 60
# 3
# 输出：
# True
#
# 解释：
# 目标值 3 在矩阵中存在，因此输出 True。
#
# 输入：
# 3 4
# 1 3 5 7
# 10 11 16 20
# 23 30 34 60
# 13
# 输出：
# False
#
# 解释：
# 目标值 13 不在矩阵中，因此输出 False。
```

### [34. 在排序数组中查找元素的第一个和最后一个位置](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/description/?envType=study-plan-v2&envId=top-100-liked)

给你一个按照非递减顺序排列的整数数组 `nums`，和一个目标值 `target`。请你找出给定目标值在数组中的开始位置和结束位置。

如果数组中不存在目标值 `target`，返回 `[-1, -1]`。

你必须设计并实现时间复杂度为 `O(log n)` 的算法解决此问题。

**示例 1：**

```text
输入：nums = [5,7,7,8,8,10], target = 8
输出：[3,4]
```

```python
class Solution:
    def lower_bound(self, nums, target):
        left = -1  # 左边界初始化为-1，表示数组之外
        right = len(nums)  # 右边界初始化为数组长度，表示数组之外
        # 使用二分查找方法，直到左边界和右边界相邻
        while left + 1 < right:
            mid = (left + right) // 2  # 计算中间位置
            if nums[mid] >= target:  # 如果中间元素大于等于目标值
                right = mid  # 更新右边界
            else:
                left = mid  # 更新左边界
        return right  # 返回右边界的位置

    def searchRange(self, nums, target):
        start = self.lower_bound(nums, target)  # 获取目标值的起始位置
        # 如果起始位置越界或目标值不匹配，说明目标值不存在，返回 [-1, -1]
        if start == len(nums) or nums[start] != target:
            return [-1, -1]
        # 获取目标值的结束位置，使用 target + 1 查找比目标值大的最小元素，再减去 1
        end = self.lower_bound(nums, target + 1) - 1
        return [start, end]  # 返回目标值的起始和结束位置


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    nums = list(map(int, input().split()))  # 输入有序数组
    target = int(input())  # 输入目标值

    solution = Solution()
    ans = solution.searchRange(nums, target)

    print(ans[0], ans[1])


# 输入输出示例：
# 输入：
# 5 7 7 8 8 10
# 8
# 输出：
# 3 4
#
# 解释：
# 目标值 8 在数组中第一次出现的位置是下标 3，
# 最后一次出现的位置是下标 4，因此输出 3 4。
#
# 输入：
# 5 7 7 8 8 10
# 6
# 输出：
# -1 -1
#
# 解释：
# 目标值 6 不在数组中，因此输出 -1 -1。
```

### [33. 搜索旋转排序数组](https://leetcode.cn/problems/search-in-rotated-sorted-array/description/?envType=study-plan-v2&envId=top-100-liked)

整数数组 `nums` 按升序排列，数组中的值 **互不相同** 。

在传递给函数之前，`nums` 在预先未知的某个下标 `k`（`0 <= k < nums.length`）上进行了 **向左旋转**，使数组变为 `[nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]`（下标 **从 0 开始** 计数）。例如， `[0,1,2,4,5,6,7]` 下标 `3` 上向左旋转后可能变为 `[4,5,6,7,0,1,2]` 。

给你 **旋转后** 的数组 `nums` 和一个整数 `target` ，如果 `nums` 中存在这个目标值 `target` ，则返回它的下标，否则返回 `-1` 。

你必须设计一个时间复杂度为 `O(log n)` 的算法解决此问题。

**示例 1：**

```text
输入：nums = [4,5,6,7,0,1,2], target = 0
输出：4
```

```python
class Solution:
    # 找到旋转排序数组中的最小值的下标
    def findMin(self, nums):
        left, right = -1, len(nums) - 1  # 开区间 (-1, n-1)
        while left + 1 < right:  # 开区间不为空
            mid = (left + right) // 2  # 计算中间位置
            if nums[mid] < nums[len(nums) - 1]:  # 如果中间元素小于右边的元素
                right = mid  # 最小值在 [left, mid] 区间
            else:
                left = mid  # 最小值在 [mid, right] 区间
        return right  # 返回最小值的下标

    # 在有序数组中查找 target 的下标
    def lower_bound(self, nums, left, right, target):
        while left + 1 < right:  # 开区间不为空
            mid = (left + right) // 2  # 计算中间位置
            # 循环不变量：
            # nums[right] >= target
            # nums[left] < target
            if nums[mid] >= target:  # 如果中间值大于等于目标值
                right = mid  # 更新右边界，缩小区间
            else:
                left = mid  # 更新左边界，缩小区间
        # 如果在右边界的范围内找到了目标值，则返回其下标，否则返回 -1
        return right if 0 <= right < len(nums) and nums[right] == target else -1

    def search(self, nums, target):
        i = self.findMin(nums)  # 找到最小值的下标
        if target > nums[len(nums) - 1]:  # 如果目标值大于数组的最后一个元素，说明目标值在第一段
            return self.lower_bound(nums, -1, i, target)  # 在旋转数组的前半部分查找
        # 目标值在第二段
        return self.lower_bound(nums, i - 1, len(nums), target)  # 在旋转数组的后半部分查找


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    nums = list(map(int, input().split()))  # 输入旋转排序数组
    target = int(input())  # 输入目标值

    solution = Solution()
    ans = solution.search(nums, target)

    print(ans)


# 输入输出示例：
# 输入：
# 4 5 6 7 0 1 2
# 0
# 输出：
# 4
#
# 解释：
# 旋转排序数组 nums = [4, 5, 6, 7, 0, 1, 2]，
# 目标值 target = 0 的下标是 4，因此输出 4。
#
# 输入：
# 4 5 6 7 0 1 2
# 3
# 输出：
# -1
#
# 解释：
# 目标值 3 不在数组中，因此输出 -1。
```

### [153. 寻找旋转排序数组中的最小值](https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array/description/?envType=study-plan-v2&envId=top-100-liked)

已知一个长度为 `n` 的数组，预先按照升序排列，经由 `1` 到 `n` 次 **旋转** 后，得到输入数组。例如，原数组 `nums = [0,1,2,4,5,6,7]` 在变化后可能得到：

- 若旋转 `4` 次，则可以得到 `[4,5,6,7,0,1,2]`
- 若旋转 `7` 次，则可以得到 `[0,1,2,4,5,6,7]`

注意，数组 `[a[0], a[1], a[2], ..., a[n-1]]` **旋转一次** 的结果为数组 `[a[n-1], a[0], a[1], a[2], ..., a[n-2]]` 。

给你一个元素值 **互不相同** 的数组 `nums` ，它原来是一个升序排列的数组，并按上述情形进行了多次旋转。请你找出并返回数组中的 **最小元素** 。

你必须设计一个时间复杂度为 `O(log n)` 的算法解决此问题。

**示例 1：**

```text
输入：nums = [3,4,5,1,2]
输出：1
解释：原数组为 [1,2,3,4,5] ，旋转 3 次得到输入数组。
```

```python
class Solution:
    # 查找旋转排序数组中的最小值
    def findMin(self, nums):
        left, right = -1, len(nums) - 1  # 开区间 (-1, n-1)
        while left + 1 < right:  # 开区间不为空
            mid = (left + right) // 2  # 计算中间位置
            if nums[mid] < nums[-1]:  # 如果中间元素小于右边的元素
                right = mid  # 最小值在 [left, mid] 区间
            else:
                left = mid  # 最小值在 [mid, right] 区间
        return nums[right]  # 返回最小值


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    nums = list(map(int, input().split()))  # 输入旋转排序数组

    solution = Solution()
    ans = solution.findMin(nums)

    print(ans)


# 输入输出示例：
# 输入：
# 3 4 5 1 2
# 输出：
# 1
#
# 解释：
# 旋转排序数组 nums = [3, 4, 5, 1, 2]，
# 数组中的最小值是 1，因此输出 1。
#
# 输入：
# 4 5 6 7 0 1 2
# 输出：
# 0
#
# 解释：
# 旋转排序数组 nums = [4, 5, 6, 7, 0, 1, 2]，
# 数组中的最小值是 0，因此输出 0。
```

### [4. 寻找两个正序数组的中位数](https://leetcode.cn/problems/median-of-two-sorted-arrays/description/?envType=study-plan-v2&envId=top-100-liked)

给定两个大小分别为 `m` 和 `n` 的正序（从小到大）数组 `nums1` 和 `nums2`。请你找出并返回这两个正序数组的 **中位数** 。

算法的时间复杂度应该为 `O(log (m+n))` 。

**示例 1：**

```text
输入：nums1 = [1,3], nums2 = [2]
输出：2.00000
解释：合并数组 = [1,2,3] ，中位数 2
```

![微信图片_20251126101232_56_100](https://raw.githubusercontent.com/1910853272/image/master/img/202511262206970.jpg)

![iShot_2025-11-25_22.44.59](https://raw.githubusercontent.com/1910853272/image/master/img/202511252248225.png)

```python
from math import inf

class Solution:
    def findMedianSortedArrays(self, nums1, nums2):
        # 保证 nums1 是较小的数组，便于后续二分查找
        if len(nums1) > len(nums2):
            nums1, nums2 = nums2, nums1

        m, n = len(nums1), len(nums2)  # 获取两个数组的长度
        # 循环不变量：
        # nums1[left] <= nums2[j+1]（左边部分的最大值不大于右边部分的最小值）
        # nums1[right] > nums2[j]（右边部分的最小值大于左边部分的最大值）
        left, right = -1, m  # 设定二分查找的区间范围

        # 二分查找
        while left + 1 < right:  # 开区间 (left, right) 不为空
            i = (left + right) // 2  # 计算 nums1 的中间位置
            j = (m + n - 3) // 2 - i  # 计算 nums2 对应的中间位置

            if nums1[i] < nums2[j + 1]:  # 如果 nums1[i] 小于 nums2[j+1]
                left = i  # 缩小查找区间为 (i, right)
            else:
                right = i  # 缩小查找区间为 (left, i)

        # 此时 left 等于 right-1
        # nums1[left] <= nums2[j+1] 且 nums1[right] > nums2[j+1]，所以答案是 i=left
        i = left  # nums1 中的左边部分的最大值位置
        j = (m + n - 3) // 2 - i  # nums2 中的左边部分的最大值位置

        # 处理边界情况，i 和 j 可能越界
        ai = nums1[i] if i >= 0 else -float('inf')  # nums1 中的第 i 个元素，如果 i 越界，则为负无穷
        bj = nums2[j] if j >= 0 else -float('inf')  # nums2 中的第 j 个元素，如果 j 越界，则为负无穷
        ai1 = nums1[i + 1] if i + 1 < m else float('inf')  # nums1 中的第 i+1 个元素，如果越界，则为正无穷
        bj1 = nums2[j + 1] if j + 1 < n else float('inf')  # nums2 中的第 j+1 个元素，如果越界，则为正无穷

        # 计算中位数
        max1 = max(ai, bj)  # 左边部分的最大值
        min2 = min(ai1, bj1)  # 右边部分的最小值

        # 如果总长度是奇数，返回左边部分的最大值；如果是偶数，返回左右部分的均值
        return max1 if (m + n) % 2 else (max1 + min2) / 2


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    nums1 = list(map(int, input().split()))  # 输入第一个有序数组
    nums2 = list(map(int, input().split()))  # 输入第二个有序数组

    solution = Solution()
    ans = solution.findMedianSortedArrays(nums1, nums2)

    print(ans)


# 输入输出示例：
# 输入：
# 1 3
# 2
# 输出：
# 2
#
# 解释：
# nums1 = [1, 3], nums2 = [2]
# 合并后为 [1, 2, 3]，中位数是 2。
#
# 输入：
# 1 2
# 3 4
# 输出：
# 2.5
#
# 解释：
# nums1 = [1, 2], nums2 = [3, 4]
# 合并后为 [1, 2, 3, 4]，中位数是 (2 + 3) / 2 = 2.5。
```

## 栈

### 单调栈模板

```python
def calculateGreaterElement(nums):
    n = len(nums)
    # 存放答案的数组
    res = [0]*n
    s = []
    # 倒着往栈里放
    for i in range(n-1, -1, -1):
        # 判定个子高矮
        while s and s[-1] <= nums[i]:
            # 矮个起开，反正也被挡着了。。。
            s.pop()
        # nums[i] 身后的更大元素
        res[i] = -1 if not s else s[-1]
        s.append(nums[i])
    return res
```

### [20. 有效的括号](https://leetcode.cn/problems/valid-parentheses/description/?envType=study-plan-v2&envId=top-100-liked)

给定一个只包括 `'('`，`')'`，`'{'`，`'}'`，`'['`，`']'` 的字符串 `s` ，判断字符串是否有效。

有效字符串需满足：

1. 左括号必须用相同类型的右括号闭合。
2. 左括号必须以正确的顺序闭合。
3. 每个右括号都有一个对应的相同类型的左括号。

**示例 1：**

**输入：**s = "()"

**输出：**true

```python
class Solution:
    def isValid(self, s):
        stack = []  # 创建一个空栈，用来存储左括号
        pairs = {"(": ")", "{": "}", "[": "]"}  # 定义一个字典，表示每个左括号对应的右括号
        for char in s:  # 遍历字符串中的每个字符
            if char in pairs:  # 如果当前字符是左括号（即 '(', '{', '['）
                stack.append(char)  # 将该左括号压入栈
            else:
                # 如果栈不为空，并且当前字符是栈顶元素的对应右括号
                if stack and char == pairs[stack[-1]]:
                    stack.pop()  # 弹出栈顶的左括号
                else:
                    return False  # 如果不匹配，返回 False
        return not stack  # 如果栈为空，说明所有的左括号都有对应的右括号，返回 True，否则返回 False


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    s = input().strip()  # 输入括号字符串

    solution = Solution()
    ans = solution.isValid(s)

    print("True" if ans else "False")


# 输入输出示例：
# 输入：
# ()[]{}
# 输出：
# True
#
# 解释：
# 所有括号都能正确配对，因此输出 True。
#
# 输入：
# ([)]
# 输出：
# False
#
# 解释：
# 括号嵌套顺序不正确，不能正确配对，因此输出 False。
```

### [155. 最小栈](https://leetcode.cn/problems/min-stack/?envType=study-plan-v2&envId=top-100-liked)

设计一个支持 `push` ，`pop` ，`top` 操作，并能在常数时间内检索到最小元素的栈。

实现 `MinStack` 类:

- `MinStack()` 初始化堆栈对象。
- `void push(int val)` 将元素val推入堆栈。
- `void pop()` 删除堆栈顶部的元素。
- `int top()` 获取堆栈顶部的元素。
- `int getMin()` 获取堆栈中的最小元素。

**示例 1:**

```text
输入：
["MinStack","push","push","push","getMin","pop","top","getMin"]
[[],[-2],[0],[-3],[],[],[],[]]

输出：
[null,null,null,null,-3,null,0,-2]

解释：
MinStack minStack = new MinStack();
minStack.push(-2);
minStack.push(0);
minStack.push(-3);
minStack.getMin();   --> 返回 -3.
minStack.pop();
minStack.top();      --> 返回 0.
minStack.getMin();   --> 返回 -2.
```

```python
class MinStack:
    # 构造函数，初始化栈
    def __init__(self):
        self.stack = []        # 主栈，用于存储所有元素
        self.min_stack = []    # 辅助栈，用于存储当前最小的元素

    # 压入元素 x 到栈中
    def push(self, x):
        self.stack.append(x)  # 将元素 x 压入主栈
        # 如果辅助栈为空，或者当前元素 x 小于等于辅助栈的栈顶元素（即当前最小值），
        # 则将当前元素 x 压入辅助栈
        if not self.min_stack or x <= self.min_stack[-1]:
            self.min_stack.append(x)

    # 弹出栈顶元素
    def pop(self):
        tmp = self.stack.pop()  # 弹出主栈的栈顶元素
        # 如果弹出的元素是当前栈的最小值（即它等于辅助栈栈顶元素），
        # 那么也从辅助栈中弹出该元素
        if tmp == self.min_stack[-1]:
            self.min_stack.pop()

    # 返回栈顶元素
    def top(self):
        return self.stack[-1]  # 返回主栈的栈顶元素

    # 获取栈中的最小元素
    def getMin(self):
        return self.min_stack[-1]  # 返回辅助栈的栈顶元素，即当前栈中的最小值


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    n = int(input().strip())  # 输入操作次数
    st = MinStack()

    for _ in range(n):
        op = input().split()

        if op[0] == "push":
            x = int(op[1])
            st.push(x)
        elif op[0] == "pop":
            st.pop()
        elif op[0] == "top":
            print(st.top())
        elif op[0] == "getMin":
            print(st.getMin())


# 输入输出示例：
# 输入：
# 8
# push 3
# push 5
# getMin
# push 2
# push 2
# getMin
# pop
# top
#
# 输出：
# 3
# 2
# 2
#
# 解释：
# 1. push 3  -> 栈为 [3]，最小值为 3
# 2. push 5  -> 栈为 [3, 5]，最小值为 3
# 3. getMin  -> 输出 3
# 4. push 2  -> 栈为 [3, 5, 2]，最小值为 2
# 5. push 2  -> 栈为 [3, 5, 2, 2]，最小值为 2
# 6. getMin  -> 输出 2
# 7. pop     -> 弹出一个 2
# 8. top     -> 当前栈顶为 2，因此输出 2
```

### [394. 字符串解码](https://leetcode.cn/problems/decode-string/description/?envType=study-plan-v2&envId=top-100-liked)

给定一个经过编码的字符串，返回它解码后的字符串。

编码规则为: `k[encoded_string]`，表示其中方括号内部的 `encoded_string` 正好重复 `k` 次。注意 `k` 保证为正整数。

你可以认为输入字符串总是有效的；输入字符串中没有额外的空格，且输入的方括号总是符合格式要求的。

此外，你可以认为原始数据不包含数字，所有的数字只表示重复的次数 `k` ，例如不会出现像 `3a` 或 `2[4]` 的输入。

测试用例保证输出的长度不会超过 `105`。

**示例 1：**

```text
输入：s = "3[a]2[bc]"
输出："aaabcbc"
```

```python
class Solution:
    def decodeString(self, s):
        stack = []  # 用栈来辅助存储字符
        for char in s:  # 遍历字符串的每个字符
            if char != "]":  # 如果字符不是 ']'，则将字符入栈
                stack.append(char)
            else:  # 如果字符是 ']'，则开始处理一个完整的编码部分
                tmp = []  # 用来存放 '[' 和 ']' 之间的字符
                while stack and stack[-1] != "[":  # 弹出栈中的字符，直到遇到 '['
                    tmp.append(stack.pop())  # 将字符添加到 tmp 列表
                stack.pop()  # 弹出 '['，表示编码部分的结束

                num = []  # 用来存放重复次数的数字
                while stack and stack[-1].isdigit():  # 获取重复次数
                    num.append(stack.pop())  # 弹出数字字符
                repeat = int("".join(reversed(num))) if num else 1  # 将数字转换成整数，如果没有数字则默认为 1

                # 将重复后的子串压回栈中
                stack.append("".join(reversed(tmp)) * repeat)

        return "".join(stack)  # 将栈中的字符拼接成最终结果并返回


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    s = input().strip()  # 输入编码字符串

    solution = Solution()
    ans = solution.decodeString(s)

    print(ans)


# 输入输出示例：
# 输入：
# 3[a]2[bc]
# 输出：
# aaabcbc
#
# 解释：
# 3[a] 表示 "a" 重复 3 次，得到 "aaa"
# 2[bc] 表示 "bc" 重复 2 次，得到 "bcbc"
# 最终结果为 "aaabcbc"
#
# 输入：
# 3[a2[c]]
# 输出：
# accaccacc
#
# 解释：
# a2[c] -> "acc"
# 3[acc] -> "accaccacc"
```

### [739. 每日温度](https://leetcode.cn/problems/daily-temperatures/description/?envType=study-plan-v2&envId=top-100-liked) [单调栈]

给定一个整数数组 `temperatures` ，表示每天的温度，返回一个数组 `answer` ，其中 `answer[i]` 是指对于第 `i` 天，下一个更高温度出现在几天后。如果气温在这之后都不会升高，请在该位置用 `0` 来代替。

**示例 1:**

```text
输入: temperatures = [73,74,75,71,69,72,76,73]
输出: [1,1,4,2,1,1,0,0]
```

```python
class Solution:
    def dailyTemperatures(self, temperatures):
        # 初始化答案数组 'ans'，长度与 'temperatures' 相同，初始值都为0
        # ans[i] 代表第i天到下一个更高温度的天数，若没有更高温度则为0
        ans = [0] * len(temperatures)

        # 初始化栈，用来存储温度的索引
        # 栈用于保存温度序列中的索引，帮助我们跟踪尚未找到下一个更高温度的日子
        stack = []

        # 遍历 temperatures 列表，使用 'i' 表示当前温度的索引，'x' 表示当前温度
        for i, x in enumerate(temperatures):
            # 如果栈不为空，且当前温度 x 大于栈顶索引对应的温度，则说明找到了一个更高温度
            # 栈顶保存的是尚未找到更高温度的日子的索引
            while stack and x > temperatures[stack[-1]]:
                # 弹出栈顶索引 j，因为找到了一个比温度更高的天数
                j = stack.pop()

                # 更新 ans[j]，表示第 j 天到下一个更高温度的天数
                # 当前温度是第 i 天，更新结果为 i - j
                ans[j] = i - j

            # 将当前天数的索引 i 压入栈中
            # 当前天数是尚未找到下一个更高温度的天数
            stack.append(i)

        # 返回最终的答案数组 ans
        return ans


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    temperatures = list(map(int, input().split()))  # 输入每天的温度

    solution = Solution()
    ans = solution.dailyTemperatures(temperatures)

    print(" ".join(map(str, ans)))


# 输入输出示例：
# 输入：
# 73 74 75 71 69 72 76 73
# 输出：
# 1 1 4 2 1 1 0 0
#
# 解释：
# 第 0 天 73°F，下一个更高温度是第 1 天 74°F，所以是 1 天
# 第 1 天 74°F，下一个更高温度是第 2 天 75°F，所以是 1 天
# 第 2 天 75°F，下一个更高温度是第 6 天 76°F，所以是 4 天
# 第 3 天 71°F，下一个更高温度是第 5 天 72°F，所以是 2 天
# 第 4 天 69°F，下一个更高温度是第 5 天 72°F，所以是 1 天
# 第 5 天 72°F，下一个更高温度是第 6 天 76°F，所以是 1 天
# 第 6 天 76°F，后面没有更高温度，所以是 0
# 第 7 天 73°F，后面没有更高温度，所以是 0
```

### [84. 柱状图中最大的矩形](https://leetcode.cn/problems/largest-rectangle-in-histogram/description/?envType=study-plan-v2&envId=top-100-liked) [单调栈]

给定 _n_ 个非负整数，用来表示柱状图中各个柱子的高度。每个柱子彼此相邻，且宽度为 1 。

求在该柱状图中，能够勾勒出来的矩形的最大面积。

**示例 1:**

![img](https://assets.leetcode.com/uploads/2021/01/04/histogram.jpg)

```text
输入：heights = [2,1,5,6,2,3]
输出：10
解释：最大的矩形为图中红色区域，面积为 10
```

由于面积最大矩形的高度一定是 heights 中的元素，因此可以遍历每一个高度，然后找到其左侧小于当前高度的最近元素下标 left，那么 left+1 就是最左侧的那根柱子；

再找到其右侧小于当前高度的最近下标 right，那么 right -1 就是最右侧的那根柱子。

这样就达到了最大的宽度 (right -1) - (left+1) + 1 = right - left - 1。

```python
class Solution:
    def largestRectangleArea(self, heights):
        # 获取柱子的数量
        n = len(heights)

        # left[i] 表示柱子 i 左边第一个比当前柱子矮的柱子的索引
        left = [-1] * n

        # 用栈来存储柱子的索引，帮助我们找到每个柱子的左边界
        stack = []

        # 从左到右遍历每个柱子
        for i, h in enumerate(heights):
            # 当栈非空并且栈顶柱子高度大于等于当前柱子高度时，弹出栈顶元素
            while stack and h <= heights[stack[-1]]:
                stack.pop()

            # 如果栈不为空，栈顶元素就是当前柱子的左边界
            if stack:
                left[i] = stack[-1]

            # 当前柱子的索引加入栈中，继续查找后续柱子的左边界
            stack.append(i)

        # right[i] 表示柱子 i 右边第一个比当前柱子矮的柱子的索引
        right = [n] * n  # 初始化为 n，表示每个柱子右边的边界是整个数组的长度

        # 清空栈，准备进行右边界的计算
        stack.clear()

        # 从右到左遍历每个柱子
        for i in range(n - 1, -1, -1):
            h = heights[i]
            # 当栈非空并且栈顶柱子高度大于等于当前柱子高度时，弹出栈顶元素
            while stack and h <= heights[stack[-1]]:
                stack.pop()

            # 如果栈不为空，栈顶元素就是当前柱子的右边界
            if stack:
                right[i] = stack[-1]

            # 当前柱子的索引加入栈中，继续查找后续柱子的右边界
            stack.append(i)

        # 计算每个柱子为高度所形成的最大矩形面积
        ans = 0
        for h, l, r in zip(heights, left, right):
            # 计算当前柱子能够形成的矩形的面积
            # 高度 h 乘以宽度 (r - l - 1)，r 和 l 是当前柱子的右边界和左边界
            ans = max(ans, h * (r - l - 1))

        # 返回最大面积
        return ans


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    heights = list(map(int, input().split()))  # 输入柱状图各柱子的高度

    solution = Solution()
    ans = solution.largestRectangleArea(heights)

    print(ans)


# 输入输出示例：
# 输入：
# 2 1 5 6 2 3
# 输出：
# 10
#
# 解释：
# 给定柱状图高度为 [2, 1, 5, 6, 2, 3]
# 其中最大矩形面积为 10
# 这个矩形由高度 5 和 6 两根柱子形成，宽度为 2，所以面积为 5 * 2 = 10
#
# 输入：
# 2 4
# 输出：
# 4
#
# 解释：
# 给定柱状图高度为 [2, 4]
# 最大矩形面积为 4
```

## 堆

### 快排模板

```python
def partition(nums, left, right):
    pivot = nums[left]#初始化一个待比较数据
    i,j = left, right
    while(i < j):
        while(i<j and nums[j]>=pivot): #从后往前查找，直到找到一个比pivot更小的数
            j-=1
        nums[i] = nums[j] #将更小的数放入左边
        while(i<j and nums[i]<=pivot): #从前往后找，直到找到一个比pivot更大的数
            i+=1
        nums[j] = nums[i] #将更大的数放入右边
    #循环结束，i与j相等
    nums[i] = pivot #待比较数据放入最终位置
    return i #返回待比较数据最终位置

def quicksort(nums, left, right):
    if left < right:
        index = partition(nums, left, right)
        quicksort(nums, left, index-1)
        quicksort(nums, index+1, right)
```

### [215. 数组中的第 K 个最大元素](https://leetcode.cn/problems/kth-largest-element-in-an-array/description/?envType=study-plan-v2&envId=top-100-liked)

给定整数数组 `nums` 和整数 `k`，请返回数组中第 `**k**` 个最大的元素。

请注意，你需要找的是数组排序后的第 `k` 个最大的元素，而不是第 `k` 个不同的元素。

你必须设计并实现时间复杂度为 `O(n)` 的算法解决此问题。

**示例 1:**

```text
输入: [3,2,1,5,6,4], k = 2
输出: 5
```

```python
# 快速选择（基于快速排序中的 partition 思想）
class Solution:
    # 使用给定的 partition 函数
    def partition(self, nums, left, right):
        pivot = nums[left]  # 初始化一个待比较数据
        i, j = left, right
        while i < j:
            while i < j and nums[j] >= pivot:  # 从后往前查找，直到找到一个比 pivot 更小的数
                j -= 1
            nums[i] = nums[j]  # 将更小的数放入左边
            while i < j and nums[i] <= pivot:  # 从前往后找，直到找到一个比 pivot 更大的数
                i += 1
            nums[j] = nums[i]  # 将更大的数放入右边
        # 循环结束，i 与 j 相等
        nums[i] = pivot  # 待比较数据放入最终位置
        return i  # 返回待比较数据最终位置

    def findKthLargest(self, nums, k):
        n = len(nums)
        target_index = n - k  # 第 k 大元素在升序数组中的下标是 n - k
        left, right = 0, n - 1  # 闭区间
        while True:
            i = self.partition(nums, left, right)
            if i == target_index:
                # 找到第 k 大元素
                return nums[i]
            if i > target_index:
                # 第 k 大元素在 [left, i - 1] 中
                right = i - 1
            else:
                # 第 k 大元素在 [i + 1, right] 中
                left = i + 1


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    nums = list(map(int, input().split()))  # 输入数组
    k = int(input())  # 输入 k

    solution = Solution()
    ans = solution.findKthLargest(nums, k)

    print(ans)


# 输入输出示例：
# 输入：
# 3 2 1 5 6 4
# 2
# 输出：
# 5
#
# 解释：
# 数组为 [3, 2, 1, 5, 6, 4]
# 第 2 大的元素是 5，因此输出 5。
#
# 输入：
# 3 2 3 1 2 4 5 5 6
# 4
# 输出：
# 4
#
# 解释：
# 数组为 [3, 2, 3, 1, 2, 4, 5, 5, 6]
# 第 4 大的元素是 4，因此输出 4。
```

```python
import heapq


# 大根堆
class Solution:
    def findKthLargest(self, nums, k):
        # 将数组中的每个元素取负，变成一个大根堆（最大堆）
        nums = [-x for x in nums]

        # 使用 heapq 对数组进行堆化，heapq 默认是最小堆
        heapq.heapify(nums)

        # 弹出堆顶的元素 k-1 次，堆顶元素是当前最小的（即原数组中的最大元素）
        for _ in range(k - 1):
            heapq.heappop(nums)

        # 弹出堆顶的元素，它即为第 k 大的元素（由于之前取了负号，所以取负）
        return -heapq.heappop(nums)


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    nums = list(map(int, input().split()))  # 输入数组
    k = int(input())  # 输入 k

    solution = Solution()
    ans = solution.findKthLargest(nums, k)

    print(ans)


# 输入输出示例：
# 输入：
# 3 2 1 5 6 4
# 2
# 输出：
# 5
#
# 解释：
# 数组 nums = [3, 2, 1, 5, 6, 4]
# 第 2 大的元素是 5，因此输出 5。
#
# 输入：
# 3 2 3 1 2 4 5 5 6
# 4
# 输出：
# 4
#
# 解释：
# 数组 nums = [3, 2, 3, 1, 2, 4, 5, 5, 6]
# 第 4 大的元素是 4，因此输出 4。
```

### [347. 前 K 个高频元素](https://leetcode.cn/problems/top-k-frequent-elements/description/?envType=study-plan-v2&envId=top-100-liked)

给你一个整数数组 `nums` 和一个整数 `k` ，请你返回其中出现频率前 `k` 高的元素。你可以按 **任意顺序** 返回答案。

**示例 1：**

**输入：**nums = [1,1,1,2,2,3], k = 2

**输出：**[1,2]

```python
import collections
import heapq

# 大根堆
class Solution:
    def topKFrequent(self, nums, k):
        # 统计每个元素的频率
        dic = collections.Counter(nums)

        # 使用大根堆来存储频率和元素
        heap = []

        # 构造堆（使用负数模拟大根堆）
        for num, freq in dic.items():
            # 由于 heapq 是最小堆，这里使用负数来模拟大根堆
            heapq.heappush(heap, (-freq, num))

        # 从堆中弹出前 k 个元素（频率最高的 k 个）
        ans = []
        for _ in range(k):
            ans.append(heapq.heappop(heap)[1])  # 弹出堆顶元素并返回对应的元素值

        return ans

# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    nums = list(map(int, input().split()))  # 输入数组
    k = int(input())  # 输入 k

    solution = Solution()
    ans = solution.topKFrequent(nums, k)

    print(" ".join(map(str, ans)))


# 输入输出示例：
# 输入：
# 1 1 1 2 2 3
# 2
# 输出：
# 1 2
#
# 解释：
# 数组 nums = [1, 1, 1, 2, 2, 3]
# 出现频率最高的前 2 个元素是 1 和 2，因此输出 1 2。
#
# 输入：
# 1
# 1
# 输出：
# 1
#
# 解释：
# 数组 nums = [1]
# 出现频率最高的前 1 个元素是 1，因此输出 1。
```

### [295. 数据流的中位数](https://leetcode.cn/problems/find-median-from-data-stream/?envType=study-plan-v2&envId=top-100-liked)

**中位数**是有序整数列表中的中间值。如果列表的大小是偶数，则没有中间值，中位数是两个中间值的平均值。

- 例如 `arr = [2,3,4]` 的中位数是 `3` 。
- 例如 `arr = [2,3]` 的中位数是 `(2 + 3) / 2 = 2.5` 。

实现 MedianFinder 类:

- `MedianFinder()` 初始化 `MedianFinder` 对象。
- `void addNum(int num)` 将数据流中的整数 `num` 添加到数据结构中。
- `double findMedian()` 返回到目前为止所有元素的中位数。与实际答案相差 `10-5` 以内的答案将被接受。

**示例 1：**

```text
输入
["MedianFinder", "addNum", "addNum", "findMedian", "addNum", "findMedian"]
[[], [1], [2], [], [3], []]
输出
[null, null, null, 1.5, null, 2.0]

解释
MedianFinder medianFinder = new MedianFinder();
medianFinder.addNum(1);    // arr = [1]
medianFinder.addNum(2);    // arr = [1, 2]
medianFinder.findMedian(); // 返回 1.5 ((1 + 2) / 2)
medianFinder.addNum(3);    // arr[1, 2, 3]
medianFinder.findMedian(); // return 2.0
```

```python
from heapq import heappush, heappop

# 大根堆 + 小根堆
class MedianFinder:
    def __init__(self):
        # 存储较小一半的数，使用最大堆（Python 默认是最小堆，故取反数来实现最大堆）
        self.left = []  # 较小一半的堆，取相反数变成最大堆
        # 存储较大一半的数，使用最小堆
        self.right = []  # 较大一半的堆（最小堆）

    def addNum(self, num):
        # 如果左堆（较小一半）和右堆（较大一半）大小相等
        if len(self.left) == len(self.right):
            heappush(self.right, num)  # 将新数加入右堆（最小堆）
            heappush(self.left, -heappop(self.right))  # 从右堆取出最小的数并加入左堆（最大堆），注意取反
        else:
            heappush(self.left, -num)  # 将新数加入左堆（最大堆），取反
            heappush(self.right, -heappop(self.left))  # 从左堆取出最大的数并加入右堆（最小堆），注意取反

    def findMedian(self):
        # 如果左堆（较小一半）比右堆（较大一半）多一个元素，返回左堆的根（即最大堆的最大值）
        if len(self.left) > len(self.right):
            return -self.left[0]  # 由于存的是相反数，返回时需要取反
        # 如果两个堆大小相等，返回两个堆根的平均值
        return (self.right[0] - self.left[0]) / 2  # 返回两个堆的根值的平均值

# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    n = int(input().strip())  # 输入操作次数
    mf = MedianFinder()

    for _ in range(n):
        op = input().split()

        if op[0] == "addNum":
            num = int(op[1])
            mf.addNum(num)
        elif op[0] == "findMedian":
            print(mf.findMedian())


# 输入输出示例：
# 输入：
# 6
# addNum 1
# addNum 2
# findMedian
# addNum 3
# findMedian
# addNum 4
# 输出：
# 1.5
# 2
#
# 解释：
# 1. 插入 1，当前数据流为 [1]
# 2. 插入 2，当前数据流为 [1, 2]
# 3. findMedian -> 中位数是 (1 + 2) / 2 = 1.5
# 4. 插入 3，当前数据流为 [1, 2, 3]
# 5. findMedian -> 中位数是 2
# 6. 插入 4，当前数据流为 [1, 2, 3, 4]
```

## 贪心算法

### [121. 买卖股票的最佳时机](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/description/?envType=study-plan-v2&envId=top-100-liked)

给定一个数组 `prices` ，它的第 `i` 个元素 `prices[i]` 表示一支给定股票第 `i` 天的价格。

你只能选择 **某一天** 买入这只股票，并选择在 **未来的某一个不同的日子** 卖出该股票。设计一个算法来计算你所能获取的最大利润。

返回你可以从这笔交易中获取的最大利润。如果你不能获取任何利润，返回 `0` 。

**示例 1：**

```text
输入：[7,1,5,3,6,4]
输出：5
解释：在第 2 天（股票价格 = 1）的时候买入，在第 5 天（股票价格 = 6）的时候卖出，最大利润 = 6-1 = 5 。
     注意利润不能是 7-1 = 6, 因为卖出价格需要大于买入价格；同时，你不能在买入前卖出股票。
```

买入日期必须在卖出日期之前：从 prices[0] 到 prices[i−1] 的最小值minPrice

只能买卖一次：在遍历中，计算 prices[i]−minPrice 的最大值

```python
class Solution:
    def maxProfit(self, prices):
        ans = 0  # 初始化最大利润为0
        min_price = prices[0]  # 设置初始的最低价格为第一个价格
        for p in prices:  # 遍历每一天的股价
            ans = max(ans, p - min_price)  # 计算当前利润，更新最大利润
            min_price = min(min_price, p)  # 更新最低价格
        return ans  # 返回最大利润


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    prices = list(map(int, input().split()))  # 输入每天的股票价格

    solution = Solution()
    ans = solution.maxProfit(prices)

    print(ans)


# 输入输出示例：
# 输入：
# 7 1 5 3 6 4
# 输出：
# 5
#
# 解释：
# 在第 2 天价格为 1 时买入，第 5 天价格为 6 时卖出，
# 最大利润 = 6 - 1 = 5。
#
# 输入：
# 7 6 4 3 1
# 输出：
# 0
#
# 解释：
# 股票价格一直下降，无法获得利润，因此输出 0。
```

### [55. 跳跃游戏](https://leetcode.cn/problems/jump-game/description/?envType=study-plan-v2&envId=top-100-liked)

给你一个非负整数数组 `nums` ，你最初位于数组的 **第一个下标** 。数组中的每个元素代表你在该位置可以跳跃的最大长度。

判断你是否能够到达最后一个下标，如果可以，返回 `true` ；否则，返回 `false` 。

**示例 1：**

```text
输入：nums = [2,3,1,1,4]
输出：true
解释：可以先跳 1 步，从下标 0 到达下标 1, 然后再从下标 1 跳 3 步到达最后一个下标。
```

```python
class Solution:
    def canJump(self, nums):
        mx = 0  # 初始化最大可达位置为 0
        for i in range(len(nums)):  # 遍历数组中的每一个位置
            if i > mx:  # 如果当前位置 i 超过了当前最大可达位置 mx，说明无法到达当前位置
                return False
            mx = max(i + nums[i], mx)  # 更新最大可达位置，取当前位置 i 和当前位置可跳跃的最大距离 i + nums[i] 中的较大值
        return True  # 如果遍历完所有位置，都没有返回 False，说明可以跳到最后一位置，返回 True


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    nums = list(map(int, input().split()))  # 输入数组

    solution = Solution()
    ans = solution.canJump(nums)

    print("True" if ans else "False")


# 输入输出示例：
# 输入：
# 2 3 1 1 4
# 输出：
# True
#
# 解释：
# 从下标 0 出发，最远可以逐步到达最后一个位置，因此输出 True。
#
# 输入：
# 3 2 1 0 4
# 输出：
# False
#
# 解释：
# 到达下标 3 后最多只能停在原地，无法继续到达最后一个位置，因此输出 False。
```

### [45. 跳跃游戏 II](https://leetcode.cn/problems/jump-game-ii/description/?envType=study-plan-v2&envId=top-100-liked)

给定一个长度为 `n` 的 **0 索引**整数数组 `nums`。初始位置在下标 0。

每个元素 `nums[i]` 表示从索引 `i` 向后跳转的最大长度。换句话说，如果你在索引 `i` 处，你可以跳转到任意 `(i + j)` 处：

- `0 <= j <= nums[i]` 且
- `i + j < n`

返回到达 `n - 1` 的最小跳跃次数。测试用例保证可以到达 `n - 1`。

**示例 1:**

```text
输入: nums = [2,3,1,1,4]
输出: 2
解释: 跳到最后一个位置的最小跳跃数是 2。
     从下标为 0 跳到下标为 1 的位置，跳 1 步，然后跳 3 步到达数组的最后一个位置。
```

```python
class Solution:
    def jump(self, nums):
        ans = 0  # 初始化跳跃次数
        cur_right = 0  # 当前已建造的桥的右端点，表示当前最远可以到达的位置
        next_right = 0  # 下一座桥的右端点的最大值，表示从当前位置可以跳跃到的最远位置
        for i in range(len(nums) - 1):  # 遍历数组中的每个位置，注意要排除最后一个位置
            # 在遍历过程中，记录当前位置能跳跃到的最远点
            next_right = max(next_right, i + nums[i])  # 更新下一座桥的最远右端点

            if i == cur_right:  # 如果当前位置是当前能到达的最远位置
                cur_right = next_right  # 更新当前能到达的最远位置为下一座桥的最远右端点
                ans += 1  # 跳跃一次，增加跳跃次数

        return ans  # 返回最小跳跃次数


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    nums = list(map(int, input().split()))  # 输入数组

    solution = Solution()
    ans = solution.jump(nums)

    print(ans)


# 输入输出示例：
# 输入：
# 2 3 1 1 4
# 输出：
# 2
#
# 解释：
# 从下标 0 出发，先跳到下标 1，再从下标 1 跳到最后一个位置，
# 最少跳跃次数为 2。
#
# 输入：
# 2 3 0 1 4
# 输出：
# 2
#
# 解释：
# 从下标 0 出发，先跳到下标 1，再从下标 1 跳到最后一个位置，
# 最少跳跃次数为 2。
```

### [763. 划分字母区间](https://leetcode.cn/problems/partition-labels/?envType=study-plan-v2&envId=top-100-liked)

给你一个字符串 `s` 。我们要把这个字符串划分为尽可能多的片段，同一字母最多出现在一个片段中。例如，字符串 `"ababcc"` 能够被分为 `["abab", "cc"]`，但类似 `["aba", "bcc"]` 或 `["ab", "ab", "cc"]` 的划分是非法的。

注意，划分结果需要满足：将所有划分结果按顺序连接，得到的字符串仍然是 `s` 。

返回一个表示每个字符串片段的长度的列表。

**示例 1：**

```text
输入：s = "ababcbacadefegdehijhklij"
输出：[9,7,8]
解释：
划分结果为 "ababcbaca"、"defegde"、"hijhklij" 。
每个字母最多出现在一个片段中。
像 "ababcbacadefegde", "hijhklij" 这样的划分是错误的，因为划分的片段数较少。
```

```python
class Solution:
    def partitionLabels(self, s):
        # 创建一个字典 last，记录每个字符在字符串中的最后出现位置
        last = {c: i for i, c in enumerate(s)}

        ans = []  # 存储每个分区的长度
        start = end = 0  # 当前分区的起始和结束位置

        for i, c in enumerate(s):  # 遍历字符串中的每个字符
            end = max(end, last[c])  # 更新当前分区的结束位置为当前字符最后出现的位置和之前的最大结束位置中的较大值
            if end == i:  # 如果当前字符的结束位置等于当前遍历的位置，说明找到一个完整的分区
                ans.append(end - start + 1)  # 将当前分区的长度添加到结果列表中
                start = i + 1  # 更新下一个分区的起始位置

        return ans  # 返回所有分区的长度


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    s = input().strip()  # 输入字符串

    solution = Solution()
    ans = solution.partitionLabels(s)

    print(" ".join(map(str, ans)))


# 输入输出示例：
# 输入：
# ababcbacadefegdehijhklij
# 输出：
# 9 7 8
#
# 解释：
# 字符串可以划分为：
# "ababcbaca", "defegde", "hijhklij"
# 每个字母最多只会出现在其中一个片段中，
# 所以返回每个片段的长度 [9, 7, 8]。
```

## 动态规划

### 模板

#### 爬楼梯问题

```python

```

#### 背包问题

```python

```

#### 最长递增子序列问题

```python

```

#### 最大子数组和问题

```python

```

#### 最长公共子序列问题

```python

```

### [70. 爬楼梯](https://leetcode.cn/problems/climbing-stairs/description/?envType=study-plan-v2&envId=top-100-liked)

假设你正在爬楼梯。需要 `n` 阶你才能到达楼顶。

每次你可以爬 `1` 或 `2` 个台阶。你有多少种不同的方法可以爬到楼顶呢？

**示例 1：**

```text
输入：n = 2
输出：2
解释：有两种方法可以爬到楼顶。
1. 1 阶 + 1 阶
2. 2 阶
```

斐波那契数列

```python
class Solution:
    def climbStairs(self, n):
        # 特殊情况，当阶梯只有1级时，只有1种方法
        if n == 1:
            return 1

        f = [0] * n  # 创建一个长度为 n 的列表 f 用于存储到达每一阶梯的方式数
        f[0] = 1  # 到达第1阶梯（0级）只有1种方法
        f[1] = 2  # 到达第2阶梯（1级）有2种方法（1级1阶或2级1阶）

        # 从第3阶梯开始，利用动态规划推导每个阶梯的到达方式数
        for i in range(2, n):
            f[i] = f[i - 1] + f[i - 2]  # 到达第i阶梯的方式是到达第i-1阶梯和第i-2阶梯的方式之和

        return f[n - 1]  # 返回到达第n阶梯的方式数


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    n = int(input().strip())  # 输入台阶数

    solution = Solution()
    ans = solution.climbStairs(n)

    print(ans)


# 输入输出示例：
# 输入：
# 2
# 输出：
# 2
#
# 解释：
# 爬到第 2 阶有 2 种方法：
# 1. 1 阶 + 1 阶
# 2. 2 阶
#
# 输入：
# 3
# 输出：
# 3
#
# 解释：
# 爬到第 3 阶有 3 种方法：
# 1. 1 阶 + 1 阶 + 1 阶
# 2. 1 阶 + 2 阶
# 3. 2 阶 + 1 阶
```

滚动数组进行空间复杂度优化

```text
class Solution:
    def climbStairs(self, n):
        if n == 1:
            return 1
        f0, f1 = 1, 2
        for i in range(2, n):
            f0, f1 = f1, f0 + f1
        return f1


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    n = int(input().strip())  # 输入台阶数

    solution = Solution()
    ans = solution.climbStairs(n)

    print(ans)


# 输入输出示例：
# 输入：
# 2
# 输出：
# 2
#
# 解释：
# 爬到第 2 阶有 2 种方法：
# 1. 1 阶 + 1 阶
# 2. 2 阶
#
# 输入：
# 3
# 输出：
# 3
#
# 解释：
# 爬到第 3 阶有 3 种方法：
# 1. 1 阶 + 1 阶 + 1 阶
# 2. 1 阶 + 2 阶
# 3. 2 阶 + 1 阶
```

### [118. 杨辉三角](https://leetcode.cn/problems/pascals-triangle/description/?envType=study-plan-v2&envId=top-100-liked)

给定一个非负整数 *`numRows`，*生成「杨辉三角」的前 _`numRows`_ 行。

在**「杨辉三角」**中，每个数是它左上方和右上方的数的和。

![img](https://pic.leetcode.cn/1626927345-DZmfxB-PascalTriangleAnimated2.gif)

**示例 1:**

```text
输入: numRows = 5
输出: [[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]
```

```python
class Solution:
    def generate(self, numRows):
        # 创建一个二维列表 f，每一行都初始化为 1
        # 每一行的长度是 i + 1，表示第 i 行有 i + 1 个元素
        f = [[1] * (i + 1) for i in range(numRows)]

        # 从第3行开始，计算每个位置的值
        # 由杨辉三角的性质：f[i][j] = f[i-1][j-1] + f[i-1][j]
        for i in range(2, numRows):
            for j in range(1, i):
                f[i][j] = f[i - 1][j - 1] + f[i - 1][j]  # 计算当前位置的值

        return f  # 返回杨辉三角的前 numRows 行


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    numRows = int(input().strip())  # 输入杨辉三角的行数

    solution = Solution()
    ans = solution.generate(numRows)

    # 输出结果
    for row in ans:
        print(" ".join(map(str, row)))


# 输入输出示例：
# 输入：
# 5
# 输出：
# 1
# 1 1
# 1 2 1
# 1 3 3 1
# 1 4 6 4 1
#
# 解释：
# 当 numRows = 5 时，生成前 5 行杨辉三角：
# 第 1 行: [1]
# 第 2 行: [1, 1]
# 第 3 行: [1, 2, 1]
# 第 4 行: [1, 3, 3, 1]
# 第 5 行: [1, 4, 6, 4, 1]
```

### [198. 打家劫舍](https://leetcode.cn/problems/house-robber/description/?envType=study-plan-v2&envId=top-100-liked)

你是一个专业的小偷，计划偷窃沿街的房屋。每间房内都藏有一定的现金，影响你偷窃的唯一制约因素就是相邻的房屋装有相互连通的防盗系统，**如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警**。

给定一个代表每个房屋存放金额的非负整数数组，计算你 **不触动警报装置的情况下** ，一夜之内能够偷窃到的最高金额。

**示例 1：**

```text
输入：[1,2,3,1]
输出：4
解释：偷窃 1 号房屋 (金额 = 1) ，然后偷窃 3 号房屋 (金额 = 3)。
     偷窃到的最高金额 = 1 + 3 = 4 。
```

```python
class Solution:
    def rob(self, nums):
        n = len(nums)  # 获取房子的数量
        if n == 1:  # 如果只有一个房子，直接返回该房子的金额
            return nums[0]

        f = [0] * n  # 创建一个列表 f，用于记录每个房子时可以获得的最大抢劫金额
        f[0] = nums[0]  # 第一个房子只能偷它本身
        # 初始化第二个房子的最大抢劫金额为第一个房子和第二个房子之间的较大值
        f[1] = max(nums[0], nums[1])

        # 从第三个房子开始，计算每个房子的最大抢劫金额
        for i in range(2, n):
            # 如果偷当前房子，f[i] = f[i - 2] + nums[i] （偷当前房子并跳过前一个房子）
            # 否则 f[i] = f[i - 1] （不偷当前房子，继承前一个房子的最大金额）
            f[i] = max(f[i - 2] + nums[i], f[i - 1])

        # 返回最后一个房子时可以获得的最大金额
        return f[n - 1]


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    nums = list(map(int, input().split()))  # 输入每个房屋中的金额

    solution = Solution()
    ans = solution.rob(nums)

    print(ans)


# 输入输出示例：
# 输入：
# 1 2 3 1
# 输出：
# 4
#
# 解释：
# 偷第 1 间房和第 3 间房，金额分别是 1 和 3，
# 总金额 = 1 + 3 = 4。
#
# 输入：
# 2 7 9 3 1
# 输出：
# 12
#
# 解释：
# 偷第 1 间房、第 3 间房和第 5 间房，金额分别是 2、9、1，
# 总金额 = 2 + 9 + 1 = 12。
```

滚动数组优化：

```python
class Solution:
    def rob(self, nums):
        n = len(nums)
        if n == 1:
            return nums[0]
        f0 = nums[0]
        f1 = max(nums[0], nums[1])

        for i in range(2, n):
            # 更新 f0 和 f1，f1 代表当前房子能够抢到的最大金额
            # f0 为前两房子的最大金额，f1 为当前房子的最大抢劫金额
            f0, f1 = f1, max(f0 + nums[i], f1)
            # f0 更新为 f1（即前一个房子的最大金额）
            # f1 更新为 max(f0 + nums[i], f1)，表示要么偷当前房子，要么跳过它

        return f1


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    nums = list(map(int, input().split()))  # 输入每个房屋中的金额

    solution = Solution()
    ans = solution.rob(nums)

    print(ans)


# 输入输出示例：
# 输入：
# 1 2 3 1
# 输出：
# 4
#
# 解释：
# 偷第 1 间房和第 3 间房，金额分别是 1 和 3，
# 总金额 = 1 + 3 = 4。
#
# 输入：
# 2 7 9 3 1
# 输出：
# 12
#
# 解释：
# 偷第 1 间房、第 3 间房和第 5 间房，金额分别是 2、9、1，
# 总金额 = 2 + 9 + 1 = 12。
```

### [279. 完全平方数](https://leetcode.cn/problems/perfect-squares/description/?envType=study-plan-v2&envId=top-100-liked)

给你一个整数 `n` ，返回 _和为 `n` 的完全平方数的最少数量_ 。

**完全平方数** 是一个整数，其值等于另一个整数的平方；换句话说，其值等于一个整数自乘的积。例如，`1`、`4`、`9` 和 `16` 都是完全平方数，而 `3` 和 `11` 不是。

**示例 1：**

```text
输入：n = 12
输出：3
解释：12 = 4 + 4 + 4
```

```python
class Solution:
    def numSquares(self, n):
        # 初始化 f 数组，f[i] 表示数字 i 所需的最小完全平方数个数
        # 初始化为无穷大（float("inf")），表示尚未计算出最小值
        f = [float("inf")] * (n + 1)
        f[0] = 0  # 0 需要 0 个完全平方数

        # 遍历从 1 到 n 的每一个数
        for i in range(1, n + 1):
            j = 1  # 从 1 开始检查每个完全平方数
            # 当 j * j <= i 时，继续循环
            while j * j <= i:
                # 更新 f[i]：使用 min 函数来比较当前 f[i] 和使用 j*j 作为完全平方数后，剩余部分 (i - j*j) 所需的最小完全平方数个数 + 1
                f[i] = min(f[i], f[i - j * j] + 1)
                j += 1  # j 增加，检查下一个完全平方数

        return f[n]  # 返回数字 n 所需的最小完全平方数个数


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    n = int(input().strip())  # 输入整数 n

    solution = Solution()
    ans = solution.numSquares(n)

    print(ans)


# 输入输出示例：
# 输入：
# 12
# 输出：
# 3
#
# 解释：
# 12 = 4 + 4 + 4
# 所以最少需要 3 个完全平方数。
#
# 输入：
# 13
# 输出：
# 2
#
# 解释：
# 13 = 4 + 9
# 所以最少需要 2 个完全平方数。
```

### [322. 零钱兑换](https://leetcode.cn/problems/coin-change/description/?envType=study-plan-v2&envId=top-100-liked)

给你一个整数数组 `coins` ，表示不同面额的硬币；以及一个整数 `amount` ，表示总金额。

计算并返回可以凑成总金额所需的 **最少的硬币个数** 。如果没有任何一种硬币组合能组成总金额，返回 `-1` 。

你可以认为每种硬币的数量是无限的。

**示例 1：**

```text
输入：coins = [1, 2, 5], amount = 11
输出：3
解释：11 = 5 + 5 + 1
```

```python
class Solution:
    def coinChange(self, coins, amount):
        # 初始化 f 数组，f[i] 表示凑成金额 i 所需要的最少硬币数量
        # 初始值设置为无穷大（float("inf")），表示没有方案的情况下无法达到该金额。
        f = [float("inf")] * (amount + 1)
        f[0] = 0  # 凑成金额 0 不需要任何硬币

        # 遍历所有金额从 1 到 amount
        for i in range(1, amount + 1):
            # 对于每个硬币面额 coin，尝试将该硬币加入当前金额 i
            for coin in coins:
                # 如果当前金额 i 能减去硬币面额 coin（即 i - coin >= 0），说明可以使用该硬币
                if i - coin >= 0:
                    # 更新 f[i]，表示选择当前硬币后，f[i] 可能的最小值是使用该硬币后，剩下的金额所需的硬币数加 1。
                    f[i] = min(f[i], f[i - coin] + 1)

        # 如果 f[amount] 仍为无穷大，说明无法用这些硬币组成该金额，返回 -1。
        return f[amount] if f[amount] != float("inf") else -1


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    coins = list(map(int, input().split()))  # 输入硬币面额数组
    amount = int(input().strip())  # 输入目标金额

    solution = Solution()
    ans = solution.coinChange(coins, amount)

    print(ans)


# 输入输出示例：
# 输入：
# 1 2 5
# 11
# 输出：
# 3
#
# 解释：
# 11 = 5 + 5 + 1
# 所以最少需要 3 枚硬币。
#
# 输入：
# 2
# 3
# 输出：
# -1
#
# 解释：
# 只有面额 2 的硬币，无法组成金额 3，所以返回 -1。
```

### [139. 单词拆分](https://leetcode.cn/problems/word-break/?envType=study-plan-v2&envId=top-100-liked)

给你一个字符串 `s` 和一个字符串列表 `wordDict` 作为字典。如果可以利用字典中出现的一个或多个单词拼接出 `s` 则返回 `true`。

**注意：**不要求字典中出现的单词全部都使用，并且字典中的单词可以重复使用。

**示例 1：**

```text
输入: s = "leetcode", wordDict = ["leet", "code"]
输出: true
解释: 返回 true 因为 "leetcode" 可以由 "leet" 和 "code" 拼接成。
```

```python
class Solution:
    def wordBreak(self, s, wordDict):
        n = len(s)
        f = [False] * (n + 1)
        f[0] = True
        word_set = set(wordDict)

        for i in range(1, n + 1):
            for j in range(i):
                # 如果 s[0:j] 可以拆分（即 f[j] 为 True），且 s[j:i] 是字典中的单词，则 s[0:i] 也可以拆分
                if f[j] and s[j:i] in word_set:
                    f[i] = True
                    break

        return f[n]


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    s = input().strip()  # 输入字符串
    wordDict = input().split()  # 输入单词字典，单词之间用空格分隔

    solution = Solution()
    ans = solution.wordBreak(s, wordDict)

    print("True" if ans else "False")


# 输入输出示例：
# 输入：
# leetcode
# leet code
# 输出：
# True
#
# 解释：
# 字符串 "leetcode" 可以拆分成 "leet" 和 "code"，
# 并且这两个单词都在字典中，所以输出 True。
#
# 输入：
# applepenapple
# apple pen
# 输出：
# True
#
# 解释：
# 字符串 "applepenapple" 可以拆分成 "apple" + "pen" + "apple"，
# 都在字典中，所以输出 True。
#
# 输入：
# catsandog
# cats dog sand and cat
# 输出：
# False
#
# 解释：
# 字符串 "catsandog" 无法完全拆分成字典中的单词，所以输出 False。
```

### [300. 最长递增子序列](https://leetcode.cn/problems/longest-increasing-subsequence/description/?envType=study-plan-v2&envId=top-100-liked)

给你一个整数数组 `nums` ，找到其中最长严格递增子序列的长度。

**子序列** 是由数组派生而来的序列，删除（或不删除）数组中的元素而不改变其余元素的顺序。例如，`[3,6,2,7]` 是数组 `[0,3,1,6,2,2,7]` 的子序列。

**示例 1：**

```text
输入：nums = [10,9,2,5,3,7,101,18]
输出：4
解释：最长递增子序列是 [2,3,7,101]，因此长度为 4 。
```

```python
class Solution:
    def lengthOfLIS(self, nums):
        n = len(nums)  # 获取数组 nums 的长度
        f = [1] * n  # 创建一个数组 f，其中 f[i] 表示以 nums[i] 结尾的最长递增子序列的长度，初始值为 1

        # 遍历数组 nums 中的每个元素
        for i in range(1, n):
            # 遍历当前元素 nums[i] 之前的所有元素
            for j in range(i):
                # 如果 nums[i] 大于 nums[j]，说明可以将 nums[i] 加入到以 nums[j] 结尾的递增子序列中
                if nums[i] > nums[j]:
                    # 更新 f[i]，选择更大的递增子序列长度
                    f[i] = max(f[i], f[j] + 1)

        return max(f)  # 返回数组 f 中的最大值，即最长递增子序列的长度


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    nums = list(map(int, input().split()))  # 输入整数数组

    solution = Solution()
    ans = solution.lengthOfLIS(nums)

    print(ans)


# 输入输出示例：
# 输入：
# 10 9 2 5 3 7 101 18
# 输出：
# 4
#
# 解释：
# 最长递增子序列之一是 [2, 3, 7, 101]
# 所以长度为 4。
#
# 输入：
# 0 1 0 3 2 3
# 输出：
# 4
#
# 解释：
# 最长递增子序列之一是 [0, 1, 2, 3]
# 所以长度为 4。
```

### [152. 乘积最大子数组](https://leetcode.cn/problems/maximum-product-subarray/description/?envType=study-plan-v2&envId=top-100-liked)

给你一个整数数组 `nums` ，请你找出数组中乘积最大的非空连续 子数组（该子数组中至少包含一个数字），并返回该子数组所对应的乘积。

测试用例的答案是一个 **32-位** 整数。

**请注意**，一个只包含一个元素的数组的乘积是这个元素的值。

**示例 1:**

```text
输入: nums = [2,3,-2,4]
输出: 6
解释: 子数组 [2,3] 有最大乘积 6。
```

```python
class Solution:
    def maxProduct(self, nums):
        n = len(nums)  # 获取数组 nums 的长度
        f_max = [0] * n  # f_max[i] 存储以 nums[i] 结尾的最大乘积
        f_min = [0] * n  # f_min[i] 存储以 nums[i] 结尾的最小乘积
        f_max[0] = f_min[0] = nums[0]  # 初始化第一个元素的最大和最小乘积为 nums[0]

        # 从第二个元素开始遍历
        for i in range(1, n):
            x = nums[i]
            # 更新 f_max[i]，考虑三种情况：
            # 1. 当前元素本身 x
            # 2. 当前元素 x 乘以之前的最大乘积 f_max[i - 1]
            # 3. 当前元素 x 乘以之前的最小乘积 f_min[i - 1] （因为负数乘以负数可能得到正数）
            f_max[i] = max(x, f_max[i - 1] * x, f_min[i - 1] * x)

            # 更新 f_min[i]，同理，考虑三种情况：
            f_min[i] = min(x, f_max[i - 1] * x, f_min[i - 1] * x)

        # 返回最大乘积，最大乘积可能出现在 f_max 中的任意一个位置
        return max(f_max)


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    nums = list(map(int, input().split()))  # 输入整数数组

    solution = Solution()
    ans = solution.maxProduct(nums)

    print(ans)


# 输入输出示例：
# 输入：
# 2 3 -2 4
# 输出：
# 6
#
# 解释：
# 子数组 [2, 3] 的乘积最大，为 6。
#
# 输入：
# -2 0 -1
# 输出：
# 0
#
# 解释：
# 最大乘积为 0，对应子数组 [0]。
```

### [416. 分割等和子集](https://leetcode.cn/problems/partition-equal-subset-sum/description/?envType=study-plan-v2&envId=top-100-liked)

给你一个 **只包含正整数** 的 **非空** 数组 `nums` 。请你判断是否可以将这个数组分割成两个子集，使得两个子集的元素和相等。

**示例 1：**

```text
输入：nums = [1,5,11,5]
输出：true
解释：数组可以分割成 [1, 5, 5] 和 [11] 。
```

```python
class Solution:
    def canPartition(self, nums):
        s = sum(nums)  # 计算数组所有元素的和
        # 如果和是奇数，无法分成两个相等的部分，直接返回 False
        if s % 2 != 0:
            return False

        target = s // 2  # 将目标值设为数组和的一半
        f = [False] * (target + 1)  # 创建一个布尔数组 f，表示能否凑成从 0 到 target 的每个值
        f[0] = True  # f[0] 为 True，表示可以通过不选择任何元素凑成和为 0

        # 遍历每个数字
        for x in nums:
            # 从后往前更新 f 数组，确保每个数只能用一次
            for j in range(target, x - 1, -1):
                # |= 运算符将右边的值与左边的值进行按位或运算
                # a |= b 等同于 a = a | b
                # 如果 f[j - x] 为 True，那么就设置 f[j] 为 True
                f[j] |= f[j - x]

        return f[target]  # 如果 f[target] 为 True，说明可以分成两部分，返回 True，否则返回 False


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    nums = list(map(int, input().split()))  # 输入整数数组

    solution = Solution()
    ans = solution.canPartition(nums)

    print("True" if ans else "False")


# 输入输出示例：
# 输入：
# 1 5 11 5
# 输出：
# True
#
# 解释：
# 数组可以分割成两个和相等的子集：
# [1, 5, 5] 和 [11]
# 它们的和都为 11，所以输出 True。
#
# 输入：
# 1 2 3 5
# 输出：
# False
#
# 解释：
# 数组不能分割成两个和相等的子集，所以输出 False。
```

### [32. 最长有效括号](https://leetcode.cn/problems/longest-valid-parentheses/description/?envType=study-plan-v2&envId=top-100-liked)

给你一个只包含 `'('` 和 `')'` 的字符串，找出最长有效（格式正确且连续）括号 子串 的长度。

左右括号匹配，即每个左括号都有对应的右括号将其闭合的字符串是格式正确的，比如 `"(()())"`。

**示例 1：**

```text
输入：s = "(()"
输出：2
解释：最长有效括号子串是 "()"
```

- 维护一个栈，栈底放一个哨兵 -1，表示“最后一个无法匹配的位置”。

- 遍历字符串：

  - 遇到 ‘(’：把它的下标压栈；

  - 遇到 ‘)’：弹栈（尝试用一个左括号来匹配）。

  - 若弹栈后栈空，说明这一位置的 ‘)’ 没法匹配，把它当作新的“无法匹配位置”，把当前下标入栈作为新的哨兵；

  - 若栈不空，说明匹配成功，以当前下标为右端点的有效长度 = i - 栈顶下标（栈顶此时是“上一个无法匹配位置”的下标），更新答案。

```python
class Solution:
    def longestValidParentheses(self, s):
        # 初始化栈，-1 是一个哨兵，表示上一个无法匹配的位置
        stack = [-1]
        ans = 0

        # 遍历字符串中的每个字符，i 是字符的索引，ch 是字符本身
        for i, ch in enumerate(s):
            if ch == "(":
                stack.append(i)  # 将当前字符的下标压入栈中
            else:  # 如果当前字符是右括号
                stack.pop()  # 弹出栈中的一个左括号（匹配当前的右括号）

                if not stack:  # 如果栈为空，表示当前的右括号无法匹配一个左括号
                    stack.append(i)  # 将当前右括号的索引压入栈中，作为新的起点
                else:
                    # 计算当前有效括号的长度，栈顶元素是当前左括号的下标，栈中剩下的是上一个无法匹配的括号的下标
                    ans = max(ans, i - stack[-1])  # 更新最长有效括号的长度

        return ans  # 返回最长有效括号的长度


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    s = input().strip()  # 输入字符串

    solution = Solution()
    ans = solution.longestValidParentheses(s)

    print(ans)


# 输入输出示例：
# 输入：
# "(()())"
# 输出：
# 6
#
# 解释：
# 最长有效括号是整个字符串 "(()())"。
#
# 输入：
# ")()())"
# 输出：
# 4
#
# 解释：
# 最长有效括号是子字符串 "()()"
```

## 多维动态规划

### [62. 不同路径](https://leetcode.cn/problems/unique-paths/description/?envType=study-plan-v2&envId=top-100-liked)

一个机器人位于一个 `m x n` 网格的左上角 （起始点在下图中标记为 “Start” ）。

机器人每次只能向下或者向右移动一步。机器人试图达到网格的右下角（在下图中标记为 “Finish” ）。

问总共有多少条不同的路径？

**示例 1：**

![img](https://pic.leetcode.cn/1697422740-adxmsI-image.png)

```text
输入：m = 3, n = 7
输出：28
```

设 dp[i] [j] 表示从起点 (0, 0) 到达格子 (i, j) 的不同路径数。

初始条件：

dp[0] [0] = 1，因为起点只有一种路径（即不动）。

对于第一行 dp[0] [j] = 1，因为机器人只能一直向右走。

对于第一列 dp[i] [0] = 1，因为机器人只能一直向下走。

```python
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        # 初始化一个 m x n 的二维数组，每个位置的值都为 1
        # 代表从每个位置到达边界的路径数为 1
        f = [[1] * n for _ in range(m)]

        # 从 (1, 1) 开始遍历数组
        for i in range(1, m):
            for j in range(1, n):
                # 每个位置的路径数等于它上面和左边两个位置的路径数之和
                f[i][j] = f[i - 1][j] + f[i][j - 1]

        # 返回右下角的路径数，即从 (0, 0) 到 (m-1, n-1) 的不同路径数
        return f[m - 1][n - 1]
```

### [64. 最小路径和](https://leetcode.cn/problems/minimum-path-sum/description/?envType=study-plan-v2&envId=top-100-liked)

给定一个包含非负整数的 `*m* x *n*` 网格 `grid` ，请找出一条从左上角到右下角的路径，使得路径上的数字总和为最小。

**说明：**每次只能向下或者向右移动一步。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2020/11/05/minpath.jpg)

```text
输入：grid = [[1,3,1],[1,5,1],[4,2,1]]
输出：7
解释：因为路径 1→3→1→1→1 的总和最小。
```

```python
class Solution:
    def minPathSum(self, grid):
        m = len(grid)
        n = len(grid[0])

        # f[i][j] 表示从左上角到 (i, j) 的最小路径和
        f = [[0] * n for _ in range(m)]

        # 初始化起点
        f[0][0] = grid[0][0]

        # 初始化第一列
        for i in range(1, m):
            f[i][0] = f[i - 1][0] + grid[i][0]

        # 初始化第一行
        for j in range(1, n):
            f[0][j] = f[0][j - 1] + grid[0][j]

        # 状态转移
        for i in range(1, m):
            for j in range(1, n):
                f[i][j] = min(f[i - 1][j], f[i][j - 1]) + grid[i][j]

        return f[m - 1][n - 1]


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    # 输入行数和列数
    m, n = map(int, input().split())

    # 输入网格
    grid = []
    for _ in range(m):
        grid.append(list(map(int, input().split())))

    solution = Solution()
    ans = solution.minPathSum(grid)

    print(ans)


# 输入示例：
# 3 3
# 1 3 1
# 1 5 1
# 4 2 1
#
# 输出：
# 7
```

### [5. 最长回文子串](https://leetcode.cn/problems/longest-palindromic-substring/?envType=study-plan-v2&envId=top-100-liked)

给你一个字符串 `s`，找到 `s` 中最长的 回文 子串。

**示例 1：**

```text
输入：s = "babad"
输出："bab"
解释："aba" 同样是符合题意的答案。
```

```python
class Solution:
    def longestPalindrome(self, s):
        n = len(s)
        ans_left = ans_right = 0

        # 奇回文串
        for i in range(n):
            l = r = i
            while l >= 0 and r < n and s[l] == s[r]:
                l -= 1
                r += 1
            # 循环结束后，s[l+1] 到 s[r-1] 是回文串
            if r - l - 1 > ans_right - ans_left:
                ans_left, ans_right = l + 1, r  # 左闭右开区间

        # 偶回文串
        for i in range(n - 1):
            l, r = i, i + 1
            while l >= 0 and r < n and s[l] == s[r]:
                l -= 1
                r += 1
            if r - l - 1 > ans_right - ans_left:
                ans_left, ans_right = l + 1, r  # 左闭右开区间

        return s[ans_left: ans_right]


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    s = input().strip()  # 输入字符串

    solution = Solution()
    ans = solution.longestPalindrome(s)

    print(ans)


# 输入输出示例：
# 输入：
# babad
# 输出：
# bab
#
# 解释：
# "bab" 或 "aba" 是 "babad" 的有效回文子串。
#
# 输入：
# cbbd
# 输出：
# bb
#
# 解释：
# "bb" 是 "cbbd" 的有效回文子串。
```

### [1143. 最长公共子序列](https://leetcode.cn/problems/longest-common-subsequence/description/?envType=study-plan-v2&envId=top-100-liked)

给定两个字符串 `text1` 和 `text2`，返回这两个字符串的最长 **公共子序列** 的长度。如果不存在 **公共子序列** ，返回 `0` 。

一个字符串的 **子序列** 是指这样一个新的字符串：它是由原字符串在不改变字符的相对顺序的情况下删除某些字符（也可以不删除任何字符）后组成的新字符串。

- 例如，`"ace"` 是 `"abcde"` 的子序列，但 `"aec"` 不是 `"abcde"` 的子序列。

两个字符串的 **公共子序列** 是这两个字符串所共同拥有的子序列。

**示例 1：**

```text
输入：text1 = "abcde", text2 = "ace"
输出：3
解释：最长公共子序列是 "ace" ，它的长度为 3 。
```

f[i][j] 表示 test1[0:i] 和 test2[0:j] 的最长公共子序列的长度

```python
class Solution:
    def longestCommonSubsequence(self, text1, text2):
        m, n = len(text1), len(text2)
        f = [[0] * (n + 1) for _ in range(m + 1)]

        # 从第 1 行第 1 列开始遍历整个二维数组
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                # 如果 text1 的第 i-1 个字符与 text2 的第 j-1 个字符相等
                if text1[i - 1] == text2[j - 1]:
                    # 当前的最长公共子序列长度为前一个字符的子问题加 1
                    f[i][j] = f[i - 1][j - 1] + 1
                else:
                    # 如果不相等，取上方或左方中较大的值
                    f[i][j] = max(f[i - 1][j], f[i][j - 1])

        return f[m][n]


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    text1 = input().strip()  # 输入文本1
    text2 = input().strip()  # 输入文本2

    solution = Solution()
    ans = solution.longestCommonSubsequence(text1, text2)

    print(ans)


# 输入输出示例：
# 输入：
# abcde
# ace
# 输出：
# 3
#
# 解释：
# 最长公共子序列是 "ace" ，所以返回 3。
#
# 输入：
# abc
# abc
# 输出：
# 3
#
# 解释：
# 两个字符串完全相同，最长公共子序列就是整个字符串，所以返回 3。
```

### [72. 编辑距离](https://leetcode.cn/problems/edit-distance/description/?envType=study-plan-v2&envId=top-100-liked)

给你两个单词 `word1` 和 `word2`， _请返回将 `word1` 转换成 `word2` 所使用的最少操作数_ 。

你可以对一个单词进行如下三种操作：

- 插入一个字符
- 删除一个字符
- 替换一个字符

**示例 1：**

```text
输入：word1 = "horse", word2 = "ros"
输出：3
解释：
horse -> rorse (将 'h' 替换为 'r')
rorse -> rose (删除 'r')
rose -> ros (删除 'e')
```

设 dp[i] [j] 表示把 word1 的前 i 个字符变成 word2 的前 j 个字符所需的最少操作数。

状态转移：

若 word1[i-1] == word2[j-1]：dp[i] [j] = dp[i-1] [j-1]（最后一个字符相同，无需操作）
否则取三种操作的最小值 + 1：

- 插入：dp[i] [j-1] + 1（向 word1 末尾插入与 word2[j-1] 相同的字符）
- 删除：dp[i-1] [j] + 1（删掉 word1[i-1]）
- 替换：dp[i-1] [j-1] + 1（把 word1[i-1] 替换成 word2[j-1]）

边界：

dp[0] [j] = j（空串到长度 j 需要 j 次插入）
dp[i] [0] = i（长度 i 到空串需要 i 次删除）

![2025-12-26_151135](https://raw.githubusercontent.com/1910853272/image/master/img/202512261512802.png)

```python
class Solution:
    def minDistance(self, word1, word2):
        m, n = len(word1), len(word2)  # 获取 word1 和 word2 的长度
        # 创建一个 (m+1) * (n+1) 的 dp 数组，dp[i][j] 表示 word1[0...i-1] 和 word2[0...j-1] 的最小编辑距离
        dp = [[0] * (n + 1) for _ in range(m + 1)]

        # 初始化 dp 数组的第一列：dp[i][0] 表示 word1[0...i-1] 和空字符串的最小编辑距离（删除操作）
        for i in range(m + 1):
            dp[i][0] = i

        # 初始化 dp 数组的第一行：dp[0][j] 表示空字符串和 word2[0...j-1] 的最小编辑距离（插入操作）
        for j in range(n + 1):
            dp[0][j] = j

        # 填充 dp 数组，考虑从左上角到右下角的状态转移
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                # 如果当前字符相等，则最小编辑距离与前一个状态相同
                if word1[i - 1] == word2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1]
                else:
                    # 否则，考虑三种操作：插入、删除、替换，取最小值
                    dp[i][j] = min(
                        dp[i][j - 1] + 1,  # 插入操作：将 word2[j-1] 插入到 word1 中
                        dp[i - 1][j] + 1,  # 删除操作：删除 word1[i-1]
                        dp[i - 1][j - 1] + 1,  # 替换操作：替换 word1[i-1] 为 word2[j-1]
                    )

        return dp[m][n]  # 返回 dp[m][n]，即 word1 和 word2 之间的最小编辑距离


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    word1 = input().strip()  # 输入第一个字符串
    word2 = input().strip()  # 输入第二个字符串

    solution = Solution()
    ans = solution.minDistance(word1, word2)

    print(ans)


# 输入输出示例：
# 输入：
# horse
# ros
# 输出：
# 3
#
# 解释：
# 需要编辑 3 次操作：horse -> rorse (替换 'h' 为 'r') -> rose (删除 'h') -> ros (删除 'e')
#
# 输入：
# intention
# execution
# 输出：
# 5
#
# 解释：
# 需要编辑 5 次操作：intention -> inention (删除 't') -> enention (替换 'i' 为 'e') -> exention (替换 'n' 为 'x') -> exection (替换 'e' 为 'c') -> execution (替换 'n' 为 'u')
```

## 技巧

### [136. 只出现一次的数字](https://leetcode.cn/problems/single-number/?envType=study-plan-v2&envId=top-100-liked) [位运算]

给你一个 **非空** 整数数组 `nums` ，除了某个元素只出现一次以外，其余每个元素均出现两次。找出那个只出现了一次的元素。

你必须设计并实现线性时间复杂度的算法来解决此问题，且该算法只使用常量额外空间。

**示例 1 ：**

**输入：**nums = [2,2,1]

**输出：**1

```python
from functools import reduce

class Solution:
    def singleNumber(self, nums):
        # 使用 reduce 函数对列表中的所有元素进行逐个操作，运算符是异或 (^)
        # 异或操作的特点是：相同的数字异或结果为 0，不同的数字异或结果为 1
        # lambda匿名函数接收两个参数x和y
        return reduce(lambda x, y: x ^ y, nums)


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    nums = list(map(int, input().split()))  # 输入整数列表

    solution = Solution()
    ans = solution.singleNumber(nums)

    print(ans)


# 输入输出示例：
# 输入：
# 4 1 2 1 2
# 输出：
# 4
#
# 解释：
# 由于 1 和 2 都出现了两次，4 是唯一没有重复的数字，所以输出 4。
```

### [169. 多数元素](https://leetcode.cn/problems/majority-element/description/?envType=study-plan-v2&envId=top-100-liked) [摩尔投票算法]

给定一个大小为 `n` 的数组 `nums` ，返回其中的多数元素。多数元素是指在数组中出现次数 **大于** `⌊ n/2 ⌋` 的元素。

你可以假设数组是非空的，并且给定的数组总是存在多数元素。

**示例 1：**

```text
输入：nums = [3,2,3]
输出：3
```

```python
class Solution:
    def majorityElement(self, nums):
        votes = 0  # 初始化票数为 0

        for num in nums:  # 遍历数组中的每个数字
            # 如果票数为 0，说明当前没有有效的候选数字，更新候选数字为当前数字
            if votes == 0:
                x = num
            # 如果当前数字与候选数字相同，票数加 1；否则，票数减 1
            votes += 1 if num == x else -1

        return x  # 返回最后的候选数字 x，它即为数组中的多数元素

# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    nums = list(map(int, input().split()))  # 输入整数列表

    solution = Solution()
    ans = solution.majorityElement(nums)

    print(ans)


# 输入输出示例：
# 输入：
# 3 2 3
# 输出：
# 3
#
# 解释：
# 数字 3 出现了 2 次，是数组中的多数元素。
#
# 输入：
# 2 2 1 1 1 2 2
# 输出：
# 2
#
# 解释：
# 数字 2 出现了 4 次，是数组中的多数元素。
```

### [75. 颜色分类](https://leetcode.cn/problems/sort-colors/description/?envType=study-plan-v2&envId=top-100-liked) [荷兰国旗问题]

给定一个包含红色、白色和蓝色、共 `n` 个元素的数组 `nums` ，**[原地](https://baike.baidu.com/item/原地算法)** 对它们进行排序，使得相同颜色的元素相邻，并按照红色、白色、蓝色顺序排列。

我们使用整数 `0`、 `1` 和 `2` 分别表示红色、白色和蓝色。

必须在不使用库内置的 sort 函数的情况下解决这个问题。

**示例 1：**

```text
输入：nums = [2,0,2,1,1,0]
输出：[0,0,1,1,2,2]
```

**左侧区域** `[0, low)`：数组中的 `0` 元素区。

**中间区域** `[low, mid)`：数组中的 `1` 元素区。

**右侧区域** `[high, n)`：数组中的 `2` 元素区。

排序的基本步骤是：

- 遇到 `0` 时，将其放到左侧区，并将 `low` 和 `mid` 向右移动。
- 遇到 `1` 时，`mid` 向右移动，保持在中间区不变。
- 遇到 `2` 时，将其放到右侧区，并将 `high` 向左移动。

![2025-12-26_203905](https://raw.githubusercontent.com/1910853272/image/master/img/202512262039897.png)

```python
class Solution:
    def sortColors(self, nums):
        low, mid, high = 0, 0, len(nums) - 1  # 初始化三个指针：low 指向数组开始，mid 指向当前处理的元素，high 指向数组结尾

        # 遍历数组，直到 mid 超过 high
        while mid <= high:
            # 如果 nums[mid] 是 0，交换 nums[low] 和 nums[mid]，然后移动 low 和 mid
            if nums[mid] == 0:
                nums[low], nums[mid] = nums[mid], nums[low]  # 交换 0 到 low 的位置
                low += 1  # low 指针向右移动
                mid += 1  # mid 指针向右移动
            # 如果 nums[mid] 是 1，mid 只向右移动
            elif nums[mid] == 1:
                mid += 1  # mid 只向右移动
            # 如果 nums[mid] 是 2，交换 nums[mid] 和 nums[high]，然后移动 high
            else:
                nums[mid], nums[high] = nums[high], nums[mid]  # 交换 2 到 high 的位置
                high -= 1  # high 指针向左移动

        return nums  # 返回排序后的数组


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    nums = list(map(int, input().split()))  # 输入整数列表

    solution = Solution()
    solution.sortColors(nums)

    print(nums)


# 输入输出示例：
# 输入：
# 2 0 2 1 1 0
# 输出：
# 0 0 1 1 2 2
#
# 解释：
# 将输入的数组按照颜色顺序排序后输出。即将 0 排在最前面，1 排在中间，2 排在最后面。
#
# 输入：
# 2 0 1
# 输出：
# 0 1 2
#
# 解释：
# 将输入的数组按照颜色顺序排序后输出。
```

### [31. 下一个排列](https://leetcode.cn/problems/next-permutation/?envType=study-plan-v2&envId=top-100-liked) [字典序算法]

整数数组的一个 **排列** 就是将其所有成员以序列或线性顺序排列。

- 例如，`arr = [1,2,3]` ，以下这些都可以视作 `arr` 的排列：`[1,2,3]`、`[1,3,2]`、`[3,1,2]`、`[2,3,1]` 。

整数数组的 **下一个排列** 是指其整数的下一个字典序更大的排列。更正式地，如果数组的所有排列根据其字典顺序从小到大排列在一个容器中，那么数组的 **下一个排列** 就是在这个有序容器中排在它后面的那个排列。如果不存在下一个更大的排列，那么这个数组必须重排为字典序最小的排列（即，其元素按升序排列）。

- 例如，`arr = [1,2,3]` 的下一个排列是 `[1,3,2]` 。
- 类似地，`arr = [2,3,1]` 的下一个排列是 `[3,1,2]` 。
- 而 `arr = [3,2,1]` 的下一个排列是 `[1,2,3]` ，因为 `[3,2,1]` 不存在一个字典序更大的排列。

给你一个整数数组 `nums` ，找出 `nums` 的下一个排列。

必须**[ 原地 ](https://baike.baidu.com/item/原地算法)**修改，只允许使用额外常数空间。

**示例 1：**

```text
输入：nums = [1,2,3]
输出：[1,3,2]
```

```python
class Solution:
    def nextPermutation(self, nums):
        n = len(nums)

        # 1. 找到第一个下降点 i，即找到 nums[i] < nums[i + 1] 的地方
        i = n - 2  # 从倒数第二个元素开始向前扫描
        while i >= 0 and nums[i] >= nums[i + 1]:
            i -= 1  # 如果 nums[i] >= nums[i + 1]，继续往前寻找下降点

        # 如果 i >= 0，说明找到了下降点，接下来需要处理交换
        if i >= 0:
            # 2. 从右侧找第一个大于 nums[i] 的元素 j
            j = n - 1  # 从数组的最后一个元素开始
            while nums[j] <= nums[i]:
                j -= 1  # 找到第一个大于 nums[i] 的元素

            # 交换 nums[i] 和 nums[j]
            nums[i], nums[j] = nums[j], nums[i]

        # 3. 反转后缀 [i + 1, n - 1]，将剩下的部分变为升序排列
        left, right = i + 1, n - 1  # 初始化左右指针，反转后缀部分
        while left < right:
            nums[left], nums[right] = nums[right], nums[left]  # 交换
            left += 1  # 左指针向右移动
            right -= 1  # 右指针向左移动


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    nums = list(map(int, input().split()))  # 输入整数列表

    solution = Solution()
    solution.nextPermutation(nums)

    print(nums)


# 输入输出示例：
# 输入：
# 1 2 3
# 输出：
# 1 3 2
#
# 解释：
# 输入的排列是 1 2 3，下一排列是 1 3 2。
#
# 输入：
# 3 2 1
# 输出：
# 1 2 3
#
# 解释：
# 输入的排列是 3 2 1，下一排列是 1 2 3，所有排列已经生成过，所以返回第一个排列。
```

### [287. 寻找重复数](https://leetcode.cn/problems/find-the-duplicate-number/description/?envType=study-plan-v2&envId=top-100-liked)

给定一个包含 `n + 1` 个整数的数组 `nums` ，其数字都在 `[1, n]` 范围内（包括 `1` 和 `n`），可知至少存在一个重复的整数。

假设 `nums` 只有 **一个重复的整数** ，返回 **这个重复的数** 。

你设计的解决方案必须 **不修改** 数组 `nums` 且只用常量级 `O(1)` 的额外空间。

**示例 1：**

```text
输入：nums = [1,3,4,2,2]
输出：2
```

```python
class Solution:
    def findDuplicate(self, nums):
        slow = fast = 0  # 初始化慢指针和快指针，指向数组的第一个元素

        # 使用快慢指针法找到循环的相交点
        while True:
            slow = nums[slow]  # 慢指针每次走一步
            fast = nums[nums[fast]]  # 快指针每次走两步
            if slow == fast:  # 如果快慢指针相遇，说明存在循环
                break

        # 找到循环的起始点（即重复的数字）
        head = 0  # 初始化头指针
        while head != slow:
            head = nums[head]  # 头指针走一步
            slow = nums[slow]  # 慢指针走一步

        return slow  # 返回重复的数字，即循环的起始点


# ACM 模式：自行处理输入输出
if __name__ == "__main__":
    nums = list(map(int, input().split()))  # 输入整数列表

    solution = Solution()
    ans = solution.findDuplicate(nums)

    print(ans)


# 输入输出示例：
# 输入：
# 1 3 4 2 2
# 输出：
# 2
#
# 解释：
# 在这个例子中，2 是重复的数字，所以输出 2。
#
# 输入：
# 3 1 3 4 2
# 输出：
# 3
#
# 解释：
# 在这个例子中，3 是重复的数字，所以输出 3。
```
