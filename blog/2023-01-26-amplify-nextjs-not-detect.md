---
title: Amplify NextJS 未正確偵測到 Framework 處理辦法
tags: [Amplify, AWS, NextJS]
---
Amplify [更新](https://aws.amazon.com/tw/blogs/mobile/amplify-next-js-13/)了很多，對於 NextJS 的部署也很方便，工作上也將部分 NextJS 服務從 vercel 遷移至 Amplify 上，不過還是有遇到奇怪的 Bug，主要是莫名沒有將 Framework 偵測到爲 NextJS SSR，需要透過 command 強制更新爲 NextJS SSR。

```sh
aws amplify update-branch --app-id [app-id]  --framework 'Next.js - SSR' --region [region]
```

要注意的是更新是依照 branch，並不會將整個 APP 作出更新，需要指定 branch 才會將其他的服務進行更新。

```sh
aws amplify update-branch --app-id [app-id]  --framework 'Next.js - SSR' --region [region] --branch-name [branch]
```

