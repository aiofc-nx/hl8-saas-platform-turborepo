#!/bin/bash

# 修复 FastifyLoggerService API 调用问题

# 1. 将 logger.info 改为 logger.log
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|this\.logger\.info(|this.logger.log(|g' {} \;

# 2. 修复 logger 构造函数调用
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -exec sed -i 's|private readonly logger = new FastifyLoggerService();|private readonly logger: FastifyLoggerService;|g' {} \;

# 3. 为所有服务类添加 logger 参数到构造函数
find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src/lib/services -name "*.ts" -exec sed -i '/private readonly cacheConfig: MessagingCacheConfig,/a\
    private readonly logger: FastifyLoggerService,' {} \;

echo "Logger API fixed"
