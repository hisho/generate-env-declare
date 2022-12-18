# @hisho/generate-env-declare

.env.exampleと.env.localを比較して.env.localの変数を型定義として出力するするscript

## Install

```shell
$ npm i -D @hisho/generate-env-declare
# or
$ yarn add -D @hisho/generate-env-declare
```

## Feature

1. .env.exampleと.env.localを比較して.env.localに値がない場合にconsoleエラーを吐く
2. .env.exampleと.env.localを比較して.env.localに不要な値がある場合にconsoleエラーを吐く
3. `-w`または`--watch`をつけるとファイルを監視する
4. .env.exampleと.env.localを比較して.env.localある変数をenv.d.tsとし出力する

## Usage

### 1. package.json の scripts に以下を追加する

```json
{
  "scripts": {
    "watch:generate-env-declare": "generate-env-declare --watch",
    "build:generate-env-declare": "generate-env-declare"
  }
}
```

### 2. .gitignoreにenv.d.tsを追記する
```gitignore
# generate
env.d.ts
```

### 3. tsconfig.jsonのincludeに追記する
```json
{
  "include": ["env.d.ts"]
}
```

## TODO

- オプションを受け取れるようにする
- Testを書く