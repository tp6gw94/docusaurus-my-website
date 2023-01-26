---
title: About
sidebar_position: 1
tags: [AWS, Cloud, CDK]
---

AWS CDK 是建立 AWS 的 infrastructure 工具，類似的工具還有 terraform、 AWS CloudFormation，主要是希望達成 **Infrastructure as code**，較容易維護與部署，避免 UI 的繁雜、重覆的操作，也可以使用 git 來儲存歷史記錄等。

terraform、 CloudFormation 二者是使用 Declarative programming 來寫的(yaml, json)，主要描述在最終的 infrastructure 的狀態。

AWS CDK 會透過 JS、Python、Java 等程式的撰寫後，輸出成 CloudFormation 部署在 cloud 上，適合開發人員使用，透過 IDE 的 intellisense 也能方便的開發。

## 實作
安裝 CDK
```bash
npm i -g aws-cdk
```

建立 sample-app template
```bash
cdk init sample-app --language typescript
```

產生出來的目錄結構
```text
.
├── README.md
├── bin
│   └── cdk-demo.ts
├── cdk.json
├── jest.config.js
├── lib
│   └── cdk-demo-stack.ts
├── package-lock.json
├── package.json
├── test
│   └── cdk-demo.test.ts
└── tsconfig.json
```

demo 中建立了 1 個 sqs 的 queue
```ts title="cdk-demo-stack"
import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

export class CdkDemoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, 'CdkDemoQueue', {
      visibilityTimeout: Duration.seconds(300)
    });

    const topic = new sns.Topic(this, 'CdkDemoTopic');

    topic.addSubscription(new subs.SqsSubscription(queue));
  }
}
```

在部署前先將 resource 儲存至 S3 中
```bash
cdk bootstrap
```

:::note Tip
如果有多個 AWS 帳號存在，可以至 `cdk.json` 設定要使用的 profile

```json title="cdk.json"
{
	"app": "...",
	"profile": "cdkprofile"
}
```

若尚未設定 AWS 的 credentials 可以使用 AWS CLI 進行設定
```bash
aws configure --profile name
```
:::

確認當前的 CloudFormation 模板
```bash
cdk synth
```

