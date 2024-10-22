![image](https://github.com/user-attachments/assets/96e36db5-2733-49c8-8e1e-ecbcc60a3943)

<p align="center">
  <a href="/README.md">English</a>
  | 
  <a href="/readme/readme-jp.md">日本語</a>
  | 
  <a href="/readme/readme-zh-cn.md">简体中文</a>
  | 
  <a href="/readme/readme-zh-tw.md">繁體中文</a>
</p>

<b>🦄APIPark 是开源的一站式AI网关和API开发者门户，帮助开发者和企业轻松管理、集成和部署AI服务。APIPark 基于 Apache 2.0 协议开源，这意味着它可以免费商用！</b>

<br>

✨你可以通过APIPark实现以下需求：
1. 快速接入 100+ AI 模型，我们支持所有主流的AI公司！
2. 将 AI 模型和 Prompt 提示词组合成API，比如基于 OpenAI GPT4o和一些自定义的提示词，创建一个情感分析API，翻译API或数据分析API。
3. 统一所有 AI API 的请求数据格式，当你切换 AI 模型，或者修改 Prompt 提示词的时候不会影响你的 APP 应用或者微服务，简化你的 AI 使用和维护成本。
4. 通过 APIPark 的开发者门户，将 API 在团队内共享。
5. 管理调用的应用、API Key，保障你的 API 安全和稳定性。
6. 通过清晰的图表来监控你的 AI API 使用情况。
7. 将API请求日志快速输出到第三方日志平台。

<br>

✨APIPark 还是一个强大的云原生 API 网关：
1. 拥有比 Nginx 更高的性能，并且支持集群部署，能够支持大规模的流量。
2. 将 REST API 在团队内共享，并管理API的调用关系，避免因混乱的API调用导致的管理成本和数据泄露问题。

<br>

# 💌 我们为什么打造 APIPark？
在打造 APIPark之前，我们已经花费了7年时间打造了一个拥有超过100万开发者用户的API开发和自动化测试平台，拥有超过500家企业客户并且获得了红杉资本的数千万元投资。

随着AI和Agent的发展，我们发现许多企业希望将AI接入企业内部系统的API以及第三方的API，让AI Agent能够完成更复杂的任务，而不仅是作为知识问答机器人。因此我们打造了 APIPark，你的一站式 AI 网关和 API开发者门户，加速你的 AI API 开发，并快速打造你的产品或AI Agent！

<br>


# ✨ 快速开始
APIPark 致力于解决以下问题：
- 无缝接入多种大型AI模型，并将这些AI能力打包成API进行调用，从而大幅简化了AI模型的使用门槛。
- 管理复杂的 AI & API 调用关系。
- 管理 API 的创建、监控、安全。
- 故障检测和排查：简化系统问题的识别和解决。
- 量化数据资产价值：提升数据资产的可见性和估值。


<br>

😍 APIPark 部署非常简单，仅需一句命令行即可在 5 分钟内部署好你的 AI 网关和 API 开发者门户。

```
curl -sSO https://download.apipark.com/install/quick-start.sh; bash quick-start.sh
```

<br>

# 🔥 特性
<table>
  <tr>
    <th>
      快速接入 100+ AI 模型
    </th>
    <th>
      通过统一的 API 格式来调用所有 AI
    </th>

  </tr>

  <tr>
    <td width="50%">
        <img src="https://apipark.com/wp-content/uploads/2024/10/AI-Gateway.png" />
    </td>
    <td width="50%">
        <img src="https://apipark.com/wp-content/uploads/2024/10/Unified-API.png" />
    </td>
  </tr>

  <tr>
    <th>
      一键将 Prompt 提示词封装成 REST API
    </th>
    <th>
     在团队内快速共享 API 服务
    </th>

  </tr>

  <tr>
    <td width="50%">
        <img src="https://apipark.com/wp-content/uploads/2024/10/Prompt-template.png" />
    </td>
    <td width="50%">
        <img src="https://apipark.com/wp-content/uploads/2024/10/developer-portal.png" />
    </td>
  </tr>

  <tr>
    <th>
      比肩 Nginx 的强大性能
    </th>
    <th>
      一站式完成 API 设计、发布、调用、下线
    </th>

  </tr>

  <tr>
    <td width="50%">
        <img src="https://apipark.com/wp-content/uploads/2024/10/hyper-performance.png" />
    </td>
    <td width="50%">
        <img src="https://apipark.com/wp-content/uploads/2024/08/Life-Cycle.png" />
    </td>
  </tr>
  
  <tr>
    <th>
      审核租户的API的调用申请
    </th>
    <th>
      多租户管理
    </th>
  </tr>

  <tr>
    <td width="50%">
            <img src="https://apipark.com/wp-content/uploads/2024/08/Application.png" />
    </td>
    <td width="50%">
        <img src="https://apipark.com/wp-content/uploads/2024/08/Multi-tenant.png" />
    </td>
  </tr>

  <tr>
    <th>
      详细记录所有 API 的调用日志
    </th>
    <th>
      强大的数据分析
    </th>
  </tr>

  <tr>
    <td width="50%">
        <img src="https://apipark.com/wp-content/uploads/2024/08/Chart-1.png" />
    </td>
    <td width="50%">
            <img src="https://apipark.com/wp-content/uploads/2024/08/Chart.png" />
    </td>
  </tr>
  
</table>


<br>

# 🚀 适用场景
## 简化 AI 的接入成本
  - 接入所有主流AI供应商的 100+ 大模型，并且通过统一的 API 调用，没有额外的适配工作。
  - 通过组合 AI 模型和 Prompt 提示词，形成新的 AI API，简化 AI API 的开发工作。
  - 将 AI API 在团队内部快速共享。

## 提升运营效率
  - 快速构建团队内的 API 开发者门户。
  - 高效管理和调用 API。
  - 减少复杂的系统间调用关系。

## 确保合规与安全
  - 强大的服务治理和合规管理功能。
  - 精细化管理应用调用的权限。
  - 确保 API 调用的安全性和合规性，降低企业风险。

## 简化系统故障排查
  - 利用监控和故障诊断工具快速发现和解决问题。
  - 减少停机时间，提高系统稳定性。

## 多租户管理和灵活订阅
  - 支持多租户管理，满足不同业务单元需求。
  - 灵活的订阅和审核流程简化 API 的使用和管理。

## 增强 API 可观测性
  - 实时监控和追踪 API 使用情况。
  - 全面掌握数据流动，提升数据使用透明度。

<br>


# 🚩 路线图
我们为 APIPark 制定了激动人心的目标：让每个人都能通过 AI 和 API 快速创建自己的产品和AI Agent！

为了实现这个目标，我们接下来会为APIPark增加新的特性：
1. 接入 API 市场，比如 Postman、RapidAPI、APISpace、APILayer 等。你可以直接通过APIPark使用来自各个 API 市场的 API，并通过 AI 让这些 API 更智能。
2. 接入 AI Agent，比如Langchain、AgentGPT、Auto-GPT、Dify等。让 AI Agent 通过 APIPark 接入你的内部系统或第三方API，完成更复杂的工作。
3. 智能 API 编排，APIPark 会提供一个统一的API入口，自动判断 API 请求的内容来编排多个 API 来完成你的需求。


<br>

# 📕文档
访问 [APIPark文档](https://docs.apipark.com/docs/install) 获取详细的安装指南、API 参考和使用说明。

<br>

# 🧾许可证
APIPark 使用 Apache 2.0 许可证。更多详情请查看 LICENSE 文件。


<br>

# 💌联系我们
对于企业级功能和专业技术支持，请联系售前专家进行个性化演示、定制方案和获取报价。

- 网站: https://apipark.com
- 电子邮件: dev@apipark.com

<br>

🙏 非常感谢所有帮助塑造 APIPark 的人，我们非常高兴听到社区的想法！让我们一起让API和AI的世界变得更强大和有趣。🎉
