#!/bin/bash

cd "$(dirname "$0")/../"
LOCAL_PATH=$(pwd)

source ./scripts/echo.sh
source ./scripts/common.sh
OUTPUT_DIR=$(mkdir_output "$1")
APP="apipark"
OUTPUT_BIN="${OUTPUT_DIR}/${APP}"
VERSION=$(gen_version "$2")
BUILD_TYPE=$3
ARCH=$4
if [[ $ARCH == "" ]];then
  ARCH="amd64"
fi
echo ${VERSION}
set -e
version() { echo "$@" | awk -F. '{ printf("%d%03d%03d%03d\n", $1,$2,$3,$4); }'; }

env_check() {
  # 环境检查
  echo_info "Checking environment..."

  # 检查是否安装了 go
  if ! command -v go &> /dev/null; then
    echo_error "Go is not installed. Please install Go."
    return 1
  fi
  echo "Go is installed."

  # 获取Go的版本号
  go_version=$(go version | { read _ _ v _; echo ${v#go}; })

  # 检查Go版本是否大于1.21
  if [ "$(version "${go_version}")" -lt "$(version 1.20)" ]; then
    echo_error "Go version is less than 1.21. Please install Go version 1.21 or higher."
    exit 1
  fi
  echo "Go version is greater than 1.21."

  # 检查是否安装了 node
  if ! command -v node &> /dev/null; then
    echo_error "Node.js is not installed. Please install Node.js."
    exit 1
  fi
  echo "Node.js is installed."

  # 检查是否安装了npm
  if ! command -v npm &> /dev/null; then
    echo_error "Npm is not installed. Please install Npm."
    exit 1
  fi
  echo "Npm is installed."

#  # 检查是否安装了 pnpm
#  if ! command -v pnpm &> /dev/null; then
#    echo_error "Pnpm is not installed. Please install Pnpm."
#    exit 1
#  fi
#  echo "Pnpm is installed."

  # 如果所有检查都通过，打印环境检查通过的消息
  echo_info "All required tools are installed."
}

# 打包前端，使用方式：build_frontend [build_type]
build_frontend() {
  # 打包前端
  if [[ "$1" == "all" || ! -d "./frontend/dist" ]]; then
    echo_info "Install dependencies..."
    pnpm install --registry https://registry.npmmirror.com --dir ./frontend
    echo_info "Build frontend..."
    cd ./frontend && pnpm run build
    cd ..
  else
    echo_info "Need not build frontend."
  fi
  return
}

build_backend() {
  # 打包后端
  echo_info "Build backend..."
  flags="-X 'github.com/APIParkLab/APIPark/common/version.Version=${VERSION}'
  -X 'github.com/APIParkLab/APIPark/common/version.goversion=$(go version)'
  -X 'github.com/APIParkLab/APIPark/common/version.gitcommit=$(git rev-parse HEAD)'
  -X 'github.com/APIParkLab/APIPark/common/version.BuildTime=$(date -u +"%Y-%m-%dT%H:%M:%SZ")'
  -X 'github.com/APIParkLab/APIPark/common/version.builduser=$(id -u -n)'"

  Tags=""
  if [ -n "$1" ]; then
    Tags="--tags $1"
  fi

  echo "go mod tidy"
  go mod tidy

  if [ ! -d "${OUTPUT_DIR}" ];then
    mkdir -p "${OUTPUT_DIR}"
  fi
  pwd

  # -ldflags="-w -s" means omit DWARF symbol table and the symbol table and debug information
  echo "GOOS=linux GOARCH=$ARCH CGO_ENABLED=0 go build $Tags -ldflags \"-w -s $flags\" -o \"${OUTPUT_BIN}\""
  GOOS=linux GOARCH=$ARCH CGO_ENABLED=0 go build ${Tags} -ldflags "-w -s $flags" -o ${OUTPUT_BIN}
  return
}

package() {
  # 打包
  echo_info "Package..."
  PACKAGE_DIR="${OUTPUT_DIR}/${APP}_${VERSION}"
  RESOURCE_DIR=./scripts/resource

  echo "mkdir -p ${PACKAGE_DIR}"
  mkdir -p "${PACKAGE_DIR}"

  echo "cp -a ${RESOURCE_DIR}/* ${PACKAGE_DIR}"
  cp -a ${RESOURCE_DIR}/* "${PACKAGE_DIR}"

  echo "cp ${OUTPUT_BIN} ${PACKAGE_DIR}"

  cp "${OUTPUT_BIN}" "${PACKAGE_DIR}"

  echo "tar -czvf ${PACKAGE_DIR}_linux_${ARCH}.tar.gz -C ${PACKAGE_DIR}/ ./"
  tar -czvf "${PACKAGE_DIR}_linux_${ARCH}.tar.gz" -C "${PACKAGE_DIR}/" "./"
#  rm -fr "${PACKAGE_DIR}"
  echo_info "Package successfully..."
}


env_check
build_frontend "${BUILD_TYPE}"
build_backend ""
package "$1"