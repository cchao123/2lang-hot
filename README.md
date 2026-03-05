# 2lang-hot

[English](./README_EN.md) | 中文

一个 VS Code 扩展，在侧边栏显示国内各大平台的热榜内容，让你在写代码的同时不错过热点资讯。

## 支持平台

- **微信读书** - 热门书籍推荐
- **Bilibili** - 热门视频
- **36氪** - 科技财经资讯
- **微博** - 热搜话题
- **百度** - 热搜榜单
- **今日头条** - 热点新闻

## 功能特点

- 侧边栏 Tree View 展示各平台热榜
- 点击条目直接在 VS Code 内预览或打开浏览器
- 支持单独刷新各平台数据
- 可自定义启用/禁用各平台视图

## 安装

在 VS Code 扩展市场搜索 `2lang-hot` 安装。

## 配置

在 VS Code 设置中可以配置以下选项：

| 设置项 | 说明 | 默认值 |
|--------|------|--------|
| `2lang-hot.enableWeixin` | 显示微信读书热榜 | `true` |
| `2lang-hot.enableBilibili` | 显示 Bilibili 热榜 | `true` |
| `2lang-hot.enable36kr` | 显示 36氪 热榜 | `true` |
| `2lang-hot.enableWeibo` | 显示微博热搜 | `true` |
| `2lang-hot.enableBaidu` | 显示百度热搜 | `true` |
| `2lang-hot.enableToutiao` | 显示今日头条热榜 | `true` |

## 使用方法

1. 安装扩展后，点击侧边栏的 2lang 图标
2. 展开各平台查看热榜内容
3. 点击条目查看详情
4. 点击刷新按钮更新数据

## 命令

- `2lang-hot: 刷新微信热榜` - 刷新微信读书数据
- `2lang-hot: 刷新Bilibili热榜` - 刷新 Bilibili 数据
- `2lang-hot: 刷新36氪热榜` - 刷新 36氪 数据
- `2lang-hot: 刷新微博热搜` - 刷新微博数据
- `2lang-hot: 刷新百度热搜` - 刷新百度数据
- `2lang-hot: 刷新今日头条热榜` - 刷新今日头条数据
- `2lang-hot: 渠道选择设置` - 打开渠道配置
- `2lang-hot: 打开插件设置` - 打开扩展设置
- `2lang-hot: 查看使用文档` - 查看使用说明

## License

MIT
