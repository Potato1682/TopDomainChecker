<h1 align="center">TopDomainChecker</h1>

<p align="center">
  <a href="https://github.com/P2P-Develop/TopDomainChecker/blob/develop/package.json" target="_blank">
    <img alt="Version" src="https://img.shields.io/github/package-json/v/P2P-Develop/TopDomainChecker?style=flat-square">
  </a>
  <a href="https://github.com/P2P-Develop/tree/develop/docs" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg?style=flat-square" />
  </a>
  <a href="https://github.com/P2P-Develop/TopDomainChecker/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=flat-square" />
  </a>
  <a href="LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/P2P-Develop/TopDomainChecker?style=flat-square" />
  </a>
</p>

> 並列でトップレベルドメインを総当たりします。

[Here](https://github.com/P2P-Develop/TopDomainChecker/blob/develop/README.md) is an English documentation.

## Description

自動化された並列処理を使用してトップレベルドメインを総当たりします。  
Promise をうまく活用し複数の処理を一度に行っています。  
サーバー生存確認には ICMP エコーを用いています。  
トップレベルドメインの一覧の取得には[IANA](https://data.iana.org/TLD/tlds-alpha-by-domain.txt)から最新の情報を入手しています。

## インストール方法

1. このプロジェクトをクローンします。

   HTTPS:

   ```bash
   $ git clone https://github.com/P2P-Develop/TopDomainChecker
   ```

   SSH:

   ```bash
   $ git clone git@github.com:P2P-Develop/TopDomainChecker
   ```

   [Github CLI](https://github.com/cli/cli):

   ```bash
   $ gh repo clone P2P-Develop/TopDomainChecker
   ```

2. 依存しているパッケージをインストールします。

   ```bash
   $ npm i
   ```

3. npm スクリプト `start` を実行します。

   ```bash
   $ npx ts-node src/index.ts -[vVhqD] [-t <Additional top-level domains...>] [-d] <Domains...>
   ```

<!--
このプロジェクトは[npm](https://npmjs.com/package/tldcheck)からインストールすることができます。

```sh
$ npm i -g tldcheck
```
-->

## 使い方

```sh
$ tldcheck -[vVhqD] [-t <Additional top-level domains...>] [-d] <Domains...>
```

<!--
## テストの実行

```sh
$ npm test
```
-->

## 🤝 貢献

貢献や Issue、新機能のリクエストは大歓迎です！  
[Issues](https://github.com/P2P-Develop/TopDomainChecker/issues) をチェックしても構いません。  
[貢献ガイド](https://github.com/P2P-Develop/TopDomainChecker/blob/develop/docs/CONTRIBUTING.md)も是非読んでください。

## あなたのサポートを明示

もしこのプロジェクトがあなたをお助けできた場合は ⭐️ を是非お願いします！

## 📝 ライセンス

© 2020 [P2P-Develop](https://github.com/P2P-Develop).  
このプロジェクトは [MIT](https://github.com/P2P-Develop/TopDomainChecker/blob/develop/LICENSE) ライセンスに準拠しています。
