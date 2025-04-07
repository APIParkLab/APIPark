#!/usr/bin/env python3
import os
import yaml
import json
from pathlib import Path

# 基础路径
base_path = "/Users/liujian/work/golang/src/github.com/APIParkLab/APIPark/ai-provider/model-runtime/model-providers"

# 遍历所有供应商目录
for provider_dir in os.listdir(base_path):
    provider_path = os.path.join(base_path, provider_dir)
    
    # 检查是否是目录
    if not os.path.isdir(provider_path):
        continue
    
    # 检查llm目录是否存在
    llm_path = os.path.join(provider_path, "llm")
    if not os.path.isdir(llm_path):
        continue
    
    # 收集参数名和模板
    param_names = {}
    
    # 遍历llm目录下的所有yaml文件
    for yaml_file in os.listdir(llm_path):
        if not yaml_file.endswith(('.yaml', '.yml')):
            continue
        
        yaml_path = os.path.join(llm_path, yaml_file)
        
        try:
            # 读取yaml文件
            with open(yaml_path, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)
            
            # 提取parameter_rules中的name和use_template值
            if data and 'parameter_rules' in data:
                for param in data['parameter_rules']:
                    if 'name' in param:
                        name = param['name']
                        # 获取use_template值，如果不存在则为空字符串
                        template = param.get('use_template', '')
                        
                        # 如果参数名不在字典中或者当前模板不为空
                        if name not in param_names or (template and not param_names[name]):
                            param_names[name] = template
        except Exception as e:
            print(f"处理 {yaml_path} 时出错: {e}")
    
    # 将参数名和模板保存为JSON
    if param_names:
        output_file = os.path.join(provider_path, "parameter_names.json")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(param_names, f, indent=2, ensure_ascii=False)
        
        print(f"已为 {provider_dir} 提取 {len(param_names)} 个唯一参数")