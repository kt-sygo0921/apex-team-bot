# apex-team-bot — Claude向けコンテキスト

## プロジェクト概要

Apex Legends のランクに基づいてDiscordのVCメンバーを自動でバランスよくチーム分けするDiscord Bot。
言語は日本語。Node.js + TypeScript + discord.js 14 で構成。

## よく使うコマンド

```bash
npm run dev      # 開発起動（tsx watch、ホットリロード）
npm run build    # TypeScriptコンパイル → dist/
npm start        # 本番起動（dist/index.js）
npm test         # Jestテスト実行
```

## 環境変数（.env）

```
DISCORD_TOKEN   # Botトークン（必須）
CLIENT_ID       # Discord アプリケーションID（必須）
GUILD_ID        # ギルドID（任意・設定するとコマンドが即時反映される開発モードになる）
```

## ディレクトリ構成

```
src/
├── index.ts              # エントリーポイント。Clientの初期化、コマンド登録・ルーティング
├── ranks.ts              # APEX_RANKS（スコア定義）、RANK_TIERS（絵文字）、getRankEmoji()
├── teamBalancer.ts       # getMemberRank()、balanceTeams()、calcTeamScore()
└── commands/
    ├── team.ts           # /team コマンド（メイン機能）
    ├── rankcheck.ts      # /rankcheck コマンド（VC内メンバーのランク一覧）
    └── ranks.ts          # /ranks コマンド（対応ランクロール一覧表示）
src/__tests__/
    ├── ranks.test.ts          # APEX_RANKSの定義テスト（23件）
    └── teamBalancer.test.ts   # getMemberRank / balanceTeams / calcTeamScore のテスト（15件）
```

## アーキテクチャ

### コマンドの追加方法

1. `src/commands/<name>.ts` を作成し `data`（SlashCommandBuilder）と `execute` をexport
2. `src/index.ts` でimportして `commands` 配列に追加

### チーム分けアルゴリズム（`teamBalancer.ts`）

1. プレイヤーをFisher-Yatesアルゴリズムでシャッフル（毎回異なる結果のため）
2. スコア降順でソート
3. 各プレイヤーを「現在の合計スコアが最小のチーム」に割り当てる（貪欲法）

同スコアのプレイヤーはシャッフルされるため、同じメンバー・同じ設定でも毎回異なるチーム構成になる。

### ランクスコア体系（`ranks.ts`）

| ランク | スコア範囲 |
|--------|----------|
| Rookie | 100 |
| Bronze IV〜I | 200〜275 |
| Silver IV〜I | 300〜375 |
| Gold IV〜I | 400〜475 |
| Platinum IV〜I | 500〜575 |
| Diamond IV〜I | 600〜675 |
| Master | 800 |
| Predator | 1000 |

- ランクロール未設定のメンバーはRookie（100）として扱う（`isEstimated: true`）
- 複数ランクロールがある場合は最高スコアのみ採用

## 重要な実装上の注意

- **ESM**: `package.json` に `"type": "module"` があるため、import文には `.js` 拡張子が必要
- **Bot Intents**: `Guilds`, `GuildMembers`, `GuildVoiceStates` の3つが必要。これ以外を追加する場合はDiscord Developer Portalでも有効化が必要
- **コマンド登録タイミング**: `GUILD_ID` あり→起動時に即時反映、なし→グローバル登録（最大1時間）
- **テスト環境**: Jest + ts-jest + ESM の組み合わせのため `--experimental-vm-modules` フラグが必要（package.jsonに設定済み）
- **エラーメッセージ**: 全てのユーザー向けメッセージは日本語

## テストの書き方

`GuildMember` のモックは `teamBalancer.test.ts` の `makeMember()` / `makePlayer()` パターンを踏襲する。

```typescript
function makeMember(roleNames: string[]) {
  return {
    roles: { cache: new Map(roleNames.map(name => [name, { name }])) },
  } as any;
}
```
