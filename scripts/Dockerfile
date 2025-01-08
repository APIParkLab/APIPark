# 名称：apipark通用镜像
# 创建时间：2022-10-25
FROM centos:7.9.2009
MAINTAINER liujian

ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

ARG APP

ENV NSQ_ADDR=nsq:4150
ENV NSQ_TOPIC_PREFIX=apipark

RUN mkdir -p /${APP}

COPY cmd/* /${APP}/
COPY resource/* /${APP}/

WORKDIR /$APP
ENV ADMIN_PASSWORD=12345678
CMD ./docker_run.sh