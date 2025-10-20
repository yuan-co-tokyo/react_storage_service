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

### セットアップ手順（ローカル実行）

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

4. ローカルの PostgreSQL を利用する場合は `./start-database.sh` で起動し、Next.js からアクセスできるよう `DATABASE_URL` をローカルホスト向けに設定します。

5. スキーマ初期化や更新はローカル環境で次のコマンドを実行します。

   ```bash
   npm run db:push
   ```

   ローカル手順ではホストマシン上で Node.js と npm を直接利用する点が Docker 版との主な違いです。

### セットアップ手順（Docker Compose 版）

1. ローカル手順と同様に `.env` を作成し、NextAuth まわりの値を決定します。Docker 版ではこれらの値をコンテナ向けの `config/docker/app.env` に複製する必要があります。

   ```bash
   cp .env.example .env
   # エディタで .env を開き必要な値を設定
   ```

2. Docker 用の環境変数ファイルを作成します。`.env` に設定した `AUTH_SECRET` や Discord クライアント情報は手動で転記し、`POSTGRES_PASSWORD` は任意の安全な値を指定します。NextAuth のコールバック URL は `AUTH_URL` などを利用して `http://localhost:3000/api/auth` を指すように設定してください。

   ```bash
   mkdir -p config/docker
   cat <<'EOF' > config/docker/app.env
   POSTGRES_PASSWORD=<生成したパスワード>
   DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/react_storage_service
   AUTH_SECRET=<.env と同じ値>
   AUTH_DISCORD_ID=<.env と同じ値>
   AUTH_DISCORD_SECRET=<.env と同じ値>
   AUTH_URL=http://localhost:3000/api/auth
   EOF
   ```

   `.env` の内容を使い回す場合は `grep '^AUTH_' .env >> config/docker/app.env` のように追記すると転記漏れを防げます。`DATABASE_URL` はコンテナから接続するためホスト名を `db` に書き換える点に注意してください。

3. 依存コンテナをビルドし起動します。イメージを更新したい場合は `docker compose build --no-cache` を利用してください。

   ```bash
   docker compose build
   docker compose up -d
   ```

4. 初期化時やスキーマ更新時は次のコマンドでマイグレーションを適用します。

   ```bash
   docker compose run --rm app npm run db:push
   ```

   Docker 版ではアプリケーションと PostgreSQL の両方をコンテナで管理するため、ホスト側に Node.js や Postgres を直接インストールする必要がありません。

#### Docker 利用時のトラブルシューティング

- 既存イメージのキャッシュを削除したい場合は `docker compose build --no-cache app` や `docker builder prune` を実行します。
- PostgreSQL の永続ボリュームを初期化したい場合は `docker compose down --volumes` または `docker volume rm react_storage_service_db-data` を実行してください。

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
