# kubebuilder プロジェクトセットアップ

[kubebuilder](https://github.com/kubernetes-sigs/kubebuilder) を使って実装するカスタムコントローラープロジェクトのセットアップ方法について記載します。

## 環境構築

下記設定で構築した Kubernetes クラスタ環境でのコントローラー開発を前提とします。

- devcontainer.json

```json
{
  "name": "Kubebuilder",
  "build": {
    "dockerfile": "Dockerfile"
  },
  "features": {
    "ghcr.io/devcontainers/features/docker-in-docker:2": {},
    "ghcr.io/devcontainers-extra/features/kubectl-asdf:2": {},
    "ghcr.io/mpriscella/features/kind:1": {}
  },
  "customizations": {
    "vscode": {
      "settings": {
        "editor.formatOnSave": true,
        "[go]": {
          "editor.formatOnSave": true,
          "editor.rulers": [100]
        },
        "[yaml]": {
          "editor.defaultFormatter": "esbenp.prettier-vscode"
        }
      },
      "extensions": [
        "golang.go",
        "ms-kubernetes-tools.vscode-kubernetes-tools",
        "esbenp.prettier-vscode"
      ]
    }
  }
}
```

- Dockerfile

```Dockerfile
FROM mcr.microsoft.com/devcontainers/go:1.24-bullseye

# kubebuilderインストール
RUN curl -L -o kubebuilder "https://github.com/kubernetes-sigs/kubebuilder/releases/download/v4.9.0/kubebuilder_linux_arm64"
RUN chmod +x ./kubebuilder
RUN mv ./kubebuilder /usr/local/bin/kubebuilder
```

- kubebuilder-cluster.yaml

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
  - role: worker
  - role: worker
```

## プロジェクト作成

- プロジェクトを初期化します。

```shell
# mkdir {controller名} && cd {controller名}
mkdir nob-controller && cd nob-controller
# kubebuilder init --domain {APIのドメイン} --repo {リポジトリパス}
kubebuilder init --domain example.nob --repo example.nob/nob-controller
```

- API オブジェクトおよびコントローラのテンプレートを作成します。

```shell
# kubebuilder create api --group {APIグループ} --version {バージョン} --kind {リソース種別}
kubebuilder create api --group nobcontroller --version v1 --kind Nob
```

## 実装

Deployment リソースを管理する `Nob` のコントローラーを実装します。

### api/v1/nob_types.go

カスタムリソースの Spec および Status を定義します。変更後は `make` コマンドを実行して他ファイルの再生成をしてください。

```go
// NobSpec defines the desired state of Nob
type NobSpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// +kubebuilder:validation:Required
	// +kubebuilder:validation:Format:=string

	// Nob配下となるDeploymentの名称
	DeploymentName string `json:"deploymentName"`

	// +kubebuilder:validation:Required
	// +kubebuilder:validation:Minimum=0

	// Nob配下となるReplicaの数
	Replicas *int32 `json:"replicas"`
}

