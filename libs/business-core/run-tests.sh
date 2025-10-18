#!/bin/bash

# 应用层单元测试运行脚本
# 用于运行所有应用层相关的单元测试

echo "🚀 开始运行应用层单元测试..."

# 设置测试环境
export NODE_ENV=test

# 运行用例测试
echo "📋 运行用例测试..."
npm test -- --testPathPattern="use-cases" --verbose

# 运行应用服务测试
echo "🔧 运行应用服务测试..."
npm test -- --testPathPattern="services" --verbose

# 运行通用模块测试
echo "🛠️ 运行通用模块测试..."
npm test -- --testPathPattern="common" --verbose

# 运行所有应用层测试
echo "🎯 运行所有应用层测试..."
npm test -- --testPathPattern="application" --verbose

echo "✅ 应用层单元测试完成！"
