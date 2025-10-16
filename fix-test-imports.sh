#!/bin/bash

# 修复测试文件中的导入问题

find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.spec.ts" -type f | while read file; do
    echo "Fixing test imports in: $(basename "$file")"
    
    # 修复导入
    sed -i 's|from "@hl8/multi-tenancy"|from "@hl8/nestjs-isolation"|g' "$file"
    sed -i 's|from "@hl8/logger"|from "@hl8/nestjs-fastify"|g' "$file"
    sed -i 's|from "./types/messaging.types"|from "./types/messaging.types.js"|g' "$file"
    sed -i 's|from "../types/messaging.types"|from "../types/messaging.types.js"|g' "$file"
    
    # 修复类型
    sed -i 's|TenantContextService|IsolationContextService|g' "$file"
    sed -i 's|TenantIsolationService|MultiLevelIsolationService|g' "$file"
    sed -i 's|PinoLogger|FastifyLoggerService|g' "$file"
done

echo "All test imports fixed"
