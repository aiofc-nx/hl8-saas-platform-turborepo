#!/bin/bash

# 修复 getTenant() 调用问题

# 将 getTenant() 改为 getTenantId()
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|\.getTenant()|.getTenantId()|g' {} \;

echo "getTenant() calls fixed"
