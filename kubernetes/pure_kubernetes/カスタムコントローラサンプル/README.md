# カスタムコントローラサンプル

独自リソースを作るためのマニフェストファイルのサンプルです。

cf. https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/

## CRD

Custom Resource Definition です。カスタムリソース自体を定義します。

```yml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: samples.crds.example.nob # <spec.names.plural>.<spec.group>の形式にする
spec:
  group: crds.example.nob # リソースのグループ名 REST APIのパスに使われる
  versions:
    - name: v1
      served: true
      storage: true
      schema:
        openAPIV3Schema:
          type: object
          properties:
            spec:
              type: object
              properties: # リソースに持たせるプロパティ
                nob-property1:
                  type: string
                nob-property2:
                  type: boolean
  scope: Namespaced # リソースのスコープ
  names: # 各種名称
    plural: samples # 複数系
    singular: sample # 単数系
    kind: Sample # kindに指定する文字列
```

## CR

リソース本体です。コントローラが無いため何もできません。

```yml
apiVersion: crds.example.nob/v1 # CRDで設定した<spec.group>および<spec.versions>
kind: Sample # CRDで設定したkind
metadata:
  name: nob-first-cr
spec: # CRDで設定した各種プロパティ
  nob-property1: "nob test"
  nob-property2: true
```
