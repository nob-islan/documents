# qpid インストール

qpid のインストール手順です。

## 環境

- CentOS 7

## 構築、起動

CentOS 7 を docker で起動します。

```yml
version: "3.7"

services:
  qpid:
    image: centos:centos7
    container_name: nob-qpid
    tty: true
    ports:
      - 5672:5672
```

- リポジトリを追加します。

```
yum install epel-release
```

- リポジトリが追加されていることを確認します。

```
[root@1dc92721a250 /]# rpm -q epel-release
epel-release-7-11.noarch
```

- qpid 関連のモジュールをインストールします。

```
yum install qpid-cpp-server qpid-tools
```

- qpid を起動します。

```
chkconfig qpidd on
/usr/sbin/qpidd start
```

- 起動していることを確認します。

```
[root@1dc92721a250 /]# qpid-config
Total Exchanges: 8
          topic: 3
        headers: 1
         fanout: 1
         direct: 3

   Total Queues: 1
        durable: 0
    non-durable: 1
```

## 基本操作

- キューを追加

```
qpid-config add queue ${キュー名}
```

- キュー一覧

```
qpid-config queues
```

- キューを削除

```
qpid-config del queue ${キュー名}
```

## サンプルソース

下記のソースを使って動作確認ができます。  
https://github.com/apache/qpid-jms/tree/main/qpid-jms-examples/src/main/java/org/apache/qpid/jms/example

### 実装

- pom.xml

```xml
<!-- 下記を追記する -->
<dependency>
    <groupId>org.apache.qpid</groupId>
    <artifactId>qpid-jms-client</artifactId>
    <version>2.4.0</version>
</dependency>
```

- サービスインターフェース

```java
package com.example.qpidtest.service;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * サンプルのサービスインターフェースです。
 *
 */
@RestController
@RequestMapping(value = "/sample")
public interface SampleService {

    /**
     * サンプルのメソッドです。
     *
     * @return
     */
    @GetMapping("qpid")
    void helloWorld();
}
```

- サービス実装

```java
package com.example.qpidtest.service.impl;

import javax.naming.Context;
import javax.naming.InitialContext;

import org.springframework.stereotype.Service;

import com.example.qpidtest.service.SampleService;

import jakarta.jms.Connection;
import jakarta.jms.ConnectionFactory;
import jakarta.jms.DeliveryMode;
import jakarta.jms.Destination;
import jakarta.jms.ExceptionListener;
import jakarta.jms.JMSException;
import jakarta.jms.Message;
import jakarta.jms.MessageConsumer;
import jakarta.jms.MessageProducer;
import jakarta.jms.Session;
import jakarta.jms.TextMessage;

/**
 * サンプルサービスの実装クラスです。
 *
 */
@Service
public class SampleServiceImpl implements SampleService {

    /**
     * {@inheritDoc}
     *
     */
    @Override
    public void helloWorld() {

        try {
            // The configuration for the Qpid InitialContextFactory has been supplied in
            // a jndi.properties file in the classpath, which results in it being picked
            // up automatically by the InitialContext constructor.
            Context context = new InitialContext();

            ConnectionFactory factory = (ConnectionFactory) context.lookup("myFactoryLookup");
            Destination queue = (Destination) context.lookup("myQueueLookup");

            Connection connection = factory.createConnection(System.getProperty("USER"),
                    System.getProperty("PASSWORD"));
            connection.setExceptionListener(new MyExceptionListener());
            connection.start();

            Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);

            MessageProducer messageProducer = session.createProducer(queue);
            MessageConsumer messageConsumer = session.createConsumer(queue);

            TextMessage message = session.createTextMessage("Hello world!");
            messageProducer.send(message, DeliveryMode.NON_PERSISTENT, Message.DEFAULT_PRIORITY,
                    Message.DEFAULT_TIME_TO_LIVE);
            TextMessage receivedMessage = (TextMessage) messageConsumer.receive(2000L);

            if (receivedMessage != null) {
                System.out.println(receivedMessage.getText());
            } else {
                System.out.println("No message received within the given timeout!");
            }

            connection.close();
        } catch (Exception exp) {
            System.out.println("Caught exception, exiting.");
            exp.printStackTrace(System.out);
            System.exit(1);
        }
    }

    private static class MyExceptionListener implements ExceptionListener {
        @Override
        public void onException(JMSException exception) {
            System.out.println("Connection ExceptionListener fired, exiting.");
            exception.printStackTrace(System.out);
            System.exit(1);
        }
    }
}
```

- jndi.properties

```shell
#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#

# Set the InitialContextFactory class to use
java.naming.factory.initial = org.apache.qpid.jms.jndi.JmsInitialContextFactory

# Define the required ConnectionFactory instances
# connectionfactory.<JNDI-lookup-name> = <URI>
connectionfactory.myFactoryLookup = amqp://localhost:5672

# Configure the necessary Queue and Topic objects
# queue.<JNDI-lookup-name> = <queue-name>
# topic.<JNDI-lookup-name> = <topic-name>
queue.myQueueLookup = nob-queue
topic.myTopicLookup = topic
```
