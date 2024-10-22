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

<b>🦄APIPark はオープンソースの一体型AIゲートウェイおよびAPI開発者ポータルであり、開発者や企業がAIサービスの管理、統合、導入を簡単に行えるよう支援します。APIPark はApache 2.0ライセンスの下でオープンソース化されており、商用利用も無料です！</b>

<br>

✨APIPark を使用して、以下のニーズを満たすことができます：
1. 100以上のAIモデルに迅速に接続でき、主要なAI企業すべてをサポートしています！
2. AIモデルとプロンプト（Prompt）を組み合わせてAPIを作成できます。たとえば、OpenAI GPT-4とカスタムプロンプトを使用して感情分析APIや翻訳API、データ分析APIを作成することが可能です。
3. すべてのAI APIのリクエストデータフォーマットを統一し、AIモデルを切り替えたり、プロンプトを変更しても、アプリやマイクロサービスに影響を与えることなく、AIの利用と保守コストを削減できます。
4. APIParkの開発者ポータルを通じて、APIをチーム内で共有できます。
5. アプリケーションやAPIキーの管理により、APIの安全性と安定性を確保します。
6. 視覚的なグラフを通じて、AI APIの使用状況を監視します。
7. APIリクエストのログを迅速にサードパーティのログプラットフォームに出力します。

<br>

✨APIPark は強力なクラウドネイティブAPIゲートウェイでもあります：
1. Nginxよりも高性能で、クラスタ展開をサポートし、大規模なトラフィックにも対応できます。
2. REST APIをチーム内で共有し、APIの呼び出し関係を管理することで、混乱したAPI呼び出しによる管理コストやデータ漏洩の問題を防ぎます。

<br>

# 💌 APIPark を開発した理由
APIParkを開発する前に、私たちは7年をかけて100万人以上の開発者ユーザーを持つAPI開発および自動化テストプラットフォームを構築し、500以上の企業顧客を獲得し、さらにセコイアキャピタルから数千万元の投資を受けました。

AIとエージェントの進化に伴い、多くの企業がAIを内部システムのAPIやサードパーティのAPIに接続し、AIエージェントがより複雑なタスクをこなせるようにしたいと考えていることがわかりました。単なる知識応答ロボットにとどまらないのです。そこで、私たちはAPIParkを開発しました。これは、あなたのAI API開発を加速し、AIエージェントや製品を迅速に構築できる、ワンストップAIゲートウェイおよびAPI開発者ポータルです！

<br>

# ✨ クイックスタート
APIPark は以下の問題を解決するために設計されています：
- 複数の大型AIモデルにシームレスに接続し、これらのAI機能をAPIとしてパッケージ化して呼び出すことで、AIモデルの使用のハードルを大幅に下げます。
- 複雑なAIとAPI呼び出しの関係を管理します。
- APIの作成、監視、安全性を管理します。
- 故障検出とトラブルシューティング：システム問題の特定と解決を簡素化します。
- データ資産の価値を定量化：データ資産の可視性と評価を向上させます。

<br>

😍 APIPark のデプロイは非常に簡単で、コマンドライン1つで5分以内にAIゲートウェイとAPI開発者ポータルをデプロイできます。

```
curl -sSO https://download.apipark.com/install/quick-start.sh; bash quick-start.sh
```


<br>

# 🔥 特徴
<table>
  <tr>
    <th>
      100以上のAIモデルに迅速に接続
    </th>
    <th>
      統一されたAPIフォーマットで全てのAIを呼び出し
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
      プロンプトテンプレートをREST APIにワンクリックで変換
    </th>
    <th>
      チーム内でAPIサービスを迅速に共有
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
      Nginxに匹敵する高性能
    </th>
    <th>
      APIの設計、公開、呼び出し、停止までをワンストップで対応
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
      テナントのAPI呼び出しリクエストを承認
    </th>
    <th>
      マルチテナント管理
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
      全てのAPI呼び出しを詳細に記録
    </th>
    <th>
      強力なデータ分析機能
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

# 🚀 使用ケース
## AI導入コストを簡素化
  - 主要なAIプロバイダの100以上の大規模モデルに接続し、統一されたAPI呼び出しにより、追加の適応作業は不要です。
  - AIモデルとプロンプトを組み合わせて新しいAI APIを作成し、AI APIの開発作業を簡素化します。
  - チーム内でAI APIを迅速に共有します。

## 運用効率を向上
  - チーム内に迅速にAPI開発者ポータルを構築します。
  - APIを効率的に管理および呼び出します。
  - システム間の複雑な呼び出し関係を削減します。

## コンプライアンスとセキュリティを確保
  - 強力なサービスガバナンスおよびコンプライアンス管理機能。
  - アプリケーション呼び出しの権限をきめ細かく管理します。
  - API呼び出しの安全性とコンプライアンスを確保し、企業リスクを低減します。

## システム障害のトラブルシューティングを簡素化
  - 監視および障害診断ツールを使用して問題を迅速に発見し、解決します。
  - ダウンタイムを減少させ、システムの安定性を向上させます。

## マルチテナント管理と柔軟なサブスクリプション
  - マルチテナント管理をサポートし、異なるビジネスユニットのニーズに対応します。
  - 柔軟なサブスクリプションと承認プロセスにより、APIの使用と管理を簡素化します。

## APIの可観測性を向上
  - APIの使用状況をリアルタイムで監視および追跡します。
  - データの流れを完全に把握し、データ使用の透明性を向上させます。

<br>

# 🚩 ロードマップ
私たちは、AIとAPIを使って、誰もが迅速に自分の製品やAIエージェントを作成できるようにするというエキサイティングな目標を立てています！

この目標を達成するために、APIParkに新しい機能を追加する予定です：
1. Postman、RapidAPI、APISpace、APILayerなどのAPIマーケットプレイスとの連携を計画しています。APIParkを通じて、さまざまなAPIマーケットプレイスのAPIを直接使用し、AIを通じてこれらのAPIをよりスマートにします。
2. Langchain、AgentGPT、Auto-GPT、DifyなどのAIエージェントと連携し、AIエージェントがAPIParkを通じて内部システムやサードパーティAPIに接続し、より複雑な作業を実行できるようにします。
3. インテリジェントなAPIオーケストレーション：APIParkは統一されたAPIエントリーポイントを提供し、APIリクエストの内容に基づいて複数のAPIをオーケストレーションして、要求を完了します。

<br>

# 📕ドキュメント
詳細なインストールガイド、APIリファレンス、使用説明書については、[APIParkドキュメント](https://docs.apipark.com/docs/install) をご覧ください。

<br>

# 🧾 ライセンス
APIParkはApache 2.0ライセンスの下で提供されています。詳細については、LICENSEファイルをご覧ください。

<br>

# 💌 お問い合わせ
エンタープライズ機能や専門的な技術サポートについては、プリセールスの専門家に連絡し、個別デモ、カスタムソリューション、価格情報を入手してください。

- ウェブサイト: https://apipark.com
- メール: dev@apipark.com

<br>

🙏 APIParkを形作るのに貢献してくださったすべての方々に心から感謝いたします。コミュニティの皆さんの意見を聞けることを楽しみにしています！一緒にAPIとAIの世界をより強力で楽しいものにしましょう。🎉
