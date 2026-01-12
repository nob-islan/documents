# Kubebuilder プロジェクトセットアップ

[Kubebuilder](https://github.com/kubernetes-sigs/kubebuilder) を使って実装するカスタムコントローラープロジェクトのセットアップ方法について記載します。

## プロジェクト作成

- プロジェクトを初期化します。

```shell
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

カスタムリソースの Spec および Status を定義します。変更後は `make` コマンドを実行して関連するファイルの再生成をしてください。

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

- SetUpWithManager を定義します。カスタムリソースが他のどのリソースを監視するかが設定されます。

```go
// SetupWithManager sets up the controller with the Manager.
func (r *NobReconciler) SetupWithManager(mgr ctrl.Manager) error {
	// NobがDeploymentを監視するよう設定
	return ctrl.NewControllerManagedBy(mgr).
		For(&nobcontrollerv1.Nob{}).
		Owns(&appsv1.Deployment{}). // import appsv1 "k8s.io/api/apps/v1"
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
			corev1.EventTypeNormal, // import corev1 "k8s.io/api/core/v1"
			"Deleted",
			"Deleted deployment %q",
			deployment.Name,
		)
	}

	return nil
}
```

- Reconcile 関数を実装します。コントローラー実装の本体をここに記述します。

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
		ObjectMeta: metav1.ObjectMeta{ // import metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
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
			deploy.Spec.Selector = &metav1.LabelSelector{MatchLabels: labels}
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

		// Nobを親とするようリファレンスを設定
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
	var d appsv1.Deployment
	var deploymentNamespacedName = client.ObjectKey{
		Namespace: req.Namespace,
		Name:      nob.Spec.DeploymentName,
	}
	if err := r.Get(ctx, deploymentNamespacedName, &d); err != nil {
		log.Error(err, "unable to fetch Deployment")
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}

	// NobのStatusが最適化されていれば何もせずreturn
	if nob.Status.AvailableReplicas == d.Status.AvailableReplicas {
		return ctrl.Result{}, nil
	}

	// NobのStatusを更新
	nob.Status.AvailableReplicas = d.Status.AvailableReplicas
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

Reconciler のメンバを追加します。

```go
	if err := (&controller.NobReconciler{ // nob_controller.goの定義に合わせて追記
		Client:   mgr.GetClient(),
		Log:      ctrl.Log.WithName("controllers").WithName("Nob"),
		Scheme:   mgr.GetScheme(),
		Recorder: mgr.GetEventRecorderFor("nob-controller"),
	}).SetupWithManager(mgr); err != nil {
		setupLog.Error(err, "unable to create controller", "controller", "Nob")
		os.Exit(1)
	}
```

## 単体テスト

単体テストを作成および実行します。

### テストケース記載

#### internal/controller/nob_controller_test.go

- BeforeEach に NobSpec で定めたパラメータを定義します。

```go
		BeforeEach(func() {
			By("creating the custom resource for the Kind Nob")
			err := k8sClient.Get(ctx, typeNamespacedName, nob)
			if err != nil && errors.IsNotFound(err) {
				resource := &nobcontrollerv1.Nob{
					ObjectMeta: metav1.ObjectMeta{
						Name:      resourceName,
						Namespace: "default",
					},
					Spec: nobcontrollerv1.NobSpec{
						DeploymentName: "test-deployment",
						Replicas:       ptr.To[int32](2),
					},
				}
				Expect(k8sClient.Create(ctx, resource)).To(Succeed())
			}
		})
```

- AfterEach に Reconciler の定義および、Expect の内容を記載します。

```go
		AfterEach(func() {
			// TODO(user): Cleanup logic after each test, like removing the resource instance.
			resource := &nobcontrollerv1.Nob{}
			err := k8sClient.Get(ctx, typeNamespacedName, resource)
			Expect(err).NotTo(HaveOccurred())

			By("Cleanup the specific resource instance Nob")
			Expect(k8sClient.Delete(ctx, resource)).To(Succeed())
		})
		It("should successfully reconcile the resource", func() {
			By("Reconciling the created resource")
			controllerReconciler := &NobReconciler{ // reconcilerにパラメータを追加
				Client:   k8sClient,
				Log:      logf.Log,
				Scheme:   k8sClient.Scheme(),
				Recorder: &record.FakeRecorder{},
			}

			_, err := controllerReconciler.Reconcile(ctx, reconcile.Request{
				NamespacedName: typeNamespacedName,
			})
			Expect(err).NotTo(HaveOccurred())

			// assertの期待値となるラベル
			expectedLabels := map[string]string{
				"app":        "nginx",
				"controller": "test-resource",
			}

			// 結果のassert
			By("Making sure the deployment created successfully")
			deployment := &appsv1.Deployment{}
			err = k8sClient.Get(
				ctx,
				client.ObjectKey{
					Namespace: "default",
					Name:      "test-deployment",
				},
				deployment,
			)
			Expect(err).NotTo(HaveOccurred())
			Expect(deployment.ObjectMeta.Labels).Should(Equal(expectedLabels))
		})
```

### テスト実施

下記コマンドでテストを実施します。

```shell
make test
```

## ローカルアプリケーション起動

- kind/cluster/kubebuilder-cluster.yaml を下記内容で作成します。

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
  - role: worker
  - role: worker
```

- Kind で Kubernetes クラスタを構築します。

```shell
kind create cluster --name kubebuilder-cluster --config kind/cluster/kubebuilder-cluster.yaml
```

- yaml マニフェストの生成および CRD の登録を行います。

```shell
make install
```

- Go プロセスとしてコントローラを動かします。

```shell
make run
```

- config/samples 配下のカスタムリソースの spec を宣言します。

```yaml
apiVersion: nobcontroller.example.nob/v1
kind: Nob
metadata:
  labels:
    app.kubernetes.io/name: nob-controller
    app.kubernetes.io/managed-by: kustomize
  name: nob-sample
spec:
  deploymentName: nob-nginx
  replicas: 3
```

- カスタムリソースのマニフェストファイルを apply します。

```shell
kubectl apply -f config/samples/nobcontroller_v1_nob.yaml
```

- 下記コマンドでカスタムリソースが動いていることを確認できます。

```
$ kubectl get Nob
NAME         AGE
nob-sample   15s
```
