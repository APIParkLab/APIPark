#!/bin/bash

set -e

cd "$(dirname "$0")/../"
LOCAL_PATH=$(pwd)
ARCH=$1
User=$2
BuildMode=$3
if [[ "${BuildMode}" == "" ]];then
  BuildMode="all"
fi
# 编译可执行文件
./scripts/build.sh "cmd" "" "${BuildMode}" ${ARCH}

source ./scripts/common.sh
APP="apipark"


mkdir -p scripts/cmd/ && cp cmd/${APP} scripts/cmd/

VERSION=$(gen_version)


if [[ "${ARCH}" == "" ]];then
  ARCH="amd64"
fi

OPTIONS=""
if [[ "${ARCH}" == "arm" ]];then
  OPTIONS="--platform=linux/arm64"
fi

if [[ "${User}" == "" ]];then
  User="eolinker"
fi

imageName=${User}/${APP}:${VERSION}-${ARCH}
docker rmi -f ${imageName}

echo "docker build ${OPTIONS} -t ${imageName} --build-arg VERSION=${VERSION} --build-arg APP=${APP}  -f ./scripts/Dockerfile ./scripts/"
docker build ${OPTIONS} -t ${imageName} --build-arg VERSION=${VERSION} --build-arg APP=${APP}  -f ./scripts/Dockerfile ./scripts/


