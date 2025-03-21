# Teamder

チームメイキングをサポートするモバイルアプリケーション

## プロジェクト概要

Teamderは、チームメイキングをサポートするモバイルアプリケーションです。以下の機能を提供します：

- ユーザー認証（AWS Cognito）
- プロフィール設定
- チーム作成・管理
- チームメンバーとのコミュニケーション
- タスク管理

## 技術スタック

- **フロントエンド**
  - React Native
  - Expo
  - TypeScript
  - TailwindCSS

- **バックエンド**
  - AWS Cognito（認証）
  - AWS API Gateway
  - AWS Lambda

## 必要条件

- Node.js (v18以上)
- npm (v9以上)
- Expo CLI
- Git
- Xcode（iOS開発用）
- Android Studio（Android開発用）

## 環境構築手順

### MacOS

1. **Node.jsのインストール**
   ```bash
   # Homebrewを使用してNode.jsをインストール
   brew install node

   # バージョン確認
   node --version  # v18以上であることを確認
   npm --version   # v9以上であることを確認
   ```

2. **Expo CLIのインストール**
   ```bash
   npm install -g expo-cli

   # バージョン確認
   expo --version
   ```

3. **Xcodeのインストールと設定**
   - App StoreからXcodeをインストール
   - Xcodeを起動し、初回セットアップを実行
   - コマンドラインツールのインストール
     ```bash
     xcode-select --install
     ```
   - iOSシミュレータのインストール
     - Xcode > Preferences > Components から必要なシミュレータをインストール

4. **プロジェクトのクローン**
   ```bash
   git clone [リポジトリURL]
   cd project
   ```

5. **依存パッケージのインストール**
   ```bash
   npm install
   ```

6. **環境変数の設定**
   ```bash
   # .env.exampleを.envにコピー
   cp .env.example .env
   
   # .envファイルを編集して必要な値を設定
   # 以下の環境変数を設定してください：
   # - EXPO_PUBLIC_AWS_REGION
   # - EXPO_PUBLIC_COGNITO_USER_POOL_ID
   # - EXPO_PUBLIC_COGNITO_CLIENT_ID
   # - EXPO_PUBLIC_API_GATEWAY_URL
   # - EXPO_PUBLIC_API_KEY
   # - EXPO_PUBLIC_AUTH_TOKEN
   ```

7. **アプリケーションの起動**
   ```bash
   npx expo start
   ```

8. **iOSシミュレータでの実行**
   - XcodeでiOSシミュレータを起動
   - Expoのターミナルで`i`を押してiOSシミュレータで実行
   - または、Expoのターミナルで`r`を押してアプリをリロード
   - デバッグモードの有効化：シミュレータで`Cmd + D`を押す

### Windows

