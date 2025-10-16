#!/bin/bash

# 修复 TenantId 类型问题
# 将 string | TenantId 转换为 string

find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|tenantId: string \| TenantId|tenantId: string|g' {} \;
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|tenantId: TenantId|tenantId: string|g' {} \;

# 修复 getTenantId() 调用，确保返回 string
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|this\.tenantContextService\.getTenantId()|this.tenantContextService.getTenantId()?.getValue() ?? "default"|g' {} \;

# 修复 getTenantKey 调用，替换为简单的字符串拼接
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|this\.tenantIsolationService\.getTenantKey(|`${tenantId}:|g' {} \;
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|, tenantId,|`|g' {} \;

echo "TenantId types fixed"
