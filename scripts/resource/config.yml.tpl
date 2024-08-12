port: 8088
mysql:
  user_name: "数据库用户名"
  password: "数据库密码"
  ip: "数据库IP地址"
  port: 端口号
  db: "数据库DB"
error_log:
  dir: work/logs               # 日志放置目录, 仅支持绝对路径, 不填则默认为执行程序上一层目录的work/logs. 若填写的值不为绝对路径，则以上一层目录为相对路径的根目录，比如填写 work/test/logs， 则目录为可执行程序所在目录的 ../work/test/logs
  file_name: error.log         # 错误日志文件名
  log_level: warning            # 错误日志等级,可选:panic,fatal,error,warning,info,debug,trace 不填或者非法则为info
  log_expire: 7d                # 错误日志过期时间，默认单位为天，d|天，h|小时, 不合法配置默认为7d
  log_period: day               # 错误日志切割周期，仅支持day、hour
redis:
  user_name: "redis集群密码"
  password: "redis集群密码"
  addr:
    - 192.168.128.198:7201
    - 192.168.128.198:7202