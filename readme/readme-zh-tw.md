![image](https://github.com/user-attachments/assets/96e36db5-2733-49c8-8e1e-ecbcc60a3943)

<p align="center">
  English
  | 
  <a href="/readme/readme-jp.md">日本語</a>
  | 
  <a href="/readme/readme-zh-cn.md">简体中文</a>
  | 
  <a href="/readme/readme-zh-tw.md">繁體中文</a>
</p>

<b>🦄APIPark 是開源的一站式 AI 網關和 API 開發者門戶，幫助開發者和企業輕鬆管理、整合和部署 AI 服務。APIPark 基於 Apache 2.0 授權條款開源，這意味著它可以免費商業使用！</b>

<br>

✨通過 APIPark，你可以實現以下需求：
1. 快速接入 100+ AI 模型，我們支援所有主流的 AI 公司！
2. 將 AI 模型和提示詞組合成 API，例如基於 OpenAI GPT-4 和一些自訂的提示詞，創建情緒分析 API、翻譯 API 或數據分析 API。
3. 統一所有 AI API 的請求數據格式，當你切換 AI 模型或修改提示詞時，將不會影響你的應用程式或微服務，簡化 AI 使用與維護成本。
4. 透過 APIPark 的開發者門戶，將 API 在團隊內共享。
5. 管理調用的應用程式和 API Key，確保 API 的安全性和穩定性。
6. 透過清晰的圖表來監控你的 AI API 使用情況。
7. 快速將 API 請求日誌輸出至第三方日誌平台。

<br>

✨APIPark 同時也是一個強大的雲原生 API 網關：
1. 擁有比 Nginx 更高的性能，並且支援集群部署，能夠應付大規模流量。
2. 在團隊內共享 REST API，並管理 API 的調用關係，避免因混亂的 API 調用導致的管理成本和數據外洩問題。

<br>

# 💌 我們為什麼打造 APIPark？
在打造 APIPark 之前，我們已經花費 7 年時間創建了一個擁有超過 100 萬開發者用戶的 API 開發與自動化測試平台，並擁有 500 多家企業客戶，還獲得了紅杉資本數千萬元的投資。

隨著 AI 和 Agent 的發展，我們發現許多企業希望將 AI 接入內部系統的 API 以及第三方的 API，讓 AI Agent 能夠完成更複雜的任務，而不僅僅是作為知識問答機器人。因此，我們打造了 APIPark，這是一站式 AI 網關和 API 開發者門戶，幫助你加速 AI API 的開發，快速構建產品或 AI Agent！

<br>


# ✨ 快速開始
APIPark 致力於解決以下問題：
- 無縫接入多種大型 AI 模型，並將這些 AI 能力打包成 API 進行調用，大幅簡化 AI 模型的使用門檻。
- 管理複雜的 AI 和 API 調用關係。
- 管理 API 的創建、監控和安全。
- 故障檢測與排除：簡化系統問題的識別與解決。
- 量化數據資產價值：提升數據資產的可視性與評估。


<br>

😍 部署 APIPark 非常簡單，只需一條命令行即可在 5 分鐘內部署好你的 AI 網關和 API 開發者門戶。

```
curl -sSO https://download.apipark.com/install/quick-start.sh; bash quick-start.sh
```


<br>

# 🔥 特色
<table>
  <tr>
    <th>
      接入所有主流 AI 供應商的 100+ 大模型
    </th>
    <th>
      統一所有 AI API 的調用格式，無需額外適配工作
    </th>

  </tr>

  <tr>
    <td width="50%">
        <img src="https://apipark.com/wp-content/uploads/2024/08/%E9%A1%B5%E9%9D%A2-1.png" />
      API 服務廣場是 APIPark 的核心功能之一，旨在解決企業內部 API 分散、管理混亂的問題。透過 API 服務廣場，企業可以將所有的 API 服務集中展示在一個統一的平台上，讓不同部門和團隊能輕鬆找到並使用所需的 API 服務。
    </td>
    <td width="50%">
        <img src="https://apipark.com/wp-content/uploads/2024/08/Life-Cycle.png" />
      API 全生命週期管理功能幫助企業規範 API 的管理流程，管理 API 的流量轉發與負載均衡，並管理所有 API 對外發佈的版本，提升 API 的品質與可維護性。透過這個功能，企業可以實現 API 的高效開發與穩定運營，從而支持業務的快速發展與創新。
    </td>
  </tr>

  <tr>
    <th>
      組合 AI 模型與提示詞，形成新的 AI API
    </th>
    <th>
      切換 AI 模型或修改提示詞不會影響你的應用程式或微服務
    </th>

  </tr>

  <tr>
    <td width="50%">
        <img src="https://apipark.com/wp-content/uploads/2024/08/%E9%A1%B5%E9%9D%A2-1.png" />
      API 服務廣場是 APIPark 的核心功能之一，旨在解決企業內部 API 分散、管理混亂的問題。透過 API 服務廣場，企業可以將所有的 API 服務集中展示在一個統一的平台上，讓不同部門和團隊能輕鬆找到並使用所需的 API 服務。
    </td>
    <td width="50%">
        <img src="https://apipark.com/wp-content/uploads/2024/08/Life-Cycle.png" />
      API 全生命週期管理功能幫助企業規範 API 的管理流程，管理 API 的流量轉發與負載均衡，並管理所有 API 對外發佈的版本，提升 API 的品質與可維護性。透過這個功能，企業可以實現 API 的高效開發與穩定運營，從而支持業務的快速發展與創新。
    </td>
  </tr>

  <tr>
    <th>
      集中管理與展示所有 AI / REST API
    </th>
    <th>
      覆蓋 API 從設計、發佈、運行、下線的全過程
    </th>

  </tr>

  <tr>
    <td width="50%">
        <img src="https://apipark.com/wp-content/uploads/2024/08/%E9%A1%B5%E9%9D%A2-1.png" />
      API 服務廣場是 APIPark 的核心功能之一，旨在解決企業內部 API 分散、管理混亂的問題。透過 API 服務廣場，企業可以將所有的 API 服務集中展示在一個統一的平台上，讓不同部門和團隊能輕鬆找到並使用所需的 API 服務。
    </td>
    <td width="50%">
        <img src="https://apipark.com/wp-content/uploads/2024/08/Life-Cycle.png" />
      API 全生命週期管理功能幫助企業規範 API 的管理流程，管理 API 的流量轉發與負載均衡，並管理所有 API 對外發佈的版本，提升 API 的品質與可維護性。透過這個功能，企業可以實現 API 的高效開發與穩定運營，從而支持業務的快速發展與創新。
    </td>
  </tr>
  
  <tr>
    <th>
      管理多個租戶，確保數據隔離與安全
    </th>
    <th>
      API 資源需先申請並通過審核後才能調用
    </th>
  </tr>

  <tr>
    <td width="50%">
        <img src="https://apipark.com/wp-content/uploads/2024/08/Multi-tenant.png" />
      多租戶管理功能為企業提供在同一平台上管理多個租戶的能力。每個租戶可以擁有獨立的資源、使用者與權限設置，確保數據與操作隔離，提升資源使用效率與管理便捷性。
    </td>
    <td width="50%">
            <img src="https://apipark.com/wp-content/uploads/2024/08/Application.png" />
      APIPark 為所有 API 資源提供流程審核功能，避免違規或繞過平台來調用 API。調用方需先申請 API 資源，並等待服務方審核通過後才能正式調用 API。
    </td>
  </tr>

  <tr>
    <th>
      透過詳細的調用日誌，幫助排查 API 在任何時刻的訪問情況
    </th>
    <th>
      豐富的統計報表*
    </th>
  </tr>

  <tr>
    <td width="50%">
        <img src="https://apipark.com/wp-content/uploads/2024/08/Chart-1.png" />
      API 調用日誌功能為企業提供全面的日誌記錄能力，詳細記錄每一次 API 調用的所有相關信息。透過這些日誌，企業可以快速追蹤與排查 API 調用中的問題，確保系統穩定運行與數據安全。
    </td>
    <td width="50%">
            <img src="https://apipark.com/wp-content/uploads/2024/08/Chart.png" />
      透過對歷史調用數據的分析，APIPark 能夠展示 API 長期的調用趨勢與性能變化，幫助企業在問題發生前進行預防性維護。
    </td>
  </tr>
  
</table>

<br>

# 🚀 適用場景
## 簡化 AI 的接入成本
  - 接入所有主流 AI 供應商的 100+ 大模型，並且透過統一的 API 調用，無需額外適配工作。
  - 組合 AI 模型與提示詞，形成新的 AI API，簡化 AI API 的開發工作。
  - 在團隊內快速共享 AI API。

## 提升運營效率
  - 快速構建團隊內的 API 開發者門戶。
  - 高效管理與調用 API。
  - 減少系統間複雜的調用關係。

## 確保合規與安全
  - 強大的服務治理與合規管理功能。
  - 精細化管理應用程式調用的權限。
  - 確保 API 調用的安全性與合規性，降低企業風險。

## 簡化系統故障排除
  - 利用監控與故障診斷工具快速發現與解決問題。
  - 減少停機時間，提升系統穩定性。

## 多租戶管理與彈性訂閱
  - 支援多租戶管理，滿足不同業務單位需求。
  - 彈性的訂閱與審核流程簡化 API 的使用與管理。

## 增強 API 可觀測性
  - 實時監控與追蹤 API 使用情況。
  - 全面掌握數據流動，提升數據使用透明度。

<br>

# 🚩 路線圖
我們為 APIPark 訂立了激動人心的目標：讓每個人都能透過 AI 和 API 快速創建自己的產品與 AI Agent！

為實現這一目標，我們將為 APIPark 增加以下新特性：
1. 接入 API 市場，例如 Postman、RapidAPI、APISpace、APILayer 等。你可以直接透過 APIPark 使用來自各大 API 市場的 API，並透過 AI 讓這些 API 更加智能。
2. 接入 AI Agent，例如 Langchain、AgentGPT、Auto-GPT、Dify 等。讓 AI Agent 透過 APIPark 接入你的內部系統或第三方 API，完成更複雜的工作。
3. 智能 API 編排，APIPark 將提供一個統一的 API 入口，並自動判斷 API 請求的內容來編排多個 API 以完成你的需求。

<br>

# 📕指南
訪問 [APIPark指南](https://docs.apipark.com/docs/install) 以獲取詳細的安裝指南、API 參考與使用說明。

<br>

# 🧾 授權條款
APIPark 使用 Apache 2.0 授權條款。更多詳情請參閱 LICENSE 文件。

<br>

# 💌 聯繫我們
如需企業級功能與專業技術支援，請聯絡我們的售前專家，獲取個性化演示、定制方案和報價。

- 網站: https://apipark.com
- 電子郵件: dev@apipark.com

<br>

🙏 非常感謝所有幫助塑造 APIPark 的人，我們非常期待聽到社群的想法！讓我們一起讓 API 和 AI 的世界變得更強大與有趣。🎉