// NobStatus defines the observed state of Nob.
type NobStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// +optional
	// deployment.status.availableReplicasに相当
	AvailableReplicas int32 `json:"availableReplicas"`
}
```

### internal/controller/nob_controller.go

Reconcile を行うコントローラー本体を実装します。

- Reconciler の構造体を定義します。

```go
// NobReconciler reconciles a Nob object
type NobReconciler struct {
	client.Client
	Log      logr.Logger
	Scheme   *runtime.Scheme
	Recorder record.EventRecorder
}
```

- RBAC Marker を追記します。

```go
// +kubebuilder:rbac:groups=nobcontroller.example.nob,resources=nobs,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=nobcontroller.example.nob,resources=nobs/status,verbs=get;update;patch
// +kubebuilder:rbac:groups=nobcontroller.example.nob,resources=nobs/finalizers,verbs=update
// +kubebuilder:rbac:groups=apps,resources=deployments,verbs=get;list;watch;create;update;delete
// +kubebuilder:rbac:groups="",resources=events,verbs=create;patch
```

- SetUpWithManager を定義します。

```go
// SetupWithManager sets up the controller with the Manager.
func (r *NobReconciler) SetupWithManager(mgr ctrl.Manager) error {

	// NobがDeploymentを監視するよう設定
	return ctrl.NewControllerManagedBy(mgr).
		For(&nobcontrollerv1.Nob{}).
		Owns(&appsv1.Deployment{}). // 	import appsv1 "k8s.io/api/apps/v1"
		Owns(&corev1.Service{}).    // 	import corev1 "k8s.io/api/core/v1"
		Complete(r)
}
```

- クリーンアップ関数を定義します。Nob リソースへの変更が入るなどして古くなった Deployment を検知して削除します。

```go
// Nob resourceによって作成され、かつnob.spec配下と名前が一致しないDeploymentを削除します。
func (r *NobReconciler) cleanupOwnedResources(
	ctx context.Context,
	log logr.Logger,
	nob *nobcontrollerv1.Nob,
) error {
	log.Info("finding existing Deployment for Nob resource")

	// Nobが管理するDeploymentを取得
	var deployments appsv1.DeploymentList
	if err := r.List(
		ctx,
		&deployments,
		client.InNamespace(nob.Namespace),
		client.MatchingLabels(map[string]string{"app": "nginx", "controller": nob.Name}),
	); err != nil {
		return err
	}

	// nob.spec.deploymentNameに一致しない古いDeploymentを削除
	for _, deployment := range deployments.Items {
		if deployment.Name == nob.Spec.DeploymentName {
			continue
		}

		// 古いDeploymentを削除
		if err := r.Delete(ctx, &deployment); err != nil {
			log.Error(err, "failed to delete Deployment resource")
			return err
		}

		log.Info("delete deployment resource: " + deployment.Name)
		r.Recorder.Eventf(
			nob,
			corev1.EventTypeNormal,
			"Deleted",
			"Deleted deployment %q",
			deployment.Name,
		)
	}

	return nil
}
```

- Reconcile 関数を実装します。

```go
func (r *NobReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	log := r.Log.WithValues("nob", req.NamespacedName)

	// Nob Object取得
	var nob nobcontrollerv1.Nob
	log.Info("fetching Nob resource")
	if err := r.Get(ctx, req.NamespacedName, &nob); err != nil {
		log.Error(err, "unable to fetch Nob")
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}

	// 古いDeploymentが存在したらクリーンナップ
	if err := r.cleanupOwnedResources(ctx, log, &nob); err != nil {
		log.Error(err, "failed to clean up old Deployment resources for this Nob")
		return ctrl.Result{}, err
	}

	// Deploymentに付与するラベルを作成
	labels := map[string]string{
		"app":        "nginx",
		"controller": req.Name,
	}

	// Deploymentテンプレート作成
	deploy := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      nob.Spec.DeploymentName,
			Namespace: req.Namespace,
			Labels:    labels,
		},
	}

	// Deploymentを新規作成または更新
	if _, err := ctrl.CreateOrUpdate(ctx, r.Client, deploy, func() error {

		// nob.specからReplicasをセット
		replicas := int32(1)
		if nob.Spec.Replicas != nil {
			replicas = *nob.Spec.Replicas
		}
		deploy.Spec.Replicas = &replicas

		// spec.selectorにlabelsをセット
		if deploy.Spec.Selector == nil {
			deploy.Spec.Selector = &metav1.LabelSelector{MatchLabels: labels} // import metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
		}

		// template.objectMetaにlabelsをセット
		if deploy.Spec.Template.ObjectMeta.Labels == nil {
			deploy.Spec.Template.ObjectMeta.Labels = labels
		}

		// containersを作成
		containers := []corev1.Container{
			{
				Name:  "nginx",
				Image: "nginx:latest",
				Ports: []corev1.ContainerPort{
					{
						Name:          "nginx-port",
						ContainerPort: 80,
					},
				},
			},
		}

		// template.spec.containersにcontainersをセット
		if deploy.Spec.Template.Spec.Containers == nil {
			deploy.Spec.Template.Spec.Containers = containers
		}

		// nobを親とするようリファレンスを設定
		if err := ctrl.SetControllerReference(&nob, deploy, r.Scheme); err != nil {
			log.Error(err, "unable to set ownerReference from Nob to Deployment")
			return err
		}

		// ctrl.CreateOrUpdate終了
		return nil

	}); err != nil {
		log.Error(err, "unable to ensure deployment is correct")
		return ctrl.Result{}, err
	}

	// Nobが管理するDeploymentを取得
	var deployment appsv1.Deployment
	var deploymentNamespacedName = client.ObjectKey{
		Namespace: req.Namespace,
		Name:      nob.Spec.DeploymentName,
	}
	if err := r.Get(ctx, deploymentNamespacedName, &deployment); err != nil {
		log.Error(err, "unable to fetch Deployment")
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}

	// NobのStatusが最適化されていれば何もせずreturn
	if nob.Status.AvailableReplicas == deployment.Status.AvailableReplicas {
		return ctrl.Result{}, nil
	}

	// NobのStatusを更新
	nob.Status.AvailableReplicas = deployment.Status.AvailableReplicas
	if err := r.Status().Update(ctx, &nob); err != nil {
		log.Error(err, "unable to update Nob status")
		return ctrl.Result{}, err
	}

	// nob.status更新のイベントを登録
	r.Recorder.Eventf(
		&nob,
		corev1.EventTypeNormal,
		"Updated",
		"Update nob.status.availableReplicas: %d",
		nob.Status.AvailableReplicas,
	)

	return ctrl.Result{}, nil
}
```

### cmd/main.go

Reconciler のメンバを追加します:

```go
	if err = (&controller.NobReconciler{ // nob_controller.goの定義に合わせて追記
		Client:   mgr.GetClient(),
		Log:      ctrl.Log.WithName("controllers").WithName("Nob"),
		Scheme:   mgr.GetScheme(),
		Recorder: mgr.GetEventRecorderFor("nob-controller"),
	}).SetupWithManager(mgr); err != nil {
		setupLog.Error(err, "unable to create controller", "controller", "Nob")
		os.Exit(1)
	}
```

## ローカルアプリケーション起動

- yaml マニフェストの生成および CRD の登録を行います:

```shell
make install
```

- Go プロセスとしてコントローラを動かします:

```shell
make run
```

- カスタムリソースのマニフェストファイルを apply します（事前に Spec を定義しておいてください）:

```shell
kubectl apply -f config/samples/nobcontroller_v1_nob.yaml
```

- カスタムリソースが動いていることを確認できます:

```
$ kubectl get Nob
NAME         AGE
nob-sample   15s
```
