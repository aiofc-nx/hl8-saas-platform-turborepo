#!/bin/bash

# 修复 CacheService API 问题

# 1. 修复 cacheService.keys() - 替换为 getAllKeys 调用
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|this\.cacheService\.keys(|this.getAllKeys("messaging", |g' {} \;

# 2. 修复 cacheService.delete() - 改为 cacheService.del()
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|this\.cacheService\.delete(|this.cacheService.del("messaging", |g' {} \;

# 3. 修复 cacheService.set() 参数问题 - 需要添加 namespace 参数
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|this\.cacheService\.set(key, |this.cacheService.set("messaging", key, |g' {} \;

# 4. 修复 cacheService.get() 参数问题 - 需要添加 namespace 参数
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|this\.cacheService\.get(key, |this.cacheService.get("messaging", key, |g' {} \;

# 5. 修复 cacheService.del() 参数问题 - 需要添加 namespace 参数
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|this\.cacheService\.del(key, |this.cacheService.del("messaging", key, |g' {} \;

# 6. 修复 cacheService.exists() 参数问题 - 需要添加 namespace 参数
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|this\.cacheService\.exists(key, |this.cacheService.exists("messaging", key, |g' {} \;

echo "CacheService API fixed"