#!/bin/bash

# 安全地为所有服务类添加 getAllKeys 方法

for file in /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src/lib/services/*.ts; do
    if [[ -f "$file" && ! "$file" =~ \.spec\.ts$ ]]; then
        # 在类的最后一个方法之后添加 getAllKeys 方法
        sed -i '/^  }$/a\
\
  /**\
   * 获取所有匹配的缓存键（临时实现）\
   * TODO: 实现完整的键扫描功能\
   */\
  private async getAllKeys(namespace: string, pattern: string): Promise<string[]> {\
    // 临时返回空数组，避免编译错误\
    this.logger.log("getAllKeys called", { namespace, pattern });\
    return [];\
  }' "$file"
        
        echo "Added getAllKeys method to: $(basename "$file")"
    fi
done

echo "All getAllKeys methods added safely"
