#!/bin/bash

# 简单批量修复 getValue() 调用问题

find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -type f | while read file; do
    echo "Processing: $(basename "$file")"
    
    # 创建临时文件
    temp_file="${file}.tmp"
    
    # 使用简单的 sed 替换
    sed 's/"default"?.getValue()/"default"/g' "$file" > "$temp_file"
    sed -i 's/?? "default"?.getValue() ?? "default"/?? "default"/g' "$temp_file"
    sed -i 's/?? "default"?.getValue()/?? "default"/g' "$temp_file"
    sed -i 's/tenantId?.getValue()/tenantId/g' "$temp_file"
    sed -i 's/currentTenantId?.getValue()/currentTenantId/g' "$temp_file"
    
    # 替换原文件
    mv "$temp_file" "$file"
done

echo "All getValue() calls fixed"
