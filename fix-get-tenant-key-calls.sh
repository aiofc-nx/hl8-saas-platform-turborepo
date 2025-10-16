#!/bin/bash

# 修复 getTenantKey 调用问题

# 将 getTenantKey 调用替换为简单的字符串拼接
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|this\.tenantIsolationService\.getTenantKey(|`${tenantId}:|g' {} \;

# 修复模板字符串的语法
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|, tenantId,|`|g' {} \;

echo "getTenantKey calls fixed"
