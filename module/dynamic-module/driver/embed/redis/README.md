## 基本介绍
Redis是一个开源（BSD许可）的内存数据结构存储，用作数据库、缓存、消息代理和流媒体引擎。Redis提供数据结构，如字符串、散列、列表、集合、带范围查询的排序集合、位图、超日志、地理空间索引和流。Redis具有内置复制、Lua脚本、LRU驱逐、事务和不同级别的磁盘持久性，并通过Redis Sentinel和Redis Cluster的自动分区提供高可用性。该插件支持配置Redis Cluster信息，从而使Apinto节点接入Redis。
## 功能特性
- 配置Redis Cluster信息，帮助Apinto节点接入Redis。
- Apinto多个策略、插件依赖Redis，配置Redis后，使用Redis作为缓存数据库。
## 更新日志
### V1.0（2023-4-30）
- 插件上线