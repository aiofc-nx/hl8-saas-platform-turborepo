#!/bin/bash

# 修复类型导入问题

# 将配置类型改为 import type
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|import { MessagingModuleOptions }|import type { MessagingModuleOptions }|g' {} \;
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|import { MessagingCacheConfig }|import type { MessagingCacheConfig }|g' {} \;

# 修复其他类型导入
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|import { ConsumerState }|import type { ConsumerState }|g' {} \;
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|import { DeadLetterData }|import type { DeadLetterData }|g' {} \;
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|import { TenantMessagingConfig }|import type { TenantMessagingConfig }|g' {} \;

echo "Type imports fixed"
