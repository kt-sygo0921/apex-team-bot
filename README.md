# APEX チーム振り分け Bot

ボイスチャンネルにいるメンバーのAPEXランクロールをもとに、バランスよくチーム分けを行うDiscord Botです。

---

## 機能

- ボイスチャンネルのメンバーを自動取得
- 各メンバーに付与されたAPEXランクロールを読み取り
- ランクスコアをもとにチーム間の強さが均等になるよう自動振り分け
- チーム数はコマンドで自由に指定可能（2〜10チーム）

---

## セットアップ

### 必要環境

- Node.js 18以上
- npm
- Discordアカウント・サーバーの管理権限

---

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd bot
```

### 2. パッケージのインストール

```bash
npm install
```

### 3. Discord Developer Portal での設定

1. [Discord Developer Portal](https://discord.com/developers/applications) にアクセス
2. **New Application** でアプリケーションを作成
3. 左メニュー **Bot** を開く
   - **Server Members Intent** → ON
   - **Voice States** は自動でON（デフォルト）
4. **Reset Token** でトークンを発行 → コピーして保存
5. 左メニュー **General Information** を開き **Application ID** をコピーして保存

### 4. Botをサーバーに招待

1. 左メニュー **OAuth2 → URL Generator** を開く
2. **Scopes** で `bot` と `applications.commands` にチェック
3. **Bot Permissions** で以下にチェック
   - `View Channels`
   - `Send Messages`
   - `Connect`
4. 生成されたURLをブラウザで開き、招待するサーバーを選択

### 5. 環境変数の設定

`.env.example` をコピーして `.env` を作成します。

```bash
cp .env.example .env
```

`.env` を開き、以下の値を記入します。

```env
DISCORD_TOKEN=取得したBotトークン
CLIENT_ID=アプリケーションID
GUILD_ID=開発中のサーバーID（本番環境では削除してください）
```

> **GUILD_ID について**
> 設定するとコマンドがそのサーバーのみに即時反映されます（開発向け）。
> 本番環境では削除するとグローバル登録になりますが、反映に最大1時間かかります。

### 6. 起動

**開発時（ホットリロードあり）**

```bash
npm run dev
```

**本番時**

```bash
npm run build
npm start
```

起動後、コンソールに以下が表示されれば成功です。

```
✅ BotName#0000 としてログインしました
📡 ギルドコマンドを登録しました
```

---

## サーバー側の準備：ランクロールの設定

Botはメンバーに付与された**ロール名**からAPEXランクを判定します。
以下のロール名をDiscordサーバーに作成し、各メンバーに付与してください。

| ティア | ロール名 |
|---|---|
| 🔰 Rookie | `Rookie` |
| 🥉 Bronze | `Bronze IV` `Bronze III` `Bronze II` `Bronze I` |
| 🥈 Silver | `Silver IV` `Silver III` `Silver II` `Silver I` |
| 🥇 Gold | `Gold IV` `Gold III` `Gold II` `Gold I` |
| 🔷 Platinum | `Platinum IV` `Platinum III` `Platinum II` `Platinum I` |
| 💎 Diamond | `Diamond IV` `Diamond III` `Diamond II` `Diamond I` |
| 👑 Master | `Master` |
| 🦅 Predator | `Predator` |

> ロール名の大文字・小文字は区別しません（`gold i` でも `Gold I` でも動作します）。
> メンバーに複数のランクロールが付与されている場合は、最も高いランクが使用されます。
> ランクロールが付与されていないメンバーは **Rookie** として計算されます。

---

## コマンド一覧

### `/team [num_teams]`

ボイスチャンネルのメンバーをAPEXランクでバランスよくチーム分けします。

| オプション | 型 | 必須 | デフォルト | 説明 |
|---|---|---|---|---|
| `num_teams` | 整数 | いいえ | `2` | チーム数（2〜10） |

**使用例**

```
/team
```
→ 2チームに振り分けます。

```
/team num_teams:3
```
→ 3チームに振り分けます。

**実行結果イメージ**

```
⚔️ チーム振り分け結果 — General
3チームに分けました（APEXランクによるバランス調整済み）

🏟️ チーム 1（平均スコア: 575）
💎 PlayerA — Diamond I
🥇 PlayerB — Gold III

🏟️ チーム 2（平均スコア: 562）
🔷 PlayerC — Platinum II
🥈 PlayerD — Silver I

🏟️ チーム 3（平均スコア: 550）
🥇 PlayerE — Gold I
🔰 PlayerF — Rookie
```

---

### `/rankcheck`

現在参加中のボイスチャンネルのメンバーとそのAPEXランクをランク順に一覧表示します。

**使用例**

```
/rankcheck
```

**実行結果イメージ**

```
📊 ランク一覧 — General
💎 PlayerA — Diamond I
🔷 PlayerC — Platinum II
🥇 PlayerE — Gold I
🥇 PlayerB — Gold III
🥈 PlayerD — Silver I
🔰 PlayerF — Rookie（未設定）

合計 6 人
```

---

### `/ranks`

Botが認識するAPEXランクロールの一覧を表示します（自分にのみ表示）。
サーバーにロールを作成するときの確認にお使いください。

**使用例**

```
/ranks
```

---

## チーム分けのアルゴリズム

各ランクには内部スコアが設定されており、そのスコアをもとにチームを割り当てます。

| ランク | スコア |
|---|---|
| Rookie | 100 |
| Bronze IV〜I | 200〜275 |
| Silver IV〜I | 300〜375 |
| Gold IV〜I | 400〜475 |
| Platinum IV〜I | 500〜575 |
| Diamond IV〜I | 600〜675 |
| Master | 800 |
| Predator | 1000 |

スコアの高い順にメンバーをソートし、その時点でチーム合計スコアが最も低いチームへ順番に割り当てる**貪欲法**でチームを構成します。これにより各チームの平均スコアが均等になるよう調整されます。

---

## 注意事項

- コマンドは**ボイスチャンネルに参加した状態**で実行してください。
- Botはボイスチャンネルへの参加は不要です。
- ランクロールが付与されていないメンバーはRookieとして扱われます。

---

## ライセンス

MIT
