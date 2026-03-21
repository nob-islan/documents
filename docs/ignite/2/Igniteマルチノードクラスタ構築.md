# Igniteマルチノードクラスタ構築

cf. https://ignite.apache.org/docs/ignite2/latest/clustering/tcp-ip-discovery

## 設定

`examples/config/multinode-cluster.xml`を下記で作成します:

```xml
<?xml version="1.0" encoding="UTF-8"?>

<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd">
    <!-- Imports default Ignite configuration -->
    <import resource="example-default.xml"/>

    <bean class="org.apache.ignite.configuration.IgniteConfiguration">

        <property name="discoverySpi">
            <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
                <property name="ipFinder">
                    <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.vm.TcpDiscoveryVmIpFinder">
                        <property name="addresses">
                            <list>
                                <!-- クラスタに参加するノードのIP一覧 -->
                                <value>192.168.151.6</value>
                                <value>192.168.151.7</value>
                                <value>192.168.151.8</value>
                            </list>
                        </property>
                    </bean>
                </property>
            </bean>
        </property>

    </bean>
</beans>
```

## 起動

下記コマンドでIgniteを起動します:

```shell
./ignite.sh ../examples/config/multinode-cluster.xml
```
