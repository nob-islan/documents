# tex サンプル

VSCode 上で tex を書くための環境構築サンプルです。

## ディレクトリ構成

```
tex/
  ├─.devcontainer/
  │    ├─devcontainer.json
  │    ├─Dockerfile
  │    └─tex-install.exp
  └─.vscode/
       └─settings.json
```

## 設定ファイル

各種設定ファイルの内容と概要を記載します。

### devcontainer.json

後述の`Dockerfile`を元にコンテナを作成します。コンテナ起動時、`tex-install.exp`を実行して tex のインストールを行います。また、LaTex Workshop の拡張機能をインストールすることで、VSCode 上で容易に tex の操作ができます。

```json
{
  "name": "tex",
  "onCreateCommand": "expect -f /workspaces/tex/.devcontainer/tex-install.exp",
  "build": {
    "dockerfile": "Dockerfile"
  },
  "features": {},
  "customizations": {
    "vscode": {
      "extensions": ["james-yu.latex-workshop"]
    }
  }
}
```

### Dockerfile

ubuntu をベースにコンテナを構築します。`expect`コマンドは tex のインストールに使用します。

```Dockerfile
FROM ubuntu:latest

RUN apt update && apt install -y expect
```

### tex-install.exp

コンテナ起動時に tex 関連のパッケージをインストールします。TimeZone などを対話形式で設定する必要があるので`expect`コマンドを使用しています。

```shell
#!/usr/bin/expect -f

spawn apt install -y texlive-latex-recommended texlive-latex-extra texlive-fonts-recommended texlive-fonts-extra texlive-lang-japanese texlive-lang-cjk texlive-extra-utils
expect "Geographic area:"
send "6\n"
expect "Time zone:"
send "79\n"
interact
```

### settings.json

tex ファイルをコンパイルするための設定、およびプレビューの外観に関する設定を記載しています。

```json
{
  // LaTeX
  "latex-workshop.intellisense.package.enabled": true,
  //latexmkのビルドレシピ
  "latex-workshop.latex.recipes": [
    {
      "name": "ptex2pdf (uplatex)",
      "tools": ["ptex2pdf (uplatex)", "ptex2pdf (uplatex)"]
    }
  ],
  //latexmkのビルドツール
  "latex-workshop.latex.tools": [
    {
      "name": "ptex2pdf (uplatex)",
      "command": "ptex2pdf",
      "args": [
        "-interaction=nonstopmode",
        "-l",
        "-u",
        "-ot",
        "-kanji=utf8 -synctex=1",
        "%DOC%"
      ]
    },
    {
      "name": "pbibtex",
      "command": "pbibtex",
      "args": ["%DOCFILE%"]
    }
  ],
  // 外観設定
  "latex-workshop.view.pdf.color.dark.pageColorsBackground": "#1f1f1f",
  "latex-workshop.view.pdf.color.dark.pageColorsForeground": "#d3d3d3"
}
```

## tex ファイルサンプル

環準同型定理に関する証明を書いています。

```tex
\documentclass[a4paper]{article}

\usepackage{amsthm}

% Theorem environment
\newtheorem{theorem}{Theorem}
\newtheorem{lemma}{Lemma}

% Title
\title{For the first \TeX{} with VSCode}
\author{Nobuhiro Higuchi}
\date{2024/02/11}

% document
\begin{document}

\maketitle

\begin{abstract}
    This is a sample of a tex file to write an article in VSCode.
    In this paper, we will show \it{fundamental homomorphism theorem}.
\end{abstract}

\section{Notation}\label{sec:notation}

In this section, we prepare some notations used in this paper.

Let $A$ and $B$ be rings, and let $\varphi: A \to B$ be a homomorphism of rings.
We denote by $\rm ker \, \varphi$ the kernel of the homomorphism $\varphi$,
i.e., $\rm ker \, \varphi$ is the subring of $A$ characterized by the property:
$a \in A$ belongs to $\rm ker \, \varphi$ if and only if $\varphi(a) = 0$.
Moreover, let $\rm im \, \varphi$ denote the image of homomorphism.
Note that an element $b$ of $B$ belongs to $\rm im \, \varphi$
if and only if there exists an element $a$ of $A$ such that $\varphi(a) = b$.

\section{Claim}\label{sec:claim}

In this section, we prove fundamental homomorphism theorem.
The notation is same as Section~\ref{sec:notation}.

\begin{theorem}\label{thm:fundamental_homomorphism_theorem}
    For the homomorphism $\varphi: A \to B$, we have the canonical isomorphism
    $$A / \rm ker \, \varphi \simeq \rm im \, \varphi.$$
\end{theorem}

\begin{proof}
    We define a homomorphism $\Phi: A / \rm ker \, \varphi \to \rm im \, \varphi$ by
    $\Phi(\alpha) = \varphi(a)$, where $a$ is an element of $A$ satisfying $\bar{a} = \alpha$.
    First, let us show that this homomorphism is well-defined.
    Let $a'$ be an element of $A$ which satisfies that $\bar{a'} = \alpha$.
    We have then $\varphi(a) = \varphi(a')$ since $a - a'$ belongs to $\rm ker \, \varphi$,
    and since $\varphi$ is a homomorphism.

    For surjectively, we fix an element $b$ of $\rm im \, \varphi$.
    We have then an element $a$ of $A$ such that $\varphi(a) = b$.
    This $a$ satisfies $\varphi(\bar{a}) = b$.
    Hence we see that $\Phi(\alpha) = b$ for the element $\alpha$ with $\bar{a} = \alpha$.

    For injectively, let us show that $\rm ker \, \Phi = 0$.
    Fix an element $\alpha$ of $\rm ker \, \Phi$.
    We have then $\varphi(a) = 0$ for an element $a \in A$ satisfying $\Psi(\alpha) = \varphi(a)$.
    It implies that $\rm ker \, \varphi$ contains $a$, and hence $\alpha = 0$.
\end{proof}

\end{document}
```
