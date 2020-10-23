<h1 align="center">TopDomainChecker</h1>

<p align="center">
  <a href="https://github.com/P2P-Develop/TopDomainChecker/blob/main/package.json" target="_blank">
    <img alt="Version" src="https://img.shields.io/github/package-json/v/P2P-Develop/TopDomainChecker?style=flat-square">
  </a>
  <a href="https://github.com/P2P-Develop/tree/main/docs" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg?style=flat-square" />
  </a>
  <a href="https://github.com/P2P-Develop/TopDomainChecker/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=flat-square" />
  </a>
  <a href="LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/P2P-Develop/TopDomainChecker?style=flat-square" />
  </a>
</p>

> Brute-force the top-level domains with *parallel*.

日本語は[こちら](docs/README-ja.md)。

## Description

Brute-force the top-level domains with automated parallelism.  
Makes the most of the Promises and brute-force it with multiple jobs.  
Verify the existence of the host using ICMP echo.  
The top-level domains are getting the latest list from [IANA](https://data.iana.org/TLD/tlds-alpha-by-domain.txt).

## Installation

1. Clone this project.

   In HTTPS:

   ```bash
   $ git clone https://github.com/P2P-Develop/TopDomainChecker
   ```

   In SSH:

   ```bash
   $ git clone git@github.com:P2P-Develop/TopDomainChecker
   ```

   In [Github CLI](https://github.com/cli/cli):

   ```bash
   $ gh repo clone P2P-Develop/TopDomainChecker
   ```

2. Install dependencies.

   ```bash
   $ npm i
   ```

3. Run the npm script `start`.

   ```bash
   $ npx ts-node src/index.ts -[vVhqD] [-t <Additional top-level domains...>] [-d] <Domains...>
   ```

<!--
This project can be installed from [npm](https://npmjs.com/package/tldcheck).

```sh
$ npm i -g tldcheck
```
-->

## Usage

```sh
$ tldcheck -[vVhqD] [-t <Additional top-level domains...>] [-d] <Domains...>
```

<!--
## Run tests

```sh
$ npm test
```
-->

## 🤝 Contributing

Contributions, issues and feature requests are welcome!  
Feel free to check [issues page](https://github.com/P2P-Develop/TopDomainChecker/issues). You can also take a look at the [contributing guide](docs/CONTRIBUTING.md).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

© 2020 [P2P-Develop](https://github.com/P2P-Develop).  
This project is [MIT](LICENSE) licensed.
