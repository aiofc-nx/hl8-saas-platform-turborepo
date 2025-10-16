#!/bin/bash

# 安全地修复服务文件，不破坏模板字符串

# 修复所有服务文件的导入
for file in /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src/lib/services/*.ts; do
    if [[ -f "$file" && ! "$file" =~ \.spec\.ts$ ]]; then
        # 修复导入
        sed -i 's|from "@hl8/logger"|from "@hl8/nestjs-fastify"|g' "$file"
        sed -i 's|from "@hl8/cache"|from "@hl8/caching"|g' "$file"
        sed -i 's|from "@hl8/multi-tenancy"|from "@hl8/nestjs-isolation"|g' "$file"
        sed -i 's|from "@hl8/isolation-model"|from "@hl8/nestjs-isolation"|g' "$file"
        sed -i 's|from "../types/messaging.types"|from "../types/messaging.types.js"|g' "$file"
        sed -i 's|from "./types/messaging.types"|from "./types/messaging.types.js"|g' "$file"
        sed -i 's|from "../exceptions/messaging.exceptions"|from "../exceptions/messaging.exceptions.js"|g' "$file"
        
        # 修复类型
        sed -i 's|PinoLogger|FastifyLoggerService|g' "$file"
        sed -i 's|TenantContextService|IsolationContextService|g' "$file"
        sed -i 's|TenantIsolationService|MultiLevelIsolationService|g' "$file"
        
        # 修复方法调用
        sed -i 's|\.getTenant()|.getTenantId()|g' "$file"
        sed -i 's|this\.logger\.info(|this.logger.log(|g' "$file"
        sed -i 's|this\.logger\.setContext(|// this.logger.setContext(|g' "$file"
        
        # 修复 CacheService API
        sed -i 's|this\.cacheService\.delete(|this.cacheService.del("messaging", |g' "$file"
        sed -i 's|this\.cacheService\.keys(|this.getAllKeys("messaging", |g' "$file"
        
        echo "Fixed: $(basename "$file")"
    fi
done

echo "All service files fixed safely"
