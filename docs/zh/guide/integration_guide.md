---
title: 集成步骤
permalink: /guide/integration_guide/
---
# 集成步骤

商户希望在自己的收银台上给用户展示支付方式并支付，HaiPay提供纯API（Direct API）的方式接入。

对于Direct API的接口，商户如果自行处理卡号信息，需要具备PCI-DSS认证资质。

## 1. 代收流程

```mermaid
sequenceDiagram
    participant C as 商户客户端
    participant M as 商户服务端
    participant H as HaiPay服务端
    participant B as 钱包/银行

    C->>C: 1. 用户选择下单，进入 checkout 页，填写支付信息
    C->>M: 2.1 发起支付请求
    M->>H: 2.2 调用商户API接口
    H->>B: 2.3 调用上游渠道API接口
    B-->>H: 2.4 返回请求结果
    H-->>M: 2.5 返回请求结果
    M-->>C: 2.6 返回请求结果

    B-->>H: 3.1 异步通知支付结果
    H-->>M: 3.2 异步通知支付结果
    M->>M: 3.3 通知获取成功
    H->>H: 3.4 通知获取成功
```



## 2. 代付流程

```mermaid
sequenceDiagram
    participant M as 商户服务端
    participant H as HaiPay服务端
    participant B as 钱包/银行

    M->>H: 1.1 发起代付请求
    H->>B: 1.2 调用上游渠道API接口
    B-->>H: 1.3 返回请求结果
    H-->>M: 1.4 返回请求结果

    B-->>H: 2.1 异步通知支付结果
    H-->>M: 2.2 异步通知支付结果
    M->>M: 2.3 通知获取成功
    H->>H: 2.4 通知获取成功
```


## 3. 接口参数
详情参阅：[接口说明](/zh/docs/guide/api_description_guide.md)

## 4. 端到端测试
详情参阅：[端到端测试](/zh/docs/guide/end_to_end_testing.md)
