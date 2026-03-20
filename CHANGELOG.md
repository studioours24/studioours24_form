# CHANGELOG — 夢のバンドフェス2026 申し込みフォーム

すべての変更を記録する。変更を加えたら必ずここに追記すること。

---

## 2026-03-20

### ✏️ hero title「2026 夏」に変更
- `index.html`: ヒーローセクションの `hero-title-year` を `2026` → `2026 夏` に変更
- GitHub Pagesにデプロイ済み

---

## 2026-03-18

### 💰 人数単位の料金計算に変更
- `index.html` / `script.js`: 料金計算を人数ベースに変更、スタジオ利用者の人数入力に対応
- `gas/Code.gs`: GAS側も人数ベースの料金計算に対応

### 🔧 確認ページのGAS API直接呼び出し
- `confirm.html`: GitHub Pagesのバナー表示を回避するため、確認ページからGAS APIを直接呼び出す方式に修正

### 📄 メール確認用の確認ページ追加
- `confirm.html`: メール認証リダイレクト用の確認ページを新規作成

### 🎉 初回リリース
- `index.html` / `style.css` / `script.js` / `gas/Code.gs`: 夢のバンドフェス2026 参加申し込みフォーム初回構築
- GitHub Pages + GAS でのフォーム送信・メール確認フロー構築
