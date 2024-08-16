#!/bin/bash



cd "$(dirname "$0")/../"
LOCAL_PATH=$(pwd)

source ./scripts/common.sh

User=$1
App="apipark"
if [[ "${User}" == "" ]];then
  User="eolinker"
fi
BuildMode=$2
if [[ "${BuildMode}" == "" ]];then
  BuildMode="all"
fi
Version=$(gen_version)
ImageName="${User}/${App}"
echo "docker manifest rm  \"${ImageName}:${Version}\""
docker manifest rm "${ImageName}:${Version}"

set -e
./scripts/docker_build.sh amd64 ${User} "${BuildMode}"

./scripts/docker_build.sh arm64 ${User} "${BuildMode}"



echo "docker push \"${ImageName}:${Version}-amd64\""
docker push "${ImageName}:${Version}-amd64"
echo "docker push \"${ImageName}:${Version}-arm64\""
docker push "${ImageName}:${Version}-arm64"

echo "Create manifest ${ImageName}:${Version}"
docker manifest create "${ImageName}:${Version}" "${ImageName}:${Version}-amd64" "${ImageName}:${Version}-arm64"

echo "Annotate manifest ${ImageName}:${Version} ${ImageName}:${Version}-amd64 --os linux --arch amd64"
docker manifest annotate "${ImageName}:${Version}" "${ImageName}:${Version}-amd64" --os linux --arch amd64

echo "Annotate manifest ${ImageName}:${Version} ${ImageName}:${Version}-arm64 --os linux --arch arm64"
docker manifest annotate "${ImageName}:${Version}" "${ImageName}:${Version}-arm64" --os linux --arch arm64

echo "Push manifest ${ImageName}:${Version}"
docker manifest push "${ImageName}:${Version}"


