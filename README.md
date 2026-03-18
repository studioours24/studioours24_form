# 夢のバンドフェス2026 - 申し込みフォーム

GitHub Pages + Google Apps Script で動く完全無料の申し込みフォーム。

## デプロイ手順

### Step 1: Google Apps Script のセットアップ

1. [Google Sheets](https://sheets.google.com) で新しいスプレッドシートを作成
2. メニュー → **拡張機能** → **Apps Script** を開く
3. `gas/Code.gs` の内容をエディタにコピー&ペースト
4. `SITE_URL` を GitHub Pages の URL に書き換える
5. **保存**（Ctrl+S）

### Step 2: GAS の初期セットアップ

1. GAS エディタ上部の関数選択で `setupSheet` を選択
2. **▶ 実行** をクリック
3. 初回は権限の承認が求められるので許可する
4. スプレッドシートに「Applications」シートが作成される

### Step 3: GAS を Web アプリとしてデプロイ

1. GAS エディタ → **デプロイ** → **新しいデプロイ**
2. 種類の選択 → **ウェブアプリ**
3. 設定:
   - 説明: `バンドフェス2026 フォーム API`
   - 次のユーザーとして実行: **自分**
   - アクセスできるユーザー: **全員**
4. **デプロイ** をクリック
5. 表示された **URL をコピー** する

### Step 4: フロントエンドに GAS URL を設定

`script.js` の `CONFIG.GAS_URL` にコピーした URL を貼り付ける:

```javascript
GAS_URL: 'https://script.google.com/macros/s/XXXXX/exec',
```

### Step 5: GitHub Pages にデプロイ

1. GitHub にリポジトリ `studioours24_form` を作成
2. ファイルを push:
   ```bash
   cd /Users/ryo841/Projects/Python/studioours24_form
   git init
   git add index.html style.css script.js
   git commit -m "Initial commit: Band Fes 2026 form"
   git remote add origin https://github.com/YOUR_USERNAME/studioours24_form.git
   git push -u origin main
   ```
3. GitHub → リポジトリ → **Settings** → **Pages**
4. Source: **Deploy from a branch** → Branch: **main** → `/ (root)` → **Save**
5. 数分後に `https://YOUR_USERNAME.github.io/studioours24_form/` でアクセス可能

### Step 6: 動作確認

1. フォームにテストデータを入力して送信
2. 確認メールが届くか確認
3. メール内のリンクをクリック
4. スプレッドシートのステータスが「確認済み」に変わるか確認
5. 管理者メールに通知が届くか確認

## ファイル構成

```
├── index.html    # フォームページ
├── style.css     # スタイルシート
├── script.js     # フォームロジック
├── gas/
│   └── Code.gs   # GAS バックエンド（GASに貼り付ける用）
└── README.md     # この手順書
```

## 注意事項

- `gas/` フォルダは GitHub Pages には不要（GAS に貼り付ける用のコード）
- GAS の再デプロイ時は「新しいデプロイ」ではなく「デプロイを管理」→「編集」
- GAS のメール送信には 1 日 100 通の制限あり（無料アカウント）
