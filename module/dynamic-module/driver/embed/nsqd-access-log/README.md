# NSQ日志

## 基本介绍

日志是用来暴露系统内部状态的一种手段，好的日志可以帮助开发人员快速定位问题所在，然后找到合适的方式解决掉问题。该插件支持将`节点访问日志`输出到**NSQ队列**中。

## 功能特性

NSQ日志：能够将程序运行中产生的日志内容输出到指定NSQD的topic中。

* 支持填写多个nsqd请求地址
* 支持日志输出格式类型
* 支持自定义日志格式化配置

## 功能演示

### 新建NSQ日志配置

1、点击左侧导航栏`系统管理` -> `NSQ日志`，进入 `NSQ日志`列表页面，点击`新建NSQ日志`

![](http://data.eolinker.com/course/mP9cAUw2c0e57b252f4ede635f63b76ba31f5c0b826872a.png)

2、填写NSQ日志配置

![](http://data.eolinker.com/course/jzPEqMc41180eeb8d1a8cb7a9d1ff545753fb712f2df4ac.png)

**配置说明**：

| 字段名称     | 说明                                                         |
| :----------- | :----------------------------------------------------------- |
| NSQD地址列表 | NSQD提供TCP服务的地址列表，支持填写多个地址                  |
| Topic        | NSQD的Topic信息                                              |
| 鉴权Secret   | 配置访问NSQD的鉴权密钥信息                                   |
| 输出格式     | 输出日志内容格式，支持单行、Json格式输出                     |
| 格式化配置   | 输出格式模版，配置教程[点此](https://help.apinto.com/docs/formatter)进行跳转 |

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

3、点击确定后，NSQ日志添加完成

![](http://data.eolinker.com/course/9bk8JLP81dd351417cf20d1cf84b8480e27056567f4f7d3.png)

### 发布到集群

1、点击列表右侧`小飞机`按钮，将NSQ日志配置发布上线

![](http://data.eolinker.com/course/7QPtDzY71d87af4a504468343eb0c80ccca823c93726a48.png)

2、选择其中需要发布上线的环境，点击`上线`

![](http://data.eolinker.com/course/AJdKFlMd13cf76912566ee666427f28e9ecfcf594a70bfc.png)

3、上线成功后，列表会实时显示相应集群的发布状态

![](http://data.eolinker.com/course/UsgdW3t020287005ddd27f229bed6532a17f2c6a8d1e9c7.png)

## 更新日志

### V1.0（2023-6-19）

- 插件上线