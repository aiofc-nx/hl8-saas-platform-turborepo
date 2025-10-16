#!/bin/bash

# 精确修复 getValue() 调用问题

for file in /home/arligle/hl8/hl8-saas-platform-turborepo/libs/messaging/src -name "*.ts"; do
    if [[ -f "$file" ]]; then
        # 修复 "default"?.getValue() 模式
        sed -i 's/"default"?.getValue()/"default"/g' "$file"
        
        # 修复 ?? "default"?.getValue() 模式
        sed -i 's/?? "default"?.getValue()/?? "default"/g' "$file"
        
        # 修复 tenantId?.getValue() 模式
        sed -i 's/tenantId?.getValue()/tenantId/g' "$file"
        
        echo "Fixed getValue() calls in: $(basename "$file")"
    fi
done

echo "All getValue() calls fixed"
