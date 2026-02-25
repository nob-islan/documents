# はじめてのOllama

ローカルLLM実行ツール[Ollama](https://docs.ollama.com/)を使います。

## 手順

https://docs.ollama.com/quickstart

- Ollamaをインストールします:

```shell
curl -fsSL https://ollama.com/install.sh | sh
```

- Ollamaを開始します:

```shell
ollama serve > ollama.log 2>&1 &
```

- モデルをpullします:

```shell
ollama pull llama3
```

- 対話モードを開始します:

```shell
ollama run llama3
```
