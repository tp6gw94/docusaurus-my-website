---
title: AWS API Gateway Static IP
tags: [AWS, API Gateway, Lambda, Serverless, Work]
draft: true
---
在工作上遇到了第三方服務請求時，需要設定白名單 IP，但目前的架構使用 AWS 的API Gatewaty + Lambda 進行， 而在 API Gateway 都是浮動的 IP，也無法設定 Elastic IP，查了很多的資料都必須使用繞過的方式進行。

![原本的架構](../static/api%20gateway%20static%20ip-原本的架構.png)

第一個看到的[這篇](https://aws.amazon.com/tw/blogs/networking-and-content-delivery/accessing-an-aws-api-gateway-via-static-ip-addresses-provided-by-aws-global-accelerator/)使用了
Global Accelerator，不過 Global Accelerator 的價格過於高昂，並無法採用。

或是使用 Private 的 API Gateway，透過 VPC Endpoint 進行與外部的連線，不過 Nat Gateway 價格也蠻貴的，加上設定還蠻複雜，所以也並未採用(詳細做法可以參考[這篇](https://zenliu.medium.com/how-to-assign-elastic-ip-to-amazon-api-gateway-ddbee9146bec))。

後來發現有人使用 EC2 架設 Nginx 當做代理的伺服器，就可以達成固定 IP 的目的，再透過 Network Load Balancer 設定固定 IP 就達成 scaling，決定以此爲方向。

![](../static/api%20gateway%20static%20ip-原本的架構%201.png)



## Reference
- https://medium.com/opseco-technologies/assign-fixed-ip-to-aws-api-gateway-fb72507a2883
- https://dlim716.medium.com/configuring-nginx-as-a-reverse-proxy-to-amazon-api-gateway-31f75989c75e
- https://nandovieira.com/using-lets-encrypt-in-development-with-nginx-and-aws-route53
- https://certbot-dns-route53.readthedocs.io/en/stable/ 
