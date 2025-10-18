#!/bin/bash

# 应用层测试覆盖率报告脚本
# 用于生成详细的测试覆盖率报告

echo "📊 生成应用层测试覆盖率报告..."

# 设置测试环境
export NODE_ENV=test

# 运行测试并生成覆盖率报告
echo "🔍 运行测试并收集覆盖率数据..."
npm test -- --coverage --testPathPattern="application" --coverageReporters=text --coverageReporters=html --coverageReporters=json

# 检查覆盖率阈值
echo "📈 检查覆盖率阈值..."
COVERAGE_THRESHOLD=80

# 从覆盖率报告中提取数据
TOTAL_COVERAGE=$(npm test -- --coverage --testPathPattern="application" --coverageReporters=text-summary --silent | grep -o 'All files[^0-9]*[0-9]*\.[0-9]*' | grep -o '[0-9]*\.[0-9]*' | head -1)

if [ ! -z "$TOTAL_COVERAGE" ]; then
    echo "📊 当前覆盖率: ${TOTAL_COVERAGE}%"
    
    # 检查是否达到阈值
    if (( $(echo "$TOTAL_COVERAGE >= $COVERAGE_THRESHOLD" | bc -l) )); then
        echo "✅ 覆盖率达标 (>= ${COVERAGE_THRESHOLD}%)"
    else
        echo "❌ 覆盖率未达标 (< ${COVERAGE_THRESHOLD}%)"
        exit 1
    fi
else
    echo "⚠️ 无法获取覆盖率数据"
fi

echo "📋 覆盖率报告已生成:"
echo "  - HTML报告: coverage/lcov-report/index.html"
echo "  - JSON报告: coverage/coverage-final.json"
echo "  - LCOV报告: coverage/lcov.info"

echo "✅ 覆盖率报告生成完成！"
