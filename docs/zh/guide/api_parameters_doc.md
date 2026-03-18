---
title: 联调环境
permalink: /guide/api_parameters_doc/
---
# 联调环境

| 联调环境 | 请求地址                                                               |
| :------- | :--------------------------------------------------------------------- |
| Test     | [https://uat-interface.haipay.asia](https://uat-interface.haipay.asia) |
| Prod     | 上线提供                                                                   |

通过该项目接口定义可在不同环境使用，自主完成下单、支付流程。并通过不断添加用例场景，沉淀、积累用例

# 接口

## 代收

### 代收申请

创建代收订单

**URL**：`/{currency}/collect/apply`，{currency}为币种，详情参考 [交易支持的国家与币种](/zh/docs/version2/guide/supported-country-region-currency.md)

**请求方式**：POST

**请求参数**: 
| 参数名        | 必选 | 类型    | 说明                                                                                           |
| :------------ | :--- | :------ | :--------------------------------------------------------------------------------------------- |
| appId         | 是   | Long    | 业务ID（后台获取，参考 [商户接入流程](/zh/docs/version2/guide/integration_process_guide.md)） |
| orderId       | 是   | String  | 商户订单号(必须保证唯一性，长度不超过48)                                                                     |
| amount        | 是   | String  | 交易金额                                                                                       |
| name          | 否   | String  | 收款人姓名，（TODO XXX时需要上传）                                                             |
| phone         | 否   | String  | 真实手机号，（TODO XXX时需要上传）                                                                 |
| email         | 否   | String  | 真实电子邮件，（TODO XXX时需要上传）                                                               |
| subject       | 否   | String  | 支付备注                                 |
| body          | 否   | String  | 备注详情                                                                                       |
| inBankNo      | 否   | String  | 公司收款银行卡号                                                                               |
| inBankCode    | 是   | String  | 收款编码                                                                                       |
| payType       | 是   | String  | 用户支付方式                                                                                   |
| callBackUrl   | 是   | String  | 用户支付成功后跳转地址                                                                         |
| callBackFailUrl | 是   | String | 用户支付失败后跳转地址                                                                             
| expiryPeriod  | 否   | Integer | 过期时间                                                                                       |
| clientType    | 否   | String  | 客户端类型                                                                                     |
| sign          | 是   | String  | 签名                                                                                           |
| outBankNo     | 否   | String  | 付款人银行卡号                                                                                 |
| outBankCode   | 否   | String  | 收款编码                                                                                       |
| country       | 否   | String  | 信用卡-欧洲收银台-国家编码，可为空                                                             |
| currency      | 否   | String  | 用户支付币种                                                                                   |
| userId        | 否   | Long    | 用户ID，GatePay渠道需要，数字类型                                                              |
| uuid          | 否   | String  | 用户唯一id                                                                                     |
| goodName      | 否   | String  | 商品名称                                                                                       |
| goodsQuantity | 否   | String  | 商品数量                                                                                       |
| goodsPrice    | 否   | String  | 商品单价                                                                                       |
| goodsSku      | 否   | String  | 商品id                                                                                         |
| goodsAvatar   | 否   | String  | 商品图片                                                                                       |
| platform      | 否   | String  | 平台名称                                                                                       |

**响应**：
<table>
    <tbody>
        <tr>
            <td colspan="2"><b>参数名</b></td>
            <td><b>必选</b></td>
            <td><b>类型</b></td>
            <td><b>说明</b></td>
        </tr>
        <tr>
            <td colspan="2">status</td>
            <td>是</td>
            <td>Integer</td>
            <td>响应码，1表示成功，0表示失败</td>
        </tr>
        <tr>
            <td colspan="2">error</td>
            <td>否</td>
            <td>Integer</td>
            <td>错误码，详情参考 <a href="/zh/docs/version2/guide/error_code_doc">错误码</a></td>
        </tr>
        <tr>
            <td colspan="2">msg</td>
            <td>是</td>
            <td>String</td>
            <td>错误信息</td>
        </tr>
        <tr>
            <td rowspan="15">data</td>
            <td>orderId</td>
            <td>是</td>
            <td>String</td>
            <td>商户订单号</td>
        </tr>
        <tr>
            <td>orderNo</td>
            <td>是</td>
            <td>String</td>
            <td>平台订单号</td>
        </tr>
        <tr>
            <td>payUrl</td>
            <td>是</td>
            <td>String</td>
            <td>收款地址</td>
        </tr>
        <tr>
            <td>exchangeRate</td>
            <td>否</td>
            <td>String</td>
            <td>汇率，用户支付货币与商户本币不同时返回</td>
        </tr>
        <tr>
            <td>orderAmount</td>
            <td>否</td>
            <td>String</td>
            <td>订单金额，用户支付货币与商户本币不同时返回</td>
        </tr>
        <tr>
            <td>amount</td>
            <td>否</td>
            <td>String</td>
            <td>交易金额，用户支付货币与商户本币不同时返回</td>
        </tr>
        <tr>
            <td>sign</td>
            <td>是</td>
            <td>String</td>
            <td>签名</td>
        </tr>
    </tbody>
</table>

**异步通知**

当客户代收成功或失败，我方会推送订单状态，每隔5分钟回调一次，持续5次。推送的是客户当次支付信息，金额：本次还款金额，手续费：本次手续费。

**URL**：`贵方提供`，参考 [商户接入流程](/zh/docs/version2/guide/integration_process_guide.md)

**请求方式**：POST

**请求参数**：

| 参数名   | 必选 | 类型    | 说明                                                                    |
| :------- | :--- | :------ | :---------------------------------------------------------------------- |
| appId    | 是   | Long    | 业务ID                                                                  |
| currency | 是   | String  | 币种                                                                    |
| orderId  | 是   | String  | 商户订单号（必须保证唯一性）                                            |
| orderNo  | 是   | String  | 平台订单号                                                              |
| amount   | 是   | String  | 本次收款金额                                                            |
| fee      | 是   | String  | 手续费金额                                                              |
| status   | 是   | Integer | 订单状态(2收款成功,3:收款失败,4:部分收款,5:超额收款)                    |
| payTime  | 是   | String  | 支付成功时间（当status=2,4,5时有值）(当地时间), 格式: yyyy-MM-dd HH:mm:ss |
| errorMsg | 否   | String  | 支付失败原因（当status=3时有值）                                        |
| sign     | 是   | String  | 签名                                                                    |

:::wanring
**收到回调通知之后，请返回body（大写）SUCCESS，否则会持续通知5次。**
:::

### 代收查询

查询代收订单


**请求参数**：
| 参数名  | 必选 | 类型   | 说明                                                                                           |
| :------ | :--- | :----- | :--------------------------------------------------------------------------------------------- |
| appId   | 是   | Long   | 业务ID（后台获取，参考 [商户接入流程](/zh/docs/version2/guide/integration_process_guide.md)） |
| orderId | 是   | String | 商户订单号                                                                                     |
| orderNo | 否   | String | 平台订单号（响应快）                                                                           |
| sign    | 是   | String | 签名                                                                                           |

**响应**：
| 参数名       | 必选 | 类型    | 说明                                                                               |
| :----------- | :--- | :------ | :--------------------------------------------------------------------------------- |
| orderId      | 是   | String  | 商户订单号(必须保证唯一性，长度不超过48)                                                         |
| orderNo      | 是   | String  | 平台订单号                                                                         |
| amount       | 是   | String  | 交易金额                                                                           |
| actualAmount | 是   | String  | 收到金额                                                                           |
| fee          | 是   | String  | 手续费                                                                             |
| status       | 是   | Integer | 状态(0未开始,1收款中,2收款成功3:收款失败,4:部分收款,5:超额收款, \-1异常待确认) |
| payTime      | 是   | String  | 支付成功时间（当status=2,4,5时有值）(菲律宾时间), 格式: yyyy-MM-dd HH:mm:ss          |
| errorMsg     | 否   | String  | 失败原因（当status=3时有值）                                                   |
| inBankCode   | 否   | String  | 收款编码                                                                           |
| sign         | 是   | String  | 签名                                                                               |


### 退款申请

TODO


## 代付
### 代付申请

创建代付订单

**URL**：`/{currency}/pay/apply`，{currency}为币种，详情参考 [交易支持的国家与币种](/zh/docs/version2/guide/supported-country-region-currency.md)

**请求方式**：POST

**请求参数**: 

| 参数名       | 必选 | 类型   | 说明                                                                                           |
| :----------- | :--- | :----- | :--------------------------------------------------------------------------------------------- |
| appId        | 是   | Long   | 业务ID（后台获取，参考 [商户接入流程](/zh/docs/version2/guide/integration_process_guide.md)） |
| orderId      | 是   | String | 商户订单号(必须保证唯一性，长度不超过48)                                                                     |
| amount       | 是   | String | 交易金额                                                                                       |
| name         | 是   | String | 收款人姓名                                                                                     |
| phone        | 是   | String | 真实手机号                                                                                         |
| email        | 是   | String | 真实电子邮件                                                                                       |
| subject      | 否   | String | 支付备注                                 |
| body         | 否   | String | 备注详情                                                                                       |
| accountNo    | 否   | String | 收款人账户                                                                                     |
| accountType  | 否   | String | 账户类型                                                                                       |
| bankName     | 否   | String | 公司放款银行名称                                                                               |
| bankCode     | 否   | String | 公司放款银行编号                                                                               |
| sign         | 是   | String | 签名                                                                                           |
| identifyType | 否   | String | 账号类型-巴西PIX代付                                                                           |
| ibanAccount  | 否   | String | iban账号-沙特银行代付,土耳其代付                                                               |
| country      | 否   | String | 美国ACH方式需要                                                                                |
| address1     | 否   | String | 美国ACH方式需要                                                                                |
| address2     | 否   | String | 美国ACH方式需要                                                                                |
| address3     | 否   | String | 美国ACH方式需要                                                                                |
| postalCode   | 否   | String | 美国ACH方式需要                                                                                |
| ifsc         | 否   | String | 印度-ifsc                                                                                      |
| branchNumber | 否   | String | 分行编码-土耳其代付                                                                            |
| birth        | 否   | String | 巴基斯坦 出生日期 [yyyy-MM-dd]                                                                 |
| gender       | 否   | String | 巴基斯坦 性别 [MALE, FEMALE or OTHER]                                                          |

**响应**：


### 代付查询

## 账户余额

### 查询账户


