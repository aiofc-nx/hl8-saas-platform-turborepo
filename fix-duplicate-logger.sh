#!/bin/bash

# 修复重复的 logger 标识符问题

# 移除重复的 logger 声明
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i '/private readonly logger: FastifyLoggerService;/d' {} \;

echo "Duplicate logger identifiers fixed"
