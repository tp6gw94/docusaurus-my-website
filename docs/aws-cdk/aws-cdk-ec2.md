---
title: AWS CDK EC2
draft: true
sidebar_position: 2
tags: [AWS, Cloud, CDK]
---
## Setup
```bash
mkdir cdk-ec2
cdk init -l typescript
```
## 實作
參考官方的 [ReadMe](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ec2.Instance.html) 建立一個 Amazon linux 的 Instance
```typescript title="cdk-ec2-stack.ts"
import * as cdk from "aws-cdk-lib";
import {
  Vpc,
  Instance,
  InstanceType,
  InstanceClass,
  InstanceSize,
  AmazonLinuxImage,
} from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export class CdkEc2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // highlight-start
    const vpc = Vpc.fromLookup(this, "DefaultVPC", { isDefault: true });  // Lookup defualt vpc
    const demoInstance = new Instance(this, "DemoEc2Instance", {
      vpc,
      instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
      machineImage: new AmazonLinuxImage(),
    }); // 建立 EC2 Instance，設定 VPC、Type、AMI
    

    new cdk.CfnOutput(this, "MyInstanceIP", {
      value: demoInstance.instancePublicIp,
    }); // log public ip
    // highlight-end
  }
}
```
設定好 env 與 profile 後進行部署
```bash
cdk deploy
```
部署完成後可以看到 output 的 IP
![](../../static/截圖%202022-12-04%20下午2.24.07.png)
前往 EC2 Console 確認
![](../../static/截圖%202022-12-04%20下午2.25.10.png)
未設定 SG 所以無法進行 SSH connect，設定 SG
```ts title="cdk-ec2-stack.ts"
import {
  Vpc,
  Instance,
  InstanceType,
  InstanceClass,
  InstanceSize,
  AmazonLinuxImage,
  // highlight-start
  SecurityGroup,
  Peer,
  Port,
  // highlight-end
} from "aws-cdk-lib/aws-ec2";

export class CdkEc2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
	// ...
	// highlight-start
    const sg = new SecurityGroup(this, "SSH", {
      vpc,
      description: "Allow SSH",
      allowAllOutbound: true,
    });
    sg.addIngressRule(Peer.anyIpv4(), Port.tcp(22), "Allow SSH");
	// highlight-end
	// ...
	const demoInstance = new Instance(this, "DemoEc2Instance", {
      vpc,
      instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
      machineImage: new AmazonLinuxImage(),
      // highlight-next-line
      securityGroup: sg,
    });

	// ...
  }
}
```
使用 `diff` 確認更改的地方
```bash
cdk diff
```
![](../../static/截圖%202022-12-04%20下午2.35.22.png)
## Reference
- [Getting Started with AWS CDK](https://youtu.be/j866AvdtRps)
- [AWS CDK ReadMe](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ec2.Instance.html)