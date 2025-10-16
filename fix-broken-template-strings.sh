#!/bin/bash

# 修复被破坏的模板字符串

# 修复所有类似的问题
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|`\${tenantId}:|`${tenantId}:|g' {} \;
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|,\s*tenantId,\s*);|`;|g' {} \;

# 修复具体的模板字符串问题
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|return await `\${tenantId}:|return `${tenantId}:|g' {} \;
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|return `\${tenantId}:|return `${tenantId}:|g' {} \;

echo "Template strings fixed"
