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

`kubectl apply -f {ファイル名}`で CRD を登録した後、`kubectl describe crd {metadata.name}`で詳細を確認できます:

```
$ kubectl describe crd samples.crds.example.nob
Name:         samples.crds.example.nob
Namespace:
Labels:       <none>
Annotations:  <none>
API Version:  apiextensions.k8s.io/v1
Kind:         CustomResourceDefinition
Metadata:
  Creation Timestamp:  2025-01-26T09:03:39Z
  Generation:          1
  Resource Version:    67443
  UID:                 a7381356-9dc2-46df-98cb-42819a5bd6cf
Spec:
  Conversion:
    Strategy:  None
  Group:       crds.example.nob
  Names:
    Kind:       Sample
    List Kind:  SampleList
    Plural:     samples
    Singular:   sample
  Scope:        Namespaced
  Versions:
    Name:  v1
    Schema:
      openAPIV3Schema:
        Properties:
          Spec:
            Properties:
              nob-property1:
                Type:  string
              nob-property2:
                Type:  boolean
            Type:      object
        Type:          object
    Served:            true
    Storage:           true
Status:
  Accepted Names:
    Kind:       Sample
    List Kind:  SampleList
    Plural:     samples
    Singular:   sample
  Conditions:
    Last Transition Time:  2025-01-26T09:03:39Z
    Message:               no conflicts found
    Reason:                NoConflicts
    Status:                True
    Type:                  NamesAccepted
    Last Transition Time:  2025-01-26T09:03:39Z
    Message:               the initial names have been accepted
    Reason:                InitialNamesAccepted
    Status:                True
    Type:                  Established
  Stored Versions:
    v1
Events:  <none>
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

`kubectl apply -f {ファイル名}`でリソースを作成した後、`kubectl describe {kind} {リソース名}`で詳細を確認できます:

```
$ kubectl describe sample nob-first-cr
Name:         nob-first-cr
Namespace:    default
Labels:       <none>
Annotations:  <none>
API Version:  crds.example.nob/v1
Kind:         Sample
Metadata:
  Creation Timestamp:  2025-01-26T09:03:43Z
  Generation:          1
  Resource Version:    67451
  UID:                 35f3e3a1-db89-4a7f-b975-448b7a254034
Spec:
  nob-property1:  nob test
  nob-property2:  true
Events:           <none>
```
