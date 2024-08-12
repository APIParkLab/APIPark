# HTTP日志

## 基本介绍

日志是用来暴露系统内部状态的一种手段，好的日志可以帮助开发人员快速定位问题所在，然后找到合适的方式解决掉问题。该插件支持将`节点访问日志`输出到**HTTP服务器**中。

## 功能特性

HTTP日志插件通过HTTP请求的方式，将节点访问日志发送给HTTP服务接口中，并且具备以下特性：

* 支持多种请求方式，包括**POST**、**PUT**、**PATCH**
* 支持自定义请求头部
* 支持日志输出格式类型
* 支持自定义日志格式化配置

## 功能演示

### 新建HTTP日志配置

1、点击左侧导航栏`系统管理` -> `HTTP日志`，进入 `HTTP日志`列表页面，点击`新建HTTP日志`

![](http://data.eolinker.com/course/RG9NpXfd8506f189f6cc37567b943aaef81fbe98094e511.png)

2、填写HTTP日志配置

![](http://data.eolinker.com/course/1Y4YJLD0edb4c6ed4fa197529245e4c841ae049e5564fb7.png)

**配置说明**：

| 字段名称   | 说明                                                         |
| :--------- | :----------------------------------------------------------- |
| 请求方式   | 请求HTTP服务接口时使用的请求方式，目前支持POST、PUT、PATCH   |
| URL        | HTTP服务接口的完整请求路径                                   |
| 请求头部   | 请求的头部信息，可以填请求HTTP服务接口时需要提供的参数,如鉴权等信息<br />填写时，需要填写JSON格式数据，数据为`key-value`格式，如：<br />`{"from":"apinto"}` |
| 输出格式   | 输出日志内容格式，支持单行、Json格式输出                     |
| 格式化配置 | 输出格式模版，配置教程[点此](https://help.apinto.com/docs/formatter)进行跳转 |

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

3、点击确定后，HTTP日志添加完成

![](http://data.eolinker.com/course/v3wls8u9bae38349a42610d185250ee7c2134243ccb5a40.png)

### 发布到集群

1、点击列表右侧`小飞机`按钮，将HTTP日志配置发布上线

![](http://data.eolinker.com/course/7m9Wh711763756ff29bd43ac52cc2e847de5daa33b1a848.png)

2、选择其中需要发布上线的环境，点击`上线`

![](http://data.eolinker.com/course/cJjq55Cc14c110ac9e84d9e427cf8e1af0a182689c09cd7.png)

3、上线成功后，列表会实时显示相应集群的发布状态

![](http://data.eolinker.com/course/Rh7wxRW0860282202bf48d968433581062243d8ed6b9055.png)

## 更新日志

### V1.0（2023-6-19）

- 插件上线