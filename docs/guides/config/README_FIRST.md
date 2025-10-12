# 📖 配置文档使用说明

> 从这里开始了解 HL8 SAAS 平台的配置管理

---

## 🎯 你在哪里？

**当前位置**：`docs/guides/config/`

这是 HL8 SAAS 平台**配置管理**的完整文档目录。

---

## 🚀 快速开始

### 3秒钟决定读什么

**我是新用户** → [CONFIG_GETTING_STARTED.md](./CONFIG_GETTING_STARTED.md) ⚡

**我要全面了解** → [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md) 📘

**我要查找某个信息** → [README.md](./README.md) 📖

**我关心配置安全** → [CONFIG_SECURITY_ANALYSIS.md](./CONFIG_SECURITY_ANALYSIS.md) 🔒

**我搞不清楚缓存** → [IMPORTANT_CACHE_CLARIFICATION.md](./IMPORTANT_CACHE_CLARIFICATION.md) 🚨

---

## 📚 所有文档

### 📁 本目录包含16份配置文档

#### 🎯 入门和使用

- **[README.md](./README.md)** - 文档索引（你也可以从这里开始）
- **[CONFIG_GETTING_STARTED.md](./CONFIG_GETTING_STARTED.md)** - 5分钟快速入门
- **[CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md)** - 完整使用指南

#### 🏗️ 架构和设计

- **[CONFIG_ARCHITECTURE.md](./CONFIG_ARCHITECTURE.md)** - 架构说明
- **[CONFIG_QUICK_REFERENCE.md](./CONFIG_QUICK_REFERENCE.md)** - 快速参考
- **[CONFIG_VISUAL_GUIDE.md](./CONFIG_VISUAL_GUIDE.md)** - 可视化指南

#### ⚠️ 缓存澄清（重要！）

- **[IMPORTANT_CACHE_CLARIFICATION.md](./IMPORTANT_CACHE_CLARIFICATION.md)** - 必读！
- **[CONFIG_TWO_CACHES.md](./CONFIG_TWO_CACHES.md)** - 两种缓存对比
- **[CONFIG_CACHE_EXPLAINED.md](./CONFIG_CACHE_EXPLAINED.md)** - 缓存机制详解

#### 🔒 安全指南

- **[CONFIG_SECURITY_ANALYSIS.md](./CONFIG_SECURITY_ANALYSIS.md)** - 安全性分析
- **[CONFIG_ENV_VS_FILE.md](./CONFIG_ENV_VS_FILE.md)** - 环境变量vs配置文件

#### 📝 更新和总结

- **[CONFIG_DOCS_SUMMARY.md](./CONFIG_DOCS_SUMMARY.md)** - 文档创建总结
- **[DOCS_REORGANIZATION.md](./DOCS_REORGANIZATION.md)** - 文档重组说明
- **[MOVED_TO_GUIDES.md](./MOVED_TO_GUIDES.md)** - 移动说明

---

## 🎓 推荐阅读路径

### 新用户（30分钟）

```
CONFIG_GETTING_STARTED.md (5分钟)
  ↓
CONFIGURATION_GUIDE.md (20分钟)
  ↓  
README.md (5分钟，了解其他文档)
```

### 关心安全（20分钟）

```
CONFIG_SECURITY_ANALYSIS.md (15分钟)
  ↓
CONFIG_ENV_VS_FILE.md (5分钟)
```

### 理解架构（1小时）

```
CONFIG_ARCHITECTURE.md (30分钟)
  ↓
CONFIG_VISUAL_GUIDE.md (15分钟)
  ↓
CONFIG_QUICK_REFERENCE.md (15分钟)
```

---

## ⚠️ 必读警告

**在开始使用配置前，请务必了解**：

1. 🚨 [两种独立的缓存](./IMPORTANT_CACHE_CLARIFICATION.md)
   - libs/config 的配置缓存（自动、透明）
   - libs/caching 的业务数据缓存（手动调用）
   - **两者完全独立，不要混淆！**

2. 🔒 [配置安全性](./CONFIG_SECURITY_ANALYSIS.md)
   - 环境变量是安全的
   - 如何加固配置安全
   - 最佳实践建议

---

## 📖 完整索引

查看 **[README.md](./README.md)** 获取：

- 所有文档的详细说明
- 场景化阅读推荐
- 快速查找功能

---

## 🎯 常见需求快速跳转

| 我想... | 查看 |
|---------|------|
| 快速上手 | [CONFIG_GETTING_STARTED.md](./CONFIG_GETTING_STARTED.md) |
| 完整学习 | [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md) |
| 了解架构 | [CONFIG_ARCHITECTURE.md](./CONFIG_ARCHITECTURE.md) |
| 查找信息 | [README.md](./README.md) |
| 配置安全 | [CONFIG_SECURITY_ANALYSIS.md](./CONFIG_SECURITY_ANALYSIS.md) |
| 区分缓存 | [IMPORTANT_CACHE_CLARIFICATION.md](./IMPORTANT_CACHE_CLARIFICATION.md) |

---

**从 [README.md](./README.md) 开始，或选择上面任何一个文档！** 🚀
