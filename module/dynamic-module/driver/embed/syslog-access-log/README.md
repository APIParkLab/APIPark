# Syslog日志

## 基本介绍

日志是用来暴露系统内部状态的一种手段，好的日志可以帮助开发人员快速定位问题所在，然后找到合适的方式解决掉问题。该插件支持将`节点访问日志`输出到`Syslog`中。

## 功能特性

Syslog日志：能够将程序运行中产生的日志内容输出远端的Syslog服务器。

* 支持多种请求协议，包括TCP、UDP、UNIX
* 支持设置Syslog输出日志等级
* 支持日志输出格式类型
* 支持自定义日志格式化配置

## 功能演示

### 新建Syslog日志配置

1、点击左侧导航栏`系统管理` -> `Syslog日志`，进入 `Syslog日志`列表页面，点击`新建Syslog日志`

![](http://data.eolinker.com/course/JjBrSvS208f58f53d5792de7ca068c9674b97ffdaa4e3a7.png)

2、填写Syslog日志配置

![](http://data.eolinker.com/course/c456gUa9c273f26aef61fc77d0a7e7cb3513b9430b1f7f8.png)

**配置说明**：


| 字段名称   | 说明                                                         |
| :--------- | :----------------------------------------------------------- |
| 网络协议   | 请求Syslog服务的协议，支持TCP、UDP、UNIX                     |
| 服务器地址 | Syslog服务的地址                                             |
| 日志等级   | Syslog输出日志等级，支持ERROR、WARN、INFO、DEBUG、TRACE      |
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

3、点击确定后，Syslog日志添加完成

![](http://data.eolinker.com/course/igk2H3K0bfe9981f3213795e585b167da62ff91cf3d46f2.png)

### 发布到集群

1、点击列表右侧`小飞机`按钮，将Syslog日志配置发布上线

![](http://data.eolinker.com/course/SlvdD1aecbd3d4c58a5b9ec073ad15cffe23caf199d398f.png)

2、选择其中需要发布上线的环境，点击`上线`

![](http://data.eolinker.com/course/LzlDAsN472f7c71489d56f9b3a20fd0c35ff19223d7cf50.png)

3、上线成功后，列表会实时显示相应集群的发布状态

![](http://data.eolinker.com/course/NTSZ6zHc0eb936c502e19e13edb9faefb3886010e432d3d.png)

## 更新日志

### V1.0（2023-6-19）

- 插件上线