#!/usr/bin/env python3
import os
import json
from pathlib import Path

# 基础路径
base_path = "/Users/liujian/work/golang/src/github.com/APIParkLab/APIPark/ai-provider/model-runtime/model-providers"

# 合并后的结果
merged_params = {}

# 遍历所有供应商目录
for provider_dir in os.listdir(base_path):
    provider_path = os.path.join(base_path, provider_dir)
    
    # 检查是否是目录
    if not os.path.isdir(provider_path):
        continue
    
    # 检查parameter_names.json文件是否存在
    param_file = os.path.join(provider_path, "parameter_names.json")
    if not os.path.isfile(param_file):
        continue
    
    try:
        # 读取parameter_names.json文件
        with open(param_file, 'r', encoding='utf-8') as f:
            params = json.load(f)
        
        # 将供应商的参数添加到合并结果中
        merged_params[provider_dir] = params
        
        print(f"Added parameters from {provider_dir}")
    except Exception as e:
        print(f"Error processing {param_file}: {e}")

# 保存合并后的文件
output_file = "/Users/liujian/work/golang/src/github.com/APIParkLab/APIPark/all_parameter_names.json"
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(merged_params, f, indent=2, ensure_ascii=False)

print(f"Merged parameters saved to {output_file}")