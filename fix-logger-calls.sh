#!/bin/bash

# 修复 logger.error 调用，添加 undefined 参数
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|this\.logger\.error("\([^"]*\)", {|this.logger.error("\1", undefined, {|g' {} \;

# 修复 logger.error 调用，处理只有两个参数的情况
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|this\.logger\.error("\([^"]*\)", {\([^}]*\)});// this.logger.error("\1", undefined, {\2});|g' {} \;

echo "Logger calls fixed"
