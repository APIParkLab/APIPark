#!/bin/sh

set -e

Version=$1
ImageName=$2
APP="apipark"

ARCH=$3
if [ "$ARCH" == "" ];then
  ARCH="amd64"
fi

Tar="${APP}.${Version}.${ARCH}.tar.gz"

docker tag ${ImageName}:${Version}-${ARCH} ${ImageName}:${Version}

echo "docker save -o ${Tar} ${ImageName}:${Version}"
docker save -o ${Tar} ${ImageName}:${Version}

echo "login qiniu..."
qshell account ${AccessKey} ${SecretKey} ${QINIU_NAME}

echo "qshell rput ${QINIU_BUCKET} \"${APP}/images/${Tar}\" ${Tar}"
qshell rput ${QINIU_BUCKET} "${APP}/images/${Tar}" ${Tar}

rm -f ${Tar}
docker rmi -f ${ImageName}:${Version}