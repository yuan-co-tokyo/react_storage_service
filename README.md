# React Storage Service

Next.js + tRPC を用いたモバイルフレンドリーなメディアストレージ基盤です。Plans.md の要件を基に以下の機能を実装しています。

- 認証ユーザー向けのメディアメタデータ登録フォーム
- 最新メディアのギャラリー表示と公開設定の確認
- 利用容量・残容量を可視化するストレージサマリー
- ストレージ計算ロジックの単体テスト (Node.js Test Runner)

## 開発コマンド

| コマンド | 説明 |
| --- | --- |
| `npm run dev` | 開発サーバーの起動 |
| `npm run build` | 本番ビルド |
| `npm run test` | ストレージ計算ロジックのテスト (コンパイル後に Node.js Test Runner を実行) |
| `npm run check` | Biome による静的解析 |
| `npm run typecheck` | TypeScript 型チェック |

## テスト

`npm run test` は `tsconfig.test.json` を使用してテスト対象コードを一時ディレクトリにコンパイルし、Node.js Test Runner で実行します。生成物は `.test-dist/` に出力され `.gitignore` で除外されています。
