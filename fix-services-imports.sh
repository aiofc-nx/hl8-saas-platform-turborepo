#!/bin/bash

# 修复服务文件的导入问题

# 修复所有服务文件的导入
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src/lib/services -name "*.ts" -exec sed -i 's|from "@hl8/logger"|from "@hl8/nestjs-fastify"|g' {} \;
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src/lib/services -name "*.ts" -exec sed -i 's|from "@hl8/cache"|from "@hl8/caching"|g' {} \;
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src/lib/services -name "*.ts" -exec sed -i 's|from "@hl8/multi-tenancy"|from "@hl8/nestjs-isolation"|g' {} \;
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src/lib/services -name "*.ts" -exec sed -i 's|from "@hl8/isolation-model"|from "@hl8/nestjs-isolation"|g' {} \;

# 修复类型导入
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src/lib/services -name "*.ts" -exec sed -i 's|from "../types/messaging.types"|from "../types/messaging.types.js"|g' {} \;
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src/lib/services -name "*.ts" -exec sed -i 's|from "./types/messaging.types"|from "./types/messaging.types.js"|g' {} \;

# 修复类名
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src/lib/services -name "*.ts" -exec sed -i 's|PinoLogger|FastifyLoggerService|g' {} \;
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src/lib/services -name "*.ts" -exec sed -i 's|TenantContextService|IsolationContextService|g' {} \;
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src/lib/services -name "*.ts" -exec sed -i 's|TenantIsolationService|MultiLevelIsolationService|g' {} \;

echo "Service imports fixed"