輸出如下
```yaml
Resources:
  CdkDemoQueue32E7553B:
    Type: AWS::SQS::Queue
    Properties:
      VisibilityTimeout: 300
    UpdateReplacePolicy: Delete
    DeletionPolicy: Delete
    Metadata:
      aws:cdk:path: CdkDemoStack/CdkDemoQueue/Resource
  CdkDemoQueuePolicy23A7259B:
    Type: AWS::SQS::QueuePolicy
    Properties:
      PolicyDocument:
        Statement:
          - Action: sqs:SendMessage
            Condition:
              ArnEquals:
                aws:SourceArn:
                  Ref: CdkDemoTopicCFC15E4B
            Effect: Allow
            Principal:
              Service: sns.amazonaws.com
            Resource:
              Fn::GetAtt:
                - CdkDemoQueue32E7553B
                - Arn
        Version: "2012-10-17"
      Queues:
        - Ref: CdkDemoQueue32E7553B
    Metadata:
      aws:cdk:path: CdkDemoStack/CdkDemoQueue/Policy/Resource
  CdkDemoQueueCdkDemoStackCdkDemoTopic08B33B73B94BF7A6:
    Type: AWS::SNS::Subscription
    Properties:
      Protocol: sqs
      TopicArn:
        Ref: CdkDemoTopicCFC15E4B
      Endpoint:
        Fn::GetAtt:
          - CdkDemoQueue32E7553B
          - Arn
    DependsOn:
      - CdkDemoQueuePolicy23A7259B
    Metadata:
      aws:cdk:path: CdkDemoStack/CdkDemoQueue/CdkDemoStackCdkDemoTopic08B33B73/Resource
  CdkDemoTopicCFC15E4B:
    Type: AWS::SNS::Topic
    Metadata:
      aws:cdk:path: CdkDemoStack/CdkDemoTopic/Resource
  CDKMetadata:
    Type: AWS::CDK::Metadata
    Properties:
      Analytics: v2:deflate64:H4sIAAAAAAAA/1WNWwrCMBBF19L/dKyKbqAb0NZ/aZMI09akzSSKhOzdPEAQhpl7DwfmAKcjNNXwppqLuV5wBN/bgc8sorunjcBfnXSStQ9VQt4XvSD//GCpgZGKfu9G4gZXi1ol46/f9Io80RxCSLGTpJ3h+UerlcBkBqa0kDDR7rU/Q5ymmgixNk5ZfEroyv0CEm8KwMEAAAA=
    Metadata:
      aws:cdk:path: CdkDemoStack/CDKMetadata/Default
    Condition: CDKMetadataAvailable
Conditions:
  CDKMetadataAvailable:
    Fn::Or:
      - Fn::Or:
          - Fn::Equals:
              - Ref: AWS::Region
              - af-south-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-east-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-northeast-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-northeast-2
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-south-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-southeast-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-southeast-2
          - Fn::Equals:
              - Ref: AWS::Region
              - ca-central-1
          - Fn::Equals:
              - Ref: AWS::Region
              - cn-north-1
          - Fn::Equals:
              - Ref: AWS::Region
              - cn-northwest-1
      - Fn::Or:
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-central-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-north-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-south-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-west-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-west-2
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-west-3
          - Fn::Equals:
              - Ref: AWS::Region
              - me-south-1
          - Fn::Equals:
              - Ref: AWS::Region
              - sa-east-1
          - Fn::Equals:
              - Ref: AWS::Region
              - us-east-1
          - Fn::Equals:
              - Ref: AWS::Region
              - us-east-2
      - Fn::Or:
          - Fn::Equals:
              - Ref: AWS::Region
              - us-west-1
          - Fn::Equals:
              - Ref: AWS::Region
              - us-west-2
Parameters:
  BootstrapVersion:
    Type: AWS::SSM::Parameter::Value<String>
    Default: /cdk-bootstrap/hnb659fds/version
    Description: Version of the CDK Bootstrap resources in this environment, automatically retrieved from SSM Parameter Store. [cdk:skip]
Rules:
  CheckBootstrapVersion:
    Assertions:
      - Assert:
          Fn::Not:
            - Fn::Contains:
                - - "1"
                  - "2"
                  - "3"
                  - "4"
                  - "5"
                - Ref: BootstrapVersion
        AssertDescription: CDK bootstrap stack version 6 required. Please run 'cdk bootstrap' with a recent version of the CDK CLI.
```

部署
```bash
cdk deploy
```

部署完成後可以在 CloudFormation 上查看部署的 Stack
![](../../static/截圖%202022-12-03%20下午4.19.17.png)

當修改部署的內容，可以使用 `diff` 指令查看和 Cloud 上的差異

```ts title="cdk-demo-stack.ts"
import { Duration, Stack, StackProps } from "aws-cdk-lib";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subs from "aws-cdk-lib/aws-sns-subscriptions";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

export class CdkDemoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, "CdkDemoQueue", {
      visibilityTimeout: Duration.seconds(300),
    });

    const topic = new sns.Topic(this, "CdkDemoTopic");
	// highlight-next-line
    // topic.addSubscription(new subs.SqsSubscription(queue));
  }
}

```

執行 `diff`
```bash
cdk diff
```

將會 output 出會改變的地方
![](../../static/截圖%202022-12-03%20下午4.27.43.png)
確認後就可以重新部署了

```bash
cdk deploy
```

若希望移除 Stack 的話，直接執行 `destory` 就可以了

```shell
cdk destroy
```

## Reference

- [Getting Started with AWS CDK](https://youtu.be/uFZjj9QnvQs)