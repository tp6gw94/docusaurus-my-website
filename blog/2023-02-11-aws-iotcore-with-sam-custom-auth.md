---
title: AWS SAM create IoTCore custom authorization 記錄
---

使用 SAM CLI 建立 nodejs 的 template，並修改 template.yaml 建立一個 lambda function 與 IoTCore 的 Authorizer，並指定 Authorizer 的 function 爲該 lambda function

```yaml title="template.yaml"
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Resources:
  MyIoTCoreAuthorizer:
    Type: AWS::Serverless::Function
    Properties:
      Handler: index.handler
      Runtime: nodejs14.x
      CodeUri: ./
      Policies:
        - Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Action:
                - iot:Connect
              Resource: 'arn:aws:iot:<region>:<account-id>:*'

  MyAuthorizerFunction:
    Type: AWS::IoT::Authorizer
    Properties:
      AuthorizerFunctionArn: !GetAtt MyIoTCoreAuthorizer.Arn
      AuthorizerName: MyAuthorizer
      Status: ACTIVE
      SigningDisabled: True
Outputs:
  MyIoTCoreAuthorizerName:
    Value: !Ref MyIoTCoreAuthorizer
    Export:
      Name: MyIoTCoreAuthorizerName 
  
  MyAuthorizerFunctionArn:
    Value: !GetAtt MyAuthorizerFunction.Arn
    Export:
      Name: MyAuthorizerFunctionArn
```

之後 build 並 deploy

```sh
sam build
sam deploy --guided
```

部署成功後，會獲得 IoTCore Authorizer 的 ARN 與 lambda 的名稱，透過他們替 lambda function 加上允許 IoTCore Auth Invoke Function 的權限。

```sh
aws lambda add-permission --function-name {MyIoTCoreAuthorizerName} \
--principle "iot.amazonaws.com" --action "lambda:InvokeFunction" \
--statement-id {UniqID} --source-arn {MyAuthorizerFunctionArn}
```

lambda 收到 request 後傳送 IoTCore 的 Policy

```js
export const handler = async (event, context) => {
  const [, , , region, accountId] = context.invokedFunctionArn.split(':');
  console.log('full event', JSON.stringify(event));

  const policy = {
    principalId: 'test',
    isAuthenticated: true,
    policyDocuments: [
      {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'iot:*',
            Effect: 'Allow',
            Resource: '*',
          },
        ],
      },
    ],
  };

  return policy;
};
```

之後就可以透過 MQTT Explorer 或是 MQTT.JS 進行測試

protocol 設爲 WSS，username 代入 custom IoTCore Auth Function Name

```ts
import * as mqtt from "mqtt";

const AWS_HOST = "xxx";

const connect = mqtt.connect({
  hostname: AWS_HOST,
  protocol: "wss",
  username: "username?x-amz-customauthorizer-name=MyAuthorizer",
  clientId: "test",
  port: 443
});

connect.on("connect", () => {
  console.log("iotcore connected");
});

```

可以觀看 CloudWatch 驗證是否有成功呼叫 lambda function

```txt
2023-02-16T12:36:11.929Z	41b7b8c4-661c-4abb-9bb5-e7eaf96bda50	INFO	full event {
    "protocolData": {
        "tls": {
            "serverName": "..."
        },
        "mqtt": {
            "username": "username?x-amz-customauthorizer-name=MyAuthorizer",
            "clientId": "test"
        },
        "http": {
            "headers": {
                "accept-encoding": "gzip, deflate, br",
                "sec-websocket-extensions": "permessage-deflate; client_max_window_bits",
                "upgrade": "websocket",
                "connection": "Upgrade",
                "pragma": "no-cache",
                "origin": "https://zydu3d.csb.app",
                "sec-websocket-key": "PMjh6zWnZONmD/AtXQ3tKg==",
                "content-length": "0",
                "sec-websocket-version": "13",
                "cache-control": "no-cache",
                "host": "...",
                "accept-language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6",
                "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
                "sec-websocket-protocol": "mqtt"
            },
            "queryString": ""
        }
    },
    "protocols": [
        "tls",
        "http",
        "mqtt"
    ],
    "signatureVerified": false,
    "connectionMetadata": {
        "id": "3e0deb31-b893-3841-c54a-bfbd9c927e55"
    }
}

```

透過 username 的 query 可以代入 token 參數之類的

```txt
username?x-amz-customauthorizer-name=MyAuthorizer&token=...&key=value
```

即可依照參數產生相對應的 policy

## Reference

- [Tutorial: Creating a custom authorizer for AWS IoT Core](https://docs.aws.amazon.com/iot/latest/developerguide/custom-auth-tutorial.html)
- [Understanding the custom authentication workflow - AWS IoT Core](https://docs.aws.amazon.com/iot/latest/developerguide/custom-authorizer.html)
