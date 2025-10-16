#!/bin/bash

# 修复 logger.info 调用问题

# 将 logger.info 改为 logger.log
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|this\.logger\.info(|this.logger.log(|g' {} \;

echo "logger.info calls fixed"
