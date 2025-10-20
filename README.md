# React Storage Service

Next.js + tRPC を用いたモバイルフレンドリーなメディアストレージ基盤です。Plans.md の要件を基に以下の機能を実装しています。

- 認証ユーザー向けのメディアメタデータ登録フォーム
- 最新メディアのギャラリー表示と公開設定の確認
- 利用容量・残容量を可視化するストレージサマリー
- ストレージ計算ロジックの単体テスト (Node.js Test Runner)

## 開発環境のセットアップ

### 前提条件

- Node.js 20.x 以上（Next.js 15 の公式要件は Node.js 18.17 以上）
- npm 11.6.0（`package-lock.json` に記載されたバージョンを推奨）
- Docker Desktop または Podman（ローカル PostgreSQL を起動する場合）
- OpenSSL 1.1 以上（`start-database.sh` でランダムパスワードを生成する際に利用）

### セットアップ手順

1. リポジトリをクローンし、作業ディレクトリに移動します。

   ```bash
   git clone <repository-url>
   cd react_storage_service
   ```

2. 環境変数を設定します。`.env.example` を `.env` にコピーし、NextAuth のシークレットや Discord クライアント情報、`DATABASE_URL` を環境に合わせて編集してください。`AUTH_SECRET` は `npx auth secret` で生成できます。

   ```bash
   cp .env.example .env
   # エディタで .env を開き必要な値を設定
   ```

3. 依存パッケージをインストールします。

   ```bash
   npm install
   ```

4. Docker Compose を利用する場合は、`config/docker/app.env` を作成し以下の値を設定します。`POSTGRES_PASSWORD` は任意の安全な文字列を使用してください。

   ```bash
   mkdir -p config/docker
   cat <<'EOF' > config/docker/app.env
   POSTGRES_PASSWORD=<生成したパスワード>
   DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/react_storage_service
   AUTH_SECRET=<npx auth secret で生成した値>
   AUTH_DISCORD_ID=<Discord クライアント ID>
   AUTH_DISCORD_SECRET=<Discord クライアント Secret>
   EOF
   ```

5. Compose でアプリケーションと PostgreSQL を起動します。

   ```bash
   docker compose up -d
   ```

6. 初期化時やスキーマ更新時は次のコマンドでマイグレーションを適用します。

   ```bash
   docker compose run --rm app npm run db:push
   ```

   Compose を利用しない場合は、従来どおり `./start-database.sh` でデータベースを起動し、`npm run db:push` でスキーマを反映できます。

## 開発サーバーの起動

セットアップ完了後、Next.js の開発サーバーを以下で起動します。

```bash
npm run dev
```

デフォルトでは `http://localhost:3000` でフロントエンドにアクセスできます。環境変数やスキーマを変更した場合はサーバーを再起動してください。

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
