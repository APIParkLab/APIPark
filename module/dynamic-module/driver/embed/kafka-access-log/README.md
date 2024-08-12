# Kafka日志

## 基本介绍

日志是用来暴露系统内部状态的一种手段，好的日志可以帮助开发人员快速定位问题所在，然后找到合适的方式解决掉问题。该插件支持将`节点访问日志`输出到`Kafka`中。

## 功能特性

Kafka日志：能够将程序运行中产生的日志内容输出到指定Kafka集群队列中。

* 支持多种请求协议，包括TCP、UDP、UNIX
* 支持设置Syslog输出日志等级
* 支持日志输出格式类型
* 支持自定义日志格式化配置

## 功能演示

### 新建Kafka日志配置

1、点击左侧导航栏`系统管理` -> `Kafka日志`，进入 `Kafka日志`列表页面，点击`新建Kafka日志`

![](http://data.eolinker.com/course/XgzgbwP536980f85f2d1367925bc1f9b7da60f1be9702c6.png)

2、填写Kafka日志配置

![](http://data.eolinker.com/course/1HAdPXZa7695b5c5b14e3755885b0586fae27235e4361cf.png)

**配置说明**：

| 字段名称       | 说明                                                         |
| :------------- | :----------------------------------------------------------- |
| 版本           | Kafka版本                                                    |
| 服务器地址     | Kafka服务地址，多个地址用英文逗号分隔                        |
| Topic          | Kafka服务Topic信息                                           |
| Partition Type | partition的选择方式，默认采用hash，选择hash时，若partition_key为空，则采用随机选择random |
| Partition      | Partition Type为manual时，该项指定分区号                     |
| Partition Key  | Partition Type为hash时，该项指定hash值                       |
| 请求超时时间   | 超时时间，单位为second                                       |
| 输出格式       | 输出日志内容格式，支持单行、Json格式输出                     |
| 格式化配置     | 输出格式模版，配置教程[点此](https://help.apinto.com/docs/formatter)进行跳转 |

**示例格式化配置**

```
{
   "fields": [
      "$time_iso8601",
      "$request_id",
      "@request",
      "@proxy",
      "@response",
      "@status_code",
      "@time"
   ],
   "request": [
      "$request_method",
      "$scheme",
      "$request_uri",
      "$host",
      "$header",
      "$remote_addr"
   ],
   "proxy": [
      "$proxy_method",
      "$proxy_scheme",
      "$proxy_uri",
      "$proxy_host",
      "$proxy_header",
      "$proxy_addr"
   ],
   "response": [
      "$response_header"
   ],
   "status_code": [
      "$status",
      "$proxy_status"
   ],
   "time": [
      "$request_time",
      "$response_time"
   ]
}
```

3、点击确定后，Kafka日志添加完成

![](http://data.eolinker.com/course/v6vFVL66cf158a77aa4f483d5f76dbfb3726ca4f9971fd9.png)

### 发布到集群

1、点击列表右侧`小飞机`按钮，将Kafka日志配置发布上线

![](http://data.eolinker.com/course/JvlasZie74489a4ace107a87da0e4971df3511d41869999.png)

2、选择其中需要发布上线的环境，点击`上线`

![](http://data.eolinker.com/course/UU1UCzcb6b816a309e2bbe3a9b3428c1628abe8284daf06.png)

3、上线成功后，列表会实时显示相应集群的发布状态

![](http://data.eolinker.com/course/W9p28rR1cd161e6b9219834a45e113d75077b45a09c9cfa.png)

## 更新日志

### V1.0（2023-6-19）

- 插件上线