#!/bin/bash

# 批量修复所有文件中的 getValue() 调用问题

find /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts" -type f | while read file; do
    echo "Processing: $(basename "$file")"
    
    # 创建临时文件
    temp_file="${file}.tmp"
    
    # 使用 sed 进行多种模式的替换
    sed -E '
        # 修复 "default"?.getValue() 模式
        s/"default"\?\.getValue\(\)/"default"/g
        
        # 修复 ?? "default"?.getValue() ?? "default" 模式
        s/?? "default"\?\.getValue\(\) ?? "default"/?? "default"/g
        
        # 修复 ?? "default"?.getValue() 模式
        s/?? "default"\?\.getValue\(\)/?? "default"/g
        
        # 修复 tenantId?.getValue() 模式
        s/tenantId\?\.getValue\(\)/tenantId/g
        
        # 修复 currentTenantId?.getValue() 模式
        s/currentTenantId\?\.getValue\(\)/currentTenantId/g
    ' "$file" > "$temp_file"
    
    # 替换原文件
    mv "$temp_file" "$file"
done

echo "All getValue() calls fixed"
