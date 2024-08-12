# 文件日志

## 基本介绍

日志是用来暴露系统内部状态的一种手段，好的日志可以帮助开发人员快速定位问题所在，然后找到合适的方式解决掉问题。该插件支持将`节点访问日志`输出到`文件`中。

## 功能特性

文件日志：将请求信息输出到日志文件中，具备以下特性：

- 自定义文件的存放目录及文件名称
- 按照一定周期分割日志文件，避免单个文件过大不好查看的问题
- 定时删除过期文件，降低硬盘空间开销

可配合控制台**日志检索**插件使用，在控制台中追踪节点请求日志，并且可以下载历史日志。

## 功能演示

### 新建文件日志配置

1、点击左侧导航栏`文件日志`，进入文件日志列表页面，点击`新建文件日志`

![](http://data.eolinker.com/course/Hyej4cd6edbb5520f7f62618145d4dca056ee11ae1c3bde.png)

2、填写文件日志配置

![](http://data.eolinker.com/course/VPAFJkz46df9dbc795aeab9afe5e8d6210cca03af46b63d.png)

**配置说明**：

| 字段名称     | 说明                                                         |
| :----------- | :----------------------------------------------------------- |
| 文件名称     | 存放的文件名称，实际存放的名称会加上 `.log` 后缀，即为：{文件名称}.log |
| 存放目录     | 文件存放目录，支持相对路径和绝对路径                         |
| 日志分割周期 | 按照一定周期创建新日志文件，旧日志文件将会重命名，可选项：小时、天 |
| 过期时间     | 文件保存时间，单位：天，超过保存时间的，将定时清理删除       |
| 输出格式     | 输出日志内容格式，支持单行、Json格式输出                     |
| 格式化配置   | 输出格式模版，配置教程[点此](https://help.apinto.com/docs/formatter)进行跳转 |

**文件生命周期演示**



![img](http://data.eolinker.com/course/tgLQMA27ce951803c9e4c6ab3c82a899863c86f86624e01.png)



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

3、点击确定后，日志输出添加完成



![img](http://data.eolinker.com/course/GXFbedia2b05c6b0ce77da8a38f536160af4ec11e1209cf.png)

### 发布到集群

1、点击列表右侧`小飞机`按钮，将日志输出配置发布上线



![img](http://data.eolinker.com/course/gxDIv7z9cc0f9e18b0e905f0e8f185a958f3c5c8d25e6a8.png)



2、选择其中需要发布上线的环境，点击`上线`



![img](http://data.eolinker.com/course/cXAzeC7c3391a55bec8eb5be6c0c6baf2baf3226d9c31e9.png)x



3、上线成功后，列表会实时显示相应集群的发布状态



![img](http://data.eolinker.com/course/n6vc56D488d01bdf61f85e12507117546806602ea0f380f.png)

### 访问接口，打印日志输出

访问在网关上上线的接口，此处使用`Apikit`的测试功能进行演示



![img](http://data.eolinker.com/course/l2sHmd3600aeebb248a48629498f4a0ab9e2529ac1e3587.png)



访问完成后，进入节点目录，查看access日志输出信息，如下图



![img](http://data.eolinker.com/course/d5ryFin9e200c902beea742b311944041249ce19732bb28.png)

## 更新日志

### V1.0（2023-6-19）

- 插件上线