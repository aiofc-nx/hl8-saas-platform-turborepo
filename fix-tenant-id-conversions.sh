#!/bin/bash

# 修复 TenantId 类型转换问题

# 1. 修复 getTenantId() 调用，确保返回 string
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|this\.tenantContextService\.getTenantId()|this.tenantContextService.getTenantId()?.getValue() ?? "default"|g' {} \;

# 2. 修复 TenantId 类型参数
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|tenantId: TenantId|tenantId: string|g' {} \;
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|tenantId: string \| TenantId|tenantId: string|g' {} \;

# 3. 修复 getTenantKey 调用，替换为简单的字符串拼接
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|this\.tenantIsolationService\.getTenantKey(|`${tenantId}:|g' {} \;

echo "TenantId conversions fixed"