1. **Node.jsのインストール**
   - [Node.js公式サイト](https://nodejs.org/)からインストーラーをダウンロード
   - インストーラーを実行し、指示に従ってインストール
   - バージョン確認
     ```bash
     node --version  # v18以上であることを確認
     npm --version   # v9以上であることを確認
     ```

2. **Expo CLIのインストール**
   ```bash
   npm install -g expo-cli

   # バージョン確認
   expo --version
   ```

3. **Android Studioのインストールと設定**
   - [Android Studio](https://developer.android.com/studio)をダウンロードしてインストール
   - Android SDKのインストール
   - 環境変数の設定
     - ANDROID_HOMEの設定
     - Pathにplatform-toolsを追加
   - Androidエミュレータの作成
     - Tools > Device Managerから新しいエミュレータを作成

4. **プロジェクトのクローン**
   ```bash
   git clone [リポジトリURL]
   cd project
   ```

5. **依存パッケージのインストール**
   ```bash
   npm install
   ```

6. **環境変数の設定**
   ```bash
   # .env.exampleを.envにコピー
   copy .env.example .env
   
   # .envファイルを編集して必要な値を設定
   # 以下の環境変数を設定してください：
   # - EXPO_PUBLIC_AWS_REGION
   # - EXPO_PUBLIC_COGNITO_USER_POOL_ID
   # - EXPO_PUBLIC_COGNITO_CLIENT_ID
   # - EXPO_PUBLIC_API_GATEWAY_URL
   # - EXPO_PUBLIC_API_KEY
   # - EXPO_PUBLIC_AUTH_TOKEN
   ```

7. **アプリケーションの起動**
   ```bash
   npx expo start
   ```

8. **Androidエミュレータでの実行**
   - Android StudioでAndroidエミュレータを起動
   - Expoのターミナルで`a`を押してAndroidエミュレータで実行
   - または、Expoのターミナルで`r`を押してアプリをリロード
   - デバッグモードの有効化：エミュレータで`Ctrl + M`を押す

## 実機での実行手順

### iOS実機での実行

1. **Expo Goアプリのインストール**
   - App Storeから「Expo Go」アプリをインストール
   - Apple IDでサインイン

2. **開発用証明書の設定**
   - XcodeでApple Developerアカウントを設定
   - プロジェクトのBundle Identifierを設定
   - 開発用証明書とプロビジョニングプロファイルを設定

3. **アプリケーションの実行**
   ```bash
   # 開発サーバーを起動
   npx expo start
   ```
   - 表示されるQRコードをiPhoneのカメラで読み取る
   - または、Expo Goアプリで「URLを開く」を選択し、表示されるURLを入力

4. **デバッグ設定**
   - デバイスをMacとUSBケーブルで接続
   - Xcodeでデバイスを選択
   - デバッグメニュー: デバイスをシェイクする
   - リロード: デバイスをシェイクして「Reload」を選択

### Android実機での実行

1. **Expo Goアプリのインストール**
   - Google Play Storeから「Expo Go」アプリをインストール
   - Googleアカウントでサインイン

2. **開発者オプションの有効化**
   - 設定 > 端末情報 > ビルド番号を7回タップ
   - 開発者オプションが有効化される
   - 開発者オプション > USBデバッグを有効化

3. **アプリケーションの実行**
   ```bash
   # 開発サーバーを起動
   npx expo start
   ```
   - 表示されるQRコードをExpo Goアプリで読み取る
   - または、Expo Goアプリで「URLを開く」を選択し、表示されるURLを入力

4. **USBデバッグの設定**
   - デバイスをPCとUSBケーブルで接続
   - デバイスで「USBデバッグを許可」をタップ
   - `adb devices`でデバイスが認識されていることを確認
   - デバッグメニュー: デバイスをシェイクする
   - リロード: デバイスをシェイクして「Reload」を選択

### 実機での実行時の注意事項

1. **ネットワーク設定**
   - 開発用PCと実機が同じWiFiネットワークに接続されていることを確認
   - ファイアウォールの設定でExpoのポートが開放されていることを確認

2. **パフォーマンス最適化**
   - 開発モードではパフォーマンスが低下する可能性があります
   - 必要に応じて`expo start --release`でリリースモードで実行

3. **デバッグ機能**
   - 実機では一部のデバッグ機能が制限される場合があります
   - 開発者メニューから「Debug Remote JS」を有効化すると、Chrome DevToolsでデバッグ可能

4. **エラー対処**
   - アプリが起動しない場合：
     - Expo Goアプリを再起動
     - 開発サーバーを再起動
     - デバイスを再起動
   - ネットワークエラーの場合：
     - WiFi接続を確認
     - ファイアウォール設定を確認
     - VPNを使用している場合は一時的に無効化

5. **セキュリティ**
   - 開発用の証明書は安全に管理
   - 本番環境用の証明書は別途管理
   - 機密情報は適切に保護

## 開発時の注意事項

- `.env`ファイルはGitにコミットしないでください
- 本番環境の認証情報は安全な方法で管理してください
- 開発中は`npm run dev`を使用して開発サーバーを起動できます
- コードの変更は自動的にホットリロードされます
- デバッグ時は開発者メニューを活用してください

## デバッグ方法

### iOSシミュレータ
- デバッグメニュー: `Cmd + D`
- リロード: `Cmd + R`
- デベロッパーメニュー: `Cmd + D`を長押し

### Androidエミュレータ
- デバッグメニュー: `Ctrl + M`
- リロード: `R`キーを2回押す
- デベロッパーメニュー: `Ctrl + M`を長押し

## トラブルシューティング

### よくある問題と解決方法

1. **Expoの起動に失敗する場合**
   ```bash
   # キャッシュをクリアして再起動
   npx expo start -c
   ```

2. **依存パッケージのインストールに失敗する場合**
   ```bash
   # node_modulesを削除して再インストール
   rm -rf node_modules
   npm install
   ```

3. **環境変数が読み込まれない場合**
   - `.env`ファイルが正しい場所にあることを確認
   - アプリケーションを再起動
   - 環境変数の名前が正しいことを確認

4. **iOSシミュレータが起動しない場合**
   - Xcodeが最新版であることを確認
   - シミュレータをXcodeから直接起動してみる
   - `xcrun simctl list devices`で利用可能なシミュレータを確認

5. **Androidエミュレータが起動しない場合**
   - Android Studioが最新版であることを確認
   - エミュレータをAndroid Studioから直接起動してみる
   - `adb devices`でデバイスの接続状態を確認

## コーディング規約

- TypeScriptの厳格モードを使用
- コンポーネントは関数コンポーネントを使用
- スタイリングはTailwindCSSを使用
- ファイル名はPascalCase
- コンポーネント名はPascalCase
- 変数名はcamelCase

## ライセンス

このプロジェクトは[MITライセンス](LICENSE)の下で公開されています。