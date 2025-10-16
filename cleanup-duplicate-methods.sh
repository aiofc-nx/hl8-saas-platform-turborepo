#!/bin/bash

# 清理所有服务文件中的重复 getAllKeys 方法

for file in /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src/lib/services/*.ts; do
    if [[ -f "$file" && ! "$file" =~ \.spec\.ts$ ]]; then
        # 临时文件
        temp_file="${file}.tmp"
        
        # 使用 awk 来清理重复的 getAllKeys 方法
        awk '
        BEGIN { 
            in_getAllKeys = 0
            getAllKeys_count = 0
            skip_until_brace = 0
        }
        /private async getAllKeys/ {
            if (getAllKeys_count == 0) {
                # 保留第一个 getAllKeys 方法
                getAllKeys_count++
                in_getAllKeys = 1
                print
                next
            } else {
                # 跳过后续的 getAllKeys 方法
                skip_until_brace = 1
                next
            }
        }
        skip_until_brace && /^  }$/ {
            skip_until_brace = 0
            next
        }
        skip_until_brace {
            next
        }
        in_getAllKeys && /^  }$/ {
            in_getAllKeys = 0
            print
            next
        }
        { print }
        ' "$file" > "$temp_file"
        
        # 替换原文件
        mv "$temp_file" "$file"
        
        echo "Cleaned duplicate methods from: $(basename "$file")"
    fi
done

echo "All duplicate getAllKeys methods cleaned"
