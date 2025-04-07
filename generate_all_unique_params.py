#!/usr/bin/env python3
import json

# 读取现有的合并文件
input_file = "/Users/liujian/work/golang/src/github.com/APIParkLab/APIPark/all_parameter_names.json"
with open(input_file, 'r', encoding='utf-8') as f:
    all_params = json.load(f)

# 收集所有唯一的参数名
unique_params = {}

# 遍历所有供应商的参数
for provider, params in all_params.items():
    for param_name, param_value in params.items():
        if param_name not in unique_params:
            unique_params[param_name] = param_value

# 按字母顺序排序参数
sorted_params = {k: unique_params[k] for k in sorted(unique_params.keys())}

# 保存合并后的文件
output_file = "/Users/liujian/work/golang/src/github.com/APIParkLab/APIPark/unique_parameters.json"
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(sorted_params, f, indent=2, ensure_ascii=False)

print(f"生成了包含所有唯一参数的文件: {output_file}")