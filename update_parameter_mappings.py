#!/usr/bin/env python3
import os
import json
from pathlib import Path

# 基础路径
base_path = "/Users/liujian/work/golang/src/github.com/APIParkLab/APIPark/ai-provider/model-runtime/model-providers"

# OpenAI 参数列表
openai_params = [
    "max_tokens",
    "max_completion_tokens",
    "temperature",
    "top_p",
    "n",
    "stream",
    "stop",
    "presence_penalty",
    "response_format",
    "seed",
    "frequency_penalty"
]

# 参数映射关系
param_mapping = {
    "temperature": "temperature",
    "top_p": "top_p",
    "top_k": "",
    "max_tokens": "max_tokens",
    "presence_penalty": "presence_penalty",
    "frequency_penalty": "frequency_penalty",
    "response_format": "response_format",
    "res_format": "response_format",
    "p": "top_p",
    "k": "",
    "repetition_penalty": "frequency_penalty",
    "reasoning_effort": "",
    "enable_enhance": "",
    "with_search_enhance": "",
    "vision_support": "",
    "function_call_support": "",
    "context_size": "",
    "mode": "",
    "max_completion_tokens": "max_completion_tokens",
    "seed": "seed",
    "n": "n",
    "stream": "stream",
    "stop": "stop"
}

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
        
        # 更新映射关系
        for param in params:
            if param in param_mapping:
                params[param] = param_mapping[param]
        
        # 保存更新后的文件
        with open(param_file, 'w', encoding='utf-8') as f:
            json.dump(params, f, indent=2, ensure_ascii=False)
        
        print(f"Updated parameter mappings for {provider_dir}")
    except Exception as e:
        print(f"Error processing {param_file}: {e}")